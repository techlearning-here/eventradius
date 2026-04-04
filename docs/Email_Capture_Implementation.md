# Email Capture Implementation

## Overview
This document describes the implementation of email capture for future communications in the EventRadius application.

## Problem
Previously, user email addresses were only stored in the `auth.users` table managed by Supabase Auth, making them difficult to access for application-level communications.

## Solution
Added an `email` field to the `profiles` table to capture and store user emails for easy access in future communications.

## Changes Made

### 1. Database Migration
**File**: `supabase/migrations/add_email_to_profiles.sql`

- Added `email` column to `profiles` table
- Created index on email for faster lookups
- Updated existing profiles with email from `auth.users`
- Added documentation comment

### 2. Backend API Updates
**File**: `backend/api/users.py`

- Updated `GET /api/users/me` to include email field in response
- Updated profile creation to capture email from auth user
- Modified select statement: `user_id,email,full_name,avatar_url,created_at`

### 3. Frontend Type Updates
**File**: `frontend/src/integrations/backend/api.ts`

- Updated `UserProfile` interface to include email field
- Changed from `user_id`-only to include `email: string`

### 4. Test Updates
**File**: `backend/tests/test_users_api.py`

- Updated mock data to include email field
- Fixed formatting issues (trailing commas)
- Ensured test assertions include email validation

## Database Schema

### Before
```sql
CREATE TABLE public.profiles (
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  provider TEXT DEFAULT 'email',
  provider_id TEXT,
  avatar_url TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### After
```sql
CREATE TABLE public.profiles (
  user_id UUID NOT NULL UNIQUE,
  email TEXT,
  display_name TEXT,
  provider TEXT DEFAULT 'email',
  provider_id TEXT,
  avatar_url TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

## API Response Changes

### User Profile Endpoint
**Endpoint**: `GET /api/users/me`

**Response Structure**:
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "full_name": "User Name",
  "avatar_url": "https://example.com/avatar.jpg",
  "created_at": "2023-01-01T00:00:00Z"
}
```

## Benefits

1. **Easy Email Access**: Email addresses now available in profiles table
2. **Communication Ready**: System can easily fetch emails for notifications
3. **Performance**: Indexed email field for fast lookups
4. **Backward Compatible**: Existing profiles automatically updated
5. **Type Safety**: Frontend types updated to match schema

## Migration Instructions

1. Run the migration in Supabase SQL Editor:
   ```sql
   -- Execute add_email_to_profiles.sql
   ```

2. Deploy backend API changes
3. Deploy frontend type changes
4. Test email capture functionality

## Future Considerations

- Email verification status tracking
- Email preference management (opt-in/opt-out)
- Email template system for communications
- Bulk email sending capabilities

## Testing

All tests pass including:
- User profile retrieval with email
- Profile creation with email capture
- CI pipeline validation
- Code formatting and linting

The implementation is ready for production deployment.
