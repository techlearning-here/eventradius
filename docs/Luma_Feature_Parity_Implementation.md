# Luma Feature Parity Implementation Plan

**Objective**: Match core Luma features to compete effectively while maintaining EventRadius differentiators  
**Exclusions**: Enterprise features (multi-user teams, dedicated support), Web3/crypto (token-gating, SOL/USDC)  
**Document Date**: April 2026  
**Status**: Implementation Roadmap

---

## Priority Framework

| Priority | Timeline | Definition |
|----------|----------|------------|
| **P0 - Critical** | Weeks 1-4 | Must-have for competitive parity. Blocks launch/marketing. |
| **P1 - High** | Weeks 5-8 | Important for user retention and growth. Significant impact. |
| **P2 - Medium** | Weeks 9-16 | Nice-to-have. Improves experience but not critical. |
| **P3 - Low** | Weeks 17-24 | Power user features. Can be deferred post-launch. |

---

## Phase 1: P0 - Critical (Weeks 1-4)

### 1. Community Calendars (Subscribable) ⭐ HIGHEST PRIORITY
**Why P0**: Luma's core discovery mechanism. Users subscribe once, get notified of all new events in that calendar automatically. This validates our proactive notification vision.

**Implementation**:
```
Database:
- community_calendars table (id, name, description, category, location, image_url, organizer_id)
- calendar_subscriptions table (id, user_id, calendar_id, subscribed_at, notification_prefs)
- event_calendar_links table (id, event_id, calendar_id)

Features:
- Create community calendar flow (organizers can create themed calendars)
- Subscribe/unsubscribe with one click
- Auto-notify subscribers when new event added to calendar
- Calendar discovery page (browse by category/location)
- Featured calendars section (curated by team)
- Calendar widget on event pages ("Part of: SF AI Events")
```

**Effort**: 2 weeks  
**Dependencies**: Real-time matching engine (can use email initially)  
**Success Metric**: 100+ calendars created, 1000+ subscriptions in first month

---

### 2. Simplified Event Creation (Quick Mode) ⭐ HIGH PRIORITY
**Why P0**: Luma creates events in under 2 minutes. Our 11-step wizard has too much friction for casual organizers.

**Implementation**:
```
Quick Create Flow (3 steps):
1. Basics: Title, Date/Time, Location, Cover Image
2. Category: Single category select + brief description
3. Publish: Public/Private, Capacity, Done

Advanced Toggle:
- "Add More Details" button expands to full wizard
- Capture cultural, accessibility, demographics optionally
- Can edit later to add attributes

Smart Defaults:
- Auto-detect location from user profile
- Suggest cover images by category
- Default capacity based on venue type
- Auto-save drafts
```

**Effort**: 1 week  
**Dependencies**: None  
**Success Metric**: 70%+ of events created via Quick Mode

---

### 3. QR Code Check-ins ⭐ HIGH PRIORITY
**Why P0**: Standard expectation for events. Luma has this built-in. Essential for professional organizers.

**Implementation**:
```
Organizer Side:
- Generate unique QR code per event
- Check-in dashboard (scan or manual lookup)
- Real-time attendance tracking
- Export attendee list

Attendee Side:
- QR code in confirmation email
- QR code in "My Tickets" page
- Save to Apple/Google Wallet
- Shareable (transfer to friend)

QR Content: Encrypted event_id + user_id + timestamp
Security: 5-minute validity window, single-use
```

**Effort**: 1 week  
**Dependencies**: Ticket/RSVP system  
**Success Metric**: 50%+ of in-person events use QR check-in

---

## Phase 2: P1 - High Priority (Weeks 5-8)

### 4. Guest Referrals (Viral Growth Loop)
**Why P1**: Luma's growth engine. Every attendee can invite friends, creating viral loops.

**Implementation**:
```
Referral Flow:
- "Invite Friends" button on confirmation page
- Unique referral link per attendee (trackable)
- Social sharing (WhatsApp, SMS, Email, Twitter)
- Referral leaderboard (optional gamification)

Tracking:
- referral_codes table (id, user_id, event_id, code, clicks, conversions)
- Referral attribution (who brought whom)

Incentives (Phase 2):
- "3 friends join = discount on next event"
- Organizer can set referral rewards
```

**Effort**: 1 week  
**Dependencies**: None  
**Success Metric**: 20%+ of attendees invite at least 1 friend

---

### 5. Waitlist Management
**Why P1**: Essential for popular events. Luma has this. Prevents lost opportunities when events sell out.

**Implementation**:
```
Features:
- Auto-enable waitlist when capacity reached
- Waitlist position visibility ("You're #3 in line")
- Auto-promote when spot opens (email + push)
- 24-hour hold window before offering to next person
- Waitlist analytics (demand forecasting)

Notifications:
- "A spot opened up! Claim within 24 hours"
- Reminder at 12 hours, 2 hours
- Auto-decline if no response, offer to next

Organizer Controls:
- Manual waitlist reordering
- Message all waitlisted users
- Expand capacity option
```

