---
description: Detailed project architecture and data models
---

# Project Structure

## Architecture Overview

EventRadius is an event management platform with:
- **Frontend**: React SPA with event discovery, creation wizard, and organizer dashboard
- **Backend**: FastAPI with Supabase PostgreSQL backend
- **Auth**: Supabase Auth with JWT, email/phone verification for organizers

## Directory Layout

```
backend/
├── api/
│   ├── auth.py          # OAuth profile linking
│   ├── events.py        # Event CRUD + approval requests
│   ├── users.py         # Profiles, preferences, roles
│   ├── verification.py  # Email/phone verification flow
│   └── organizers.py    # Organizer activation status
├── config/
│   ├── database.py      # Supabase client + table helpers
│   └── auth.py          # JWT validation, get_current_user deps
└── main.py              # FastAPI app, CORS, router registration

frontend/src/
├── components/
│   ├── common/          # Reusable UI (Button, Card, Modal)
│   ├── events/          # Event cards, EventWizard
│   └── OrganizerDashboard/  # Approval management UI
├── pages/               # Route-level components
├── hooks/               # useAuth, useEvents, etc.
└── lib/                 # API clients, utils
```

## Key Data Models

### Event (events table)
Core fields: `title`, `description`, `location`, `start_time`, `end_time`, `image_url`, `category`, `organizer_id`, `status` (draft/published/upcoming/completed/cancelled), `is_public`, `max_participants`

Extended attributes (EventAttributes):
- **Audience**: `age_categories[]`, `gender_preference`, `family_friendly`, `senior_friendly`, `singles_friendly`, `couples_oriented`
- **Accessibility**: `wheelchair_accessible`, `hearing_accessible`, `vision_accessible`, `sensory_friendly`
- **Cultural**: `religious_context[]`, `dietary_context[]`, `traditional_attire`
- **Prerequisites**: `skill_level`, `physical_fitness`, `equipment_required[]`, `dress_code`
- **Content**: `content_rating`, `alcohol_served`, `noise_level`, `physical_intensity`
- **Social**: `networking_focus`, `ice_breakers`, `team_building`
- **Language**: `primary_language`, `secondary_languages[]`, `interpretation_available`
- **Pricing**: `refund_policy`, `group_discounts`, `ticket_price`, `require_approval`, `enable_waitlist`

### User (profiles table)
- `user_id`, `email`, `full_name`, `avatar_url`, `phone`, `phone_country_code`
- `email_verified`, `phone_verified`, `organizer_status` (pending/active)
- `provider`, `provider_id` (OAuth linking)

### User Preferences (user_preferences table)
`user_id`, `age_range`, `has_kids`, `interests[]`, `city`, `latitude`, `longitude`, `distance_range`, `onboarding_completed`, `is_organizer`

### Approval Requests (event_approval_requests table)
For events with `require_approval=true`: `event_id`, `user_id`, `approval_status` (pending/approved/rejected/waitlisted), `requester_name/email/phone/bio/reason`, `waitlist_position`, `registered_at`

## Key Flows

1. **Organizer Activation**: User adds role → provides phone → email+phone verification → `organizer_status` becomes `active` → can create events
2. **Event Creation**: EventWizard multi-step form → saves as draft → publish → visible in discover
3. **Approval-based Registration**: User requests to join → organizer approves/rejects/waitlists → user notified
4. **OAuth Linking**: Post-auth profile creation → can link/unlink providers via `/api/auth/oauth/*`

## Database Patterns
- All tables use `get_table("tablename")` helper from `config.database`
- Queries chain `.eq()`, `.select()`, `.execute()` pattern
- Soft deletes use `deleted_at` field (filter with `.is_("deleted_at", "null")`)
