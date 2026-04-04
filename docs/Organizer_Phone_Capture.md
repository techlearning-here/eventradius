# Organizer Phone Number Capture Implementation

## Overview
This document describes the implementation of phone number capture specifically for event organizers, including country code support and verification tracking.

## Problem
Event organizers need to be reachable via phone for event coordination, emergency situations, and participant communications. Regular users don't need this requirement, but organizers must provide contact information.

## Solution
Added phone number capture functionality that:
- Requires phone numbers for users with organizer role
- Supports country codes for international organizers
- Tracks verification status
- Provides organizer status checking

## Changes Made

### 1. Database Migration
**File**: `supabase/migrations/add_phone_to_organizers.sql`

- Added `phone` column to `profiles` table
- Added `phone_country_code` column for country codes
- Added `phone_verified` boolean flag
- Created composite index for performance
- Added helper function `has_organizer_phone()`

### 2. Backend API Updates
**File**: `backend/api/users.py`

#### New Endpoints:
- `PUT /api/users/me/phone` - Update phone number
- `GET /api/users/me/organizer-status` - Check organizer requirements

#### Updated Endpoints:
- `GET /api/users/me` - Now includes phone fields in response

#### Validation Rules:
- **Regular users**: Phone optional, country code optional
- **Organizers**: Phone required, country code required
- **Phone changes**: Reset verification status to false

### 3. Frontend Type Updates
**File**: `frontend/src/integrations/backend/api.ts`

#### Updated Interfaces:
```typescript
export interface UserProfile {
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  phone_country_code?: string;
  phone_verified?: boolean;
  created_at: string;
}
```

#### New API Methods:
```typescript
updatePhoneNumber(phoneData: {
  phone: string;
  phone_country_code?: string;
})

getOrganizerStatus(): Promise<{
  is_organizer: boolean;
  requires_phone: boolean;
  has_phone: boolean;
  phone_verified: boolean;
  phone?: string;
  phone_country_code?: string;
}>
```

## Database Schema

### Updated Profiles Table
```sql
CREATE TABLE public.profiles (
  user_id UUID NOT NULL UNIQUE,
  email TEXT,
  phone TEXT,
  phone_country_code TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  display_name TEXT,
  provider TEXT DEFAULT 'email',
  provider_id TEXT,
  avatar_url TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### Helper Function
```sql
CREATE FUNCTION public.has_organizer_phone(user_uuid UUID)
RETURNS BOOLEAN AS $$
-- Returns true if user is organizer AND has phone number
```

## API Endpoints

### Update Phone Number
**Endpoint**: `PUT /api/users/me/phone`

**Request Body**:
```json
{
  "phone": "+1234567890",
  "phone_country_code": "+1"
}
```

**Response**:
```json
{
  "message": "Phone number updated successfully",
  "phone": "+1234567890",
  "phone_country_code": "+1",
  "phone_verified": false
}
```

### Get Organizer Status
**Endpoint**: `GET /api/users/me/organizer-status`

**Response (Non-organizer)**:
```json
{
  "is_organizer": false,
  "requires_phone": false,
  "has_phone": false,
  "phone_verified": false
}
```

**Response (Organizer with phone)**:
```json
{
  "is_organizer": true,
  "requires_phone": true,
  "has_phone": true,
  "phone_verified": false,
  "phone": "+1234567890",
  "phone_country_code": "+1"
}
```

### User Profile (Updated)
**Endpoint**: `GET /api/users/me`

**Response**:
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "avatar_url": "https://example.com/avatar.jpg",
  "phone": "+1234567890",
  "phone_country_code": "+1",
  "phone_verified": false,
  "created_at": "2023-01-01T00:00:00Z"
}
```

## Validation Rules

### Phone Number Validation
- **Required for organizers**: Cannot be empty or null
- **Optional for regular users**: Can be null/empty
- **Format**: Accepts various international formats
- **Country code**: Required for organizers, optional for others

### Country Code Validation
- **Organizers**: Must provide country code (e.g., +1, +44, +91)
- **Regular users**: Optional
- **Format**: Must start with + followed by digits

### Verification Tracking
- **Reset on change**: Phone verification resets to false when number changes
- **Default state**: New phone numbers start as unverified
- **Future use**: Ready for SMS verification implementation

## Use Cases

### 1. Organizer Onboarding
```typescript
// Check if organizer needs phone
const status = await apiClient.getOrganizerStatus();
if (status.is_organizer && !status.has_phone) {
  // Show phone capture form
}
```

### 2. Phone Number Update
```typescript
// Update phone with country code
await apiClient.updatePhoneNumber({
  phone: "+447911123456",
  phone_country_code": "+44"
});
```

### 3. Event Communication
```sql
-- Find all organizers with verified phones
SELECT p.user_id, p.phone, p.phone_country_code
FROM profiles p
JOIN user_roles ur ON p.user_id = ur.user_id
WHERE ur.role = 'organizer' 
AND p.phone IS NOT NULL 
AND p.phone_verified = true;
```

## Benefits

1. **Organizer Reachability**: Direct contact for event coordination
2. **International Support**: Country codes for global organizers
3. **Verification Ready**: Framework for SMS verification
4. **Role-based Requirements**: Only organizers need phones
5. **Performance Optimized**: Indexed for fast lookups

## Migration Instructions

1. Run the migration in Supabase SQL Editor:
   ```sql
   -- Execute add_phone_to_organizers.sql
   ```

2. Deploy backend API changes
3. Deploy frontend type changes
4. Test phone capture functionality

## Future Enhancements

### Phone Verification
- SMS verification codes
- WhatsApp verification
- Voice call verification

### Communication Features
- SMS notifications for events
- Emergency contact system
- Automated reminders

### Privacy Features
- Phone number visibility controls
- Communication preferences
- GDPR compliance tools

## Testing

All tests pass including:
- Phone number update endpoint
- Organizer status checking
- Profile retrieval with phone fields
- CI pipeline validation
- Code formatting and linting

The implementation is ready for production deployment and provides a solid foundation for organizer communication features.
