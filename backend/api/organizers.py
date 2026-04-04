"""
Organizer-specific API endpoints for verification and activation status.
"""

import logging
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from config.auth import get_current_user
from config.database import get_table

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/organizers", tags=["organizers"])


# Pydantic models
class OrganizerVerificationStatusResponse(BaseModel):
    is_organizer: bool
    email_verified: bool
    phone_verified: bool
    phone_provided: bool
    email_verification_sent: bool
    phone_verification_sent: bool
    email_verification_expires_at: Optional[str]
    phone_verification_expires_at: Optional[str]
    organizer_status: Optional[str]
    is_active: bool
    can_create_events: bool
    missing_requirements: list[str]
    next_actions: list[str]


@router.get("/verification-status", response_model=OrganizerVerificationStatusResponse)
async def get_organizer_verification_status(user: dict = Depends(get_current_user)):
    """
    Get detailed verification status for organizers with activation flags.
    """
    try:
        logger.info(f"Getting organizer verification status for user: {user['id']}")

        # Check if user has organizer role
        user_roles_table = get_table("user_roles")
        roles_response = (
            user_roles_table.select("*").eq("user_id", user["id"]).execute()
        )
        is_organizer = any(
            role.get("role") == "organizer" for role in roles_response.data or []
        )

        if not is_organizer:
            return OrganizerVerificationStatusResponse(
                is_organizer=False,
                email_verified=False,
                phone_verified=False,
                phone_provided=False,
                email_verification_sent=False,
                phone_verification_sent=False,
                email_verification_expires_at=None,
                phone_verification_expires_at=None,
                organizer_status=None,
                is_active=False,
                can_create_events=False,
                missing_requirements=["organizer_role"],
                next_actions=["Request organizer role"],
            )

        # Get user profile with verification details
        profiles_table = get_table("profiles")
        profile_response = (
            profiles_table.select(
                "email_verified,phone_verified,phone,phone_country_code,"
                "verification_token_email,verification_token_phone,"
                "email_verification_expires_at,phone_verification_expires_at,organizer_status"
            )
            .eq("user_id", user["id"])
            .execute()
        )

        if not profile_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found"
            )

        profile = profile_response.data[0]

        # Extract verification status
        email_verified = profile.get("email_verified", False)
        phone_verified = profile.get("phone_verified", False)
        phone_provided = bool(profile.get("phone") and profile.get("phone").strip())
        organizer_status = profile.get("organizer_status", "pending")

        # Check if verification tokens exist (indicates verification sent)
        email_verification_sent = bool(profile.get("verification_token_email"))
        phone_verification_sent = bool(profile.get("verification_token_phone"))

        # Get expiration times
        email_expires_at = profile.get("email_verification_expires_at")
        phone_expires_at = profile.get("phone_verification_expires_at")

        # Check if tokens are expired
        now = datetime.now()
        email_expired = False
        phone_expired = False

        if email_expires_at:
            email_expired = (
                datetime.fromisoformat(email_expires_at.replace("Z", "+00:00")) < now
            )

        if phone_expires_at:
            phone_expired = (
                datetime.fromisoformat(phone_expires_at.replace("Z", "+00:00")) < now
            )

        # Determine if organizer is active and can create events
        is_active = (
            is_organizer
            and email_verified
            and phone_verified
            and organizer_status == "active"
        )

        can_create_events = is_active

        # Determine missing requirements
        missing_requirements = []
        if not email_verified:
            missing_requirements.append("email_verification")
        if not phone_provided:
            missing_requirements.append("phone_number")
        elif not phone_verified:
            missing_requirements.append("phone_verification")

        # Determine next actions
        next_actions = []
        if not email_verified:
            if not email_verification_sent or email_expired:
                next_actions.append("Send email verification")
            else:
                next_actions.append("Verify email code")

        if not phone_provided:
            next_actions.append("Add phone number")
        elif not phone_verified:
            if not phone_verification_sent or phone_expired:
                next_actions.append("Send phone verification")
            else:
                next_actions.append("Verify phone code")

        if not missing_requirements and organizer_status != "active":
            next_actions.append("Wait for organizer activation")

        return OrganizerVerificationStatusResponse(
            is_organizer=is_organizer,
            email_verified=email_verified,
            phone_verified=phone_verified,
            phone_provided=phone_provided,
            email_verification_sent=email_verification_sent and not email_expired,
            phone_verification_sent=phone_verification_sent and not phone_expired,
            email_verification_expires_at=email_expires_at,
            phone_verification_expires_at=phone_expires_at,
            organizer_status=organizer_status,
            is_active=is_active,
            can_create_events=can_create_events,
            missing_requirements=missing_requirements,
            next_actions=next_actions,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting organizer verification status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get organizer verification status",
        )


@router.get("/activation-check")
async def check_organizer_activation(user: dict = Depends(get_current_user)):
    """
    Quick check if organizer is activated and can create events.
    """
    try:
        # Get detailed verification status
        verification_status = await get_organizer_verification_status(user)

        return {
            "is_organizer": verification_status.is_organizer,
            "is_active": verification_status.is_active,
            "can_create_events": verification_status.can_create_events,
            "organizer_status": verification_status.organizer_status,
            "quick_status": _get_quick_status(verification_status),
        }

    except Exception as e:
        logger.error(f"Error checking organizer activation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check organizer activation",
        )


def _get_quick_status(status: OrganizerVerificationStatusResponse) -> str:
    """
    Get a quick status message for the organizer.
    """
    if not status.is_organizer:
        return "not_organizer"

    if status.is_active:
        return "active"

    if not status.email_verified and not status.phone_provided:
        return "needs_setup"

    if not status.email_verified:
        return "needs_email_verification"

    if not status.phone_provided:
        return "needs_phone"

    if not status.phone_verified:
        return "needs_phone_verification"

    if status.organizer_status == "pending":
        return "pending_activation"

    return "unknown"


@router.post("/request-activation")
async def request_organizer_activation(user: dict = Depends(get_current_user)):
    """
    Request organizer activation after completing verifications.
    """
    try:
        # Check if user is eligible for activation
        verification_status = await get_organizer_verification_status(user)

        if not verification_status.is_organizer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not an organizer",
            )

        if verification_status.missing_requirements:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing requirements: {', '.join(verification_status.missing_requirements)}",
            )

        # Check if already active
        if verification_status.is_active:
            return {
                "message": "Organizer is already active",
                "status": "already_active",
            }

        # Update organizer status to active
        profiles_table = get_table("profiles")
        update_data = {
            "organizer_status": "active",
            "updated_at": datetime.now().isoformat(),
        }

        response = (
            profiles_table.update(update_data).eq("user_id", user["id"]).execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update organizer status",
            )

        # Log activation
        verification_logs_table = get_table("verification_logs")
        log_data = {
            "user_id": user["id"],
            "type": "organizer_activation",
            "status": "verified",
            "details": {
                "activated_at": datetime.now().isoformat(),
                "previous_status": verification_status.organizer_status,
            },
        }
        verification_logs_table.insert(log_data).execute()

        return {
            "message": "Organizer activated successfully! You can now create and manage events.",
            "status": "activated",
            "organizer_status": "active",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error requesting organizer activation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to request organizer activation",
        )
