#!/usr/bin/env python3
"""
Test script for Nominatim City Autocomplete (OpenStreetMap - Free)

This tests the city autocomplete endpoint that uses Nominatim (OpenStreetMap).

Usage:
    cd backend
    python scripts/test_photon_autocomplete.py

Tests:
    1. Direct Photon API calls
    2. Backend endpoint via HTTP
    3. Multiple city queries
"""

import asyncio
import sys
import os

# Add parent to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.nominatim_geocoding import nominatim_service


async def test_nominatim_direct():
    """Test direct Nominatim API calls"""
    print("\n=== Test 1: Direct Nominatim API ===\n")
    
    test_queries = [
        "San Fra",      # Partial - should match San Francisco
        "New Yo",       # Partial - should match New York
        "London",       # Full name
        "Paris",        # Full name
        "Tok",          # Partial - Tokyo
        "Sydney",       # Full name
        "Mumbai",       # Indian city
        "invalidxyz123" # Should return empty
    ]
    
    for query in test_queries:
        print(f"Query: '{query}'")
        try:
            results = await nominatim_service.autocomplete_cities(query, limit=3)
            if results:
                for r in results:
                    print(f"  → {r['full_name']} ({r['lat']:.2f}, {r['lng']:.2f})")
            else:
                print(f"  → No results")
        except Exception as e:
            print(f"  ✗ Error: {e}")
        print()


async def test_backend_endpoint():
    """Test the backend API endpoint"""
    print("\n=== Test 2: Backend API Endpoint ===\n")
    
    import httpx
    
    base_url = "http://localhost:8000"
    
    test_cases = [
        ("Bos", 3),       # Should match Boston
        ("Los Ang", 5),   # Should match Los Angeles
        ("a", 5),         # Too short - should return empty
        ("", 5),          # Empty - should return empty
    ]
    
    async with httpx.AsyncClient() as client:
        for query, limit in test_cases:
            print(f"GET /api/users/autocomplete/cities?query={query}&limit={limit}")
            try:
                response = await client.get(
                    f"{base_url}/api/users/autocomplete/cities",
                    params={"query": query, "limit": limit},
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"  ✓ Status: {response.status_code}")
                    print(f"  → Found: {data['count']} cities")
                    for city in data['cities'][:3]:
                        print(f"    - {city['full_name']}")
                else:
                    print(f"  ✗ Status: {response.status_code}")
                    print(f"  → {response.text}")
                    
            except Exception as e:
                print(f"  ✗ Error: {e}")
                print(f"     Is backend running on {base_url}?")
            print()


def print_manual_test_instructions():
    """Print manual testing instructions"""
    print("\n" + "="*60)
    print("MANUAL TESTING INSTRUCTIONS")
    print("="*60)
    
    print("\n1. Start Backend:")
    print("   cd backend")
    print("   python main.py")
    
    print("\n2. Test Autocomplete API:")
    print("   curl 'http://localhost:8000/api/users/autocomplete/cities?query=San%20Fra&limit=3'")
    print("   Expected: JSON with San Francisco, San Francisco de Campeche, etc.")
    
    print("\n3. Test with Browser:")
    print("   - Open http://localhost:5173/onboarding")
    print("   - Go to Step 3 (Location)")
    print("   - Type 'San Fra' in city field")
    print("   - Should see autocomplete dropdown with 'Search Results' section")
    print("   - Select 'San Francisco, California, United States'")
    print("   - Complete onboarding")
    
    print("\n4. Verify in Database:")
    print("   SELECT city, latitude, longitude FROM public.user_preferences")
    print("   WHERE city LIKE '%San Francisco%';")
    print("   Expected: latitude ~37.77, longitude ~-122.42")
    
    print("\n5. Test International City:")
    print("   - Type 'Paris' or 'London'")
    print("   - Should find international cities via Nominatim")
    
    print("\n" + "-"*60)
    print("FEATURES:")
    print("-"*60)
    print("✓ Free - no API key required")
    print("✓ Worldwide city coverage (OpenStreetMap)")
    print("✓ Rate limited (1 req/sec - Nominatim policy)")
    print("✓ Combines hardcoded + Nominatim results")
    print("✓ Graceful fallback on errors")
    print()


async def main():
    print("="*60)
    print("NOMINATIM CITY AUTOCOMPLETE TEST")
    print("="*60)
    print("OpenStreetMap - free, no API key needed!\n")
    
    try:
        # Test 1: Direct API
        await test_nominatim_direct()
        
        # Test 2: Backend endpoint
        await test_backend_endpoint()
        
        # Print instructions
        print_manual_test_instructions()
        
    except Exception as e:
        print(f"\n✗ Test suite failed: {e}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        # Cleanup
        await nominatim_service.close()
    
    return 0


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
