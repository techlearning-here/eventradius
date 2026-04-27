"""
Unit tests for database utilities.
"""

import os
from unittest.mock import Mock, patch

import pytest

from config.database import (
    SupabaseClient,
    call_rpc,
    delete_record,
    fetch_records,
    fetch_single_record,
    get_table,
    insert_record,
    update_record,
)


class TestSupabaseClient:
    """Test SupabaseClient singleton."""

    def test_get_client_singleton(self):
        """Test that get_client returns the same instance."""
        # Clear the singleton instance
        SupabaseClient._instance = None

        with patch("config.database.create_client") as mock_create_client:
            mock_client = Mock()
            mock_create_client.return_value = mock_client

            # First call should create instance
            client1 = SupabaseClient.get_client()
            assert client1 == mock_client
            mock_create_client.assert_called_once()

            # Second call should return same instance
            client2 = SupabaseClient.get_client()
            assert client2 == mock_client
            # create_client should still have been called only once
            mock_create_client.assert_called_once()

    def test_get_client_missing_env_vars(self):
        """Test get_client raises ValueError when env vars are missing."""
        SupabaseClient._instance = None

        with patch.dict(os.environ, {}, clear=True):
            with pytest.raises(
                ValueError,
                match="SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set",
            ):
                SupabaseClient.get_client()

    def test_test_connection_success(self):
        """Test test_connection returns True on successful connection."""
        SupabaseClient._instance = None

        with patch("config.database.create_client") as mock_create_client:
            mock_client = Mock()
            mock_table = Mock()
            mock_response = Mock()
            mock_response.data = []

            mock_client.table.return_value = mock_table
            mock_table.select.return_value = mock_table
            mock_table.limit.return_value = mock_table
            mock_table.execute.return_value = mock_response

            mock_create_client.return_value = mock_client

            result = SupabaseClient.test_connection()
            assert result is True

    def test_test_connection_failure(self):
        """Test test_connection returns False on connection failure."""
        SupabaseClient._instance = None

        with patch("config.database.create_client") as mock_create_client:
            mock_client = Mock()
            mock_client.table.side_effect = Exception("Connection failed")
            mock_create_client.return_value = mock_client

            result = SupabaseClient.test_connection()
            assert result is False


class TestDatabaseHelpers:
    """Test database helper functions."""

    def test_get_table(self):
        """Test get_table returns table reference."""
        mock_client = Mock()
        mock_table = Mock()
        mock_client.table.return_value = mock_table

        with patch(
            "config.database.SupabaseClient.get_client", return_value=mock_client
        ):
            result = get_table("events")
            assert result == mock_table
            mock_client.table.assert_called_once_with("events")

    def test_insert_record(self):
        """Test insert_record calls insert on table."""
        mock_table = Mock()
        mock_response = Mock()
        mock_response.data = [{"id": "123", "name": "Test"}]
        mock_table.insert.return_value = mock_table
        mock_table.execute.return_value = mock_response

        with patch("config.database.get_table", return_value=mock_table):
            data = {"name": "Test"}
            result = insert_record("events", data)

            mock_table.insert.assert_called_once_with(data)
            mock_table.execute.assert_called_once()
            assert result == mock_response

    def test_update_record(self):
        """Test update_record calls update on table."""
        mock_table = Mock()
        mock_response = Mock()
        mock_response.data = [{"id": "123", "name": "Updated"}]
        mock_table.update.return_value = mock_table
        mock_table.eq.return_value = mock_table
        mock_table.execute.return_value = mock_response

        with patch("config.database.get_table", return_value=mock_table):
            data = {"name": "Updated"}
            result = update_record("events", "123", data)

            mock_table.update.assert_called_once_with(data)
            mock_table.eq.assert_called_once_with("id", "123")
            mock_table.execute.assert_called_once()
            assert result == mock_response

    def test_delete_record(self):
        """Test delete_record calls delete on table."""
        mock_table = Mock()
        mock_response = Mock()
        mock_response.data = []
        mock_table.delete.return_value = mock_table
        mock_table.eq.return_value = mock_table
        mock_table.execute.return_value = mock_response

        with patch("config.database.get_table", return_value=mock_table):
            result = delete_record("events", "123")

            mock_table.delete.assert_called_once()
            mock_table.eq.assert_called_once_with("id", "123")
            mock_table.execute.assert_called_once()
            assert result == mock_response

    def test_fetch_records(self):
        """Test fetch_records with filters."""
        mock_table = Mock()
        mock_response = Mock()
        mock_response.data = [{"id": "1"}, {"id": "2"}]
        mock_table.select.return_value = mock_table
        mock_table.eq.return_value = mock_table
        mock_table.range.return_value = mock_table
        mock_table.execute.return_value = mock_response

        with patch("config.database.get_table", return_value=mock_table):
            filters = {"category": "music"}
            result = fetch_records("events", filters, limit=10, offset=0)

            mock_table.select.assert_called_once_with("*")
            mock_table.eq.assert_called_once_with("category", "music")
            mock_table.range.assert_called_once_with(0, 9)  # offset, offset + limit - 1
            mock_table.execute.assert_called_once()
            assert result == mock_response

    def test_fetch_records_no_filters(self):
        """Test fetch_records without filters."""
        mock_table = Mock()
        mock_response = Mock()
        mock_response.data = [{"id": "1"}]
        mock_table.select.return_value = mock_table
        mock_table.range.return_value = mock_table
        mock_table.execute.return_value = mock_response

        with patch("config.database.get_table", return_value=mock_table):
            result = fetch_records("events", limit=5, offset=10)

            mock_table.select.assert_called_once_with("*")
            # Should not call eq when no filters
            mock_table.eq.assert_not_called()
            mock_table.range.assert_called_once_with(
                10, 14
            )  # offset, offset + limit - 1
            mock_table.execute.assert_called_once()
            assert result == mock_response

    def test_fetch_single_record(self):
        """Test fetch_single_record."""
        mock_table = Mock()
        mock_response = Mock()
        mock_response.data = [{"id": "123", "name": "Test"}]
        mock_table.select.return_value = mock_table
        mock_table.eq.return_value = mock_table
        mock_table.single.return_value = mock_table
        mock_table.execute.return_value = mock_response

        with patch("config.database.get_table", return_value=mock_table):
            result = fetch_single_record("events", "123")

            mock_table.select.assert_called_once_with("*")
            mock_table.eq.assert_called_once_with("id", "123")
            mock_table.single.assert_called_once()
            mock_table.execute.assert_called_once()
            assert result == mock_response

    def test_fetch_single_record_not_found(self):
        """Test fetch_single_record when record doesn't exist."""
        mock_table = Mock()
        mock_response = Mock()
        mock_response.data = []
        mock_table.select.return_value = mock_table
        mock_table.eq.return_value = mock_table
        mock_table.single.return_value = mock_table
        mock_table.execute.return_value = mock_response

        with patch("config.database.get_table", return_value=mock_table):
            result = fetch_single_record("events", "999")

            assert result == mock_response


