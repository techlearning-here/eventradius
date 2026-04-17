# Quick Event Creation Feature

## Overview

**Quick Event Creation** enables organizers to create and publish events in under a minute by reducing required input fields and moving advanced configuration to post-creation settings. This feature dramatically lowers the barrier to event creation while maintaining full functionality for complex events.

> "Create in seconds, refine at your leisure"

---

## Goals

1. **Reduce Time-to-Publish**: From 5-10 minutes to under 60 seconds
2. **Minimize Cognitive Load**: Show only essential fields during creation
3. **Enable Immediate Sharing**: Events are live instantly with basic info
4. **Maintain Flexibility**: Full customization available post-creation
5. **Increase Event Creation Rate**: Reduce abandonment from form fatigue

---

## How It Works

### Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  QUICK CREATE MODE (Single Page)                            │
├─────────────────────────────────────────────────────────────┤
│  1. Organizer clicks "Create Event"                         │
│     ↓                                                       │
│  2. Single-page form appears (4-5 fields)                   │
│     - Event Title                                           │
│     - Date & Time                                           │
│     - Event Type (In-Person/Online)                         │
│     - Location / Meeting Link                               │
│     - Description (optional)                                │
│     ↓                                                       │
│  3. Cover image selected from gallery                       │
│     ↓                                                       │
│  4. Click "Create & Publish"                              │
│     ↓                                                       │
│  5. Event is LIVE immediately                               │
│     ↓                                                       │
│  6. Organizer can share link immediately                    │
│     ↓                                                       │
│  7. Advanced settings configured in Event Dashboard       │
└─────────────────────────────────────────────────────────────┘
```

### Two Creation Modes

| Mode | Use Case | Fields | Time to Publish |
|------|----------|--------|-----------------|
| **Quick Create** | Casual meetups, simple events | 4-5 required | < 1 minute |
| **Full Wizard** | Complex events, conferences | 15-20 fields | 5-10 minutes |

**Mode Selection**: Default to Quick Create with "Switch to Full Mode" option for advanced users.

---

## Minimal Required Fields (Quick Create)

### Core Fields (Required)

| Field | Input Type | Smart Defaults | Validation |
|-------|-----------|------------------|------------|
| **Event Title** | Text input (max 100 chars) | - | Min 3 chars, required |
| **Date & Time** | DateTime picker | Timezone auto-detected from location | Must be future date |
| **Event Type** | Radio buttons (2 options) | "In-Person" selected | Required |
| **Location** | Smart search input | - | Required (venue or link) |

### Quick Fields (Optional but Encouraged)

| Field | Input Type | UX Pattern |
|-------|-----------|------------|
| **Description** | Rich text (limited) | Optional, expandable |
| **Cover Image** | Gallery grid | One-click selection from 20+ curated images |

### Location Input by Type

**In-Person Events:**
- Single smart search field (venue name or address)
- Autocomplete from Google Places API
- Map preview renders automatically

**Online Events:**
- Meeting link field OR
- "Auto-generate Zoom link" checkbox (default: checked)
- Auto-creates meeting link on publish

---

## Smart Defaults & Auto-Detection

### Automatic Settings

| Setting | Default Value | Auto-Detection Logic |
|---------|---------------|---------------------|
| **Timezone** | User's local timezone | From browser or IP geolocation |
| **Calendar** | User's personal calendar | Pre-selected, no decision needed |
| **Visibility** | "Public" | Most common choice |
| **Event URL** | Auto-generated slug | From title (e.g., "beach-yoga-sunday") |
| **Capacity** | Unlimited | No limit by default |
| **Registration** | Open (no approval) | Immediate registration |

### Auto-Generated Elements

**On Event Creation:**
- [ ] Calendar invites (Google/Apple/Outlook) for organizer
- [ ] QR code for check-ins
- [ ] Default confirmation email template
- [ ] Social share preview image
- [ ] Event page with selected theme

**For Online Events:**
- [ ] Zoom/Google Meet link auto-generated
- [ ] Join instructions auto-populated
- [ ] Unique join links per attendee (for tracking)

---

## Progressive Disclosure: Post-Creation Settings

### Advanced Features Moved to Dashboard

**Registration Tab:**
- Ticket pricing and tiers
- Capacity limits and waitlist
- Registration questions
- Approval workflow settings
- Group discounts

**Guests Tab:**
- Co-hosts and event managers
- Guest list management
- Bulk invites
- Attendance tracking

**Communications Tab:**
- Email blast scheduling
- Reminder messages
- Custom confirmation emails
- SMS notifications

**Settings Tab:**
- Custom event URL
- SEO settings
- Privacy/visibility changes
- Analytics integration

### Dashboard Access Pattern

```
Event Created → Auto-redirect to Event Dashboard
                         ↓
         ┌───────────────┼───────────────┐
         ↓               ↓               ↓
    [Share Now]    [Edit Details]    [View Page]
         ↓               ↓               ↓
    Copy link      Configure         See live
    Social share   advanced          event
                   settings
