# Dynamic Pricing MVP - Feature List

## Phase 1: Database & Schema

| ID | Feature | Priority | Effort | Status |
|----|---------|----------|--------|--------|
| DB-01 | Create `dynamic_pricing_rules` table (capacity, base/min price, status) | High | S | Pending |
| DB-02 | Create `inventory_snapshots` table (tickets sold, occupancy %, timestamp) | High | S | Pending |
| DB-03 | Create `discount_recommendations` table (triggers, suggested discount, status) | High | S | Pending |
| DB-04 | Create `promo_codes` table (code, discount %, usage limits, validity) | High | S | Pending |
| DB-05 | Create `promo_code_claims` table (user attribution, IP tracking) | High | S | Pending |
| DB-06 | Add indexes on event_id, status, valid_until for query performance | Medium | XS | Pending |
| DB-07 | Configure RLS policies for organizer/user data isolation | High | S | Pending |
| DB-08 | Add `updated_at` triggers on pricing tables | Low | XS | Pending |

## Phase 2: Backend API

### Pricing Rules API
| ID | Feature | Priority | Effort | Status |
|----|---------|----------|--------|--------|
| API-01 | POST /api/pricing/rules - Create pricing rule for event | High | S | Pending |
| API-02 | GET /api/pricing/rules/{event_id} - Retrieve pricing configuration | High | XS | Pending |
| API-03 | PUT /api/pricing/rules/{event_id} - Update pricing rule | Medium | S | Pending |
| API-04 | DELETE /api/pricing/rules/{event_id} - Disable dynamic pricing | Low | XS | Pending |

### Inventory API
| ID | Feature | Priority | Effort | Status |
|----|---------|----------|--------|--------|
| API-05 | POST /api/pricing/inventory - Report current ticket sales | High | S | Pending |
| API-06 | GET /api/pricing/inventory/{event_id}/history - Get inventory timeline | Medium | S | Pending |
| API-07 | Auto-trigger recommendation calculation on inventory update | High | S | Pending |

### Recommendations API
| ID | Feature | Priority | Effort | Status |
|----|---------|----------|--------|--------|
| API-08 | GET /api/pricing/recommendations - List recommendations for organizer | High | S | Pending |
| API-09 | POST /api/pricing/recommendations/{id}/approve - Approve & generate promo code | High | M | Pending |
| API-10 | POST /api/pricing/recommendations/{id}/reject - Reject recommendation | Medium | XS | Pending |
| API-11 | GET /api/pricing/recommendations/{id} - Get recommendation details | Low | XS | Pending |

### Promo Codes API (Organizer)
| ID | Feature | Priority | Effort | Status |
|----|---------|----------|--------|--------|
| API-12 | GET /api/promo-codes - List organizer's promo codes | High | S | Pending |
| API-13 | POST /api/promo-codes/{id}/deactivate - Deactivate a code | Medium | XS | Pending |
| API-14 | GET /api/promo-codes/{id}/claims - Get claim history | Medium | S | Pending |

### Public Deals API (User)
| ID | Feature | Priority | Effort | Status |
|----|---------|----------|--------|--------|
| API-15 | GET /api/deals - List active deals near user (lat/lng/radius) | High | M | Pending |
| API-16 | POST /api/deals/{event_id}/claim - User claims promo code | High | M | Pending |
| API-17 | Return code, discount %, validity, external ticketing URL | High | S | Pending |

### Calculation Engine
| ID | Feature | Priority | Effort | Status |
|----|---------|----------|--------|--------|
| ENG-01 | Implement MVP decision matrix (occupancy + time → discount %) | High | M | Pending |
| ENG-02 | Generate promo codes (e.g., "YOGA30-ER" from event name) | High | S | Pending |
| ENG-03 | Calculate estimated commission (simulated) | Low | XS | Pending |
| ENG-04 | Validate min price guardrails | High | XS | Pending |

## Phase 3: Organizer Dashboard UI

### Pricing Setup
| ID | Feature | Priority | Effort | Status |
|----|---------|----------|--------|--------|
| UI-01 | Pricing tab in OrganizerDashboard sidebar | High | S | Pending |
| UI-02 | Toggle: "Enable dynamic pricing" for event | High | XS | Pending |
| UI-03 | Form: Max capacity, Base price, Min price guardrail | High | S | Pending |
| UI-04 | Save pricing rule with validation | High | S | Pending |

### Inventory Management
| ID | Feature | Priority | Effort | Status |
|----|---------|----------|--------|--------|
| UI-05 | Number input for current tickets sold | High | XS | Pending |
| UI-06 | Display occupancy % and seats remaining | High | XS | Pending |
| UI-07 | "Update Inventory" button with auto-calculation trigger | High | S | Pending |
| UI-08 | Inventory history view (optional) | Low | M | Pending |

