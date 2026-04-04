# Phone Number Optional for Regular Users

## Overview
This document clarifies the updated phone number policy where phone numbers are **optional for regular users** but **required for organizers** with verification.

## Updated Phone Number Logic

### ✅ Regular Users (Phone Optional)
- **Phone number**: Completely optional
- **Can add**: Optional phone number for personal use
- **Can remove**: Can remove phone number at any time
- **No verification**: Phone verification not required
- **No country code**: Country code optional for regular users

### ✅ Organizers (Phone Required)
- **Phone number**: Required for organizer activation
- **Country code**: Required for international organizers
- **Verification**: Both phone and email verification required
- **Activation**: Only activated after both verifications complete

## API Behavior

### Update Phone Number Endpoint
**Endpoint**: `PUT /api/users/me/phone`

#### Regular User - Remove Phone
```bash
POST /api/users/me/phone
{
  "phone": "",
  "phone_country_code": ""
}
```

**Response**:
```json
{
  "message": "Phone number removed successfully",
  "phone": null,
  "phone_country_code": null,
  "phone_verified": false
}
```

#### Regular User - Add Optional Phone
```bash
POST /api/users/me/phone
{
  "phone": "+1234567890",
  "phone_country_code": "+1"  // Optional for regular users
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

#### Organizer - Add Required Phone
```bash
POST /api/users/me/phone
{
  "phone": "+447911123456",
  "phone_country_code": "+44"  // Required for organizers
}
```

**Response**:
```json
{
  "message": "Phone number updated successfully",
  "phone": "+447911123456",
  "phone_country_code": "+44",
  "phone_verified": false
}
```

#### Organizer - Missing Country Code (Error)
```bash
POST /api/users/me/phone
{
  "phone": "+447911123456",
  "phone_country_code": ""  // Missing for organizer
}
```

**Error Response**:
```json
{
  "detail": "Country code is required for organizers"
}
```

## Frontend Integration

### TypeScript Types
```typescript
// Phone update - phone is optional
async updatePhoneNumber(phoneData: {
  phone?: string;
  phone_country_code?: string;
}): Promise<{
  message: string;
  phone?: string;
  phone_country_code?: string;
  phone_verified: boolean;
}>