```

---

## User Experience Flow

### For Organizers

**Creating Event:**
1. Click "Create Event" from any page
2. Quick Create form appears (single page, 4 fields)
3. See live preview updating as they type
4. Select cover image from gallery (one click)
5. Click "Create & Publish"
6. Event is live with confirmation toast
7. Modal shows: "Share now" vs "Go to Dashboard"

**Success States:**
- **Immediate**: "Your event is live! Share it now →"
- **Dashboard Access**: "Manage advanced settings →"
- **View Event**: "See how guests will view it →"

### For Users (Discoverers)

No change - they see the same polished event pages regardless of creation mode.

---

## Technical Implementation

### Database Schema

```sql
-- Events table already exists, no schema changes required
-- Add column to track creation mode

ALTER TABLE events ADD COLUMN creation_mode VARCHAR(20) DEFAULT 'quick';
-- Values: 'quick', 'full'

-- Add column for initial completion status
ALTER TABLE events ADD COLUMN is_basic_info_complete BOOLEAN DEFAULT true;
-- Quick create: true immediately
-- Full wizard: true after all steps

-- Add column for post-creation configuration status
ALTER TABLE events ADD COLUMN configuration_status JSONB DEFAULT '{}';
-- Stores: {"tickets_configured": false, "emails_setup": false, ...}
```

### API Endpoints

```
POST /api/events/quick-create          # New endpoint for quick create
  Body: {title, datetime, type, location, description?, cover_image_id?}
  Response: {event_id, event_url, share_links}

POST /api/events/:id/complete-setup      # Mark advanced setup complete
  Body: {setup_sections: ["tickets", "emails", ...]}

GET  /api/events/:id/setup-status        # Get configuration progress
  Response: {is_complete, pending_sections: [...]}
```

### Frontend Components

**New Components:**
- `QuickCreateForm` - Single-page minimal form
- `CoverImageGallery` - Grid of curated images with selection
- `SmartLocationInput` - Venue search with autocomplete
- `LiveEventPreview` - Real-time preview of event page
- `CreationModeToggle` - Switch between Quick/Full modes
- `QuickSuccessModal` - Post-creation share/configure options
- `SetupProgressWidget` - Dashboard widget showing configuration status

**Modified Components:**
- `EventWizard` - Add mode selection at start
- `CreateEventPage` - Route to Quick or Full based on mode
- `EventDashboard` - Add setup progress indicators

### State Management

```typescript
// Quick Create Form State
interface QuickCreateState {
  title: string;
  datetime: Date;
  timezone: string;  // auto-detected
  eventType: 'in-person' | 'online';
  location: string;  // venue name or meeting link
  description?: string;
  coverImageId?: string;
  isValid: boolean;
}

// Auto-detected defaults (not shown in UI)
interface AutoDefaults {
  timezone: string;      // from browser
  calendarId: string;      // user's default
  visibility: 'public';
  generateZoomLink: boolean;  // if online
}
```

---

## Business Logic

### Creation Mode Selection

```
ON "Create Event" button click:
  IF user.has_preference_mode:
    → Use preferred mode
  ELSE IF user.is_first_time_creator:
    → Show mode selection modal
    → Default to Quick Create
  ELSE:
    → Use last used mode
```

### Smart Field Validation

```
Quick Create Validation:
  title: required, min 3 chars
  datetime: required, must be future
  eventType: required
  location: 
    IF type == 'in-person': required, min 3 chars
    IF type == 'online': optional (auto-generate if empty)
  description: optional
  coverImage: optional (default to first image in category)
```

### Auto-Generation Rules

```
IF eventType == 'online' AND location IS NULL:
  → Create Zoom meeting via API
  → Set location = zoom_join_url
  → Add to event description: "Zoom link will be provided"

IF coverImageId IS NULL:
  → Select random image from "General" category
  → Apply default theme

IF timezone IS NULL:
  → Detect from browser: Intl.DateTimeFormat().resolvedOptions().timeZone
```

### Post-Creation Nudges

```
DAILY CHECK (for events created in last 7 days):
  IF tickets_not_configured AND is_paid_event_indicated:
    → Send email: "Add ticket pricing to your event"
  
  IF emails_not_configured AND event_date < 3_days:
    → Show dashboard banner: "Set up reminder emails"
  
  IF capacity_not_set AND registration_count > 50:
    → Show tooltip: "Consider setting a capacity limit"
```

---

## Curated Cover Image Gallery

### Image Categories

| Category | Image Count | Use Cases |
|----------|-------------|-----------|
| **General** | 10 | Default, any event type |
| **Social** | 8 | Meetups, parties, networking |
| **Professional** | 8 | Conferences, workshops, business |
| **Arts** | 6 | Music, theater, exhibitions |
| **Sports** | 6 | Fitness, games, outdoor |
| **Food** | 5 | Dining, cooking, tastings |
| **Wellness** | 5 | Yoga, meditation, health |
| **Tech** | 5 | Hackathons, demos, tech talks |

### Image Specifications

- **Dimensions**: 1200 x 630px (optimal for social sharing)
- **Format**: WebP with JPEG fallback
- **Style**: Modern, diverse, inclusive imagery
- **Licensing**: Original or properly licensed stock

### Selection UX

```
Cover Image Selection:
  [Category Tabs: General | Social | Professional | Arts | ...]
  
  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
  │ IMG │ │ IMG │ │ IMG │ │ IMG │  ← Grid layout
  │  ✓  │ │     │ │     │ │     │  ← Checkmark on selected
  └─────┘ └─────┘ └─────┘ └─────┘
  
  [Upload Custom Image] ← Optional, collapsible