### Recommendation Workflow
| ID | Feature | Priority | Effort | Status |
|----|---------|----------|--------|--------|
| UI-09 | Alert-style recommendation card when available | High | M | Pending |
| UI-10 | Show occupancy %, hours remaining, suggested discount | High | S | Pending |
| UI-11 | Display reason: "Low attendance - fill remaining seats" | Medium | XS | Pending |
| UI-12 | Actions: Approve & Generate, Reject, Modify | High | M | Pending |
| UI-13 | Sidebar badge: Number of pending recommendations | Medium | S | Pending |

### Promo Code Display
| ID | Feature | Priority | Effort | Status |
|----|---------|----------|--------|--------|
| UI-14 | Display generated code prominently (e.g., "YOGA30-ER") | High | S | Pending |
| UI-15 | Copy to clipboard button | High | XS | Pending |
| UI-16 | Regenerate code option | Low | XS | Pending |
| UI-17 | Show discount %, max uses, validity period | High | XS | Pending |
| UI-18 | Claims count and estimated used count | Medium | S | Pending |

### Analytics
| ID | Feature | Priority | Effort | Status |
|----|---------|----------|--------|--------|
| UI-19 | Active deals count | Medium | XS | Pending |
| UI-20 | Total claims this month | Medium | XS | Pending |
| UI-21 | Estimated commission earned | Low | XS | Pending |

### Notifications
| ID | Feature | Priority | Effort | Status |
|----|---------|----------|--------|--------|
| UI-22 | Toast notification when recommendation created | Medium | S | Pending |
| UI-23 | Email notification for new recommendations | Medium | M | Pending |
| UI-24 | Reminder notification: "Update your ticket count" | Medium | M | Pending |

## Phase 4: User Deal Discovery

### Event Discovery
| ID | Feature | Priority | Effort | Status |
|----|---------|----------|--------|--------|
| UI-25 | "X% OFF" badge on event cards with active deals | High | S | Pending |
| UI-26 | Pulse animation on discount badge | Low | XS | Pending |
| UI-27 | Deal detail view with original vs discounted price | High | M | Pending |
| UI-28 | "Get Deal" button to claim code | High | S | Pending |

### Code Claim Flow
| ID | Feature | Priority | Effort | Status |
|----|---------|----------|--------|--------|
| UI-29 | Reveal code with copy button after claim | High | S | Pending |
| UI-30 | Visual code display (monospace, prominent) | High | XS | Pending |
| UI-31 | Link to external ticketing site | High | XS | Pending |
| UI-32 | Show seats remaining and time until expiry | Medium | XS | Pending |
| UI-33 | Anonymous claim support (IP/session tracking) | Medium | S | Pending |

### Deals Feed (Optional MVP Stretch)
| ID | Feature | Priority | Effort | Status |
|----|---------|----------|--------|--------|
| UI-34 | New page: /deals | Low | M | Pending |
| UI-35 | Filters: Last-minute, This weekend, Near me | Low | M | Pending |
| UI-36 | Sort: Biggest discount, Expiring soon | Low | S | Pending |
| UI-37 | Radius-based deal discovery | Low | S | Pending |

## Phase 5: Automation & Cron Jobs

| ID | Feature | Priority | Effort | Status |
|----|---------|----------|--------|--------|
| CRON-01 | Check upcoming events every 2 hours (4-48h window) | High | M | Pending |
| CRON-02 | Send "Update your ticket count" notifications | High | M | Pending |
| CRON-03 | Generate recommendations every 30 minutes | High | M | Pending |
| CRON-04 | Auto-create pending recommendation records | High | S | Pending |
| CRON-05 | Expire old codes every hour (past valid_until) | Medium | S | Pending |
| CRON-06 | Close pending recommendations after 2 hours | Medium | XS | Pending |

## Integration Features

| ID | Feature | Priority | Effort | Status |
|----|---------|----------|--------|--------|
| INT-01 | Extend EventAttributes model with pricing fields | High | S | Pending |
| INT-02 | Link pricing tables to events via event_id | High | XS | Pending |
| INT-03 | Use existing notification system for new types | Medium | S | Pending |
| INT-04 | Register new API routers in backend/main.py | High | XS | Pending |
| INT-05 | Add pricing types to frontend API types | Medium | XS | Pending |
| INT-06 | Backend event API - add pricing fields to Event model | Medium | S | Pending |

## Success Metrics Tracking

| ID | Feature | Priority | Effort | Status |
|----|---------|----------|--------|--------|
| MET-01 | Track adoption rate (% organizers enabling pricing) | Low | S | Pending |
| MET-02 | Track activation rate (% recommendations approved) | Low | S | Pending |
| MET-03 | Track claim rate (% deal views → code claims) | Low | S | Pending |
| MET-04 | Calculate total estimated commission | Low | XS | Pending |

---

## Legend

**Priority:**
- High = Must have for MVP
- Medium = Should have
- Low = Nice to have / Stretch

**Effort:**
- XS = < 2 hours
- S = 1/2 day
- M = 1-2 days
- L = 3-5 days

**Status:**
- Pending = Not started
- In Progress = Being worked on
- Done = Complete
- Blocked = Has dependencies
