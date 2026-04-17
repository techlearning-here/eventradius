# Share Event Feature Implementation Plan

## Overview

The **Share Event** feature enables users to share events through multiple channels with rich previews, tracking, and analytics. This feature is critical for event discovery and viral growth.

> "Make every share count"

---

## Goals

1. **Easy Sharing**: One-click sharing to major platforms
2. **Rich Previews**: Beautiful Open Graph cards for social media
3. **Trackable Links**: UTM parameters and share analytics
4. **Cross-Platform**: Works on mobile (native share) and desktop
5. **Boost Discovery**: Drive organic event discovery through sharing

---

## Feature Scope

### Core Functionality

| Feature | Priority | Description |
|---------|----------|-------------|
| **Copy Link** | P0 | Copy event URL to clipboard with feedback |
| **Native Share** | P0 | Web Share API for mobile devices |
| **Social Sharing** | P0 | Direct share to Twitter/X, Facebook, LinkedIn |
| **Email Share** | P1 | Share via email with pre-filled template |
| **QR Code** | P1 | Generate QR code for in-person sharing |
| **Embed Code** | P2 | HTML embed for blogs/websites |
| **Share Analytics** | P2 | Track shares, clicks, conversions by channel |

### Share Locations

| Location | Context |
|----------|---------|
| **Event Detail Header** | Quick share from event view |
| **Event Detail Sidebar** | Prominent share CTA |
| **Post-Create Success** | Immediate sharing after creation |
| **Event Card** | Share from discovery grid |
| **Registration Confirmation** | "Share with friends" prompt |
| **Event Dashboard** | Organizer share tools |

---

## User Experience Flow

### Primary Share Flow

```
┌─────────────────────────────────────────────────────────────┐
│  USER CLICKS SHARE BUTTON                                     │
│     ↓                                                       │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  SHARE MODAL / SHEET                                     ││
│  │                                                          ││
│  │  📋 Copy Link          🐦 Twitter/X                      ││
│  │  📱 Native Share       📘 Facebook                       ││
│  │  💼 LinkedIn           ✉️  Email                         ││
│  │                                                          ││
│  │  ─────────────────────────────────────────────────────  ││
│  │  QR Code      Embed Code     More Options               ││
│  │                                                          ││
│  │  [Preview Card showing how it will look when shared]    ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Post-Creation Success Share

```
Event Created Successfully!
┌─────────────────────────────────────────────────────────────┐
│  🎉 Your event is live!                                     │
│                                                              │
│  [SHARE NOW - Primary CTA]                                  │
│                                                              │
│  Share via: [Twitter] [Facebook] [Copy Link] [Email]       │
│                                                              │
│  [Go to Dashboard] [View Event Page]                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### Frontend Components

#### New Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `ShareEventModal` | `components/share/ShareEventModal.tsx` | Main share dialog |
| `ShareButton` | `components/share/ShareButton.tsx` | Reusable share trigger |
| `ShareOptions` | `components/share/ShareOptions.tsx` | Grid of share methods |
| `SharePreview` | `components/share/SharePreview.tsx` | Preview of social card |
| `QRCodeGenerator` | `components/share/QRCodeGenerator.tsx` | QR code generation |
| `EmbedCode` | `components/share/EmbedCode.tsx` | HTML embed code |
| `useShare` | `hooks/useShare.ts` | Share logic hook |
| `ShareAnalytics` | `hooks/useShareAnalytics.ts` | Share tracking hook |

#### Modified Components

| Component | Changes |
|-----------|---------|
| `EventDetailHeader.tsx` | Wire up share button to open ShareEventModal |
| `QuickActions.tsx` | Implement onShare handler |
| `EventDetailPage.tsx` | Add ShareEventModal integration |
| `EventSuccessModal.tsx` | Add prominent share CTA post-creation |

### Backend API

#### New Endpoints

```
POST /api/events/{id}/share
  Body: {
    channel: "copy|native|twitter|facebook|linkedin|email|qr|embed",
    utm_source?: string,
    utm_medium?: string,
    utm_campaign?: string
  }
  Response: {
    share_url: string,           // URL with UTM params
    short_url?: string,          // Shortened URL (optional)
    qr_code_url?: string,        // QR code image URL
    embed_code?: string          // HTML embed code
  }

GET /api/events/{id}/share-stats
  Response: {
    total_shares: number,
    by_channel: {
      copy: number,
      twitter: number,
      facebook: number,
      linkedin: number,
      email: number,
      native: number
    },
    clicks: number,
    conversions: number
  }

POST /api/share/track-click
  Body: {
    share_id: string,
    referrer?: string
  }
```