```

---

## User Experience Comparison

### Before (Full Wizard Only)

```
Step 1: Basic Info (title, category, type)
  ↓
Step 2: Date & Location
  ↓
Step 3: Description & Images
  ↓
Step 4: Audience & Prerequisites
  ↓
Step 5: Tickets & Capacity
  ↓
Step 6: Review & Publish
  ↓
Total: 5-10 minutes, 15+ fields
```

### After (Quick Create + Progressive)

```
Quick Create Form (single page)
  - Title
  - Date/Time
  - Type
  - Location
  [Create & Publish]
  ↓
Event LIVE (< 1 minute)
  ↓
Configure advanced (Dashboard, at leisure)
  - Tickets
  - Capacity
  - Emails
  - etc.
```

---

## Benefits

### For Organizers

| Benefit | Impact |
|---------|--------|
| **Faster Publishing** | Events live in seconds, not minutes |
| **Lower Abandonment** | 4 fields vs 15+ fields = less form fatigue |
| **Immediate Gratification** | See event live instantly, shareable immediately |
| **Flexible Refinement** | Add complexity over time, not upfront |
| **Mobile-Friendly** | Single page works great on mobile |
| **Casual Events** | Quick coffee meetups don't need full wizard |

### For Platform

| Benefit | Impact |
|---------|--------|
| **Higher Creation Rate** | More events created per user |
| **Better Conversion** | Lower abandonment = more published events |
| **User Satisfaction** | Delight from instant publishing |
| **Competitive Advantage** | Match Luma's "under a minute" promise |

---

## Edge Cases & Handling

### Missing Required Info

| Scenario | Handling |
|----------|----------|
| User closes browser mid-creation | Auto-save draft, restore on return |
| Location not found | Allow manual entry, validate later |
| Image upload fails | Fall back to gallery selection |
| Zoom API down | Store "online" type, generate link later |

### Mode Switching

| Action | Behavior |
|--------|----------|
| Start Quick, switch to Full | Preserve entered fields, continue wizard |
| Start Full, switch to Quick | Save progress, offer to publish with current data |
| Quick Create submitted | Can switch to Full mode from Dashboard for more options |

---

## Success Metrics

| Metric | Baseline | Target |
|--------|----------|--------|
| Time to publish (median) | 8 minutes | < 1 minute |
| Form abandonment rate | 35% | < 15% |
| Events created per user/week | 0.5 | 1.2 |
| Quick vs Full mode usage | N/A | 70% Quick, 30% Full |
| Post-creation configuration rate | N/A | 80% complete setup within 24h |
| User satisfaction (creation flow) | 3.5/5 | 4.5/5 |

---

## Implementation Phases

### Phase 1: MVP Quick Create
- [ ] Single-page form with 4 core fields
- [ ] Cover image gallery (General category only)
- [ ] Auto-generated Zoom links
- [ ] Basic post-creation dashboard
- [ ] Mode toggle (Quick/Full)

### Phase 2: Enhanced UX
- [ ] 40+ curated cover images (all categories)
- [ ] Smart defaults (timezone, calendar)
- [ ] Live preview while typing
- [ ] Auto-save drafts
- [ ] Post-creation nudges

### Phase 3: Advanced Features
- [ ] AI-suggested cover images based on title
- [ ] Template events ("Coffee Meetup", "Workshop", etc.)
- [ ] Bulk quick-create for event series
- [ ] Mobile-optimized quick create flow

---

## Competitive Context

| Platform | Quick Create | Time to Publish |
|----------|--------------|-----------------|
| **Luma** | ✅ Single page | < 1 minute |
| **Eventbrite** | ❌ Multi-step wizard | 5-10 minutes |
| **Meetup** | ❌ Group required first | 10+ minutes |
| **Partiful** | ✅ Minimal form | 2-3 minutes |
| **EventRadius** | 🚧 **This Feature** | **< 1 minute** |

---

## Open Questions

1. Should we require phone verification before Quick Create to reduce spam?
2. How do we handle events that remain unconfigured (no tickets, no capacity) for weeks?
3. Should Quick Create events be marked differently in search results?
4. What's the maximum time we should allow an event to remain in "Quick" state before nudging to complete setup?

---

**Status**: Feature Specification Complete  
**Priority**: High  
**Estimated Development**: 2 sprints  
**Dependencies**: Event Dashboard improvements  
**Owner**: Product + Engineering Team

