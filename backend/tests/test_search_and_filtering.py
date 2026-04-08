"""
Test cases for search and filtering API endpoints
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


class TestSearchAndFilteringAPI:
    """Test search and filtering API endpoints"""

    def test_search_events_by_keyword_success(self):
        """Test searching events by keyword successfully"""
        with patch("config.database.get_table") as mock_get_table:
            mock_table = MagicMock()
            mock_table.select.return_value.or_.return_value.execute.return_value = (
                MagicMock(
                    data=[
                        {
                            "id": "event-1",
                            "title": "Music Concert",
                            "description": "Live music performance",
                            "location": "Concert Hall",
                            "category": "music",
                            "date": "2024-01-01T00:00:00Z",
                            "status": "published",
                        },
                        {
                            "id": "event-2",
                            "title": "Music Festival",
                            "description": "Multi-day music event",
                            "location": "Park",
                            "category": "music",
                            "date": "2024-01-02T00:00:00Z",
                            "status": "published",
                        },
                    ]
                )
            )
            mock_get_table.return_value = mock_table

            response = client.get("/api/events/search?q=music")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert "music" in data[0]["title"].lower()

    def test_search_events_by_location_success(self):
        """Test searching events by location successfully"""
        with patch("config.database.get_table") as mock_get_table:
            mock_table = MagicMock()
            mock_table.select.return_value.ilike.return_value.execute.return_value = (
                MagicMock(
                    data=[
                        {
                            "id": "event-1",
                            "title": "NYC Marathon",
                            "description": "Annual marathon event",
                            "location": "New York City",
                            "category": "sports",
                            "date": "2024-01-01T00:00:00Z",
                            "status": "published",
                        },
                    ]
                )
            )
            mock_get_table.return_value = mock_table

            response = client.get("/api/events/search?location=new+york")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert "new york" in data[0]["location"].lower()

    def test_filter_events_by_category_success(self):
        """Test filtering events by category successfully"""
        with patch("config.database.get_table") as mock_get_table:
            mock_table = MagicMock()
            mock_table.select.return_value.eq.return_value.execute.return_value = (
                MagicMock(
                    data=[
                        {
                            "id": "event-1",
                            "title": "Jazz Night",
                            "description": "Jazz music evening",
                            "location": "Jazz Club",
                            "category": "music",
                            "date": "2024-01-01T00:00:00Z",
                            "status": "published",
                        },
                    ]
                )
            )
            mock_get_table.return_value = mock_table

            response = client.get("/api/events?category=music")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["category"] == "music"

    def test_filter_events_by_date_range_success(self):
        """Test filtering events by date range successfully"""
        with patch("config.database.get_table") as mock_get_table:
            mock_table = MagicMock()
            mock_table.select.return_value.gte.return_value.lte.return_value.execute.return_value = MagicMock(
                data=[
                    {
                        "id": "event-1",
                        "title": "Summer Festival",
                        "description": "Summer music festival",
                        "location": "Beach",
                        "category": "music",
                        "date": "2024-06-15T00:00:00Z",
                        "status": "published",
                    },
                ]
            )
            mock_get_table.return_value = mock_table

            response = client.get(
                "/api/events?start_date=2024-06-01&end_date=2024-06-30"
            )

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert "2024-06-15" in data[0]["date"]

    def test_filter_events_by_price_range_success(self):
        """Test filtering events by price range successfully"""
        with patch("config.database.get_table") as mock_get_table:
            mock_table = MagicMock()
            mock_table.select.return_value.gte.return_value.lte.return_value.execute.return_value = MagicMock(
                data=[
                    {
                        "id": "event-1",
                        "title": "Free Concert",
                        "description": "Free outdoor concert",
                        "location": "Park",
                        "category": "music",
                        "date": "2024-01-01T00:00:00Z",
                        "price": 0.00,
                        "status": "published",
                    },
                ]
            )
            mock_get_table.return_value = mock_table

            response = client.get("/api/events?min_price=0&max_price=50")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["price"] == 0.00

    def test_filter_events_by_multiple_criteria_success(self):
        """Test filtering events by multiple criteria successfully"""
        with patch("config.database.get_table") as mock_get_table:
            mock_table = MagicMock()
            mock_table.select.return_value.eq.return_value.eq.return_value.gte.return_value.lte.return_value.execute.return_value = MagicMock(
                data=[
                    {
                        "id": "event-1",
                        "title": "Sports Tournament",
                        "description": "Competitive sports event",
                        "location": "Stadium",
                        "category": "sports",
                        "date": "2024-01-01T00:00:00Z",
                        "price": 25.00,
                        "max_participants": 100,
                        "status": "published",
                    },
                ]
            )
            mock_get_table.return_value = mock_table

            response = client.get(
                "/api/events?category=sports&min_price=20&max_price=30&max_participants=150"
            )

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["category"] == "sports"
            assert 20 <= data[0]["price"] <= 30

    def test_get_popular_events_success(self):
        """Test getting popular events successfully"""
        with patch("config.database.get_table") as mock_get_table:
            mock_table = MagicMock()
            mock_table.select.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(
                data=[
                    {
                        "id": "event-1",
                        "title": "Popular Concert",
                        "description": "Very popular concert",
                        "location": "Arena",
                        "category": "music",
                        "date": "2024-01-01T00:00:00Z",
                        "current_participants": 500,
                        "max_participants": 1000,
                        "status": "published",
                    },
                ]
            )
            mock_get_table.return_value = mock_table

            response = client.get("/api/events/popular")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["current_participants"] == 500

    def test_get_upcoming_events_success(self):
        """Test getting upcoming events successfully"""
        with patch("config.database.get_table") as mock_get_table:
            mock_table = MagicMock()
            mock_table.select.return_value.gte.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(
                data=[
                    {
                        "id": "event-1",
                        "title": "Future Event",
                        "description": "Event happening soon",
                        "location": "Venue",
                        "category": "music",
                        "date": (datetime.now() + timedelta(days=7)).isoformat(),
                        "status": "published",
                    },
                ]
            )
            mock_get_table.return_value = mock_table

            response = client.get("/api/events/upcoming")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1

    def test_get_events_by_organizer_success(self):
        """Test getting events by specific organizer"""
        with patch("config.database.get_table") as mock_get_table:
            mock_table = MagicMock()
            mock_table.select.return_value.eq.return_value.execute.return_value = (
                MagicMock(
                    data=[
                        {
                            "id": "event-1",
                            "title": "Organizer Event 1",
                            "description": "First event by organizer",
                            "location": "Venue 1",
                            "organizer_id": "organizer-1",
                            "category": "music",
                            "date": "2024-01-01T00:00:00Z",
                            "status": "published",
                        },
                        {
                            "id": "event-2",
                            "title": "Organizer Event 2",
                            "description": "Second event by organizer",
                            "location": "Venue 2",
                            "organizer_id": "organizer-1",
                            "category": "sports",
                            "date": "2024-01-02T00:00:00Z",
                            "status": "published",
                        },
                    ]
                )
            )
            mock_get_table.return_value = mock_table

            response = client.get("/api/events/organizer/organizer-1")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert all(event["organizer_id"] == "organizer-1" for event in data)

    def test_advanced_search_with_filters_success(self):
        """Test advanced search with multiple filters"""
        search_data = {
            "query": "music",
            "category": "music",
            "location": "new york",
            "price_range": {"min": 0, "max": 100},
            "date_range": {"start": "2024-01-01", "end": "2024-12-31"},
            "sort_by": "date",
            "sort_order": "asc",
        }

        with patch("config.database.get_table") as mock_get_table:
            mock_table = MagicMock()
            mock_table.select.return_value.or_.return_value.eq.return_value.ilike.return_value.gte.return_value.lte.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(
                data=[
                    {
                        "id": "event-1",
                        "title": "NYC Music Festival",
                        "description": "Music festival in New York",
                        "location": "New York City",
                        "category": "music",
                        "date": "2024-06-01T00:00:00Z",
                        "price": 50.00,
                        "status": "published",
                    },
                ]
            )
            mock_get_table.return_value = mock_table

            response = client.post("/api/events/advanced-search", json=search_data)

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert "music" in data[0]["title"].lower()
            assert "new york" in data[0]["location"].lower()

    def test_get_event_suggestions_success(self):
        """Test getting event suggestions based on user preferences"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.get_table") as mock_get_table:
                # Mock user preferences
                mock_pref_table = MagicMock()
                mock_pref_table.select.return_value.eq.return_value.execute.return_value = MagicMock(
                    data=[
                        {
                            "user_id": "test-user-id",
                            "preferred_categories": ["music", "sports"],
                            "preferred_locations": ["new york", "boston"],
                        }
                    ]
                )

                # Mock suggested events
                mock_event_table = MagicMock()
                mock_event_table.select.return_value.in_.return_value.in_.return_value.limit.return_value.execute.return_value = MagicMock(
                    data=[
                        {
                            "id": "event-1",
                            "title": "NYC Concert",
                            "description": "Music concert in NYC",
                            "location": "New York",
                            "category": "music",
                            "date": "2024-01-01T00:00:00Z",
                            "status": "published",
                        },
                    ]
                )

                def mock_get_table_side_effect(table_name):
                    if table_name == "user_preferences":
                        return mock_pref_table
                    else:
                        return mock_event_table

                mock_get_table.side_effect = mock_get_table_side_effect

                response = client.get(
                    "/api/events/suggestions",
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 200
                data = response.json()
                assert len(data) == 1
                assert data[0]["category"] == "music"

    def test_search_events_with_pagination_success(self):
        """Test searching events with pagination"""
        with patch("config.database.get_table") as mock_get_table:
            mock_table = MagicMock()
            mock_table.select.return_value.or_.return_value.count.return_value.execute.return_value = MagicMock(
                data=[{"count": 50}]
            )
            mock_table.select.return_value.or_.return_value.range.return_value.execute.return_value = MagicMock(
                data=[
                    {
                        "id": "event-1",
                        "title": "Music Event 1",
                        "description": "First music event",
                        "location": "Venue 1",
                        "category": "music",
                        "date": "2024-01-01T00:00:00Z",
                        "status": "published",
                    },
                    {
                        "id": "event-2",
                        "title": "Music Event 2",
                        "description": "Second music event",
                        "location": "Venue 2",
                        "category": "music",
                        "date": "2024-01-02T00:00:00Z",
                        "status": "published",
                    },
                ]
            )
            mock_get_table.return_value = mock_table

            response = client.get("/api/events/search?q=music&page=1&limit=10")

            assert response.status_code == 200
            data = response.json()
            assert "events" in data
            assert "pagination" in data
            assert len(data["events"]) == 2
            assert data["pagination"]["total"] == 50
            assert data["pagination"]["page"] == 1
            assert data["pagination"]["limit"] == 10

    def test_get_event_categories_success(self):
        """Test getting available event categories"""
        with patch("config.database.get_table") as mock_get_table:
            mock_table = MagicMock()
            mock_table.select.return_value.execute.return_value = MagicMock(
                data=[
                    {"category": "music", "count": 25},
                    {"category": "sports", "count": 18},
                    {"category": "arts", "count": 12},
                ]
            )
            mock_get_table.return_value = mock_table

            response = client.get("/api/events/categories")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 3
            assert data[0]["category"] == "music"
            assert data[0]["count"] == 25

    def test_get_event_locations_success(self):
        """Test getting available event locations"""
        with patch("config.database.get_table") as mock_get_table:
            mock_table = MagicMock()
            mock_table.select.return_value.execute.return_value = MagicMock(
                data=[
                    {"location": "New York", "count": 30},
                    {"location": "Boston", "count": 15},
                    {"location": "Chicago", "count": 10},
                ]
            )
            mock_get_table.return_value = mock_table

            response = client.get("/api/events/locations")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 3
            assert data[0]["location"] == "New York"
            assert data[0]["count"] == 30
