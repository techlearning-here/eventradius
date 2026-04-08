"""
Test cases for notifications API endpoints
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


class TestNotificationsAPI:
    """Test notifications API endpoints"""

    def test_get_user_notifications_success(self):
        """Test getting user notifications successfully"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.get_table") as mock_get_table:
                mock_table = MagicMock()
                mock_table.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(
                    data=[
                        {
                            "id": "notif-1",
                            "user_id": "test-user-id",
                            "type": "event_reminder",
                            "title": "Event Reminder",
                            "message": "Your event starts tomorrow",
                            "read": False,
                            "created_at": "2024-01-01T00:00:00Z",
                        },
                        {
                            "id": "notif-2",
                            "user_id": "test-user-id",
                            "type": "registration_confirmation",
                            "title": "Registration Confirmed",
                            "message": "You have been registered for Test Event",
                            "read": True,
                            "created_at": "2024-01-02T00:00:00Z",
                        },
                    ]
                )
                mock_get_table.return_value = mock_table

                response = client.get(
                    "/api/notifications",
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 200
                data = response.json()
                assert len(data) == 2
                assert data[0]["type"] == "event_reminder"
                assert data[0]["read"] is False

    def test_get_user_notifications_unread_only(self):
        """Test getting only unread notifications"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.get_table") as mock_get_table:
                mock_table = MagicMock()
                mock_table.select.return_value.eq.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(
                    data=[
                        {
                            "id": "notif-1",
                            "user_id": "test-user-id",
                            "type": "event_reminder",
                            "title": "Event Reminder",
                            "message": "Your event starts tomorrow",
                            "read": False,
                            "created_at": "2024-01-01T00:00:00Z",
                        },
                    ]
                )
                mock_get_table.return_value = mock_table

                response = client.get(
                    "/api/notifications?unread_only=true",
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 200
                data = response.json()
                assert len(data) == 1
                assert data[0]["read"] is False

    def test_mark_notification_as_read_success(self):
        """Test marking notification as read successfully"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.get_table") as mock_get_table:
                # Mock notification ownership check
                mock_table = MagicMock()
                mock_table.select.return_value.eq.return_value.execute.return_value = (
                    MagicMock(
                        data=[
                            {
                                "id": "notif-1",
                                "user_id": "test-user-id",
                                "read": False,
                            }
                        ]
                    )
                )

                # Mock notification update
                mock_table.update.return_value.eq.return_value.execute.return_value = (
                    MagicMock(
                        data=[
                            {
                                "id": "notif-1",
                                "user_id": "test-user-id",
                                "read": True,
                            }
                        ]
                    )
                )
                mock_get_table.return_value = mock_table

                response = client.patch(
                    "/api/notifications/notif-1/read",
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 200
                data = response.json()
                assert data["read"] is True

    def test_mark_notification_as_read_unauthorized(self):
        """Test marking notification as read when not owner"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.get_table") as mock_get_table:
                # Mock notification ownership check (not owner)
                mock_table = MagicMock()
                mock_table.select.return_value.eq.return_value.execute.return_value = (
                    MagicMock(
                        data=[
                            {
                                "id": "notif-1",
                                "user_id": "other-user-id",
                                "read": False,
                            }
                        ]
                    )
                )
                mock_get_table.return_value = mock_table

                response = client.patch(
                    "/api/notifications/notif-1/read",
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 404  # Not found (security)

    def test_mark_all_notifications_as_read_success(self):
        """Test marking all notifications as read successfully"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.get_table") as mock_get_table:
                mock_table = MagicMock()
                mock_table.update.return_value.eq.return_value.execute.return_value = (
                    MagicMock()
                )
                mock_get_table.return_value = mock_table

                response = client.patch(
                    "/api/notifications/mark-all-read",
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 200
                data = response.json()
                assert data["success"] is True

    def test_delete_notification_success(self):
        """Test deleting notification successfully"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.get_table") as mock_get_table:
                # Mock notification ownership check
                mock_table = MagicMock()
                mock_table.select.return_value.eq.return_value.execute.return_value = (
                    MagicMock(
                        data=[
                            {
                                "id": "notif-1",
                                "user_id": "test-user-id",
                            }
                        ]
                    )
                )

                # Mock notification deletion
                mock_table.delete.return_value.eq.return_value.execute.return_value = (
                    MagicMock()
                )
                mock_get_table.return_value = mock_table

                response = client.delete(
                    "/api/notifications/notif-1",
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 200
                data = response.json()
                assert data["success"] is True

    def test_create_notification_success(self):
        """Test creating a notification successfully"""
        notification_data = {
            "user_id": "test-user-id",
            "type": "event_reminder",
            "title": "Event Reminder",
            "message": "Your event starts tomorrow",
        }

        with patch("config.database.get_table") as mock_get_table:
            mock_table = MagicMock()
            mock_table.insert.return_value.execute.return_value = MagicMock(
                data=[
                    {
                        "id": "notif-1",
                        **notification_data,
                        "read": False,
                        "created_at": datetime.now().isoformat(),
                    }
                ]
            )
            mock_get_table.return_value = mock_table

            response = client.post("/api/notifications", json=notification_data)

            assert response.status_code == 200
            data = response.json()
            assert data["type"] == "event_reminder"
            assert data["read"] is False

    def test_get_notification_count_success(self):
        """Test getting notification count successfully"""
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
                            {"id": "notif-1", "read": False},
                            {"id": "notif-2", "read": False},
                            {"id": "notif-3", "read": True},
                        ]
                    )
                )
                mock_get_table.return_value = mock_table

                response = client.get(
                    "/api/notifications/count",
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 200
                data = response.json()
                assert data["total_count"] == 3
                assert data["unread_count"] == 2

    def test_create_event_reminder_notifications(self):
        """Test creating event reminder notifications"""

        registrations_data = [
            {"user_id": "user-1", "event_id": "event-1"},
            {"user_id": "user-2", "event_id": "event-1"},
        ]

        with patch("config.database.get_table") as mock_get_table:
            # Mock registrations query
            mock_reg_table = MagicMock()
            mock_reg_table.select.return_value.eq.return_value.execute.return_value = (
                MagicMock(data=registrations_data)
            )

            # Mock notification creation
            mock_notif_table = MagicMock()
            mock_notif_table.insert.return_value.execute.return_value = MagicMock()

            def mock_get_table_side_effect(table_name):
                if table_name == "event_registrations":
                    return mock_reg_table
                else:
                    return mock_notif_table

            mock_get_table.side_effect = mock_get_table_side_effect

            response = client.post(
                "/api/notifications/create-event-reminders",
                json={"event_id": "event-1"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["notifications_created"] == 2

    def test_get_notification_preferences_success(self):
        """Test getting notification preferences successfully"""
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
                            {
                                "user_id": "test-user-id",
                                "email_notifications": True,
                                "push_notifications": False,
                                "event_reminders": True,
                                "registration_updates": True,
                            }
                        ]
                    )
                )
                mock_get_table.return_value = mock_table

                response = client.get(
                    "/api/notifications/preferences",
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 200
                data = response.json()
                assert data["email_notifications"] is True
                assert data["push_notifications"] is False

    def test_update_notification_preferences_success(self):
        """Test updating notification preferences successfully"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        preferences_data = {
            "email_notifications": False,
            "push_notifications": True,
            "event_reminders": False,
            "registration_updates": True,
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.get_table") as mock_get_table:
                mock_table = MagicMock()
                mock_table.update.return_value.eq.return_value.execute.return_value = (
                    MagicMock(
                        data=[
                            {
                                "user_id": "test-user-id",
                                **preferences_data,
                            }
                        ]
                    )
                )
                mock_get_table.return_value = mock_table

                response = client.put(
                    "/api/notifications/preferences",
                    json=preferences_data,
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 200
                data = response.json()
                assert data["email_notifications"] is False
                assert data["push_notifications"] is True
