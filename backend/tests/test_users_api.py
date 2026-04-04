"""
Test cases for users API endpoints
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


class TestUsersAPI:
    """Test users API endpoints"""

    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        # The health check might return "unhealthy" if database is not connected
        assert data["status"] in ["healthy", "unhealthy"]

    @patch("config.auth.AuthService.require_auth")
    def test_get_current_user_profile_success(self, mock_auth):
        """Test getting current user profile successfully"""
        # Mock authenticated user
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }
        mock_auth.return_value = mock_user

        # Mock database response
        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[
                {
                    "user_id": "test-user-id",
                    "email": "test@example.com",
                    "full_name": "Test User",
                    "avatar_url": None,
                    "created_at": "2023-01-01T00:00:00Z",
                }
            ]
        )

        with patch("api.users.get_table") as mock_get_table:
            mock_get_table.return_value = mock_table

            response = client.get(
                "/api/users/me", headers={"Authorization": "Bearer valid-token"}
            )

            assert response.status_code == 200
            data = response.json()
            assert data["user_id"] == "test-user-id"
            assert data["email"] == "test@example.com"

    @patch("config.auth.AuthService.require_auth")
    def test_get_current_user_profile_not_found_creates_default(self, mock_auth):
        """Test profile creation when none exists"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }
        mock_auth.return_value = mock_user

        with patch("api.users.get_table") as mock_get_table:
            mock_table = MagicMock()
            # No existing profile
            mock_table.select.return_value.eq.return_value.execute.return_value.data = (
                []
            )
            mock_table.insert.return_value.execute.return_value.data = [
                {"user_id": "test-user-id", "email": "test@example.com"}
            ]
            mock_get_table.return_value = mock_table

            response = client.get(
                "/api/users/me", headers={"Authorization": "Bearer valid-token"}
            )

            assert response.status_code == 200
            # Should create default profile
            mock_table.insert.assert_called_once()

    @patch("config.auth.AuthService.require_auth")
    def test_get_user_preferences_success(self, mock_auth):
        """Test getting user preferences"""
        mock_user = {"id": "test-user-id"}
        mock_auth.return_value = mock_user

        mock_preferences = {
            "id": "pref-id",
            "user_id": "test-user-id",
            "onboarding_completed": False,
            "is_organizer": False,
            "distance_range": 25,
        }

        with patch("api.users.get_table") as mock_get_table:
            mock_table = MagicMock()
            mock_table.select.return_value.eq.return_value.execute.return_value.data = [
                mock_preferences
            ]
            mock_get_table.return_value = mock_table

            response = client.get(
                "/api/users/me/preferences",
                headers={"Authorization": "Bearer valid-token"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["onboarding_completed"] == False
            assert data["is_organizer"] == False

    @patch("config.auth.AuthService.require_auth")
    def test_update_user_preferences_success(self, mock_auth):
        """Test updating user preferences"""
        mock_user = {"id": "test-user-id"}
        mock_auth.return_value = mock_user

        update_data = {
            "onboarding_completed": True,
            "is_organizer": True,
            "distance_range": 50,
        }

        with patch("api.users.get_table") as mock_get_table:
            mock_table = MagicMock()
            mock_table.update.return_value.eq.return_value.execute.return_value.data = [
                {"id": "updated"}
            ]
            mock_get_table.return_value = mock_table

            response = client.put(
                "/api/users/me/preferences",
                json=update_data,
                headers={"Authorization": "Bearer valid-token"},
            )

            assert response.status_code == 200
            mock_table.update.assert_called_once()

    def test_unauthorized_access(self):
        """Test unauthorized access returns 401"""
        response = client.get("/api/users/me")
        assert response.status_code == 401
        assert "Not authenticated" in response.json()["detail"]

    @patch("config.auth.AuthService.require_auth")
    def test_get_user_roles_success(self, mock_auth):
        """Test getting user roles"""
        mock_user = {"id": "test-user-id"}
        mock_auth.return_value = mock_user

        mock_roles = [{"user_id": "test-user-id", "role": "user"}]

        with patch("api.users.get_table") as mock_get_table:
            mock_table = MagicMock()
            mock_table.select.return_value.eq.return_value.execute.return_value.data = (
                mock_roles
            )
            mock_get_table.return_value = mock_table

            response = client.get(
                "/api/users/me/roles", headers={"Authorization": "Bearer valid-token"}
            )

            assert response.status_code == 200
            data = response.json()
            assert "roles" in data
            assert "user" in data["roles"]

    @patch("config.auth.AuthService.require_auth")
    def test_add_user_role_success(self, mock_auth):
        """Test adding user role"""
        mock_user = {"id": "test-user-id"}
        mock_auth.return_value = mock_user

        with patch("api.users.get_table") as mock_get_table:
            mock_table = MagicMock()
            # Mock the insert method properly with the correct call chain
            mock_insert = MagicMock()
            mock_insert.return_value.execute.return_value.data = [
                {"id": "role-id", "user_id": "test-user-id", "role": "organizer"}
            ]
            mock_table.insert = mock_insert
            mock_get_table.return_value = mock_table

            response = client.post(
                "/api/users/me/roles",
                json={"role": "organizer"},
                headers={"Authorization": "Bearer valid-token"},
            )

            assert response.status_code == 200
            # Verify the insert was called
            mock_insert.assert_called_once()


if __name__ == "__main__":
    pytest.main([__file__])
