"""
Integration test for Event Wizard to Event Details round-trip.

This test verifies that all event data collected in the EventWizard
is properly passed to the backend, stored in the database, and
retrieved correctly on the Event Details page without data loss.

IMPORTANT: This test file mocks all Supabase/database interactions.
No actual calls are made to the Supabase instance. The mocks are set up at:
- config.auth.AuthService.require_auth - for authentication
- api.events.insert_record - for event creation
- api.events.get_table - for event retrieval
- conftest.py fixtures - for auto-mocking SupabaseClient

To run: pytest tests/integration/test_event_wizard_roundtrip.py -v
"""

import json
import os
import sys
from datetime import datetime, timedelta
from unittest.mock import ANY, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))

from main import app

client = TestClient(app)


class TestEventWizardRoundTrip:
    """
    Test complete round-trip of event data from wizard to details page.

    This ensures:
    1. All fields from EventWizard are accepted by the API
    2. All fields are stored in the database
    3. All fields are returned when retrieving the event
    4. No data is lost during the round-trip
    """

    @patch("config.auth.AuthService.require_auth")
    def test_complete_event_wizard_roundtrip(self, mock_auth):
        """
        Test that all event wizard fields survive the complete round-trip.

        This test creates an event with all possible attributes and verifies
        that every single field is preserved when retrieved.
        """
        mock_user = {"id": "test-organizer-id"}
        mock_auth.return_value = mock_user

        # Complete event data as sent from EventWizard via CreateEvent.tsx
        complete_event_data = {
            # Core fields
            "title": "Community Yoga for Seniors",
            "subtitle": "Gentle morning yoga session",
            "summary": "Join us for a relaxing morning yoga session designed specifically for seniors.",
            "description": "This gentle yoga session focuses on mobility and flexibility.",
            "category": "wellness",
            "language": "en",
            # Event Type & Format
            "event_type": "in_person",
            "event_format": "single",
            "event_privacy": "public",
            "is_paid_event": False,
            "status": "published",
            # Date & Time
            "start_time": (datetime.now() + timedelta(days=7)).isoformat(),
            "end_time": (datetime.now() + timedelta(days=7, hours=1)).isoformat(),
            "timezone": "America/Los_Angeles",
            # Location & Venue
            "location": "Community Center, 123 Main St, San Francisco, CA 94102, USA",
            "venue_address": "123 Main St",
            "venue_street": "123 Main St",
            "venue_city": "San Francisco",
            "venue_state": "CA",
            "venue_zip_code": "94102",
            "venue_country": "USA",
            "venue_building_name": "Community Center",
            # Contact Info
            "event_contact_email": "yoga@communitycenter.org",
            "event_contact_phone": "5551234567",
            "event_contact_phone_country_code": "+1",
            # Capacity
            "max_participants": 25,
            "is_public": True,
            # Audience & Demographics
            "age_categories": ["seniors_65_plus", "50_plus", "adults"],
            "gender_preference": "all",
            "family_friendly": False,
            "senior_friendly": True,
            "singles_friendly": True,
            "couples_oriented": False,
            # Accessibility
            "wheelchair_accessible": True,
            "mobility_friendly": True,
            "hearing_accessible": True,
            "vision_accessible": False,
            "sensory_friendly": False,
            "service_animals_allowed": True,
            "accessibility_notes": "Wheelchair ramp at entrance. Accessible restrooms available.",
            # Cultural Context
            "religious_context": ["secular", "interfaith"],
            "dietary_context": ["vegetarian", "vegan", "gluten_free"],
            "traditional_attire": "optional",
            # Prerequisites
            "skill_level": "beginner",
            "prior_experience": "none_required",
            "physical_fitness": "light_activity",
            "equipment_required": ["yoga_mat", "comfortable_clothing"],
            "dress_code": "sportswear",
            "prerequisites_notes": "No prior yoga experience needed.",
            # Content & Intensity
            "content_rating": "all_ages",
            "alcohol_served": "no_alcohol",
            "smoking_policy": "non_smoking",
            "noise_level": "quiet",
            "physical_intensity": "low",
            # Social Features
            "networking_focus": True,
            "social_mixer": True,
            "ice_breakers": True,
            "group_activities": True,
            "team_building": False,
            # Language
            "primary_language": "english",
            "secondary_languages": ["spanish"],
            "interpretation_available": False,
            "sign_language_interpreter": True,
            # Pricing
            "refund_policy": "no_refunds",
            "custom_refund_policy": "Free event, no refunds applicable",
            "group_discounts": False,
            "ticket_pricing_description": "This is a free community event",
            # Format & Type
            "format": "single_session",
            "sub_category": "yoga_fitness",
            # Media
            "image_url": "https://example.com/yoga-event.jpg",
        }

        # Mock the insert_record to capture what was sent and return it with an ID
        with patch("api.events.insert_record") as mock_insert:
            # Create a simple class to act as the response
            class MockResponse:
                def __init__(self, data):
                    self.data = data

            created_at = datetime.now().isoformat()
            mock_insert.return_value = MockResponse(
                [
                    {
                        **complete_event_data,
                        "id": "test-event-id-123",
                        "organizer_id": "test-organizer-id",
                        "created_at": created_at,
                        "updated_at": created_at,
                        "current_participants": 0,
                    }
                ]
            )

            # Create the event via API
            response = client.post(
                "/api/events",
                json=complete_event_data,
                headers={"Authorization": "Bearer valid-token"},
            )

            # Verify the API accepted the request
            assert response.status_code == 200

            # Verify insert_record was called with all fields
            assert mock_insert.called
            call_args = mock_insert.call_args
            assert call_args[0][0] == "events"
            inserted_data = call_args[0][1]

            # Verify all fields were passed to the database
            for key, value in complete_event_data.items():
                assert key in inserted_data, f"Field '{key}' was not passed to database"
                assert inserted_data[key] == value, f"Field '{key}' mismatch"

            created_event = response.json()

            # Verify the response contains all the fields
            for key in complete_event_data.keys():
                assert (
                    key in created_event
                ), f"Field '{key}' missing from create response"

    @patch("config.auth.AuthService.require_auth")
    def test_event_retrieval_preserves_all_fields(self, mock_auth):
        """Test that get_event returns all fields stored in the database."""
        mock_user = {"id": "test-organizer-id"}
        mock_auth.return_value = mock_user

        complete_event_data = {
            "id": "test-event-id-456",
            "title": "Tech Networking Mixer",
            "subtitle": "Connect with local tech professionals",
            "summary": "Evening networking event for software engineers and product managers.",
            "description": "Join us for an evening of networking with local tech professionals.",
            "category": "networking",
            "language": "en",
            "event_type": "in_person",
            "event_format": "single",
            "event_privacy": "public",
            "is_paid_event": True,
            "status": "published",
            "start_time": (datetime.now() + timedelta(days=14)).isoformat(),
            "end_time": (datetime.now() + timedelta(days=14, hours=3)).isoformat(),
            "timezone": "America/New_York",
            "location": "Tech Hub, 456 Innovation Dr, New York, NY 10001, USA",
            "venue_street": "456 Innovation Dr",
            "venue_city": "New York",
            "venue_state": "NY",
            "venue_zip_code": "10001",
            "venue_country": "USA",
            "event_contact_email": "events@techhub.com",
            "event_contact_phone": "5559876543",
            "event_contact_phone_country_code": "+1",
            "max_participants": 100,
            "is_public": True,
            "age_categories": ["adults", "young_adults"],
            "gender_preference": "all",
            "family_friendly": False,
            "senior_friendly": False,
            "singles_friendly": True,
            "couples_oriented": False,
            "wheelchair_accessible": True,
            "mobility_friendly": True,
            "hearing_accessible": False,
            "vision_accessible": False,
            "sensory_friendly": False,
            "service_animals_allowed": True,
            "accessibility_notes": "Elevator access to 3rd floor.",
            "religious_context": ["secular"],
            "dietary_context": ["vegetarian", "vegan"],
            "traditional_attire": "not_applicable",
            "skill_level": "all_levels",
            "prior_experience": "none_required",
            "physical_fitness": "sedentary",
            "equipment_required": ["business_cards"],
            "dress_code": "business_casual",
            "prerequisites_notes": "Bring business cards for networking.",
            "content_rating": "adults_only",
            "alcohol_served": "bar_available",
            "smoking_policy": "non_smoking",
            "noise_level": "moderate",
            "physical_intensity": "none",
            "networking_focus": True,
            "social_mixer": True,
            "ice_breakers": True,
            "group_activities": False,
            "team_building": False,
            "primary_language": "english",
            "secondary_languages": [],
            "interpretation_available": False,
            "sign_language_interpreter": False,
            "refund_policy": "refund_up_to_24_hours",
            "custom_refund_policy": None,
            "group_discounts": True,
            "ticket_pricing_description": "$25 per person, group discounts available",
            "format": "networking_event",
            "sub_category": "tech_networking",
            "image_url": "https://example.com/tech-event.jpg",
            "ticketing_website": "https://tickets.example.com/tech-mixer",
            "organizer_id": "test-organizer-id",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }

        with patch("api.events.get_table") as mock_get_table:
            # Mock events table
            mock_table = MagicMock()
            mock_query = MagicMock()
            mock_response = MagicMock()
            mock_response.data = [complete_event_data]

            mock_table.select.return_value = mock_query
            mock_query.eq.return_value = mock_query
            mock_query.is_.return_value = mock_query
            mock_query.execute.return_value = mock_response

            # Mock event_participants table
            mock_participants_table = MagicMock()
            mock_participants_response = MagicMock()
            mock_participants_response.count = 15
            mock_participants_table.select.return_value.eq.return_value.execute.return_value = (
                mock_participants_response
            )

            def get_table_side_effect(table_name):
                if table_name == "events":
                    return mock_table
                elif table_name == "event_participants":
                    return mock_participants_table
                return MagicMock()

            mock_get_table.side_effect = get_table_side_effect

            response = client.get(
                "/api/events/test-event-id-456",
                headers={"Authorization": "Bearer valid-token"},
            )

            assert response.status_code == 200

            retrieved_event = response.json()

            # Verify all attribute fields are present in the response
            attribute_fields = [
                # Audience & Demographics
                "age_categories",
                "gender_preference",
                "family_friendly",
                "senior_friendly",
                "singles_friendly",
                "couples_oriented",
                # Accessibility
                "wheelchair_accessible",
                "mobility_friendly",
                "hearing_accessible",
                "vision_accessible",
                "sensory_friendly",
                "service_animals_allowed",
                "accessibility_notes",
                # Cultural
                "religious_context",
                "dietary_context",
                "traditional_attire",
                # Prerequisites
                "skill_level",
                "prior_experience",
                "physical_fitness",
                "equipment_required",
                "dress_code",
                "prerequisites_notes",
                # Content
                "content_rating",
                "alcohol_served",
                "smoking_policy",
                "noise_level",
                "physical_intensity",
                # Social
                "networking_focus",
                "social_mixer",
                "ice_breakers",
                "group_activities",
                "team_building",
                # Language
                "primary_language",
                "secondary_languages",
                "interpretation_available",
                "sign_language_interpreter",
                # Pricing
                "refund_policy",
                "group_discounts",
                # Contact & Venue
                "event_contact_email",
                "event_contact_phone",
                "event_contact_phone_country_code",
                "venue_street",
                "venue_city",
                "venue_state",
                "venue_zip_code",
                "venue_country",
            ]

            for field in attribute_fields:
                assert (
                    field in retrieved_event
                ), f"Attribute field '{field}' missing from get_event response"
                expected_value = complete_event_data.get(field)
                actual_value = retrieved_event.get(field)
                assert (
                    actual_value == expected_value
                ), f"Field '{field}' mismatch: expected {expected_value}, got {actual_value}"

    @patch("config.auth.AuthService.require_auth")
    def test_paid_event_with_all_attributes(self, mock_auth):
        """Test paid event creation with all attributes preserved."""
        mock_user = {"id": "test-organizer-id"}
        mock_auth.return_value = mock_user

        paid_event_data = {
            "title": "Advanced Python Workshop",
            "subtitle": "Master modern Python patterns",
            "description": "Intensive 2-day workshop on advanced Python programming.",
            "category": "education",
            "is_paid_event": True,
            "ticketing_website": "https://tickets.example.com/python-workshop",
            "ticket_pricing_description": "$299 early bird, $349 regular",
            "event_type": "in_person",
            "event_format": "multi_date",
            "status": "published",
            "start_time": (datetime.now() + timedelta(days=30)).isoformat(),
            "end_time": (datetime.now() + timedelta(days=31)).isoformat(),
            "location": "Tech Academy, 789 Learning Blvd, Seattle, WA 98101, USA",
            "venue_street": "789 Learning Blvd",
            "venue_city": "Seattle",
            "venue_state": "WA",
            "venue_zip_code": "98101",
            "venue_country": "USA",
            "max_participants": 30,
            "is_public": True,
            "age_categories": ["adults", "young_adults"],
            "gender_preference": "all",
            "skill_level": "advanced",
            "prior_experience": "expert_level",
            "refund_policy": "refund_up_to_7_days",
            "group_discounts": True,
            "networking_focus": True,
            "content_rating": "adults_only",
        }

        with patch("api.events.insert_record") as mock_insert:

            class MockResponse:
                def __init__(self, data):
                    self.data = data

            created_at = datetime.now().isoformat()
            mock_insert.return_value = MockResponse(
                [
                    {
                        **paid_event_data,
                        "id": "paid-event-id-789",
                        "organizer_id": "test-organizer-id",
                        "created_at": created_at,
                        "updated_at": created_at,
                        "current_participants": 0,
                    }
                ]
            )

            response = client.post(
                "/api/events",
                json=paid_event_data,
                headers={"Authorization": "Bearer valid-token"},
            )

            assert response.status_code == 200

            data = response.json()
            assert data["is_paid_event"] is True
            assert (
                data["ticketing_website"]
                == "https://tickets.example.com/python-workshop"
            )
            assert data["skill_level"] == "advanced"
            assert data["refund_policy"] == "refund_up_to_7_days"
            assert data["group_discounts"] is True

    @patch("config.auth.AuthService.require_auth")
    def test_draft_event_saves_all_fields(self, mock_auth):
        """Test that draft events preserve all fields for later publishing."""
        mock_user = {"id": "test-organizer-id"}
        mock_auth.return_value = mock_user

        draft_event_data = {
            "title": "Draft Music Festival",
            "subtitle": "Multi-genre music celebration",
            "description": "A draft version of our upcoming music festival.",
            "category": "entertainment",
            "status": "draft",
            "is_paid_event": True,
            "event_type": "in_person",
            "event_format": "single",
            "age_categories": ["adults", "young_adults"],
            "gender_preference": "all",
            "family_friendly": True,
            "wheelchair_accessible": True,
            "religious_context": ["secular"],
            "dietary_context": ["vegetarian", "vegan", "gluten_free"],
            "skill_level": "all_levels",
            "content_rating": "pg_13",
            "alcohol_served": "bar_available",
            "noise_level": "very_loud",
            "networking_focus": False,
            "primary_language": "english",
            "refund_policy": "no_refunds",
        }

        with patch("api.events.insert_record") as mock_insert:

            class MockResponse:
                def __init__(self, data):
                    self.data = data

            created_at = datetime.now().isoformat()
            mock_insert.return_value = MockResponse(
                [
                    {
                        **draft_event_data,
                        "id": "draft-event-id-abc",
                        "organizer_id": "test-organizer-id",
                        "created_at": created_at,
                        "updated_at": created_at,
                        "current_participants": 0,
                    }
                ]
            )

            response = client.post(
                "/api/events",
                json=draft_event_data,
                headers={"Authorization": "Bearer valid-token"},
            )

            assert response.status_code == 200

            # Verify all draft fields were preserved
            call_args = mock_insert.call_args
            inserted_data = call_args[0][1]

            assert inserted_data["status"] == "draft"
            assert inserted_data["family_friendly"] is True
            assert inserted_data["wheelchair_accessible"] is True
            assert inserted_data["religious_context"] == ["secular"]
            assert inserted_data["dietary_context"] == [
                "vegetarian",
                "vegan",
                "gluten_free",
            ]
            assert inserted_data["noise_level"] == "very_loud"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
