"""
User-related API endpoints.
"""

import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

from config.auth import get_current_user
from config.database import fetch_single_record, get_table, insert_record, update_record

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


class RoleRequest(BaseModel):
    role: str


# User endpoints
@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(user: dict = Depends(get_current_user)):
    """
    Get current user's profile.
    """
    try:
        logger.info(f"Fetching profile for user: {user['id']}")
        # Fetch user profile from Supabase
        response = fetch_single_record("profiles", user["id"])
        logger.info(f"Profile response: {response}")

        if response.data:
            profile = response.data
        else:
            # Create default profile if doesn't exist
            logger.info(f"Creating default profile for user: {user['id']}")
            profile = {
                "id": user["id"],
                "email": user.get("email", ""),
                "full_name": user.get("name", ""),
                "avatar_url": None,
                "bio": None,
                "created_at": datetime.now().isoformat(),
            }

            # Insert default profile
            logger.info(f"Inserting default profile: {profile}")
            get_table("profiles").insert(profile).execute()

        return profile
    except Exception as e:
        logger.error(f"Error fetching user profile: {e}", exc_info=True)
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
        update_data = {
            k: v for k, v in user_update.model_dump().items() if v is not None
        }

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
            get_table("user_roles").select("role").eq("user_id", user["id"]).execute()
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
async def add_user_role(role_request: RoleRequest, user: dict = Depends(get_current_user)):
    """
    Add a role to the current user.
    """
    try:
        role = role_request.role
        
        if not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role is required"
            )
        
        logger.info(f"Adding role {role} to user {user['id']}")
        
        # Check if role already exists
        existing = (
            get_table("user_roles")
            .select("*")
            .eq("user_id", user["id"])
            .eq("role", role)
            .execute()
        )

        if existing.data:
            logger.info(f"Role {role} already exists for user {user['id']}")
            return {"message": "Role already exists"}

        # Add role
        logger.info(f"Inserting role {role} for user {user['id']}")
        insert_record("user_roles", {"user_id": user["id"], "role": role})
        logger.info(f"Role {role} added successfully for user {user['id']}")
        return {"message": "Role added successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding user role: {e}", exc_info=True)
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
        logger.info(f"Fetching preferences for user: {user['id']}")
        table = get_table("user_preferences")
        response = table.select("*").eq("user_id", user["id"]).execute()
        logger.info(f"Preferences response: {response}")
        
        if not response.data:
            logger.info(f"No preferences found for user {user['id']}, creating default")
            # Create default preferences if none exist
            default_prefs = {
                "user_id": user["id"],
                "age_range": None,
                "has_kids": False,
                "interests": [],
                "city": None,
                "latitude": None,
                "longitude": None,
                "distance_range": 25,
                "onboarding_completed": False,
            }
            logger.info(f"Creating default preferences: {default_prefs}")
            insert_result = insert_record("user_preferences", default_prefs)
            logger.info(f"Insert result: {insert_result}")
            return default_prefs
        
        return response.data[0]  # Return the first (and only) record
    except Exception as e:
        logger.error(f"Error fetching user preferences: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user preferences",
        )


@router.put("/me/preferences")
async def update_user_preferences(
    preferences: dict, user: dict = Depends(get_current_user)
):
    """
    Update current user's preferences.
    """
    logger.info(f"Updating user preferences for user: {user['id']}")
    logger.info(f"Preferences data: {preferences}")
    
    try:
        # Check if preferences exist using user_id (not id)
        logger.info(f"Checking if preferences exist for user: {user['id']}")
        table = get_table("user_preferences")
        existing_result = table.select("*").eq("user_id", user["id"]).execute()
        logger.info(f"Existing preferences result: {existing_result}")

        if existing_result.data:
            # Update existing - use user_id to filter, not id
            logger.info(f"Updating existing preferences for user: {user['id']}")
            result = table.update(preferences).eq("user_id", user["id"]).execute()
            logger.info(f"Update result: {result}")
        else:
            # Create new
            logger.info(f"Creating new preferences for user: {user['id']}")
            insert_data = {"user_id": user["id"], **preferences}
            logger.info(f"Insert data: {insert_data}")
            result = insert_record("user_preferences", insert_data)
            logger.info(f"Insert result: {result}")

        logger.info("Preferences updated successfully")
        return {"message": "Preferences updated successfully"}
    except Exception as e:
        logger.error(f"Error updating user preferences: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user preferences: {str(e)}",
        )


@router.get("/debug/preferences")
async def debug_user_preferences(user: dict = Depends(get_current_user)):
    """
    Debug endpoint to check current user preferences
    """
    try:
        logger.info(f"Debug: Checking preferences for user {user['id']}")
        table = get_table("user_preferences")
        result = table.select("*").eq("user_id", user["id"]).execute()
        logger.info(f"Debug: Raw result: {result}")
        
        return {
            "user_id": user["id"],
            "preferences": result.data,
            "count": len(result.data) if result.data else 0,
            "onboarding_completed": result.data[0].get("onboarding_completed") if result.data else None
        }
    except Exception as e:
        logger.error(f"Debug error: {e}", exc_info=True)
        return {"error": str(e), "user_id": user["id"]}


@router.get("/debug/tables")
async def debug_tables():
    """
    Debug endpoint to check table existence
    """
    try:
        from config.database import get_table
        
        # Check if user_preferences table exists
        try:
            result = get_table("user_preferences").select("*").limit(1).execute()
            logger.info(f"user_preferences table check: {result}")
            table_exists = True
            table_data = result.data
        except Exception as e:
            logger.error(f"user_preferences table error: {e}")
            table_exists = False
            table_data = str(e)
        
        return {
            "user_preferences_exists": table_exists,
            "user_preferences_data": table_data
        }
    except Exception as e:
        logger.error(f"Debug tables error: {e}", exc_info=True)
        return {"error": str(e)}


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
            merged.append({**profile, "roles": user_roles})

        return merged
    except Exception as e:
        logger.error(f"Error fetching all users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch users",
        )
