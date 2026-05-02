"""
Tests for the Pricing Inventory API endpoints.
"""

import os
import sys
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch
from uuid import uuid4

import jwt
import pytest
from fastapi.testclient import TestClient

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from main import app


# Create a valid JWT token for testing
def create_test_token(user_id: str = None) -> str:
    """Create a valid JWT token for testing"""
    if user_id is None:
        user_id = str(uuid4())

    os.environ["JWT_SECRET_KEY"] = "test-secret-key-that-is-long-enough-for-sha256"
    os.environ["JWT_ALGORITHM"] = "HS256"

    payload = {
        "sub": user_id,
        "email": "test@example.com",
        "role": "authenticated",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "iat": datetime.now(timezone.utc),
    }

    token = jwt.encode(
        payload, "test-secret-key-that-is-long-enough-for-sha256", algorithm="HS256"
    )
    return token


client = TestClient(app)


class TestUpdateInventory:
    """Tests for POST /api/pricing/inventory"""

    @pytest.fixture
    def mock_user_id(self):
        return str(uuid4())

    @pytest.fixture
    def mock_user_token(self, mock_user_id):
        return create_test_token(mock_user_id)

    @pytest.fixture
    def mock_event_id(self):
        return uuid4()

    @pytest.fixture
    def mock_pricing_rule(self, mock_user_id, mock_event_id):
        return {
            "id": str(uuid4()),
            "event_id": str(mock_event_id),
            "organizer_id": str(mock_user_id),
            "max_capacity": 100,
            "is_active": True,
        }

    @pytest.fixture
    def valid_inventory_data(self, mock_event_id):
        return {
            "event_id": str(mock_event_id),
            "tickets_sold": 45,
        }

    def test_update_inventory_success(
        self,
        mock_user_token,
        mock_user_id,
        mock_event_id,
        mock_pricing_rule,
        valid_inventory_data,
    ):
        """Should update inventory successfully and create snapshot."""
        with (
            patch("api.pricing_inventory.fetch_records") as mock_fetch,
            patch("api.pricing_inventory.insert_record") as mock_insert,
        ):
            mock_fetch.return_value = [mock_pricing_rule]
            mock_insert.return_value = {
                "id": str(uuid4()),
                "event_id": str(mock_event_id),
                "tickets_sold": 45,
                "tickets_remaining": 55,
                "occupancy_percent": 45.0,
                "reported_by": str(mock_user_id),
                "reported_at": datetime.now(timezone.utc).isoformat(),
            }

            response = client.post(
                "/api/pricing/inventory",
                json=valid_inventory_data,
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 201
            data = response.json()
            assert data["event_id"] == str(mock_event_id)
            assert data["tickets_sold"] == 45
            assert data["tickets_remaining"] == 55
            assert data["occupancy_percent"] == 45.0

    def test_update_inventory_full_capacity(
        self, mock_user_token, mock_user_id, mock_event_id, mock_pricing_rule
    ):
        """Should handle full capacity correctly."""
        inventory_data = {
            "event_id": str(mock_event_id),
            "tickets_sold": 100,  # Full capacity
        }

        with (
            patch("api.pricing_inventory.fetch_records") as mock_fetch,
            patch("api.pricing_inventory.insert_record") as mock_insert,
        ):
            mock_fetch.return_value = [mock_pricing_rule]
            mock_insert.return_value = {
                "id": str(uuid4()),
                "event_id": str(mock_event_id),
                "tickets_sold": 100,
                "tickets_remaining": 0,
                "occupancy_percent": 100.0,
                "reported_by": str(mock_user_id),
                "reported_at": datetime.now(timezone.utc).isoformat(),
            }

            response = client.post(
                "/api/pricing/inventory",
                json=inventory_data,
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 201
            data = response.json()
            assert data["tickets_sold"] == 100
            assert data["tickets_remaining"] == 0
            assert data["occupancy_percent"] == 100.0

    def test_update_inventory_zero_sales(
        self, mock_user_token, mock_user_id, mock_event_id, mock_pricing_rule
    ):
        """Should handle zero ticket sales correctly."""
        inventory_data = {
            "event_id": str(mock_event_id),
            "tickets_sold": 0,  # No sales yet
        }

        with (
            patch("api.pricing_inventory.fetch_records") as mock_fetch,
            patch("api.pricing_inventory.insert_record") as mock_insert,
        ):
            mock_fetch.return_value = [mock_pricing_rule]
            mock_insert.return_value = {
                "id": str(uuid4()),
                "event_id": str(mock_event_id),
                "tickets_sold": 0,
                "tickets_remaining": 100,
                "occupancy_percent": 0.0,
                "reported_by": str(mock_user_id),
                "reported_at": datetime.now(timezone.utc).isoformat(),
            }

            response = client.post(
                "/api/pricing/inventory",
                json=inventory_data,
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 201
            data = response.json()
            assert data["tickets_sold"] == 0
            assert data["tickets_remaining"] == 100
            assert data["occupancy_percent"] == 0.0

    def test_update_inventory_exceeds_capacity(
        self, mock_user_token, mock_user_id, mock_event_id, mock_pricing_rule
    ):
        """Should return 400 when tickets_sold exceeds capacity."""
        inventory_data = {
            "event_id": str(mock_event_id),
            "tickets_sold": 150,  # Exceeds capacity of 100
        }

        with (patch("api.pricing_inventory.fetch_records") as mock_fetch,):
            mock_fetch.return_value = [mock_pricing_rule]

            response = client.post(
                "/api/pricing/inventory",
                json=inventory_data,
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 400
            assert "cannot exceed capacity" in response.json()["detail"]

    def test_update_inventory_no_pricing_rule(
        self, mock_user_token, mock_user_id, mock_event_id, valid_inventory_data
    ):
        """Should return 404 when no pricing rule exists."""
        with (patch("api.pricing_inventory.fetch_records") as mock_fetch,):
            mock_fetch.return_value = []  # No pricing rules found

            response = client.post(
                "/api/pricing/inventory",
                json=valid_inventory_data,
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 404

    def test_update_inventory_access_denied(
        self, mock_user_token, mock_event_id, valid_inventory_data
    ):
        """Should return 404 when user doesn't own the event."""
        with (patch("api.pricing_inventory.fetch_records") as mock_fetch,):
            mock_fetch.return_value = []  # No pricing rules for this user

            response = client.post(
                "/api/pricing/inventory",
                json=valid_inventory_data,
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 404

    def test_update_inventory_database_error(
        self,
        mock_user_token,
        mock_user_id,
        mock_event_id,
        mock_pricing_rule,
        valid_inventory_data,
    ):
        """Should return 500 when database operation fails."""
        with (
            patch("api.pricing_inventory.fetch_records") as mock_fetch,
            patch("api.pricing_inventory.insert_record") as mock_insert,
        ):
            mock_fetch.return_value = [mock_pricing_rule]
            mock_insert.return_value = None  # Simulate database failure

            response = client.post(
                "/api/pricing/inventory",
                json=valid_inventory_data,
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 500

    def test_update_inventory_validation_errors(self, mock_user_token):
        """Should return 422 for invalid inventory data."""
        # Test negative tickets_sold
        invalid_data = {
            "event_id": str(uuid4()),
            "tickets_sold": -5,  # Invalid: negative
        }

        response = client.post(
            "/api/pricing/inventory",
            json=invalid_data,
            headers={"Authorization": f"Bearer {mock_user_token}"},
        )
        assert response.status_code == 422

    def test_update_inventory_unauthorized(self, valid_inventory_data):
        """Should return 401 for unauthorized requests."""
        response = client.post("/api/pricing/inventory", json=valid_inventory_data)
        assert response.status_code == 401


class TestGetInventoryHistory:
    """Tests for GET /api/pricing/inventory/{event_id}/history"""

    @pytest.fixture
    def mock_user_id(self):
        return str(uuid4())

    @pytest.fixture
    def mock_user_token(self, mock_user_id):
        return create_test_token(mock_user_id)

    @pytest.fixture
    def mock_event_id(self):
        return uuid4()

    @pytest.fixture
    def mock_pricing_rule(self, mock_user_id, mock_event_id):
        return {
            "id": str(uuid4()),
            "event_id": str(mock_event_id),
            "organizer_id": str(mock_user_id),
        }

    @pytest.fixture
    def mock_inventory_snapshots(self, mock_event_id):
        return [
            {
                "id": str(uuid4()),
                "event_id": str(mock_event_id),
                "tickets_sold": 45,
                "tickets_remaining": 55,
                "occupancy_percent": 45.0,
                "reported_by": str(uuid4()),
                "reported_at": datetime.now(timezone.utc).isoformat(),
            },
            {
                "id": str(uuid4()),
                "event_id": str(mock_event_id),
                "tickets_sold": 40,
                "tickets_remaining": 60,
                "occupancy_percent": 40.0,
                "reported_by": str(uuid4()),
                "reported_at": (
                    datetime.now(timezone.utc) - timedelta(hours=1)
                ).isoformat(),
            },
            {
                "id": str(uuid4()),
                "event_id": str(mock_event_id),
                "tickets_sold": 35,
                "tickets_remaining": 65,
                "occupancy_percent": 35.0,
                "reported_by": str(uuid4()),
                "reported_at": (
                    datetime.now(timezone.utc) - timedelta(hours=2)
                ).isoformat(),
            },
        ]

    def test_get_inventory_history_success(
        self,
        mock_user_token,
        mock_user_id,
        mock_event_id,
        mock_pricing_rule,
        mock_inventory_snapshots,
    ):
        """Should return inventory history for the event."""
        with (patch("api.pricing_inventory.fetch_records") as mock_fetch,):
            mock_fetch.side_effect = [
                [mock_pricing_rule],  # Pricing rules check
                mock_inventory_snapshots,  # Inventory snapshots
            ]

            response = client.get(
                f"/api/pricing/inventory/{mock_event_id}/history",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert len(data["snapshots"]) == 3
            assert data["latest_occupancy"] == 45.0
            assert data["latest_remaining"] == 55
            assert data["snapshots"][0]["tickets_sold"] == 45  # Most recent first

    def test_get_inventory_history_empty(
        self, mock_user_token, mock_user_id, mock_event_id, mock_pricing_rule
    ):
        """Should return empty history when no snapshots exist."""
        with (patch("api.pricing_inventory.fetch_records") as mock_fetch,):
            mock_fetch.side_effect = [
                [mock_pricing_rule],  # Pricing rules check
                [],  # No inventory snapshots
            ]

            response = client.get(
                f"/api/pricing/inventory/{mock_event_id}/history",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert len(data["snapshots"]) == 0
            assert data["latest_occupancy"] is None
            assert data["latest_remaining"] is None

    def test_get_inventory_history_no_pricing_rule(
        self, mock_user_token, mock_user_id, mock_event_id
    ):
        """Should return 404 when no pricing rule exists."""
        with (patch("api.pricing_inventory.fetch_records") as mock_fetch,):
            mock_fetch.return_value = []  # No pricing rules found

            response = client.get(
                f"/api/pricing/inventory/{mock_event_id}/history",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 404

    def test_get_inventory_history_access_denied(self, mock_user_token, mock_event_id):
        """Should return 404 when user doesn't own the event."""
        with (patch("api.pricing_inventory.fetch_records") as mock_fetch,):
            mock_fetch.return_value = []  # No pricing rules for this user

            response = client.get(
                f"/api/pricing/inventory/{mock_event_id}/history",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 404

    def test_get_inventory_history_unauthorized(self, mock_event_id):
        """Should return 401 for unauthorized requests."""
        response = client.get(f"/api/pricing/inventory/{mock_event_id}/history")
        assert response.status_code == 401


class TestGetCurrentInventory:
    """Tests for GET /api/pricing/inventory/{event_id}/current"""

    @pytest.fixture
    def mock_user_id(self):
        return str(uuid4())

    @pytest.fixture
    def mock_user_token(self, mock_user_id):
        return create_test_token(mock_user_id)

    @pytest.fixture
    def mock_event_id(self):
        return uuid4()

    @pytest.fixture
    def mock_pricing_rule(self, mock_user_id, mock_event_id):
        return {
            "id": str(uuid4()),
            "event_id": str(mock_event_id),
            "organizer_id": str(mock_user_id),
        }

    @pytest.fixture
    def mock_current_snapshot(self, mock_event_id):
        return {
            "id": str(uuid4()),
            "event_id": str(mock_event_id),
            "tickets_sold": 67,
            "tickets_remaining": 33,
            "occupancy_percent": 67.0,
            "reported_by": str(uuid4()),
            "reported_at": datetime.now(timezone.utc).isoformat(),
        }

    def test_get_current_inventory_success(
        self,
        mock_user_token,
        mock_user_id,
        mock_event_id,
        mock_pricing_rule,
        mock_current_snapshot,
    ):
        """Should return the most recent inventory snapshot."""
        with (patch("api.pricing_inventory.fetch_records") as mock_fetch,):
            mock_fetch.side_effect = [
                [mock_pricing_rule],  # Pricing rules check
                [mock_current_snapshot],  # Current inventory
            ]

            response = client.get(
                f"/api/pricing/inventory/{mock_event_id}/current",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["event_id"] == str(mock_event_id)
            assert data["tickets_sold"] == 67
            assert data["tickets_remaining"] == 33
            assert data["occupancy_percent"] == 67.0

    def test_get_current_inventory_no_data(
        self, mock_user_token, mock_user_id, mock_event_id, mock_pricing_rule
    ):
        """Should return 404 when no inventory data exists."""
        with (patch("api.pricing_inventory.fetch_records") as mock_fetch,):
            mock_fetch.side_effect = [
                [mock_pricing_rule],  # Pricing rules check
                [],  # No inventory snapshots
            ]

            response = client.get(
                f"/api/pricing/inventory/{mock_event_id}/current",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 404
            assert "No inventory data found" in response.json()["detail"]

    def test_get_current_inventory_no_pricing_rule(
        self, mock_user_token, mock_user_id, mock_event_id
    ):
        """Should return 404 when no pricing rule exists."""
        with (patch("api.pricing_inventory.fetch_records") as mock_fetch,):
            mock_fetch.return_value = []  # No pricing rules found

            response = client.get(
                f"/api/pricing/inventory/{mock_event_id}/current",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 404

    def test_get_current_inventory_access_denied(self, mock_user_token, mock_event_id):
        """Should return 404 when user doesn't own the event."""
        with (patch("api.pricing_inventory.fetch_records") as mock_fetch,):
            mock_fetch.return_value = []  # No pricing rules for this user

            response = client.get(
                f"/api/pricing/inventory/{mock_event_id}/current",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 404

    def test_get_current_inventory_unauthorized(self, mock_event_id):
        """Should return 401 for unauthorized requests."""
        response = client.get(f"/api/pricing/inventory/{mock_event_id}/current")
        assert response.status_code == 401


class TestInventoryModels:
    """Tests for Pydantic models in pricing inventory."""

    def test_update_inventory_request_model(self):
        """Test UpdateInventoryRequest model validation."""
        from api.pricing_inventory import UpdateInventoryRequest

        # Valid request
        request = UpdateInventoryRequest(
            event_id=uuid4(),
            tickets_sold=50,
        )
        assert request.tickets_sold == 50

        # Invalid request (should raise validation errors)
        with pytest.raises(ValueError):
            UpdateInventoryRequest(
                event_id=uuid4(),
                tickets_sold=-5,  # Invalid: negative
            )

    def test_inventory_snapshot_response_model(self):
        """Test InventorySnapshotResponse model creation."""
        from api.pricing_inventory import InventorySnapshotResponse

        snapshot = InventorySnapshotResponse(
            id=uuid4(),
            event_id=uuid4(),
            tickets_sold=45,
            tickets_remaining=55,
            occupancy_percent=45.0,
            reported_by=uuid4(),
            reported_at=datetime.now(timezone.utc).isoformat(),
        )
        assert snapshot.tickets_sold == 45
        assert snapshot.tickets_remaining == 55
        assert snapshot.occupancy_percent == 45.0

    def test_inventory_history_response_model(self):
        """Test InventoryHistoryResponse model creation."""
        from api.pricing_inventory import (
            InventoryHistoryResponse,
            InventorySnapshotResponse,
        )

        snapshot = InventorySnapshotResponse(
            id=uuid4(),
            event_id=uuid4(),
            tickets_sold=45,
            tickets_remaining=55,
            occupancy_percent=45.0,
            reported_by=uuid4(),
            reported_at=datetime.now(timezone.utc).isoformat(),
        )

        history = InventoryHistoryResponse(
            snapshots=[snapshot],
            latest_occupancy=45.0,
            latest_remaining=55,
        )
        assert len(history.snapshots) == 1
        assert history.latest_occupancy == 45.0
        assert history.latest_remaining == 55

        # Empty history
        empty_history = InventoryHistoryResponse(
            snapshots=[],
            latest_occupancy=None,
            latest_remaining=None,
        )
        assert len(empty_history.snapshots) == 0
        assert empty_history.latest_occupancy is None
