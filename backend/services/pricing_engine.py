"""
Dynamic Pricing Calculation Engine.

This module contains the core pricing logic for generating discount recommendations
based on occupancy percentage and hours remaining until event start.
"""

import logging
from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional

logger = logging.getLogger(__name__)


@dataclass
class PricingRecommendation:
    """Represents a pricing recommendation."""
    occupancy_percent: float
    hours_remaining: float
    discount_percent: int
    recommended_price: Decimal
    reason: str
    should_recommend: bool


def calculate_recommendation(
    occupancy_percent: float,
    hours_remaining: float,
    base_price: Decimal,
    min_price: Decimal,
) -> PricingRecommendation:
    """
    Calculate discount recommendation based on occupancy and time remaining.
    
    MVP Decision Matrix:
    >80% or >24h: No discount (selling well or too early)
    60-80%: Monitor only (healthy sales)
    40-60% + <24h: 15% discount
    20-40% + <12h: 25% discount
    <20% + <6h: 35% discount
    <10% + <2h: 50% discount
    
    Args:
        occupancy_percent: Current ticket sales as % of capacity
        hours_remaining: Hours until event starts
        base_price: Original ticket price
        min_price: Minimum price guardrail (floor)
        
    Returns:
        PricingRecommendation with discount and reasoning
    """
    discount_percent = 0
    reason = "No discount needed"
    should_recommend = False
    
    # Determine discount based on occupancy and time
    if occupancy_percent > 80:
        discount_percent = 0
        reason = "High occupancy - selling well"
    elif hours_remaining > 24:
        discount_percent = 0
        reason = "More than 24 hours remaining - too early for discounts"
    elif occupancy_percent >= 60:
        discount_percent = 0
        reason = "Healthy sales - continue monitoring"
    elif occupancy_percent >= 40 and hours_remaining <= 24:
        discount_percent = 15
        reason = "Moderate occupancy with time pressure - 15% discount recommended"
        should_recommend = True
    elif occupancy_percent >= 20 and hours_remaining <= 12:
        discount_percent = 25
        reason = "Low occupancy with limited time - 25% discount recommended"
        should_recommend = True
    elif occupancy_percent >= 10 and hours_remaining <= 6:
        discount_percent = 35
        reason = "Very low occupancy - aggressive 35% discount recommended"
        should_recommend = True
    elif occupancy_percent < 10 and hours_remaining <= 2:
        discount_percent = 50
        reason = "Critical - last minute 50% discount to fill seats"
        should_recommend = True
    else:
        # Edge cases not covered above
        discount_percent = 0
        reason = "No action needed at this time"
    
    # Calculate recommended price
    if discount_percent > 0:
        discount_multiplier = Decimal(1) - (Decimal(discount_percent) / Decimal(100))
        recommended_price = (base_price * discount_multiplier).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )
        
        # Ensure we don't go below min_price
        if recommended_price < min_price:
            recommended_price = min_price
            # Recalculate actual discount percentage
            actual_discount = ((base_price - min_price) / base_price * 100).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
            discount_percent = int(actual_discount)
            reason = f"Adjusted to minimum price - {discount_percent}% discount"
            logger.info(
                f"Recommendation adjusted to min_price: {min_price} "
                f"(actual discount: {discount_percent}%)"
            )
    else:
        recommended_price = base_price
    
    return PricingRecommendation(
        occupancy_percent=round(occupancy_percent, 2),
        hours_remaining=round(hours_remaining, 1),
        discount_percent=discount_percent,
        recommended_price=recommended_price,
        reason=reason,
        should_recommend=should_recommend,
    )


def calculate_occupancy(tickets_sold: int, max_capacity: int) -> float:
    """
    Calculate occupancy percentage.
    
    Args:
        tickets_sold: Number of tickets sold
        max_capacity: Maximum event capacity
        
    Returns:
        Occupancy percentage (0-100)
    """
    if max_capacity <= 0:
        return 0.0
    
    occupancy = (tickets_sold / max_capacity) * 100
    return round(min(occupancy, 100.0), 2)


def calculate_hours_remaining(event_start_time: str, current_time: Optional[str] = None) -> float:
    """
    Calculate hours remaining until event starts.
    
    Args:
        event_start_time: ISO format datetime string
        current_time: Optional ISO format datetime string (defaults to now)
        
    Returns:
        Hours remaining (can be negative if event started)
    """
    from datetime import datetime, timezone
    
    try:
        start = datetime.fromisoformat(event_start_time.replace("Z", "+00:00"))
        
        if current_time:
            now = datetime.fromisoformat(current_time.replace("Z", "+00:00"))
        else:
            now = datetime.now(timezone.utc)
        
        diff = start - now
        hours = diff.total_seconds() / 3600
        return round(hours, 1)
    except (ValueError, TypeError) as e:
        logger.error(f"Failed to calculate hours remaining: {e}")
        return 0.0


def estimate_commission(
    discount_amount: Decimal,
    expected_redemptions: int,
    commission_percent: Decimal = Decimal("5.00"),
) -> Decimal:
    """
    Estimate commission earnings from a promo code.
    
    Args:
        discount_amount: Discount amount per ticket
        expected_redemptions: Expected number of redemptions
        commission_percent: Commission percentage (default 5%)
        
    Returns:
        Estimated commission amount
    """
    commission = (discount_amount * expected_redemptions * commission_percent / Decimal(100))
    return commission.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def should_create_recommendation(
    occupancy_percent: float,
    hours_remaining: float,
    last_recommendation_time: Optional[str] = None,
    min_interval_hours: float = 2.0,
) -> bool:
    """
    Determine if a new recommendation should be created.
    
    Prevents spam by ensuring minimum interval between recommendations.
    
    Args:
        occupancy_percent: Current occupancy
        hours_remaining: Hours until event
        last_recommendation_time: ISO timestamp of last recommendation
        min_interval_hours: Minimum hours between recommendations
        
    Returns:
        True if new recommendation should be created
    """
    from datetime import datetime, timezone
    
    # Check if conditions warrant a recommendation
    if occupancy_percent > 80 or hours_remaining > 24:
        return False
    
    if occupancy_percent >= 60 and hours_remaining > 12:
        return False
    
    # Check time interval
    if last_recommendation_time:
        try:
            last_time = datetime.fromisoformat(last_recommendation_time.replace("Z", "+00:00"))
            now = datetime.now(timezone.utc)
            hours_since_last = (now - last_time).total_seconds() / 3600
            
            if hours_since_last < min_interval_hours:
                logger.debug(
                    f"Skipping recommendation: only {hours_since_last:.1f}h since last"
                )
                return False
        except (ValueError, TypeError) as e:
            logger.warning(f"Failed to parse last recommendation time: {e}")
    
    return True
