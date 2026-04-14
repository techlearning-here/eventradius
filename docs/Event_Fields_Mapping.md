# Event Fields: Backend vs Frontend Mapping

## Backend Models (Stored in Database)

### EventBase (api/events.py)
```python
title, description, location, start_time, end_time, image_url, category
max_participants, is_public, is_paid_event, ticketing_website
event_contact_phone, event_contact_phone_country_code, event_contact_email
subtitle, summary, timezone, doors_open_time, registration_start_time, registration_end_time
event_website, tags, event_format, event_privacy, virtual_event_platform
event_password, age_restriction, accessibility_options
custom_refund_policy, ticket_pricing_description
venue_street, venue_city, venue_state, venue_zip_code, venue_country, venue_building_name
virtual_event_url, status, language
```

### EventAttributes (api/events.py)
```python
# Audience & Demographics
age_categories, gender_preference, family_friendly, senior_friendly, singles_friendly, couples_oriented

# Accessibility
wheelchair_accessible, mobility_friendly, hearing_accessible, vision_accessible
sensory_friendly, service_animals_allowed, accessibility_notes

# Cultural Context
religious_context, dietary_context, traditional_attire

# Prerequisites
skill_level, prior_experience, physical_fitness, equipment_required
dress_code, prerequisites_notes

# Content & Intensity
content_rating, alcohol_served, smoking_policy, noise_level, physical_intensity

# Social Features
networking_focus, social_mixer, ice_breakers, group_activities, team_building

# Language
primary_language, secondary_languages, interpretation_available, sign_language_interpreter

# Type & Format
format, sub_category  # NOTE: event_type is in EventBase, NOT here

# Pricing
refund_policy, group_discounts
```

## Frontend Event Types (components/EventDetail/types.ts)

### Fields present but NOT in backend (POTENTIAL ISSUES):
- `venue_address` - **REMOVED from backend/database** - causes error if sent
- `event_status` - Frontend uses this, backend uses `status`

### Fields to verify mapping:
| Frontend | Backend | Status |
|----------|---------|--------|
| `event_type` | `event_type` (in EventBase) | ✅ OK |
| `format` | `format` (in EventAttributes) | ✅ OK |
| `sub_category` | `sub_category` (in EventAttributes) | ✅ OK |
| `primary_language` | `primary_language` (in EventAttributes) | ✅ OK |
| `secondary_languages` | `secondary_languages` (in EventAttributes) | ✅ OK |
| `refund_policy` | `refund_policy` (in EventAttributes) | ✅ OK |
| `group_discounts` | `group_discounts` (in EventAttributes) | ✅ OK |

## Event Detail Display Components

### EventDetailAttributes.tsx displays:
- ✅ All Audience fields present in backend
- ✅ All Accessibility fields present in backend  
- ✅ All Cultural fields present in backend
- ✅ All Prerequisites fields present in backend
- ✅ All Content fields present in backend
- ✅ All Social fields present in backend
- ✅ All Language fields present in backend
- ✅ All Format fields present in backend (event_type, format, sub_category)
- ✅ All Pricing fields present in backend

## Issues Found

### 1. CRITICAL: `venue_address` field mismatch
- **Frontend type**: Has `venue_address?: string`
- **Backend**: Removed from database and models
- **Impact**: Events fail to save if `venue_address` is sent with empty string
- **Fix**: Remove from frontend EventCreate/EventUpdate types

### 2. Field naming discrepancy
- **Frontend**: `event_status` 
- **Backend**: `status`
- **Impact**: Status may not be properly set/saved

### 3. Database trigger validation
- URLs must start with `http://` or `https://`
- Empty strings fail validation (must be `null`)
