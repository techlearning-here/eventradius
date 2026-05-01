"""
Public Deals API endpoints for users to discover and claim discounts.
"""

import logging
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Body, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, ConfigDict, Field

from config.auth import get_current_user, optional_auth
from config.database import fetch_records, fetch_single_record, insert_record, call_rpc

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/deals", tags=["deals"])


# Pydantic models
class DealListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    event_id: UUID
    event_title: str
    event_image_url: Optional[str] = None
    event_start_time: Optional[str] = None
    event_location: Optional[str] = None
    
    promo_code_id: UUID
    code: str
    discount_percent: int
    discount_amount: Optional[Decimal] = None
    original_price: Decimal
    discounted_price: Decimal
    seats_remaining: int
    valid_until: str
    
    # Event details
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    category: Optional[str] = None


class ClaimDealRequest(BaseModel):
    pass  # No body needed, user is identified from auth


class ClaimDealResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    code: str
    discount_percent: int
    discount_amount: Optional[Decimal] = None
    original_price: Decimal
    discounted_price: Decimal
    valid_until: str
    external_ticketing_url: Optional[str] = None
    event_title: str
    event_location: Optional[str] = None
    event_start_time: Optional[str] = None


class EventDealInfo(BaseModel):
    """Minimal deal info for event cards."""
    model_config = ConfigDict(from_attributes=True)
    
    has_active_deal: bool
    discount_percent: Optional[int] = None
    discount_amount: Optional[Decimal] = None
    original_price: Optional[Decimal] = None
    discounted_price: Optional[Decimal] = None
    seats_remaining: Optional[int] = None
    valid_until: Optional[str] = None
    code: Optional[str] = None  # Only shown after claim


@router.get("/event/{event_id}", response_model=EventDealInfo)
async def get_event_deal(
    event_id: UUID,
    current_user: Optional[dict] = Depends(optional_auth),
):
    """Get deal information for a specific event (for event card badges)."""
    from datetime import datetime
    now = datetime.utcnow().isoformat()
    
    # Check for active promo code
    promo_codes = fetch_records(
        "promo_codes",
        filters={
            "event_id": str(event_id),
            "is_active": True,
        },
        limit=1,
    )
    
    if not promo_codes:
        return EventDealInfo(has_active_deal=False)
    
    promo_code = promo_codes[0]
    
    # Check validity
    valid_until = promo_code.get("valid_until")
    if valid_until and datetime.fromisoformat(valid_until.replace("Z", "+00:00")) < datetime.now(timezone.utc):
        return EventDealInfo(has_active_deal=False)
    
    # Check max uses
    if promo_code["times_claimed"] >= promo_code["max_uses"]:
        return EventDealInfo(has_active_deal=False)
    
    # Get pricing rule for original price
    pricing_rule = fetch_single_record(
        "dynamic_pricing_rules",
        filters={"event_id": str(event_id)},
    )
    if not pricing_rule:
        return EventDealInfo(has_active_deal=False)
    
    original_price = Decimal(pricing_rule["base_price"])
    discount_amount = promo_code.get("discount_amount")
    if discount_amount:
        discounted_price = original_price - Decimal(discount_amount)
    else:
        discounted_price = original_price * (1 - promo_code["discount_percent"] / 100)
    
    # Get latest inventory for seats remaining
    inventory = fetch_records(
        "inventory_snapshots",
        filters={"event_id": str(event_id)},
        limit=1,
    )
    seats_remaining = inventory[0]["tickets_remaining"] if inventory else 0
    
    return EventDealInfo(
        has_active_deal=True,
        discount_percent=promo_code["discount_percent"],
        discount_amount=discount_amount,
        original_price=original_price,
        discounted_price=discounted_price,
        seats_remaining=seats_remaining,
        valid_until=valid_until,
        code=promo_code["code"],
    )


@router.get("", response_model=List[DealListItem])
async def list_deals(
    request: Request,
    lat: Optional[float] = Query(None, description="User latitude"),
    lng: Optional[float] = Query(None, description="User longitude"),
    radius: float = Query(25.0, ge=1, le=100, description="Search radius in miles"),
    category: Optional[str] = Query(None, description="Filter by event category"),
    limit: int = Query(20, ge=1, le=100),
    current_user: Optional[dict] = Depends(optional_auth),
):
    """List active deals near the user."""
    
    # Get current time for filtering
    from datetime import datetime
    now = datetime.utcnow().isoformat()
    
    # Build base filters
    filters = {
        "is_active": True,
        "valid_until": ("gt", now),
    }
    
    # Fetch active promo codes with event details via join
    # Since we can't do complex joins with our simple fetch_records,
    # we'll use a database view or RPC function
    try:
        # Try to use a database function for efficient querying
        result = call_rpc(
            "get_active_deals",
            {
                "user_lat": lat,
                "user_lng": lng,
                "radius_miles": radius,
                "category_filter": category,
                "result_limit": limit,
            }
        )
        if result and hasattr(result, 'data'):
            return [DealListItem(**r) for r in result.data]
    except Exception as e:
        logger.warning(f"RPC get_active_deals failed: {e}, falling back to manual query")
    
    # Fallback: Manual query
    promo_codes = fetch_records(
        "promo_codes",
        filters=filters,
        limit=limit * 2,  # Fetch more since we'll filter
    )
    
    deals = []
    for pc in promo_codes:
        # Get event details
        event = fetch_single_record(
            "events",
            filters={"id": pc["event_id"]},
        )
        if not event:
            continue
        
        # Check event status
        if event.get("status") not in ["published", "upcoming"]:
            continue
        
        # Check distance if coordinates provided
        if lat is not None and lng is not None:
            event_lat = event.get("latitude")
            event_lng = event.get("longitude")
            if event_lat and event_lng:
                distance = _calculate_distance(lat, lng, event_lat, event_lng)
                if distance > radius:
                    continue
        
        # Check category filter
        if category and event.get("category") != category:
            continue
        
        # Get pricing rule for original price
        pricing_rule = fetch_single_record(
            "dynamic_pricing_rules",
            filters={"event_id": pc["event_id"]},
        )
        if not pricing_rule:
            continue
        
        original_price = Decimal(pricing_rule["base_price"])
        discount_amount = pc.get("discount_amount")
        if discount_amount:
            discounted_price = original_price - Decimal(discount_amount)
        else:
            discounted_price = original_price * (1 - pc["discount_percent"] / 100)
        
        # Get latest inventory for seats remaining
        inventory = fetch_records(
            "inventory_snapshots",
            filters={"event_id": pc["event_id"]},
            limit=1,
        )
        seats_remaining = inventory[0]["tickets_remaining"] if inventory else 0
        
        deals.append(DealListItem(
            event_id=event["id"],
            event_title=event.get("title", "Untitled Event"),
            event_image_url=event.get("image_url"),
            event_start_time=event.get("start_time"),
            event_location=event.get("location"),
            promo_code_id=pc["id"],
            code=pc["code"],
            discount_percent=pc["discount_percent"],
            discount_amount=discount_amount,
            original_price=original_price,
            discounted_price=discounted_price,
            seats_remaining=seats_remaining,
            valid_until=pc["valid_until"],
            latitude=event.get("latitude"),
            longitude=event.get("longitude"),
            category=event.get("category"),
        ))
    
    # Sort by discount percent descending
    deals.sort(key=lambda x: x.discount_percent, reverse=True)
    
    return deals[:limit]


