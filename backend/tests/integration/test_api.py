"""
Integration tests for API endpoints.
"""
import pytest
from unittest.mock import Mock, patch, AsyncMock
from fastapi.testclient import TestClient
import json
from datetime import datetime, timedelta

from main import app
from config.database import SupabaseClient


class TestHealthEndpoint:
    """Test health check endpoint."""
    
    def setup_method(self):
        """Set up test client."""
        self.client = TestClient(app)
    
    def test_health_endpoint(self):
        """Test GET /health returns healthy status."""
        with patch('config.database.SupabaseClient.test_connection', return_value=True):
            response = self.client.get("/health")
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "healthy"
            assert data["database"] == "connected"
    
    def test_health_endpoint_database_down(self):
        """Test GET /health returns database disconnected when connection fails."""
        with patch('config.database.SupabaseClient.test_connection', return_value=False):
            response = self.client.get("/health")
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "unhealthy"
            assert data["database"] == "disconnected"


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
            "organizer_id": "user-123"
        }
    
    def test_get_events_no_auth(self):
        """Test GET /api/events/ without authentication."""
        mock_events = [self.mock_event_data]
        
        with patch('api.events.fetch_records') as mock_fetch:
            mock_fetch.return_value = mock_events
            
            response = self.client.get("/api/events/")
            
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["title"] == "Test Event"
    
    def test_get_events_with_filters(self):
        """Test GET /api/events/ with query parameters."""
        mock_events = [self.mock_event_data]
        
        with patch('api.events.fetch_records') as mock_fetch:
            mock_fetch.return_value = mock_events
            
            response = self.client.get("/api/events/?category=music&limit=5&offset=0")
            
            assert response.status_code == 200
            mock_fetch.assert_called_once()
            # Check that filters were passed correctly
            call_args = mock_fetch.call_args
            assert call_args[0][0] == "events"
            assert call_args[1]["filters"] == {"category": "music"}
            assert call_args[1]["limit"] == 5
            assert call_args[1]["offset"] == 0
    
    def test_get_event_by_id(self):
        """Test GET /api/events/{event_id}."""
        with patch('api.events.fetch_single_record') as mock_fetch:
            mock_fetch.return_value = self.mock_event_data
            
            response = self.client.get("/api/events/event-123")
            
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == "event-123"
            mock_fetch.assert_called_once_with("events", "event-123")
    
    def test_get_event_not_found(self):
        """Test GET /api/events/{event_id} when event doesn't exist."""
        with patch('api.events.fetch_single_record') as mock_fetch:
            mock_fetch.return_value = None
            
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
            "max_participants": 50
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
            "max_participants": 50
        }
        
        mock_user = {"id": "user-123", "email": "test@example.com"}
        mock_insert_response = {**event_data, "id": "new-event-123", "organizer_id": "user-123"}
        
        # Mock authentication
        with patch('api.events.require_auth', return_value=mock_user):
            with patch('api.events.insert_record') as mock_insert:
                mock_insert.return_value = mock_insert_response
                
                response = self.client.post(
                    "/api/events/",
                    json=event_data,
                    headers={"Authorization": "Bearer test-token"}
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
        with patch('api.events.require_auth', return_value=mock_user):
            with patch('api.events.fetch_single_record', return_value=mock_event):
                with patch('api.events.update_record', return_value=mock_updated_event):
                    
                    response = self.client.put(
                        f"/api/events/{event_id}",
                        json=update_data,
                        headers={"Authorization": "Bearer test-token"}
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
        
        with patch('api.events.require_auth', return_value=mock_user):
            with patch('api.events.fetch_single_record', return_value=mock_event):
                
                response = self.client.put(
                    f"/api/events/{event_id}",
                    json=update_data,
                    headers={"Authorization": "Bearer test-token"}
                )
                
                assert response.status_code == 403
                data = response.json()
                assert "detail" in data
    
    def test_delete_event(self):
        """Test DELETE /api/events/{event_id}."""
        event_id = "event-123"
        
        mock_user = {"id": "user-123"}
        mock_event = {**self.mock_event_data, "organizer_id": "user-123"}
        
        with patch('api.events.require_auth', return_value=mock_user):
            with patch('api.events.fetch_single_record', return_value=mock_event):
                with patch('api.events.delete_record', return_value=True):
                    
                    response = self.client.delete(
                        f"/api/events/{event_id}",
                        headers={"Authorization": "Bearer test-token"}
                    )
                    
                    assert response.status_code == 200
                    data = response.json()
                    assert data["message"] == "Event deleted successfully"
    
    def test_participate_event(self):
        """Test POST /api/events/{event_id}/participate."""
        event_id = "event-123"
        
        mock_user = {"id": "user-456"}
        mock_event = {**self.mock_event_data, "current_participants": 10, "max_participants": 100}
        
        with patch('api.events.require_auth', return_value=mock_user):
            with patch('api.events.fetch_single_record', return_value=mock_event):
                with patch('api.events.insert_record', return_value={"event_id": event_id, "user_id": "user-456"}):
                    with patch('api.events.update_record', return_value={**mock_event, "current_participants": 11}):
                        
                        response = self.client.post(
                            f"/api/events/{event_id}/participate",
                            headers={"Authorization": "Bearer test-token"}
                        )
                        
                        assert response.status_code == 200
                        data = response.json()
                        assert data["message"] == "Successfully joined event"
    
    def test_participate_event_full(self):
        """Test POST /api/events/{event_id}/participate when event is full."""
        event_id = "event-123"
        
        mock_user = {"id": "user-456"}
        mock_event = {**self.mock_event_data, "current_participants": 100, "max_participants": 100}
        
        with patch('api.events.require_auth', return_value=mock_user):
            with patch('api.events.fetch_single_record', return_value=mock_event):
                
                response = self.client.post(
                    f"/api/events/{event_id}/participate",
                    headers={"Authorization": "Bearer test-token"}
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
            "name": "Test User",
            "avatar_url": None,
            "created_at": datetime.utcnow().isoformat()
        }
    
    def test_get_current_user_profile(self):
        """Test GET /api/users/me."""
        mock_user = {"id": "user-123", "email": "test@example.com"}
        
        with patch('api.users.require_auth', return_value=mock_user):
            with patch('api.users.fetch_single_record') as mock_fetch:
                mock_fetch.return_value = self.mock_user_data
                
                response = self.client.get(
                    "/api/users/me",
                    headers={"Authorization": "Bearer test-token"}
                )
                
                assert response.status_code == 200
                data = response.json()
                assert data["id"] == "user-123"
                assert data["email"] == "test@example.com"
    
    def test_update_user_profile(self):
        """Test PUT /api/users/me."""
        update_data = {"name": "Updated Name", "avatar_url": "https://example.com/avatar.jpg"}
        
        mock_user = {"id": "user-123"}
        mock_updated_user = {**self.mock_user_data, **update_data}
        
        with patch('api.users.require_auth', return_value=mock_user):
            with patch('api.users.update_record', return_value=mock_updated_user):
                
                response = self.client.put(
                    "/api/users/me",
                    json=update_data,
                    headers={"Authorization": "Bearer test-token"}
                )
                
                assert response.status_code == 200
                data = response.json()
                assert data["name"] == "Updated Name"
                assert data["avatar_url"] == "https://example.com/avatar.jpg"
    
    def test_get_user_events(self):
        """Test GET /api/users/me/events."""
        mock_user = {"id": "user-123"}
        mock_events = [self.mock_event_data]
        
        with patch('api.users.require_auth', return_value=mock_user):
            with patch('api.users.fetch_records') as mock_fetch:
                mock_fetch.return_value = mock_events
                
                response = self.client.get(
                    "/api/users/me/events",
                    headers={"Authorization": "Bearer test-token"}
                )
                
                assert response.status_code == 200
                data = response.json()
                assert len(data) == 1
                assert data[0]["organizer_id"] == "user-123"