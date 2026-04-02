"""
Event-related API endpoints.
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from config.auth import get_current_user, optional_auth
from config.database import (
    delete_record,
    fetch_records,
    fetch_single_record,
    get_table,
    insert_record,
    update_record,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/events", tags=["events"])


# Pydantic models
class EventBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    location: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    max_participants: Optional[int] = Field(None, ge=1)
    is_public: bool = True


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    location: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    max_participants: Optional[int] = Field(None, ge=1)
    is_public: Optional[bool] = None


class EventResponse(EventBase):
    id: str
    organizer_id: str
    created_at: str
    updated_at: str
    current_participants: Optional[int] = 0

    class Config:
        from_attributes = True


# Event endpoints
@router.get("/", response_model=List[EventResponse])
async def get_events(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    category: Optional[str] = None,
    is_public: Optional[bool] = None,
    user: Optional[dict] = Depends(optional_auth),
):
    """
    Get events with filtering and pagination.
    Public events are visible to all, private events only to organizers.
    """
    try:
        filters = {}

        # Apply filters
        if category:
            filters["category"] = category

        if is_public is not None:
            filters["is_public"] = is_public

        # If user is not authenticated, we would filter by is_public
        # but the column doesn't exist in the current schema
        # For now, show all events regardless of authentication
        # TODO: Add is_public column or implement proper visibility logic

        response = fetch_records("events", filters, limit, offset)

        # Transform data
        events = []
        for event in response.data:
            # Count participants
            participants_response = (
                get_table("event_participants")
                .select("*", count="exact")
                .eq("event_id", event["id"])
                .execute()
            )

            event["current_participants"] = participants_response.count or 0
            events.append(event)

        return events
    except Exception as e:
        logger.error(f"Error fetching events: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch events",
        )


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: str, user: Optional[dict] = Depends(optional_auth)):
    """
    Get a specific event by ID.
    """
    try:
        response = fetch_single_record("events", event_id)

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
            )

        event = response.data

        # Check if user can view private event
        if not event.get("is_public") and (
            not user or user["id"] != event.get("organizer_id")
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to view this event",
            )

        # Count participants
        participants_response = (
            get_table("event_participants")
            .select("*", count="exact")
            .eq("event_id", event_id)
            .execute()
        )

        event["current_participants"] = participants_response.count or 0

        return event
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching event {event_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch event",
        )


@router.post("/", response_model=EventResponse)
async def create_event(event: EventCreate, user: dict = Depends(get_current_user)):
    """
    Create a new event.
    Requires authentication.
    """
    try:
        event_data = event.dict()
        event_data["organizer_id"] = user["id"]

        response = insert_record("events", event_data)

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create event",
            )

        created_event = response.data[0]
        created_event["current_participants"] = 0

        return created_event
    except Exception as e:
        logger.error(f"Error creating event: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create event",
        )


@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: str, event_update: EventUpdate, user: dict = Depends(get_current_user)
):
    """
    Update an existing event.
    Only the event organizer can update.
    """
    try:
        # Check if event exists and user is organizer
        existing_response = fetch_single_record("events", event_id)

        if not existing_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
            )

        existing_event = existing_response.data

        if existing_event.get("organizer_id") != user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to update this event",
            )

        # Prepare update data
        update_data = {k: v for k, v in event_update.dict().items() if v is not None}

        if not update_data:
            return existing_event

        response = update_record("events", event_id, update_data)

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update event",
            )

        updated_event = response.data[0]

        # Count participants
        participants_response = (
            get_table("event_participants")
            .select("*", count="exact")
            .eq("event_id", event_id)
            .execute()
        )

        updated_event["current_participants"] = participants_response.count or 0

        return updated_event
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating event {event_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update event",
        )


@router.delete("/{event_id}")
async def delete_event(event_id: str, user: dict = Depends(get_current_user)):
    """
    Delete an event.
    Only the event organizer can delete.
    """
    try:
        # Check if event exists and user is organizer
        existing_response = fetch_single_record("events", event_id)

        if not existing_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
            )

        existing_event = existing_response.data

        if existing_event.get("organizer_id") != user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to delete this event",
            )

        # Delete event participants first (cascade)
        get_table("event_participants").delete().eq("event_id", event_id).execute()

        # Delete event
        delete_record("events", event_id)

        return {"message": "Event deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting event {event_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete event",
        )


@router.post("/{event_id}/participate")
async def participate_event(event_id: str, user: dict = Depends(get_current_user)):
    """
    Participate in an event.
    """
    try:
        # Check if event exists and is public
        event_response = fetch_single_record("events", event_id)

        if not event_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
            )

        event = event_response.data

        # Check if event is public or user is organizer
        if not event.get("is_public") and event.get("organizer_id") != user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="This is a private event"
            )

        # Check if user is already participating
        existing_participation = (
            get_table("event_participants")
            .select("*")
            .eq("event_id", event_id)
            .eq("user_id", user["id"])
            .execute()
        )

        if existing_participation.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You are already participating in this event",
            )

        # Check max participants
        if event.get("max_participants"):
            participants_response = (
                get_table("event_participants")
                .select("*", count="exact")
                .eq("event_id", event_id)
                .execute()
            )

            current_count = participants_response.count or 0

            if current_count >= event["max_participants"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail="Event is full"
                )

        # Add participation
        participation_data = {"event_id": event_id, "user_id": user["id"]}

        insert_record("event_participants", participation_data)

        return {"message": "Successfully joined event"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error participating in event {event_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to join event",
        )


@router.delete("/{event_id}/participate")
async def leave_event(event_id: str, user: dict = Depends(get_current_user)):
    """
    Leave an event.
    """
    try:
        # Remove participation
        get_table("event_participants").delete().eq("event_id", event_id).eq(
            "user_id", user["id"]
        ).execute()

        return {"message": "Successfully left event"}
    except Exception as e:
        logger.error(f"Error leaving event {event_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to leave event",
        )


# Admin endpoints
@router.put("/{event_id}/status")
async def update_event_status(
    event_id: str, 
    status: str, 
    admin_remark: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    """
    Update event status (admin only).
    """
    # TODO: Add admin role check
    try:
        update_data = {"status": status}
        if admin_remark:
            update_data["admin_remark"] = admin_remark
            
        response = update_record("events", event_id, update_data)
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Event not found"
            )
        
        return {"message": f"Event {status} successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating event status {event_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update event status",
        )
