"""
Event-related API endpoints.
"""

import logging
from datetime import datetime
from typing import List, Literal, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, ConfigDict, Field

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
    is_paid_event: bool = False
    ticketing_website: Optional[str] = None
    # Event contact info from ContactInfo step
    event_contact_phone: Optional[str] = None
    event_contact_phone_country_code: Optional[str] = None
    event_contact_email: Optional[str] = None
    # Additional fields from EventWizard
    subtitle: Optional[str] = None
    summary: Optional[str] = None
    timezone: Optional[str] = None
    doors_open_time: Optional[str] = None
    registration_start_time: Optional[str] = None
    registration_end_time: Optional[str] = None
    event_website: Optional[str] = None
    tags: Optional[List[str]] = None
    event_format: Optional[str] = None
    event_privacy: Optional[str] = None
    virtual_event_platform: Optional[str] = None
    event_password: Optional[str] = None
    age_restriction: Optional[str] = None
    accessibility_options: Optional[str] = None
    custom_refund_policy: Optional[str] = None
    ticket_pricing_description: Optional[str] = None
    # Venue fields
    venue_street: Optional[str] = None
    venue_city: Optional[str] = None
    venue_state: Optional[str] = None
    venue_zip_code: Optional[str] = None
    venue_country: Optional[str] = None
    venue_building_name: Optional[str] = None
    # Virtual event URL
    virtual_event_url: Optional[str] = None
    # Status
    status: Optional[
        Literal["draft", "published", "upcoming", "completed", "cancelled"]
    ] = None
    # Language
    language: Optional[str] = None


class EventAttributes(BaseModel):
    """Extended event attributes for audience, accessibility, cultural, prerequisites, and content."""

    # Audience & Demographics
    age_categories: Optional[List[str]] = None
    gender_preference: Optional[str] = None
    family_friendly: Optional[bool] = None
    senior_friendly: Optional[bool] = None
    singles_friendly: Optional[bool] = None
    couples_oriented: Optional[bool] = None

    # Accessibility
    wheelchair_accessible: Optional[bool] = None
    mobility_friendly: Optional[bool] = None
    hearing_accessible: Optional[bool] = None
    vision_accessible: Optional[bool] = None
    sensory_friendly: Optional[bool] = None
    service_animals_allowed: Optional[bool] = None
    accessibility_notes: Optional[str] = None

    # Cultural Context
    religious_context: Optional[List[str]] = None
    dietary_context: Optional[List[str]] = None
    traditional_attire: Optional[str] = None

    # Prerequisites
    skill_level: Optional[str] = None
    prior_experience: Optional[str] = None
    physical_fitness: Optional[str] = None
    equipment_required: Optional[List[str]] = None
    dress_code: Optional[str] = None
    prerequisites_notes: Optional[str] = None

    # Content & Intensity
    content_rating: Optional[str] = None
    alcohol_served: Optional[str] = None
    smoking_policy: Optional[str] = None
    noise_level: Optional[str] = None
    physical_intensity: Optional[str] = None

    # Social Features
    networking_focus: Optional[bool] = None
    social_mixer: Optional[bool] = None
    ice_breakers: Optional[bool] = None
    group_activities: Optional[bool] = None
    team_building: Optional[bool] = None

    # Language
    primary_language: Optional[str] = None
    secondary_languages: Optional[List[str]] = None
    interpretation_available: Optional[bool] = None
    sign_language_interpreter: Optional[bool] = None

    # Format & Type
    event_type: Optional[str] = None
    format: Optional[str] = None
    sub_category: Optional[str] = None

    # Pricing
    refund_policy: Optional[
        Literal[
            "no_refunds",
            "refund_up_to_7_days",
            "refund_up_to_24_hours",
            "refund_up_to_1_hour",
            "custom",
        ]
    ] = None
    group_discounts: Optional[bool] = None

    # Quick Create fields
    ticket_price: Optional[float] = Field(None, ge=0)
    require_approval: Optional[bool] = None
    enable_waitlist: Optional[bool] = None


