"""
Test cases for event management API endpoints
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


class TestEventManagementAPI:
    """Test event management API endpoints"""

    def test_create_event_success(self):
        """Test creating an event successfully"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        event_data = {
            "title": "Test Event",
            "description": "Test event description",
            "location": "Test Location",
            "date": (datetime.now() + timedelta(days=30)).isoformat(),
            "time": "18:00",
            "duration": 120,
            "max_participants": 50,
            "category": "music",
            "price": 25.00,
            "image_url": "https://example.com/image.jpg",
            "tags": ["music", "concert", "live"],
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.get_table") as mock_get_table:
                mock_table = MagicMock()
                mock_table.insert.return_value.execute.return_value = MagicMock(
                    data=[
                        {
                            "id": "event-1",
                            "organizer_id": "test-user-id",
                            **event_data,
                            "status": "draft",
                            "current_participants": 0,
                            "created_at": datetime.now().isoformat(),
                        }
                    ]
                )
                mock_get_table.return_value = mock_table

                response = client.post(
                    "/api/events",
                    json=event_data,
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 200
                data = response.json()
                assert data["title"] == "Test Event"
                assert data["organizer_id"] == "test-user-id"
                assert data["status"] == "draft"

    def test_create_event_missing_required_fields(self):
        """Test creating an event with missing required fields"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        incomplete_data = {
            "title": "Test Event",
            # Missing description, location, date, etc.
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            response = client.post(
                "/api/events",
                json=incomplete_data,
                headers={"Authorization": "Bearer valid-token"},
            )

            assert response.status_code == 422  # Validation error

    def test_update_event_success(self):
        """Test updating an event successfully"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        update_data = {
            "title": "Updated Event Title",
            "description": "Updated description",
            "max_participants": 75,
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

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

                # Mock event update
                mock_event_table.update.return_value.eq.return_value.execute.return_value = MagicMock(
                    data=[
                        {
                            "id": "event-1",
                            "organizer_id": "test-user-id",
                            "title": "Updated Event Title",
                            "description": "Updated description",
                            "max_participants": 75,
                        }
                    ]
                )
                mock_get_table.return_value = mock_event_table

                response = client.put(
                    "/api/events/event-1",
                    json=update_data,
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 200
                data = response.json()
                assert data["title"] == "Updated Event Title"
                assert data["max_participants"] == 75

    def test_update_event_unauthorized(self):
        """Test updating an event when not the organizer"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        update_data = {
            "title": "Updated Event Title",
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.get_table") as mock_get_table:
                # Mock event ownership check (not the organizer)
                mock_event_table = MagicMock()
                mock_event_table.select.return_value.eq.return_value.execute.return_value = MagicMock(
                    data=[
                        {
                            "id": "event-1",
                            "organizer_id": "other-user-id",
                        }
                    ]
                )
                mock_get_table.return_value = mock_event_table

                response = client.put(
                    "/api/events/event-1",
                    json=update_data,
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 403  # Forbidden

    def test_delete_event_success(self):
        """Test deleting an event successfully"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

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

                # Mock event deletion
                mock_event_table.delete.return_value.eq.return_value.execute.return_value = (
                    MagicMock()
                )
                mock_get_table.return_value = mock_event_table

                response = client.delete(
                    "/api/events/event-1",
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 200
                data = response.json()
                assert data["success"] is True

    def test_publish_event_success(self):
        """Test publishing an event successfully"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.get_table") as mock_get_table:
                # Mock event ownership check
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

                # Mock event publish
                mock_event_table.update.return_value.eq.return_value.execute.return_value = MagicMock(
                    data=[
                        {
                            "id": "event-1",
                            "organizer_id": "test-user-id",
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
                data = response.json()
                assert data["status"] == "published"

    def test_get_organizer_events_success(self):
        """Test getting organizer's events"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.get_table") as mock_get_table:
                mock_table = MagicMock()
                mock_table.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(
                    data=[
                        {
                            "id": "event-1",
                            "organizer_id": "test-user-id",
                            "title": "Event 1",
                            "status": "published",
                            "current_participants": 10,
                            "max_participants": 50,
                        },
                        {
                            "id": "event-2",
                            "organizer_id": "test-user-id",
                            "title": "Event 2",
                            "status": "draft",
                            "current_participants": 0,
                            "max_participants": 25,
                        },
                    ]
                )
                mock_get_table.return_value = mock_table

                response = client.get(
                    "/api/users/organizer-events",
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 200
                data = response.json()
                assert len(data) == 2
                assert data[0]["organizer_id"] == "test-user-id"

    def test_get_event_analytics_success(self):
        """Test getting event analytics"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

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

                # Mock analytics data
                mock_reg_table = MagicMock()
                mock_reg_table.select.return_value.eq.return_value.execute.return_value = MagicMock(
                    data=[
                        {"status": "registered", "created_at": "2024-01-01T00:00:00Z"},
                        {"status": "registered", "created_at": "2024-01-02T00:00:00Z"},
                        {"status": "cancelled", "created_at": "2024-01-03T00:00:00Z"},
                    ]
                )

                def mock_get_table_side_effect(table_name):
                    if table_name == "events":
                        return mock_event_table
                    else:
                        return mock_reg_table

                mock_get_table.side_effect = mock_get_table_side_effect

                response = client.get(
                    "/api/events/event-1/analytics",
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 200
                data = response.json()
                assert "total_registrations" in data
                assert "registration_status_breakdown" in data
                assert "daily_registrations" in data

    def test_duplicate_event_success(self):
        """Test duplicating an event successfully"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.get_table") as mock_get_table:
                # Mock event ownership check
                mock_event_table = MagicMock()
                mock_event_table.select.return_value.eq.return_value.execute.return_value = MagicMock(
                    data=[
                        {
                            "id": "event-1",
                            "organizer_id": "test-user-id",
                            "title": "Original Event",
                            "description": "Original description",
                            "location": "Original location",
                            "category": "music",
                            "max_participants": 50,
                            "price": 25.00,
                        }
                    ]
                )

                # Mock event creation
                mock_event_table.insert.return_value.execute.return_value = MagicMock(
                    data=[
                        {
                            "id": "event-2",
                            "organizer_id": "test-user-id",
                            "title": "Copy of Original Event",
                            "description": "Original description",
                            "location": "Original location",
                            "category": "music",
                            "max_participants": 50,
                            "price": 25.00,
                            "status": "draft",
                        }
                    ]
                )
                mock_get_table.return_value = mock_event_table

                response = client.post(
                    "/api/events/event-1/duplicate",
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 200
                data = response.json()
                assert data["title"] == "Copy of Original Event"
                assert data["status"] == "draft"
                assert data["id"] != "event-1"

    def test_get_event_statistics_success(self):
        """Test getting overall event statistics"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.get_table") as mock_get_table:
                mock_table = MagicMock()
                mock_table.select.return_value.eq.return_value.execute.return_value = (
                    MagicMock(
                        data=[
                            {"status": "published", "current_participants": 10},
                            {"status": "published", "current_participants": 15},
                            {"status": "draft", "current_participants": 0},
                            {"status": "cancelled", "current_participants": 5},
                        ]
                    )
                )
                mock_get_table.return_value = mock_table

                response = client.get(
                    "/api/users/organizer-events/statistics",
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 200
                data = response.json()
                assert "total_events" in data
                assert "published_events" in data
                assert "total_participants" in data
                assert "average_participants" in data