**Effort**: 1 week  
**Dependencies**: RSVP system  
**Success Metric**: Used on 30%+ of sold-out events

---

### 6. Past Guest Re-invite (Retention Tool)
**Why P1**: Luma lets organizers easily re-invite previous attendees. Critical for recurring events.

**Implementation**:
```
Attendee History:
- Track all events attended per user
- "My Past Events" page for users
- Organizer sees past attendees list

Re-invite Flow:
- "Invite Past Guests" button when creating event
- Filter by: attended [X] event, within [time range], engaged
- One-click import to guest list
- Personalized message template ("You enjoyed [X], you might like [Y]")

Smart Suggestions:
- Auto-suggest past guests based on event similarity
- "80% of attendees from [Past Event] might be interested"
```

**Effort**: 3 days  
**Dependencies**: Event attendance tracking  
**Success Metric**: 40%+ of recurring events use past guest re-invite

---

### 7. Post-Event Surveys
**Why P1**: Builds community, gets feedback. Luma has built-in surveys.

**Implementation**:
```
Survey Types:
- Star rating + text feedback (simple)
- Custom questions (organizer-defined)
- NPS score ("How likely to recommend?")
- Photo/review upload

Timing:
- Auto-send 2 hours after event ends
- SMS for high-engagement users
- In-app notification for others
- Reminder after 24 hours if not completed

Display:
- Public reviews on event pages (optional)
- Aggregated ratings shown to future attendees
- Organizer dashboard with analytics

Incentives:
- "Complete survey for 10% off next event"
- Entered into monthly prize drawing
```

**Effort**: 1 week  
**Dependencies**: Email/SMS delivery  
**Success Metric**: 30%+ survey completion rate

---

## Phase 3: P2 - Medium Priority (Weeks 9-16)

### 8. Guest Chat / Event Messaging
**Why P2**: Community building. Luma has pre/post event chat. Increases engagement.

**Implementation**:
```
Chat Types:
- Pre-event: Organizers can message all attendees
- Post-event: Attendees can message each other (opt-in)
- Announcements: One-way from organizer to all

Features:
- Threaded discussions
- Direct messaging between attendees (opt-in privacy)
- File sharing (photos, documents)
- @mentions for organizer

Privacy Controls:
- Users opt-in to post-event networking
- Can disable messages from strangers
- Block/report functionality

Moderation:
- Organizer can delete inappropriate messages
- Auto-filter for spam
```

**Effort**: 2 weeks  
**Dependencies**: Real-time infrastructure (WebSockets/Supabase Realtime)  
**Success Metric**: 25%+ of events have chat activity

---

### 9. SMS Invites & Notifications
**Why P2**: Luma supports mass SMS. Higher open rates than email for last-minute events.

**Implementation**:
```
Features:
- Import contacts from phone (mobile app)
- Bulk SMS invites (organizers)
- RSVP via SMS (reply "YES" to confirm)
- Reminder SMS (24hr, 2hr before event)

Compliance:
- Opt-in required (TCPA compliance)
- Easy unsubscribe (reply STOP)
- Rate limiting (max 1 SMS per hour per user)

Costs:
- Free tier: 10 SMS/month per organizer
- Paid tier: Unlimited SMS
- Use Twilio or similar provider
```

**Effort**: 1 week  
**Dependencies**: SMS provider integration  
**Success Metric**: 15%+ of invites sent via SMS

---

### 10. Guest List Display Options
**Why P2**: Social proof + networking. Luma lets organizers show who's attending.

**Implementation**:
```
Display Modes:
- Private: Only organizer sees guest list
- Public: Anyone can see attendees
- Attendees Only: Only confirmed guests see list
- Networking: Show profiles, allow connections

Privacy Levels:
- Show names only
- Show names + profile pics
- Show full profiles (with attendee permission)
- Anonymous mode (count only, "23 attending")

Networking Features:
- "Connect with [Name]" button
- LinkedIn-style networking (opt-in)
- Icebreaker suggestions ("You both like hiking")
```

**Effort**: 3 days  
**Dependencies**: None  
**Success Metric**: 40%+ of events use public or attendees-only mode

---

### 11. Cover Image Gallery
**Why P2**: Luma has pre-designed cover images. Speeds up event creation, looks professional.

**Implementation**:
```
Gallery:
- 50+ pre-designed cover images by category
- Category-matched suggestions (AI selects based on title)
- Upload custom image option
- Canva-style simple editor (text overlay, filters)
- Stock photo integration (Unsplash/Pexels)

Categories:
- Tech/AI, Food/Drink, Wellness, Arts, Sports, Business, Social
- Seasonal templates (holiday themes)
- Color schemes matching brand colors

Smart Features:
- Auto-suggest image based on event title/description
- Auto-crop to optimal dimensions
- Image optimization (WebP, lazy loading)
```