class EventCreate(EventBase, EventAttributes):
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
    is_paid_event: Optional[bool] = None
    ticketing_website: Optional[str] = None
    # Event contact info from ContactInfo step
    event_contact_phone: Optional[str] = None
    event_contact_phone_country_code: Optional[str] = None
    event_contact_email: Optional[str] = None
    # Additional fields from EventWizard
    subtitle: Optional[str] = None
    summary: Optional[str] = None
    timezone: Optional[str] = None
    doors_open_time: Optional[str] = None
    registration_start_time: Optional[str] = None
    registration_end_time: Optional[str] = None
    event_website: Optional[str] = None
    tags: Optional[List[str]] = None
    event_format: Optional[str] = None
    event_privacy: Optional[str] = None
    virtual_event_platform: Optional[str] = None
    event_password: Optional[str] = None
    age_restriction: Optional[str] = None
    accessibility_options: Optional[str] = None
    custom_refund_policy: Optional[str] = None
    ticket_pricing_description: Optional[str] = None

    # Quick Create fields
    ticket_price: Optional[float] = Field(None, ge=0)
    require_approval: Optional[bool] = None
    enable_waitlist: Optional[bool] = None

    # New attributes
    age_categories: Optional[List[str]] = None
    gender_preference: Optional[str] = None
    family_friendly: Optional[bool] = None
    senior_friendly: Optional[bool] = None
    singles_friendly: Optional[bool] = None
    couples_oriented: Optional[bool] = None
    wheelchair_accessible: Optional[bool] = None
    mobility_friendly: Optional[bool] = None
    hearing_accessible: Optional[bool] = None
    vision_accessible: Optional[bool] = None
    sensory_friendly: Optional[bool] = None
    service_animals_allowed: Optional[bool] = None
    accessibility_notes: Optional[str] = None
    religious_context: Optional[List[str]] = None
    dietary_context: Optional[List[str]] = None
    traditional_attire: Optional[str] = None
    skill_level: Optional[str] = None
    prior_experience: Optional[str] = None
    physical_fitness: Optional[str] = None
    equipment_required: Optional[List[str]] = None
    dress_code: Optional[str] = None
    prerequisites_notes: Optional[str] = None
    content_rating: Optional[str] = None
    alcohol_served: Optional[str] = None
    smoking_policy: Optional[str] = None
    noise_level: Optional[str] = None
    physical_intensity: Optional[str] = None
    networking_focus: Optional[bool] = None
    social_mixer: Optional[bool] = None
    ice_breakers: Optional[bool] = None
    group_activities: Optional[bool] = None
    team_building: Optional[bool] = None

    # Language
    primary_language: Optional[str] = None
    secondary_languages: Optional[List[str]] = None
    interpretation_available: Optional[bool] = None
    sign_language_interpreter: Optional[bool] = None

    # Format & Type
    event_type: Optional[str] = None
    format: Optional[str] = None
    sub_category: Optional[str] = None

    # Pricing
    refund_policy: Optional[
        Literal[
            "no_refunds",
            "refund_up_to_7_days",
            "refund_up_to_24_hours",
            "refund_up_to_1_hour",
            "custom",
        ]
    ] = None
    group_discounts: Optional[bool] = None

    # Quick Create fields
    ticket_price: Optional[float] = None
    require_approval: Optional[bool] = None
    enable_waitlist: Optional[bool] = None

    # Venue fields
    venue_street: Optional[str] = None
    venue_city: Optional[str] = None
    venue_state: Optional[str] = None
    venue_zip_code: Optional[str] = None
    venue_country: Optional[str] = None
    venue_building_name: Optional[str] = None
    # Virtual event URL
    virtual_event_url: Optional[str] = None
    # Status
    status: Optional[
        Literal["draft", "published", "upcoming", "completed", "cancelled"]
    ] = None
    # Language
    language: Optional[str] = None


class EventResponse(EventBase, EventAttributes):
    id: str
    organizer_id: str
    created_at: str
    updated_at: str
    current_participants: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


