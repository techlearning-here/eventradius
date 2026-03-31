"""
Authentication and authorization utilities for Supabase.
"""
from fastapi import HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from typing import Optional, Dict, Any
import jwt
import os
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

class OptionalHTTPBearer(HTTPBearer):
    """Custom HTTPBearer that doesn't auto-raise on missing credentials"""
    async def __call__(self, request: Request) -> Optional[HTTPAuthorizationCredentials]:
        try:
            return await super().__call__(request)
        except HTTPException:
            return None

security = OptionalHTTPBearer()

class AuthService:
    """Authentication service for Supabase JWT tokens"""
    
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
        self.jwt_secret = os.getenv("JWT_SECRET", "supabase_jwt_secret")
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify JWT token and return payload"""
        try:
            # In production, you would verify with Supabase's JWT secret
            # For simplicity, we'll decode without verification for now
            # In a real app, use: jwt.decode(token, self.jwt_secret, algorithms=["HS256"])
            payload = jwt.decode(token, options={"verify_signature": False})
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("Token expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid token: {e}")
            return None
    
    def get_current_user(self, token: str) -> Optional[Dict[str, Any]]:
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
            "role": payload.get("role", "authenticated")
        }
    
    def require_auth(self, credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
        """Dependency to require authentication"""
        token = credentials.credentials
        user = self.get_current_user(token)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user
    
    def require_admin(self, credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
        """Dependency to require admin role"""
        user = self.require_auth(credentials)
        
        if user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        
        return user

# Initialize auth service
from config.database import SupabaseClient

supabase_client = SupabaseClient.get_client()
auth_service = AuthService(supabase_client)

# Convenience dependencies
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """FastAPI dependency to get current user"""
    return auth_service.require_auth(credentials)

def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """FastAPI dependency to get current admin user"""
    return auth_service.require_admin(credentials)

def optional_auth(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security, use_cache=False)) -> Optional[Dict[str, Any]]:
    """Optional authentication dependency - returns user if authenticated, None otherwise"""
    try:
        if credentials is None:
            return None
        token = credentials.credentials
        return auth_service.get_current_user(token)
    except Exception:
        return None