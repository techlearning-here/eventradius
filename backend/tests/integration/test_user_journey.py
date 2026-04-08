"""
Integration tests for complete user journeys
"""

import json
import os
import sys
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from main import app

client = TestClient(app)


class TestUserJourneyIntegration:
    """Integration tests for complete user journeys"""

    def test_complete_user_registration_and_event_discovery_journey(self):
        """Test complete journey from user registration to event discovery"""
        # Step 1: User registration (mock OAuth callback)
        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_user = {
                "id": "test-user-id",
                "email": "test@example.com",
                "name": "Test User",
            }
            mock_auth.return_value = mock_user

            # Mock user profile creation
            with patch("config.database.get_table") as mock_get_table:
                mock_table = MagicMock()
                mock_table.select.return_value.eq.return_value.execute.return_value = (
                    MagicMock(data=[])
                )
                mock_table.insert.return_value.execute.return_value = MagicMock(
                    data=[
                        {
                            "user_id": "test-user-id",
                            "email": "test@example.com",
                            "name": "Test User",
                            "role": "user",
                        }
                    ]
                )
                mock_get_table.return_value = mock_table

                # Step 2: Complete user onboarding
                onboarding_data = {
                    "city": "New York",
                    "interests": ["music", "sports"],
                    "preferences": {
                        "email_notifications": True,
                        "event_reminders": True,
                    },
                }

                response = client.post(
                    "/api/users/onboarding",
                    json=onboarding_data,
                    headers={"Authorization": "Bearer valid-token"},
                )
                assert response.status_code == 200

                # Step 3: Discover events
                with patch("config.database.get_table") as mock_get_table:
                    mock_event_table = MagicMock()
                    mock_event_table.select.return_value.execute.return_value = (
                        MagicMock(
                            data=[
                                {
                                    "id": "event-1",
                                    "title": "NYC Music Concert",
                                    "description": "Live music performance",
                                    "location": "New York",
                                    "category": "music",
                                    "date": (
                                        datetime.now() + timedelta(days=7)
                                    ).isoformat(),
                                    "price": 25.00,
                                    "status": "published",
                                },
                                {
                                    "id": "event-2",
                                    "title": "Sports Tournament",
                                    "description": "Competitive sports event",
                                    "location": "New York",
                                    "category": "sports",
                                    "date": (
                                        datetime.now() + timedelta(days=14)
                                    ).isoformat(),
                                    "price": 15.00,
                                    "status": "published",
                                },
                            ]
                        )
                    )
                    mock_get_table.return_value = mock_event_table

                    response = client.get("/api/events?location=new+york")
                    assert response.status_code == 200
                    events = response.json()
                    assert len(events) == 2

                    # Step 4: Register for an event
                    registration_data = {
                        "event_id": "event-1",
                        "attendee_info": {
                            "name": "Test User",
                            "email": "test@example.com",
                        },
                    }

                    with patch("config.database.get_table") as mock_get_table:
                        # Mock event check
                        mock_event_table = MagicMock()
                        mock_event_table.select.return_value.eq.return_value.execute.return_value = MagicMock(
                            data=[
                                {
                                    "id": "event-1",
                                    "max_participants": 100,
                                    "current_participants": 50,
                                    "status": "published",
                                }
                            ]
                        )

                        # Mock registration creation
                        mock_reg_table = MagicMock()
                        mock_reg_table.insert.return_value.execute.return_value = (
                            MagicMock(
                                data=[
                                    {
                                        "id": "reg-1",
                                        "event_id": "event-1",
                                        "user_id": "test-user-id",
                                        "status": "registered",
                                    }
                                ]
                            )
                        )

                        # Mock participant count update
                        mock_event_update_table = MagicMock()
                        mock_event_update_table.update.return_value.eq.return_value.execute.return_value = (
                            MagicMock()
                        )

                        def mock_get_table_side_effect(table_name):
                            if table_name == "events":
                                return mock_event_table
                            elif table_name == "event_registrations":
                                return mock_reg_table
                            else:
                                return mock_event_update_table

                        mock_get_table.side_effect = mock_get_table_side_effect

                        response = client.post(
                            "/api/events/register",
                            json=registration_data,
                            headers={"Authorization": "Bearer valid-token"},
                        )
                        assert response.status_code == 200

                        # Step 5: View user's registrations
                        with patch("config.database.get_table") as mock_get_table:
                            mock_reg_table = MagicMock()
                            mock_reg_table.select.return_value.eq.return_value.execute.return_value = MagicMock(
                                data=[
                                    {
                                        "id": "reg-1",
                                        "event_id": "event-1",
                                        "status": "registered",
                                        "events": {
                                            "title": "NYC Music Concert",
                                            "date": (
                                                datetime.now() + timedelta(days=7)
                                            ).isoformat(),
                                        },
                                    }
                                ]
                            )
                            mock_get_table.return_value = mock_reg_table

                            response = client.get(
                                "/api/users/registrations",
                                headers={"Authorization": "Bearer valid-token"},
                            )
                            assert response.status_code == 200
                            registrations = response.json()
                            assert len(registrations) == 1
                            assert registrations[0]["event_id"] == "event-1"

    def test_complete_organizer_journey(self):
        """Test complete journey from organizer registration to event management"""
        # Step 1: User becomes organizer
        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_user = {
                "id": "test-user-id",
                "email": "organizer@example.com",
                "name": "Event Organizer",
            }
            mock_auth.return_value = mock_user

            # Complete organizer onboarding
            onboarding_data = {
                "phone": "+1234567890",
                "phone_country_code": "+1",
                "address": "123 Event St",
                "city": "New York",
                "state_province": "NY",
                "zip_pin": "10001",
                "country": "USA",
                "business_name": "Event Productions Inc",
                "business_type": "business",
                "description": "Professional event production company",
                "event_types": ["music", "sports", "arts"],
            }

            with patch("config.database.get_table") as mock_get_table:
                # Mock user profile update
                mock_user_table = MagicMock()
                mock_user_table.update.return_value.eq.return_value.execute.return_value = MagicMock(
                    data=[
                        {
                            "user_id": "test-user-id",
                            "phone": "+1234567890",
                            "address": "123 Event St",
                        }
                    ]
                )

                # Mock organizer profile creation
                mock_organizer_table = MagicMock()
                mock_organizer_table.insert.return_value.execute.return_value = (
                    MagicMock(
                        data=[
                            {
                                "id": "organizer-1",
                                "user_id": "test-user-id",
                                "business_name": "Event Productions Inc",
                                "verified": False,
                            }
                        ]
                    )
                )

                def mock_get_table_side_effect(table_name):
                    if table_name == "organizer_profiles":
                        return mock_organizer_table
                    else:
                        return mock_user_table

                mock_get_table.side_effect = mock_get_table_side_effect

                response = client.post(
                    "/api/users/organizer-onboarding",
                    json=onboarding_data,
                    headers={"Authorization": "Bearer valid-token"},
                )
                assert response.status_code == 200

                # Step 2: Create first event
                event_data = {
                    "title": "Summer Music Festival",
                    "description": "Annual summer music festival",
                    "location": "Central Park",
                    "date": (datetime.now() + timedelta(days=30)).isoformat(),
                    "time": "18:00",
                    "duration": 240,
                    "max_participants": 500,
                    "category": "music",
                    "price": 45.00,
                    "tags": ["music", "festival", "outdoor"],
                }

                with patch("config.database.get_table") as mock_get_table:
                    mock_event_table = MagicMock()
                    mock_event_table.insert.return_value.execute.return_value = (
                        MagicMock(
                            data=[
                                {
                                    "id": "event-1",
                                    "organizer_id": "test-user-id",
                                    **event_data,
                                    "status": "draft",
                                    "current_participants": 0,
                                }
                            ]
                        )
                    )
                    mock_get_table.return_value = mock_event_table

                    response = client.post(
                        "/api/events",
                        json=event_data,
                        headers={"Authorization": "Bearer valid-token"},
                    )
                    assert response.status_code == 200
                    created_event = response.json()
                    assert created_event["title"] == "Summer Music Festival"

                    # Step 3: Publish the event
                    with patch("config.database.get_table") as mock_get_table:
                        mock_event_table = MagicMock()
                        mock_event_table.select.return_value.eq.return_value.execute.return_value = MagicMock(
                            data=[
                                {
                                    "id": "event-1",
                                    "organizer_id": "test-user-id",
                                    "status": "draft",
                                }
                            ]
                        )
                        mock_event_table.update.return_value.eq.return_value.execute.return_value = MagicMock(
                            data=[
                                {
                                    "id": "event-1",
                                    "status": "published",
                                }
                            ]
                        )
                        mock_get_table.return_value = mock_event_table

                        response = client.post(
                            "/api/events/event-1/publish",
                            headers={"Authorization": "Bearer valid-token"},
                        )
                        assert response.status_code == 200
                        published_event = response.json()
                        assert published_event["status"] == "published"

                        # Step 4: View event registrations
                        with patch("config.database.get_table") as mock_get_table:
                            # Mock event ownership check
                            mock_event_table = MagicMock()
                            mock_event_table.select.return_value.eq.return_value.execute.return_value = MagicMock(
                                data=[
                                    {
                                        "id": "event-1",
                                        "organizer_id": "test-user-id",
                                    }
                                ]
                            )

                            # Mock registrations data
                            mock_reg_table = MagicMock()
                            mock_reg_table.select.return_value.eq.return_value.execute.return_value = MagicMock(
                                data=[
                                    {
                                        "id": "reg-1",
                                        "user_id": "user-1",
                                        "status": "registered",
                                        "attendee_info": {
                                            "name": "Attendee 1",
                                            "email": "attendee1@example.com",
                                        },
                                        "created_at": "2024-01-01T00:00:00Z",
                                    },
                                    {
                                        "id": "reg-2",
                                        "user_id": "user-2",
                                        "status": "registered",
                                        "attendee_info": {
                                            "name": "Attendee 2",
                                            "email": "attendee2@example.com",
                                        },
                                        "created_at": "2024-01-02T00:00:00Z",
                                    },
                                ]
                            )

                            def mock_get_table_side_effect(table_name):
                                if table_name == "events":
                                    return mock_event_table
                                else:
                                    return mock_reg_table

                            mock_get_table.side_effect = mock_get_table_side_effect

                            response = client.get(
                                "/api/events/event-1/registrations",
                                headers={"Authorization": "Bearer valid-token"},
                            )
                            assert response.status_code == 200
                            registrations = response.json()
                            assert len(registrations) == 2

                            # Step 5: Get event analytics
                            response = client.get(
                                "/api/events/event-1/analytics",
                                headers={"Authorization": "Bearer valid-token"},
                            )
                            assert response.status_code == 200
                            analytics = response.json()
                            assert "total_registrations" in analytics
                            assert analytics["total_registrations"] == 2

    def test_event_cancellation_and_refund_journey(self):
        """Test journey of event cancellation and user refunds"""
        # Setup: User registered for an event
        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_user = {
                "id": "test-user-id",
                "email": "user@example.com",
                "name": "Test User",
            }
            mock_auth.return_value = mock_user

            # Step 1: User unregisters from event
            with patch("config.database.get_table") as mock_get_table:
                # Mock registration deletion
                mock_reg_table = MagicMock()
                mock_reg_table.delete.return_value.eq.return_value.eq.return_value.execute.return_value = (
                    MagicMock()
                )

                # Mock participant count update
                mock_event_table = MagicMock()
                mock_event_table.update.return_value.eq.return_value.execute.return_value = (
                    MagicMock()
                )

                def mock_get_table_side_effect(table_name):
                    if table_name == "event_registrations":
                        return mock_reg_table
                    else:
                        return mock_event_table

                mock_get_table.side_effect = mock_get_table_side_effect

                response = client.delete(
                    "/api/events/event-1/unregister",
                    headers={"Authorization": "Bearer valid-token"},
                )
                assert response.status_code == 200

                # Step 2: Check notification was created
                with patch("config.database.get_table") as mock_get_table:
                    mock_notif_table = MagicMock()
                    mock_notif_table.select.return_value.eq.return_value.execute.return_value = MagicMock(
                        data=[
                            {
                                "id": "notif-1",
                                "user_id": "test-user-id",
                                "type": "cancellation_confirmation",
                                "title": "Event Cancellation Confirmed",
                                "message": "You have been unregistered from the event",
                                "read": False,
                            }
                        ]
                    )
                    mock_get_table.return_value = mock_notif_table

                    response = client.get(
                        "/api/notifications",
                        headers={"Authorization": "Bearer valid-token"},
                    )
                    assert response.status_code == 200
                    notifications = response.json()
                    assert len(notifications) == 1
                    assert notifications[0]["type"] == "cancellation_confirmation"

    def test_multi_event_management_journey(self):
        """Test journey of managing multiple events"""
        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_user = {
                "id": "test-user-id",
                "email": "organizer@example.com",
                "name": "Multi Event Organizer",
            }
            mock_auth.return_value = mock_user

            # Step 1: Create multiple events
            events_data = [
                {
                    "title": "Morning Yoga Session",
                    "category": "wellness",
                    "date": (datetime.now() + timedelta(days=7)).isoformat(),
                    "price": 20.00,
                },
                {
                    "title": "Evening Concert",
                    "category": "music",
                    "date": (datetime.now() + timedelta(days=14)).isoformat(),
                    "price": 35.00,
                },
                {
                    "title": "Art Workshop",
                    "category": "arts",
                    "date": (datetime.now() + timedelta(days=21)).isoformat(),
                    "price": 45.00,
                },
            ]

            with patch("config.database.get_table") as mock_get_table:
                mock_event_table = MagicMock()
                mock_event_table.insert.return_value.execute.return_value = MagicMock(
                    data=[
                        {
                            "id": f"event-{i+1}",
                            "organizer_id": "test-user-id",
                            **event,
                            "status": "draft",
                        }
                        for i, event in enumerate(events_data)
                    ]
                )
                mock_get_table.return_value = mock_event_table

                # Create all events
                for event_data in events_data:
                    response = client.post(
                        "/api/events",
                        json=event_data,
                        headers={"Authorization": "Bearer valid-token"},
                    )
                    assert response.status_code == 200

                # Step 2: Get all organizer events
                with patch("config.database.get_table") as mock_get_table:
                    mock_table = MagicMock()
                    mock_table.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(
                        data=[
                            {
                                "id": f"event-{i+1}",
                                "organizer_id": "test-user-id",
                                "title": event["title"],
                                "category": event["category"],
                                "status": "draft",
                                "current_participants": 0,
                            }
                            for i, event in enumerate(events_data)
                        ]
                    )
                    mock_get_table.return_value = mock_table

                    response = client.get(
                        "/api/users/organizer-events",
                        headers={"Authorization": "Bearer valid-token"},
                    )
                    assert response.status_code == 200
                    organizer_events = response.json()
                    assert len(organizer_events) == 3

                    # Step 3: Get organizer statistics
                    response = client.get(
                        "/api/users/organizer-events/statistics",
                        headers={"Authorization": "Bearer valid-token"},
                    )
                    assert response.status_code == 200
                    stats = response.json()
                    assert stats["total_events"] == 3
                    assert "total_participants" in stats

    def test_search_and_discovery_journey(self):
        """Test journey of searching and discovering events"""
        # Step 1: Search for events
        with patch("config.database.get_table") as mock_get_table:
            mock_table = MagicMock()
            mock_table.select.return_value.or_.return_value.execute.return_value = (
                MagicMock(
                    data=[
                        {
                            "id": "event-1",
                            "title": "Jazz Night",
                            "description": "Live jazz music performance",
                            "location": "Blue Note",
                            "category": "music",
                            "date": (datetime.now() + timedelta(days=7)).isoformat(),
                            "price": 30.00,
                            "status": "published",
                        },
                        {
                            "id": "event-2",
                            "title": "Jazz Workshop",
                            "description": "Learn jazz improvisation",
                            "location": "Music School",
                            "category": "music",
                            "date": (datetime.now() + timedelta(days=10)).isoformat(),
                            "price": 50.00,
                            "status": "published",
                        },
                    ]
                )
            )
            mock_get_table.return_value = mock_table

            response = client.get("/api/events/search?q=jazz")
            assert response.status_code == 200
            search_results = response.json()
            assert len(search_results) == 2

            # Step 2: Filter by category
            with patch("config.database.get_table") as mock_get_table:
                mock_table = MagicMock()
                mock_table.select.return_value.eq.return_value.execute.return_value = (
                    MagicMock(data=[search_results[0]])  # Only return the first event
                )
                mock_get_table.return_value = mock_table

                response = client.get("/api/events?category=music")
                assert response.status_code == 200
                filtered_events = response.json()
                assert len(filtered_events) == 1
                assert filtered_events[0]["category"] == "music"

            # Step 3: Get event details
            event_id = search_results[0]["id"]
            with patch("config.database.get_table") as mock_get_table:
                mock_table = MagicMock()
                mock_table.select.return_value.eq.return_value.execute.return_value = (
                    MagicMock(data=[search_results[0]])
                )
                mock_get_table.return_value = mock_table

                response = client.get(f"/api/events/{event_id}")
                assert response.status_code == 200
                event_details = response.json()
                assert event_details["id"] == event_id
                assert event_details["title"] == "Jazz Night"
