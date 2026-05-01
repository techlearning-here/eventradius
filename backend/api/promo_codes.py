"""
Promo Codes management API endpoints for organizers.
"""

import logging
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict

from config.auth import get_current_user
from config.database import fetch_records, fetch_single_record, update_record

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/promo-codes", tags=["promo-codes"])


# Pydantic models
class PromoCodeListItem(BaseModel):
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
    estimated_commission: Optional[Decimal] = None


class PromoCodeClaimResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: Optional[UUID] = None
    claimed_at: str
    ip_address: Optional[str] = None
    marked_as_used: bool
    marked_used_at: Optional[str] = None


class PromoCodeDetailResponse(PromoCodeListItem):
    recommendation_id: Optional[UUID] = None
    commission_percent: Decimal
    created_at: str


@router.get("", response_model=List[PromoCodeListItem])
async def list_promo_codes(
    event_id: Optional[UUID] = Query(None, description="Filter by event ID"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_user: dict = Depends(get_current_user),
):
    """List all promo codes for the organizer."""
    user_id = current_user.get("id")
    
    # Build filters based on organizer's events
    if event_id:
        # Verify organizer owns this event
        pricing_rules = fetch_records(
            "dynamic_pricing_rules",
            filters={"event_id": str(event_id), "organizer_id": user_id},
            limit=1,
        )
        if not pricing_rules:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied for this event",
            )
        filters = {"event_id": str(event_id)}
    else:
        # Get all organizer's events
        pricing_rules = fetch_records(
            "dynamic_pricing_rules",
            filters={"organizer_id": user_id},
        )
        if not pricing_rules:
            return []
        event_ids = [r["event_id"] for r in pricing_rules]
        filters = {"event_id": ("in", event_ids)}
    
    if is_active is not None:
        filters["is_active"] = is_active
    
    results = fetch_records(
        "promo_codes",
        filters=filters,
    )
    
    return [PromoCodeListItem(**r) for r in results]


@router.get("/{promo_code_id}", response_model=PromoCodeDetailResponse)
async def get_promo_code(
    promo_code_id: UUID,
    current_user: dict = Depends(get_current_user),
):
    """Get details of a specific promo code."""
    user_id = current_user.get("id")
    
    # Get promo code
    promo_codes = fetch_records(
        "promo_codes",
        filters={"id": str(promo_code_id)},
        limit=1,
    )
    if not promo_codes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Promo code not found",
        )
    promo_code = promo_codes[0]
    
    # Verify organizer owns the event
    pricing_rules = fetch_records(
        "dynamic_pricing_rules",
        filters={"event_id": promo_code["event_id"], "organizer_id": user_id},
        limit=1,
    )
    if not pricing_rules:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    return PromoCodeDetailResponse(**promo_code)


@router.post("/{promo_code_id}/deactivate", response_model=PromoCodeDetailResponse)
async def deactivate_promo_code(
    promo_code_id: UUID,
    current_user: dict = Depends(get_current_user),
):
    """Deactivate a promo code."""
    user_id = current_user.get("id")
    
    # Get promo code
    promo_codes = fetch_records(
        "promo_codes",
        filters={"id": str(promo_code_id)},
        limit=1,
    )
    if not promo_codes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Promo code not found",
        )
    promo_code = promo_codes[0]
    
    # Verify organizer owns the event
    pricing_rules = fetch_records(
        "dynamic_pricing_rules",
        filters={"event_id": promo_code["event_id"], "organizer_id": user_id},
        limit=1,
    )
    if not pricing_rules:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    # Deactivate
    result = update_record(
        "promo_codes",
        filters={"id": str(promo_code_id)},
        data={"is_active": False},
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to deactivate promo code",
        )
    
    logger.info(f"Promo code {promo_code_id} deactivated by user {user_id}")
    return PromoCodeDetailResponse(**result)


