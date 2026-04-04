#!/usr/bin/env python3
"""
Debug Test Script for test2 table
Simple table to debug Supabase RLS and authentication issues
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
    print("source venv/bin/activate && python debug_test2.py")
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


async def test_basic_connection(client: Client):
    """Test basic connection without any table operations"""
    print("\n🔍 Testing basic Supabase connection...")

    try:
        # Test by checking if we can access the schema
        response = client.table("test2").select("count").execute()
        print("✅ Successfully accessed test2 table schema")
        return True
    except Exception as e:
        print(f"❌ Failed to access test2 table: {e}")
        return False


async def test_table_exists(client: Client):
    """Check if test2 table exists and is accessible"""
    print("\n🏗️ Testing if test2 table exists...")

    try:
        # Try to select from the table
        response = client.table("test2").select("*").limit(1).execute()
        print("✅ test2 table exists and is accessible")

        if response.data:
            print(f"   Found {len(response.data)} existing records")
            if response.data:
                print("   Sample record:")
                for key, value in response.data[0].items():
                    print(f"     {key}: {value}")
        else:
            print("   No existing records (table is empty)")

        return True
    except Exception as e:
        print(f"❌ test2 table access failed: {e}")
        return False


async def test_simple_insert(client: Client):
    """Test a simple insert operation"""
    print("\n📝 Testing simple INSERT operation...")

    test_data = {
        "name": f'Test Record {datetime.now().strftime("%H:%M:%S")}',
        "description": "This is a test record for debugging",
    }

    try:
        print(f"   Attempting to insert: {test_data}")
        response = client.table("test2").insert(test_data).execute()

        if response.data:
            inserted_record = response.data[0]
            print(
                f"   ✅ Successfully inserted record with ID: {inserted_record.get('id')}"
            )
            print(f"   📋 Inserted record: {inserted_record}")
            return inserted_record
        else:
            print(f"   ❌ Insert returned no data: {response}")
            return None

    except Exception as e:
        print(f"   ❌ Insert failed: {e}")
        return None


async def test_read_operation(client: Client, record_id=None):
    """Test read operation"""
    print("\n📖 Testing READ operation...")

    try:
        if record_id:
            # Read specific record
            response = client.table("test2").select("*").eq("id", record_id).execute()
            print(f"   Reading record with ID: {record_id}")
        else:
            # Read all records
            response = client.table("test2").select("*").execute()
            print("   Reading all records")

        if response.data:
            print(f"   ✅ Successfully read {len(response.data)} record(s)")
            for i, record in enumerate(response.data):
                print(f"     Record {i+1}: {record}")
            return response.data
        else:
            print("   ℹ️ No records found")
            return []

    except Exception as e:
        print(f"   ❌ Read failed: {e}")
        return None


async def test_update_operation(client: Client, record_id):
    """Test update operation"""
    print("\n✏️ Testing UPDATE operation...")

    update_data = {
        "name": f'Updated Test Record {datetime.now().strftime("%H:%M:%S")}',
        "description": "This record has been updated",
    }

    try:
        print(f"   Updating record {record_id} with: {update_data}")
        response = (
            client.table("test2").update(update_data).eq("id", record_id).execute()
        )

        if response.data:
            updated_record = response.data[0]
            print(f"   ✅ Successfully updated record: {updated_record}")
            return updated_record
        else:
            print(f"   ❌ Update returned no data: {response}")
            return None

    except Exception as e:
        print(f"   ❌ Update failed: {e}")
        return None


async def test_delete_operation(client: Client, record_id):
    """Test delete operation"""
    print("\n🗑️ Testing DELETE operation...")

    try:
        print(f"   Deleting record with ID: {record_id}")
        response = client.table("test2").delete().eq("id", record_id).execute()

        if response.data:
            deleted_record = response.data[0]
            print(f"   ✅ Successfully deleted record: {deleted_record}")
            return deleted_record
        else:
            print(f"   ❌ Delete returned no data: {response}")
            return None

    except Exception as e:
        print(f"   ❌ Delete failed: {e}")
        return None


async def main():
    """Main debug function"""
    print("🐛 DEBUG: test2 Table Analysis")
    print("=" * 50)

    # Initialize client
    client = get_supabase_client()

    # Test basic connection
    if not await test_basic_connection(client):
        print("\n❌ Cannot proceed - basic connection failed")
        return

    # Test if table exists
    if not await test_table_exists(client):
        print("\n❌ test2 table doesn't exist or isn't accessible")
        print("   Please run the migration: create_test2_table.sql")
        return

    # Test CRUD operations
    print("\n🔄 Testing CRUD operations sequence...")

    # INSERT
    inserted_record = await test_simple_insert(client)
    if not inserted_record:
        print("\n❌ INSERT failed - cannot proceed with further tests")
        return

    record_id = inserted_record["id"]

    # READ
    await test_read_operation(client, record_id)

    # UPDATE
    updated_record = await test_update_operation(client, record_id)

    # READ again to verify update
    if updated_record:
        await test_read_operation(client, record_id)

    # DELETE
    await test_delete_operation(client, record_id)

    # Final read to confirm deletion
    await test_read_operation(client)

    print("\n" + "=" * 50)
    print("🎯 DEBUG SUMMARY")
    print("=" * 50)
    print("✅ test2 table debugging completed")
    print("📋 Check the output above to identify any issues")


if __name__ == "__main__":
    asyncio.run(main())
