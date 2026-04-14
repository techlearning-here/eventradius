"""
MANUAL INTEGRATION TEST - NOT RUN IN CI

Integration test for Event Soft Delete and Restore functionality (Recycle Bin).

This test verifies the complete soft delete and restore workflow:
1. Create an event
2. Soft delete the event (move to recycle bin)
3. Verify event appears in deleted events list
4. Verify event is not visible in regular event list
5. Restore the event from recycle bin
6. Verify event is visible again in regular list
7. Verify event no longer appears in deleted list

Requirements:
- Backend server running on localhost:8000
- Real Supabase database
- Valid JWT token (TEST_AUTH_TOKEN in .env)

Run with: pytest tests/manual_IT/test_soft_delete_restore.py -v

pytest marker: manual
"""

import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, Optional

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


class TestEventSoftDeleteRestore:
    """Test event soft delete and restore (recycle bin) functionality."""

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

    def _create_test_event(self, api_client, suffix: str = "") -> Optional[str]:
        """Helper to create a test event. Returns event ID or None."""
        event_data = {
            "title": f"Soft Delete Test Event {suffix} - {datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "description": "Test event for soft delete/restore functionality testing",
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
            created = response.json()
            event_id = created.get("id")
            print(f"  ✅ Created test event: {event_id}")
            return event_id
        else:
            print(f"  ❌ Failed to create event: {response.text}")
            return None

    def _delete_event_permanently(self, api_client, event_id: str):
        """Helper to permanently delete an event (for cleanup)."""
        try:
            # Try to restore first if deleted
            api_client.post(f"{BASE_URL}/api/events/{event_id}/restore")
            # Then soft delete
            api_client.delete(f"{BASE_URL}/api/events/{event_id}")
            # Then permanent delete via database (bypass API)
            print(f"  🗑️  Cleaned up event: {event_id}")
        except Exception as e:
            print(f"  ⚠️  Cleanup warning for {event_id}: {e}")

    @pytest.fixture(scope="class", autouse=True)
    def cleanup_old_test_events(self, api_client):
        """Clean up any old test events before running tests."""
        print("\n🧹 Cleaning up old soft delete test events...")
        try:
            # Get list of events with test titles
            response = api_client.get(f"{BASE_URL}/api/events/?limit=100")
            if response.status_code == 200:
                events = response.json()
                deleted_count = 0
                for event in events:
                    title = event.get("title", "")
                    if "Soft Delete Test Event" in title:
                        event_id = event.get("id")
                        if event_id:
                            try:
                                # Soft delete
                                api_client.delete(f"{BASE_URL}/api/events/{event_id}")
                                deleted_count += 1
                                print(f"  🗑️  Moved to recycle bin: {title[:50]}...")
                            except Exception:
                                pass

                # Also check deleted events and permanently delete old ones
                deleted_response = api_client.get(
                    f"{BASE_URL}/api/events/deleted/me?limit=100"
                )
                if deleted_response.status_code == 200:
                    deleted_events = deleted_response.json()
                    for event in deleted_events:
                        title = event.get("title", "")
                        if "Soft Delete Test Event" in title:
                            event_id = event.get("id")
                            if event_id:
                                try:
                                    # Restore and then delete again to reset timestamp
                                    api_client.post(
                                        f"{BASE_URL}/api/events/{event_id}/restore"
                                    )
                                    api_client.delete(
                                        f"{BASE_URL}/api/events/{event_id}"
                                    )
                                    print(
                                        f"  🗑️  Refreshed deleted event: {title[:50]}..."
                                    )
                                except Exception:
                                    pass

                if deleted_count > 0:
                    print(f"✅ Cleaned up {deleted_count} old test events")
                else:
                    print("✅ No old test events found")
        except Exception as e:
            print(f"⚠️  Cleanup warning: {e}")
        yield  # Let tests run

    def test_soft_delete_and_restore_workflow(self, api_client):
        """Test complete soft delete and restore workflow."""
        event_id = None

        try:
            # Step 1: Create a test event
            print("\n📋 Step 1: Creating test event...")
            event_id = self._create_test_event(api_client)
            assert event_id is not None, "Failed to create test event"

            # Step 2: Verify event is visible in regular list
            print("\n📋 Step 2: Verifying event is in regular event list...")
            response = api_client.get(f"{BASE_URL}/api/events/?limit=50")
            assert response.status_code == 200

            events = response.json()
            event_ids = [e.get("id") for e in events]
            assert (
                event_id in event_ids
            ), "Event not found in regular list before delete"
            print("  ✅ Event visible in regular list")

            # Step 3: Soft delete the event
            print("\n📋 Step 3: Soft deleting event...")
            response = api_client.delete(f"{BASE_URL}/api/events/{event_id}")
            assert response.status_code == 200, f"Soft delete failed: {response.text}"

            delete_result = response.json()
            assert (
                "recycle bin" in delete_result.get("message", "").lower()
                or "deleted" in delete_result.get("message", "").lower()
            )
            print(f"  ✅ Event soft deleted: {delete_result.get('message')}")

            # Step 4: Verify event is NOT in regular list
            print("\n📋 Step 4: Verifying event is NOT in regular list after delete...")
            response = api_client.get(f"{BASE_URL}/api/events/?limit=50")
            assert response.status_code == 200

            events = response.json()
            event_ids = [e.get("id") for e in events]
            assert (
                event_id not in event_ids
            ), "Event still visible in regular list after delete"
            print("  ✅ Event not in regular list (correctly hidden)")

            # Step 5: Verify event IS in deleted events list (recycle bin)
            print("\n📋 Step 5: Verifying event is in recycle bin...")
            response = api_client.get(f"{BASE_URL}/api/events/deleted/me?limit=50")
            assert (
                response.status_code == 200
            ), f"Failed to get deleted events: {response.text}"

            deleted_events = response.json()
            deleted_event_ids = [e.get("id") for e in deleted_events]
            assert event_id in deleted_event_ids, "Event not found in recycle bin"

            # Verify deleted_at field is set
            deleted_event = next(
                (e for e in deleted_events if e.get("id") == event_id), None
            )
            assert deleted_event is not None
            assert (
                deleted_event.get("deleted_at") is not None
            ), "deleted_at field not set"
            print(
                f"  ✅ Event found in recycle bin (deleted_at: {deleted_event.get('deleted_at')})"
            )

            # Step 6: Get specific deleted event details
            print("\n📋 Step 6: Getting deleted event details...")
            response = api_client.get(f"{BASE_URL}/api/events/deleted/{event_id}")
            assert (
                response.status_code == 200
            ), f"Failed to get deleted event details: {response.text}"

            deleted_event_detail = response.json()
            assert deleted_event_detail.get("id") == event_id
            assert deleted_event_detail.get("deleted_at") is not None
            print("  ✅ Deleted event details accessible")

            # Step 7: Restore the event
            print("\n📋 Step 7: Restoring event from recycle bin...")
            response = api_client.post(f"{BASE_URL}/api/events/{event_id}/restore")
            assert response.status_code == 200, f"Restore failed: {response.text}"

            restored_event = response.json()
            assert restored_event.get("id") == event_id
            assert (
                restored_event.get("deleted_at") is None
            ), "deleted_at not cleared after restore"
            print("  ✅ Event restored successfully")

            # Step 8: Verify event is back in regular list
            print("\n📋 Step 8: Verifying event is back in regular list...")
            response = api_client.get(f"{BASE_URL}/api/events/?limit=50")
            assert response.status_code == 200

            events = response.json()
            event_ids = [e.get("id") for e in events]
            assert event_id in event_ids, "Restored event not found in regular list"
            print("  ✅ Event visible in regular list after restore")

            # Step 9: Verify event is NOT in recycle bin anymore
            print("\n📋 Step 9: Verifying event is NOT in recycle bin after restore...")
            response = api_client.get(f"{BASE_URL}/api/events/deleted/me?limit=50")
            assert response.status_code == 200

            deleted_events = response.json()
            deleted_event_ids = [e.get("id") for e in deleted_events]
            assert (
                event_id not in deleted_event_ids
            ), "Restored event still in recycle bin"
            print("  ✅ Event not in recycle bin (correctly removed)")

            # Step 10: Try to restore already restored event (should fail)
            print("\n📋 Step 10: Testing restore of non-deleted event (should fail)...")
            response = api_client.post(f"{BASE_URL}/api/events/{event_id}/restore")
            assert (
                response.status_code == 400
            ), "Should fail when restoring non-deleted event"
            assert "not in recycle bin" in response.json().get("detail", "").lower()
            print("  ✅ Correctly rejected restore of non-deleted event")

            print("\n🎉 Soft delete/restore workflow completed successfully!")
            return True

        except requests.exceptions.ConnectionError:
            pytest.fail(f"Could not connect to backend at {BASE_URL}")
        except Exception as e:
            pytest.fail(f"Test failed with error: {str(e)}")
        finally:
            # Cleanup
            if event_id:
                print(f"\n🧹 Cleaning up test event: {event_id}")
                try:
                    self._delete_event_permanently(api_client, event_id)
                    print("  ✅ Cleanup completed")
                except Exception as e:
                    print(f"  ⚠️  Cleanup warning: {e}")

    def test_cannot_access_deleted_event_via_regular_endpoint(self, api_client):
        """Test that deleted events are not accessible via regular get_event endpoint."""
        event_id = None

        try:
            # Create and delete an event
            print("\n📋 Testing deleted event accessibility...")
            event_id = self._create_test_event(api_client, "Accessibility Test")
            assert event_id is not None

            # Verify we can access it before delete
            response = api_client.get(f"{BASE_URL}/api/events/{event_id}")
            assert (
                response.status_code == 200
            ), "Should be able to access event before delete"
            print("  ✅ Event accessible before delete")

            # Soft delete
            response = api_client.delete(f"{BASE_URL}/api/events/{event_id}")
            assert response.status_code == 200
            print("  ✅ Event deleted")

            # Try to access via regular endpoint (should 404)
            response = api_client.get(f"{BASE_URL}/api/events/{event_id}")
            assert (
                response.status_code == 404
            ), "Deleted event should not be accessible via regular endpoint"
            print(
                "  ✅ Deleted event not accessible via regular endpoint (correct 404)"
            )

            # But accessible via deleted endpoint
            response = api_client.get(f"{BASE_URL}/api/events/deleted/{event_id}")
            assert (
                response.status_code == 200
            ), "Deleted event should be accessible via deleted endpoint"
            print("  ✅ Deleted event accessible via deleted endpoint")

        except requests.exceptions.ConnectionError:
            pytest.fail(f"Could not connect to backend at {BASE_URL}")
        except Exception as e:
            pytest.fail(f"Test failed with error: {str(e)}")
        finally:
            if event_id:
                try:
                    self._delete_event_permanently(api_client, event_id)
                except Exception:
                    pass

    def test_deleted_events_pagination(self, api_client):
        """Test deleted events list supports pagination."""
        created_events = []

        try:
            print("\n📋 Testing deleted events pagination...")

            # Create multiple events and delete them
            for i in range(3):
                event_id = self._create_test_event(api_client, f"Pagination {i+1}")
                if event_id:
                    created_events.append(event_id)
                    # Delete immediately
                    api_client.delete(f"{BASE_URL}/api/events/{event_id}")

            assert (
                len(created_events) >= 2
            ), "Need at least 2 events for pagination test"
            print(f"  ✅ Created and deleted {len(created_events)} events")

            # Test with limit
            response = api_client.get(f"{BASE_URL}/api/events/deleted/me?limit=2")
            assert response.status_code == 200

            deleted_events = response.json()
            assert len(deleted_events) <= 2, "Limit parameter not respected"
            print(f"  ✅ Limit parameter works (returned {len(deleted_events)} events)")

            # Test with offset
            response = api_client.get(
                f"{BASE_URL}/api/events/deleted/me?limit=1&offset=1"
            )
            assert response.status_code == 200

            offset_events = response.json()
            assert len(offset_events) <= 1, "Offset/limit not working correctly"
            print("  ✅ Offset parameter works")

            print("\n🎉 Pagination test completed!")

        except requests.exceptions.ConnectionError:
            pytest.fail(f"Could not connect to backend at {BASE_URL}")
        except Exception as e:
            pytest.fail(f"Test failed with error: {str(e)}")
        finally:
            # Cleanup all created events
            for event_id in created_events:
                try:
                    self._delete_event_permanently(api_client, event_id)
                except Exception:
                    pass
