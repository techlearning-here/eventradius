"""
Verification API endpoints for email and phone verification.
"""

import logging
import secrets
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

from config.auth import get_current_user
from config.database import get_table

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/verification", tags=["verification"])


# Pydantic models
class EmailVerificationRequest(BaseModel):
    email: EmailStr


class PhoneVerificationRequest(BaseModel):
    phone: str
    phone_country_code: str


class TokenVerificationRequest(BaseModel):
    token: str
    type: str  # 'email' or 'phone'


class VerificationStatusResponse(BaseModel):
    email_verified: bool
    phone_verified: bool
    organizer_status: str
    is_active_organizer: bool
    email_verification_sent: bool
    phone_verification_sent: bool


@router.post("/email/send")
async def send_email_verification(
    email_data: EmailVerificationRequest, user: dict = Depends(get_current_user)
):
    """
    Send email verification code.
    """
    try:
        logger.info(f"Sending email verification for user: {user['id']}")

        # Generate verification token
        token = secrets.token_urlsafe(6).upper()
        expires_at = datetime.now() + timedelta(hours=24)

        # Update user profile with verification token
        profiles_table = get_table("profiles")
        update_data = {
            "verification_token_email": token,
            "email_verification_expires_at": expires_at.isoformat(),
            "updated_at": datetime.now().isoformat(),
        }

        response = (
            profiles_table.update(update_data).eq("user_id", user["id"]).execute()
        )

        if not response.data:
            # Create profile if doesn't exist
            profile_data = {
                "user_id": user["id"],
                "email": email_data.email,
                "verification_token_email": token,
                "email_verification_expires_at": expires_at.isoformat(),
                "updated_at": datetime.now().isoformat(),
            }
            response = profiles_table.insert(profile_data).execute()

        # Log verification request
        verification_requests_table = get_table("verification_requests")
        request_data = {
            "user_id": user["id"],
            "type": "email",
            "token": token,
            "expires_at": expires_at.isoformat(),
            "metadata": {"email": email_data.email},
        }
        verification_requests_table.insert(request_data).execute()

        # TODO: Send actual email with token
        # For now, just return success with token for testing
        logger.info(f"Email verification token generated: {token}")

        return {
            "message": "Email verification sent successfully",
            "expires_at": expires_at.isoformat(),
            # Remove this in production - only for testing
            "token": token if "localhost" in str(user.get("email", "")) else None,
        }

    except Exception as e:
        logger.error(f"Error sending email verification: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send email verification",
        )


@router.post("/phone/send")
async def send_phone_verification(
    phone_data: PhoneVerificationRequest, user: dict = Depends(get_current_user)
):
    """
    Send phone verification code via SMS.
    """
    try:
        logger.info(f"Sending phone verification for user: {user['id']}")

        # Generate 6-digit verification code
        token = f"{secrets.randbelow(1000000):06d}"
        expires_at = datetime.now() + timedelta(minutes=15)

        # Update user profile with verification token
        profiles_table = get_table("profiles")
        update_data = {
            "verification_token_phone": token,
            "phone_verification_expires_at": expires_at.isoformat(),
            "phone": phone_data.phone,
            "phone_country_code": phone_data.phone_country_code,
            "updated_at": datetime.now().isoformat(),
        }

        response = (
            profiles_table.update(update_data).eq("user_id", user["id"]).execute()
        )

        if not response.data:
            # Create profile if doesn't exist
            profile_data = {
                "user_id": user["id"],
                "email": user.get("email", ""),
                "phone": phone_data.phone,
                "phone_country_code": phone_data.phone_country_code,
                "verification_token_phone": token,
                "phone_verification_expires_at": expires_at.isoformat(),
                "updated_at": datetime.now().isoformat(),
            }
            response = profiles_table.insert(profile_data).execute()

        # Log verification request
        verification_requests_table = get_table("verification_requests")
        request_data = {
            "user_id": user["id"],
            "type": "phone",
            "token": token,
            "expires_at": expires_at.isoformat(),
            "metadata": {
                "phone": phone_data.phone,
                "country_code": phone_data.phone_country_code,
            },
        }
        verification_requests_table.insert(request_data).execute()

        # TODO: Send actual SMS with token
        # For now, just return success with token for testing
        logger.info(f"Phone verification token generated: {token}")

        return {
            "message": "Phone verification sent successfully",
            "expires_at": expires_at.isoformat(),
            # Remove this in production - only for testing
            "token": token if "localhost" in str(user.get("email", "")) else None,
        }

    except Exception as e:
        logger.error(f"Error sending phone verification: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send phone verification",
        )


