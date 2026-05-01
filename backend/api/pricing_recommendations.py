"""
Discount Recommendations API endpoints for Dynamic Pricing.
"""

import logging
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, Field

from config.auth import get_current_user
from config.database import fetch_records, fetch_single_record, update_record

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/pricing/recommendations", tags=["pricing-recommendations"])


# Pydantic models
class ApproveRecommendationRequest(BaseModel):
    max_uses: int = Field(..., ge=1, le=1000, description="Maximum number of times the code can be used")


class RejectRecommendationRequest(BaseModel):
    reason: Optional[str] = Field(None, max_length=500, description="Optional reason for rejection")


class PromoCodeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    event_id: UUID
    code: str
    discount_percent: int
    discount_amount: Optional[Decimal] = None
    max_uses: int
    times_claimed: int
    times_used: int
    valid_from: str
    valid_until: str
    is_active: bool
    commission_percent: Decimal
    estimated_commission: Optional[Decimal] = None


class RecommendationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    event_id: UUID
    occupancy_percent: float
    hours_remaining: float
    recommended_discount_percent: int
    recommended_price: Decimal
    status: str
    recommendation_type: str = "ai"  # "ai" or "rule_based"
    rule_id: Optional[UUID] = None
    rule_name: Optional[str] = None
    created_at: str
    decided_at: Optional[str] = None
    decided_by: Optional[UUID] = None
    promo_code: Optional[PromoCodeResponse] = None


@router.get("", response_model=List[RecommendationResponse])
async def list_recommendations(
    status: Optional[str] = Query(None, description="Filter by status: pending, approved, rejected, expired"),
    recommendation_type: Optional[str] = Query(None, description="Filter by type: ai, rule_based"),
    current_user: dict = Depends(get_current_user),
):
    """Get discount recommendations for organizer's events."""
    user_id = current_user.get("id")
    
    # Get all pricing rules for this organizer
    pricing_rules = fetch_records(
        "dynamic_pricing_rules",
        filters={"organizer_id": user_id},
    )
    
    if not pricing_rules:
        return []
    
    event_ids = [r["event_id"] for r in pricing_rules]
    
    # Build filters
    filters = {"event_id": ("in", event_ids)}
    if status:
        filters["status"] = status
    if recommendation_type:
        filters["recommendation_type"] = recommendation_type
    
    # Fetch recommendations
    results = fetch_records(
        "discount_recommendations",
        filters=filters,
    )
    
    # Fetch promo codes for approved recommendations
    recommendation_ids = [r["id"] for r in results if r["status"] == "approved"]
    promo_codes = {}
    if recommendation_ids:
        promo_results = fetch_records(
            "promo_codes",
            filters={"recommendation_id": ("in", recommendation_ids)},
        )
        for pc in promo_results:
            promo_codes[pc["recommendation_id"]] = PromoCodeResponse(**pc)
    
    # Build response
    responses = []
    for r in results:
        response = RecommendationResponse(**r)
        if r["id"] in promo_codes:
            response.promo_code = promo_codes[r["id"]]
        responses.append(response)
    
    return responses


@router.get("/{recommendation_id}", response_model=RecommendationResponse)
async def get_recommendation(
    recommendation_id: UUID,
    current_user: dict = Depends(get_current_user),
):
    """Get details of a specific recommendation."""
    user_id = current_user.get("id")
    
    # Get recommendation
    recommendations = fetch_records(
        "discount_recommendations",
        filters={"id": str(recommendation_id)},
        limit=1,
    )
    if not recommendations:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found",
        )
    recommendation = recommendations[0]
    
    # Verify organizer owns the event
    pricing_rules = fetch_records(
        "dynamic_pricing_rules",
        filters={"event_id": recommendation["event_id"], "organizer_id": user_id},
        limit=1,
    )
    if not pricing_rules:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    response = RecommendationResponse(**recommendation)
    
    # Include promo code if approved
    if recommendation["status"] == "approved":
        promo_codes = fetch_records(
            "promo_codes",
            filters={"recommendation_id": str(recommendation_id)},
            limit=1,
        )
        if promo_codes:
            response.promo_code = PromoCodeResponse(**promo_codes[0])
    
    return response


