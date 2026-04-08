"""
Test cases for events API endpoints
"""

import json
import os
import sys
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from main import app

client = TestClient(app)


class TestEventsAPI:
    """Test events API endpoints"""

    def test_get_events_success(self):
        """Test getting events list"""
        mock_events = [
            {
                "id": "event-1",
                "title": "Test Event 1",
                "description": "Description 1",
                "location": "Location 1",
                "organizer_id": "user-1",
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z",
                "current_participants": 0,
            },
            {
                "id": "event-2",
                "title": "Test Event 2",
                "description": "Description 2",
                "location": "Location 2",
                "organizer_id": "user-2",
                "created_at": "2024-01-02T00:00:00Z",
                "updated_at": "2024-01-02T00:00:00Z",
                "current_participants": 0,
            },
        ]

        with patch("api.events.get_table") as mock_get_table:
            mock_table = MagicMock()
            mock_query = MagicMock()
            mock_response = MagicMock()
            mock_response.data = mock_events

            # Mock the query chain: table.select("*").is_("deleted_at", "null").limit(20).offset(0).execute()
            mock_table.select.return_value = mock_query
            mock_query.is_.return_value = mock_query
            mock_query.limit.return_value = mock_query
            mock_query.offset.return_value = mock_query
            mock_query.execute.return_value = mock_response

            mock_get_table.return_value = mock_table

            response = client.get("/api/events")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert data[0]["title"] == "Test Event 1"

    @patch("config.auth.AuthService.require_auth")
    def test_get_event_success(self, mock_auth):
        """Test getting single event"""
        mock_user = {"id": "test-user-id"}
        mock_auth.return_value = mock_user

        mock_event = {
            "id": "event-1",
            "title": "Test Event",
            "description": "Description",
            "location": "Location",
            "organizer_id": "user-1",
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
            "current_participants": 0,
        }

        with patch("api.events.get_table") as mock_get_table:
            mock_table = MagicMock()
            mock_query = MagicMock()
            mock_response = MagicMock()
            mock_response.data = [mock_event]

            # Mock the query chain: table.select("*").eq("id", event_id).is_("deleted_at", "null").execute()
            mock_table.select.return_value = mock_query
            mock_query.eq.return_value = mock_query
            mock_query.is_.return_value = mock_query
            mock_query.execute.return_value = mock_response

            mock_get_table.return_value = mock_table

            response = client.get(
                "/api/events/event-1", headers={"Authorization": "Bearer valid-token"}
            )

            assert response.status_code == 200
            data = response.json()
            assert data["id"] == "event-1"
            assert data["title"] == "Test Event"

    @patch("config.auth.AuthService.require_auth")
    def test_get_event_not_found(self, mock_auth):
        """Test getting non-existent event"""
        mock_user = {"id": "test-user-id"}
        mock_auth.return_value = mock_user

        with patch("api.events.get_table") as mock_get_table:
            mock_table = MagicMock()
            mock_query = MagicMock()
            mock_response = MagicMock()
            mock_response.data = []

            # Mock the query chain: table.select("*").eq("id", event_id).is_("deleted_at", "null").execute()
            mock_table.select.return_value = mock_query
            mock_query.eq.return_value = mock_query
            mock_query.is_.return_value = mock_query
            mock_query.execute.return_value = mock_response

            mock_get_table.return_value = mock_table

            response = client.get(
                "/api/events/non-existent",
                headers={"Authorization": "Bearer valid-token"},
            )

            assert response.status_code == 404
            assert "Event not found" in response.json()["detail"]

    @patch("config.auth.AuthService.require_auth")
    def test_send_event_message_success(self, mock_auth):
        """Test sending event message"""
        mock_user = {"id": "test-user-id"}
        mock_auth.return_value = mock_user

        message_data = {"message_text": "Hello, this is a test message"}

        with patch("api.events.get_table") as mock_get_table:
            # Mock event verification - user is organizer
            mock_event = {
                "id": "event-1",
                "organizer_id": "test-user-id",  # User is organizer
            }

            # Mock the different table calls
            def mock_get_table_side_effect(table_name):
                mock_table = MagicMock()

                if table_name == "events":
                    # Mock event lookup: get_table("events").select("*").eq("id", event_id).is_("deleted_at", "null").execute()
                    mock_response = MagicMock()
                    mock_response.data = [mock_event]
                    mock_table.select.return_value.eq.return_value.is_.return_value.execute.return_value = (
                        mock_response
                    )
                elif table_name == "event_messages":
                    # Mock message insertion: get_table("event_messages").insert(message_data).execute()
                    mock_response = MagicMock()
                    mock_response.data = [{"id": "message-1"}]
                    mock_table.insert.return_value.execute.return_value = mock_response
                else:
                    # For other tables (event_participants won't be called since user is organizer)
                    mock_response = MagicMock()
                    mock_response.data = []
                    mock_table.select.return_value.eq.return_value.eq.return_value.execute.return_value = (
                        mock_response
                    )

                return mock_table

            mock_get_table.side_effect = mock_get_table_side_effect

            response = client.post(
                "/api/events/event-1/messages",
                json=message_data,
                headers={"Authorization": "Bearer valid-token"},
            )

            assert response.status_code == 200

    @patch("config.auth.AuthService.require_auth")
    def test_get_event_messages_success(self, mock_auth):
        """Test getting event messages"""
        mock_user = {"id": "test-user-id"}
        mock_auth.return_value = mock_user

        mock_messages = [
            {
                "id": "msg-1",
                "event_id": "event-1",
                "sender_user_id": "user-1",
                "message_text": "Hello",
                "created_at": "2024-01-01T00:00:00Z",
            },
            {
                "id": "msg-2",
                "event_id": "event-1",
                "sender_user_id": "user-2",
                "message_text": "Hi there",
                "created_at": "2024-01-01T00:01:00Z",
            },
        ]

        with patch("api.events.get_table") as mock_get_table:
            mock_table = MagicMock()
            mock_response = MagicMock()
            mock_response.data = mock_messages
            mock_table.select.return_value.eq.return_value.order.return_value.execute.return_value = (
                mock_response
            )
            mock_get_table.return_value = mock_table

            response = client.get(
                "/api/events/event-1/messages",
                headers={"Authorization": "Bearer valid-token"},
            )

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert data[0]["message_text"] == "Hello"


if __name__ == "__main__":
    pytest.main([__file__])
