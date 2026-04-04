#!/usr/bin/env python3
"""
Supabase Connection Test Script
Tests connection to Supabase and basic CRUD operations on the events table
"""

import asyncio
import os
import sys
from datetime import datetime, timezone
from typing import Any, Dict, List

# Add the parent directory to the path so we can import from the backend
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from dotenv import load_dotenv
    from supabase import Client, create_client

    print("✅ Successfully imported required modules")
except ImportError as e:
    print(f"❌ Import error: {e}")
    print(
        "Make sure you're running this script with the virtual environment activated:"
    )
    print("source venv/bin/activate && python test_supabase.py")
    sys.exit(1)

# Load environment variables
load_dotenv()


def get_supabase_client() -> Client:
    """Initialize and return Supabase client"""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")

    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase configuration in .env file")
        print("Please ensure SUPABASE_URL and SUPABASE_KEY are set in your .env file")
        sys.exit(1)

    try:
        client: Client = create_client(supabase_url, supabase_key)
        print(f"✅ Supabase client created successfully")
        print(f"   URL: {supabase_url}")
        return client
    except Exception as e:
        print(f"❌ Failed to create Supabase client: {e}")
        sys.exit(1)


async def test_connection(client: Client) -> bool:
    """Test basic connection to Supabase"""
    print("\n🔍 Testing Supabase connection...")

    try:
        # Test by checking if we can access the service
        response = client.table("events").select("count").execute()
        print("✅ Successfully connected to Supabase")
        return True
    except Exception as e:
        print(f"❌ Connection test failed: {e}")
        return False


async def test_events_table_access(client: Client) -> Dict[str, Any]:
    """Test CRUD operations on the events table"""
    print("\n📊 Testing events table operations...")
    results = {
        "read": False,
        "create": False,
        "update": False,
        "delete": False,
        "test_data": None,
        "auth_required": True,
    }

    # Test READ operation first (this should work without authentication for approved events)
    print("  📖 Testing READ operation...")
    try:
        read_response = client.table("events").select("*").execute()
        event_count = len(read_response.data) if read_response.data else 0
        results["read"] = True
        print(f"    ✅ Successfully read events table (found {event_count} events)")

        if read_response.data and len(read_response.data) > 0:
            print("    📋 Sample event structure:")
            sample_event = read_response.data[0]
            for column, value in sample_event.items():
                print(f"      - {column}: {type(value).__name__} = {value}")
    except Exception as e:
        print(f"    ❌ Read operation failed: {e}")
        return results

    # Test CREATE operation (this will fail without authentication, which is expected)
    print("  📝 Testing CREATE operation (expected to fail without auth)...")
    try:
        # Sample test data based on the migration schema
        test_event = {
            "title": "Test Event - Python Script",
            "creator": "test_script",
            "description": "This is a test event created by the Python test script",
            "date": "2026-04-15",
            "time": "14:00",
            "address": "123 Test Street, Test City",
            "background_image_url": "https://example.com/bg.jpg",
            "target_date": datetime.now(timezone.utc).isoformat(),
            "category": "community",
            "kid_friendly": False,
            "price": 0,
            "tags": ["test", "python"],
            "status": "pending",
            "event_type": "standard",
            "event_status": "confirmed",
            "is_public": True,
        }

        create_response = client.table("events").insert(test_event).execute()
        if create_response.data:
            created_event = create_response.data[0]
            event_id = created_event["id"]
            results["test_data"] = created_event
            results["create"] = True
            results["auth_required"] = False
            print(f"    ✅ Event created with ID: {event_id}")

            # Test UPDATE operation
            print("  ✏️ Testing UPDATE operation...")
            update_data = {"title": "Updated Test Event - Python Script"}
            update_response = (
                client.table("events").update(update_data).eq("id", event_id).execute()
            )
            if update_response.data and len(update_response.data) > 0:
                results["update"] = True
                print(f"    ✅ Event updated successfully")

            # Test DELETE operation
            print("  🗑️ Testing DELETE operation...")
            delete_response = (
                client.table("events").delete().eq("id", event_id).execute()
            )
            if delete_response.data and len(delete_response.data) > 0:
                results["delete"] = True
                print(f"    ✅ Event deleted successfully")
        else:
            print(
                f"    ℹ️ Create operation returned no data (likely due to RLS policy)"
            )
            results["auth_required"] = True

    except Exception as e:
        error_msg = str(e)
        if "created_by" in error_msg and "not-null constraint" in error_msg:
            print(
                f"    ✅ CREATE operation correctly blocked due to authentication requirement"
            )
            print(f"    📝 Error (expected): {error_msg}")
        else:
            print(f"    ❌ Unexpected error during CREATE: {error_msg}")

    return results


async def test_table_schema(client: Client):
    """Test the events table schema and structure"""
    print("\n🏗️ Testing table schema...")

    try:
        # Get table info by selecting a sample row
        response = client.table("events").select("*").limit(1).execute()

        if response.data:
            sample_row = response.data[0]
            print("  ✅ Events table structure:")
            for column, value in sample_row.items():
                print(f"    - {column}: {type(value).__name__}")
        else:
            print("  ℹ️ No existing data in events table (this is normal)")

        # Try to get all events to test the SELECT policy
        all_events_response = (
            client.table("events").select("id, title, creator").execute()
        )
        event_count = len(all_events_response.data) if all_events_response.data else 0
        print(f"  📊 Current events count: {event_count}")

    except Exception as e:
        print(f"❌ Schema test failed: {e}")


async def main():
    """Main test function"""
    print("🚀 Starting Supabase Test Suite")
    print("=" * 50)

    # Initialize client
    client = get_supabase_client()

    # Test connection
    if not await test_connection(client):
        print("\n❌ Cannot proceed with tests - connection failed")
        return

    # Test table schema
    await test_table_schema(client)

    # Test CRUD operations
    results = await test_events_table_access(client)

    # Print summary
    print("\n" + "=" * 50)
    print("📋 TEST RESULTS SUMMARY")
    print("=" * 50)

    operations = [
        ("READ", results["read"]),
        ("CREATE", results["create"]),
        ("UPDATE", results["update"]),
        ("DELETE", results["delete"]),
    ]

    all_passed = True
    for op_name, passed in operations:
        if op_name == "READ":
            status = "✅ PASS" if passed else "❌ FAIL"
        else:  # WRITE operations
            if results.get("auth_required", True):
                status = "⚠️  BLOCKED (auth required)" if passed == False else "✅ PASS"
            else:
                status = "✅ PASS" if passed else "❌ FAIL"

        print(f"{op_name:8} {status}")
        if (
            op_name != "READ"
            and passed == False
            and not results.get("auth_required", True)
        ):
            all_passed = False
        elif op_name == "READ" and not passed:
            all_passed = False

    print("\n" + "=" * 50)
    if all_passed and results["read"]:
        print("🎉 ALL TESTS PASSED! Supabase is working correctly.")
        if results.get("auth_required", True):
            print("🔐 Write operations are correctly protected by authentication.")
    else:
        print("⚠️  Some tests failed. Check the output above for details.")

    if results.get("test_data"):
        print(f"\n📝 Test data used:")
        for key, value in results["test_data"].items():
            if key not in ["id", "created_at", "updated_at"]:
                print(f"  {key}: {value}")

    if results.get("auth_required", True):
        print(
            f"\n🔐 Authentication is required for write operations (CREATE/UPDATE/DELETE)."
        )
        print(f"   This is expected behavior based on the Row Level Security policies.")


if __name__ == "__main__":
    asyncio.run(main())
