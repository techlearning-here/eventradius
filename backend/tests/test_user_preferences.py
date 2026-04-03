"""
Tests for user preferences API endpoints
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import json

from main import app
from config.auth import get_current_user


client = TestClient(app)


# Mock user for testing
MOCK_USER = {
    "id": "test-user-id",
    "email": "test@example.com",
    "role": "authenticated"
}


@pytest.fixture
def mock_auth():
    """Mock authentication dependency"""
    def override_get_current_user():
        return MOCK_USER
    return override_get_current_user


@pytest.fixture
def authenticated_client(mock_auth):
    """Client with mocked authentication"""
    app.dependency_overrides[get_current_user] = mock_auth
    yield client
    app.dependency_overrides.clear()


class TestUserPreferences:
    """Test user preferences endpoints"""

    @patch('config.database.get_table')
    def test_get_user_preferences_existing(self, mock_get_table, authenticated_client):
        """Test getting existing user preferences"""
        # Mock existing preferences
        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{
                "user_id": "test-user-id",
                "age_range": "25-34",
                "has_kids": False,
                "interests": ["music", "sports"],
                "city": "New York, NY",
                "latitude": 40.7128,
                "longitude": -74.0060,
                "distance_range": 25,
                "onboarding_completed": True
            }]
        )
        mock_get_table.return_value = mock_table
        
        response = authenticated_client.get("/api/users/me/preferences")
        
        assert response.status_code == 200
        data = response.json()
        assert data["onboarding_completed"] is True
        assert data["city"] == "New York, NY"
        assert data["interests"] == ["music", "sports"]

    @patch('config.database.get_table')
    @patch('config.database.insert_record')
    def test_get_user_preferences_creates_default(self, mock_insert, mock_get_table, authenticated_client):
        """Test getting preferences creates default when none exist"""
        # Mock no existing preferences
        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[]
        )
        mock_get_table.return_value = mock_table
        
        # Mock insert result
        mock_insert.return_value = MagicMock()
        
        response = authenticated_client.get("/api/users/me/preferences")
        
        assert response.status_code == 200
        data = response.json()
        assert data["onboarding_completed"] is False
        assert data["distance_range"] == 25
        assert data["has_kids"] is False
        
        # Verify insert was called with default values
        mock_insert.assert_called_once()
        call_args = mock_insert.call_args[0]
        assert call_args[0] == "user_preferences"
        assert call_args[1]["user_id"] == "test-user-id"
        assert call_args[1]["onboarding_completed"] is False

    @patch('config.database.get_table')
    def test_update_user_preferences_existing(self, mock_get_table, authenticated_client):
        """Test updating existing user preferences"""
        # Mock existing preferences
        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{
                "user_id": "test-user-id",
                "onboarding_completed": False
            }]
        )
        mock_table.update.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{
                "user_id": "test-user-id",
                "age_range": "25-34",
                "has_kids": False,
                "interests": ["music"],
                "city": "Boston, MA",
                "latitude": 42.3601,
                "longitude": -71.0589,
                "distance_range": 50,
                "onboarding_completed": True
            }]
        )
        mock_get_table.return_value = mock_table
        
        update_data = {
            "age_range": "25-34",
            "interests": ["music"],
            "city": "Boston, MA",
            "latitude": 42.3601,
            "longitude": -71.0589,
            "distance_range": 50,
            "onboarding_completed": True
        }
        
        response = authenticated_client.put("/api/users/me/preferences", json=update_data)
        
        assert response.status_code == 200
        assert response.json()["message"] == "Preferences updated successfully"
        
        # Verify update was called correctly
        mock_table.update.assert_called_once_with(update_data)
        mock_table.update.return_value.eq.assert_called_once_with("user_id", "test-user-id")

    @patch('config.database.get_table')
    @patch('config.database.insert_record')
    def test_update_user_preferences_creates_new(self, mock_insert, mock_get_table, authenticated_client):
        """Test updating preferences creates new record when none exists"""
        # Mock no existing preferences
        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[]
        )
        mock_get_table.return_value = mock_table
        
        # Mock insert result
        mock_insert.return_value = MagicMock()
        
        update_data = {
            "age_range": "35-44",
            "has_kids": True,
            "interests": ["sports", "family"],
            "city": "Chicago, IL",
            "latitude": 41.8781,
            "longitude": -87.6298,
            "distance_range": 30,
            "onboarding_completed": True
        }
        
        response = authenticated_client.put("/api/users/me/preferences", json=update_data)
        
        assert response.status_code == 200
        assert response.json()["message"] == "Preferences updated successfully"
        
        # Verify insert was called with correct data
        mock_insert.assert_called_once()
        call_args = mock_insert.call_args[0]
        assert call_args[0] == "user_preferences"
        assert call_args[1]["user_id"] == "test-user-id"
        assert call_args[1]["onboarding_completed"] is True
        assert call_args[1]["city"] == "Chicago, IL"

    @patch('config.database.get_table')
    def test_debug_preferences_endpoint(self, mock_get_table, authenticated_client):
        """Test the debug preferences endpoint"""
        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{
                "user_id": "test-user-id",
                "onboarding_completed": True,
                "city": "Test City"
            }]
        )
        mock_get_table.return_value = mock_table
        
        response = authenticated_client.get("/api/users/debug/preferences")
        
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == "test-user-id"
        assert data["count"] == 1
        assert data["onboarding_completed"] is True
        assert len(data["preferences"]) == 1
        assert data["preferences"][0]["city"] == "Test City"


class TestUserRoles:
    """Test user roles endpoints"""

    @patch('config.database.get_table')
    @patch('config.database.insert_record')
    def test_add_user_role_new_role(self, mock_insert, mock_get_table, authenticated_client):
        """Test adding a new role to user"""
        # Mock no existing role
        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[]
        )
        mock_get_table.return_value = mock_table
        
        response = authenticated_client.post("/api/users/me/roles", json={"role": "organizer"})
        
        assert response.status_code == 200
        assert response.json()["message"] == "Role added successfully"
        
        # Verify insert was called
        mock_insert.assert_called_once()
        call_args = mock_insert.call_args[0]
        assert call_args[0] == "user_roles"
        assert call_args[1]["user_id"] == "test-user-id"
        assert call_args[1]["role"] == "organizer"

    @patch('config.database.get_table')
    def test_add_user_role_existing(self, mock_get_table, authenticated_client):
        """Test adding an existing role to user"""
        # Mock existing role
        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{"user_id": "test-user-id", "role": "user"}]
        )
        mock_get_table.return_value = mock_table
        
        response = authenticated_client.post("/api/users/me/roles", json={"role": "user"})
        
        assert response.status_code == 200
        assert response.json()["message"] == "Role already exists"

    def test_add_user_role_invalid_request(self, authenticated_client):
        """Test adding role with invalid request"""
        response = authenticated_client.post("/api/users/me/roles", json={})
        
        assert response.status_code == 400
        assert "Role is required" in response.json()["detail"]
