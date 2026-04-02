#!/usr/bin/env python3
"""
Check what tables exist in the Supabase project
"""

import os
import sys
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

async def check_existing_tables(client: Client):
    """Check what tables exist in the database"""
    print("\n🔍 CHECKING EXISTING TABLES")
    print("=" * 50)
    
    # Common table names to check
    tables_to_check = [
        'events',
        'test2', 
        'users',
        'auth.users',
        'profiles',
        'event_registrations',
        'user_preferences',
        'event_participants',
        'storage.buckets',
        'storage.objects'
    ]
    
    for table in tables_to_check:
        try:
            response = client.table(table).select('count').execute()
            count = response.data[0]['count'] if response.data else 0
            print(f"✅ {table}: {count} records")
        except Exception as e:
            if "Could not find the table" in str(e):
                print(f"❌ {table}: Table does not exist")
            else:
                print(f"⚠️  {table}: Error - {e}")

async def main():
    """Main function"""
    print("📋 SUPABASE TABLE INVENTORY")
    print("=" * 50)
    
    client = get_supabase_client()
    
    await check_existing_tables(client)
    
    print("\n" + "=" * 50)
    print("🎯 NEXT STEPS")
    print("=" * 50)
    print("If events table is missing, you need to:")
    print("1. Go to Supabase Dashboard → SQL Editor")
    print("2. Run the combined_migration.sql file")
    print("3. Or create the events table manually")

if __name__ == "__main__":
    asyncio.run(main())