**Effort**: 1 week  
**Dependencies**: Image storage/CDN  
**Success Metric**: 60%+ of events use gallery images

---

## Phase 4: P3 - Low Priority (Weeks 17-24)

### 12. Zapier Integration
**Why P3**: Power user feature. Luma has this on Plus tier. Automation workflows.

**Implementation**:
```
Triggers:
- New event published
- New RSVP received
- Event cancelled
- Attendee checked in

Actions:
- Create event (from Google Sheet, Trello, etc.)
- Add attendee to Mailchimp list
- Post to Slack/Discord
- Add to Google Calendar
- Update CRM (HubSpot, Salesforce)

Setup:
- Zapier app in their directory
- API keys for authentication
- Webhook endpoints for triggers
```

**Effort**: 2 weeks  
**Dependencies**: API infrastructure, webhooks  
**Success Metric**: 100+ active Zaps in first quarter

---

### 13. Apple/Google Wallet Integration
**Why P3**: Nice-to-have convenience. Luma has QR codes but not wallet passes.

**Implementation**:
```
Features:
- Add ticket to Apple Wallet (iOS)
- Add pass to Google Wallet (Android)
- Pass updates automatically if event details change
- Location-based reminder (when near venue)
- Lock screen notification at event time

Pass Design:
- Event name, date, time, location
- QR code for check-in
- Organizer logo
- Color scheme matching event
```

**Effort**: 1 week  
**Dependencies**: QR code check-ins already built  
**Success Metric**: 20%+ of mobile users add to wallet

---

## Implementation Timeline Summary

| Week | Deliverables |
|------|-------------|
| **1-2** | Community Calendars (MVP) |
| **3** | Quick Event Creation Mode |
| **4** | QR Code Check-ins |
| **5** | Guest Referrals |
| **6** | Waitlist Management |
| **7** | Past Guest Re-invite |
| **8** | Post-Event Surveys |
| **9-10** | Guest Chat (MVP) |
| **11** | SMS Invites |
| **12** | Guest List Display Options |
| **13-14** | Cover Image Gallery |
| **15-16** | Polish, bug fixes, mobile optimization |
| **17-18** | Zapier Integration |
| **19-20** | Apple/Google Wallet |
| **21-24** | Testing, documentation, API improvements |

---

## Success Metrics (90 Days Post-Launch)

| Metric | Target |
|--------|--------|
| Community Calendars Created | 200+ |
| Calendar Subscriptions | 2,000+ |
| Quick Mode Event Creation | 70%+ of new events |
| QR Check-in Usage | 50%+ of in-person events |
| Guest Referral Rate | 20%+ of attendees invite friends |
| Waitlist Usage | 30%+ of sold-out events |
| Post-Event Survey Completion | 30%+ |
| Chat Engagement | 25%+ of events with messages |
| Net User Growth Rate | Match Luma's trajectory (15% MoM) |

---

## Resource Requirements

| Resource | Duration | Notes |
|----------|----------|-------|
| **Frontend Engineer** | Full 24 weeks | React/TypeScript features |
| **Backend Engineer** | Full 24 weeks | API, database, integrations |
| **Mobile Developer** | Weeks 12-24 | Wallet integration, mobile polish |
| **Designer** | Weeks 1-4, 13-14 | Cover images, QR designs, chat UI |
| **DevOps** | Weeks 17-20 | Zapier webhooks, scaling |
| **SMS Provider** | Ongoing | Twilio/similar (~$500/mo initially) |
| **CDN/Image Storage** | Ongoing | Cover image hosting |

---

## Risk Mitigation

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| SMS compliance issues | Medium | Use Twilio, implement STOP handling, legal review |
| Chat moderation abuse | Medium | Report functionality, auto-moderation, admin tools |
| Real-time chat scaling | Low | Use Supabase Realtime, implement rate limiting |
| QR code fraud | Low | Time-limited tokens, single-use validation |
| Feature bloat | Medium | Strict priority adherence, user testing each phase |

---

## Conclusion

This plan prioritizes features that:
1. **Close competitive gaps** (community calendars, QR check-ins)
2. **Enable viral growth** (guest referrals, past guest re-invite)
3. **Improve UX** (quick create, cover images)
4. **Build community** (chat, surveys, guest lists)

**Excluded features** (Enterprise/Web3) are not needed for our target market of local organizers and community builders.

**Next Step**: Begin Phase 1 (Community Calendars) immediately after real-time matching engine is complete.

---

*Document Version: 1.0*  
*Owner: Product & Engineering*  
*Review Date: May 2026*
