"""
Test cases for event registration API endpoints
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


class TestEventRegistrationsAPI:
    """Test event registration API endpoints"""

    def test_register_for_event_success(self):
        """Test registering for an event successfully"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        registration_data = {
            "event_id": "event-1",
            "attendee_info": {
                "name": "Test User",
                "email": "test@example.com",
                "phone": "+1234567890",
            },
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.get_table") as mock_get_table:
                # Mock event check
                mock_event_table = MagicMock()
                mock_event_table.select.return_value.eq.return_value.execute.return_value = MagicMock(
                    data=[
                        {
                            "id": "event-1",
                            "title": "Test Event",
                            "max_participants": 100,
                            "current_participants": 50,
                            "status": "published",
                        }
                    ]
                )

                # Mock registration creation
                mock_reg_table = MagicMock()
                mock_reg_table.insert.return_value.execute.return_value = MagicMock(
                    data=[
                        {
                            "id": "reg-1",
                            "event_id": "event-1",
                            "user_id": "test-user-id",
                            "status": "registered",
                            "created_at": "2024-01-01T00:00:00Z",
                        }
                    ]
                )

                # Mock event participant count update
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
                data = response.json()
                assert data["success"] is True
                assert "registration_id" in data

    def test_register_for_event_already_registered(self):
        """Test registering for an event when already registered"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        registration_data = {
            "event_id": "event-1",
            "attendee_info": {
                "name": "Test User",
                "email": "test@example.com",
                "phone": "+1234567890",
            },
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.get_table") as mock_get_table:
                # Mock existing registration check
                mock_reg_table = MagicMock()
                mock_reg_table.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(
                    data=[
                        {
                            "id": "reg-1",
                            "event_id": "event-1",
                            "user_id": "test-user-id",
                            "status": "registered",
                        }
                    ]
                )
                mock_get_table.return_value = mock_reg_table

                response = client.post(
                    "/api/events/register",
                    json=registration_data,
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 400  # Already registered

    def test_register_for_event_full(self):
        """Test registering for an event that is full"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        registration_data = {
            "event_id": "event-1",
            "attendee_info": {
                "name": "Test User",
                "email": "test@example.com",
                "phone": "+1234567890",
            },
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.get_table") as mock_get_table:
                # Mock event check (full event)
                mock_event_table = MagicMock()
                mock_event_table.select.return_value.eq.return_value.execute.return_value = MagicMock(
                    data=[
                        {
                            "id": "event-1",
                            "title": "Test Event",
                            "max_participants": 10,
                            "current_participants": 10,
                            "status": "published",
                        }
                    ]
                )
                mock_get_table.return_value = mock_event_table

                response = client.post(
                    "/api/events/register",
                    json=registration_data,
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 400  # Event is full

    def test_unregister_from_event_success(self):
        """Test unregistering from an event successfully"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.get_table") as mock_get_table:
                # Mock registration deletion
                mock_reg_table = MagicMock()
                mock_reg_table.delete.return_value.eq.return_value.eq.return_value.execute.return_value = (
                    MagicMock()
                )

                # Mock event participant count update
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
                data = response.json()
                assert data["success"] is True

    def test_get_event_registrations_organizer_success(self):
        """Test getting event registrations for organizer"""
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

                # Mock registrations data
                mock_reg_table = MagicMock()
                mock_reg_table.select.return_value.eq.return_value.execute.return_value = MagicMock(
                    data=[
                        {
                            "id": "reg-1",
                            "event_id": "event-1",
                            "user_id": "user-1",
                            "status": "registered",
                            "attendee_info": {
                                "name": "User 1",
                                "email": "user1@example.com",
                            },
                            "created_at": "2024-01-01T00:00:00Z",
                        },
                        {
                            "id": "reg-2",
                            "event_id": "event-1",
                            "user_id": "user-2",
                            "status": "registered",
                            "attendee_info": {
                                "name": "User 2",
                                "email": "user2@example.com",
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
                data = response.json()
                assert len(data) == 2
                assert data[0]["user_id"] == "user-1"

    def test_get_event_registrations_unauthorized(self):
        """Test getting event registrations when not organizer"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
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

                response = client.get(
                    "/api/events/event-1/registrations",
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 403  # Forbidden

    def test_get_user_registrations_success(self):
        """Test getting user's event registrations"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.get_table") as mock_get_table:
                mock_reg_table = MagicMock()
                mock_reg_table.select.return_value.eq.return_value.execute.return_value = MagicMock(
                    data=[
                        {
                            "id": "reg-1",
                            "event_id": "event-1",
                            "status": "registered",
                            "events": {
                                "title": "Test Event 1",
                                "date": "2024-01-01T00:00:00Z",
                            },
                        },
                        {
                            "id": "reg-2",
                            "event_id": "event-2",
                            "status": "registered",
                            "events": {
                                "title": "Test Event 2",
                                "date": "2024-01-02T00:00:00Z",
                            },
                        },
                    ]
                )
                mock_get_table.return_value = mock_reg_table

                response = client.get(
                    "/api/users/registrations",
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 200
                data = response.json()
                assert len(data) == 2
                assert data[0]["event_id"] == "event-1"

    def test_update_registration_status_success(self):
        """Test updating registration status (organizer only)"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        update_data = {"status": "confirmed"}

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

                # Mock registration update
                mock_reg_table = MagicMock()
                mock_reg_table.update.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(
                    data=[
                        {
                            "id": "reg-1",
                            "event_id": "event-1",
                            "user_id": "user-1",
                            "status": "confirmed",
                        }
                    ]
                )

                def mock_get_table_side_effect(table_name):
                    if table_name == "events":
                        return mock_event_table
                    else:
                        return mock_reg_table

                mock_get_table.side_effect = mock_get_table_side_effect

                response = client.put(
                    "/api/events/event-1/registrations/reg-1",
                    json=update_data,
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 200
                data = response.json()
                assert data["status"] == "confirmed"