@router.post("/{event_id}/claim", response_model=ClaimDealResponse)
async def claim_deal(
    event_id: UUID,
    request: Request,
    body: ClaimDealRequest = Body(None),
    current_user: Optional[dict] = Depends(optional_auth),
):
    """User claims a promo code for an event."""
    user_id = current_user.get("id") if current_user else None
    
    # Get active promo code for this event
    from datetime import datetime
    now = datetime.utcnow().isoformat()
    
    promo_code = fetch_single_record(
        "promo_codes",
        filters={
            "event_id": str(event_id),
            "is_active": True,
        },
    )
    if not promo_code:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active deal found for this event",
        )
    
    # Check validity
    valid_until = promo_code.get("valid_until")
    if valid_until and datetime.fromisoformat(valid_until.replace("Z", "+00:00")) < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This deal has expired",
        )
    
    # Check max uses
    if promo_code["times_claimed"] >= promo_code["max_uses"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This deal has reached maximum claims",
        )
    
    # Check if user already claimed (if logged in)
    if user_id:
        existing_claim = fetch_single_record(
            "promo_code_claims",
            filters={
                "promo_code_id": promo_code["id"],
                "user_id": user_id,
            },
        )
        if existing_claim:
            # Return existing claim without creating duplicate
            logger.info(f"User {user_id} re-claiming code {promo_code['id']}")
    else:
        # For anonymous users, check by IP (simplified, can be bypassed)
        client_ip = request.client.host if request.client else None
        # We don't strictly enforce this to avoid blocking legitimate users
    
    # Get event details
    event = fetch_single_record(
        "events",
        filters={"id": str(event_id)},
    )
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )
    
    # Get pricing rule for prices
    pricing_rule = fetch_single_record(
        "dynamic_pricing_rules",
        filters={"event_id": str(event_id)},
    )
    if not pricing_rule:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Pricing configuration not found",
        )
    
    # Create claim record
    claim_data = {
        "promo_code_id": promo_code["id"],
        "user_id": user_id,
        "ip_address": request.client.host if request.client else None,
        "user_agent": request.headers.get("user-agent"),
    }
    
    # Insert claim (may fail if unique constraint violated - that's ok)
    try:
        insert_record("promo_code_claims", claim_data)
    except Exception as e:
        logger.warning(f"Claim insert may have failed (possibly duplicate): {e}")
    
    # Increment claim count via RPC for atomicity
    try:
        call_rpc("increment_promo_code_claims", {"promo_code_id": promo_code["id"]})
    except Exception as e:
        logger.warning(f"Failed to increment claim count: {e}")
        # Fallback: manual update
        update_record(
            "promo_codes",
            filters={"id": promo_code["id"]},
            data={"times_claimed": promo_code["times_claimed"] + 1},
        )
    
    # Calculate prices
    original_price = Decimal(pricing_rule["base_price"])
    discount_amount = promo_code.get("discount_amount")
    if discount_amount:
        discounted_price = original_price - Decimal(discount_amount)
    else:
        discounted_price = original_price * (1 - promo_code["discount_percent"] / 100)
    
    logger.info(
        f"Deal claimed for event {event_id}: code={promo_code['code']}, "
        f"user={user_id or 'anonymous'}"
    )
    
    return ClaimDealResponse(
        code=promo_code["code"],
        discount_percent=promo_code["discount_percent"],
        discount_amount=discount_amount,
        original_price=original_price,
        discounted_price=discounted_price,
        valid_until=promo_code["valid_until"],
        external_ticketing_url=event.get("ticketing_website"),
        event_title=event.get("title", "Untitled Event"),
        event_location=event.get("location"),
        event_start_time=event.get("start_time"),
    )


def _calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance between two coordinates in miles using Haversine formula."""
    import math
    
    R = 3959  # Earth's radius in miles
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lng = math.radians(lng2 - lng1)
    
    a = (math.sin(delta_lat / 2) ** 2 +
         math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c