class TestCallRPC:
    """Test call_rpc function with error handling (commit 0b8542b)."""

    def test_call_rpc_success(self):
        """Test call_rpc returns result on successful RPC call."""
        mock_client = Mock()
        mock_response = Mock()
        mock_response.data = [{"success": True, "id": "123"}]
        mock_client.rpc.return_value.execute.return_value = mock_response

        with patch(
            "config.database.SupabaseClient.get_client", return_value=mock_client
        ):
            result = call_rpc("test_function", {"param": "value"})
            assert result == mock_response
            mock_client.rpc.assert_called_once_with("test_function", {"param": "value"})

    def test_call_rpc_json_extraction_from_error(self):
        """Test call_rpc extracts JSON from error when JSON could not be generated but code is 200."""
        mock_client = Mock()
        # Simulate error with embedded success JSON
        error = Exception(
            "JSON could not be generated 'code': 200, details': 'b\\'\"{\\'success\\': True, \\'id\\': \\'123\\'}\"''"
        )
        mock_client.rpc.return_value.execute.side_effect = error

        with patch(
            "config.database.SupabaseClient.get_client", return_value=mock_client
        ):
            result = call_rpc("submit_approval_request", {"event_id": "evt-123"})
            assert result.data[0]["success"] is True
            assert result.data[0]["id"] == "123"

    def test_call_rpc_bytes_extraction_fallback(self):
        """Test call_rpc extracts JSON from bytes literal format in error."""
        mock_client = Mock()
        error = Exception(
            "b'\"{\\'success\\': True, \\'participant_id\\': \\'456\\'}\"'"
        )
        mock_client.rpc.return_value.execute.side_effect = error

        with patch(
            "config.database.SupabaseClient.get_client", return_value=mock_client
        ):
            result = call_rpc("submit_approval_request", {})
            assert result.data[0]["success"] is True
            assert result.data[0]["participant_id"] == "456"

    def test_call_rpc_generic_fallback_extraction(self):
        """Test call_rpc uses generic fallback for success JSON objects."""
        mock_client = Mock()
        error = Exception("Some error {success: true, event_id: 'abc123'}")
        mock_client.rpc.return_value.execute.side_effect = error

        with patch(
            "config.database.SupabaseClient.get_client", return_value=mock_client
        ):
            result = call_rpc("test_func", {})
            assert result.data[0]["success"] is True
            assert result.data[0]["event_id"] == "abc123"

    def test_call_rpc_raises_on_unhandled_error(self):
        """Test call_rpc raises exception when error cannot be parsed."""
        mock_client = Mock()
        error = Exception("Some unparseable error without JSON")
        mock_client.rpc.return_value.execute.side_effect = error

        with patch(
            "config.database.SupabaseClient.get_client", return_value=mock_client
        ):
            with pytest.raises(Exception, match="Some unparseable error without JSON"):
                call_rpc("test_func", {})