#### Database Schema Changes

```sql
-- Share tracking table
CREATE TABLE event_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),  -- null for anonymous
    channel VARCHAR(50) NOT NULL,
    share_url TEXT NOT NULL,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Share click tracking
CREATE TABLE share_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_id UUID NOT NULL REFERENCES event_shares(id),
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    referrer TEXT,
    ip_address INET,
    user_agent TEXT,
    converted BOOLEAN DEFAULT FALSE  -- registered for event
);

-- Indexes for analytics queries
CREATE INDEX idx_event_shares_event_id ON event_shares(event_id);
CREATE INDEX idx_event_shares_channel ON event_shares(channel);
CREATE INDEX idx_event_shares_created_at ON event_shares(created_at);
CREATE INDEX idx_share_clicks_share_id ON share_clicks(share_id);
```

### Open Graph Meta Tags

Dynamic meta tags for social sharing:

```html
<!-- Primary Meta Tags -->
<title>{event.title} | EventRadius</title>
<meta name="title" content="{event.title} | EventRadius">
<meta name="description" content="{event.summary || event.description}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="event">
<meta property="og:url" content="https://eventradius.com/events/{event.id}">
<meta property="og:title" content="{event.title}">
<meta property="og:description" content="{event.summary || event.description}">
<meta property="og:image" content="{event.image_url || default_image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="EventRadius">
<meta property="event:start_time" content="{event.start_time}">
<meta property="event:end_time" content="{event.end_time}">
<meta property="event:location" content="{event.location}">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://eventradius.com/events/{event.id}">
<meta property="twitter:title" content="{event.title}">
<meta property="twitter:description" content="{event.summary || event.description}">
<meta property="twitter:image" content="{event.image_url || default_image}">
```

### Share URL Format

```
Base URL: https://eventradius.com/events/{event_id}

With UTM Parameters:
https://eventradius.com/events/{event_id}
  ?utm_source=eventradius
  &utm_medium={channel}
  &utm_campaign=share
  &utm_content={event_id}
  &share_id={unique_share_id}  // for tracking

Short URL (optional):
https://evrd.io/s/{short_code}
```

---

## Implementation Phases

### Phase 1: Core Sharing (P0) - Week 1

**Frontend:**
- [ ] Create `ShareEventModal` component with basic UI
- [ ] Implement "Copy Link" functionality with clipboard API
- [ ] Implement Web Share API for mobile native sharing
- [ ] Add share button to `EventDetailHeader` and `QuickActions`
- [ ] Add social share links (Twitter/X, Facebook, LinkedIn)

**Backend:**
- [ ] Create `event_shares` table
- [ ] Implement `POST /api/events/{id}/share` endpoint
- [ ] Add Open Graph meta tags to event pages

**Testing:**
- [ ] Unit tests for share components
- [ ] Integration tests for API endpoints

### Phase 2: Enhanced Sharing (P1) - Week 2

**Frontend:**
- [ ] Add QR code generation component
- [ ] Add email share with `mailto:` link
- [ ] Create share preview showing social card mockup
- [ ] Add share CTA to post-creation success modal
- [ ] Add share button to event cards in discovery

**Backend:**
- [ ] Implement QR code generation endpoint
- [ ] Add UTM parameter generation
- [ ] Create share tracking middleware

**Analytics:**
- [ ] Track share events in Mixpanel/Amplitude
- [ ] Basic share count on event cards

### Phase 3: Advanced Features (P2) - Week 3-4

**Frontend:**
- [ ] Embed code generator for widgets
- [ ] Share analytics dashboard for organizers
- [ ] "Share with friends" after registration

**Backend:**
- [ ] Create `share_clicks` table
- [ ] Implement click tracking endpoint
- [ ] Share statistics aggregation
- [ ] Conversion tracking (share → registration)

**Optimization:**
- [ ] URL shortening service (optional)
- [ ] A/B test share button placements
- [ ] Optimize share preview images

---

## Component Specifications

### ShareEventModal

