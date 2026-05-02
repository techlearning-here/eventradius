"""
Tests for the Deals API endpoints.
"""

from datetime import datetime, timedelta, timezone
from decimal import Decimal
from unittest.mock import MagicMock, patch
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


class TestGetEventDeal:
    """Tests for GET /api/deals/event/{event_id}"""

    @pytest.fixture
    def mock_event_id(self):
        return uuid4()

    @pytest.fixture
    def mock_user_token(self):
        return "valid_test_token"

    def test_event_no_active_promo_code(self, mock_event_id, mock_user_token):
        """Should return has_active_deal: false when no promo code exists."""
        with patch("api.deals.fetch_records") as mock_fetch:
            mock_fetch.return_value = []  # No promo codes found

            response = client.get(
                f"/api/deals/event/{mock_event_id}",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["has_active_deal"] is False
            assert data["discount_percent"] is None
            assert data["code"] is None

    def test_event_with_expired_promo_code(self, mock_event_id, mock_user_token):
        """Should return has_active_deal: false when promo code is expired."""
        with patch("api.deals.fetch_records") as mock_fetch:
            mock_fetch.return_value = [
                {
                    "code": "EXPIRED20",
                    "discount_percent": 20,
                    "is_active": True,
                    "valid_until": (
                        datetime.now(timezone.utc) - timedelta(days=1)
                    ).isoformat(),
                    "times_claimed": 0,
                    "max_uses": 100,
                }
            ]

            response = client.get(
                f"/api/deals/event/{mock_event_id}",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["has_active_deal"] is False

    def test_event_with_maxed_out_promo_code(self, mock_event_id, mock_user_token):
        """Should return has_active_deal: false when promo code reached max uses."""
        with patch("api.deals.fetch_records") as mock_fetch:
            mock_fetch.return_value = [
                {
                    "code": "SOLDOUT50",
                    "discount_percent": 50,
                    "is_active": True,
                    "valid_until": (
                        datetime.now(timezone.utc) + timedelta(days=7)
                    ).isoformat(),
                    "times_claimed": 100,
                    "max_uses": 100,
                }
            ]

            response = client.get(
                f"/api/deals/event/{mock_event_id}",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["has_active_deal"] is False

    def test_event_with_active_deal(self, mock_event_id, mock_user_token):
        """Should return full deal info when promo code is active and valid."""
        with (
            patch("api.deals.fetch_records") as mock_fetch,
            patch("api.deals.fetch_single_record") as mock_fetch_single,
        ):

            mock_fetch.side_effect = [
                # First call: promo_codes
                [
                    {
                        "code": "SAVE30",
                        "discount_percent": 30,
                        "discount_amount": None,
                        "is_active": True,
                        "valid_until": (
                            datetime.now(timezone.utc) + timedelta(days=7)
                        ).isoformat(),
                        "times_claimed": 5,
                        "max_uses": 100,
                    }
                ],
                # Second call: inventory_snapshots
                [{"tickets_remaining": 45}],
            ]

            mock_fetch_single.return_value = {"base_price": Decimal("100.00")}

            response = client.get(
                f"/api/deals/event/{mock_event_id}",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["has_active_deal"] is True
            assert data["discount_percent"] == 30
            assert data["original_price"] == 100.00
            assert data["discounted_price"] == 70.00
            assert data["seats_remaining"] == 45
            assert data["code"] == "SAVE30"

    def test_event_with_discount_amount(self, mock_event_id, mock_user_token):
        """Should calculate discounted price using discount_amount."""
        with (
            patch("api.deals.fetch_records") as mock_fetch,
            patch("api.deals.fetch_single_record") as mock_fetch_single,
        ):

            mock_fetch.side_effect = [
                [
                    {
                        "code": "SAVE20",
                        "discount_percent": None,
                        "discount_amount": Decimal("20.00"),
                        "is_active": True,
                        "valid_until": (
                            datetime.now(timezone.utc) + timedelta(days=7)
                        ).isoformat(),
                        "times_claimed": 0,
                        "max_uses": 100,
                    }
                ],
                [{"tickets_remaining": 100}],
            ]

            mock_fetch_single.return_value = {"base_price": Decimal("100.00")}

            response = client.get(
                f"/api/deals/event/{mock_event_id}",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["has_active_deal"] is True
            assert data["discount_amount"] == 20.00
            assert data["discounted_price"] == 80.00

    def test_event_no_pricing_rule(self, mock_event_id, mock_user_token):
        """Should return has_active_deal: false when no pricing rule exists."""
        with (
            patch("api.deals.fetch_records") as mock_fetch,
            patch("api.deals.fetch_single_record") as mock_fetch_single,
        ):

            mock_fetch.return_value = [
                {
                    "code": "SAVE25",
                    "discount_percent": 25,
                    "is_active": True,
                    "valid_until": (
                        datetime.now(timezone.utc) + timedelta(days=7)
                    ).isoformat(),
                    "times_claimed": 0,
                    "max_uses": 100,
                }
            ]

            mock_fetch_single.return_value = None  # No pricing rule

            response = client.get(
                f"/api/deals/event/{mock_event_id}",
                headers={"Authorization": f"Bearer {mock_user_token}"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["has_active_deal"] is False

    def test_optional_auth_works_without_token(self, mock_event_id):
        """Should work without authentication (public endpoint)."""
        with patch("api.deals.fetch_records") as mock_fetch:
            mock_fetch.return_value = []  # No promo codes

            response = client.get(f"/api/deals/event/{mock_event_id}")

            assert response.status_code == 200
            data = response.json()
            assert data["has_active_deal"] is False


class TestEventDealInfoModel:
    """Tests for the EventDealInfo Pydantic model."""

    def test_model_creation_with_required_fields(self):
        from api.deals import EventDealInfo

        deal = EventDealInfo(has_active_deal=False)

        assert deal.has_active_deal is False
        assert deal.discount_percent is None
        assert deal.code is None

    def test_model_creation_with_full_data(self):
        from api.deals import EventDealInfo

        deal = EventDealInfo(
            has_active_deal=True,
            discount_percent=30,
            discount_amount=Decimal("15.00"),
            original_price=Decimal("100.00"),
            discounted_price=Decimal("85.00"),
            seats_remaining=25,
            valid_until="2026-05-15T23:59:59Z",
            code="SUMMER30",
        )

        assert deal.has_active_deal is True
        assert deal.discount_percent == 30
        assert deal.discount_amount == Decimal("15.00")
        assert deal.code == "SUMMER30"
