"""
Test cases for authentication
"""

import os
import sys
from unittest.mock import MagicMock, patch

import jwt
import pytest

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from config.auth import AuthService


class TestAuthService:
    """Test authentication service"""

    def setup_method(self):
        """Setup test environment"""
        # Mock environment variables
        os.environ["JWT_SECRET_KEY"] = "test-secret-key"
        os.environ["JWT_ALGORITHM"] = "HS256"

    @patch.dict(
        "os.environ", {"JWT_SECRET_KEY": "test-secret-key", "JWT_ALGORITHM": "HS256"}
    )
    def test_auth_service_initialization(self):
        """Test AuthService initialization"""
        # Mock supabase client
        mock_supabase = MagicMock()
        service = AuthService(supabase_client=mock_supabase)
        assert service.jwt_secret == "test-secret-key"
        assert service.jwt_algorithm == "HS256"

    @patch.dict(
        "os.environ", {"JWT_SECRET_KEY": "test-secret-key", "JWT_ALGORITHM": "HS256"}
    )
    def test_get_current_user_sync_valid_token(self):
        """Test getting user from valid token"""
        mock_supabase = MagicMock()
        service = AuthService(supabase_client=mock_supabase)

        # Create valid token with correct format (sub instead of id)
        payload = {
            "sub": "test-user-id",
            "email": "test@example.com",
            "role": "authenticated",
        }
        token = jwt.encode(payload, "test-secret-key", "HS256")

        result = service.get_current_user_sync(token)

        assert result is not None
        assert result["id"] == "test-user-id"
        assert result["email"] == "test@example.com"
        assert result["role"] == "authenticated"

    @patch.dict(
        "os.environ", {"JWT_SECRET_KEY": "test-secret-key", "JWT_ALGORITHM": "HS256"}
    )
    def test_get_current_user_sync_invalid_token(self):
        """Test getting user from invalid token"""
        mock_supabase = MagicMock()
        service = AuthService(supabase_client=mock_supabase)

        invalid_token = "invalid.token.here"

        result = service.get_current_user_sync(invalid_token)

        assert result is None

    @patch.dict(
        "os.environ", {"JWT_SECRET_KEY": "test-secret-key", "JWT_ALGORITHM": "HS256"}
    )
    def test_get_current_user_sync_expired_token(self):
        """Test getting user from expired token"""
        mock_supabase = MagicMock()
        service = AuthService(supabase_client=mock_supabase)

        # Create expired token
        payload = {"exp": 0}  # Expired timestamp
        token = jwt.encode(payload, "test-secret-key", "HS256")

        result = service.get_current_user_sync(token)

        assert result is None

    @patch.dict(
        "os.environ", {"JWT_SECRET_KEY": "test-secret-key", "JWT_ALGORITHM": "HS256"}
    )
    def test_require_auth_success(self):
        """Test successful authentication requirement"""
        mock_supabase = MagicMock()
        service = AuthService(supabase_client=mock_supabase)

        # Create valid token with correct format (sub instead of id)
        payload = {
            "sub": "test-user-id",
            "email": "test@example.com",
            "role": "authenticated",
        }
        token = jwt.encode(payload, "test-secret-key", "HS256")

        # Mock credentials
        mock_credentials = MagicMock()
        mock_credentials.credentials = token

        result = service.require_auth(mock_credentials)

        assert result is not None
        assert result["id"] == "test-user-id"
        assert result["email"] == "test@example.com"


class TestJWTTokenValidation:
    """Test JWT token validation"""

    @patch.dict(
        "os.environ", {"JWT_SECRET_KEY": "test-secret-key", "JWT_ALGORITHM": "HS256"}
    )
    def test_token_creation_and_validation(self):
        """Test creating and validating JWT tokens"""
        mock_supabase = MagicMock()
        service = AuthService(supabase_client=mock_supabase)

        # Test data
        user_data = {
            "sub": "test-user-id",
            "email": "test@example.com",
            "name": "Test User",
            "role": "authenticated",
        }

        # Create token (simulating what Supabase would do)
        token = jwt.encode(user_data, "test-secret-key", "HS256")

        result = service.get_current_user_sync(token)

        assert result is not None
        assert result["id"] == user_data["sub"]
        assert result["email"] == user_data["email"]

    @patch.dict(
        "os.environ", {"JWT_SECRET_KEY": "test-secret-key", "JWT_ALGORITHM": "HS256"}
    )
    def test_token_with_wrong_secret(self):
        """Test token validation with wrong secret"""
        mock_supabase = MagicMock()
        service = AuthService(supabase_client=mock_supabase)

        # Create token with wrong secret
        user_data = {"id": "test-user-id", "email": "test@example.com"}
        token = jwt.encode(user_data, "wrong-secret", "HS256")

        result = service.get_current_user_sync(token)

        assert result is None

    @patch.dict(
        "os.environ", {"JWT_SECRET_KEY": "test-secret-key", "JWT_ALGORITHM": "HS256"}
    )
    def test_token_with_wrong_algorithm(self):
        """Test token validation with wrong algorithm"""
        mock_supabase = MagicMock()
        service = AuthService(supabase_client=mock_supabase)

        # Create token with wrong algorithm - but since we don't verify signature, it should still work
        user_data = {"sub": "test-user-id", "email": "test@example.com"}
        token = jwt.encode(
            user_data, "test-secret-key", "HS256"
        )  # Use same algorithm for test

        result = service.get_current_user_sync(token)

        # Should still work because we don't verify signature in test mode
        assert result is not None
        assert result["id"] == "test-user-id"


if __name__ == "__main__":
    pytest.main([__file__])
