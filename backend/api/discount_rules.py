"""
Discount Rules Configuration API endpoints.
Allows organizers to create rule-based discount recommendations.
"""

import logging
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field, field_validator

from config.auth import get_current_user
from config.database import delete_record, fetch_records, fetch_single_record, insert_record, update_record

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/pricing/discount-rules", tags=["discount-rules"])


# Pydantic models
class DiscountRuleBase(BaseModel):
    rule_name: str = Field(..., min_length=1, max_length=100, description="Name of the discount rule")
    rule_description: Optional[str] = Field(None, max_length=500, description="Optional description")
    occupancy_threshold: int = Field(..., ge=1, le=100, description="Trigger when occupancy is BELOW this %")
    time_threshold: int = Field(..., ge=1, description="Time before event to trigger")
    time_unit: str = Field(..., pattern="^(hours|days)$", description="Unit: hours or days")
    discount_percent: int = Field(..., ge=1, le=100, description="Discount percentage to apply")
    is_active: bool = True
    priority: int = Field(100, ge=1, description="Lower = higher priority when multiple rules match")
    event_id: Optional[UUID] = Field(None, description="Optional: specific event, or null for all events")


class CreateDiscountRuleRequest(DiscountRuleBase):
    pass


class UpdateDiscountRuleRequest(BaseModel):
    rule_name: Optional[str] = Field(None, min_length=1, max_length=100)
    rule_description: Optional[str] = Field(None, max_length=500)
    occupancy_threshold: Optional[int] = Field(None, ge=1, le=100)
    time_threshold: Optional[int] = Field(None, ge=1)
    time_unit: Optional[str] = Field(None, pattern="^(hours|days)$")
    discount_percent: Optional[int] = Field(None, ge=1, le=100)
    is_active: Optional[bool] = None
    priority: Optional[int] = Field(None, ge=1)
    event_id: Optional[UUID] = None


class DiscountRuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    organizer_id: UUID
    event_id: Optional[UUID] = None
    rule_name: str
    rule_description: Optional[str] = None
    occupancy_threshold: int
    time_threshold: int
    time_unit: str
    discount_percent: int
    is_active: bool
    priority: int
    created_at: str
    updated_at: str


class EvaluateRuleRequest(BaseModel):
    event_id: UUID
    occupancy_percent: int = Field(..., ge=0, le=100)
    hours_before_event: int = Field(..., ge=0)


class EvaluateRuleResponse(BaseModel):
    rule_matched: bool
    rule_id: Optional[UUID] = None
    rule_name: Optional[str] = None
    discount_percent: Optional[int] = None
    priority: Optional[int] = None
    message: str


# ============================================================================
# CRUD Endpoints
# ============================================================================

@router.post("", response_model=DiscountRuleResponse, status_code=status.HTTP_201_CREATED)
def create_discount_rule(
    rule: CreateDiscountRuleRequest,
    user: dict = Depends(get_current_user),
):
    """
    Create a new discount rule.
    Rules can be global (event_id=null) or event-specific.
    """
    try:
        rule_data = {
            "organizer_id": str(user["id"]),
            "rule_name": rule.rule_name,
            "rule_description": rule.rule_description,
            "occupancy_threshold": rule.occupancy_threshold,
            "time_threshold": rule.time_threshold,
            "time_unit": rule.time_unit,
            "discount_percent": rule.discount_percent,
            "is_active": rule.is_active,
            "priority": rule.priority,
            "event_id": str(rule.event_id) if rule.event_id else None,
        }
        
        result = insert_record("discount_rules_config", rule_data)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create discount rule"
            )
        
        logger.info(f"Created discount rule {result.get('id')} for user {user['id']}")
        return DiscountRuleResponse(**result)
        
    except Exception as e:
        logger.error(f"Error creating discount rule: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create discount rule: {str(e)}"
        )


@router.get("", response_model=List[DiscountRuleResponse])
def list_discount_rules(
    event_id: Optional[UUID] = None,
    is_active: Optional[bool] = None,
    user: dict = Depends(get_current_user),
):
    """
    List all discount rules for the current user.
    Optionally filter by event_id or active status.
    """
    try:
        filters = {"organizer_id": str(user["id"])}
        
        if event_id:
            # Get rules for specific event OR global rules (event_id is null)
            filters["event_id"] = str(event_id)
        
        if is_active is not None:
            filters["is_active"] = is_active
        
        results = fetch_records("discount_rules_config", filters=filters)
        
        # If filtering by event_id, also include global rules
        if event_id:
            global_filters = {
                "organizer_id": str(user["id"]),
                "event_id": None
            }
            if is_active is not None:
                global_filters["is_active"] = is_active
            
            global_results = fetch_records("discount_rules_config", filters=global_filters)
            
            # Combine and remove duplicates
            all_results = list(results)
            global_ids = {r["id"] for r in all_results}
            for gr in global_results:
                if gr["id"] not in global_ids:
                    all_results.append(gr)
            
            # Sort by priority (ascending) then created_at
            all_results.sort(key=lambda x: (x.get("priority", 100), x.get("created_at", "")))
            return [DiscountRuleResponse(**r) for r in all_results]
        
        return [DiscountRuleResponse(**r) for r in results]
        
    except Exception as e:
        logger.error(f"Error listing discount rules: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list discount rules: {str(e)}"
        )


