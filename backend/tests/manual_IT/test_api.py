"""
MANUAL INTEGRATION TEST - NOT RUN IN CI

Integration tests for API endpoints (uses mocks).

pytest marker: manual
"""

import pytest

# Mark all tests in this file as manual
pytestmark = pytest.mark.manual

from datetime import datetime, timedelta
from unittest.mock import Mock, patch

from fastapi.testclient import TestClient

from main import app


class TestHealthEndpoint:
    """Test health check endpoint."""

    def setup_method(self):
        """Set up test client."""
        self.client = TestClient(app)

    def test_health_endpoint(self):
        """Test GET /health returns healthy status."""
        response = self.client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


class TestEventsAPI:
    """Test events API endpoints."""

    def setup_method(self):
        """Set up test client."""
        self.client = TestClient(app)
        self.mock_event_data = {
            "id": "event-123",
            "title": "Test Event",
            "description": "Test description",
            "location": "Test Location",
            "start_time": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "end_time": (datetime.utcnow() + timedelta(days=1, hours=2)).isoformat(),
            "category": "music",
            "max_participants": 100,
            "current_participants": 0,
            "organizer_id": "user-123",
            "is_public": True,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
        }

    def test_get_events_no_auth(self):
        """Test GET /api/events/ without authentication."""
        mock_events = [self.mock_event_data]

        with patch("api.events.fetch_records") as mock_fetch:
            with patch("api.events.get_table") as mock_get_table:
                # Mock fetch_records response
                mock_response = Mock()
                mock_response.data = mock_events
                mock_fetch.return_value = mock_response

                # Mock get_table for participants count
                mock_table = Mock()
                mock_select = Mock()
                mock_eq = Mock()
                mock_execute = Mock()

                # Chain the mock calls
                mock_table.select.return_value = mock_select
                mock_select.eq.return_value = mock_eq
                mock_eq.execute.return_value = mock_execute
                mock_execute.count = 0

                mock_get_table.return_value = mock_table

                response = self.client.get("/api/events/")

                assert response.status_code == 200
                data = response.json()
                assert len(data) == 1
                assert data[0]["title"] == "Test Event"
                # Check that current_participants was added
                assert data[0]["current_participants"] == 0

    def test_get_events_with_filters(self):
        """Test GET /api/events/ with query parameters."""
        mock_events = [self.mock_event_data]

        with patch("api.events.fetch_records") as mock_fetch:
            with patch("api.events.get_table") as mock_get_table:
                # Mock fetch_records response
                mock_response = Mock()
                mock_response.data = mock_events
                mock_fetch.return_value = mock_response

                # Mock get_table for participants count
                mock_table = Mock()
                mock_select = Mock()
                mock_eq = Mock()
                mock_execute = Mock()

                # Chain the mock calls
                mock_table.select.return_value = mock_select
                mock_select.eq.return_value = mock_eq
                mock_eq.execute.return_value = mock_execute
                mock_execute.count = 0

                mock_get_table.return_value = mock_table

                response = self.client.get(
                    "/api/events/?category=music&limit=5&offset=0"
                )

                assert response.status_code == 200
                mock_fetch.assert_called_once()
                # Check that filters were passed correctly
                call_args = mock_fetch.call_args
                assert call_args[0][0] == "events"
                assert call_args[0][1] == {
                    "category": "music"
                }  # filters is second positional arg
                assert call_args[0][2] == 5  # limit is third positional arg
                assert call_args[0][3] == 0  # offset is fourth positional arg

    def test_get_event_by_id(self):
        """Test GET /api/events/{event_id}."""
        with patch("api.events.fetch_single_record") as mock_fetch:
            with patch("api.events.get_table") as mock_get_table:
                mock_response = Mock()
                mock_response.data = self.mock_event_data  # Single object, not list
                mock_fetch.return_value = mock_response

                # Mock participants count query
                mock_table = Mock()
                mock_select = Mock()
                mock_eq = Mock()
                mock_execute = Mock()

                mock_get_table.return_value = mock_table
                mock_table.select.return_value = mock_select
                mock_select.eq.return_value = mock_eq
                mock_eq.execute.return_value = mock_execute
                mock_execute.count = 0

                response = self.client.get("/api/events/event-123")

                assert response.status_code == 200
                data = response.json()
                assert data["title"] == "Test Event"
                assert data["id"] == "event-123"
            mock_fetch.assert_called_once_with("events", "event-123")

    def test_get_event_not_found(self):
        """Test GET /api/events/{event_id} when event doesn't exist."""
        with patch("api.events.fetch_single_record") as mock_fetch:
            mock_response = Mock()
            mock_response.data = None  # When record not found, .data is None
            mock_fetch.return_value = mock_response

            response = self.client.get("/api/events/nonexistent")

            assert response.status_code == 404
            data = response.json()
            assert "detail" in data

    def test_create_event_unauthorized(self):
        """Test POST /api/events/ without authentication."""
        event_data = {
            "title": "New Event",
            "description": "New event description",
            "location": "New Location",
            "start_time": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "end_time": (datetime.utcnow() + timedelta(days=1, hours=2)).isoformat(),
            "category": "sports",
            "max_participants": 50,
        }

        response = self.client.post("/api/events/", json=event_data)

        # Should return 401 because endpoint requires authentication
        assert response.status_code == 401

    def test_create_event_authorized(self):
        """Test POST /api/events/ with authentication."""
        event_data = {
            "title": "New Event",
            "description": "New event description",
            "location": "New Location",
            "start_time": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "end_time": (datetime.utcnow() + timedelta(days=1, hours=2)).isoformat(),
            "category": "sports",
            "max_participants": 50,
        }

        mock_user = {"id": "user-123", "email": "test@example.com"}
        mock_insert_response = {
            **event_data,
            "id": "new-event-123",
            "organizer_id": "user-123",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "is_public": True,
            "current_participants": 0,
        }

        # Mock authentication
        with patch("config.auth.auth_service.require_auth", return_value=mock_user):
            with patch("api.events.insert_record") as mock_insert:
                mock_response = Mock()
                mock_response.data = [mock_insert_response]
                mock_insert.return_value = mock_response

                response = self.client.post(
                    "/api/events/",
                    json=event_data,
                    headers={"Authorization": "Bearer test-token"},
                )

                assert response.status_code == 200
                data = response.json()
                assert data["id"] == "new-event-123"
                assert data["organizer_id"] == "user-123"

    def test_update_event(self):
        """Test PUT /api/events/{event_id}."""
        event_id = "event-123"
        update_data = {"title": "Updated Title", "description": "Updated description"}

        mock_user = {"id": "user-123"}
        mock_event = {**self.mock_event_data, "organizer_id": "user-123"}
        mock_updated_event = {**mock_event, **update_data}

        # Mock authentication and database operations
        with patch("config.auth.auth_service.require_auth", return_value=mock_user):
            with patch("api.events.fetch_single_record") as mock_fetch:
                fetch_response = Mock()
                fetch_response.data = mock_event
                mock_fetch.return_value = fetch_response
                with patch("api.events.update_record") as mock_update:
                    update_response = Mock()
                    update_response.data = [mock_updated_event]
                    mock_update.return_value = update_response
                    with patch("api.events.get_table") as mock_get_table:
                        # Mock get_table for participants count
                        mock_table = Mock()
                        mock_select = Mock()
                        mock_eq = Mock()
                        mock_execute = Mock()

                        # Chain the mock calls
                        mock_table.select.return_value = mock_select
                        mock_select.eq.return_value = mock_eq
                        mock_eq.execute.return_value = mock_execute
                        mock_execute.count = 0

                        mock_get_table.return_value = mock_table

                        response = self.client.put(
                            f"/api/events/{event_id}",
                            json=update_data,
                            headers={"Authorization": "Bearer test-token"},
                        )

                        assert response.status_code == 200
                        data = response.json()
                        assert data["title"] == "Updated Title"
                        assert data["description"] == "Updated description"

    def test_update_event_not_organizer(self):
        """Test PUT /api/events/{event_id} when user is not organizer."""
        event_id = "event-123"
        update_data = {"title": "Updated Title"}

        mock_user = {"id": "different-user"}  # Different user ID
        mock_event = {**self.mock_event_data, "organizer_id": "user-123"}

        with patch("config.auth.auth_service.require_auth", return_value=mock_user):
            with patch("api.events.fetch_single_record") as mock_fetch:
                fetch_response = Mock()
                fetch_response.data = mock_event
                mock_fetch.return_value = fetch_response

                response = self.client.put(
                    f"/api/events/{event_id}",
                    json=update_data,
                    headers={"Authorization": "Bearer test-token"},
                )

                assert response.status_code == 403
                data = response.json()
                assert "detail" in data

    def test_delete_event(self):
        """Test DELETE /api/events/{event_id}."""
        event_id = "event-123"

        mock_user = {"id": "user-123"}
        mock_event = {**self.mock_event_data, "organizer_id": "user-123"}

        with patch("config.auth.auth_service.require_auth", return_value=mock_user):
            with patch("api.events.fetch_single_record") as mock_fetch:
                fetch_response = Mock()
                fetch_response.data = mock_event
                mock_fetch.return_value = fetch_response
                with patch("api.events.delete_record") as mock_delete:
                    delete_response = Mock()
                    delete_response.data = []
                    mock_delete.return_value = delete_response
                    with patch("api.events.get_table") as mock_get_table:
                        # Mock get_table for deleting participants
                        mock_table = Mock()
                        mock_delete_method = Mock()
                        mock_eq = Mock()
                        mock_execute = Mock()

                        # Chain the mock calls
                        mock_table.delete.return_value = mock_delete_method
                        mock_delete_method.eq.return_value = mock_eq
                        mock_eq.execute.return_value = mock_execute

                        mock_get_table.return_value = mock_table

                        response = self.client.delete(
                            f"/api/events/{event_id}",
                            headers={"Authorization": "Bearer test-token"},
                        )

                        assert response.status_code == 200
                        data = response.json()
                        assert data["message"] == "Event deleted successfully"

    def test_participate_event(self):
        """Test POST /api/events/{event_id}/participate."""
        event_id = "event-123"

        mock_user = {"id": "user-456"}
        mock_event = {
            **self.mock_event_data,
            "current_participants": 10,
            "max_participants": 100,
        }

        with patch("config.auth.auth_service.require_auth", return_value=mock_user):
            with patch("api.events.fetch_single_record") as mock_fetch:
                fetch_response = Mock()
                fetch_response.data = mock_event
                mock_fetch.return_value = fetch_response
                with patch("api.events.insert_record") as mock_insert:
                    insert_response = Mock()
                    insert_response.data = [
                        {"event_id": event_id, "user_id": "user-456"}
                    ]
                    mock_insert.return_value = insert_response
                    with patch("api.events.update_record") as mock_update:
                        update_response = Mock()
                        update_response.data = [
                            {**mock_event, "current_participants": 11}
                        ]
                        mock_update.return_value = update_response
                        with patch("api.events.get_table") as mock_get_table:
                            # Mock get_table for participation checks and counts
                            mock_table = Mock()

                            # First call: existing participation (empty)
                            mock_select1 = Mock()
                            mock_eq1 = Mock()
                            mock_eq2 = Mock()
                            mock_execute1 = Mock()
                            mock_execute1.data = []  # No existing participation

                            # Second call: count participants
                            mock_select2 = Mock()
                            mock_eq3 = Mock()
                            mock_execute2 = Mock()
                            mock_execute2.count = 10  # Current count

                            # Set up the chain for first call
                            mock_table.select.return_value = mock_select1
                            mock_select1.eq.return_value = mock_eq1
                            mock_eq1.eq.return_value = mock_eq2
                            mock_eq2.execute.return_value = mock_execute1

                            # Second call uses .select("*", count="exact")
                            mock_table.select.side_effect = [
                                mock_select1,
                                mock_select2,
                            ]
                            mock_select2.eq.return_value = mock_eq3
                            mock_eq3.execute.return_value = mock_execute2

                            mock_get_table.return_value = mock_table

                            response = self.client.post(
                                f"/api/events/{event_id}/participate",
                                headers={"Authorization": "Bearer test-token"},
                            )

                            assert response.status_code == 200
                            data = response.json()
                            assert data["message"] == "Successfully joined event"

    def test_participate_event_full(self):
        """Test POST /api/events/{event_id}/participate when event is full."""
        event_id = "event-123"

        mock_user = {"id": "user-456"}
        mock_event = {
            **self.mock_event_data,
            "current_participants": 100,
            "max_participants": 100,
        }

        with patch("config.auth.auth_service.require_auth", return_value=mock_user):
            with patch("api.events.fetch_single_record") as mock_fetch:
                fetch_response = Mock()
                fetch_response.data = mock_event
                mock_fetch.return_value = fetch_response
                with patch("api.events.get_table") as mock_get_table:
                    # Mock get_table for participation checks and counts
                    mock_table = Mock()

                    # First call: existing participation (empty)
                    mock_select1 = Mock()
                    mock_eq1 = Mock()
                    mock_eq2 = Mock()
                    mock_execute1 = Mock()
                    mock_execute1.data = []  # No existing participation

                    # Second call: count participants
                    mock_select2 = Mock()
                    mock_eq3 = Mock()
                    mock_execute2 = Mock()
                    mock_execute2.count = 100  # Event is full

                    # Set up the chain for first call
                    mock_table.select.return_value = mock_select1
                    mock_select1.eq.return_value = mock_eq1
                    mock_eq1.eq.return_value = mock_eq2
                    mock_eq2.execute.return_value = mock_execute1

                    # Second call uses .select("*", count="exact")
                    mock_table.select.side_effect = [
                        mock_select1,
                        mock_select2,
                    ]
                    mock_select2.eq.return_value = mock_eq3
                    mock_eq3.execute.return_value = mock_execute2

                    mock_get_table.return_value = mock_table

                    response = self.client.post(
                        f"/api/events/{event_id}/participate",
                        headers={"Authorization": "Bearer test-token"},
                    )

                    assert response.status_code == 400
                    data = response.json()
                    assert "detail" in data
                    assert "full" in data["detail"].lower()


