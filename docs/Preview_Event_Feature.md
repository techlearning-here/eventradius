# Preview Event Feature (Future)

## Overview

**Preview Events** allow organizers to test demand and collect feedback before committing to a full event. This reduces risk and helps optimize event planning.

> "Plan first, schedule later based on actual interest"

---

## How Preview Events Work

### Workflow

```
1. Organizer creates Preview Event
   ↓
2. Users express interest (no commitment)
   ↓
3. Users comment with suggestions
   ↓
4. Organizer sees demand data
   ↓
5. Organizer decides: Schedule / Modify / Cancel
   ↓
6. If scheduled: Preview converts to Standard Event
   ↓
7. Interested users get notified and can register
```

### Key Characteristics

| Aspect | Preview Event | Standard Event |
|--------|---------------|----------------|
| **Date/Time** | Proposed (flexible) | Confirmed (fixed) |
| **Location** | Proposed (can change) | Confirmed (locked) |
| **User Action** | "I'm Interested" button | "Register/Buy Ticket" |
| **Commitment** | No payment, no obligation | Payment or confirmed registration |
| **Comments** | Open for suggestions | Limited to attendees |
| **Chat** | Available during preview | Available after registration |

---

## Use Cases

### 1. Test New Event Concepts

**Scenario**: Yoga instructor wants to try "Sunset Beach Yoga"
- Creates Preview Event with proposed time/location
- Collects interest from users
- Reads comments about preferred days/times
- If 20+ people interested → schedules actual event
- If low interest → tries different concept instead

### 2. Optimize Event Details

**Scenario**: Cinema considering Tuesday discount showings
- Creates Preview for "$5 Tuesday Movies"
- Users vote on preferred movie genres/times
- Organizer sees which movies have most demand
- Schedules actual showings based on data

### 3. Reduce Risk for New Organizers

**Scenario**: First-time event organizer
- Tests demand before booking expensive venue
- Confirms interest before investing in marketing
- Validates pricing strategy
- Reduces financial risk

### 4. Community-Driven Events

**Scenario**: Local group wants to organize festival
- Creates Preview to gauge community interest
- Collects location suggestions via comments
- Users vote on preferred activities
- Final event shaped by community input

---

## Feature Tiers

| Tier | Preview Events | Notes |
|------|----------------|-------|
| **Free** | 1 Preview Event | Test the concept |
| **Starter ($9)** | 3 Preview Events | Regular testing |
| **Pro ($29)** | Unlimited | Heavy experimentation |
| **Enterprise ($99)** | Unlimited + Analytics | Data-driven decisions |

---

## User Experience

### For Organizers

**Creating Preview Event**:
1. Select "Preview Event" type in creation wizard
2. Enter proposed details (date range, location options)
3. Set "Interest Collection" deadline
4. Publish to community
5. Monitor dashboard: interest count, comments, demographics
6. Decision: Schedule, Modify, or Cancel

**Dashboard Metrics**:
- Number of interested users
- Comment sentiment analysis
- Preferred date/time suggestions
- Location feedback
- Demographics of interested users
- Conversion projection (if scheduled)

**Converting to Standard Event**:
- One-click conversion
- Preserves all interested users
- Notifies them with registration link
- Option to modify details based on feedback

### For Users (Discoverers)

**Viewing Preview Event**:
- Clearly labeled as "Preview / Planning Stage"
- Shows: "This event is being planned. Express interest to help make it happen!"

**Actions Available**:
- ✓ "I'm Interested" button (no commitment)
- ✓ Leave comments/suggestions
- ✓ Vote on date/time preferences
- ✓ Share with friends
- ✓ Follow for updates

**Notifications**:
- "Event you were interested in has been scheduled!"
- "Event organizer updated details based on your feedback"
- "Preview event reached threshold - will be scheduled soon"

---

## Technical Implementation

### Database Schema Additions

