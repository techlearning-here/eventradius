#!/usr/bin/env python3
"""
Compare test2 vs events table to debug the issue
"""

import os
import sys
from datetime import datetime, timezone
import asyncio

# Add the parent directory to the path so we can import from the backend
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from supabase import create_client, Client
    from dotenv import load_dotenv
    print("✅ Successfully imported required modules")
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)

# Load environment variables
load_dotenv()

def get_supabase_client() -> Client:
    """Initialize and return Supabase client"""
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_KEY')

    client: Client = create_client(supabase_url, supabase_key)
    return client

async def compare_table_schemas(client: Client):
    """Compare schemas between test2 and events tables"""
    print("\n🔍 COMPARING TABLE SCHEMAS")
    print("=" * 50)

    # Test test2 table
    print("📋 test2 table structure:")
    try:
        response = client.table('test2').select('*').limit(1).execute()
        if response.data:
            sample = response.data[0]
            for key, value in sample.items():
                print(f"  {key}: {type(value).__name__}")
        else:
            print("  (empty table)")
    except Exception as e:
        print(f"  ❌ Error: {e}")

    print("\n📋 events table structure:")
    try:
        response = client.table('events').select('*').limit(1).execute()
        if response.data:
            sample = response.data[0]
            for key, value in sample.items():
                print(f"  {key}: {type(value).__name__} = {value}")
        else:
            print("  (empty table)")
    except Exception as e:
        print(f"  ❌ Error: {e}")

async def test_insert_both_tables(client: Client):
    """Test insert operations on both tables"""
    print("\n🧪 TESTING INSERT OPERATIONS")
    print("=" * 50)

    # Test insert on test2
    print("📝 Inserting into test2 table:")
    test2_data = {
        'name': f'Comparison Test {datetime.now().strftime("%H:%M:%S")}',
        'description': 'Test record for comparison'
    }

    try:
        response = client.table('test2').insert(test2_data).execute()
        if response.data:
            print(f"  ✅ test2 INSERT SUCCESS: {response.data[0]['id']}")
        else:
            print(f"  ❌ test2 INSERT FAILED: No data returned")
    except Exception as e:
        print(f"  ❌ test2 INSERT ERROR: {e}")

    # Test insert on events
    print("\n📝 Inserting into events table:")
    events_data = {
        'title': 'Test Event for Comparison',
        'creator': 'debug_script',
        'description': 'Test event for debugging comparison',
        'date': '2026-04-15',
        'time': '14:00',
        'address': '123 Test Street',
        'background_image_url': 'https://example.com/bg.jpg',
        'target_date': datetime.now(timezone.utc).isoformat(),
        'category': 'community',
        'kid_friendly': False,
        'price': 0,
        'tags': ['test'],
        'status': 'pending',
        'event_type': 'standard',
        'event_status': 'confirmed',
        'is_public': True
    }

    try:
        response = client.table('events').insert(events_data).execute()
        if response.data:
            print(f"  ✅ events INSERT SUCCESS: {response.data[0]['id']}")
        else:
            print(f"  ❌ events INSERT FAILED: No data returned")
    except Exception as e:
        print(f"  ❌ events INSERT ERROR: {e}")

async def analyze_rls_policies(client: Client):
    """Analyze RLS policies differences"""
    print("\n🔐 ANALYZING RLS POLICIES")
    print("=" * 50)

    # Check authentication status
    try:
        auth_response = client.auth.get_user()
        if auth_response.user:
            print(f"👤 Authenticated as: {auth_response.user.id}")
        else:
            print("👤 Not authenticated (using anon key)")
    except Exception as e:
        print(f"👤 Auth check failed: {e}")

    # Test read operations
    print("\n📖 Testing READ operations:")

    try:
        response = client.table('test2').select('*').execute()
        print(f"  test2 READ: ✅ {len(response.data) if response.data else 0} records")
    except Exception as e:
        print(f"  test2 READ: ❌ {e}")

    try:
        response = client.table('events').select('*').execute()
        print(f"  events READ: ✅ {len(response.data) if response.data else 0} records")
    except Exception as e:
        print(f"  events READ: ❌ {e}")

async def main():
    """Main comparison function"""
    print("🔬 TABLE COMPARISON: test2 vs events")
    print("=" * 50)

    client = get_supabase_client()

    await compare_table_schemas(client)
    await analyze_rls_policies(client)
    await test_insert_both_tables(client)

    print("\n" + "=" * 50)
    print("🎯 COMPARISON SUMMARY")
    print("=" * 50)
    print("✅ Comparison completed")
    print("📋 Key differences should be visible above")

if __name__ == "__main__":
    asyncio.run(main())