@router.post("/{recommendation_id}/approve", response_model=RecommendationResponse)
async def approve_recommendation(
    recommendation_id: UUID,
    request: ApproveRecommendationRequest = Body(...),
    current_user: dict = Depends(get_current_user),
):
    """Approve a discount recommendation and generate promo code."""
    user_id = current_user.get("id")
    
    # Get recommendation
    recommendations = fetch_records(
        "discount_recommendations",
        filters={"id": str(recommendation_id), "status": "pending"},
        limit=1,
    )
    if not recommendations:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pending recommendation not found",
        )
    recommendation = recommendations[0]
    
    # Verify organizer owns the event
    pricing_rules = fetch_records(
        "dynamic_pricing_rules",
        filters={"event_id": recommendation["event_id"], "organizer_id": user_id},
        limit=1,
    )
    if not pricing_rules:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    pricing_rule = pricing_rules[0]
    
    # Get event details for code generation
    events = fetch_records("events", filters={"id": recommendation["event_id"]}, limit=1)
    if not events:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )
    event = events[0]
    
    # Generate unique promo code - fetch existing codes to avoid duplicates
    from services.promo_code_generator import generate_unique_promo_code
    existing_codes = fetch_records("promo_codes", filters={"event_id": recommendation["event_id"]})
    existing_code_set = {pc["code"] for pc in existing_codes}
    code = generate_unique_promo_code(
        event.get("title", "EVENT"),
        recommendation["recommended_discount_percent"],
        existing_codes=existing_code_set
    )
    
    # Calculate discount amount
    discount_amount = Decimal(pricing_rule["base_price"]) - Decimal(recommendation["recommended_price"])
    
    # Calculate validity period (default: valid from now until event start)
    from datetime import datetime, timedelta
    valid_from = datetime.utcnow()
    # Default to 24 hours validity if no event start time
    valid_until = valid_from + timedelta(hours=24)
    
    # Try to parse event start time for better validity period
    event_start = event.get("start_time")
    if event_start:
        try:
            # Handle ISO format string
            if isinstance(event_start, str):
                valid_until = datetime.fromisoformat(event_start.replace("Z", "+00:00"))
            else:
                valid_until = event_start
        except (ValueError, TypeError):
            pass  # Use default 24 hours
    
    # Create promo code
    promo_data = {
        "event_id": recommendation["event_id"],
        "recommendation_id": str(recommendation_id),
        "code": code,
        "discount_percent": recommendation["recommended_discount_percent"],
        "discount_amount": str(discount_amount),
        "max_uses": request.max_uses,
        "valid_from": valid_from.isoformat(),
        "valid_until": valid_until.isoformat(),
        "is_active": True,
    }
    
    from config.database import insert_record
    promo_result = insert_record("promo_codes", promo_data)
    if not promo_result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate promo code",
        )
    
    # Update recommendation status
    result = update_record(
        "discount_recommendations",
        filters={"id": str(recommendation_id)},
        data={
            "status": "approved",
            "decided_at": datetime.utcnow().isoformat(),
            "decided_by": user_id,
        },
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update recommendation status",
        )
    
    logger.info(
        f"Recommendation {recommendation_id} approved by user {user_id}. "
        f"Generated promo code: {code}"
    )
    
    response = RecommendationResponse(**result)
    response.promo_code = PromoCodeResponse(**promo_result)
    return response


@router.post("/{recommendation_id}/reject", response_model=RecommendationResponse)
async def reject_recommendation(
    recommendation_id: UUID,
    request: RejectRecommendationRequest = Body(None),
    current_user: dict = Depends(get_current_user),
):
    """Reject a discount recommendation."""
    user_id = current_user.get("id")
    
    # Get recommendation
    recommendations = fetch_records(
        "discount_recommendations",
        filters={"id": str(recommendation_id), "status": "pending"},
        limit=1,
    )
    if not recommendations:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pending recommendation not found",
        )
    recommendation = recommendations[0]
    
    # Verify organizer owns the event
    pricing_rules = fetch_records(
        "dynamic_pricing_rules",
        filters={"event_id": recommendation["event_id"], "organizer_id": user_id},
        limit=1,
    )
    if not pricing_rules:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    # Update recommendation status
    from datetime import datetime
    result = update_record(
        "discount_recommendations",
        filters={"id": str(recommendation_id)},
        data={
            "status": "rejected",
            "decided_at": datetime.utcnow().isoformat(),
            "decided_by": user_id,
        },
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update recommendation status",
        )
    
    logger.info(f"Recommendation {recommendation_id} rejected by user {user_id}")
    return RecommendationResponse(**result)


