"""
Performance tests for API endpoints
"""

import concurrent.futures
import json
import os
import sys
import time
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from main import app

client = TestClient(app)


class TestPerformanceAPI:
    """Performance tests for API endpoints"""

    def test_events_list_performance(self):
        """Test events list endpoint performance under load"""
        with patch("config.database.get_table") as mock_get_table:
            # Mock large dataset
            mock_events = [
                {
                    "id": f"event-{i}",
                    "title": f"Event {i}",
                    "description": f"Description for event {i}",
                    "location": f"Location {i}",
                    "category": "music",
                    "date": (datetime.now() + timedelta(days=i)).isoformat(),
                    "status": "published",
                }
                for i in range(1000)
            ]

            mock_table = MagicMock()
            mock_table.select.return_value.execute.return_value = MagicMock(
                data=mock_events
            )
            mock_get_table.return_value = mock_table

            # Test response time
            start_time = time.time()
            response = client.get("/api/events")
            end_time = time.time()

            response_time = end_time - start_time

            assert response.status_code == 200
            assert response_time < 2.0  # Should respond within 2 seconds
            assert len(response.json()) == 1000

    def test_search_performance_with_large_dataset(self):
        """Test search endpoint performance with large dataset"""
        with patch("config.database.get_table") as mock_get_table:
            # Mock large search results
            mock_events = [
                {
                    "id": f"event-{i}",
                    "title": f"Music Event {i}",
                    "description": f"Music description {i}",
                    "location": f"Venue {i}",
                    "category": "music",
                    "date": (datetime.now() + timedelta(days=i)).isoformat(),
                    "status": "published",
                }
                for i in range(500)
            ]

            mock_table = MagicMock()
            mock_table.select.return_value.or_.return_value.execute.return_value = (
                MagicMock(data=mock_events)
            )
            mock_get_table.return_value = mock_table

            start_time = time.time()
            response = client.get("/api/events/search?q=music")
            end_time = time.time()

            response_time = end_time - start_time

            assert response.status_code == 200
            assert response_time < 1.5  # Search should be faster than full list
            assert len(response.json()) == 500

    def test_concurrent_requests_performance(self):
        """Test API performance under concurrent requests"""
        with patch("config.database.get_table") as mock_get_table:
            mock_table = MagicMock()
            mock_table.select.return_value.execute.return_value = MagicMock(
                data=[
                    {
                        "id": "event-1",
                        "title": "Test Event",
                        "description": "Test Description",
                        "location": "Test Location",
                        "category": "music",
                        "date": "2024-01-01T00:00:00Z",
                        "status": "published",
                    }
                ]
            )
            mock_get_table.return_value = mock_table

            def make_request():
                start_time = time.time()
                response = client.get("/api/events")
                end_time = time.time()
                return {
                    "status_code": response.status_code,
                    "response_time": end_time - start_time,
                }

            # Run 10 concurrent requests
            with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
                futures = [executor.submit(make_request) for _ in range(10)]
                results = [
                    future.result()
                    for future in concurrent.futures.as_completed(futures)
                ]

            # Verify all requests succeeded
            assert all(result["status_code"] == 200 for result in results)

            # Verify response times are reasonable
            response_times = [result["response_time"] for result in results]
            avg_response_time = sum(response_times) / len(response_times)
            max_response_time = max(response_times)

            assert avg_response_time < 1.0  # Average should be under 1 second
            assert max_response_time < 2.0  # Max should be under 2 seconds

    def test_user_registration_performance(self):
        """Test user registration endpoint performance"""
        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_user = {
                "id": "test-user-id",
                "email": "test@example.com",
                "name": "Test User",
            }
            mock_auth.return_value = mock_user

            with patch("config.database.get_table") as mock_get_table:
                mock_table = MagicMock()
                mock_table.select.return_value.eq.return_value.execute.return_value = (
                    MagicMock(data=[])
                )
                mock_table.insert.return_value.execute.return_value = MagicMock(
                    data=[
                        {
                            "user_id": "test-user-id",
                            "email": "test@example.com",
                            "name": "Test User",
                        }
                    ]
                )
                mock_get_table.return_value = mock_table

                onboarding_data = {
                    "city": "New York",
                    "interests": ["music", "sports"],
                    "preferences": {
                        "email_notifications": True,
                        "event_reminders": True,
                    },
                }

                start_time = time.time()
                response = client.post(
                    "/api/users/onboarding",
                    json=onboarding_data,
                    headers={"Authorization": "Bearer valid-token"},
                )
                end_time = time.time()

                response_time = end_time - start_time

                assert response.status_code == 200
                assert (
                    response_time < 1.0
                )  # Registration should complete within 1 second

    def test_event_creation_performance(self):
        """Test event creation endpoint performance"""
        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_user = {
                "id": "test-user-id",
                "email": "test@example.com",
                "name": "Test User",
            }
            mock_auth.return_value = mock_user

            with patch("config.database.get_table") as mock_get_table:
                mock_table = MagicMock()
                mock_table.insert.return_value.execute.return_value = MagicMock(
                    data=[
                        {
                            "id": "event-1",
                            "organizer_id": "test-user-id",
                            "title": "Test Event",
                            "description": "Test Description",
                            "status": "draft",
                        }
                    ]
                )
                mock_get_table.return_value = mock_table

                event_data = {
                    "title": "Test Event",
                    "description": "Test Description",
                    "location": "Test Location",
                    "date": (datetime.now() + timedelta(days=30)).isoformat(),
                    "category": "music",
                    "price": 25.00,
                }

                start_time = time.time()
                response = client.post(
                    "/api/events",
                    json=event_data,
                    headers={"Authorization": "Bearer valid-token"},
                )
                end_time = time.time()

                response_time = end_time - start_time

                assert response.status_code == 200
                assert (
                    response_time < 1.5
                )  # Event creation should complete within 1.5 seconds

    def test_pagination_performance(self):
        """Test pagination performance with large datasets"""
        with patch("config.database.get_table") as mock_get_table:
            # Mock large dataset for pagination
            mock_table = MagicMock()
            mock_table.select.return_value.count.return_value.execute.return_value = (
                MagicMock(data=[{"count": 5000}])
            )
            mock_table.select.return_value.range.return_value.execute.return_value = (
                MagicMock(
                    data=[
                        {
                            "id": f"event-{i}",
                            "title": f"Event {i}",
                            "description": f"Description {i}",
                            "location": f"Location {i}",
                            "category": "music",
                            "date": "2024-01-01T00:00:00Z",
                            "status": "published",
                        }
                        for i in range(20)
                    ]  # Page size of 20
                )
            )
            mock_get_table.return_value = mock_table

            start_time = time.time()
            response = client.get("/api/events?page=1&limit=20")
            end_time = time.time()

            response_time = end_time - start_time

            assert response.status_code == 200
            assert response_time < 1.0  # Pagination should be fast
            data = response.json()
            assert len(data["events"]) == 20
            assert data["pagination"]["total"] == 5000

    def test_filter_performance_with_multiple_criteria(self):
        """Test filtering performance with multiple criteria"""
        with patch("config.database.get_table") as mock_get_table:
            mock_table = MagicMock()
            mock_table.select.return_value.eq.return_value.eq.return_value.gte.return_value.lte.return_value.execute.return_value = MagicMock(
                data=[
                    {
                        "id": f"event-{i}",
                        "title": f"Event {i}",
                        "category": "music",
                        "date": "2024-06-01T00:00:00Z",
                        "price": 25.00,
                        "status": "published",
                    }
                    for i in range(100)
                ]
            )
            mock_get_table.return_value = mock_table

            start_time = time.time()
            response = client.get(
                "/api/events?category=music&min_price=20&max_price=30&start_date=2024-06-01&end_date=2024-06-30"
            )
            end_time = time.time()

            response_time = end_time - start_time

            assert response.status_code == 200
            assert response_time < 1.0  # Complex filtering should still be fast
            assert len(response.json()) == 100

    def test_notification_performance(self):
        """Test notification system performance"""
        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_user = {
                "id": "test-user-id",
                "email": "test@example.com",
                "name": "Test User",
            }
            mock_auth.return_value = mock_user

            with patch("config.database.get_table") as mock_get_table:
                # Mock many notifications
                mock_table = MagicMock()
                mock_table.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(
                    data=[
                        {
                            "id": f"notif-{i}",
                            "user_id": "test-user-id",
                            "type": "event_reminder",
                            "title": f"Notification {i}",
                            "message": f"Message {i}",
                            "read": False,
                            "created_at": "2024-01-01T00:00:00Z",
                        }
                        for i in range(500)
                    ]
                )
                mock_get_table.return_value = mock_table

                start_time = time.time()
                response = client.get(
                    "/api/notifications",
                    headers={"Authorization": "Bearer valid-token"},
                )
                end_time = time.time()

                response_time = end_time - start_time

                assert response.status_code == 200
                assert response_time < 1.5  # Notification retrieval should be fast
                assert len(response.json()) == 500

    def test_analytics_performance(self):
        """Test analytics endpoint performance"""
        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_user = {
                "id": "test-user-id",
                "email": "test@example.com",
                "name": "Test User",
            }
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
                        {
                            "status": "registered",
                            "created_at": "2024-01-01T00:00:00Z",
                        }
                        for _ in range(1000)
                    ]
                )

                def mock_get_table_side_effect(table_name):
                    if table_name == "events":
                        return mock_event_table
                    else:
                        return mock_reg_table

                mock_get_table.side_effect = mock_get_table_side_effect

                start_time = time.time()
                response = client.get(
                    "/api/events/event-1/analytics",
                    headers={"Authorization": "Bearer valid-token"},
                )
                end_time = time.time()

                response_time = end_time - start_time

                assert response.status_code == 200
                assert (
                    response_time < 2.0
                )  # Analytics can be slower but should still be reasonable
                data = response.json()
                assert "total_registrations" in data
                assert data["total_registrations"] == 1000

    def test_memory_usage_stability(self):
        """Test that memory usage remains stable during repeated requests"""
        with patch("config.database.get_table") as mock_get_table:
            mock_table = MagicMock()
            mock_table.select.return_value.execute.return_value = MagicMock(
                data=[
                    {
                        "id": "event-1",
                        "title": "Test Event",
                        "description": "Test Description",
                        "location": "Test Location",
                        "category": "music",
                        "date": "2024-01-01T00:00:00Z",
                        "status": "published",
                    }
                ]
            )
            mock_get_table.return_value = mock_table

            # Make multiple requests to test memory stability
            response_times = []
            for i in range(50):
                start_time = time.time()
                response = client.get("/api/events")
                end_time = time.time()

                response_times.append(end_time - start_time)
                assert response.status_code == 200

            # Check that response times don't degrade significantly
            avg_first_half = sum(response_times[:25]) / 25
            avg_second_half = sum(response_times[25:]) / 25

            # Response times shouldn't degrade by more than 50%
            degradation_ratio = avg_second_half / avg_first_half
            assert (
                degradation_ratio < 1.5
            ), f"Performance degraded: {degradation_ratio:.2f}x"
