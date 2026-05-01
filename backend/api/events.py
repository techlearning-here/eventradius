"""
Event-related API endpoints.
"""

import logging
from datetime import datetime
from typing import Dict, List, Literal, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, ConfigDict, Field

from config.auth import get_current_user, optional_auth
from config.database import (
    call_rpc,
    delete_record,
    fetch_records,
    fetch_single_record,
    get_table,
    insert_record,
    update_record,
)

# Note: Geocoding is done on frontend using Nominatim (OpenStreetMap)
# Frontend sends lat/lng directly, no backend geocoding needed

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
    # Geocoded coordinates (frontend sends these via Nominatim)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    geolocation_accuracy: Optional[str] = None
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
    require_approval: bool = False
    enable_waitlist: bool = False


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


# Approval Flow Models
class ApprovalRequestSubmit(BaseModel):
    """Model for submitting an approval request to join an event."""

    requester_name: str = Field(..., min_length=1, max_length=200)
    requester_email: str = Field(..., min_length=1, max_length=255)
    requester_phone: Optional[str] = Field(None, max_length=50)
    requester_bio: Optional[str] = Field(None, max_length=1000)
    requester_reason: Optional[str] = Field(None, max_length=2000)
    requester_social_links: Optional[dict] = Field(None)


class ApprovalRequestResponse(BaseModel):
    """Response model for approval request status."""

    id: str
    event_id: str
    user_id: Optional[str] = None
    approval_status: str
    requester_name: Optional[str] = None
    requester_email: Optional[str] = None
    requester_phone: Optional[str] = None
    requester_bio: Optional[str] = None
    requester_reason: Optional[str] = None
    requester_social_links: Optional[dict] = None
    is_waitlisted: bool = False
    waitlist_position: Optional[int] = None
    registered_at: str
    approved_at: Optional[str] = None
    rejection_reason: Optional[str] = None


class ApprovalActionRequest(BaseModel):
    """Model for organizer approval/rejection action."""

    action: Literal["approve", "reject", "waitlist"]
    rejection_reason: Optional[str] = Field(None, max_length=500)


class MyApprovalStatusResponse(BaseModel):
    """Response for user's approval status for an event."""

    has_requested: bool
    approval_status: Optional[str] = None
    is_waitlisted: bool = False
    waitlist_position: Optional[int] = None
    rejection_reason: Optional[str] = None
    requested_at: Optional[str] = None


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

        # Note: Geocoding is now done on frontend using Nominatim (OpenStreetMap)
        # Frontend sends latitude, longitude, and geolocation_accuracy directly
        # Backend just saves the provided coordinates
        logger.info(f"DEBUG: Received event_data keys: {list(event_data.keys())}")
        logger.info(
            f"DEBUG: latitude={event_data.get('latitude')}, longitude={event_data.get('longitude')}, accuracy={event_data.get('geolocation_accuracy')}"
        )

        # Fix empty strings that should be NULL
        if event_data.get("ticketing_website") == "":
            event_data["ticketing_website"] = None
        if event_data.get("event_website") == "":
            event_data["event_website"] = None

        event_type = event_data.get("event_type")
        if event_type in ("in_person", "hybrid"):
            lat = event_data.get("latitude")
            lng = event_data.get("longitude")
            if lat and lng:
                logger.info(f"Event location provided by frontend: {lat}, {lng}")
                event_data["geocoded_at"] = datetime.now().isoformat()
            else:
                logger.info("No coordinates provided for event (optional)")

        created_event = insert_record("events", event_data)

        logger.info(f"DEBUG: Insert response: {created_event}")
        if created_event:
            logger.info(
                f"DEBUG: Created event lat/lng: {created_event.get('latitude')}, {created_event.get('longitude')}"
            )

        if not created_event:
            logger.error(f"Insert failed - no data returned")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create event - database returned no data",
            )
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
        existing_event = fetch_single_record("events", event_id)

        if not existing_event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
            )

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

        updated_event = update_record("events", event_id, update_data)

        if not updated_event:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update event",
            )

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
        existing_event = fetch_single_record("events", event_id)

        if not existing_event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
            )

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
        restored_event = update_record("events", event_id, {"deleted_at": None})

        if not restored_event:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to restore event",
            )
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
        event = fetch_single_record("events", event_id)

        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
            )

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


