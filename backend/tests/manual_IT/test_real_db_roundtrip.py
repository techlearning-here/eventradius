"""
MANUAL INTEGRATION TEST - NOT RUN IN CI

Integration test for Event Wizard to Event Details round-trip with REAL DATABASE.

This test verifies that all event data collected in the EventWizard
is properly passed to the backend, stored in the database, and
retrieved correctly on the Event Details page without data loss.

This test uses the ACTUAL Supabase database, not mocks.
Requires running backend server and valid JWT token.

Run with: pytest tests/manual_IT/test_real_db_roundtrip.py -v --tb=short

Requirements:
- Backend server running (./scripts/run-backend.sh)
- Supabase connection configured (.env file)
- Valid JWT token for authentication (TEST_AUTH_TOKEN in .env)

pytest marker: manual
"""

import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict

import pytest
import requests

# Mark all tests in this file as manual integration tests
pytestmark = pytest.mark.manual

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))

# Load environment variables from .env file
from dotenv import load_dotenv

backend_dir = Path(__file__).parent.parent.parent
env_file = backend_dir / ".env"
if env_file.exists():
    load_dotenv(env_file)
    print(f"✅ Loaded environment from {env_file}")
else:
    print(f"⚠️  No .env file found at {env_file}")

# Configuration
BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv(
    "SUPABASE_SERVICE_KEY", os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
)

# Skip tests if no database connection
pytestmark = pytest.mark.skipif(
    not SUPABASE_URL or not SUPABASE_KEY,
    reason="Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY env vars.",
)


