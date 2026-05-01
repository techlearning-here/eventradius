"""
Dynamic Pricing Rules API endpoints.
"""

import logging
from decimal import Decimal
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field, field_validator

from config.auth import get_current_user
from config.database import delete_record, fetch_records, fetch_single_record, insert_record, update_record

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/pricing/rules", tags=["pricing-rules"])


# Pydantic models
class PricingRuleBase(BaseModel):
    max_capacity: int = Field(..., ge=1, description="Maximum event capacity")
    base_price: Decimal = Field(..., gt=0, decimal_places=2, description="Original ticket price")
    min_price: Decimal = Field(..., gt=0, decimal_places=2, description="Minimum price guardrail")
    is_active: bool = True

    @field_validator("min_price")
    @classmethod
    def min_price_not_exceed_base(cls, v: Decimal, info) -> Decimal:
        if "base_price" in info.data and v > info.data["base_price"]:
            raise ValueError("min_price cannot exceed base_price")
        return v


class CreatePricingRuleRequest(PricingRuleBase):
    event_id: UUID


class UpdatePricingRuleRequest(BaseModel):
    max_capacity: Optional[int] = Field(None, ge=1)
    base_price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    min_price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    is_active: Optional[bool] = None


class PricingRuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    event_id: UUID
    organizer_id: UUID
    max_capacity: int
    base_price: Decimal
    min_price: Decimal
    is_active: bool
    created_at: str
    updated_at: Optional[str] = None


@router.post("", response_model=PricingRuleResponse, status_code=status.HTTP_201_CREATED)
async def create_pricing_rule(
    request: CreatePricingRuleRequest = Body(...),
    current_user: dict = Depends(get_current_user),
):
    """Create pricing rule for an event."""
    user_id = current_user.get("id")
    
    # Verify event exists and belongs to organizer
    events = fetch_records(
        "events",
        filters={"id": str(request.event_id), "organizer_id": user_id},
        limit=1,
    )
    if not events:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found or access denied",
        )
    
    # Check if pricing rule already exists for this event
    existing_rules = fetch_records(
        "dynamic_pricing_rules",
        filters={"event_id": str(request.event_id)},
        limit=1,
    )
    if existing_rules:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Pricing rule already exists for this event. Use PUT to update.",
        )
    
    # Create pricing rule
    data = {
        "event_id": str(request.event_id),
        "organizer_id": user_id,
        "max_capacity": request.max_capacity,
        "base_price": str(request.base_price),
        "min_price": str(request.min_price),
        "is_active": request.is_active,
    }
    
    result = insert_record("dynamic_pricing_rules", data)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create pricing rule",
        )
    
    logger.info(f"Created pricing rule for event {request.event_id} by user {user_id}")
    return PricingRuleResponse(**result)


@router.get("/{event_id}", response_model=PricingRuleResponse)
async def get_pricing_rule(
    event_id: UUID,
    current_user: dict = Depends(get_current_user),
):
    """Get pricing rule for an event."""
    user_id = current_user.get("id")
    is_organizer = current_user.get("is_organizer", False)
    
    filters = {"event_id": str(event_id)}
    
    # Organizers can only see their own rules
    if is_organizer:
        filters["organizer_id"] = user_id
    
    results = fetch_records("dynamic_pricing_rules", filters=filters, limit=1)
    result = results[0] if results else None
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pricing rule not found",
        )
    
    return PricingRuleResponse(**result)


@router.put("/{event_id}", response_model=PricingRuleResponse)
async def update_pricing_rule(
    event_id: UUID,
    request: UpdatePricingRuleRequest = Body(...),
    current_user: dict = Depends(get_current_user),
):
    """Update pricing rule for an event."""
    user_id = current_user.get("id")
    
    # Verify rule exists and belongs to organizer
    existing_rules = fetch_records(
        "dynamic_pricing_rules",
        filters={"event_id": str(event_id), "organizer_id": user_id},
        limit=1,
    )
    if not existing_rules:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pricing rule not found or access denied",
        )
    existing = existing_rules[0]
    
    # Build update data (only include provided fields)
    update_data = {}
    if request.max_capacity is not None:
        update_data["max_capacity"] = request.max_capacity
    if request.base_price is not None:
        update_data["base_price"] = str(request.base_price)
    if request.min_price is not None:
        update_data["min_price"] = str(request.min_price)
    if request.is_active is not None:
        update_data["is_active"] = request.is_active
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )
    
    # Validate min_price <= base_price if both provided
    if "min_price" in update_data and "base_price" in update_data:
        if Decimal(update_data["min_price"]) > Decimal(update_data["base_price"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="min_price cannot exceed base_price",
            )
    elif "min_price" in update_data:
        if Decimal(update_data["min_price"]) > Decimal(existing["base_price"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="min_price cannot exceed base_price",
            )
    elif "base_price" in update_data:
        if Decimal(existing["min_price"]) > Decimal(update_data["base_price"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="min_price cannot exceed base_price",
            )
    
    result = update_record(
        "dynamic_pricing_rules",
        filters={"id": existing["id"]},
        data=update_data,
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update pricing rule",
        )
    
    logger.info(f"Updated pricing rule for event {event_id} by user {user_id}")
    return PricingRuleResponse(**result)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pricing_rule(
    event_id: UUID,
    current_user: dict = Depends(get_current_user),
):
    """Disable/delete pricing rule for an event."""
    user_id = current_user.get("id")
    
    # Verify rule exists and belongs to organizer
    existing_rules = fetch_records(
        "dynamic_pricing_rules",
        filters={"event_id": str(event_id), "organizer_id": user_id},
        limit=1,
    )
    if not existing_rules:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pricing rule not found or access denied",
        )
    existing = existing_rules[0]
    
    # Soft delete by setting is_active to false
    result = update_record(
        "dynamic_pricing_rules",
        filters={"id": existing["id"]},
        data={"is_active": False},
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to disable pricing rule",
        )
    
    logger.info(f"Disabled pricing rule for event {event_id} by user {user_id}")
    return None


@router.get("/organizer/list", response_model=list[PricingRuleResponse])
async def list_organizer_pricing_rules(
    current_user: dict = Depends(get_current_user),
):
    """List all pricing rules for the current organizer."""
    user_id = current_user.get("id")
    
    results = fetch_records(
        "dynamic_pricing_rules",
        filters={"organizer_id": user_id},
    )
    
    return [PricingRuleResponse(**r) for r in results]
