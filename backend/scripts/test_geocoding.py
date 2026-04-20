"""
Test script for Mapbox Geocoding API.

Usage with uv (recommended):
    cd backend
    uv run --with httpx --with python-dotenv scripts/test_geocoding.py

Or install dependencies first:
    uv add httpx python-dotenv
    uv run scripts/test_geocoding.py

This script tests:
1. Loading MAPBOX_API_KEY from .env
2. Geocoding a sample address
3. Displaying the results
"""

import asyncio
import os
import sys
from pathlib import Path

# Add parent directory to path to import from backend
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from dotenv import load_dotenv

# Load environment variables from .env
env_path = backend_dir / ".env"
if env_path.exists():
    load_dotenv(env_path)
    print(f"✓ Loaded .env from {env_path}")
else:
    print(f"✗ .env file not found at {env_path}")
    print("  Creating from .env.example...")
    sys.exit(1)

import httpx


async def test_mapbox_geocoding():
    """Test Mapbox geocoding API with a sample address."""
    
    api_key = os.getenv("MAPBOX_API_KEY")
    
    if not api_key:
        print("\n✗ MAPBOX_API_KEY not found in environment")
        print("  Please add it to your .env file:")
        print("  MAPBOX_API_KEY=sk.your_secret_token_here")
        return False
    
    # Show token prefix (safely)
    prefix = api_key[:10] if len(api_key) > 10 else api_key[:5]
    print(f"\n✓ MAPBOX_API_KEY found: {prefix}...")
    print(f"  Token type: {'Secret (sk.)' if api_key.startswith('sk.') else 'Public (pk.)' if api_key.startswith('pk.') else 'Unknown'}")
    
    # Test addresses
    test_addresses = [
        {
            "name": "Golden Gate Bridge",
            "street": "Golden Gate Bridge",
            "city": "San Francisco",
            "state": "CA",
            "zip": "94129"
        },
        {
            "name": "Times Square",
            "street": "Times Square",
            "city": "New York",
            "state": "NY",
            "zip": "10036"
        }
    ]
    
    base_url = "https://api.mapbox.com/geocoding/v5/mapbox.places"
    
    print(f"\n{'='*60}")
    print("TESTING MAPBOX GEOCODING API")
    print(f"{'='*60}")
    
    async with httpx.AsyncClient() as client:
        for address in test_addresses:
            # Construct query
            query_parts = [p for p in [address["street"], address["city"], address["state"], address["zip"]] if p]
            query = ", ".join(query_parts)
            
            print(f"\n📍 Testing: {address['name']}")
            print(f"   Query: {query}")
            
            try:
                response = await client.get(
                    f"{base_url}/{query}.json",
                    params={
                        "access_token": api_key,
                        "limit": 1,
                        "types": "address,poi,place",
                    },
                    timeout=10.0
                )
                
                print(f"   Status: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    
                    if data.get("features"):
                        feature = data["features"][0]
                        coords = feature["center"]  # [longitude, latitude]
                        place_name = feature.get("place_name", "N/A")
                        accuracy = feature.get("accuracy", "unknown")
                        
                        print(f"   ✓ SUCCESS")
                        print(f"     Coordinates: {coords[1]}, {coords[0]}")
                        print(f"     Address: {place_name[:60]}...")
                        print(f"     Accuracy: {accuracy}")
                    else:
                        print(f"   ⚠ No results found")
                        
                elif response.status_code == 401:
                    print(f"   ✗ AUTHENTICATION FAILED")
                    print(f"     Your token is invalid or expired")
                    print(f"     Create a new token at: https://account.mapbox.com/access-tokens/")
                    return False
                    
                elif response.status_code == 403:
                    print(f"   ✗ FORBIDDEN")
                    print(f"     Token may not have geocoding access or URL restriction mismatch")
                    return False
                    
                else:
                    print(f"   ✗ ERROR: {response.status_code}")
                    print(f"     {response.text[:200]}")
                    
            except httpx.TimeoutException:
                print(f"   ✗ TIMEOUT: Request took too long")
            except Exception as e:
                print(f"   ✗ EXCEPTION: {e}")
    
    print(f"\n{'='*60}")
    print("TEST COMPLETE")
    print(f"{'='*60}")
    return True


if __name__ == "__main__":
    result = asyncio.run(test_mapbox_geocoding())
    sys.exit(0 if result else 1)
