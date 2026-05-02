"""
Tests for the Discount Rules API endpoints.
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


class TestCreateDiscountRule:
    """Tests for POST /api/pricing/discount-rules"""

    @pytest.fixture
    def mock_user_id(self):
        return str(uuid4())

    @pytest.fixture
    def mock_user_token(self, mock_user_id):
        return create_test_token(mock_user_id)

    @pytest.fixture
    def valid_rule_data(self):
        return {
            "rule_name": "Early Bird Special",
            "rule_description": "Discount for early bookings",
            "occupancy_threshold": 50,
            "time_threshold": 72,
            "time_unit": "hours",
            "discount_percent": 20,
            "is_active": True,
            "priority": 1,
            "event_id": None,
        }

    def test_create_global_discount_rule_success(
        self, mock_user_token, mock_user_id, valid_rule_data
    ):
        """Should create a global discount rule successfully."""
        with (patch("api.discount_rules.insert_record") as mock_insert,):
            mock_insert.return_value = {
                "id": str(uuid4()),
                "organizer_id": str(mock_user_id),
                **valid_rule_data,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }

            response = client.post(
                "/api/pricing/discount-rules",
                json=valid_rule_data,
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 201
            data = response.json()
            assert data["rule_name"] == "Early Bird Special"
            assert data["occupancy_threshold"] == 50
            assert data["discount_percent"] == 20
            assert data["event_id"] is None

    def test_create_event_specific_discount_rule_success(
        self, mock_user_token, mock_user_id, valid_rule_data
    ):
        """Should create an event-specific discount rule successfully."""
        event_id = uuid4()
        rule_data = {**valid_rule_data, "event_id": str(event_id)}

        with (patch("api.discount_rules.insert_record") as mock_insert,):
            mock_insert.return_value = {
                "id": str(uuid4()),
                "organizer_id": str(mock_user_id),
                **rule_data,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }

            response = client.post(
                "/api/pricing/discount-rules",
                json=rule_data,
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 201
            data = response.json()
            assert data["event_id"] == str(event_id)

    def test_create_discount_rule_validation_errors(self, mock_user_token):
        """Should return 422 for invalid rule data."""
        # Test invalid time_unit
        invalid_data = {
            "rule_name": "Test Rule",
            "occupancy_threshold": 50,
            "time_threshold": 24,
            "time_unit": "weeks",  # Invalid
            "discount_percent": 20,
        }

        response = client.post(
            "/api/pricing/discount-rules",
            json=invalid_data,
            headers={"Authorization": f"Bearer {mock_user_token}"},
        )
        assert response.status_code == 422

        # Test occupancy_threshold out of range
        invalid_data = {
            "rule_name": "Test Rule",
            "occupancy_threshold": 150,  # Invalid: > 100
            "time_threshold": 24,
            "time_unit": "hours",
            "discount_percent": 20,
        }

        response = client.post(
            "/api/pricing/discount-rules",
            json=invalid_data,
            headers={"Authorization": f"Bearer {mock_user_token}"},
        )
        assert response.status_code == 422

        # Test discount_percent out of range
        invalid_data = {
            "rule_name": "Test Rule",
            "occupancy_threshold": 50,
            "time_threshold": 24,
            "time_unit": "hours",
            "discount_percent": 150,  # Invalid: > 100
        }

        response = client.post(
            "/api/pricing/discount-rules",
            json=invalid_data,
            headers={"Authorization": f"Bearer {mock_user_token}"},
        )
        assert response.status_code == 422

    def test_create_discount_rule_unauthorized(self, valid_rule_data):
        """Should return 401 for unauthorized requests."""
        response = client.post("/api/pricing/discount-rules", json=valid_rule_data)
        assert response.status_code == 401

    def test_create_discount_rule_database_error(
        self, mock_user_token, mock_user_id, valid_rule_data
    ):
        """Should return 500 when database operation fails."""
        with (patch("api.discount_rules.insert_record") as mock_insert,):
            mock_insert.return_value = None  # Simulate database failure

            response = client.post(
                "/api/pricing/discount-rules",
                json=valid_rule_data,
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 500


class TestListDiscountRules:
    """Tests for GET /api/pricing/discount-rules"""

    @pytest.fixture
    def mock_user_id(self):
        return str(uuid4())

    @pytest.fixture
    def mock_user_token(self, mock_user_id):
        return create_test_token(mock_user_id)

    @pytest.fixture
    def mock_rules(self, mock_user_id):
        return [
            {
                "id": str(uuid4()),
                "organizer_id": str(mock_user_id),
                "event_id": None,
                "rule_name": "Global Rule",
                "rule_description": "A global discount rule",
                "occupancy_threshold": 50,
                "time_threshold": 72,
                "time_unit": "hours",
                "discount_percent": 20,
                "is_active": True,
                "priority": 1,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            },
            {
                "id": str(uuid4()),
                "organizer_id": str(mock_user_id),
                "event_id": str(uuid4()),
                "rule_name": "Event Rule",
                "rule_description": "An event-specific rule",
                "occupancy_threshold": 30,
                "time_threshold": 24,
                "time_unit": "hours",
                "discount_percent": 15,
                "is_active": True,
                "priority": 2,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            },
        ]

    def test_list_all_discount_rules_success(
        self, mock_user_token, mock_user_id, mock_rules
    ):
        """Should return all discount rules for the user."""
        with (patch("api.discount_rules.fetch_records") as mock_fetch,):
            mock_fetch.return_value = mock_rules

            response = client.get(
                "/api/pricing/discount-rules",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert data[0]["rule_name"] == "Global Rule"
            assert data[1]["rule_name"] == "Event Rule"

    def test_list_discount_rules_by_event(
        self, mock_user_token, mock_user_id, mock_rules
    ):
        """Should return rules for specific event plus global rules."""
        event_id = uuid4()
        event_specific_rule = {
            "id": str(uuid4()),
            "organizer_id": str(mock_user_id),
            "event_id": str(event_id),
            "rule_name": "Event Specific",
            "occupancy_threshold": 40,
            "time_threshold": 48,
            "time_unit": "hours",
            "discount_percent": 25,
            "is_active": True,
            "priority": 1,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

        with (patch("api.discount_rules.fetch_records") as mock_fetch,):
            mock_fetch.side_effect = [
                [event_specific_rule],  # Event-specific rules
                [mock_rules[0]],  # Global rules
            ]

            response = client.get(
                f"/api/pricing/discount-rules?event_id={event_id}",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            rule_names = [r["rule_name"] for r in data]
            assert "Event Specific" in rule_names
            assert "Global Rule" in rule_names

    def test_list_discount_rules_active_only(self, mock_user_token, mock_user_id):
        """Should filter rules by active status."""
        active_rule = {
            "id": str(uuid4()),
            "organizer_id": str(mock_user_id),
            "rule_name": "Active Rule",
            "occupancy_threshold": 50,
            "time_threshold": 24,
            "time_unit": "hours",
            "discount_percent": 20,
            "is_active": True,
            "priority": 1,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

        with (patch("api.discount_rules.fetch_records") as mock_fetch,):
            mock_fetch.return_value = [active_rule]

            response = client.get(
                "/api/pricing/discount-rules?is_active=true",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["is_active"] is True

    def test_list_discount_rules_unauthorized(self):
        """Should return 401 for unauthorized requests."""
        response = client.get("/api/pricing/discount-rules")
        assert response.status_code == 401


class TestGetDiscountRule:
    """Tests for GET /api/pricing/discount-rules/{rule_id}"""

    @pytest.fixture
    def mock_user_id(self):
        return str(uuid4())

    @pytest.fixture
    def mock_user_token(self, mock_user_id):
        return create_test_token(mock_user_id)

    @pytest.fixture
    def mock_rule(self, mock_user_id):
        return {
            "id": str(uuid4()),
            "organizer_id": str(mock_user_id),
            "event_id": None,
            "rule_name": "Test Rule",
            "rule_description": "A test rule",
            "occupancy_threshold": 50,
            "time_threshold": 24,
            "time_unit": "hours",
            "discount_percent": 20,
            "is_active": True,
            "priority": 1,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

    def test_get_discount_rule_success(self, mock_user_token, mock_user_id, mock_rule):
        """Should return the specific discount rule."""
        with (patch("api.discount_rules.fetch_single_record") as mock_fetch_single,):
            mock_fetch_single.return_value = mock_rule

            response = client.get(
                f"/api/pricing/discount-rules/{mock_rule['id']}",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["id"] == mock_rule["id"]
            assert data["rule_name"] == "Test Rule"

    def test_get_discount_rule_access_denied(self, mock_user_token):
        """Should return 403 when user doesn't own the rule."""
        with (patch("api.discount_rules.fetch_single_record") as mock_fetch_single,):
            # Create a rule with a different organizer_id
            different_user_id = str(uuid4())
            mock_rule = {
                "id": str(uuid4()),
                "organizer_id": different_user_id,  # Different from the token user
                "event_id": None,
                "rule_name": "Test Rule",
                "rule_description": "A test rule",
                "occupancy_threshold": 50,
                "time_threshold": 24,
                "time_unit": "hours",
                "discount_percent": 20,
                "is_active": True,
                "priority": 1,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            mock_fetch_single.return_value = mock_rule

            response = client.get(
                f"/api/pricing/discount-rules/{mock_rule['id']}",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 403

    def test_get_discount_rule_not_found(self, mock_user_token, mock_user_id):
        """Should return 404 for non-existent rule."""
        with (patch("api.discount_rules.fetch_single_record") as mock_fetch_single,):
            mock_fetch_single.return_value = None

            response = client.get(
                f"/api/pricing/discount-rules/{uuid4()}",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 404

    def test_delete_discount_rule_access_denied(self, mock_user_token):
        """Should return 403 when user doesn't own the rule."""
        with (patch("api.discount_rules.fetch_single_record") as mock_fetch_single,):
            # Create a rule with a different organizer_id
            different_user_id = str(uuid4())
            mock_rule = {
                "id": str(uuid4()),
                "organizer_id": different_user_id,  # Different from the token user
                "event_id": None,
                "rule_name": "Test Rule",
                "rule_description": "A test rule",
                "occupancy_threshold": 50,
                "time_threshold": 24,
                "time_unit": "hours",
                "discount_percent": 20,
                "is_active": True,
                "priority": 1,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            mock_fetch_single.return_value = mock_rule

            response = client.delete(
                f"/api/pricing/discount-rules/{mock_rule['id']}",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 403


class TestEvaluateDiscountRule:
    """Tests for POST /api/pricing/discount-rules/evaluate"""

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
    def valid_evaluation_request(self, mock_event_id):
        return {
            "event_id": str(mock_event_id),
            "occupancy_percent": 40,
            "hours_before_event": 24,
        }

    @pytest.fixture
    def mock_matching_rule(self, mock_user_id, mock_event_id):
        return {
            "id": str(uuid4()),
            "organizer_id": str(mock_user_id),
            "event_id": str(mock_event_id),
            "rule_name": "Early Bird Special",
            "occupancy_threshold": 50,
            "time_threshold": 72,
            "time_unit": "hours",
            "discount_percent": 20,
            "is_active": True,
            "priority": 1,
        }

    def test_evaluate_rule_match_found(
        self,
        mock_user_token,
        mock_user_id,
        valid_evaluation_request,
        mock_matching_rule,
    ):
        """Should return matching rule when conditions are met."""
        with (patch("api.discount_rules.fetch_records") as mock_fetch,):
            mock_fetch.return_value = [mock_matching_rule]

            response = client.post(
                "/api/pricing/discount-rules/evaluate",
                json=valid_evaluation_request,
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["rule_matched"] is True
            assert data["rule_id"] == mock_matching_rule["id"]
            assert data["rule_name"] == "Early Bird Special"
            assert data["discount_percent"] == 20
            assert "Rule 'Early Bird Special' matched" in data["message"]

    def test_evaluate_rule_no_match(
        self, mock_user_token, mock_user_id, valid_evaluation_request
    ):
        """Should return no match when conditions aren't met."""
        # High occupancy rule that won't match
        high_occupancy_rule = {
            "id": str(uuid4()),
            "organizer_id": str(mock_user_id),
            "event_id": None,
            "rule_name": "High Occupancy Rule",
            "occupancy_threshold": 30,  # Lower than actual 40%
            "time_threshold": 72,
            "time_unit": "hours",
            "discount_percent": 15,
            "is_active": True,
            "priority": 1,
        }

        with (patch("api.discount_rules.fetch_records") as mock_fetch,):
            mock_fetch.return_value = [high_occupancy_rule]

            response = client.post(
                "/api/pricing/discount-rules/evaluate",
                json=valid_evaluation_request,
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["rule_matched"] is False
            assert data["rule_id"] is None
            assert "No rules matched" in data["message"]

    def test_evaluate_rule_no_active_rules(
        self, mock_user_token, mock_user_id, valid_evaluation_request
    ):
        """Should return no match when no active rules exist."""
        with (patch("api.discount_rules.fetch_records") as mock_fetch,):
            mock_fetch.return_value = []

            response = client.post(
                "/api/pricing/discount-rules/evaluate",
                json=valid_evaluation_request,
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["rule_matched"] is False
            assert "No active discount rules found" in data["message"]

    def test_evaluate_rule_priority_selection(
        self, mock_user_token, mock_user_id, valid_evaluation_request
    ):
        """Should select highest priority rule when multiple match."""
        low_priority_rule = {
            "id": str(uuid4()),
            "organizer_id": str(mock_user_id),
            "event_id": None,
            "rule_name": "Low Priority Rule",
            "occupancy_threshold": 50,
            "time_threshold": 72,
            "time_unit": "hours",
            "discount_percent": 15,
            "is_active": True,
            "priority": 10,
        }
        high_priority_rule = {
            "id": str(uuid4()),
            "organizer_id": str(mock_user_id),
            "event_id": None,
            "rule_name": "High Priority Rule",
            "occupancy_threshold": 50,
            "time_threshold": 72,
            "time_unit": "hours",
            "discount_percent": 20,
            "is_active": True,
            "priority": 1,
        }

        with (patch("api.discount_rules.fetch_records") as mock_fetch,):
            mock_fetch.return_value = [low_priority_rule, high_priority_rule]

            response = client.post(
                "/api/pricing/discount-rules/evaluate",
                json=valid_evaluation_request,
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["rule_matched"] is True
            assert data["rule_name"] == "High Priority Rule"  # Priority 1 beats 10
            assert data["discount_percent"] == 20

    def test_evaluate_rule_time_unit_days(
        self, mock_user_token, mock_user_id, valid_evaluation_request
    ):
        """Should correctly handle time unit in days."""
        days_rule = {
            "id": str(uuid4()),
            "organizer_id": str(mock_user_id),
            "event_id": None,
            "rule_name": "Days Rule",
            "occupancy_threshold": 50,
            "time_threshold": 2,  # 2 days = 48 hours
            "time_unit": "days",
            "discount_percent": 25,
            "is_active": True,
            "priority": 1,
        }

        with (patch("api.discount_rules.fetch_records") as mock_fetch,):
            mock_fetch.return_value = [days_rule]

            response = client.post(
                "/api/pricing/discount-rules/evaluate",
                json=valid_evaluation_request,  # 24 hours before event
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["rule_matched"] is True
            assert data["discount_percent"] == 25

    def test_evaluate_rule_validation_errors(self, mock_user_token):
        """Should return 422 for invalid evaluation data."""
        # Test invalid occupancy_percent
        invalid_data = {
            "event_id": str(uuid4()),
            "occupancy_percent": 150,  # Invalid: > 100
            "hours_before_event": 24,
        }

        response = client.post(
            "/api/pricing/discount-rules/evaluate",
            json=invalid_data,
            headers={"Authorization": f"Bearer {mock_user_token}"},
        )
        assert response.status_code == 422

        # Test negative hours_before_event
        invalid_data = {
            "event_id": str(uuid4()),
            "occupancy_percent": 40,
            "hours_before_event": -5,  # Invalid: negative
        }

        response = client.post(
            "/api/pricing/discount-rules/evaluate",
            json=invalid_data,
            headers={"Authorization": f"Bearer {mock_user_token}"},
        )
        assert response.status_code == 422

    def test_evaluate_rule_unauthorized(self, valid_evaluation_request):
        """Should return 401 for unauthorized requests."""
        response = client.post(
            "/api/pricing/discount-rules/evaluate", json=valid_evaluation_request
        )
        assert response.status_code == 401


class TestDiscountRuleModels:
    """Tests for Pydantic models in discount rules."""

    def test_create_discount_rule_request_model(self):
        """Test CreateDiscountRuleRequest model validation."""
        from api.discount_rules import CreateDiscountRuleRequest

        # Valid request
        request = CreateDiscountRuleRequest(
            rule_name="Test Rule",
            occupancy_threshold=50,
            time_threshold=24,
            time_unit="hours",
            discount_percent=20,
        )
        assert request.rule_name == "Test Rule"
        assert request.time_unit == "hours"

        # Invalid request (should raise validation errors)
        with pytest.raises(ValueError):
            CreateDiscountRuleRequest(
                rule_name="",  # Empty string
                occupancy_threshold=50,
                time_threshold=24,
                time_unit="hours",
                discount_percent=20,
            )

    def test_update_discount_rule_request_model(self):
        """Test UpdateDiscountRuleRequest model validation."""
        from api.discount_rules import UpdateDiscountRuleRequest

        # Empty request (all fields optional)
        request = UpdateDiscountRuleRequest()
        assert request.rule_name is None
        assert request.discount_percent is None

        # Partial update
        request = UpdateDiscountRuleRequest(rule_name="Updated Name")
        assert request.rule_name == "Updated Name"
        assert request.discount_percent is None

    def test_evaluate_rule_request_model(self):
        """Test EvaluateRuleRequest model validation."""
        from api.discount_rules import EvaluateRuleRequest

        request = EvaluateRuleRequest(
            event_id=uuid4(),
            occupancy_percent=40,
            hours_before_event=24,
        )
        assert request.occupancy_percent == 40
        assert request.hours_before_event == 24

    def test_evaluate_rule_response_model(self):
        """Test EvaluateRuleResponse model creation."""
        from api.discount_rules import EvaluateRuleResponse

        # No match response
        response = EvaluateRuleResponse(rule_matched=False, message="No rules matched")
        assert response.rule_matched is False
        assert response.rule_id is None

        # Match response
        response = EvaluateRuleResponse(
            rule_matched=True,
            rule_id=uuid4(),
            rule_name="Test Rule",
            discount_percent=20,
            priority=1,
            message="Rule matched",
        )
        assert response.rule_matched is True
        assert response.discount_percent == 20
