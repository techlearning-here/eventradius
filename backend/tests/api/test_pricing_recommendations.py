"""
Tests for the Pricing Recommendations API endpoints.
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


class TestListRecommendations:
    """Tests for GET /api/pricing/recommendations"""

    @pytest.fixture
    def mock_user_id(self):
        return str(uuid4())

    @pytest.fixture
    def mock_user_token(self, mock_user_id):
        return create_test_token(mock_user_id)

    @pytest.fixture
    def mock_recommendations(self, mock_user_id):
        return [
            {
                "id": str(uuid4()),
                "event_id": str(uuid4()),
                "organizer_id": mock_user_id,
                "occupancy_percent": 45.5,
                "hours_remaining": 24,
                "recommended_discount_percent": 20,
                "recommended_price": "80.00",
                "status": "pending",
                "recommendation_type": "rule_based",
                "rule_id": str(uuid4()),
                "rule_name": "Early Bird Discount",
                "created_at": datetime.now(timezone.utc).isoformat(),
            },
            {
                "id": str(uuid4()),
                "event_id": str(uuid4()),
                "organizer_id": mock_user_id,
                "occupancy_percent": 60.0,
                "hours_remaining": 12,
                "recommended_discount_percent": 15,
                "recommended_price": "85.00",
                "status": "approved",
                "recommendation_type": "ai_based",
                "rule_id": None,
                "rule_name": None,
                "created_at": datetime.now(timezone.utc).isoformat(),
            },
        ]

    def test_list_recommendations_success(
        self, mock_user_token, mock_user_id, mock_recommendations
    ):
        """Should return list of recommendations for authenticated user."""
        with patch("api.pricing_recommendations.fetch_records") as mock_fetch:
            # Mock pricing rules for the organizer
            mock_pricing_rules = [
                {
                    "id": str(uuid4()),
                    "event_id": mock_recommendations[0]["event_id"],
                    "organizer_id": mock_user_id,
                },
                {
                    "id": str(uuid4()),
                    "event_id": mock_recommendations[1]["event_id"],
                    "organizer_id": mock_user_id,
                },
            ]

            mock_fetch.side_effect = [
                mock_pricing_rules,  # First call: pricing rules
                mock_recommendations,  # Second call: recommendations
                [  # Third call: promo codes for approved recommendations
                    {
                        "id": str(uuid4()),
                        "event_id": mock_recommendations[1]["event_id"],
                        "recommendation_id": mock_recommendations[1]["id"],
                        "code": "APPROVED15",
                        "discount_percent": 15,
                        "discount_amount": None,
                        "max_uses": 100,
                        "times_claimed": 5,
                        "times_used": 3,
                        "valid_from": datetime.now(timezone.utc).isoformat(),
                        "valid_until": (
                            datetime.now(timezone.utc) + timedelta(days=7)
                        ).isoformat(),
                        "is_active": True,
                        "commission_percent": "5.00",
                    }
                ],
            ]

            response = client.get(
                "/api/pricing/recommendations",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert data[0]["status"] == "pending"
            assert data[1]["status"] == "approved"
            assert data[1]["promo_code"]["code"] == "APPROVED15"

    def test_list_recommendations_with_filters(self, mock_user_token, mock_user_id):
        """Should filter recommendations by status and type."""
        with (patch("api.pricing_recommendations.fetch_records") as mock_fetch,):
            mock_fetch.return_value = [
                {
                    "id": str(uuid4()),
                    "event_id": str(uuid4()),
                    "organizer_id": str(mock_user_id),
                    "status": "pending",
                    "recommendation_type": "rule_based",
                    "occupancy_percent": 75.0,
                    "hours_remaining": 24.0,
                    "recommended_discount_percent": 15,
                    "recommended_price": "85.00",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
            ]

            response = client.get(
                "/api/pricing/recommendations?status=pending&recommendation_type=rule_based",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["status"] == "pending"
            assert data[0]["recommendation_type"] == "rule_based"

    def test_list_recommendations_unauthorized(self):
        """Should return 401 for unauthorized requests."""
        response = client.get("/api/pricing/recommendations")
        assert response.status_code == 401


class TestGetRecommendation:
    """Tests for GET /api/pricing/recommendations/{recommendation_id}"""

    @pytest.fixture
    def mock_user_id(self):
        return str(uuid4())

    @pytest.fixture
    def mock_user_token(self, mock_user_id):
        return create_test_token(mock_user_id)

    @pytest.fixture
    def mock_recommendation_id(self):
        return uuid4()

    @pytest.fixture
    def mock_recommendation(self, mock_user_id, mock_recommendation_id):
        return {
            "id": str(mock_recommendation_id),
            "event_id": str(uuid4()),
            "organizer_id": str(mock_user_id),
            "occupancy_percent": 45.5,
            "hours_remaining": 24,
            "recommended_discount_percent": 20,
            "recommended_price": "80.00",
            "status": "pending",
            "recommendation_type": "rule_based",
            "rule_id": str(uuid4()),
            "rule_name": "Early Bird Discount",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

    def test_get_recommendation_success(
        self, mock_user_token, mock_user_id, mock_recommendation
    ):
        """Should return recommendation details for authorized user."""
        with (patch("api.pricing_recommendations.fetch_records") as mock_fetch,):
            mock_fetch.side_effect = [
                [mock_recommendation],  # First call: recommendation
                [
                    {"organizer_id": str(mock_user_id)}
                ],  # Second call: pricing rules (access check)
            ]

            response = client.get(
                f"/api/pricing/recommendations/{mock_recommendation['id']}",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["id"] == mock_recommendation["id"]
            assert data["status"] == "pending"
            assert data["recommended_discount_percent"] == 20

    def test_get_recommendation_with_promo_code(
        self, mock_user_token, mock_user_id, mock_recommendation
    ):
        """Should include promo code for approved recommendations."""
        with (patch("api.pricing_recommendations.fetch_records") as mock_fetch,):
            approved_recommendation = {**mock_recommendation, "status": "approved"}
            mock_fetch.side_effect = [
                [approved_recommendation],  # First call: recommendation
                [{"organizer_id": str(mock_user_id)}],  # Second call: pricing rules
                [  # Third call: promo codes
                    {
                        "id": str(uuid4()),
                        "event_id": approved_recommendation["event_id"],
                        "recommendation_id": approved_recommendation["id"],
                        "code": "PROMO20",
                        "discount_percent": 20,
                        "discount_amount": None,
                        "max_uses": 100,
                        "times_claimed": 10,
                        "times_used": 5,
                        "valid_from": datetime.now(timezone.utc).isoformat(),
                        "valid_until": (
                            datetime.now(timezone.utc) + timedelta(days=7)
                        ).isoformat(),
                        "is_active": True,
                        "commission_percent": "5.00",
                    }
                ],
            ]

            response = client.get(
                f"/api/pricing/recommendations/{approved_recommendation['id']}",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["promo_code"]["code"] == "PROMO20"

    def test_get_recommendation_not_found(self, mock_user_token, mock_user_id):
        """Should return 404 for non-existent recommendation."""
        with (patch("api.pricing_recommendations.fetch_records") as mock_fetch,):
            mock_fetch.return_value = []  # No recommendation found

            response = client.get(
                f"/api/pricing/recommendations/{uuid4()}",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 404

    def test_get_recommendation_access_denied(
        self, mock_user_token, mock_user_id, mock_recommendation
    ):
        """Should return 403 when user doesn't own the event."""
        with (patch("api.pricing_recommendations.fetch_records") as mock_fetch,):
            mock_fetch.side_effect = [
                [mock_recommendation],  # Recommendation exists
                [],  # No pricing rules found (access denied)
            ]

            response = client.get(
                f"/api/pricing/recommendations/{mock_recommendation['id']}",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 403


class TestApproveRecommendation:
    """Tests for POST /api/pricing/recommendations/{recommendation_id}/approve"""

    @pytest.fixture
    def mock_user_id(self):
        return str(uuid4())

    @pytest.fixture
    def mock_user_token(self, mock_user_id):
        return create_test_token(mock_user_id)

    @pytest.fixture
    def mock_recommendation_id(self):
        return uuid4()

    @pytest.fixture
    def mock_pending_recommendation(self, mock_user_id, mock_recommendation_id):
        return {
            "id": str(mock_recommendation_id),
            "event_id": str(uuid4()),
            "organizer_id": str(mock_user_id),
            "occupancy_percent": 45.5,
            "hours_remaining": 24,
            "recommended_discount_percent": 20,
            "recommended_price": "80.00",
            "status": "pending",
            "recommendation_type": "rule_based",
            "rule_id": str(uuid4()),
            "rule_name": "Early Bird Discount",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

    def test_approve_recommendation_success(
        self, mock_user_token, mock_user_id, mock_pending_recommendation
    ):
        """Should approve recommendation and create promo code."""
        with (
            patch("api.pricing_recommendations.fetch_records") as mock_fetch,
            patch("api.pricing_recommendations.update_record") as mock_update,
            patch("config.database.insert_record") as mock_insert,
            patch(
                "services.promo_code_generator.generate_unique_promo_code"
            ) as mock_generate,
        ):
            mock_generate.return_value = "SAVE20"
            mock_fetch.side_effect = [
                [mock_pending_recommendation],  # Recommendation
                [
                    {"organizer_id": str(mock_user_id), "base_price": "100.00"}
                ],  # Pricing rules
                [
                    {
                        "title": "Test Event",
                        "start_time": (
                            datetime.now(timezone.utc) + timedelta(days=7)
                        ).isoformat(),
                    }
                ],  # Event
                [],  # Existing promo codes (none)
            ]
            promo_code_id = str(uuid4())
            mock_insert.side_effect = [
                {  # Promo code creation
                    "id": promo_code_id,
                    "code": "SAVE20",
                    "event_id": mock_pending_recommendation["event_id"],
                    "discount_percent": 20,
                    "discount_amount": "20.00",
                    "max_uses": 100,
                    "times_claimed": 0,
                    "times_used": 0,
                    "valid_from": datetime.now(timezone.utc).isoformat(),
                    "valid_until": (
                        datetime.now(timezone.utc) + timedelta(days=7)
                    ).isoformat(),
                    "is_active": True,
                    "commission_percent": "10.00",
                },
                {
                    **mock_pending_recommendation,
                    "status": "approved",
                },  # Recommendation update
            ]
            mock_update.return_value = {
                **mock_pending_recommendation,
                "status": "approved",
            }

            response = client.post(
                f"/api/pricing/recommendations/{mock_pending_recommendation['id']}/approve",
                json={"max_uses": 100},
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "approved"
            assert data["promo_code"]["code"] == "SAVE20"
            assert data["promo_code"]["max_uses"] == 100

    def test_approve_recommendation_not_pending(
        self, mock_user_token, mock_user_id, mock_pending_recommendation
    ):
        """Should return 404 for non-pending recommendations."""
        with (patch("api.pricing_recommendations.fetch_records") as mock_fetch,):
            # Return empty list to simulate no pending recommendation found
            mock_fetch.return_value = []

            response = client.post(
                f"/api/pricing/recommendations/{mock_pending_recommendation['id']}/approve",
                json={"max_uses": 100},
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 404

    def test_approve_recommendation_invalid_max_uses(self, mock_user_token):
        """Should return 422 for invalid max_uses values."""
        response = client.post(
            f"/api/pricing/recommendations/{uuid4()}/approve",
            json={"max_uses": 0},  # Invalid: less than 1
            headers={"Authorization": f"Bearer {mock_user_token}"},
        )
        assert response.status_code == 422

        response = client.post(
            f"/api/pricing/recommendations/{uuid4()}/approve",
            json={"max_uses": 1001},  # Invalid: greater than 1000
            headers={"Authorization": f"Bearer {mock_user_token}"},
        )
        assert response.status_code == 422


class TestRejectRecommendation:
    """Tests for POST /api/pricing/recommendations/{recommendation_id}/reject"""

    @pytest.fixture
    def mock_user_id(self):
        return str(uuid4())

    @pytest.fixture
    def mock_user_token(self, mock_user_id):
        return create_test_token(mock_user_id)

    @pytest.fixture
    def mock_pending_recommendation(self, mock_user_id):
        return {
            "id": str(uuid4()),
            "event_id": str(uuid4()),
            "organizer_id": str(mock_user_id),
            "status": "pending",
            "recommendation_type": "rule_based",
            "occupancy_percent": 45.0,
            "hours_remaining": 48.0,
            "recommended_discount_percent": 15,
            "recommended_price": "42.50",
            "created_at": "2024-01-01T00:00:00+00:00",
        }

    def test_reject_recommendation_success(
        self, mock_user_token, mock_user_id, mock_pending_recommendation
    ):
        """Should reject recommendation successfully."""
        with (
            patch("api.pricing_recommendations.fetch_records") as mock_fetch,
            patch("api.pricing_recommendations.update_record") as mock_update,
        ):
            mock_fetch.side_effect = [
                [mock_pending_recommendation],  # Recommendation
                [{"organizer_id": str(mock_user_id)}],  # Pricing rules (access check)
            ]
            mock_update.return_value = {
                **mock_pending_recommendation,
                "status": "rejected",
            }

            response = client.post(
                f"/api/pricing/recommendations/{mock_pending_recommendation['id']}/reject",
                json={"reason": "Not suitable for this event"},
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "rejected"

    def test_reject_recommendation_without_reason(
        self, mock_user_token, mock_user_id, mock_pending_recommendation
    ):
        """Should reject recommendation even without reason."""
        with (
            patch("api.pricing_recommendations.fetch_records") as mock_fetch,
            patch("api.pricing_recommendations.update_record") as mock_update,
        ):
            mock_fetch.side_effect = [
                [mock_pending_recommendation],  # Recommendation
                [{"organizer_id": str(mock_user_id)}],  # Pricing rules (access check)
            ]
            mock_update.return_value = {
                **mock_pending_recommendation,
                "status": "rejected",
            }

            response = client.post(
                f"/api/pricing/recommendations/{mock_pending_recommendation['id']}/reject",
                json={},
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200

    def test_reject_recommendation_reason_too_long(self, mock_user_token):
        """Should return 422 for reason exceeding max length."""
        response = client.post(
            f"/api/pricing/recommendations/{uuid4()}/reject",
            json={"reason": "x" * 501},  # Exceeds 500 character limit
            headers={"Authorization": f"Bearer {mock_user_token}"},
        )
        assert response.status_code == 422


class TestGenerateRuleBasedRecommendation:
    """Tests for POST /api/pricing/recommendations/generate/rule-based"""

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
            "base_price": "100.00",
            "min_price": "50.00",
            "max_capacity": 100,
        }

    @pytest.fixture
    def mock_event(self, mock_event_id):
        return {
            "id": str(mock_event_id),
            "title": "Test Event",
            "start_time": (
                datetime.now(timezone.utc) + timedelta(hours=48)
            ).isoformat(),
            "max_participants": 100,
            "current_participants": 40,
        }

    @pytest.fixture
    def mock_discount_rule(self, mock_user_id):
        return {
            "id": str(uuid4()),
            "organizer_id": str(mock_user_id),
            "rule_name": "Early Bird Special",
            "occupancy_threshold": 50,
            "time_threshold": 72,
            "time_unit": "hours",
            "discount_percent": 20,
            "priority": 1,
            "is_active": True,
        }

    def test_generate_recommendation_success(
        self,
        mock_user_token,
        mock_user_id,
        mock_event_id,
        mock_pricing_rule,
        mock_event,
        mock_discount_rule,
    ):
        """Should generate recommendation when rules match."""
        with (
            patch("api.pricing_recommendations.fetch_records") as mock_fetch,
            patch("config.database.insert_record") as mock_insert,
        ):
            mock_fetch.side_effect = [
                [mock_pricing_rule],  # Pricing rules
                [mock_event],  # Event details
                [{"occupancy_percent": 40}],  # Inventory snapshot
                [mock_discount_rule],  # Event-specific discount rules
                [],  # Global discount rules
                [],  # No existing recommendation
            ]
            mock_insert.return_value = {
                "id": str(uuid4()),
                "event_id": str(mock_event_id),
                "organizer_id": str(mock_user_id),
                "status": "pending",
                "recommended_discount_percent": 20,
                "recommended_price": "80.00",
                "occupancy_percent": 45.5,
                "hours_remaining": 24,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "recommendation_type": "rule_based",
            }

            response = client.post(
                "/api/pricing/recommendations/generate/rule-based",
                json={"event_id": str(mock_event_id)},
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "pending"
            assert data["recommended_discount_percent"] == 20
            assert data["recommended_price"] == "80.00"

    def test_generate_recommendation_existing_found(
        self,
        mock_user_token,
        mock_user_id,
        mock_event_id,
        mock_pricing_rule,
        mock_event,
        mock_discount_rule,
    ):
        """Should return existing recommendation if one already exists."""
        with (patch("api.pricing_recommendations.fetch_records") as mock_fetch,):
            existing_recommendation = {
                "id": str(uuid4()),
                "event_id": str(mock_event_id),
                "organizer_id": str(mock_user_id),
                "status": "pending",
                "recommended_discount_percent": 20,
                "recommended_price": "80.00",
                "occupancy_percent": 45.5,
                "hours_remaining": 24,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "recommendation_type": "rule_based",
                "rule_id": str(uuid4()),
                "rule_name": "Test Rule",
            }
            mock_fetch.side_effect = [
                [mock_pricing_rule],  # Pricing rules
                [mock_event],  # Event details
                [{"occupancy_percent": 40}],  # Inventory snapshot
                [mock_discount_rule],  # Event-specific discount rules
                [],  # Global discount rules
                [existing_recommendation],  # Existing recommendation found
            ]

            response = client.post(
                "/api/pricing/recommendations/generate/rule-based",
                json={"event_id": str(mock_event_id)},
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["id"] == existing_recommendation["id"]

    def test_generate_recommendation_no_rules_match(
        self,
        mock_user_token,
        mock_user_id,
        mock_event_id,
        mock_pricing_rule,
        mock_event,
    ):
        """Should return 404 when no discount rules match."""
        with (patch("api.pricing_recommendations.fetch_records") as mock_fetch,):
            # High occupancy rule that won't match
            high_occupancy_rule = {
                "id": str(uuid4()),
                "organizer_id": str(mock_user_id),
                "occupancy_threshold": 30,  # Lower than actual 40%
                "time_threshold": 72,
                "time_unit": "hours",
                "discount_percent": 15,
                "is_active": True,
            }
            mock_fetch.side_effect = [
                [mock_pricing_rule],  # Pricing rules
                [mock_event],  # Event details
                [{"occupancy_percent": 40}],  # Inventory snapshot (40% occupancy)
                [high_occupancy_rule],  # Discount rules (none match)
                [],  # No existing recommendation
            ]

            response = client.post(
                "/api/pricing/recommendations/generate/rule-based",
                json={"event_id": str(mock_event_id)},
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 404
            assert "No rules matched" in response.json()["detail"]

    def test_generate_recommendation_access_denied(
        self, mock_user_token, mock_event_id
    ):
        """Should return 403 when user doesn't own the event."""
        with (patch("api.pricing_recommendations.fetch_records") as mock_fetch,):
            mock_fetch.return_value = []  # No pricing rules found

            response = client.post(
                "/api/pricing/recommendations/generate/rule-based",
                json={"event_id": str(mock_event_id)},
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 403

    def test_generate_recommendation_event_not_found(
        self, mock_user_token, mock_user_id, mock_event_id
    ):
        """Should return 404 when event doesn't exist."""
        with (patch("api.pricing_recommendations.fetch_records") as mock_fetch,):
            mock_fetch.side_effect = [
                [{"organizer_id": str(mock_user_id)}],  # Pricing rules exist
                [],  # Event not found
            ]

            response = client.post(
                "/api/pricing/recommendations/generate/rule-based",
                json={"event_id": str(mock_event_id)},
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 404


class TestRecommendationModels:
    """Tests for Pydantic models in pricing recommendations."""

    def test_approve_recommendation_request_model(self):
        """Test ApproveRecommendationRequest model validation."""
        from api.pricing_recommendations import ApproveRecommendationRequest

        # Valid request
        request = ApproveRecommendationRequest(max_uses=100)
        assert request.max_uses == 100

        # Invalid requests (should raise validation errors)
        with pytest.raises(ValueError):
            ApproveRecommendationRequest(max_uses=0)  # Too low

        with pytest.raises(ValueError):
            ApproveRecommendationRequest(max_uses=1001)  # Too high

    def test_reject_recommendation_request_model(self):
        """Test RejectRecommendationRequest model validation."""
        from api.pricing_recommendations import RejectRecommendationRequest

        # Request without reason
        request = RejectRecommendationRequest()
        assert request.reason is None

        # Request with reason
        request = RejectRecommendationRequest(reason="Not suitable")
        assert request.reason == "Not suitable"

        # Request with long reason (should be valid)
        long_reason = "x" * 500
        request = RejectRecommendationRequest(reason=long_reason)
        assert request.reason == long_reason

    def test_recommendation_response_model(self):
        """Test RecommendationResponse model creation."""
        from api.pricing_recommendations import RecommendationResponse

        # Minimal data
        recommendation = RecommendationResponse(
            id=uuid4(),
            event_id=uuid4(),
            organizer_id=uuid4(),
            occupancy_percent=45.5,
            hours_remaining=24,
            recommended_discount_percent=20,
            recommended_price="80.00",
            status="pending",
            recommendation_type="rule_based",
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        assert recommendation.status == "pending"
        assert recommendation.recommended_discount_percent == 20