class TestUsersAPI:
    """Test users API endpoints."""

    def setup_method(self):
        """Set up test client."""
        self.client = TestClient(app)
        self.mock_user_data = {
            "id": "user-123",
            "email": "test@example.com",
            "full_name": "Test User",
            "avatar_url": None,
            "bio": None,
            "created_at": datetime.utcnow().isoformat(),
        }

    def test_get_current_user_profile(self):
        """Test GET /api/users/me."""
        mock_user = {"id": "user-123", "email": "test@example.com"}

        with patch("config.auth.auth_service.require_auth", return_value=mock_user):
            with patch("api.users.fetch_single_record") as mock_fetch:
                mock_response = Mock()
                mock_response.data = self.mock_user_data
                mock_fetch.return_value = mock_response

                response = self.client.get(
                    "/api/users/me", headers={"Authorization": "Bearer test-token"}
                )

                assert response.status_code == 200
                data = response.json()
                assert data["id"] == "user-123"
                assert data["email"] == "test@example.com"

    def test_update_user_profile(self):
        """Test PUT /api/users/me."""
        update_data = {
            "full_name": "Updated Name",
            "avatar_url": "https://example.com/avatar.jpg",
        }

        mock_user = {"id": "user-123"}
        # Create updated user data with full_name instead of name
        mock_updated_user = {
            **self.mock_user_data,
            "full_name": "Updated Name",
            "avatar_url": "https://example.com/avatar.jpg",
        }

        with patch("config.auth.auth_service.require_auth", return_value=mock_user):
            with patch("api.users.get_table") as mock_get_table:
                # Mock get_table for updating profile
                mock_table = Mock()
                mock_update = Mock()
                mock_eq = Mock()
                mock_execute = Mock()
                mock_execute.data = [mock_updated_user]

                # Chain the mock calls
                mock_table.update.return_value = mock_update
                mock_update.eq.return_value = mock_eq
                mock_eq.execute.return_value = mock_execute

                mock_get_table.return_value = mock_table

                response = self.client.put(
                    "/api/users/me",
                    json=update_data,
                    headers={"Authorization": "Bearer test-token"},
                )

                assert response.status_code == 200
                data = response.json()
                assert data["full_name"] == "Updated Name"
                assert data["avatar_url"] == "https://example.com/avatar.jpg"

    def test_get_user_events(self):
        """Test GET /api/users/me/events."""
        mock_user = {"id": "user-123"}
        # Create mock event data similar to TestEventsAPI
        mock_event_data = {
            "id": "event-123",
            "title": "Test Event",
            "description": "Test description",
            "location": "Test Location",
            "start_time": "2024-01-01T10:00:00Z",
            "end_time": "2024-01-01T12:00:00Z",
            "category": "music",
            "max_participants": 100,
            "current_participants": 0,
            "organizer_id": "user-123",
            "is_public": True,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
        }
        mock_events = [mock_event_data]

        with patch("config.auth.auth_service.require_auth", return_value=mock_user):
            with patch("api.users.get_table") as mock_get_table:
                # Mock get_table for events and event_participants

                # First call: get_table("events") for created events
                mock_select1 = Mock()
                mock_eq1 = Mock()
                mock_order = Mock()
                mock_execute1 = Mock()
                mock_execute1.data = mock_events  # User's created events

                # Second call: get_table("event_participants") for participation
                mock_select2 = Mock()
                mock_eq2 = Mock()
                mock_execute2 = Mock()
                mock_execute2.data = []  # No participation

                # Third: events for participating (may be skipped if none)
                mock_select3 = Mock()
                mock_in = Mock()
                mock_order2 = Mock()
                mock_execute3 = Mock()
                mock_execute3.data = []  # Empty since no participation

                # Set up side effect for get_table
                def get_table_side_effect(table_name):
                    if table_name == "events":
                        table_mock = Mock()
                        if (
                            mock_get_table.call_count == 1
                        ):  # First call for created events
                            table_mock.select.return_value = mock_select1
                            mock_select1.eq.return_value = mock_eq1
                            mock_eq1.order.return_value = mock_order
                            mock_order.execute.return_value = mock_execute1
                        else:  # Second call for participating events
                            table_mock.select.return_value = mock_select3
                            mock_select3.in_.return_value = mock_in
                            mock_in.order.return_value = mock_order2
                            mock_order2.execute.return_value = mock_execute3
                    elif table_name == "event_participants":
                        table_mock = Mock()
                        table_mock.select.return_value = mock_select2
                        mock_select2.eq.return_value = mock_eq2
                        mock_eq2.execute.return_value = mock_execute2
                    return table_mock

                mock_get_table.side_effect = get_table_side_effect

                response = self.client.get(
                    "/api/users/me/events",
                    headers={"Authorization": "Bearer test-token"},
                )

                assert response.status_code == 200
                data = response.json()
                # Response has "created" and "participating" lists
                assert "created" in data
                assert "participating" in data
                # We have one created event
                assert len(data["created"]) == 1
                # No participating events
                assert len(data["participating"]) == 0
                # Check that we get events with organizer_id matching user
                assert data["created"][0]["organizer_id"] == "user-123"
