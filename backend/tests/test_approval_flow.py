"""
Test cases for approval flow API endpoints
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


class TestApprovalFlowAPI:
    """Test approval flow API endpoints"""

    def test_submit_approval_request_success(self):
        """Test submitting an approval request successfully"""
        mock_user = {
            "id": "test-user-id",
            "email": "test@example.com",
        }

        request_data = {
            "requester_name": "John Doe",
            "requester_email": "john@example.com",
            "requester_phone": "+1 (555) 123-4567",
            "requester_bio": "Software developer",
            "requester_reason": "Interested in learning",
            "requester_social_links": {"linkedin": "https://linkedin.com/in/john"},
        }

        mock_rpc_response = {
            "success": True,
            "participant_id": "participant-123",
            "event_id": "event-456",
            "user_id": "test-user-id",
            "approval_status": "pending",
            "requester_name": "John Doe",
            "requester_email": "john@example.com",
            "is_waitlisted": False,
            "registered_at": "2024-01-15T10:30:00Z",
        }

        with patch("config.auth.AuthService.optional_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.call_rpc") as mock_call_rpc:
                mock_call_rpc.return_value = MagicMock(
                    data=[{"response": json.dumps(mock_rpc_response)}]
                )

                response = client.post(
                    "/api/events/event-456/request-approval",
                    json=request_data,
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 200
                data = response.json()
                assert data["id"] == "participant-123"
                assert data["event_id"] == "event-456"
                assert data["approval_status"] == "pending"
                assert data["requester_name"] == "John Doe"
                assert data["requester_email"] == "john@example.com"
                assert data["is_waitlisted"] is False

    def test_submit_approval_request_event_not_found(self):
        """Test submitting approval request for non-existent event"""
        mock_user = {"id": "test-user-id", "email": "test@example.com"}

        request_data = {
            "requester_name": "John Doe",
            "requester_email": "john@example.com",
        }

        mock_rpc_response = {
            "success": False,
            "error_code": "EVENT_NOT_FOUND",
            "error_message": "Event not found",
        }

        with patch("config.auth.AuthService.optional_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.call_rpc") as mock_call_rpc:
                mock_call_rpc.return_value = MagicMock(
                    data=[{"response": json.dumps(mock_rpc_response)}]
                )

                response = client.post(
                    "/api/events/non-existent-event/request-approval",
                    json=request_data,
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 404
                assert "not found" in response.json()["detail"].lower()

    def test_submit_approval_request_no_approval_required(self):
        """Test submitting approval request when event doesn't require approval"""
        mock_user = {"id": "test-user-id", "email": "test@example.com"}

        request_data = {
            "requester_name": "John Doe",
            "requester_email": "john@example.com",
        }

        mock_rpc_response = {
            "success": False,
            "error_code": "NO_APPROVAL_REQUIRED",
            "error_message": "This event does not require approval",
        }

        with patch("config.auth.AuthService.optional_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.call_rpc") as mock_call_rpc:
                mock_call_rpc.return_value = MagicMock(
                    data=[{"response": json.dumps(mock_rpc_response)}]
                )

                response = client.post(
                    "/api/events/event-456/request-approval",
                    json=request_data,
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 400
                assert "does not require approval" in response.json()["detail"].lower()

    def test_submit_approval_request_already_exists(self):
        """Test submitting approval request when one already exists"""
        mock_user = {"id": "test-user-id", "email": "test@example.com"}

        request_data = {
            "requester_name": "John Doe",
            "requester_email": "john@example.com",
        }

        mock_rpc_response = {
            "success": False,
            "error_code": "PENDING_EXISTS",
            "error_message": "You already have a pending request for this event",
        }

        with patch("config.auth.AuthService.optional_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.call_rpc") as mock_call_rpc:
                mock_call_rpc.return_value = MagicMock(
                    data=[{"response": json.dumps(mock_rpc_response)}]
                )

                response = client.post(
                    "/api/events/event-456/request-approval",
                    json=request_data,
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 400
                assert (
                    "already have a pending request"
                    in response.json()["detail"].lower()
                )

    def test_submit_approval_request_already_approved(self):
        """Test submitting approval request when user is already approved"""
        mock_user = {"id": "test-user-id", "email": "test@example.com"}

        request_data = {
            "requester_name": "John Doe",
            "requester_email": "john@example.com",
        }

        mock_rpc_response = {
            "success": False,
            "error_code": "ALREADY_APPROVED",
            "error_message": "You are already approved for this event",
        }

        with patch("config.auth.AuthService.optional_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.call_rpc") as mock_call_rpc:
                mock_call_rpc.return_value = MagicMock(
                    data=[{"response": json.dumps(mock_rpc_response)}]
                )

                response = client.post(
                    "/api/events/event-456/request-approval",
                    json=request_data,
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 400
                assert "already approved" in response.json()["detail"].lower()

    def test_submit_approval_request_event_full(self):
        """Test submitting approval request when event is full"""
        mock_user = {"id": "test-user-id", "email": "test@example.com"}

        request_data = {
            "requester_name": "John Doe",
            "requester_email": "john@example.com",
        }

        mock_rpc_response = {
            "success": False,
            "error_code": "EVENT_FULL",
            "error_message": "Event is at capacity",
        }

        with patch("config.auth.AuthService.optional_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.call_rpc") as mock_call_rpc:
                mock_call_rpc.return_value = MagicMock(
                    data=[{"response": json.dumps(mock_rpc_response)}]
                )

                response = client.post(
                    "/api/events/event-456/request-approval",
                    json=request_data,
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 400
                assert "full" in response.json()["detail"].lower()

    def test_submit_approval_request_guest_user(self):
        """Test submitting approval request as a guest (no auth)"""
        request_data = {
            "requester_name": "Guest User",
            "requester_email": "guest@example.com",
            "requester_phone": "+1 (555) 999-8888",
        }

        mock_rpc_response = {
            "success": True,
            "participant_id": "participant-789",
            "event_id": "event-456",
            "user_id": None,
            "approval_status": "pending",
            "requester_name": "Guest User",
            "requester_email": "guest@example.com",
            "is_waitlisted": False,
            "registered_at": "2024-01-15T10:30:00Z",
        }

        with patch("config.auth.AuthService.optional_auth") as mock_auth:
            mock_auth.return_value = None  # No authenticated user

            with patch("config.database.call_rpc") as mock_call_rpc:
                mock_call_rpc.return_value = MagicMock(
                    data=[{"response": json.dumps(mock_rpc_response)}]
                )

                response = client.post(
                    "/api/events/event-456/request-approval",
                    json=request_data,
                )

                assert response.status_code == 200
                data = response.json()
                assert data["id"] == "participant-789"
                assert data["user_id"] is None  # Guest user

    def test_get_my_approval_status_authenticated(self):
        """Test getting approval status for authenticated user"""
        mock_user = {"id": "test-user-id", "email": "test@example.com"}

        mock_participant_data = {
            "approval_status": "pending",
            "is_waitlisted": False,
            "waitlist_position": None,
            "rejection_reason": None,
            "registered_at": "2024-01-15T10:30:00Z",
        }

        with patch("config.auth.AuthService.optional_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.get_table") as mock_get_table:
                mock_table = MagicMock()
                mock_table.select.return_value.eq.return_value.eq.return_value.maybe_single.return_value.execute.return_value = MagicMock(
                    data=mock_participant_data
                )
                mock_get_table.return_value = mock_table

                response = client.get(
                    "/api/events/event-456/my-approval-status",
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 200
                data = response.json()
                assert data["has_requested"] is True
                assert data["approval_status"] == "pending"
                assert data["is_waitlisted"] is False

    def test_get_my_approval_status_by_email(self):
        """Test getting approval status by email for guest users"""
        mock_participant_data = {
            "approval_status": "approved",
            "is_waitlisted": False,
            "waitlist_position": None,
            "rejection_reason": None,
            "registered_at": "2024-01-15T10:30:00Z",
        }

        with patch("config.auth.AuthService.optional_auth") as mock_auth:
            mock_auth.return_value = None

            with patch("config.database.get_table") as mock_get_table:
                mock_table = MagicMock()
                mock_table.select.return_value.eq.return_value.eq.return_value.maybe_single.return_value.execute.return_value = MagicMock(
                    data=mock_participant_data
                )
                mock_get_table.return_value = mock_table

                response = client.get(
                    "/api/events/event-456/my-approval-status?email=guest@example.com",
                )

                assert response.status_code == 200
                data = response.json()
                assert data["has_requested"] is True
                assert data["approval_status"] == "approved"

    def test_get_my_approval_status_not_found(self):
        """Test getting approval status when no request exists"""
        mock_user = {"id": "test-user-id", "email": "test@example.com"}

        with patch("config.auth.AuthService.optional_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.get_table") as mock_get_table:
                mock_table = MagicMock()
                mock_table.select.return_value.eq.return_value.eq.return_value.maybe_single.return_value.execute.return_value = MagicMock(
                    data=None
                )
                mock_get_table.return_value = mock_table

                response = client.get(
                    "/api/events/event-456/my-approval-status",
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 200
                data = response.json()
                assert data["has_requested"] is False

    def test_get_approval_requests_as_organizer(self):
        """Test getting all approval requests for an event as organizer"""
        mock_user = {"id": "organizer-id", "email": "organizer@example.com"}

        mock_event = {
            "id": "event-456",
            "title": "Test Event",
            "organizer_id": "organizer-id",
        }

        mock_requests = [
            {
                "id": "req-1",
                "event_id": "event-456",
                "user_id": "user-1",
                "approval_status": "pending",
                "requester_name": "John Doe",
                "requester_email": "john@example.com",
                "is_waitlisted": False,
                "registered_at": "2024-01-15T10:30:00Z",
            },
            {
                "id": "req-2",
                "event_id": "event-456",
                "user_id": "user-2",
                "approval_status": "approved",
                "requester_name": "Jane Smith",
                "requester_email": "jane@example.com",
                "is_waitlisted": False,
                "registered_at": "2024-01-14T10:30:00Z",
                "approved_at": "2024-01-14T12:00:00Z",
            },
        ]

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.fetch_single_record") as mock_fetch_single:
                mock_fetch_single.return_value = mock_event

                with patch("config.database.fetch_records") as mock_fetch_records:
                    mock_fetch_records.return_value = mock_requests

                    response = client.get(
                        "/api/events/event-456/approval-requests",
                        headers={"Authorization": "Bearer valid-token"},
                    )

                    assert response.status_code == 200
                    data = response.json()
                    assert len(data) == 2
                    assert data[0]["approval_status"] == "pending"
                    assert data[1]["approval_status"] == "approved"

    def test_get_approval_requests_filtered_by_status(self):
        """Test getting approval requests filtered by status"""
        mock_user = {"id": "organizer-id", "email": "organizer@example.com"}

        mock_event = {
            "id": "event-456",
            "title": "Test Event",
            "organizer_id": "organizer-id",
        }

        mock_pending_requests = [
            {
                "id": "req-1",
                "event_id": "event-456",
                "approval_status": "pending",
                "requester_name": "John Doe",
                "requester_email": "john@example.com",
            },
        ]

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.fetch_single_record") as mock_fetch_single:
                mock_fetch_single.return_value = mock_event

                with patch("config.database.fetch_records") as mock_fetch_records:
                    mock_fetch_records.return_value = mock_pending_requests

                    response = client.get(
                        "/api/events/event-456/approval-requests?status=pending",
                        headers={"Authorization": "Bearer valid-token"},
                    )

                    assert response.status_code == 200
                    data = response.json()
                    assert len(data) == 1
                    assert data[0]["approval_status"] == "pending"

    def test_get_approval_requests_unauthorized(self):
        """Test getting approval requests as non-organizer"""
        mock_user = {"id": "other-user-id", "email": "other@example.com"}

        mock_event = {
            "id": "event-456",
            "title": "Test Event",
            "organizer_id": "organizer-id",  # Different from mock_user
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.fetch_single_record") as mock_fetch_single:
                mock_fetch_single.return_value = mock_event

                response = client.get(
                    "/api/events/event-456/approval-requests",
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 403
                assert "only the event organizer" in response.json()["detail"].lower()

    def test_approve_request_success(self):
        """Test approving a request successfully"""
        mock_user = {"id": "organizer-id", "email": "organizer@example.com"}

        mock_event = {
            "id": "event-456",
            "title": "Test Event",
            "organizer_id": "organizer-id",
        }

        mock_request = {
            "id": "req-1",
            "event_id": "event-456",
            "user_id": "user-1",
            "approval_status": "pending",
            "requester_name": "John Doe",
            "requester_email": "john@example.com",
        }

        mock_approved_request = {
            **mock_request,
            "approval_status": "approved",
            "approved_at": "2024-01-15T12:00:00Z",
            "approved_by": "organizer-id",
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.fetch_single_record") as mock_fetch_single:

                def mock_fetch_side_effect(table, id):
                    if table == "events":
                        return mock_event
                    elif table == "event_participants":
                        return mock_request
                    return None

                mock_fetch_single.side_effect = mock_fetch_side_effect

                with patch("config.database.update_record") as mock_update:
                    mock_update.return_value = mock_approved_request

                    response = client.post(
                        "/api/events/event-456/approval-requests/req-1/action",
                        json={"action": "approve"},
                        headers={"Authorization": "Bearer valid-token"},
                    )

                    assert response.status_code == 200
                    data = response.json()
                    assert data["approval_status"] == "approved"

    def test_reject_request_success(self):
        """Test rejecting a request with reason"""
        mock_user = {"id": "organizer-id", "email": "organizer@example.com"}

        mock_event = {
            "id": "event-456",
            "title": "Test Event",
            "organizer_id": "organizer-id",
        }

        mock_request = {
            "id": "req-1",
            "event_id": "event-456",
            "approval_status": "pending",
            "requester_name": "John Doe",
            "requester_email": "john@example.com",
        }

        mock_rejected_request = {
            **mock_request,
            "approval_status": "rejected",
            "rejection_reason": "Event is at capacity",
            "approved_at": "2024-01-15T12:00:00Z",
            "approved_by": "organizer-id",
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.fetch_single_record") as mock_fetch_single:

                def mock_fetch_side_effect(table, id):
                    if table == "events":
                        return mock_event
                    elif table == "event_participants":
                        return mock_request
                    return None

                mock_fetch_single.side_effect = mock_fetch_side_effect

                with patch("config.database.update_record") as mock_update:
                    mock_update.return_value = mock_rejected_request

                    response = client.post(
                        "/api/events/event-456/approval-requests/req-1/action",
                        json={
                            "action": "reject",
                            "rejection_reason": "Event is at capacity",
                        },
                        headers={"Authorization": "Bearer valid-token"},
                    )

                    assert response.status_code == 200
                    data = response.json()
                    assert data["approval_status"] == "rejected"
                    assert data["rejection_reason"] == "Event is at capacity"

    def test_waitlist_request_success(self):
        """Test waitlisting a request"""
        mock_user = {"id": "organizer-id", "email": "organizer@example.com"}

        mock_event = {
            "id": "event-456",
            "title": "Test Event",
            "organizer_id": "organizer-id",
        }

        mock_request = {
            "id": "req-1",
            "event_id": "event-456",
            "approval_status": "pending",
            "requester_name": "John Doe",
            "requester_email": "john@example.com",
        }

        mock_waitlisted_request = {
            **mock_request,
            "approval_status": "waitlisted",
            "is_waitlisted": True,
            "waitlist_position": 2,
            "approved_at": "2024-01-15T12:00:00Z",
            "approved_by": "organizer-id",
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.fetch_single_record") as mock_fetch_single:

                def mock_fetch_side_effect(table, id):
                    if table == "events":
                        return mock_event
                    elif table == "event_participants":
                        return mock_request
                    return None

                mock_fetch_single.side_effect = mock_fetch_side_effect

                with patch("config.database.update_record") as mock_update:
                    mock_update.return_value = mock_waitlisted_request

                    response = client.post(
                        "/api/events/event-456/approval-requests/req-1/action",
                        json={"action": "waitlist"},
                        headers={"Authorization": "Bearer valid-token"},
                    )

                    assert response.status_code == 200
                    data = response.json()
                    assert data["approval_status"] == "waitlisted"
                    assert data["is_waitlisted"] is True
                    assert data["waitlist_position"] == 2

    def test_approve_request_not_found(self):
        """Test approving a non-existent request"""
        mock_user = {"id": "organizer-id", "email": "organizer@example.com"}

        mock_event = {
            "id": "event-456",
            "title": "Test Event",
            "organizer_id": "organizer-id",
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.fetch_single_record") as mock_fetch_single:

                def mock_fetch_side_effect(table, id):
                    if table == "events":
                        return mock_event
                    elif table == "event_participants":
                        return None  # Request not found
                    return None

                mock_fetch_single.side_effect = mock_fetch_side_effect

                response = client.post(
                    "/api/events/event-456/approval-requests/non-existent/action",
                    json={"action": "approve"},
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 404

    def test_approve_request_unauthorized(self):
        """Test approving a request as non-organizer"""
        mock_user = {"id": "other-user-id", "email": "other@example.com"}

        mock_event = {
            "id": "event-456",
            "title": "Test Event",
            "organizer_id": "organizer-id",  # Different from mock_user
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.fetch_single_record") as mock_fetch_single:
                mock_fetch_single.return_value = mock_event

                response = client.post(
                    "/api/events/event-456/approval-requests/req-1/action",
                    json={"action": "approve"},
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 403

    def test_approve_request_invalid_action(self):
        """Test requesting an invalid action"""
        mock_user = {"id": "organizer-id", "email": "organizer@example.com"}

        mock_event = {
            "id": "event-456",
            "title": "Test Event",
            "organizer_id": "organizer-id",
        }

        mock_request = {
            "id": "req-1",
            "event_id": "event-456",
            "approval_status": "pending",
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.fetch_single_record") as mock_fetch_single:

                def mock_fetch_side_effect(table, id):
                    if table == "events":
                        return mock_event
                    elif table == "event_participants":
                        return mock_request
                    return None

                mock_fetch_single.side_effect = mock_fetch_side_effect

                response = client.post(
                    "/api/events/event-456/approval-requests/req-1/action",
                    json={"action": "invalid_action"},
                    headers={"Authorization": "Bearer valid-token"},
                )

                # Should fail validation - invalid action
                assert response.status_code == 422

    def test_delete_approval_requests_success(self):
        """Test deleting all approval requests for an event"""
        mock_user = {"id": "organizer-id", "email": "organizer@example.com"}

        mock_event = {
            "id": "event-456",
            "title": "Test Event",
            "organizer_id": "organizer-id",
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.fetch_single_record") as mock_fetch_single:
                mock_fetch_single.return_value = mock_event

                with patch("config.database.get_table") as mock_get_table:
                    mock_table = MagicMock()
                    mock_table.delete.return_value.eq.return_value.in_.return_value.execute.return_value = MagicMock(
                        data=[{"id": "req-1"}, {"id": "req-2"}]
                    )
                    mock_get_table.return_value = mock_table

                    response = client.delete(
                        "/api/events/event-456/approval-requests",
                        headers={"Authorization": "Bearer valid-token"},
                    )

                    assert response.status_code == 200
                    data = response.json()
                    assert data["deleted_count"] == 2

    def test_delete_approval_requests_unauthorized(self):
        """Test deleting approval requests as non-organizer"""
        mock_user = {"id": "other-user-id", "email": "other@example.com"}

        mock_event = {
            "id": "event-456",
            "title": "Test Event",
            "organizer_id": "organizer-id",
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.fetch_single_record") as mock_fetch_single:
                mock_fetch_single.return_value = mock_event

                response = client.delete(
                    "/api/events/event-456/approval-requests",
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 403


class TestApprovalFlowValidation:
    """Test validation for approval flow endpoints"""

    def test_submit_approval_request_missing_name(self):
        """Test submitting request without name"""
        request_data = {
            "requester_email": "john@example.com",
            # Missing requester_name
        }

        response = client.post(
            "/api/events/event-456/request-approval",
            json=request_data,
        )

        assert response.status_code == 422  # Validation error

    def test_submit_approval_request_missing_email(self):
        """Test submitting request without email"""
        request_data = {
            "requester_name": "John Doe",
            # Missing requester_email
        }

        response = client.post(
            "/api/events/event-456/request-approval",
            json=request_data,
        )

        assert response.status_code == 422  # Validation error

    def test_submit_approval_request_invalid_email_format(self):
        """Test submitting request with invalid email format"""
        mock_user = {"id": "test-user-id", "email": "test@example.com"}

        request_data = {
            "requester_name": "John Doe",
            "requester_email": "not-an-email",
        }

        # Note: Email validation happens at API level, basic format validation
        # may or may not fail depending on Pydantic version
        # This test documents the expected behavior

        with patch("config.auth.AuthService.optional_auth") as mock_auth:
            mock_auth.return_value = mock_user

            response = client.post(
                "/api/events/event-456/request-approval",
                json=request_data,
            )

            # Pydantic should reject invalid email
            assert response.status_code == 422

    def test_approve_request_missing_action(self):
        """Test approving request without specifying action"""
        mock_user = {"id": "organizer-id", "email": "organizer@example.com"}

        mock_event = {
            "id": "event-456",
            "title": "Test Event",
            "organizer_id": "organizer-id",
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.fetch_single_record") as mock_fetch_single:
                mock_fetch_single.return_value = mock_event

                response = client.post(
                    "/api/events/event-456/approval-requests/req-1/action",
                    json={},  # Missing action
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 422  # Validation error

    def test_reject_request_missing_reason_optional(self):
        """Test that rejection reason is optional"""
        mock_user = {"id": "organizer-id", "email": "organizer@example.com"}

        mock_event = {
            "id": "event-456",
            "title": "Test Event",
            "organizer_id": "organizer-id",
        }

        mock_request = {
            "id": "req-1",
            "event_id": "event-456",
            "approval_status": "pending",
            "requester_name": "John Doe",
            "requester_email": "john@example.com",
        }

        mock_rejected_request = {
            **mock_request,
            "approval_status": "rejected",
            "rejection_reason": None,
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.fetch_single_record") as mock_fetch_single:

                def mock_fetch_side_effect(table, id):
                    if table == "events":
                        return mock_event
                    elif table == "event_participants":
                        return mock_request
                    return None

                mock_fetch_single.side_effect = mock_fetch_side_effect

                with patch("config.database.update_record") as mock_update:
                    mock_update.return_value = mock_rejected_request

                    response = client.post(
                        "/api/events/event-456/approval-requests/req-1/action",
                        json={"action": "reject"},  # No reason provided
                        headers={"Authorization": "Bearer valid-token"},
                    )

                    # Should succeed - reason is optional
                    assert response.status_code == 200

    def test_reject_request_reason_too_long(self):
        """Test rejecting with reason exceeding max length"""
        mock_user = {"id": "organizer-id", "email": "organizer@example.com"}

        mock_event = {
            "id": "event-456",
            "title": "Test Event",
            "organizer_id": "organizer-id",
        }

        with patch("config.auth.AuthService.require_auth") as mock_auth:
            mock_auth.return_value = mock_user

            with patch("config.database.fetch_single_record") as mock_fetch_single:
                mock_fetch_single.return_value = mock_event

                response = client.post(
                    "/api/events/event-456/approval-requests/req-1/action",
                    json={
                        "action": "reject",
                        "rejection_reason": "x" * 501,  # Exceeds 500 char limit
                    },
                    headers={"Authorization": "Bearer valid-token"},
                )

                assert response.status_code == 422  # Validation error