# ============================================================================
# APPROVAL FLOW ENDPOINTS
# ============================================================================


@router.post("/{event_id}/request-approval", response_model=ApprovalRequestResponse)
async def submit_approval_request(
    event_id: str,
    request: ApprovalRequestSubmit,
    user: Optional[dict] = Depends(optional_auth),
):
    """
    Submit a request to join an event that requires approval.
    Uses atomic stored procedure to prevent race conditions.
    Can be called by authenticated users (linked to their account) or guests.
    """
    try:
        # Call atomic stored procedure
        # p_user_id is passed for service role authentication; falls back to auth.uid() if null
        rpc_params = {
            "p_event_id": event_id,
            "p_user_id": user["id"] if user else None,
            "p_requester_name": request.requester_name,
            "p_requester_email": request.requester_email,
            "p_requester_phone": request.requester_phone,
            "p_requester_bio": request.requester_bio,
            "p_requester_reason": request.requester_reason,
            "p_requester_social_links": request.requester_social_links or {},
        }

        result = call_rpc("submit_approval_request", rpc_params)

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to submit approval request",
            )

        # Parse result from stored procedure
        response_data = result.data[0] if isinstance(result.data, list) else result.data

        if not response_data.get("success"):
            error_code = response_data.get("error_code")
            error_message = response_data.get("message", "Failed to submit request")

            # Map error codes to appropriate HTTP status codes
            status_code_map = {
                "EVENT_NOT_FOUND": status.HTTP_404_NOT_FOUND,
                "NO_APPROVAL_REQUIRED": status.HTTP_400_BAD_REQUEST,
                "ALREADY_APPROVED": status.HTTP_400_BAD_REQUEST,
                "PENDING_EXISTS": status.HTTP_400_BAD_REQUEST,
                "EVENT_FULL": status.HTTP_400_BAD_REQUEST,
            }

            raise HTTPException(
                status_code=status_code_map.get(
                    error_code, status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
                detail=error_message,
            )

        # Transform response to match Pydantic model
        return {
            "id": response_data["participant_id"],
            "event_id": response_data["event_id"],
            "user_id": response_data.get("user_id"),
            "approval_status": response_data["approval_status"],
            "requester_name": response_data.get("requester_name"),
            "requester_email": response_data.get("requester_email"),
            "requester_phone": response_data.get("requester_phone"),
            "requester_bio": response_data.get("requester_bio"),
            "requester_reason": response_data.get("requester_reason"),
            "requester_social_links": response_data.get("requester_social_links", {}),
            "is_waitlisted": response_data.get("is_waitlisted", False),
            "waitlist_position": response_data.get("waitlist_position"),
            "registered_at": response_data.get("registered_at"),
            "approved_at": None,
            "rejection_reason": None,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting approval request for event {event_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit approval request",
        )


@router.delete("/{event_id}/approval-requests")
async def delete_all_approval_requests(
    event_id: str,
    user: dict = Depends(get_current_user),
) -> Dict[str, int]:
    """
    DEBUG: Delete all approval requests for an event.
    Only available for event organizers.
    Returns count of deleted records.
    """
    try:
        # Verify user is the event organizer
        event = fetch_single_record("events", event_id)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
            )
        if event.get("organizer_id") != user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only event organizer can delete approval requests",
            )

        # Delete all participants with pending/approved/rejected/waitlisted status
        # (i.e., all approval-based participants)
        result = (
            get_table("event_participants")
            .delete()
            .eq("event_id", event_id)
            .in_("approval_status", ["pending", "approved", "rejected", "waitlisted"])
            .execute()
        )

        deleted_count = len(result.data) if result.data else 0
        logger.info(f"Deleted {deleted_count} approval requests for event {event_id}")

        return {
            "deleted_count": deleted_count,
            "event_id": event_id,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting approval requests for event {event_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete approval requests",
        )


@router.get("/{event_id}/my-approval-status", response_model=MyApprovalStatusResponse)
async def get_my_approval_status(
    event_id: str,
    email: Optional[str] = None,
    user: Optional[dict] = Depends(optional_auth),
):
    """
    Get the current user's approval status for an event.
    For authenticated users, checks by user_id. For guests, can check by email.
    """
    try:
        query = (
            get_table("event_participants")
            .select(
                "approval_status, is_waitlisted, waitlist_position, rejection_reason, registered_at"
            )
            .eq("event_id", event_id)
        )

        if user:
            query = query.eq("user_id", user["id"])
        elif email:
            query = query.eq("requester_email", email)
        else:
            return MyApprovalStatusResponse(has_requested=False)

        response = query.maybe_single().execute()

        if not response.data:
            return MyApprovalStatusResponse(has_requested=False)

        data = response.data
        return MyApprovalStatusResponse(
            has_requested=True,
            approval_status=data.get("approval_status"),
            is_waitlisted=data.get("is_waitlisted", False),
            waitlist_position=data.get("waitlist_position"),
            rejection_reason=data.get("rejection_reason"),
            requested_at=data.get("registered_at"),
        )

    except Exception as e:
        logger.error(f"Error checking approval status for event {event_id}: {e}")
        return MyApprovalStatusResponse(has_requested=False)


@router.get(
    "/{event_id}/approval-requests", response_model=List[ApprovalRequestResponse]
)
async def get_approval_requests(
    event_id: str,
    status_filter: Optional[str] = Query(
        None, description="Filter by status: pending, approved, rejected, waitlisted"
    ),
    user: dict = Depends(get_current_user),
):
    """
    Get all approval requests for an event. Only the event organizer can access this.
    """
    try:
        # Verify event exists and user is organizer
        event = fetch_single_record("events", event_id)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
            )

        if event.get("organizer_id") != user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the event organizer can view approval requests",
            )

        # Build query
        query = get_table("event_participants").select("*").eq("event_id", event_id)

        if status_filter:
            query = query.eq("approval_status", status_filter)

        query = query.order("registered_at", desc=True)

        response = query.execute()
        return response.data or []

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching approval requests for event {event_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch approval requests",
        )


