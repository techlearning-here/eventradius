"""
User-related API endpoints.
"""

import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

from config.auth import get_current_user
from config.database import fetch_single_record, get_table

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/users", tags=["users"])


# Pydantic models
class UserProfile(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    created_at: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None


# User endpoints
@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(user: dict = Depends(get_current_user)):
    """
    Get current user's profile.
    """
    try:
        # Fetch user profile from Supabase
        response = fetch_single_record("profiles", user["id"])

        if response.data:
            profile = response.data
        else:
            # Create default profile if doesn't exist
            profile = {
                "id": user["id"],
                "email": user.get("email", ""),
                "full_name": user.get("name", ""),
                "avatar_url": None,
                "bio": None,
                "created_at": datetime.now().isoformat(),
            }

            # Insert default profile
            get_table("profiles").insert(profile).execute()

        return profile
    except Exception as e:
        logger.error(f"Error fetching user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user profile",
        )


@router.put("/me", response_model=UserProfile)
async def update_current_user_profile(
    user_update: UserUpdate, user: dict = Depends(get_current_user)
):
    """
    Update current user's profile.
    """
    try:
        update_data = {k: v for k, v in user_update.dict().items() if v is not None}

        if not update_data:
            # Return current profile
            response = fetch_single_record("profiles", user["id"])
            if response.data:
                return response.data
            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found"
                )

        # Update profile
        response = (
            get_table("profiles").update(update_data).eq("id", user["id"]).execute()
        )

        if not response.data:
            # Create profile if doesn't exist
            profile_data = {
                "id": user["id"],
                "email": user.get("email", ""),
                **update_data,
            }
            response = get_table("profiles").insert(profile_data).execute()

        return response.data[0]
    except Exception as e:
        logger.error(f"Error updating user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user profile",
        )


@router.get("/{user_id}", response_model=UserProfile)
async def get_user_profile(user_id: str):
    """
    Get a user's public profile.
    """
    try:
        response = fetch_single_record("profiles", user_id)

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        return response.data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user profile {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user profile",
        )


@router.get("/me/events")
async def get_user_events(user: dict = Depends(get_current_user)):
    """
    Get events created by the current user.
    """
    try:
        # Events created by user
        created_events = (
            get_table("events")
            .select("*")
            .eq("organizer_id", user["id"])
            .order("created_at", desc=True)
            .execute()
        )

        # Events user is participating in
        participation_response = (
            get_table("event_participants")
            .select("event_id")
            .eq("user_id", user["id"])
            .execute()
        )

        event_ids = [p["event_id"] for p in participation_response.data]

        participating_events = []
        if event_ids:
            participating_events = (
                get_table("events")
                .select("*")
                .in_("id", event_ids)
                .order("created_at", desc=True)
                .execute()
            )

        return {
            "created": created_events.data,
            "participating": participating_events.data if participating_events else [],
        }
    except Exception as e:
        logger.error(f"Error fetching user events: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user events",
        )


# User roles endpoints
@router.get("/me/roles")
async def get_user_roles(user: dict = Depends(get_current_user)):
    """
    Get current user's roles.
    """
    try:
        response = (
            get_table("user_roles")
            .select("role")
            .eq("user_id", user["id"])
            .execute()
        )
        
        roles = [r["role"] for r in response.data] if response.data else []
        return {"roles": roles}
    except Exception as e:
        logger.error(f"Error fetching user roles: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user roles",
        )


@router.post("/me/roles")
async def add_user_role(role: str, user: dict = Depends(get_current_user)):
    """
    Add a role to the current user.
    """
    try:
        # Check if role already exists
        existing = (
            get_table("user_roles")
            .select("*")
            .eq("user_id", user["id"])
            .eq("role", role)
            .execute()
        )
        
        if existing.data:
            return {"message": "Role already exists"}
        
        # Add role
        insert_record("user_roles", {"user_id": user["id"], "role": role})
        return {"message": "Role added successfully"}
    except Exception as e:
        logger.error(f"Error adding user role: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add user role",
        )


# User preferences endpoints
@router.get("/me/preferences")
async def get_user_preferences(user: dict = Depends(get_current_user)):
    """
    Get current user's preferences.
    """
    try:
        response = fetch_single_record("user_preferences", user["id"])
        return response.data or {}
    except Exception as e:
        logger.error(f"Error fetching user preferences: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user preferences",
        )


@router.put("/me/preferences")
async def update_user_preferences(preferences: dict, user: dict = Depends(get_current_user)):
    """
    Update current user's preferences.
    """
    try:
        # Check if preferences exist
        existing = fetch_single_record("user_preferences", user["id"])
        
        if existing.data:
            # Update existing
            update_record("user_preferences", user["id"], preferences)
        else:
            # Create new
            insert_record("user_preferences", {"user_id": user["id"], **preferences})
        
        return {"message": "Preferences updated successfully"}
    except Exception as e:
        logger.error(f"Error updating user preferences: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user preferences",
        )


# Admin endpoints
@router.get("/admin/users")
async def get_all_users(user: dict = Depends(get_current_user)):
    """
    Get all users with their profiles and roles (admin only).
    """
    # TODO: Add admin role check
    try:
        profiles_response = get_table("profiles").select("*").execute()
        roles_response = get_table("user_roles").select("*").execute()
        
        profiles = profiles_response.data or []
        roles = roles_response.data or []
        
        # Merge profiles with roles
        merged = []
        for profile in profiles:
            user_roles = [r["role"] for r in roles if r["user_id"] == profile["id"]]
            merged.append({
                ...profile,
                roles: user_roles
            })
        
        return merged
    except Exception as e:
        logger.error(f"Error fetching all users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch users",
        )
