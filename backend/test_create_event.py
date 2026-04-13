#!/usr/bin/env python3
"""Test script to verify event creation API works correctly."""

import httpx
import asyncio
import sys

BASE_URL = "http://localhost:8000"

# Test event data matching what frontend sends
test_event = {
    "title": "Test Event from Script",
    "description": "This is a test event to verify the API works",
    "location": "123 Test St, Test City, CA 12345",
    "start_time": "2026-04-18T19:30:00.000Z",
    "end_time": "2026-04-18T20:00:00.000Z",
    "category": "kids_family",
    "is_public": True,
    "status": "published",
    "subtitle": "Test Subtitle",
    "summary": "Test Summary",
    "language": "en",
    "event_type": "in_person",
    "event_format": "single",
    "event_privacy": "public",
    "timezone": "America/Los_Angeles",
    "is_paid_event": True,
    "refund_policy": "no_refunds",
    "age_categories": ["all_ages"],
    "gender_preference": "all",
    "family_friendly": True,
    "wheelchair_accessible": False,
    "religious_context": ["none"],
    "skill_level": "all_levels",
    "content_rating": "all_ages",
    "networking_focus": False,
}


async def test_health():
    """Test if backend is running."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BASE_URL}/health", timeout=5)
        print(f"✓ Health check: {response.status_code}")
        return response.status_code == 200
    except Exception as e:
        print(f"✗ Health check failed: {e}")
        return False


async def test_cors_preflight():
    """Test CORS preflight for POST /api/events/."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.options(
                f"{BASE_URL}/api/events/",
                headers={
                    "Origin": "http://localhost:8080",
                    "Access-Control-Request-Method": "POST",
                    "Access-Control-Request-Headers": "Content-Type,Authorization",
                },
                timeout=5
            )
        print(f"✓ CORS preflight: {response.status_code}")
        print(f"  Access-Control-Allow-Origin: {response.headers.get('access-control-allow-origin')}")
        return response.status_code in [200, 204]
    except Exception as e:
        print(f"✗ CORS preflight failed: {e}")
        return False


async def test_create_event_without_auth():
    """Test that event creation fails without auth (401 expected)."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/events/",
                json=test_event,
                headers={"Content-Type": "application/json"},
                timeout=5
            )
        print(f"✓ Create without auth: {response.status_code} (expected 401)")
        if response.status_code != 401:
            print(f"  Response: {response.text[:200]}")
        return response.status_code == 401
    except Exception as e:
        print(f"✗ Create without auth failed: {e}")
        return False


async def main():
    print("=" * 60)
    print("Event Creation API Test")
    print("=" * 60)
    
    results = []
    
    # Test 1: Health check
    print("\n1. Testing backend health...")
    results.append(("Health Check", await test_health()))
    
    # Test 2: CORS preflight
    print("\n2. Testing CORS preflight...")
    results.append(("CORS Preflight", await test_cors_preflight()))
    
    # Test 3: Auth required
    print("\n3. Testing auth requirement...")
    results.append(("Auth Required", await test_create_event_without_auth()))
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary:")
    print("=" * 60)
    for name, passed in results:
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"  {status}: {name}")
    
    all_passed = all(r[1] for r in results)
    print("\n" + ("All tests passed!" if all_passed else "Some tests failed."))
    
    return 0 if all_passed else 1


if __name__ == "__main__":
    asyncio.run(main())