// Organizer status - different requirements
async getOrganizerStatus(): Promise<{
  is_organizer: boolean;
  requires_phone: boolean;
  requires_verification: boolean;
  has_phone: boolean;
  phone_verified: boolean;
  email_verified: boolean;
  organizer_status: 'pending' | 'verified' | 'active' | 'suspended' | null;
  is_active: boolean;
  phone?: string;
  phone_country_code?: string;
}>
```

### React Component Example
```typescript
const PhoneSettings = () => {
  const [organizerStatus, setOrganizerStatus] = useState(null);
  const [phone, setPhone] = useState('');
  
  useEffect(() => {
    const fetchStatus = async () => {
      const status = await apiClient.getOrganizerStatus();
      setOrganizerStatus(status);
    };
    fetchStatus();
  }, []);
  
  const handlePhoneUpdate = async (phoneData: { phone?: string; phone_country_code?: string }) => {
    try {
      const result = await apiClient.updatePhoneNumber(phoneData);
      console.log(result.message);
    } catch (error) {
      console.error('Failed to update phone:', error);
    }
  };
  
  const removePhone = () => {
    handlePhoneUpdate({ phone: '', phone_country_code: '' });
  };
  
  return (
    <div>
      {organizerStatus?.is_organizer ? (
        <div>
          <h3>Organizer Phone (Required)</h3>
          <p>Phone number and country code required for organizer verification</p>
          {/* Organizer phone form with validation */}
        </div>
      ) : (
        <div>
          <h3>Phone Number (Optional)</h3>
          <p>Add phone number for account recovery (optional)</p>
          {/* Optional phone form */}
          <button onClick={removePhone}>Remove Phone</button>
        </div>
      )}
    </div>
  );
};
```

## Database Schema

### Profiles Table
```sql
CREATE TABLE public.profiles (
  user_id UUID NOT NULL UNIQUE,
  email TEXT,
  phone TEXT,                    -- NULL for regular users without phone
  phone_country_code TEXT,       -- NULL if no phone or regular user
  phone_verified BOOLEAN DEFAULT FALSE,  -- FALSE for regular users
  email_verified BOOLEAN DEFAULT FALSE,
  organizer_status TEXT DEFAULT 'pending',
  -- ... other fields
);
```

## User Experience

### Regular User Journey
1. **Sign up**: Email required, phone optional
2. **Profile setup**: Can add phone number optionally
3. **Phone management**: Can add/remove phone anytime
4. **No verification**: Phone verification not required

### Organizer Journey
1. **Request organizer role**: Role assigned as 'pending'
2. **Add phone number**: Required with country code
3. **Email verification**: Required for activation
4. **Phone verification**: Required for activation
5. **Activation**: Account becomes 'active' after both verifications

## Validation Rules

### Regular Users
- ✅ **Phone**: Optional (can be null/empty)
- ✅ **Country Code**: Optional (can be null/empty)
- ✅ **Verification**: Not required
- ✅ **Removal**: Can remove phone anytime

### Organizers
- ✅ **Phone**: Required for activation
- ✅ **Country Code**: Required for international format
- ✅ **Verification**: Both email and phone required
- ❌ **Removal**: Cannot remove phone while active organizer

## API Response Examples

### Regular User Status
```json
{
  "is_organizer": false,
  "requires_phone": false,
  "requires_verification": false,
  "has_phone": false,
  "phone_verified": false,
  "email_verified": false,
  "organizer_status": null,
  "is_active": false
}
```

### Regular User With Phone
```json
{
  "is_organizer": false,
  "requires_phone": false,
  "requires_verification": false,
  "has_phone": true,
  "phone_verified": false,
  "email_verified": true,
  "organizer_status": null,
  "is_active": false,
  "phone": "+1234567890",
  "phone_country_code": "+1"
}
```

### Pending Organizer
```json
{
  "is_organizer": true,
  "requires_phone": true,
  "requires_verification": true,
  "has_phone": true,
  "phone_verified": false,
  "email_verified": true,
  "organizer_status": "pending",
  "is_active": false,
  "phone": "+447911123456",
  "phone_country_code": "+44"
}
```

### Active Organizer
```json
{
  "is_organizer": true,
  "requires_phone": true,
  "requires_verification": true,
  "has_phone": true,
  "phone_verified": true,
  "email_verified": true,
  "organizer_status": "active",
  "is_active": true,
  "phone": "+447911123456",
  "phone_country_code": "+44"
}
```

## Benefits

### For Regular Users
- **Privacy**: No forced phone number collection
- **Flexibility**: Can add phone when needed
- **Optional verification**: Phone verification not required
- **Easy removal**: Can remove phone anytime

### For Organizers
- **Reliability**: Verified contact information
- **Emergency contact**: Reachable for urgent issues
- **Professional standards**: Verified organizers
- **International support**: Country code validation

### For Platform
- **Trust**: Verified organizers create better events
- **Safety**: Reliable contact for emergencies
- **Quality**: Professional organizer standards
- **User choice**: Optional for regular users

## Implementation Notes

### Security
- **Phone removal**: Clears verification status
- **Data privacy**: Phone numbers stored securely
- **Optional collection**: Minimal data for regular users

### User Experience
- **Clear messaging**: Different requirements explained
- **Progressive disclosure**: Show phone options based on user type
- **Error handling**: Clear validation messages

### Testing
- **Regular user flow**: Add/remove phone without verification
- **Organizer flow**: Phone required for activation
- **Edge cases**: Empty phone, missing country code

## Summary

The phone number system now properly distinguishes between regular users and organizers:

- **Regular Users**: Phone completely optional, no verification required
- **Organizers**: Phone required with country code, verification mandatory for activation

This provides the right balance between user privacy and organizer reliability while maintaining platform security and event quality.