@router.post(
    "/{event_id}/approval/{participant_id}/action",
    response_model=ApprovalRequestResponse,
)
async def process_approval_action(
    event_id: str,
    participant_id: str,
    action_request: ApprovalActionRequest,
    user: dict = Depends(get_current_user),
):
    """
    Process an approval action (approve, reject, waitlist) for a participant.
    Only the event organizer can perform these actions.
    """
    try:
        # Verify event exists and user is organizer
        event = fetch_single_record("events", event_id)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
            )

        if event.get("organizer_id") != user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the event organizer can process approval requests",
            )

        # Get the participant request
        participant_response = (
            get_table("event_participants")
            .select("*")
            .eq("id", participant_id)
            .eq("event_id", event_id)
            .single()
            .execute()
        )

        if not participant_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Approval request not found",
            )

        participant = participant_response.data

        # Process the action
        update_data = {}

        if action_request.action == "approve":
            update_data["approval_status"] = "approved"
            update_data["approved_at"] = datetime.now().isoformat()
            update_data["approved_by"] = user["id"]
            update_data["is_waitlisted"] = False
            update_data["waitlist_position"] = None
            update_data["rejection_reason"] = None

            # If they were on waitlist, update participation status to "going"
            if participant.get("is_waitlisted"):
                update_data["status"] = "going"

        elif action_request.action == "reject":
            update_data["approval_status"] = "rejected"
            update_data["rejection_reason"] = action_request.rejection_reason
            update_data["is_waitlisted"] = False
            update_data["waitlist_position"] = None

        elif action_request.action == "waitlist":
            update_data["approval_status"] = "waitlisted"
            update_data["is_waitlisted"] = True
            # Get next waitlist position
            waitlist_response = (
                get_table("event_participants")
                .select("waitlist_position")
                .eq("event_id", event_id)
                .eq("is_waitlisted", True)
                .order("waitlist_position", desc=True)
                .limit(1)
                .execute()
            )
            next_position = 1
            if waitlist_response.data:
                next_position = (
                    waitlist_response.data[0].get("waitlist_position") or 0
                ) + 1
            update_data["waitlist_position"] = next_position

        # Update the participant record
        result = update_record("event_participants", participant_id, update_data)

        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to process approval action",
            )

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Error processing approval action for participant {participant_id}: {e}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process approval action",
        )


