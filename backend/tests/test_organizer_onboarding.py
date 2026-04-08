"""
Test cases for organizer onboarding API endpoints
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


class TestOrganizerOnboardingAPI:
    """Test organizer onboarding API endpoints"""

    def test_complete_organizer_onboarding_success(self):
        """Test completing organizer onboarding successfully"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        onboarding_data = {
            "phone": "+1234567890",
            "phone_country_code": "+1",
            "address": "123 Test St",
            "city": "Test City",
            "state_province": "Test State",
            "zip_pin": "12345",
            "country": "Test Country",
            "business_name": "Test Business",
            "business_type": "business",
            "description": "Test business description",
            "event_types": ["music", "sports"],
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.get_table") as mock_get_table:
                mock_table = MagicMock()

                # Mock user profile update
                mock_table.update.return_value.eq.return_value.execute.return_value = (
                    MagicMock(
                        data=[
                            {
                                "user_id": "test-user-id",
                                "email": "test@example.com",
                                "phone": "+1234567890",
                                "address": "123 Test St",
                                "city": "Test City",
                                "state_province": "Test State",
                                "zip_pin": "12345",
                                "country": "Test Country",
                            }
                        ]
                    )
                )

                # Mock organizer profile creation
                mock_organizer_table = MagicMock()
                mock_organizer_table.insert.return_value.execute.return_value = (
                    MagicMock(
                        data=[
                            {
                                "id": "organizer-1",
                                "user_id": "test-user-id",
                                "business_name": "Test Business",
                                "business_type": "business",
                                "description": "Test business description",
                                "event_types": ["music", "sports"],
                            }
                        ]
                    )
                )

                mock_get_table.side_effect = lambda table_name: (
                    mock_organizer_table
                    if table_name == "organizer_profiles"
                    else mock_table
                )

                response = client.post(
                    "/api/users/organizer-onboarding",
                    json=onboarding_data,
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 200
                data = response.json()
                assert data["success"] is True
                assert "message" in data

    def test_complete_organizer_onboarding_missing_required_fields(self):
        """Test organizer onboarding with missing required fields"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        incomplete_data = {
            "phone": "+1234567890",
            # Missing address, city, state, zip, country, event_types
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            response = client.post(
                "/api/users/organizer-onboarding",
                json=incomplete_data,
                headers={"Authorization": "Bearer valid-token"},
            )

            assert response.status_code == 422  # Validation error

    def test_complete_organizer_onboarding_unauthorized(self):
        """Test organizer onboarding without authentication"""
        onboarding_data = {
            "phone": "+1234567890",
            "phone_country_code": "+1",
            "address": "123 Test St",
            "city": "Test City",
            "state_province": "Test State",
            "zip_pin": "12345",
            "country": "Test Country",
            "business_name": "Test Business",
            "business_type": "business",
            "description": "Test business description",
            "event_types": ["music", "sports"],
        }

        response = client.post("/api/users/organizer-onboarding", json=onboarding_data)

        assert response.status_code == 401  # Unauthorized

    def test_complete_organizer_onboarding_database_error(self):
        """Test organizer onboarding with database error"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        onboarding_data = {
            "phone": "+1234567890",
            "phone_country_code": "+1",
            "address": "123 Test St",
            "city": "Test City",
            "state_province": "Test State",
            "zip_pin": "12345",
            "country": "Test Country",
            "business_name": "Test Business",
            "business_type": "business",
            "description": "Test business description",
            "event_types": ["music", "sports"],
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.get_table") as mock_get_table:
                mock_table = MagicMock()
                mock_table.update.return_value.eq.return_value.execute.side_effect = (
                    Exception("Database error")
                )
                mock_get_table.return_value = mock_table

                response = client.post(
                    "/api/users/organizer-onboarding",
                    json=onboarding_data,
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 500

    def test_get_organizer_profile_success(self):
        """Test getting organizer profile successfully"""
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
                                "id": "organizer-1",
                                "user_id": "test-user-id",
                                "business_name": "Test Business",
                                "business_type": "business",
                                "description": "Test business description",
                                "event_types": ["music", "sports"],
                                "verified": True,
                            }
                        ]
                    )
                )
                mock_get_table.return_value = mock_table

                response = client.get(
                    "/api/users/organizer-profile",
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 200
                data = response.json()
                assert data["business_name"] == "Test Business"
                assert data["business_type"] == "business"
                assert data["verified"] is True

    def test_get_organizer_profile_not_found(self):
        """Test getting organizer profile when not found"""
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
                    MagicMock(data=[])
                )
                mock_get_table.return_value = mock_table

                response = client.get(
                    "/api/users/organizer-profile",
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 404

    def test_update_organizer_profile_success(self):
        """Test updating organizer profile successfully"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        update_data = {
            "business_name": "Updated Business",
            "description": "Updated description",
            "event_types": ["music", "arts"],
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.get_table") as mock_get_table:
                mock_table = MagicMock()
                mock_table.update.return_value.eq.return_value.execute.return_value = (
                    MagicMock(
                        data=[
                            {
                                "id": "organizer-1",
                                "user_id": "test-user-id",
                                "business_name": "Updated Business",
                                "description": "Updated description",
                                "event_types": ["music", "arts"],
                            }
                        ]
                    )
                )
                mock_get_table.return_value = mock_table

                response = client.put(
                    "/api/users/organizer-profile",
                    json=update_data,
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 200
                data = response.json()
                assert data["business_name"] == "Updated Business"
                assert data["description"] == "Updated description"

    def test_delete_organizer_profile_success(self):
        """Test deleting organizer profile successfully"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.get_table") as mock_get_table:
                mock_table = MagicMock()
                mock_table.delete.return_value.eq.return_value.execute.return_value = (
                    MagicMock()
                )
                mock_get_table.return_value = mock_table

                response = client.delete(
                    "/api/users/organizer-profile",
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 200