@router.post("/generate/rule-based", response_model=RecommendationResponse)
async def generate_rule_based_recommendation(
    event_id: UUID = Body(..., embed=True),
    current_user: dict = Depends(get_current_user),
):
    """
    Generate a rule-based discount recommendation for an event.
    This evaluates discount rules and creates a recommendation if rules match.
    """
    user_id = current_user.get("id")
    
    # Verify user owns this event's pricing rule
    pricing_rules = fetch_records(
        "dynamic_pricing_rules",
        filters={"event_id": str(event_id), "organizer_id": user_id},
        limit=1,
    )
    if not pricing_rules:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied or pricing rule not configured",
        )
    pricing_rule = pricing_rules[0]
    
    # Get event details for time calculation
    events = fetch_records("events", filters={"id": str(event_id)}, limit=1)
    if not events:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )
    event = events[0]
    
    # Calculate hours before event
    from datetime import datetime, timedelta
    now = datetime.utcnow()
    event_start = event.get("start_time")
    hours_before = 0
    
    if event_start:
        try:
            if isinstance(event_start, str):
                event_time = datetime.fromisoformat(event_start.replace("Z", "+00:00"))
                hours_before = max(0, int((event_time - now).total_seconds() / 3600))
        except (ValueError, TypeError):
            pass
    
    # Get current occupancy from latest inventory
    inventory = fetch_records(
        "inventory_snapshots",
        filters={"event_id": str(event_id)},
        limit=1,
    )
    occupancy_percent = 0
    if inventory:
        occupancy_percent = inventory[0].get("occupancy_percent", 0)
    
    # Get event capacity
    max_capacity = event.get("max_participants") or pricing_rule.get("max_capacity", 100)
    if max_capacity > 0:
        current_participants = event.get("current_participants", 0)
        occupancy_percent = max(occupancy_percent, (current_participants / max_capacity) * 100)
    
    # Evaluate discount rules
    from api.discount_rules import fetch_records as dr_fetch_records
    
    # Get active rules for this user and event
    rule_filters = {
        "organizer_id": user_id,
        "is_active": True,
    }
    
    # Get event-specific rules
    event_rules = fetch_records(
        "discount_rules_config",
        filters={**rule_filters, "event_id": str(event_id)},
    )
    
    # Get global rules
    global_rules = fetch_records(
        "discount_rules_config",
        filters={**rule_filters, "event_id": None},
    )
    
    all_rules = list(event_rules) + list(global_rules)
    
    if not all_rules:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active discount rules found for this event",
        )
    
    # Find matching rules
    matching_rules = []
    for rule in all_rules:
        threshold_hours = rule["time_threshold"]
        if rule["time_unit"] == "days":
            threshold_hours *= 24
        
        # Rule matches if occupancy is BELOW threshold AND we're within the time window
        if (occupancy_percent < rule["occupancy_threshold"] and 
            hours_before <= threshold_hours):
            matching_rules.append(rule)
    
    if not matching_rules:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No rules matched. Occupancy: {occupancy_percent:.1f}%, Hours before: {hours_before}",
        )
    
    # Sort by priority and pick best match
    matching_rules.sort(key=lambda x: x.get("priority", 100))
    best_rule = matching_rules[0]
    
    # Calculate recommended price
    base_price = Decimal(pricing_rule["base_price"])
    discount_percent = best_rule["discount_percent"]
    discount_multiplier = Decimal(100 - discount_percent) / Decimal(100)
    recommended_price = base_price * discount_multiplier
    
    min_price = Decimal(pricing_rule.get("min_price", 0))
    if min_price > 0 and recommended_price < min_price:
        recommended_price = min_price
    
    # Check if a recommendation already exists for this rule and event
    existing = fetch_records(
        "discount_recommendations",
        filters={
            "event_id": str(event_id),
            "rule_id": best_rule["id"],
            "status": "pending",
        },
        limit=1,
    )
    
    if existing:
        # Return existing recommendation
        return RecommendationResponse(**existing[0])
    
    # Create new recommendation
    from config.database import insert_record
    recommendation_data = {
        "event_id": str(event_id),
        "organizer_id": user_id,
        "occupancy_percent": occupancy_percent,
        "hours_remaining": hours_before,
        "recommended_discount_percent": discount_percent,
        "recommended_price": str(recommended_price),
        "status": "pending",
        "recommendation_type": "rule_based",
        "rule_id": best_rule["id"],
        "rule_name": best_rule["rule_name"],
    }
    
    result = insert_record("discount_recommendations", recommendation_data)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create recommendation",
        )
    
    logger.info(
        f"Created rule-based recommendation for event {event_id} "
        f"using rule '{best_rule['rule_name']}' with {discount_percent}% discount"
    )
    
    return RecommendationResponse(**result)