@router.post(
    "/{event_id}/promote-from-waitlist", response_model=ApprovalRequestResponse
)
async def promote_from_waitlist(
    event_id: str,
    user: dict = Depends(get_current_user),
):
    """
    Promote the next person from the waitlist to approved status.
    Called when a spot opens up (e.g., someone cancels).
    Only the event organizer can do this.
    """
    try:
        # Verify event exists and user is organizer
        event = fetch_single_record("events", event_id)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
            )

        if event.get("organizer_id") != user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the event organizer can manage the waitlist",
            )

        # Find the first person on the waitlist
        waitlist_response = (
            get_table("event_participants")
            .select("*")
            .eq("event_id", event_id)
            .eq("is_waitlisted", True)
            .order("waitlist_position", ascending=True)
            .limit(1)
            .execute()
        )

        if not waitlist_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No one is on the waitlist",
            )

        participant = waitlist_response.data[0]

        # Promote to approved
        update_data = {
            "approval_status": "approved",
            "approved_at": datetime.now().isoformat(),
            "approved_by": user["id"],
            "is_waitlisted": False,
            "waitlist_position": None,
            "status": "going",
        }

        result = update_record("event_participants", participant["id"], update_data)

        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to promote from waitlist",
            )

        # Reorder remaining waitlist positions
        remaining = (
            get_table("event_participants")
            .select("id, waitlist_position")
            .eq("event_id", event_id)
            .eq("is_waitlisted", True)
            .order("waitlist_position", ascending=True)
            .execute()
        )

        if remaining.data:
            for idx, record in enumerate(remaining.data, start=1):
                if record.get("waitlist_position") != idx:
                    update_record(
                        "event_participants", record["id"], {"waitlist_position": idx}
                    )

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error promoting from waitlist for event {event_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to promote from waitlist",
        )


@router.get("/my-events/approval-stats")
async def get_my_events_approval_stats(
    user: dict = Depends(get_current_user),
) -> Dict[str, Dict[str, int]]:
    """
    Get approval request statistics for all events created by the current user.
    Returns a map of event_id -> {total, pending, approved, waitlisted, rejected}.
    """
    try:
        # First get all events created by this user
        user_id = user["id"]
        logger.info(f"Fetching events for user: {user_id}")

        events_response = (
            get_table("events").select("id").eq("organizer_id", user_id).execute()
        )

        logger.info(
            f"Found {len(events_response.data or [])} events with organizer_id={user_id}"
        )

        if not events_response.data:
            logger.info("No events found, returning empty stats")
            return {}

        event_ids = [e["id"] for e in events_response.data]

        # Get all participants for these events (including those without approval_status)
        logger.info(f"Fetching participants for event_ids: {event_ids}")
        participants_response = (
            get_table("event_participants")
            .select("event_id, approval_status, user_id, requester_email, status")
            .in_("event_id", event_ids)
            .execute()
        )

        logger.info(f"Found {len(participants_response.data or [])} total participants")
        for p in participants_response.data or []:
            logger.info(
                f"Participant: event={p.get('event_id')}, status={p.get('status')}, approval_status={p.get('approval_status')}, user={p.get('user_id')}, email={p.get('requester_email')}"
            )

        # Aggregate counts by event
        stats: Dict[str, Dict[str, int]] = {}
        for event_id in event_ids:
            stats[str(event_id)] = {
                "total": 0,
                "pending": 0,
                "approved": 0,
                "waitlisted": 0,
                "rejected": 0,
                "cancellation_requested": 0,
            }

        for participant in participants_response.data or []:
            event_id = str(participant.get("event_id"))
            status = participant.get("approval_status")
            logger.info(f"Processing participant: event_id={event_id}, status={status}")

            if event_id in stats and status:
                stats[event_id]["total"] += 1
                if status in stats[event_id]:
                    stats[event_id][status] += 1

        logger.info(f"Final stats: {stats}")

        # If stats are empty but we have events, check what's happening
        if not any(s["total"] > 0 for s in stats.values()):
            logger.info(
                "All stats are zero - checking if participants exist without approval_status"
            )
            # Try fetching all participants without filtering
            all_parts = (
                get_table("event_participants")
                .select("*")
                .in_("event_id", event_ids)
                .execute()
            )
            logger.info(
                f"Raw participant count for these events: {len(all_parts.data or [])}"
            )
            if all_parts.data:
                for p in all_parts.data[:3]:  # Log first 3
                    logger.info(f"Raw participant: {p}")

        return stats

    except Exception as e:
        logger.error(f"Error fetching approval stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch approval statistics",
        )