@router.post("/verify")
async def verify_token(
    verification_data: TokenVerificationRequest, user: dict = Depends(get_current_user)
):
    """
    Verify email or phone using token.
    """
    try:
        logger.info(f"Verifying {verification_data.type} for user: {user['id']}")

        if verification_data.type not in ["email", "phone"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification type",
            )

        # Get user profile
        profiles_table = get_table("profiles")
        profile_response = (
            profiles_table.select("*").eq("user_id", user["id"]).execute()
        )

        if not profile_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found"
            )

        profile = profile_response.data[0]

        # Check token and expiration
        if verification_data.type == "email":
            token_field = "verification_token_email"
            expires_field = "email_verification_expires_at"
            verified_field = "email_verified"
        else:
            token_field = "verification_token_phone"
            expires_field = "phone_verification_expires_at"
            verified_field = "phone_verified"

        stored_token = profile.get(token_field)
        expires_at = profile.get(expires_field)

        if not stored_token or not expires_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No {verification_data.type} verification request found",
            )

        # Check expiration
        if datetime.fromisoformat(expires_at.replace("Z", "+00:00")) < datetime.now():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{verification_data.type.capitalize()} verification has expired",
            )

        # Verify token
        if verification_data.token.upper() != stored_token.upper():
            # Log failed verification attempt
            verification_logs_table = get_table("verification_logs")
            log_data = {
                "user_id": user["id"],
                "type": verification_data.type,
                "status": "failed",
                "details": {
                    "reason": "invalid_token",
                    "provided": verification_data.token,
                },
            }
            verification_logs_table.insert(log_data).execute()

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid {verification_data.type} verification code",
            )

        # Update verification status
        update_data = {
            verified_field: True,
            token_field: None,
            expires_field: None,
            "updated_at": datetime.now().isoformat(),
        }

        profiles_table.update(update_data).eq("user_id", user["id"]).execute()

        # Log successful verification
        verification_logs_table = get_table("verification_logs")
        log_data = {
            "user_id": user["id"],
            "type": verification_data.type,
            "status": "verified",
            "details": {"verified_at": datetime.now().isoformat()},
        }
        verification_logs_table.insert(log_data).execute()

        # Check if user can be activated as organizer
        user_roles_table = get_table("user_roles")
        roles_response = (
            user_roles_table.select("*").eq("user_id", user["id"]).execute()
        )
        is_organizer = any(
            role.get("role") == "organizer" for role in roles_response.data or []
        )

        activation_message = None
        if is_organizer:
            # Get updated verification status
            updated_profile = (
                profiles_table.select(
                    "email_verified, phone_verified, organizer_status"
                )
                .eq("user_id", user["id"])
                .execute()
            )
            updated_profile_data = (
                updated_profile.data[0] if updated_profile.data else {}
            )

            if updated_profile_data.get("email_verified") and updated_profile_data.get(
                "phone_verified"
            ):
                # Activate organizer
                profiles_table.update(
                    {
                        "organizer_status": "active",
                        "updated_at": datetime.now().isoformat(),
                    }
                ).eq("user_id", user["id"]).execute()

                activation_message = (
                    "Organizer account activated! You can now create and manage events."
                )

                # Log organizer activation
                verification_logs_table.insert(
                    {
                        "user_id": user["id"],
                        "type": "organizer_activation",
                        "status": "verified",
                        "details": {"activated_at": datetime.now().isoformat()},
                    }
                ).execute()

        return {
            "message": f"{verification_data.type.capitalize()} verified successfully",
            "activation_message": activation_message,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying {verification_data.type}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify {verification_data.type}",
        )


@router.get("/status", response_model=VerificationStatusResponse)
async def get_verification_status(user: dict = Depends(get_current_user)):
    """
    Get current verification status.
    """
    try:
        # Get user profile
        profiles_table = get_table("profiles")
        profile_response = (
            profiles_table.select(
                "email_verified, phone_verified, organizer_status, verification_token_email, verification_token_phone"
            )
            .eq("user_id", user["id"])
            .execute()
        )

        if not profile_response.data:
            return VerificationStatusResponse(
                email_verified=False,
                phone_verified=False,
                organizer_status="pending",
                is_active_organizer=False,
                email_verification_sent=False,
                phone_verification_sent=False,
            )

        profile = profile_response.data[0]

        # Check if user is organizer
        user_roles_table = get_table("user_roles")
        roles_response = (
            user_roles_table.select("*").eq("user_id", user["id"]).execute()
        )
        is_organizer = any(
            role.get("role") == "organizer" for role in roles_response.data or []
        )

        return VerificationStatusResponse(
            email_verified=profile.get("email_verified", False),
            phone_verified=profile.get("phone_verified", False),
            organizer_status=profile.get("organizer_status", "pending"),
            is_active_organizer=(
                is_organizer
                and profile.get("email_verified", False)
                and profile.get("phone_verified", False)
                and profile.get("organizer_status", "pending") == "active"
            ),
            email_verification_sent=bool(profile.get("verification_token_email")),
            phone_verification_sent=bool(profile.get("verification_token_phone")),
        )

    except Exception as e:
        logger.error(f"Error getting verification status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get verification status",
        )
