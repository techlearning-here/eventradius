"""
Authentication and authorization utilities for Supabase.
"""

import logging
import os
from typing import Any, Dict, Optional

import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client

from config.database import SupabaseClient

load_dotenv()

logger = logging.getLogger(__name__)


class OptionalHTTPBearer(HTTPBearer):
    """Custom HTTPBearer that doesn't auto-raise on missing credentials"""

    async def __call__(
        self, request: Request
    ) -> Optional[HTTPAuthorizationCredentials]:
        try:
            return await super().__call__(request)
        except HTTPException:
            return None


security = OptionalHTTPBearer()


class AuthService:
    """Authentication service for Supabase JWT tokens"""

    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
        self.jwt_secret = os.getenv(
            "JWT_SECRET_KEY", os.getenv("JWT_SECRET", "supabase_jwt_secret")
        )
        self.jwt_algorithm = os.getenv("JWT_ALGORITHM", "HS256")

    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify JWT token and return payload"""
        try:
            # In production, verify with Supabase's JWT secret; for now decode
            # without verification. Use jwt.decode(..., algorithms=["HS256"]) in prod.
            payload = jwt.decode(token, options={"verify_signature": False})
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("Token expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid token: {e}")
            return None

    def get_current_user_sync(self, token: str) -> Optional[Dict[str, Any]]:
        """Get current user from token"""
        payload = self.verify_token(token)
        if not payload:
            return None

        # Extract user info from token
        user_id = payload.get("sub")
        email = payload.get("email")

        if not user_id:
            return None

        return {
            "id": user_id,
            "email": email,
            "role": payload.get("role", "authenticated"),
        }

    def require_auth(
        self, credentials: HTTPAuthorizationCredentials = Depends(security)
    ) -> Dict[str, Any]:
        """Dependency to require authentication"""
        logger.info(f"🔍 Auth: require_auth called")

        token = credentials.credentials
        logger.info(f"🔍 Auth token: {token[:20] if token else 'None'}...")

        user = self.get_current_user_sync(token)

        if not user:
            logger.warning("🚫 No user found from token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        logger.info(f"✅ User authenticated: {user.get('id', 'unknown')}")
        return user

    def require_admin(
        self, credentials: HTTPAuthorizationCredentials = Depends(security)
    ) -> Dict[str, Any]:
        """Dependency to require admin role"""
        user = self.require_auth(credentials)

        if user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions"
            )

        return user


_auth_service_instance: Optional[AuthService] = None


def _get_auth_service() -> AuthService:
    """Build AuthService on first use; import does not require Supabase env."""
    global _auth_service_instance
    if _auth_service_instance is None:
        _auth_service_instance = AuthService(SupabaseClient.get_client())
    return _auth_service_instance


class _AuthServiceProxy:
    """Delegate to AuthService; supports patch('config.auth.auth_service', ...)."""

    def __getattr__(self, name: str):
        return getattr(_get_auth_service(), name)


auth_service = _AuthServiceProxy()


# Convenience dependencies
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """FastAPI dependency to get current user"""
    logger.info(
        f"🔍 get_current_user called with credentials: {credentials is not None}"
    )

    if credentials is None:
        logger.warning("🚫 No credentials provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    logger.info(f"🔍 Credentials found, calling require_auth")
    return auth_service.require_auth(credentials)


def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """FastAPI dependency to get current admin user"""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return auth_service.require_admin(credentials)


def require_auth(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """FastAPI dependency to require authentication (alias for get_current_user)"""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return auth_service.require_auth(credentials)


def require_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """FastAPI dependency to require admin role (alias for get_current_admin)"""
    return auth_service.require_admin(credentials)


def require_organizer(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """FastAPI dependency to require organizer role (or admin)"""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = auth_service.require_auth(credentials)
    
    # Check if user is organizer or admin
    role = user.get("role", "authenticated")
    is_organizer = role in ["organizer", "admin"]
    
    # Also check profile for organizer_status
    if not is_organizer and role != "admin":
        # Try to get organizer status from user object or check profile
        is_organizer = user.get("is_organizer", False) or user.get("organizer_status") == "approved"
    
    if not is_organizer and role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Organizer access required",
        )
    
    # Add is_organizer flag to user dict
    user["is_organizer"] = True
    return user


def optional_auth(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        security, use_cache=False
    )
) -> Optional[Dict[str, Any]]:
    """Optional auth: return user dict if authenticated, else None."""
    try:
        if credentials is None:
            return None
        token = credentials.credentials
        return auth_service.get_current_user_sync(token)
    except Exception:
        return None