# Event endpoints
@router.get("/", response_model=List[EventResponse])
async def get_events(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    category: Optional[str] = None,
    is_public: Optional[bool] = None,
    status: Optional[str] = Query(
        None, description="Filter by status: draft, published"
    ),
    user: Optional[dict] = Depends(optional_auth),
):
    """
    Get events with filtering and pagination.
    Public events are visible to all, private events only to organizers.
    """
    try:
        table = get_table("events")
        query = table.select("*")

        # Apply filters
        if category:
            query = query.eq("category", category)
            logger.info(f"Filtering by category: {category}")

        if is_public is not None:
            query = query.eq("is_public", is_public)
            logger.info(f"Filtering by is_public: {is_public}")

        # Exclude soft-deleted events
        query = query.is_("deleted_at", "null")

        # Filter by status - default to published/upcoming only for discover view
        if status:
            query = query.eq("status", status)
            logger.info(f"Filtering by status: {status}")
        else:
            # Default: show published, upcoming OR events with no status (backward compat)
            query = query.or_("status.eq.published,status.eq.upcoming,status.is.null")
            logger.info("Default filter: status=published/upcoming OR status is null")

        response = query.limit(limit).offset(offset).execute()

        logger.info(f"[get_events] Query returned {len(response.data)} events")

        # Transform data
        events = []
        for event in response.data:
            # For now, set participant count to 0
            # TODO: Fix event_participants table access
            event["current_participants"] = 0
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
        table = get_table("events")
        response = (
            table.select("*").eq("id", event_id).is_("deleted_at", "null").execute()
        )

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
            )

        event = response.data[0]

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

        logger.info("=== GET EVENT DEBUG ===")
        logger.info(f"Event ID: {event_id}")
        logger.info(f"Event keys: {list(event.keys())}")
        logger.info("Attribute fields in response:")
        logger.info(f"  age_categories: {event.get('age_categories')}")
        logger.info(f"  gender_preference: {event.get('gender_preference')}")
        logger.info(f"  family_friendly: {event.get('family_friendly')}")
        logger.info(f"  wheelchair_accessible: {event.get('wheelchair_accessible')}")
        logger.info(f"  religious_context: {event.get('religious_context')}")
        logger.info(f"  skill_level: {event.get('skill_level')}")
        logger.info("=======================")

        return event
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching event {event_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch event",
        )


async def _create_event_logic(event: EventCreate, user: dict) -> EventResponse:
    """Shared logic for creating an event."""
    try:
        event_data = event.model_dump()
        event_data["organizer_id"] = user["id"]

        logger.info("=== BACKEND DEBUG ===")
        logger.info(f"Received event data keys: {list(event_data.keys())}")
        logger.info(f"User creating event: {user.get('id', 'unknown')}")
        logger.info("Attribute fields:")
        logger.info(f"  age_categories: {event_data.get('age_categories')}")
        logger.info(f"  gender_preference: {event_data.get('gender_preference')}")
        logger.info(f"  family_friendly: {event_data.get('family_friendly')}")
        logger.info(
            f"  wheelchair_accessible: {event_data.get('wheelchair_accessible')}"
        )
        logger.info(f"  religious_context: {event_data.get('religious_context')}")
        logger.info(f"  skill_level: {event_data.get('skill_level')}")
        logger.info(f"  ticketing_website: '{event_data.get('ticketing_website')}'")
        logger.info(f"  event_website: '{event_data.get('event_website')}'")
        logger.info(f"  is_paid_event: {event_data.get('is_paid_event')}")
        logger.info("=====================")

        response = insert_record("events", event_data)

        if not response.data:
            logger.error(f"Insert failed - no data returned. Response: {response}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create event - database returned no data",
            )

        created_event = response.data[0]
        created_event["current_participants"] = 0
        logger.info(f"Event created successfully: {created_event.get('id')}")

        return created_event
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating event: {type(e).__name__}: {e}")
        import traceback

        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create event: {str(e)}",
        )


@router.post("/", response_model=EventResponse)
async def create_event(event: EventCreate, user: dict = Depends(get_current_user)):
    """
    Create a new event (with trailing slash).
    Requires authentication.
    """
    return await _create_event_logic(event, user)


@router.post("", response_model=EventResponse)
async def create_event_no_slash(
    event: EventCreate, user: dict = Depends(get_current_user)
):
    """
    Create a new event (without trailing slash).
    Requires authentication.
    """
    return await _create_event_logic(event, user)