# ============================================================================
# CANCELLATION REQUEST ENDPOINTS
# ============================================================================


class CancellationRequest(BaseModel):
    """Model for user requesting cancellation."""

    reason: Optional[str] = Field(
        None, max_length=500, description="Optional reason for cancellation"
    )


class CancellationActionRequest(BaseModel):
    """Model for organizer processing cancellation request."""

    action: Literal["approve", "reject"]
    # approve = actually cancel (remove from event)
    # reject = deny cancellation request (keep them approved)


@router.post("/{event_id}/cancel-participation")
async def cancel_participation(
    event_id: str,
    request: CancellationRequest,
    user: dict = Depends(get_current_user),
):
    """
    Cancel participation for an already-approved event.
    Immediately removes participant and promotes from waitlist if applicable.
    """
    try:
        # Find the participant record for this user and event
        participant_response = (
            get_table("event_participants")
            .select("*")
            .eq("event_id", event_id)
            .eq("user_id", user["id"])
            .single()
            .execute()
        )

        if not participant_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="You are not registered for this event",
            )

        participant = participant_response.data

        # Only approved participants can cancel
        if participant.get("approval_status") != "approved":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot cancel participation. Current status: {participant.get('approval_status')}",
            )

        # Use atomic stored procedure to cancel and promote from waitlist
        rpc_params = {
            "p_participant_id": participant["id"],
            "p_event_id": event_id,
            "p_reason": request.reason,
        }

        result = call_rpc("cancel_approved_participation", rpc_params)

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to cancel participation",
            )

        result_data = result.data[0] if isinstance(result.data, list) else result.data
        logger.info(f"Result data: {result_data}, type: {type(result_data)}")

        success_val = result_data.get("success")
        logger.info(f"Success value: {success_val}, type: {type(success_val)}")

        if not success_val:
            error_code = result_data.get("error_code")
            logger.info(f"Error code: {error_code}")
            if error_code == "PARTICIPANT_NOT_FOUND":
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Participant not found",
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=result_data.get("message", "Failed to cancel participation"),
                )

        logger.info(f"Passed success check, proceeding to return")
        logger.info(f"User: {user}, participant: {participant}")
        logger.info(f"result_data: {result_data}")

        return {
            "success": True,
            "participant_id": participant["id"],
            "removed": True,
            "promoted_from_waitlist": result_data.get("promoted_from_waitlist", False),
            "promoted_participant_id": result_data.get("promoted_participant_id"),
            "message": "You have successfully cancelled your participation.",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling participation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel participation",
        )


# ============================================================================
# GEOLOCATION & DISCOVERY ENDPOINTS
# ============================================================================


