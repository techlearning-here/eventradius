import sys

sys.path.insert(0, ".")

from datetime import datetime, timedelta
from unittest.mock import Mock, call, patch

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

# Run the test_participate_event logic
event_id = "event-123"
mock_user = {"id": "user-456"}
mock_event = {
    "id": "event-123",
    "title": "Test Event",
    "description": "Test description",
    "location": "Test Location",
    "start_time": (datetime.utcnow() + timedelta(days=1)).isoformat(),
    "end_time": (datetime.utcnow() + timedelta(days=1, hours=2)).isoformat(),
    "category": "music",
    "max_participants": 100,
    "current_participants": 10,
    "organizer_id": "user-123",
    "is_public": True,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
}

print("Testing participate_event endpoint with better debugging...")

with patch("config.auth.auth_service.require_auth", return_value=mock_user):
    with patch("api.events.fetch_single_record") as mock_fetch:
        fetch_response = Mock()
        fetch_response.data = mock_event
        mock_fetch.return_value = fetch_response
        with patch("api.events.insert_record") as mock_insert:
            insert_response = Mock()
            insert_response.data = [{"event_id": event_id, "user_id": "user-456"}]
            mock_insert.return_value = insert_response
            with patch("api.events.update_record") as mock_update:
                update_response = Mock()
                update_response.data = [{**mock_event, "current_participants": 11}]
                mock_update.return_value = update_response
                with patch("api.events.get_table") as mock_get_table:
                    mock_table = Mock()

                    # Track calls
                    calls = []

                    def track_call(name, *args, **kwargs):
                        calls.append((name, args, kwargs))
                        print(f"  Call: {name}{args}")

                    # First call: check existing participation
                    mock_select1 = Mock()
                    mock_eq1 = Mock()
                    mock_eq2 = Mock()
                    mock_execute1 = Mock()
                    mock_execute1.data = []  # No existing participation

                    # Second call: count participants
                    mock_select2 = Mock()
                    mock_eq3 = Mock()
                    mock_execute2 = Mock()
                    mock_execute2.count = 10  # Current count

                    # Set up the chain for first call
                    mock_table.select.return_value = mock_select1

                    # Track the calls
                    original_eq = mock_select1.eq

                    def tracked_eq(*args, **kwargs):
                        track_call("select1.eq", *args, **kwargs)
                        return original_eq(*args, **kwargs)

                    mock_select1.eq.side_effect = tracked_eq

                    # Set up side effect to return different mocks
                    mock_select1.eq.side_effect = [mock_eq1, mock_eq2]

                    # Set up execute on mock_eq2
                    mock_eq2.execute.return_value = mock_execute1

                    # For second call, we need to handle .select("*", count="exact")
                    mock_table.select.side_effect = [
                        mock_select1,  # First call: select("*")
                        mock_select2,  # Second call: select("*", count="exact")
                    ]
                    mock_select2.eq.return_value = mock_eq3
                    mock_eq3.execute.return_value = mock_execute2

                    mock_get_table.return_value = mock_table

                    response = client.post(
                        f"/api/events/{event_id}/participate",
                        headers={"Authorization": "Bearer test-token"},
                    )

                    print(f"\nStatus: {response.status_code}")
                    print(f"Response: {response.json()}")

                    # Debug: Check what the API is actually doing
                    print(f"\nMock calls made:")
                    print(f"  fetch_single_record called: {mock_fetch.called}")
                    print(f"  get_table called: {mock_get_table.called}")
                    if mock_get_table.called:
                        print(f"  get_table call count: {mock_get_table.call_count}")
                        print(f"  get_table call args: {mock_get_table.call_args_list}")

                    print(f"\nAll tracked calls:")
                    for name, args, kwargs in calls:
                        print(f"  {name}{args}")