@router.post("/seed-dummy-events", response_model=dict)
async def seed_dummy_events(user: dict = Depends(get_current_user)):
    """Seed dummy events for testing purposes."""
    try:
        import uuid
        from datetime import datetime, timedelta

        # Get user's organizer_id or create one
        user_id = user.get("id", str(uuid.uuid4()))

        # Sample dummy events data - using only core fields that exist in DB
        dummy_events = [
            {
                "title": "Seniors Social Tea & Conversation",
                "description": "Join us for a relaxing afternoon tea with stimulating conversation and gentle music. Perfect for seniors looking to connect and socialize.",
                "category": "social",
                "location": "Golden Years Community Center, 45 Park Avenue",
                "start_time": (datetime.now() + timedelta(days=5)).isoformat(),
                "end_time": (datetime.now() + timedelta(days=5, hours=2)).isoformat(),
                "max_participants": 25,
                "is_public": True,
                "is_paid_event": True,
            },
            {
                "title": "Tech Networking Happy Hour",
                "description": "Connect with fellow tech professionals in a relaxed setting. Great for developers, designers, product managers, and entrepreneurs.",
                "category": "networking",
                "location": "The Craft Brewery, Downtown District",
                "start_time": (datetime.now() + timedelta(days=7)).isoformat(),
                "end_time": (datetime.now() + timedelta(days=7, hours=3)).isoformat(),
                "max_participants": 60,
                "is_public": True,
                "is_paid_event": True,
            },
            {
                "title": "Beach Volleyball Tournament",
                "description": "Fun beach volleyball tournament for all skill levels. Teams of 4 players. Equipment provided. Come ready to play!",
                "category": "sports",
                "location": "Ocean Beach, San Francisco",
                "start_time": (datetime.now() + timedelta(days=3)).isoformat(),
                "end_time": (datetime.now() + timedelta(days=3, hours=4)).isoformat(),
                "max_participants": 32,
                "is_public": True,
                "is_paid_event": True,
            },
            {
                "title": "Italian Cooking Masterclass",
                "description": "Learn authentic Italian cooking from Chef Maria. Hands-on pasta making, sauce preparation, and traditional techniques.",
                "category": "food",
                "location": "Culinary Institute, Kitchen Studio B",
                "start_time": (datetime.now() + timedelta(days=10)).isoformat(),
                "end_time": (datetime.now() + timedelta(days=10, hours=3)).isoformat(),
                "max_participants": 16,
                "is_public": True,
                "is_paid_event": True,
            },
            {
                "title": "Free Community Yoga in the Park",
                "description": "Start your weekend with free yoga for all levels. Bring your own mat and water. All are welcome!",
                "category": "wellness",
                "location": "Central Park, Great Lawn",
                "start_time": (datetime.now() + timedelta(days=2)).isoformat(),
                "end_time": (
                    datetime.now() + timedelta(days=2, hours=1, minutes=30)
                ).isoformat(),
                "max_participants": 50,
                "is_public": True,
                "is_paid_event": False,
            },
            {
                "title": "Outdoor Movie Night - Family Friendly",
                "description": "Bring blankets and snacks for an outdoor screening of 'The Lion King'. Free popcorn for kids!",
                "category": "entertainment",
                "location": "Riverside Park, Amphitheater",
                "start_time": (datetime.now() + timedelta(days=4)).isoformat(),
                "end_time": (
                    datetime.now() + timedelta(days=4, hours=2, minutes=30)
                ).isoformat(),
                "max_participants": 100,
                "is_public": True,
                "is_paid_event": False,
            },
        ]

        created_events = []
        for event_data in dummy_events:
            event_id = str(uuid.uuid4())
            event_data["id"] = event_id
            event_data["organizer_id"] = user_id
            event_data["created_at"] = datetime.now().isoformat()
            event_data["updated_at"] = datetime.now().isoformat()

            # Insert into database
            get_table("events").insert(event_data).execute()
            created_events.append({"id": event_id, "title": event_data["title"]})

        return {
            "message": f"Successfully created {len(created_events)} dummy events",
            "events": created_events,
        }
    except Exception as e:
        logger.error(f"Error seeding dummy events: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to seed dummy events: {str(e)}",
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
        update_data = {
            k: v for k, v in event_update.model_dump().items() if v is not None
        }

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
    Soft delete an event (move to recycle bin).
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

        # Soft delete: set deleted_at timestamp
        from datetime import datetime

        update_record("events", event_id, {"deleted_at": datetime.now().isoformat()})

        return {"message": "Event moved to recycle bin"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting event {event_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete event",
        )


@router.post("/{event_id}/restore", response_model=EventResponse)
async def restore_event(event_id: str, user: dict = Depends(get_current_user)):
    """
    Restore a soft-deleted event from recycle bin.
    Only the event organizer can restore.
    """
    try:
        # Check if event exists, is deleted, and user is organizer
        table = get_table("events")
        response = table.select("*").eq("id", event_id).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
            )

        event = response.data[0]

        if event.get("organizer_id") != user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to restore this event",
            )

        if event.get("deleted_at") is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Event is not in recycle bin",
            )

        # Restore: clear deleted_at
        update_response = update_record("events", event_id, {"deleted_at": None})

        if not update_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to restore event",
            )

        restored_event = update_response.data[0]
        restored_event["current_participants"] = 0

        return restored_event
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error restoring event {event_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to restore event",
        )