@router.get("/discover/nearby", response_model=List[EventResponse])
async def get_nearby_events(
    lat: float = Query(..., description="User latitude", ge=-90, le=90),
    lng: float = Query(..., description="User longitude", ge=-180, le=180),
    radius: int = Query(25, ge=1, le=500, description="Search radius in km"),
    category: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    user: Optional[dict] = Depends(optional_auth),
):
    """
    Get events within specified radius from user location.
    Uses optimized bounding box + haversine calculation via database function.
    """
    try:
        # Call the database function for efficient radius filtering
        result = call_rpc(
            "events_within_radius_fast",
            {
                "user_lat": lat,
                "user_lng": lng,
                "radius_km": radius,
                "event_type_filter": ["in_person", "hybrid", "online"],
            },
        )

        if not result.data:
            return []

        # Get full event details for filtered IDs
        event_ids = [r["event_id"] for r in result.data[offset : offset + limit]]
        distances = {r["event_id"]: r["distance_km"] for r in result.data}

        if not event_ids:
            return []

        # Fetch full event details
        table = get_table("events")
        query = table.select("*").in_("id", event_ids)

        if category:
            query = query.eq("category", category)

        query = query.is_("deleted_at", "null")
        query = query.or_("status.eq.published,status.eq.upcoming,status.is.null")

        response = query.execute()

        # Add distance to each event
        events = []
        for event in response.data:
            event["distance_km"] = distances.get(event["id"])
            event["current_participants"] = 0
            events.append(event)

        # Sort by distance (already sorted by DB function, but re-sort to be safe)
        events.sort(key=lambda x: x.get("distance_km", float("inf")))

        return events

    except Exception as e:
        logger.error(f"Error fetching nearby events: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch nearby events",
        )


@router.get("/discover/nearby/summary")
async def get_nearby_events_summary(
    lat: float = Query(..., description="User latitude", ge=-90, le=90),
    lng: float = Query(..., description="User longitude", ge=-180, le=180),
    radius: int = Query(25, ge=1, le=500, description="Search radius in km"),
    user: Optional[dict] = Depends(optional_auth),
):
    """
    Get a summary of nearby events with counts by category.
    Lightweight endpoint for map/discovery overview.
    """
    try:
        result = call_rpc(
            "events_within_radius_fast",
            {
                "user_lat": lat,
                "user_lng": lng,
                "radius_km": radius,
                "event_type_filter": ["in_person", "hybrid", "online"],
            },
        )

        if not result.data:
            return {
                "total_events": 0,
                "events_by_category": {},
                "radius_km": radius,
                "user_location": {"lat": lat, "lng": lng},
            }

        event_ids = [r["event_id"] for r in result.data]

        # Get categories for these events
        table = get_table("events")
        response = (
            table.select("id,category")
            .in_("id", event_ids)
            .is_("deleted_at", "null")
            .or_("status.eq.published,status.eq.upcoming,status.is.null")
            .execute()
        )

        # Count by category
        category_counts = {}
        for event in response.data:
            cat = event.get("category") or "uncategorized"
            category_counts[cat] = category_counts.get(cat, 0) + 1

        return {
            "total_events": len(response.data),
            "events_by_category": category_counts,
            "radius_km": radius,
            "user_location": {"lat": lat, "lng": lng},
        }

    except Exception as e:
        logger.error(f"Error fetching nearby events summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch nearby events summary",
        )


@router.put("/{event_id}/location")
async def update_event_location(
    event_id: str,
    lat: float = Body(..., embed=True, ge=-90, le=90),
    lng: float = Body(..., embed=True, ge=-180, le=180),
    accuracy: str = Body("rooftop", embed=True),
    user: dict = Depends(get_current_user),
):
    """
    Update event location coordinates.
    Frontend geocodes using Nominatim, then sends lat/lng here.
    Only the event organizer can update location.
    """
    try:
        # Fetch the event
        event = fetch_single_record("events", event_id)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
            )

        # Verify user is organizer
        if event.get("organizer_id") != user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the event organizer can update this event",
            )

        # Skip online-only events
        if event.get("event_type") == "online":
            return {
                "message": "Online events don't require location",
                "updated": False,
            }

        # Update event with coordinates from frontend
        update_data = {
            "latitude": lat,
            "longitude": lng,
            "geolocation_accuracy": accuracy,
            "geocoded_at": datetime.now().isoformat(),
        }

        result = update_record("events", event_id, update_data)

        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update event location",
            )

        return {
            "message": "Event location updated successfully",
            "updated": True,
            "coordinates": {
                "latitude": lat,
                "longitude": lng,
            },
            "accuracy": accuracy,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating event location {event_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update event location",
        )
