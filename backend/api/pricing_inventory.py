"""
Inventory Management API endpoints for Dynamic Pricing.
"""

import logging
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field

from config.auth import get_current_user
from config.database import fetch_records, fetch_single_record, insert_record

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/pricing/inventory", tags=["pricing-inventory"])


# Pydantic models
class UpdateInventoryRequest(BaseModel):
    event_id: UUID
    tickets_sold: int = Field(..., ge=0, description="Current number of tickets sold")


class InventorySnapshotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    event_id: UUID
    tickets_sold: int
    tickets_remaining: int
    occupancy_percent: float
    reported_by: Optional[UUID] = None
    reported_at: str


class InventoryHistoryResponse(BaseModel):
    snapshots: List[InventorySnapshotResponse]
    latest_occupancy: Optional[float] = None
    latest_remaining: Optional[int] = None


@router.post("", response_model=InventorySnapshotResponse, status_code=status.HTTP_201_CREATED)
async def update_inventory(
    request: UpdateInventoryRequest = Body(...),
    current_user: dict = Depends(get_current_user),
):
    """Report current ticket sales for an event. Auto-triggers recommendation calculation."""
    user_id = current_user.get("id")
    
    # Verify event has pricing rule and belongs to organizer
    pricing_rules = fetch_records(
        "dynamic_pricing_rules",
        filters={"event_id": str(request.event_id), "organizer_id": user_id, "is_active": True},
        limit=1,
    )
    if not pricing_rules:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active pricing rule not found for this event or access denied",
        )
    pricing_rule = pricing_rules[0]
    max_capacity = pricing_rule["max_capacity"]
    
    # Validate tickets_sold doesn't exceed capacity
    if request.tickets_sold > max_capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tickets sold ({request.tickets_sold}) cannot exceed capacity ({max_capacity})",
        )
    
    # Calculate occupancy
    tickets_remaining = max_capacity - request.tickets_sold
    occupancy_percent = (request.tickets_sold / max_capacity) * 100 if max_capacity > 0 else 0
    
    # Create inventory snapshot
    data = {
        "event_id": str(request.event_id),
        "tickets_sold": request.tickets_sold,
        "tickets_remaining": tickets_remaining,
        "occupancy_percent": round(occupancy_percent, 2),
        "reported_by": user_id,
    }
    
    result = insert_record("inventory_snapshots", data)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update inventory",
        )
    
    logger.info(
        f"Inventory updated for event {request.event_id}: "
        f"{request.tickets_sold}/{max_capacity} sold ({occupancy_percent:.1f}%)"
    )
    
    # Note: Recommendation calculation is automatically triggered by database trigger
    # check_and_create_recommendation() runs AFTER INSERT on inventory_snapshots
    
    return InventorySnapshotResponse(**result)


@router.get("/{event_id}/history", response_model=InventoryHistoryResponse)
async def get_inventory_history(
    event_id: UUID,
    current_user: dict = Depends(get_current_user),
):
    """Get inventory history for an event."""
    user_id = current_user.get("id")
    
    # Verify pricing rule exists and belongs to organizer
    pricing_rules = fetch_records(
        "dynamic_pricing_rules",
        filters={"event_id": str(event_id), "organizer_id": user_id},
        limit=1,
    )
    if not pricing_rules:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pricing rule not found for this event or access denied",
        )
    
    # Fetch inventory snapshots
    results = fetch_records(
        "inventory_snapshots",
        filters={"event_id": str(event_id)},
        limit=50,
    )
    
    snapshots = [InventorySnapshotResponse(**r) for r in results]
    
    latest_occupancy = None
    latest_remaining = None
    if snapshots:
        latest_occupancy = snapshots[0].occupancy_percent
        latest_remaining = snapshots[0].tickets_remaining
    
    return InventoryHistoryResponse(
        snapshots=snapshots,
        latest_occupancy=latest_occupancy,
        latest_remaining=latest_remaining,
    )


@router.get("/{event_id}/current", response_model=InventorySnapshotResponse)
async def get_current_inventory(
    event_id: UUID,
    current_user: dict = Depends(get_current_user),
):
    """Get the most recent inventory snapshot for an event."""
    user_id = current_user.get("id")
    
    # Verify pricing rule exists and belongs to organizer
    pricing_rules = fetch_records(
        "dynamic_pricing_rules",
        filters={"event_id": str(event_id), "organizer_id": user_id},
        limit=1,
    )
    if not pricing_rules:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pricing rule not found for this event or access denied",
        )
    
    # Get latest snapshot
    results = fetch_records(
        "inventory_snapshots",
        filters={"event_id": str(event_id)},
        limit=1,
    )
    
    if not results:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No inventory data found for this event",
        )
    
    return InventorySnapshotResponse(**results[0])