@router.get("/deleted/me", response_model=List[EventResponse])
async def get_deleted_events(
    user: dict = Depends(get_current_user),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """
    Get soft-deleted events for the current user (recycle bin).
    """
    try:
        table = get_table("events")
        response = (
            table.select("*")
            .eq("organizer_id", user["id"])
            .not_.is_("deleted_at", "null")
            .order("deleted_at", desc=True)
            .limit(limit)
            .offset(offset)
            .execute()
        )

        events = []
        for event in response.data:
            event["current_participants"] = 0
            events.append(event)

        return events
    except Exception as e:
        logger.error(f"Error fetching deleted events: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch deleted events",
        )


@router.get("/deleted/{event_id}", response_model=EventResponse)
async def get_deleted_event(
    event_id: str,
    user: dict = Depends(get_current_user),
):
    """
    Get a specific soft-deleted event by ID (for recycle bin preview).
    Only the event organizer can view their deleted events.
    """
    try:
        table = get_table("events")
        response = (
            table.select("*")
            .eq("id", event_id)
            .eq("organizer_id", user["id"])
            .not_.is_("deleted_at", "null")
            .execute()
        )

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
            )

        event = response.data[0]
        event["current_participants"] = 0

        return event
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching deleted event {event_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch deleted event",
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


@router.get("/{event_id}/is-registered")
async def check_registration(
    event_id: str, request: Request, user: dict = Depends(get_current_user)
):
    """
    Check if current user is registered for a specific event.
    Lightweight endpoint - returns boolean only.
    """
    logger.info(
        f"[API] GET /api/events/{event_id}/is-registered called from {request.client.host if request.client else 'unknown'} for user {user.get('id', 'unknown')[:8]}..."
    )
    try:
        # Single row check with limit 1 for speed
        response = (
            get_table("event_participants")
            .select("id", count="exact")
            .eq("event_id", event_id)
            .eq("user_id", user["id"])
            .limit(1)
            .execute()
        )

        is_registered = response.count is not None and response.count > 0
        logger.info(
            f"[API] User {user.get('id', 'unknown')[:8]}... is_registered={is_registered} for event {event_id}"
        )
        return {"is_registered": is_registered}
    except Exception as e:
        logger.error(f"Error checking registration for event {event_id}: {e}")
        return {"is_registered": False}


@router.get("/{event_id}/participants")
async def get_event_participants(
    event_id: str, request: Request, user: dict = Depends(get_current_user)
):
    """
    Get participant counts and current user's status for an event.
    Returns counts by status (interested, going, not_going) and current user's participation status.
    """
    try:
        # Get all participants for this event
        response = (
            get_table("event_participants")
            .select("status,user_id")
            .eq("event_id", event_id)
            .execute()
        )

        counts = {"interested": 0, "going": 0, "not_going": 0}
        my_status = None
        is_registered = False

        if response.data:
            for record in response.data:
                status = record.get("status")
                if status in counts:
                    counts[status] += 1
                # Check if current user is in the list
                if user and record.get("user_id") == user["id"]:
                    my_status = status
                    is_registered = True

        return {
            "event_id": event_id,
            "counts": counts,
            "total": sum(counts.values()),
            "my_status": my_status,
            "is_registered": is_registered,
        }
    except Exception as e:
        logger.error(f"Error fetching participants for event {event_id}: {e}")
        return {
            "event_id": event_id,
            "counts": {"interested": 0, "going": 0, "not_going": 0},
            "total": 0,
            "my_status": None,
            "is_registered": False,
        }


@router.post("/participants/bulk")
async def get_bulk_event_participants(
    request: Request,
    event_ids: list[str] = Body(
        ..., description="List of event IDs to fetch participant counts for"
    ),
    user: Optional[dict] = Depends(optional_auth),
):
    """
    Get participant counts for multiple events in a single call.
    This reduces API calls from N to 1 for event listings.
    """
    if not event_ids or len(event_ids) == 0:
        return {}

    try:
        # Fetch all participants for the given event IDs
        response = (
            get_table("event_participants")
            .select("event_id,status,user_id")
            .in_("event_id", event_ids)
            .execute()
        )

        # Initialize result dict for all events
        results = {}
        for event_id in event_ids:
            results[event_id] = {
                "event_id": event_id,
                "counts": {"interested": 0, "going": 0, "not_going": 0},
                "total": 0,
                "my_status": None,
                "is_registered": False,
            }

        # Process the data
        if response.data:
            for record in response.data:
                event_id = record.get("event_id")
                status = record.get("status")
                if event_id in results and status in results[event_id]["counts"]:
                    results[event_id]["counts"][status] += 1
                    results[event_id]["total"] += 1
                    # Check if current user
                    if user and record.get("user_id") == user["id"]:
                        results[event_id]["my_status"] = status
                        results[event_id]["is_registered"] = True

        return results
    except Exception as e:
        logger.error(f"Error fetching bulk participants: {e}")
        # Return empty counts for all events
        return {
            event_id: {
                "event_id": event_id,
                "counts": {"interested": 0, "going": 0, "not_going": 0},
                "total": 0,
                "my_status": None,
                "is_registered": False,
            }
            for event_id in event_ids
        }


@router.get("/{event_id}")
async def get_event_by_id(event_id: str, request: Request):
    """
    Get a single event by ID.
    """
    logger.info(
        f"[API] GET /api/events/{event_id} called from {request.client.host if request.client else 'unknown'}"
    )
    try:
        table = get_table("events")
        response = (
            table.select("*").eq("id", event_id).is_("deleted_at", "null").execute()
        )

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
            )

        event = response.data[0]

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


