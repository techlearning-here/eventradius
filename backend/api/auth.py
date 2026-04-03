"""
Authentication-related API endpoints for OAuth handling.
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from config.auth import get_current_user
from config.database import SupabaseClient

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])


# Pydantic models
class OAuthProfile(BaseModel):
    provider: str
    provider_id: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None


class OAuthProfileResponse(BaseModel):
    id: str
    user_id: str
    provider: str
    provider_id: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: str
    updated_at: str


@router.post("/oauth/profile", response_model=dict)
async def create_or_update_oauth_profile(
    profile: OAuthProfile, user: dict = Depends(get_current_user)
):
    """
    Create or update OAuth user profile.
    This endpoint is called after successful OAuth authentication.
    """
    try:
        supabase = SupabaseClient.get_client()

        # Check if profile already exists
        existing_response = (
            supabase.table("profiles").select("*").eq("user_id", user["id"]).single()
        )

        if existing_response.data:
            # Update existing profile with OAuth info
            update_data = {
                "provider": profile.provider,
                "provider_id": profile.provider_id,
                "updated_at": "now()",
            }

            # Only update non-null fields
            if profile.full_name:
                update_data["full_name"] = profile.full_name
            if profile.avatar_url:
                update_data["avatar_url"] = profile.avatar_url

            supabase.table("profiles").update(update_data).eq(
                "user_id", user["id"]
            ).execute()

            logger.info(
                f"Updated OAuth profile for user {user['id']} with provider {profile.provider}"
            )

        else:
            # Create new profile
            profile_data = {
                "user_id": user["id"],
                "provider": profile.provider,
                "provider_id": profile.provider_id,
                "full_name": profile.full_name,
                "avatar_url": profile.avatar_url,
            }

            supabase.table("profiles").insert(profile_data).execute()

            logger.info(
                f"Created OAuth profile for user {user['id']} with provider {profile.provider}"
            )

        return {"message": "Profile created/updated successfully"}

    except Exception as e:
        logger.error(f"Error creating/updating OAuth profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create or update OAuth profile",
        )


@router.get("/oauth/profile", response_model=OAuthProfileResponse)
async def get_oauth_profile(user: dict = Depends(get_current_user)):
    """
    Get the OAuth profile for the current user.
    """
    try:
        supabase = SupabaseClient.get_client()

        response = (
            supabase.table("profiles").select("*").eq("user_id", user["id"]).single()
        )

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found"
            )

        return response.data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching OAuth profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch OAuth profile",
        )


@router.post("/oauth/link")
async def link_oauth_account(
    profile: OAuthProfile, user: dict = Depends(get_current_user)
):
    """
    Link an OAuth account to an existing email account.
    """
    try:
        supabase = SupabaseClient.get_client()

        # Check if OAuth provider_id is already linked to another account
        existing_oauth = (
            supabase.table("profiles")
            .select("*")
            .eq("provider_id", profile.provider_id)
            .single()
        )

        if existing_oauth.data and existing_oauth.data["user_id"] != user["id"]:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="OAuth account is already linked to another user",
            )

        # Update current user's profile with OAuth info
        update_data = {
            "provider": profile.provider,
            "provider_id": profile.provider_id,
            "updated_at": "now()",
        }

        if profile.full_name:
            update_data["full_name"] = profile.full_name
        if profile.avatar_url:
            update_data["avatar_url"] = profile.avatar_url

        supabase.table("profiles").update(update_data).eq(
            "user_id", user["id"]
        ).execute()

        logger.info(f"Linked OAuth account {profile.provider_id} to user {user['id']}")

        return {"message": "OAuth account linked successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error linking OAuth account: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to link OAuth account",
        )


@router.delete("/oauth/unlink")
async def unlink_oauth_account(user: dict = Depends(get_current_user)):
    """
    Unlink OAuth account from the current user.
    Reverts to email-based authentication.
    """
    try:
        supabase = SupabaseClient.get_client()

        # Check if user has OAuth provider
        profile_response = (
            supabase.table("profiles")
            .select("provider")
            .eq("user_id", user["id"])
            .single()
        )

        if not profile_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found"
            )

        if profile_response.data["provider"] == "email":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No OAuth account to unlink",
            )

        # Update profile to remove OAuth info
        supabase.table("profiles").update(
            {"provider": "email", "provider_id": None, "updated_at": "now()"}
        ).eq("user_id", user["id"]).execute()

        logger.info(f"Unlinked OAuth account from user {user['id']}")

        return {"message": "OAuth account unlinked successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error unlinking OAuth account: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to unlink OAuth account",
        )