```sql
-- Preview events table (extends events table)
CREATE TABLE preview_events (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  proposed_date_start DATE,
  proposed_date_end DATE,
  proposed_time_ranges JSONB, -- [{"start": "18:00", "end": "20:00", "votes": 12}]
  proposed_locations JSONB,    -- [{"name": "Central Park", "votes": 8}, {"name": "Beach", "votes": 15}]
  interest_collection_deadline TIMESTAMP,
  min_interest_threshold INTEGER DEFAULT 10,
  interest_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'collecting', -- collecting, scheduled, cancelled
  created_at TIMESTAMP DEFAULT NOW()
);

-- User interest in preview events
CREATE TABLE preview_interests (
  id UUID PRIMARY KEY,
  preview_event_id UUID REFERENCES preview_events(id),
  user_id UUID REFERENCES auth.users(id),
  preferred_date DATE,
  preferred_location VARCHAR(255),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(preview_event_id, user_id)
);

-- Preview event comments (suggestions)
CREATE TABLE preview_comments (
  id UUID PRIMARY KEY,
  preview_event_id UUID REFERENCES preview_events(id),
  user_id UUID REFERENCES auth.users(id),
  comment TEXT,
  category VARCHAR(50), -- 'date', 'location', 'time', 'pricing', 'general'
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

```
POST /api/preview-events                    # Create preview event
GET  /api/preview-events/:id                # Get preview event details
POST /api/preview-events/:id/interest       # Express interest
POST /api/preview-events/:id/comment        # Add comment/suggestion
PUT  /api/preview-events/:id/convert        # Convert to standard event
GET  /api/preview-events/:id/analytics      # Get interest analytics
DELETE /api/preview-events/:id              # Cancel preview event
```

### Frontend Components

**New Components**:
- `PreviewEventCard` - Special card for preview events
- `PreviewEventBadge` - "Preview / Planning" badge
- `InterestButton` - "I'm Interested" with counter
- `SuggestionBox` - Comment with category tagging
- `PreviewAnalytics` - Dashboard for organizers
- `VoteOptions` - Date/time/location voting

**Modified Components**:
- `EventWizard` - Add "Event Type" step (Standard vs Preview)
- `EventCard` - Show preview indicator
- `EventDetail` - Preview-specific UI

---

## Business Logic

### Conversion Rules

```
IF (interest_count >= min_threshold) AND (deadline_reached OR organizer_decides):
  → Organizer can convert to Standard Event
  → All interested users get priority registration link
  → 48-hour early access before public announcement

IF (interest_count < min_threshold) AND (deadline_reached):
  → Organizer notified "Low interest - consider modifications"
  → Option to extend deadline or cancel

IF organizer_cancels:
  → Interested users notified "Event not scheduled"
  → Option to suggest alternative times/locations
```

### Pricing Integration

- **Free tier**: 1 Preview Event = test before committing
- **Paid tiers**: More Preview Events = iterate and optimize
- **Analytics (Enterprise)**: AI suggests optimal date/time/location based on interest data

### Notification Flow

```
User expresses interest
  ↓
Organizer receives notification
  ↓
Interest threshold reached (optional)
  ↓
Organizer converts to Standard Event
  ↓
Interested users get early access email (48h before public)
  ↓
If spots remain after 48h → open to public
```

---

## Benefits

### For Organizers

| Benefit | Impact |
|---------|--------|
| **Risk Reduction** | Don't book venues before confirming demand |
| **Cost Savings** | Avoid marketing spend on low-interest events |
| **Better Planning** | User feedback shapes final event details |
| **Higher Conversion** | Interested users → confirmed attendees |
| **Community Building** | Users feel involved in event creation |

### For Users (Discoverers)

| Benefit | Impact |
|---------|--------|
| **Influence Events** | Shape events you want to attend |
| **No Commitment** | Express interest without payment |
| **Early Access** | Priority registration when scheduled |
| **Better Events** | Attend events optimized for your preferences |

---

## Future Enhancements

### Phase 2: Advanced Features
- **AI Suggestions**: Recommend optimal date/time/location based on historical data
- **Similar Event Matching**: "Users who liked X were also interested in Y"
- **Funding Integration**: Crowdfunding threshold ("If 50 people interested, we'll book the venue")
- **Co-creation Tools**: Polls, voting, collaborative scheduling

### Phase 3: Premium Analytics
- **Heatmaps**: Geographic distribution of interest
- **Demographics**: Age, interests of interested users
- **Conversion Prediction**: AI predicts likelihood of successful event
- **Optimal Pricing**: Recommend ticket price based on interest level

---

## Competitive Advantage

| Platform | Preview/Planning Feature |
|----------|-------------------------|
| **Eventbrite** | ❌ No preview feature |
| **Meetup** | ❌ Group votes only, not event planning |
| **Facebook** | ❌ Polls in groups, not integrated |
| **EventRadius** | ✅ **Full Preview Event system** |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Preview Event creation rate | 30% of organizers try it |
| Conversion rate (Preview → Standard) | 60%+ |
| User engagement (comments/votes) | 2+ per interested user |
| Organizer satisfaction | 4.5/5 stars |
| Revenue impact | 20% more successful events |

---

**Status**: Future Feature (Post-MVP)
**Priority**: Medium-High
**Estimated Development**: 2-3 sprints
**Owner**: Product Team
