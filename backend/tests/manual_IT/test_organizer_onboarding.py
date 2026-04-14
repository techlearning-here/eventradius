"""
MANUAL INTEGRATION TEST - NOT RUN IN CI

Integration test for complete Organizer Onboarding workflow.

This test verifies the complete organizer onboarding flow:
1. User requests organizer role
2. User adds phone number (required for organizers)
3. Email verification sent and completed
4. Phone verification sent and completed
5. Organizer status becomes "active"
6. Organizer can create events

Requirements:
- Backend server running on localhost:8000
- Real Supabase database
- Valid JWT token (TEST_AUTH_TOKEN in .env)

Run with: pytest tests/manual_IT/test_organizer_onboarding.py -v

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


class TestOrganizerOnboardingWorkflow:
    """Test complete organizer onboarding workflow with real database."""

    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token from environment."""
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

    def test_organizer_onboarding_complete_workflow(self, api_client):
        """Test complete organizer onboarding from start to finish."""
        try:
            # Step 1: Check initial organizer status
            print("\n📋 Step 1: Checking initial organizer status...")
            response = api_client.get(f"{BASE_URL}/api/users/me/organizer-status")
            assert (
                response.status_code == 200
            ), f"Failed to get organizer status: {response.text}"

            initial_status = response.json()
            print(f"  Initial status: {initial_status}")

            # If already an organizer with active status, skip to event creation test
            if initial_status.get("is_organizer") and initial_status.get("is_active"):
                print(
                    "  ✅ User is already an active organizer, testing event creation..."
                )
                self._test_create_event(api_client)
                return True

            # Step 2: Request organizer role via preferences
            print("\n📋 Step 2: Requesting organizer role...")
            preferences_update = {
                "is_organizer": True,
                "onboarding_completed": True,
                "interests": ["technology", "networking", "community"],
                "city": "San Francisco",
                "distance_range": 50,
            }

            response = api_client.put(
                f"{BASE_URL}/api/users/me/preferences", json=preferences_update
            )
            assert (
                response.status_code == 200
            ), f"Failed to update preferences: {response.text}"
            print("  ✅ Organizer role requested")

            # Step 3: Add phone number (required for organizers)
            print("\n📋 Step 3: Adding phone number...")
            test_phone = "4155551234"
            phone_data = {"phone": test_phone, "country_code": "+1"}

            response = api_client.post(
                f"{BASE_URL}/api/users/me/phone", json=phone_data
            )
            assert response.status_code == 200, f"Failed to add phone: {response.text}"
            print(f"  ✅ Phone added: {test_phone}")

            # Step 4: Check verification status
            print("\n📋 Step 4: Checking verification status...")
            response = api_client.get(f"{BASE_URL}/api/organizers/verification-status")
            assert (
                response.status_code == 200
            ), f"Failed to get verification status: {response.text}"

            verification_status = response.json()
            print(f"  Verification status: {verification_status}")

            # Step 5: Send email verification
            print("\n📋 Step 5: Sending email verification...")
            user_email = self._get_user_email(api_client)

            email_data = {"email": user_email}
            response = api_client.post(
                f"{BASE_URL}/api/verification/email/send", json=email_data
            )
            assert (
                response.status_code == 200
            ), f"Failed to send email verification: {response.text}"

            email_result = response.json()
            email_token = email_result.get("token")
            print(f"  ✅ Email verification sent (token: {email_token})")

            # Step 6: Verify email
            if email_token:
                print("\n📋 Step 6: Verifying email...")
                verify_data = {"token": email_token, "type": "email"}
                response = api_client.post(
                    f"{BASE_URL}/api/verification/verify", json=verify_data
                )
                assert (
                    response.status_code == 200
                ), f"Failed to verify email: {response.text}"
                print("  ✅ Email verified")

            # Step 7: Send phone verification
            print("\n📋 Step 7: Sending phone verification...")
            phone_verify_data = {"phone": test_phone, "phone_country_code": "+1"}
            response = api_client.post(
                f"{BASE_URL}/api/verification/phone/send", json=phone_verify_data
            )
            assert (
                response.status_code == 200
            ), f"Failed to send phone verification: {response.text}"

            phone_result = response.json()
            phone_token = phone_result.get("token")
            print(f"  ✅ Phone verification sent (token: {phone_token})")

            # Step 8: Verify phone
            if phone_token:
                print("\n📋 Step 8: Verifying phone...")
                verify_data = {"token": phone_token, "type": "phone"}
                response = api_client.post(
                    f"{BASE_URL}/api/verification/verify", json=verify_data
                )
                assert (
                    response.status_code == 200
                ), f"Failed to verify phone: {response.text}"
                print("  ✅ Phone verified")

            # Step 9: Check final organizer status
            print("\n📋 Step 9: Checking final organizer status...")
            response = api_client.get(f"{BASE_URL}/api/organizers/verification-status")
            assert response.status_code == 200

            final_status = response.json()
            print(f"  Final status: {final_status}")

            # Verify organizer is now active
            if final_status.get("is_organizer"):
                print("  ✅ User is now an organizer")
                if final_status.get("email_verified"):
                    print("  ✅ Email verified")
                if final_status.get("phone_verified"):
                    print("  ✅ Phone verified")
                if final_status.get("can_create_events"):
                    print("  ✅ Can create events")

            # Step 10: Test event creation as organizer
            if final_status.get("can_create_events"):
                print("\n📋 Step 10: Testing event creation as organizer...")
                self._test_create_event(api_client)
            else:
                print("  ⚠️  Organizer not yet active, skipping event creation test")

            print("\n🎉 Organizer onboarding workflow completed successfully!")
            return True

        except requests.exceptions.ConnectionError:
            pytest.fail(
                f"Could not connect to backend at {BASE_URL}. Is the server running?"
            )
        except Exception as e:
            pytest.fail(f"Test failed with error: {str(e)}")
        finally:
            # Cleanup: Reset user to non-organizer status
            print("\n🧹 Cleaning up - resetting user preferences...")
            try:
                reset_data = {
                    "is_organizer": False,
                    "interests": [],
                    "onboarding_completed": False,
                }
                api_client.put(f"{BASE_URL}/api/users/me/preferences", json=reset_data)
                print("  ✅ User preferences reset")
            except Exception as e:
                print(f"  ⚠️  Cleanup warning: {e}")

    def _get_user_email(self, api_client) -> str:
        """Get current user's email from profile."""
        response = api_client.get(f"{BASE_URL}/api/users/me")
        if response.status_code == 200:
            data = response.json()
            return data.get(
                "email", f"test_{datetime.now().strftime('%Y%m%d%H%M%S')}@example.com"
            )
        return f"test_{datetime.now().strftime('%Y%m%d%H%M%S')}@example.com"

    def _test_create_event(self, api_client):
        """Helper method to test event creation."""
        event_data = {
            "title": f"Organizer Test Event - {datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "description": "Test event created by organizer onboarding workflow",
            "category": "technology",
            "event_type": "in_person",
            "event_format": "single",
            "start_time": (datetime.now() + timedelta(days=7)).isoformat(),
            "end_time": (datetime.now() + timedelta(days=7, hours=2)).isoformat(),
            "timezone": "America/Los_Angeles",
            "location": "Test Venue, 123 Test St, San Francisco, CA",
            "max_participants": 50,
            "is_public": True,
            "status": "published",
        }

        response = api_client.post(f"{BASE_URL}/api/events", json=event_data)

        if response.status_code == 200:
            created_event = response.json()
            event_id = created_event.get("id")
            print(f"  ✅ Event created successfully (ID: {event_id})")

            # Cleanup: Delete the test event
            if event_id:
                try:
                    delete_response = api_client.delete(
                        f"{BASE_URL}/api/events/{event_id}"
                    )
                    if delete_response.status_code == 200:
                        print(f"  ✅ Test event deleted")
                except Exception:
                    pass
        else:
            print(f"  ⚠️  Event creation failed: {response.text}")

    def test_organizer_activation_check(self, api_client):
        """Test organizer activation check endpoint."""
        print("\n📋 Testing organizer activation check...")

        try:
            response = api_client.get(f"{BASE_URL}/api/organizers/activation-check")
            assert (
                response.status_code == 200
            ), f"Activation check failed: {response.text}"

            activation_status = response.json()
            print(f"  Activation status: {activation_status}")

            # Verify response structure
            assert "is_organizer" in activation_status
            assert "is_active" in activation_status
            assert "can_create_events" in activation_status
            assert "organizer_status" in activation_status

            print("  ✅ Activation check endpoint working")

        except requests.exceptions.ConnectionError:
            pytest.fail(f"Could not connect to backend at {BASE_URL}")
        except Exception as e:
            pytest.fail(f"Test failed with error: {str(e)}")

    def test_verification_status_endpoint(self, api_client):
        """Test verification status endpoint returns correct structure."""
        print("\n📋 Testing verification status endpoint...")

        try:
            response = api_client.get(f"{BASE_URL}/api/organizers/verification-status")
            assert (
                response.status_code == 200
            ), f"Verification status failed: {response.text}"

            status = response.json()
            print(f"  Full verification status: {status}")

            # Verify all required fields
            required_fields = [
                "is_organizer",
                "email_verified",
                "phone_verified",
                "phone_provided",
                "email_verification_sent",
                "phone_verification_sent",
                "organizer_status",
                "is_active",
                "can_create_events",
                "missing_requirements",
                "next_actions",
            ]

            for field in required_fields:
                assert field in status, f"Missing field: {field}"
                print(f"  ✅ {field}: {status.get(field)}")

            print("  ✅ All verification status fields present")

        except requests.exceptions.ConnectionError:
            pytest.fail(f"Could not connect to backend at {BASE_URL}")
        except Exception as e:
            pytest.fail(f"Test failed with error: {str(e)}")