```typescript
interface ShareEventModalProps {
  event: {
    id: string;
    title: string;
    description?: string;
    image_url?: string;
    start_time?: string;
    location?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  context?: 'event_detail' | 'post_create' | 'event_card' | 'dashboard';
}

// Features:
// - Display event preview card
// - Copy link button with "Copied!" feedback
// - Social share buttons (Twitter, Facebook, LinkedIn)
// - Native share button (mobile)
// - QR code toggle
// - Embed code toggle
```

### useShare Hook

```typescript
interface UseShareOptions {
  eventId: string;
  eventTitle: string;
  eventDescription?: string;
  eventImage?: string;
}

interface UseShareReturn {
  copyLink: () => Promise<boolean>;
  shareNative: () => Promise<boolean>;
  shareToTwitter: () => void;
  shareToFacebook: () => void;
  shareToLinkedIn: () => void;
  shareViaEmail: () => void;
  generateQRCode: () => string;
  getEmbedCode: () => string;
  trackShare: (channel: string) => void;
  isCopied: boolean;
  isNativeSupported: boolean;
}

function useShare(options: UseShareOptions): UseShareReturn;
```

---

## UI/UX Design

### Share Modal Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Share "Beach Yoga at Sunset"              [X]              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  📱 PREVIEW (how it will look when shared)         │    │
│  │                                                     │    │
│  │  ┌─────────────────────────────────────────────┐   │    │
│  │  │  [Cover Image]                              │   │    │
│  │  │                                             │   │    │
│  │  │  Beach Yoga at Sunset                       │   │    │
│  │  │  Join us for a relaxing yoga session...     │   │    │
│  │  │  eventradius.com                            │   │    │
│  │  └─────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  QUICK SHARE                                                 │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐               │
│  │  📋   │ │  🐦   │ │  📘   │ │  💼   │               │
│  │  Copy │ │Twitter │ │Facebook│ │LinkedIn│               │
│  └────────┘ └────────┘ └────────┘ └────────┘               │
│                                                              │
│  MORE OPTIONS                                                │
│  ┌────────┐ ┌────────┐ ┌────────┐                           │
│  │  📱   │ │  📧   │ │  ⚡   │                           │
│  │ Native │ │ Email │ │  QR   │                           │
│  └────────┘ └────────┘ └────────┘                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Copy Link Feedback

```
Button States:
- Default:   "📋 Copy Link"
- Hover:     "📋 Copy Link" (bg changes)
- Clicked:   "✅ Copied!" (green, 2 seconds)
- Reset:     "📋 Copy Link"
```

---

## Security Considerations

1. **Rate Limiting**: Limit share API calls to prevent abuse
2. **URL Validation**: Validate event IDs in share URLs
3. **UTM Sanitization**: Clean UTM parameters to prevent XSS
4. **Privacy**: Don't expose private event details in share previews
5. **Click Fraud**: Basic IP-based duplicate click detection

---

## Success Metrics

| Metric | Baseline | Target |
|--------|----------|--------|
| Share events per day | 0 | 100+ |
| Copy link usage | - | 40% of shares |
| Social share usage | - | 30% of shares |
| Native share usage | - | 20% of shares |
| Share → Registration conversion | - | 5% |
| Organic traffic from shares | - | 20% of total |

---

## Dependencies

```json
{
  "dependencies": {
    "qrcode.react": "^3.1.0",      // QR code generation
    "copy-to-clipboard": "^3.3.3"   // Clipboard fallback
  }
}
```

---

## Testing Strategy

### Unit Tests
- [ ] `useShare` hook functionality
- [ ] `ShareEventModal` rendering
- [ ] Clipboard operations
- [ ] UTM parameter generation

### Integration Tests
- [ ] Share API endpoint
- [ ] Share click tracking
- [ ] Social share URL generation

### E2E Tests
- [ ] Full share flow on desktop
- [ ] Native share on mobile
- [ ] Copy link and verify URL

---

## Open Questions

1. Should we implement URL shortening (evrd.io/s/xxx)?
2. Do we want to add "Share to specific users" (in-app)?
3. Should organizers customize share message templates?
4. Do we need "Add to Calendar" as a share option?
5. Should we implement referral rewards for sharing?

---

**Status**: Planning Complete
**Priority**: High
**Estimated Timeline**: 2-3 weeks
**Dependencies**: None (independent feature)
**Owner**: Frontend + Backend Team
