"""
Tests for the Promo Codes API endpoints.
"""

import os
import sys
from datetime import datetime, timedelta, timezone
from decimal import Decimal
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


class TestListPromoCodes:
    """Tests for GET /api/promo-codes"""

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
    def mock_pricing_rules(self, mock_user_id, mock_event_id):
        return [
            {
                "id": str(uuid4()),
                "event_id": str(mock_event_id),
                "organizer_id": str(mock_user_id),
            }
        ]

    @pytest.fixture
    def mock_promo_codes(self, mock_event_id):
        return [
            {
                "id": str(uuid4()),
                "event_id": str(mock_event_id),
                "code": "SAVE20",
                "discount_percent": 20,
                "discount_amount": None,
                "max_uses": 100,
                "times_claimed": 25,
                "times_used": 15,
                "valid_from": datetime.now(timezone.utc).isoformat(),
                "valid_until": (
                    datetime.now(timezone.utc) + timedelta(days=7)
                ).isoformat(),
                "is_active": True,
                "estimated_commission": "15.00",
            },
            {
                "id": str(uuid4()),
                "event_id": str(mock_event_id),
                "code": "EXPIRED15",
                "discount_percent": 15,
                "discount_amount": None,
                "max_uses": 50,
                "times_claimed": 50,
                "times_used": 30,
                "valid_from": (
                    datetime.now(timezone.utc) - timedelta(days=14)
                ).isoformat(),
                "valid_until": (
                    datetime.now(timezone.utc) - timedelta(days=7)
                ).isoformat(),
                "is_active": False,
                "estimated_commission": "10.50",
            },
        ]

    def test_list_all_promo_codes_success(
        self, mock_user_token, mock_user_id, mock_pricing_rules, mock_promo_codes
    ):
        """Should return all promo codes for the organizer."""
        with (patch("api.promo_codes.fetch_records") as mock_fetch,):
            mock_fetch.side_effect = [
                mock_pricing_rules,  # Pricing rules check
                mock_promo_codes,  # Promo codes
            ]

            response = client.get(
                "/api/promo-codes",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert data[0]["code"] == "SAVE20"
            assert data[1]["code"] == "EXPIRED15"

    def test_list_promo_codes_by_event(
        self, mock_user_token, mock_user_id, mock_event_id, mock_promo_codes
    ):
        """Should return promo codes for a specific event."""
        with (patch("api.promo_codes.fetch_records") as mock_fetch,):
            mock_fetch.side_effect = [
                [{"event_id": str(mock_event_id)}],  # Pricing rules for specific event
                mock_promo_codes,  # Promo codes for that event
            ]

            response = client.get(
                f"/api/promo-codes?event_id={mock_event_id}",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2

    def test_list_promo_codes_active_only(
        self, mock_user_token, mock_user_id, mock_pricing_rules
    ):
        """Should filter promo codes by active status."""
        active_promo_code = {
            "id": str(uuid4()),
            "event_id": str(uuid4()),
            "code": "ACTIVE25",
            "discount_percent": 25,
            "discount_amount": None,
            "max_uses": 100,
            "times_claimed": 10,
            "times_used": 5,
            "valid_from": datetime.now(timezone.utc).isoformat(),
            "valid_until": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "is_active": True,
            "estimated_commission": "12.50",
        }

        with (patch("api.promo_codes.fetch_records") as mock_fetch,):
            mock_fetch.side_effect = [
                mock_pricing_rules,  # Pricing rules check
                [active_promo_code],  # Only active promo codes
            ]

            response = client.get(
                "/api/promo-codes?is_active=true",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["is_active"] is True

    def test_list_promo_codes_no_events(self, mock_user_token, mock_user_id):
        """Should return empty list when organizer has no events."""
        with (patch("api.promo_codes.fetch_records") as mock_fetch,):
            mock_fetch.return_value = []  # No pricing rules

            response = client.get(
                "/api/promo-codes",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 0

    def test_list_promo_codes_event_access_denied(
        self, mock_user_token, mock_user_id, mock_event_id
    ):
        """Should return 403 when user doesn't own the event."""
        with (patch("api.promo_codes.fetch_records") as mock_fetch,):
            mock_fetch.return_value = []  # No pricing rules for this event

            response = client.get(
                f"/api/promo-codes?event_id={mock_event_id}",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 403

    def test_list_promo_codes_unauthorized(self):
        """Should return 401 for unauthorized requests."""
        response = client.get("/api/promo-codes")
        assert response.status_code == 401


class TestGetPromoCode:
    """Tests for GET /api/promo-codes/{promo_code_id}"""

    @pytest.fixture
    def mock_user_id(self):
        return str(uuid4())

    @pytest.fixture
    def mock_user_token(self, mock_user_id):
        return create_test_token(mock_user_id)

    @pytest.fixture
    def mock_promo_code(self, mock_user_id):
        return {
            "id": str(uuid4()),
            "event_id": str(uuid4()),
            "code": "TEST20",
            "discount_percent": 20,
            "discount_amount": None,
            "max_uses": 100,
            "times_claimed": 25,
            "times_used": 15,
            "valid_from": datetime.now(timezone.utc).isoformat(),
            "valid_until": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "is_active": True,
            "commission_percent": "5.00",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

    def test_get_promo_code_success(
        self, mock_user_token, mock_user_id, mock_promo_code
    ):
        """Should return the specific promo code details."""
        with (patch("api.promo_codes.fetch_records") as mock_fetch,):
            mock_fetch.side_effect = [
                [mock_promo_code],  # Promo code
                [{"organizer_id": str(mock_user_id)}],  # Pricing rules (access check)
            ]

            response = client.get(
                f"/api/promo-codes/{mock_promo_code['id']}",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["id"] == mock_promo_code["id"]
            assert data["code"] == "TEST20"
            assert data["commission_percent"] == "5.00"

    def test_get_promo_code_not_found(self, mock_user_token, mock_user_id):
        """Should return 404 for non-existent promo code."""
        with (patch("api.promo_codes.fetch_records") as mock_fetch,):
            mock_fetch.return_value = []  # No promo code found

            response = client.get(
                f"/api/promo-codes/{uuid4()}",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 404

    def test_get_promo_code_access_denied(self, mock_user_token, mock_promo_code):
        """Should return 403 when user doesn't own the event."""
        with (patch("api.promo_codes.fetch_records") as mock_fetch,):
            mock_fetch.side_effect = [
                [mock_promo_code],  # Promo code exists
                [],  # No pricing rules found (access denied)
            ]

            response = client.get(
                f"/api/promo-codes/{mock_promo_code['id']}",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 403

    def test_get_promo_code_unauthorized(self, mock_promo_code):
        """Should return 401 for unauthorized requests."""
        response = client.get(f"/api/promo-codes/{mock_promo_code['id']}")
        assert response.status_code == 401


class TestDeactivatePromoCode:
    """Tests for POST /api/promo-codes/{promo_code_id}/deactivate"""

    @pytest.fixture
    def mock_user_id(self):
        return str(uuid4())

    @pytest.fixture
    def mock_user_token(self, mock_user_id):
        return create_test_token(mock_user_id)

    @pytest.fixture
    def mock_promo_code(self, mock_user_id):
        return {
            "id": str(uuid4()),
            "event_id": str(uuid4()),
            "code": "ACTIVE20",
            "discount_percent": 20,
            "discount_amount": None,
            "max_uses": 100,
            "times_claimed": 25,
            "times_used": 15,
            "valid_from": datetime.now(timezone.utc).isoformat(),
            "valid_until": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "is_active": True,
            "commission_percent": "5.00",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

    def test_deactivate_promo_code_success(
        self, mock_user_token, mock_user_id, mock_promo_code
    ):
        """Should deactivate the promo code successfully."""
        with (
            patch("api.promo_codes.fetch_records") as mock_fetch,
            patch("api.promo_codes.update_record") as mock_update,
        ):
            mock_fetch.side_effect = [
                [mock_promo_code],  # Promo code
                [{"organizer_id": str(mock_user_id)}],  # Pricing rules (access check)
            ]
            mock_update.return_value = {**mock_promo_code, "is_active": False}

            response = client.post(
                f"/api/promo-codes/{mock_promo_code['id']}/deactivate",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["is_active"] is False

    def test_deactivate_promo_code_not_found(self, mock_user_token, mock_user_id):
        """Should return 404 for non-existent promo code."""
        with (patch("api.promo_codes.fetch_records") as mock_fetch,):
            mock_fetch.return_value = []  # No promo code found

            response = client.post(
                f"/api/promo-codes/{uuid4()}/deactivate",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 404

    def test_deactivate_promo_code_access_denied(
        self, mock_user_token, mock_promo_code
    ):
        """Should return 403 when user doesn't own the event."""
        with (patch("api.promo_codes.fetch_records") as mock_fetch,):
            mock_fetch.side_effect = [
                [mock_promo_code],  # Promo code exists
                [],  # No pricing rules found (access denied)
            ]

            response = client.post(
                f"/api/promo-codes/{mock_promo_code['id']}/deactivate",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 403

    def test_deactivate_promo_code_database_error(
        self, mock_user_token, mock_user_id, mock_promo_code
    ):
        """Should return 500 when database operation fails."""
        with (
            patch("api.promo_codes.fetch_records") as mock_fetch,
            patch("api.promo_codes.update_record") as mock_update,
        ):
            mock_fetch.side_effect = [
                [mock_promo_code],  # Promo code
                [{"organizer_id": str(mock_user_id)}],  # Pricing rules (access check)
            ]
            mock_update.return_value = None  # Simulate database failure

            response = client.post(
                f"/api/promo-codes/{mock_promo_code['id']}/deactivate",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 500

    def test_deactivate_promo_code_unauthorized(self, mock_promo_code):
        """Should return 401 for unauthorized requests."""
        response = client.post(f"/api/promo-codes/{mock_promo_code['id']}/deactivate")
        assert response.status_code == 401


class TestGetPromoCodeClaims:
    """Tests for GET /api/promo-codes/{promo_code_id}/claims"""

    @pytest.fixture
    def mock_user_id(self):
        return str(uuid4())

    @pytest.fixture
    def mock_user_token(self, mock_user_id):
        return create_test_token(mock_user_id)

    @pytest.fixture
    def mock_promo_code(self, mock_user_id):
        return {
            "id": str(uuid4()),
            "event_id": str(uuid4()),
            "code": "CLAIMED20",
        }

    @pytest.fixture
    def mock_claims(self, mock_promo_code):
        return [
            {
                "id": str(uuid4()),
                "promo_code_id": mock_promo_code["id"],
                "user_id": str(uuid4()),
                "claimed_at": datetime.now(timezone.utc).isoformat(),
                "ip_address": "192.168.1.1",
                "marked_as_used": False,
                "marked_used_at": None,
            },
            {
                "id": str(uuid4()),
                "promo_code_id": mock_promo_code["id"],
                "user_id": str(uuid4()),
                "claimed_at": (
                    datetime.now(timezone.utc) - timedelta(hours=1)
                ).isoformat(),
                "ip_address": "192.168.1.2",
                "marked_as_used": True,
                "marked_used_at": (
                    datetime.now(timezone.utc) - timedelta(minutes=30)
                ).isoformat(),
            },
        ]

    def test_get_promo_code_claims_success(
        self, mock_user_token, mock_user_id, mock_promo_code, mock_claims
    ):
        """Should return claim history for the promo code."""
        with (patch("api.promo_codes.fetch_records") as mock_fetch,):
            mock_fetch.side_effect = [
                [mock_promo_code],  # Promo code
                [{"organizer_id": str(mock_user_id)}],  # Pricing rules (access check)
                mock_claims,  # Claims
            ]

            response = client.get(
                f"/api/promo-codes/{mock_promo_code['id']}/claims",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert data[0]["marked_as_used"] is False
            assert data[1]["marked_as_used"] is True

    def test_get_promo_code_claims_empty(
        self, mock_user_token, mock_user_id, mock_promo_code
    ):
        """Should return empty list when no claims exist."""
        with (patch("api.promo_codes.fetch_records") as mock_fetch,):
            mock_fetch.side_effect = [
                [mock_promo_code],  # Promo code
                [{"organizer_id": str(mock_user_id)}],  # Pricing rules (access check)
                [],  # No claims
            ]

            response = client.get(
                f"/api/promo-codes/{mock_promo_code['id']}/claims",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 0

    def test_get_promo_code_claims_not_found(self, mock_user_token, mock_user_id):
        """Should return 404 for non-existent promo code."""
        with (patch("api.promo_codes.fetch_records") as mock_fetch,):
            mock_fetch.return_value = []  # No promo code found

            response = client.get(
                f"/api/promo-codes/{uuid4()}/claims",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 404

    def test_get_promo_code_claims_access_denied(
        self, mock_user_token, mock_promo_code
    ):
        """Should return 403 when user doesn't own the event."""
        with (patch("api.promo_codes.fetch_records") as mock_fetch,):
            mock_fetch.side_effect = [
                [mock_promo_code],  # Promo code exists
                [],  # No pricing rules found (access denied)
            ]

            response = client.get(
                f"/api/promo-codes/{mock_promo_code['id']}/claims",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 403

    def test_get_promo_code_claims_unauthorized(self, mock_promo_code):
        """Should return 401 for unauthorized requests."""
        response = client.get(f"/api/promo-codes/{mock_promo_code['id']}/claims")
        assert response.status_code == 401


class TestRegeneratePromoCode:
    """Tests for POST /api/promo-codes/{promo_code_id}/regenerate"""

    @pytest.fixture
    def mock_user_id(self):
        return str(uuid4())

    @pytest.fixture
    def mock_user_token(self, mock_user_id):
        return create_test_token(mock_user_id)

    @pytest.fixture
    def mock_promo_code(self, mock_user_id):
        return {
            "id": str(uuid4()),
            "event_id": str(uuid4()),
            "code": "OLD20",
            "discount_percent": 20,
            "discount_amount": None,
            "max_uses": 100,
            "times_claimed": 10,
            "times_used": 5,
            "valid_from": datetime.now(timezone.utc).isoformat(),
            "valid_until": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "is_active": True,
            "commission_percent": "5.00",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

    @pytest.fixture
    def mock_event(self, mock_promo_code):
        return {
            "id": mock_promo_code["event_id"],
            "title": "Test Event",
        }

    def test_regenerate_promo_code_success(
        self, mock_user_token, mock_user_id, mock_promo_code, mock_event
    ):
        """Should regenerate the promo code successfully."""
        with (
            patch("api.promo_codes.fetch_records") as mock_fetch,
            patch("api.promo_codes.insert_record") as mock_insert,
            patch("services.promo_code_generator.generate_promo_code") as mock_generate,
        ):
            mock_generate.return_value = "NEW20"
            mock_fetch.side_effect = [
                [mock_promo_code],  # Original promo code
                [{"organizer_id": str(mock_user_id)}],  # Pricing rules (access check)
                [mock_event],  # Event details
            ]
            mock_insert.return_value = {
                **mock_promo_code,
                "id": str(uuid4()),
                "code": "NEW20",
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }

            response = client.post(
                f"/api/promo-codes/{mock_promo_code['id']}/regenerate",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["code"] == "NEW20"
            assert data["is_active"] is True

    def test_regenerate_promo_code_not_found(self, mock_user_token, mock_user_id):
        """Should return 404 for non-existent promo code."""
        with (patch("api.promo_codes.fetch_records") as mock_fetch,):
            mock_fetch.return_value = []  # No promo code found

            response = client.post(
                f"/api/promo-codes/{uuid4()}/regenerate",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 404

    def test_regenerate_promo_code_access_denied(
        self, mock_user_token, mock_promo_code
    ):
        """Should return 403 when user doesn't own the event."""
        with (patch("api.promo_codes.fetch_records") as mock_fetch,):
            mock_fetch.side_effect = [
                [mock_promo_code],  # Promo code exists
                [],  # No pricing rules found (access denied)
            ]

            response = client.post(
                f"/api/promo-codes/{mock_promo_code['id']}/regenerate",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 403

    def test_regenerate_promo_code_database_error(
        self, mock_user_token, mock_user_id, mock_promo_code, mock_event
    ):
        """Should return 500 when database operation fails."""
        with (
            patch("api.promo_codes.fetch_records") as mock_fetch,
            patch("api.promo_codes.insert_record") as mock_insert,
            patch("services.promo_code_generator.generate_promo_code") as mock_generate,
        ):
            mock_generate.return_value = "NEW20"
            mock_fetch.side_effect = [
                [mock_promo_code],  # Original promo code
                [{"organizer_id": str(mock_user_id)}],  # Pricing rules (access check)
                [mock_event],  # Event details
            ]
            mock_insert.return_value = None  # Simulate database failure

            response = client.post(
                f"/api/promo-codes/{mock_promo_code['id']}/regenerate",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 500

    def test_regenerate_promo_code_unauthorized(self, mock_promo_code):
        """Should return 401 for unauthorized requests."""
        response = client.post(f"/api/promo-codes/{mock_promo_code['id']}/regenerate")
        assert response.status_code == 401


class TestGetPromoCodeStats:
    """Tests for GET /api/promo-codes/stats/summary"""

    @pytest.fixture
    def mock_user_id(self):
        return str(uuid4())

    @pytest.fixture
    def mock_user_token(self, mock_user_id):
        return create_test_token(mock_user_id)

    @pytest.fixture
    def mock_pricing_rules(self, mock_user_id):
        return [
            {
                "id": str(uuid4()),
                "event_id": str(uuid4()),
                "organizer_id": str(mock_user_id),
            },
            {
                "id": str(uuid4()),
                "event_id": str(uuid4()),
                "organizer_id": str(mock_user_id),
            },
        ]

    @pytest.fixture
    def mock_promo_codes_for_stats(self):
        return [
            {
                "id": str(uuid4()),
                "event_id": str(uuid4()),
                "is_active": True,
                "times_claimed": 25,
                "times_used": 15,
                "estimated_commission": "15.00",
            },
            {
                "id": str(uuid4()),
                "event_id": str(uuid4()),
                "is_active": False,
                "times_claimed": 50,
                "times_used": 30,
                "estimated_commission": "10.50",
            },
            {
                "id": str(uuid4()),
                "event_id": str(uuid4()),
                "is_active": True,
                "times_claimed": 10,
                "times_used": 8,
                "estimated_commission": "8.00",
            },
        ]

    def test_get_promo_code_stats_success(
        self,
        mock_user_token,
        mock_user_id,
        mock_pricing_rules,
        mock_promo_codes_for_stats,
    ):
        """Should return summary statistics for organizer's promo codes."""
        with (patch("api.promo_codes.fetch_records") as mock_fetch,):
            mock_fetch.side_effect = [
                mock_pricing_rules,  # Pricing rules
                mock_promo_codes_for_stats,  # Promo codes
            ]

            response = client.get(
                "/api/promo-codes/stats/summary",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["active_deals"] == 2  # 2 active promo codes
            assert data["total_claims"] == 85  # 25 + 50 + 10
            assert data["total_used"] == 53  # 15 + 30 + 8
            assert data["estimated_commission"] == "33.50"  # 15.00 + 10.50 + 8.00

    def test_get_promo_code_stats_no_events(self, mock_user_token, mock_user_id):
        """Should return zeros when organizer has no events."""
        with (patch("api.promo_codes.fetch_records") as mock_fetch,):
            mock_fetch.return_value = []  # No pricing rules

            response = client.get(
                "/api/promo-codes/stats/summary",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["active_deals"] == 0
            assert data["total_claims"] == 0
            assert data["total_used"] == 0
            assert data["estimated_commission"] == 0

    def test_get_promo_code_stats_no_promo_codes(
        self, mock_user_token, mock_user_id, mock_pricing_rules
    ):
        """Should return zeros when no promo codes exist."""
        with (patch("api.promo_codes.fetch_records") as mock_fetch,):
            mock_fetch.side_effect = [
                mock_pricing_rules,  # Pricing rules exist
                [],  # No promo codes
            ]

            response = client.get(
                "/api/promo-codes/stats/summary",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["active_deals"] == 0
            assert data["total_claims"] == 0
            assert data["total_used"] == 0
            assert data["estimated_commission"] == "0"

    def test_get_promo_code_stats_unauthorized(self):
        """Should return 401 for unauthorized requests."""
        response = client.get("/api/promo-codes/stats/summary")
        assert response.status_code == 401


class TestPromoCodeModels:
    """Tests for Pydantic models in promo codes."""

    def test_promo_code_list_item_model(self):
        """Test PromoCodeListItem model creation."""
        from api.promo_codes import PromoCodeListItem

        promo_code = PromoCodeListItem(
            id=uuid4(),
            event_id=uuid4(),
            code="TEST20",
            discount_percent=20,
            discount_amount=None,
            max_uses=100,
            times_claimed=25,
            times_used=15,
            valid_from=datetime.now(timezone.utc).isoformat(),
            valid_until=(datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            is_active=True,
            estimated_commission=Decimal("15.00"),
        )
        assert promo_code.code == "TEST20"
        assert promo_code.discount_percent == 20
        assert promo_code.is_active is True

    def test_promo_code_claim_response_model(self):
        """Test PromoCodeClaimResponse model creation."""
        from api.promo_codes import PromoCodeClaimResponse

        claim = PromoCodeClaimResponse(
            id=uuid4(),
            user_id=uuid4(),
            claimed_at=datetime.now(timezone.utc).isoformat(),
            ip_address="192.168.1.1",
            marked_as_used=False,
            marked_used_at=None,
        )
        assert claim.marked_as_used is False
        assert claim.ip_address == "192.168.1.1"

    def test_promo_code_detail_response_model(self):
        """Test PromoCodeDetailResponse model creation."""
        from api.promo_codes import PromoCodeDetailResponse

        promo_code = PromoCodeDetailResponse(
            id=uuid4(),
            event_id=uuid4(),
            code="DETAIL20",
            discount_percent=20,
            discount_amount=None,
            max_uses=100,
            times_claimed=25,
            times_used=15,
            valid_from=datetime.now(timezone.utc).isoformat(),
            valid_until=(datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            is_active=True,
            estimated_commission=Decimal("15.00"),
            recommendation_id=uuid4(),
            commission_percent=Decimal("5.00"),
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        assert promo_code.recommendation_id is not None
        assert promo_code.commission_percent == Decimal("5.00")