@router.get("/{promo_code_id}/claims", response_model=List[PromoCodeClaimResponse])
async def get_promo_code_claims(
    promo_code_id: UUID,
    current_user: dict = Depends(get_current_user),
):
    """Get claim history for a promo code."""
    user_id = current_user.get("id")
    
    # Get promo code
    promo_codes = fetch_records(
        "promo_codes",
        filters={"id": str(promo_code_id)},
        limit=1,
    )
    if not promo_codes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Promo code not found",
        )
    promo_code = promo_codes[0]
    
    # Verify organizer owns the event
    pricing_rules = fetch_records(
        "dynamic_pricing_rules",
        filters={"event_id": promo_code["event_id"], "organizer_id": user_id},
        limit=1,
    )
    if not pricing_rules:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    # Get claims
    results = fetch_records(
        "promo_code_claims",
        filters={"promo_code_id": str(promo_code_id)},
    )
    
    return [PromoCodeClaimResponse(**r) for r in results]


@router.post("/{promo_code_id}/regenerate", response_model=PromoCodeDetailResponse)
async def regenerate_promo_code(
    promo_code_id: UUID,
    current_user: dict = Depends(get_current_user),
):
    """Regenerate a new promo code (deactivates old one, creates new)."""
    user_id = current_user.get("id")
    
    # Get existing promo code
    promo_codes = fetch_records(
        "promo_codes",
        filters={"id": str(promo_code_id)},
        limit=1,
    )
    if not promo_codes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Promo code not found",
        )
    promo_code = promo_codes[0]
    
    # Verify organizer owns the event
    pricing_rules = fetch_records(
        "dynamic_pricing_rules",
        filters={"event_id": promo_code["event_id"], "organizer_id": user_id},
        limit=1,
    )
    if not pricing_rules:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    # Deactivate old code
    update_record(
        "promo_codes",
        filters={"id": str(promo_code_id)},
        data={"is_active": False},
    )
    
    # Generate new code
    from services.promo_code_generator import generate_promo_code
    from datetime import datetime
    
    events = fetch_records("events", filters={"id": promo_code["event_id"]}, limit=1)
    new_code = generate_promo_code(
        events[0].get("title", "EVENT") if events else "EVENT",
        promo_code["discount_percent"]
    )
    
    # Create new promo code with same parameters
    new_data = {
        "event_id": promo_code["event_id"],
        "code": new_code,
        "discount_percent": promo_code["discount_percent"],
        "discount_amount": promo_code["discount_amount"],
        "max_uses": promo_code["max_uses"],
        "valid_from": datetime.utcnow().isoformat(),
        "valid_until": promo_code["valid_until"],
        "is_active": True,
        "commission_percent": promo_code.get("commission_percent", 5.00),
    }
    
    result = insert_record("promo_codes", new_data)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to regenerate promo code",
        )
    
    logger.info(
        f"Promo code regenerated by user {user_id}: "
        f"{promo_code['code']} -> {new_code}"
    )
    return PromoCodeDetailResponse(**result)


@router.get("/stats/summary")
async def get_promo_code_stats(
    current_user: dict = Depends(get_current_user),
):
    """Get summary statistics for organizer's promo codes."""
    user_id = current_user.get("id")
    
    # Get all organizer's events
    pricing_rules = fetch_records(
        "dynamic_pricing_rules",
        filters={"organizer_id": user_id},
    )
    if not pricing_rules:
        return {
            "active_deals": 0,
            "total_claims": 0,
            "total_used": 0,
            "estimated_commission": 0,
        }
    
    event_ids = [r["event_id"] for r in pricing_rules]
    
    # Get all promo codes for these events
    promo_codes = fetch_records(
        "promo_codes",
        filters={"event_id": ("in", event_ids)},
    )
    
    active_deals = sum(1 for pc in promo_codes if pc.get("is_active"))
    total_claims = sum(pc.get("times_claimed", 0) for pc in promo_codes)
    total_used = sum(pc.get("times_used", 0) for pc in promo_codes)
    
    # Calculate estimated commission
    total_commission = Decimal("0")
    for pc in promo_codes:
        if pc.get("estimated_commission"):
            total_commission += Decimal(pc["estimated_commission"])
    
    return {
        "active_deals": active_deals,
        "total_claims": total_claims,
        "total_used": total_used,
        "estimated_commission": str(total_commission),
    }