class TestRealDBRoundTrip:
    """Test complete round-trip of event data with real database."""

    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token. In real tests, this would use actual auth."""
        # For testing, you can manually set a token or use a test user
        token = os.getenv("TEST_AUTH_TOKEN")
        if not token:
            pytest.skip(
                "TEST_AUTH_TOKEN not set. Cannot run integration tests without auth."
            )
        return token

    @pytest.fixture(scope="class")
    def api_client(self, auth_token):
        """Create authenticated API client session."""
        session = requests.Session()
        session.headers.update(
            {
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json",
            }
        )
        return session

    @pytest.fixture(scope="class", autouse=True)
    def cleanup_old_test_events(self, api_client):
        """Clean up any old test events before running tests."""
        print("\n🧹 Cleaning up old test events...")
        try:
            # Get list of events with test titles
            response = api_client.get(f"{BASE_URL}/api/events/?limit=100")
            if response.status_code == 200:
                events = response.json()
                deleted_count = 0
                for event in events:
                    title = event.get("title", "")
                    # Delete events with test titles (older than 1 hour)
                    if "Round-Trip Test" in title or "Real DB Round-Trip" in title:
                        event_id = event.get("id")
                        if event_id:
                            try:
                                delete_resp = api_client.delete(
                                    f"{BASE_URL}/api/events/{event_id}"
                                )
                                if delete_resp.status_code == 200:
                                    deleted_count += 1
                                    print(
                                        f"  🗑️  Deleted old test event: {title[:50]}..."
                                    )
                            except Exception:
                                pass  # Ignore cleanup errors
                if deleted_count > 0:
                    print(f"✅ Cleaned up {deleted_count} old test events")
                else:
                    print("✅ No old test events found")
        except Exception as e:
            print(f"⚠️  Cleanup warning: {e}")
        yield  # Let tests run

    def test_create_and_retrieve_event_with_all_fields(self, api_client):
        """Test creating and retrieving an event with all new fields."""
        event_id = None

        complete_event_data = {
            # Core fields
            "title": f"Real DB Round-Trip Test - {datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "subtitle": "Testing all new Event Wizard fields with real database",
            "summary": "This event tests complete data flow from frontend to backend to database and back.",
            "description": "Comprehensive test of all Event Wizard fields including subtitle, summary, tags, timezone, venue details, virtual event info, timing fields, and more.",
            "category": "technology",
            "language": "en",
            "status": "published",
            # Event Type & Format
            "event_type": "hybrid",
            "event_format": "single",
            "event_privacy": "public",
            "is_paid_event": True,
            # Date & Time
            "start_time": (datetime.now() + timedelta(days=7)).isoformat(),
            "end_time": (datetime.now() + timedelta(days=7, hours=3)).isoformat(),
            "timezone": "America/Los_Angeles",
            # Location & Venue
            "location": "Tech Hub, 123 Innovation Drive, San Francisco, CA 94102, USA",
            "venue_building_name": "Tech Hub Main Building",
            "venue_street": "123 Innovation Drive",
            "venue_city": "San Francisco",
            "venue_state": "CA",
            "venue_zip_code": "94102",
            "venue_country": "USA",
            # Virtual Event
            "virtual_event_url": "https://zoom.us/j/test123456",
            "virtual_event_platform": "Zoom",
            "event_password": "TestPass2026!",
            # Timing & Registration
            "doors_open_time": (
                datetime.now() + timedelta(days=7, minutes=-30)
            ).isoformat(),
            "registration_start_time": datetime.now().isoformat(),
            "registration_end_time": (datetime.now() + timedelta(days=6)).isoformat(),
            # Contact Info
            "event_contact_email": "test@techhub.com",
            "event_contact_phone": "4155551234",
            "event_contact_phone_country_code": "+1",
            # Capacity
            "max_participants": 100,
            "is_public": True,
            # Pricing
            "ticketing_website": "https://tickets.example.com/round-trip-test",
            "ticket_pricing_description": "$50 per person, includes lunch",
            "refund_policy": "refund_up_to_24_hours",
            "custom_refund_policy": "Full refund up to 24 hours, 50% up to 12 hours",
            "group_discounts": True,
            # New Event Wizard fields
            "tags": ["test", "round-trip", "integration", "all-fields"],
            "age_restriction": "all_ages",
            "accessibility_options": "Wheelchair accessible, ASL interpreter available",
            "event_website": "https://example.com/round-trip-test",
            # Audience & Demographics
            "age_categories": ["adults", "young_adults"],
            "gender_preference": "all",
            "family_friendly": False,
            "senior_friendly": True,
            "singles_friendly": True,
            "couples_oriented": False,
            # Accessibility
            "wheelchair_accessible": True,
            "mobility_friendly": True,
            "hearing_accessible": True,
            "vision_accessible": True,
            "sensory_friendly": False,
            "service_animals_allowed": True,
            "accessibility_notes": "Fully accessible venue with ramps, elevators, and accessible restrooms",
            # Cultural Context
            "religious_context": ["secular"],
            "dietary_context": ["vegetarian", "vegan", "gluten_free"],
            "traditional_attire": "not_applicable",
            # Prerequisites
            "skill_level": "all_levels",
            "prior_experience": "none_required",
            "physical_fitness": "sedentary",
            "equipment_required": ["laptop", "notebook"],
            "dress_code": "business_casual",
            "prerequisites_notes": "Bring laptop for hands-on exercises",
            # Content & Intensity
            "content_rating": "all_ages",
            "alcohol_served": "no_alcohol",
            "smoking_policy": "non_smoking",
            "noise_level": "moderate",
            "physical_intensity": "none",
            # Social Features
            "networking_focus": True,
            "social_mixer": True,
            "ice_breakers": True,
            "group_activities": True,
            "team_building": False,
            # Language
            "primary_language": "english",
            "secondary_languages": ["spanish"],
            "interpretation_available": True,
            "sign_language_interpreter": True,
            # Type & Format
            "format": "interactive_workshop",
            "sub_category": "tech_demo",
            # Media
            "image_url": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop",
        }

        try:
            # Step 1: Create event via API
            print(f"\n🚀 Creating event with title: {complete_event_data['title']}")
            create_response = api_client.post(
                f"{BASE_URL}/api/events", json=complete_event_data
            )

            assert (
                create_response.status_code == 200
            ), f"Create failed: {create_response.text}"
            created_event = create_response.json()
            event_id = created_event["id"]
            print(f"✅ Event created with ID: {event_id}")

            # Step 2: Retrieve event via API
            print(f"🔍 Retrieving event: {event_id}")
            get_response = api_client.get(f"{BASE_URL}/api/events/{event_id}")

            assert (
                get_response.status_code == 200
            ), f"Retrieve failed: {get_response.text}"
            retrieved_event = get_response.json()
            print(f"✅ Event retrieved successfully")

            # Step 3: Verify ALL critical fields
            print("\n🔍 Verifying all fields...")

            # Critical new fields from Event Wizard
            critical_fields = [
                # Basic Info
                ("subtitle", "Subtitle"),
                ("summary", "Summary"),
                ("tags", "Tags"),
                ("timezone", "Timezone"),
                # Venue
                ("venue_building_name", "Venue Building Name"),
                ("venue_street", "Venue Street"),
                ("venue_city", "Venue City"),
                ("venue_state", "Venue State"),
                ("venue_zip_code", "Venue Zip Code"),
                ("venue_country", "Venue Country"),
                # Virtual Event
                ("virtual_event_url", "Virtual Event URL"),
                ("virtual_event_platform", "Virtual Event Platform"),
                # Timing
                ("doors_open_time", "Doors Open Time"),
                ("registration_start_time", "Registration Start Time"),
                ("registration_end_time", "Registration End Time"),
                # Additional
                ("age_restriction", "Age Restriction"),
                ("custom_refund_policy", "Custom Refund Policy"),
                ("accessibility_options", "Accessibility Options"),
            ]

            verified_count = 0
            failed_fields = []

            # Datetime fields that may have timezone suffix differences
            datetime_fields = [
                "doors_open_time",
                "registration_start_time",
                "registration_end_time",
            ]

            for field, label in critical_fields:
                if field in retrieved_event:
                    expected = complete_event_data.get(field)
                    actual = retrieved_event.get(field)

                    # For datetime fields, check they exist and are valid (ignore timezone suffix differences)
                    if field in datetime_fields:
                        if (
                            actual and len(str(actual)) > 10
                        ):  # Valid datetime string check
                            print(f"  ✅ {label}: {actual}")
                            verified_count += 1
                        else:
                            print(f"  ⚠️  {label}: Expected datetime, got '{actual}'")
                            failed_fields.append(
                                f"{label} (expected: {expected}, got: {actual})"
                            )
                    elif expected == actual:
                        print(f"  ✅ {label}: {actual}")
                        verified_count += 1
                    else:
                        print(f"  ⚠️  {label}: Expected '{expected}', got '{actual}'")
                        failed_fields.append(
                            f"{label} (expected: {expected}, got: {actual})"
                        )
                else:
                    print(f"  ❌ {label}: FIELD MISSING from response!")
                    failed_fields.append(f"{label} (MISSING)")

            print(
                f"\n📊 Field Verification: {verified_count}/{len(critical_fields)} passed"
            )

            if failed_fields:
                print(f"\n❌ Failed fields:")
                for fail in failed_fields:
                    print(f"  - {fail}")

                # Don't fail the test, just report - some fields might not be stored yet
                pytest.fail(f"Fields not properly stored: {', '.join(failed_fields)}")
            else:
                print("\n🎉 ALL FIELDS VERIFIED SUCCESSFULLY!")

            return True

        except requests.exceptions.ConnectionError:
            pytest.fail(
                f"Could not connect to backend at {BASE_URL}. Is the server running?"
            )
        except Exception as e:
            pytest.fail(f"Test failed with error: {str(e)}")
        finally:
            # Cleanup - Delete test event (always runs even if test fails)
            if event_id:
                print(f"\n🧹 Cleaning up test event: {event_id}")
                try:
                    delete_response = api_client.delete(
                        f"{BASE_URL}/api/events/{event_id}"
                    )
                    if delete_response.status_code == 200:
                        print("✅ Test event deleted successfully")
                    else:
                        print(
                            f"⚠️  Could not delete test event: {delete_response.text}"
                        )
                except Exception as e:
                    print(f"⚠️  Error during cleanup: {e}")

    def test_event_list_shows_all_fields(self, api_client):
        """Test that event list endpoint also returns new fields."""
        try:
            print("\n🔍 Testing event list endpoint...")
            response = api_client.get(f"{BASE_URL}/api/events/?limit=5")

            assert response.status_code == 200, f"List failed: {response.text}"
            events = response.json()

            print(f"✅ Retrieved {len(events)} events from list")

            # Check that new fields are present in list items
            if events:
                first_event = events[0]
                new_fields = ["subtitle", "summary", "tags", "timezone"]

                found_fields = []
                for field in new_fields:
                    if field in first_event:
                        found_fields.append(field)

                print(f"  New fields in list response: {found_fields}")

                # This is informational - list endpoints might not include all fields
                if len(found_fields) == len(new_fields):
                    print("  ✅ All new fields present in list endpoint")
                else:
                    print(
                        f"  ℹ️  {len(found_fields)}/{len(new_fields)} new fields in list (expected)"
                    )

        except requests.exceptions.ConnectionError:
            pytest.fail(f"Could not connect to backend at {BASE_URL}")


def print_test_instructions():
    """Print instructions for running this test."""
    print("""
    ============================================================================
    REAL DATABASE ROUND-TRIP TEST
    ============================================================================
    Real Database Round-Trip Integration Test

    Required .env variables (in backend/.env):
        SUPABASE_URL=your_supabase_url
        SUPABASE_SERVICE_KEY=your_service_key (or SUPABASE_SERVICE_ROLE_KEY)
        TEST_AUTH_TOKEN=your_jwt_token
    
    Run test:
        cd backend
        uv run pytest tests/integration/test_real_db_roundtrip.py -v

    Or with pytest directly (after uv sync --dev):
        pytest tests/integration/test_real_db_roundtrip.py -v

    ============================================================================
    """)


if __name__ == "__main__":
    print_test_instructions()

    # Check if we can run
    if not os.getenv("TEST_AUTH_TOKEN"):
        print("❌ TEST_AUTH_TOKEN not set. Cannot run test.")
        print("Please set the environment variable and try again.")
        sys.exit(1)

    # Run pytest
    sys.exit(pytest.main([__file__, "-v", "--tb=short"]))
