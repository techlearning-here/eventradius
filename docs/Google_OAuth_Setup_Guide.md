# Google OAuth Setup Guide for EventRadius

This guide walks you through setting up Google OAuth authentication for the EventRadius application.

## Overview

EventRadius uses Supabase for authentication and supports Google OAuth for seamless user signup and login. This implementation allows users to authenticate using their Google accounts.

## Prerequisites

- Google Cloud Console account
- Supabase project
- EventRadius frontend and backend applications

## Step 1: Google Cloud Console Setup

### 1.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your **Project ID** (you'll need this later)

### 1.2 Enable Google+ API

1. In your Google Cloud project, navigate to **APIs & Services** > **Library**
2. Search for "Google+ API" and enable it
3. Also enable "Google Identity Toolkit API"

### 1.3 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth 2.0 Client IDs**
3. Configure the consent screen:
   - Choose **External** for User Type
   - Fill in required app information:
     - App name: "EventRadius"
     - User support email: your email
     - Developer contact information: your email
4. Create OAuth 2.0 Client ID:
   - **Application type**: Web application
   - **Name**: "EventRadius Web App"
   - **Authorized redirect URIs**:
     ```
     https://[YOUR-SUPABASE-PROJECT-ID].supabase.co/auth/v1/callback
     ```
   - **Authorized JavaScript origins** (optional):
     ```
     http://localhost:5173
     https://yourdomain.com
     ```

### 1.4 Get Your Credentials

After creating the OAuth client, you'll receive:
- **Client ID**: `123456789-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx`

**Important**: Keep these credentials secure and never commit them to version control.

## Step 2: Supabase Configuration

### 2.1 Enable Google OAuth Provider

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Find **Google** in the list and enable it
4. Enter your Google OAuth credentials:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
5. Save the configuration

### 2.2 Configure Site URL and Redirect URLs

In Supabase Authentication settings:
- **Site URL**: `http://localhost:5173` (development) or `https://yourdomain.com` (production)
- **Redirect URLs**: Add your frontend URLs:
  - `http://localhost:5173/**`
  - `https://yourdomain.com/**`

### 2.3 Update Database Schema

Run the following SQL migration to add OAuth provider information to user profiles:

```sql
-- Add OAuth provider fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email',
ADD COLUMN IF NOT EXISTS provider_id TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Create index for provider lookup
CREATE INDEX IF NOT EXISTS idx_profiles_provider_id ON public.profiles(provider_id);

-- Update existing profiles to have 'email' as default provider
UPDATE public.profiles
SET provider = 'email'
WHERE provider IS NULL;
```

## Step 3: Frontend Implementation

### 3.1 Environment Variables

Add to your frontend `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 3.2 Update Supabase Client

Ensure your Supabase client configuration supports OAuth:

```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce', // Recommended for web apps
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  }
})
```

### 3.3 Google OAuth Functions

Add OAuth helper functions:

```typescript
// src/lib/auth.ts
import { supabase } from '@/integrations/supabase/client'

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
```

## Step 4: Backend Implementation

### 4.1 Environment Variables

Add to your backend `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 4.2 Update Authentication Service

Enhance your auth service to handle OAuth users:

```python
# backend/config/auth.py
import logging
import os
from typing import Any, Dict, Optional
import jwt
from fastapi import HTTPException, status
from supabase import Client

class AuthService:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
        self.jwt_secret = os.getenv("JWT_SECRET")

    def get_current_user(self, token: str) -> Optional[Dict[str, Any]]:
        """Get current user from JWT token"""
        try:
            payload = jwt.decode(token, options={"verify_signature": False})
            user_id = payload.get("sub")
            email = payload.get("email")

            if not user_id:
                return None

            # Fetch user profile with OAuth info
            response = self.supabase.table("profiles").select("*").eq("user_id", user_id).single()

            if response.data:
                return {
                    "id": user_id,
                    "email": email,
                    "provider": response.data.get("provider", "email"),
                    "full_name": response.data.get("full_name"),
                    "avatar_url": response.data.get("avatar_url"),
                }

            return {
                "id": user_id,
                "email": email,
                "provider": "email",
            }

        except Exception as e:
            logger.error(f"Error decoding token: {e}")
            return None
```

### 4.3 OAuth User Profile Creation

Create an endpoint to handle OAuth user profile creation:

```python
# backend/api/auth.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from config.auth import get_current_user
from config.database import supabase_client

router = APIRouter(prefix="/api/auth", tags=["auth"])

class OAuthProfile(BaseModel):
    provider: str
    provider_id: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

@router.post("/oauth/profile")
async def create_oauth_profile(
    profile: OAuthProfile,
    user: dict = Depends(get_current_user)
):
    """Create or update OAuth user profile"""
    try:
        # Check if profile already exists
        existing = supabase_client.table("profiles").select("*").eq("user_id", user["id"]).single()

        if existing.data:
            # Update existing profile
            supabase_client.table("profiles").update({
                "provider": profile.provider,
                "provider_id": profile.provider_id,
                "full_name": profile.full_name,
                "avatar_url": profile.avatar_url,
                "updated_at": "now()"
            }).eq("user_id", user["id"]).execute()
        else:
            # Create new profile
            supabase_client.table("profiles").insert({
                "user_id": user["id"],
                "provider": profile.provider,
                "provider_id": profile.provider_id,
                "full_name": profile.full_name,
                "avatar_url": profile.avatar_url,
            }).execute()

        return {"message": "Profile created/updated successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## Step 5: Frontend UI Components

### 5.1 Update AuthSheet Component

Add Google OAuth button to your existing AuthSheet:

```typescript
// src/components/AuthSheet.tsx
import { signInWithGoogle } from '@/lib/auth'
import { Chrome } from 'lucide-react'

// Add this button in the form section (before or after the submit button)
<div className="relative my-6">
  <div className="absolute inset-0 flex items-center">
    <span className="w-full border-t border-white/20" />
  </div>
  <div className="relative flex justify-center text-xs uppercase">
    <span className="bg-[hsl(0,0%,10%)] px-2 text-gray-400">Or continue with</span>
  </div>
</div>

<button
  type="button"
  onClick={async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
      toast({ title: 'Welcome!', description: 'Signed in with Google successfully.' })
      onClose()
    } catch (error: unknown) {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }}
  disabled={loading}
  className="w-full bg-white text-black font-medium py-3 px-6 uppercase text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
>
  <Chrome className="w-4 h-4" />
  {loading ? 'Please wait...' : 'Continue with Google'}
</button>
```

### 5.2 Create Auth Callback Page

Create a callback handler for OAuth redirects:

```typescript
// src/pages/AuthCallback.tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'

const AuthCallback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Auth callback error:', error)
        navigate('/auth?error=auth_failed')
        return
      }

      if (data.session) {
        // Create/update user profile if it's OAuth
        if (data.session.user.app_metadata.provider === 'google') {
          try {
            await fetch('/api/auth/oauth/profile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.session.access_token}`,
              },
              body: JSON.stringify({
                provider: 'google',
                provider_id: data.session.user.id,
                full_name: data.session.user.user_metadata.full_name,
                avatar_url: data.session.user.user_metadata.avatar_url,
              }),
            })
          } catch (error) {
            console.error('Profile creation error:', error)
          }
        }

        navigate('/onboarding')
      } else {
        navigate('/auth')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(295,100%,73%)] mx-auto"></div>
        <p className="mt-4 text-gray-400">Completing authentication...</p>
      </div>
    </div>
  )
}

export default AuthCallback
```

### 5.3 Add Callback Route

Update your App.tsx to include the callback route:

```typescript
// src/App.tsx
import AuthCallback from "./pages/AuthCallback"

// Add this route before the catch-all route
<Route path="/auth/callback" element={<AuthCallback />} />
```

## Step 6: Testing

### 6.1 Local Development Testing

1. Start your frontend: `npm run dev`
2. Start your backend: `uvicorn main:app --reload`
3. Navigate to your app
4. Click "Continue with Google"
5. Complete the Google OAuth flow
6. Verify you're redirected and logged in

### 6.2 Production Testing

1. Update your redirect URIs in Google Cloud Console
2. Update Supabase site URL and redirect URLs
3. Deploy your applications
4. Test the OAuth flow in production

## Security Considerations

1. **Environment Variables**: Never commit OAuth credentials to version control
2. **HTTPS**: Always use HTTPS in production for OAuth redirects
3. **Domain Validation**: Ensure your redirect URLs match exactly
4. **Token Security**: Use secure HTTP-only cookies for tokens when possible
5. **Scope Limitation**: Request only necessary Google API scopes

## Troubleshooting

### Common Issues

1. **Redirect URI Mismatch**:
   - Ensure Google Cloud Console redirect URI matches Supabase callback URL
   - Check for trailing slashes and protocol (http vs https)

2. **CORS Errors**:
   - Add your frontend domain to Google Cloud Console authorized origins
   - Ensure Supabase CORS settings include your frontend domain

3. **Invalid Client**:
   - Verify Client ID and Client Secret are correctly entered in Supabase
   - Check that OAuth is enabled in Supabase providers

4. **Session Not Persisting**:
   - Ensure `detectSessionInUrl: true` in Supabase client config
   - Check browser localStorage for auth tokens

### Debug Mode

Enable debug logging in Supabase client:

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    debug: process.env.NODE_ENV === 'development'
  }
})
```

## Next Steps

After implementing Google OAuth:

1. Add social login buttons for other providers (GitHub, Facebook, etc.)
2. Implement profile picture upload for OAuth users
3. Add email verification for OAuth users
4. Implement account linking (connect multiple OAuth providers to one account)
5. Add audit logging for OAuth events

## Support

For issues related to:
- **Google OAuth**: Google Cloud Console documentation
- **Supabase Auth**: Supabase documentation and support
- **EventRadius**: Check the project's GitHub issues or contact the development team