@router.get("/{rule_id}", response_model=DiscountRuleResponse)
def get_discount_rule(
    rule_id: UUID,
    user: dict = Depends(get_current_user),
):
    """Get a specific discount rule by ID."""
    try:
        result = fetch_single_record("discount_rules_config", str(rule_id))
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Discount rule not found"
            )
        
        # Verify ownership
        if result.get("organizer_id") != str(user["id"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this rule"
            )
        
        return DiscountRuleResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching discount rule: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch discount rule: {str(e)}"
        )


@router.put("/{rule_id}", response_model=DiscountRuleResponse)
def update_discount_rule(
    rule_id: UUID,
    rule: UpdateDiscountRuleRequest,
    user: dict = Depends(get_current_user),
):
    """Update an existing discount rule."""
    try:
        # First verify the rule exists and user owns it
        existing = fetch_single_record("discount_rules_config", str(rule_id))
        
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Discount rule not found"
            )
        
        if existing.get("organizer_id") != str(user["id"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this rule"
            )
        
        # Build update data (exclude None values)
        update_data = {}
        if rule.rule_name is not None:
            update_data["rule_name"] = rule.rule_name
        if rule.rule_description is not None:
            update_data["rule_description"] = rule.rule_description
        if rule.occupancy_threshold is not None:
            update_data["occupancy_threshold"] = rule.occupancy_threshold
        if rule.time_threshold is not None:
            update_data["time_threshold"] = rule.time_threshold
        if rule.time_unit is not None:
            update_data["time_unit"] = rule.time_unit
        if rule.discount_percent is not None:
            update_data["discount_percent"] = rule.discount_percent
        if rule.is_active is not None:
            update_data["is_active"] = rule.is_active
        if rule.priority is not None:
            update_data["priority"] = rule.priority
        if rule.event_id is not None:
            update_data["event_id"] = str(rule.event_id)
        
        if not update_data:
            return DiscountRuleResponse(**existing)
        
        result = update_record("discount_rules_config", str(rule_id), update_data)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update discount rule"
            )
        
        logger.info(f"Updated discount rule {rule_id}")
        return DiscountRuleResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating discount rule: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update discount rule: {str(e)}"
        )


@router.delete("/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_discount_rule(
    rule_id: UUID,
    user: dict = Depends(get_current_user),
):
    """Delete a discount rule."""
    try:
        # First verify the rule exists and user owns it
        existing = fetch_single_record("discount_rules_config", str(rule_id))
        
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Discount rule not found"
            )
        
        if existing.get("organizer_id") != str(user["id"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this rule"
            )
        
        delete_record("discount_rules_config", str(rule_id))
        
        logger.info(f"Deleted discount rule {rule_id}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting discount rule: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete discount rule: {str(e)}"
        )


# ============================================================================
# Evaluation Endpoint
# ============================================================================

@router.post("/evaluate", response_model=EvaluateRuleResponse)
def evaluate_discount_rule(
    request: EvaluateRuleRequest,
    user: dict = Depends(get_current_user),
):
    """
    Evaluate discount rules for an event and return the best matching rule.
    This checks both event-specific rules and global rules.
    """
    try:
        # Get all active rules for this user and event
        filters = {
            "organizer_id": str(user["id"]),
            "is_active": True
        }
        
        # Get event-specific rules
        event_filters = {**filters, "event_id": str(request.event_id)}
        event_rules = fetch_records("discount_rules_config", filters=event_filters)
        
        # Get global rules (event_id is null)
        global_filters = {**filters, "event_id": None}
        global_rules = fetch_records("discount_rules_config", filters=global_filters)
        
        # Combine rules
        all_rules = list(event_rules) + list(global_rules)
        
        if not all_rules:
            return EvaluateRuleResponse(
                rule_matched=False,
                message="No active discount rules found"
            )
        
        # Find matching rules
        matching_rules = []
        for rule in all_rules:
            # Convert time threshold to hours for comparison
            threshold_hours = rule["time_threshold"]
            if rule["time_unit"] == "days":
                threshold_hours *= 24
            
            # Check if rule matches conditions
            # Occupancy must be BELOW threshold
            # Event must be within time window (hours_before <= threshold)
            if (request.occupancy_percent < rule["occupancy_threshold"] and 
                request.hours_before_event <= threshold_hours):
                matching_rules.append(rule)
        
        if not matching_rules:
            return EvaluateRuleResponse(
                rule_matched=False,
                message=f"No rules matched. Occupancy: {request.occupancy_percent}%, Hours before: {request.hours_before_event}"
            )
        
        # Sort by priority (ascending) and pick the highest priority (lowest number)
        matching_rules.sort(key=lambda x: x.get("priority", 100))
        best_rule = matching_rules[0]
        
        return EvaluateRuleResponse(
            rule_matched=True,
            rule_id=best_rule["id"],
            rule_name=best_rule["rule_name"],
            discount_percent=best_rule["discount_percent"],
            priority=best_rule.get("priority", 100),
            message=f"Rule '{best_rule['rule_name']}' matched with {best_rule['discount_percent']}% discount"
        )
        
    except Exception as e:
        logger.error(f"Error evaluating discount rules: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to evaluate rules: {str(e)}"
        )
