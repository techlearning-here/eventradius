"""
Debug script to test the getEvents API endpoint and identify 500 errors.
Run this script to debug the API issues.
"""

import os
import sys
import logging
from dotenv import load_dotenv

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_database_connection():
    """Test database connection and table existence"""
    try:
        from config.database import SupabaseClient

        print("🔍 Testing Supabase connection...")
        client = SupabaseClient.get_client()

        # Test basic connection
        print("✅ Supabase client created successfully")

        # Test if events table exists
        print("🔍 Testing events table access...")
        try:
            result = client.table("events").select("*").limit(1).execute()
            print(f"✅ Events table accessible. Data: {result.data}")
            return True
        except Exception as e:
            print(f"❌ Error accessing events table: {e}")
            return False

    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_environment_variables():
    """Test if required environment variables are set"""
    print("🔍 Testing environment variables...")

    required_vars = [
        'SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY',
        'BACKEND_HOST',
        'BACKEND_PORT'
    ]

    missing_vars = []
    for var in required_vars:
        value = os.getenv(var)
        if not value:
            missing_vars.append(var)
            print(f"❌ {var} is not set")
        else:
            print(f"✅ {var} is set (length: {len(value)})")

    if missing_vars:
        print(f"❌ Missing environment variables: {missing_vars}")
        return False
    else:
        print("✅ All required environment variables are set")
        return True

def test_api_directly():
    """Test the API endpoint directly"""
    try:
        print("🔍 Testing API endpoint directly...")

        # Import the API function
        from api.events import get_events
        from fastapi.testclient import TestClient
        from main import app

        client = TestClient(app)
        response = client.get("/api/events/")

        print(f"📊 API Response Status: {response.status_code}")
        print(f"📊 API Response Headers: {response.headers}")
        print(f"📊 API Response Body: {response.text[:500]}...")

        if response.status_code == 200:
            print("✅ API endpoint working correctly")
            return True
        else:
            print(f"❌ API endpoint returned error: {response.status_code}")
            return False

    except Exception as e:
        print(f"❌ Error testing API directly: {e}")
        return False

def test_fetch_records_function():
    """Test the fetch_records function directly"""
    try:
        print("🔍 Testing fetch_records function...")

        from config.database import fetch_records

        result = fetch_records("events", {}, 10, 0)
        print(f"✅ fetch_records result: {result}")
        print(f"📊 Data count: {len(result.data) if result.data else 0}")

        return True

    except Exception as e:
        print(f"❌ Error in fetch_records: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main debug function"""
    print("🚀 Starting API Debug Script")
    print("=" * 50)

    # Test environment variables
    env_ok = test_environment_variables()
    print()

    # Test database connection
    db_ok = test_database_connection()
    print()

    # Test fetch_records function
    fetch_ok = test_fetch_records_function()
    print()

    # Test API directly (if possible)
    api_ok = test_api_directly()
    print()

    # Summary
    print("=" * 50)
    print("📋 DEBUG SUMMARY:")
    print(f"Environment Variables: {'✅' if env_ok else '❌'}")
    print(f"Database Connection: {'✅' if db_ok else '❌'}")
    print(f"Fetch Records Function: {'✅' if fetch_ok else '❌'}")
    print(f"API Endpoint: {'✅' if api_ok else '❌'}")

    if all([env_ok, db_ok, fetch_ok, api_ok]):
        print("🎉 All tests passed! API should be working.")
    else:
        print("⚠️  Some tests failed. Check the errors above.")

if __name__ == "__main__":
    main()