@router.post("/{event_id}/messages")
async def send_event_message(
    event_id: str,
    message: dict,
    user: dict = Depends(get_current_user),
):
    """
    Send a message in event chat.
    """
    try:
        # Verify user is participant or organizer (check event is not deleted)
        event_response = (
            get_table("events")
            .select("*")
            .eq("id", event_id)
            .is_("deleted_at", "null")
            .execute()
        )
        if not event_response.data or len(event_response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
            )

        event = event_response.data[0]

        # Check if user is organizer or participant
        if event.get("organizer_id") != user["id"]:
            participant_response = (
                get_table("event_participants")
                .select("*")
                .eq("event_id", event_id)
                .eq("user_id", user["id"])
                .execute()
            )
            if not participant_response.data or len(participant_response.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You must be a participant to send messages",
                )

        # Insert message
        message_data = {
            "event_id": event_id,
            "sender_user_id": user["id"],
            "message_text": message.get("message_text", ""),
            "created_at": datetime.now().isoformat(),
        }

        response = get_table("event_messages").insert(message_data).execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send message",
            )

        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending message to event {event_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send message",
        )


@router.get("/{event_id}/messages")
async def get_event_messages(event_id: str):
    """
    Get all messages for an event.
    """
    try:
        table = get_table("event_messages")
        response = (
            table.select("*")
            .eq("event_id", event_id)
            .order("created_at", ascending=True)
            .execute()
        )

        return response.data or []
    except Exception as e:
        logger.error(f"Error fetching messages for event {event_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch messages",
        )


# Admin endpoints
@router.put("/{event_id}/status")
async def update_event_status(
    event_id: str,
    status: str,
    admin_remark: Optional[str] = None,
    user: dict = Depends(get_current_user),
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
                status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
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
