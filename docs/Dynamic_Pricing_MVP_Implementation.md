# Dynamic Pricing MVP Implementation Plan

## Overview

Implement a rule-based dynamic pricing engine using the **Promo Code Model** that generates multi-use discount codes when organizers approve AI recommendations. This MVP focuses on manual inventory updates, organizer approval workflow, and commission simulation (real payments deferred to post-MVP).

## Core Principles

1. **Promo Code Model**: EventRadius generates discount codes that organizers add to their external ticketing systems
2. **Organizer Control**: All discount recommendations require organizer approval before activation
3. **Manual Inventory**: Organizers manually input current ticket sales (API integrations deferred)
4. **Attribution Tracking**: Track code claims and estimated redemptions for organizer analytics
5. **Simulated Commission**: Track commission calculations without real payment processing in MVP

## End-to-End User Flow

### Organizer Flow
```
1. Enable dynamic pricing on event → Set capacity, base price, min price guardrail
2. Receive notification: "Update ticket count" (every 2 hours before event)
3. Input current sales: 5/20 sold = 25% occupancy
4. AI calculates: 25% occupancy + 4 hours remaining = 30% discount recommended
5. Review recommendation card → Approve → Code "YOGA30-ER" generated
6. Add code to external ticketing (Eventbrite, Square, etc.)
7. View analytics: claims, estimated redemptions, commission owed
```

### User Flow
```
1. Browse events → See "30% OFF" badge on deal events
2. Click event → Deal card shows: Regular $25 → Your price $17.50
3. Click "Get Deal" → Reveal code "YOGA30-ER" with copy button
4. Redirect to external ticketing site
5. Apply code at checkout, pay organizer directly
```

## Phase 1: Database Schema (Week 1)

### New Tables

#### 1. `dynamic_pricing_rules` - Per-event pricing configuration
```sql
CREATE TABLE dynamic_pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Capacity & Pricing
  max_capacity INTEGER NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  min_price DECIMAL(10,2) NOT NULL, -- guardrail
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(event_id)
);
```

#### 2. `inventory_snapshots` - Occupancy tracking history
```sql
CREATE TABLE inventory_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  tickets_sold INTEGER NOT NULL,
  tickets_remaining INTEGER NOT NULL,
  occupancy_percent DECIMAL(5,2) NOT NULL,
  reported_by UUID REFERENCES auth.users(id),
  reported_at TIMESTAMP DEFAULT now()
);
```

#### 3. `discount_recommendations` - AI suggestions
```sql
CREATE TABLE discount_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  
  -- Trigger conditions
  occupancy_percent DECIMAL(5,2) NOT NULL,
  hours_remaining DECIMAL(6,1) NOT NULL,
  
  -- Recommendation
  recommended_discount_percent INTEGER NOT NULL,
  recommended_price DECIMAL(10,2) NOT NULL,
  
  -- Decision
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, expired
  decided_at TIMESTAMP,
  decided_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMP DEFAULT now()
);
```

#### 4. `promo_codes` - Generated discount codes
```sql
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  recommendation_id UUID REFERENCES discount_recommendations(id),
  
  -- Code details
  code TEXT NOT NULL UNIQUE, -- e.g., "YOGA30-ER"
  discount_percent INTEGER NOT NULL,
  discount_amount DECIMAL(10,2),
  
  -- Usage limits
  max_uses INTEGER NOT NULL,
  times_claimed INTEGER DEFAULT 0,
  times_used INTEGER DEFAULT 0, -- reported redemptions
  
  -- Validity
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  
  -- Commission tracking (simulated in MVP)
  commission_percent DECIMAL(4,2) DEFAULT 5.00,
  estimated_commission DECIMAL(10,2) GENERATED ALWAYS AS 
    (discount_amount * max_uses * commission_percent / 100) STORED
);
```

#### 5. `promo_code_claims` - User attribution tracking
```sql
CREATE TABLE promo_code_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  
  claimed_at TIMESTAMP DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  
  marked_as_used BOOLEAN DEFAULT false,
  marked_used_at TIMESTAMP,
  
  UNIQUE(promo_code_id, user_id)
);
```

### Migration File
**File:** `supabase/migrations/consolidated/04_dynamic_pricing.sql`

Include all CREATE TABLE statements above plus:
- Indexes for performance
- RLS policies for security
- Triggers for updated_at

## Phase 2: Backend API (Week 2)

### Pricing Rules API (`backend/api/pricing_rules.py`)

```python
# POST /api/pricing/rules
# Create pricing rule for event
class CreatePricingRuleRequest(BaseModel):
    event_id: UUID
    max_capacity: int
    base_price: Decimal
    min_price: Decimal

# GET /api/pricing/rules/{event_id}
# Get pricing rule

# PUT /api/pricing/rules/{event_id}
# Update pricing rule

# DELETE /api/pricing/rules/{event_id}
# Disable dynamic pricing
```

### Inventory API (`backend/api/pricing_inventory.py`)

```python
# POST /api/pricing/inventory
# Report current ticket sales
class UpdateInventoryRequest(BaseModel):
    event_id: UUID
    tickets_sold: int

# GET /api/pricing/inventory/{event_id}/history
# Get inventory history

# Automatically triggers recommendation calculation on update
```

### Recommendations API (`backend/api/pricing_recommendations.py`)

```python
# GET /api/pricing/recommendations
# Get pending recommendations for organizer
# Query: status (pending, approved, rejected)

# POST /api/pricing/recommendations/{id}/approve
# Approve and generate promo code
class ApproveRecommendationRequest(BaseModel):
    max_uses: int  # How many times code can be used

# POST /api/pricing/recommendations/{id}/reject
# Reject recommendation

# GET /api/pricing/recommendations/{id}
# Get recommendation details
```

### Promo Codes API (`backend/api/promo_codes.py`)

```python
# GET /api/promo-codes
# List promo codes for organizer
# Query: event_id, is_active

# POST /api/promo-codes/{id}/deactivate
# Deactivate a code

# GET /api/promo-codes/{id}/claims
# Get claim history
```

### Public Deals API (`backend/api/deals.py`)

```python
# GET /api/deals
# List active deals near user
# Query: lat, lng, radius, category, limit

# POST /api/deals/{event_id}/claim
# User claims a promo code
# Returns: { code, discount_percent, valid_until, external_ticketing_url }
```

### Calculation Engine (`backend/services/pricing_engine.py`)

```python
def calculate_recommendation(
    occupancy_percent: float,
    hours_remaining: float,
    base_price: Decimal,
    min_price: Decimal
) -> Optional[Recommendation]:
    """
    MVP Decision Matrix:
    >80% or >24h: No discount
    60-80%: Monitor only
    40-60% + <24h: 15% discount
    20-40% + <12h: 25% discount
    <20% + <6h: 35% discount
    <10% + <2h: 50% discount
    """
    
def generate_promo_code(event_title: str, discount: int) -> str:
    """Generate code like YOGA30-ER"""
    prefix = sanitize_prefix(event_title[:4].upper())
    return f"{prefix}{discount}-ER"
```

## Phase 3: Organizer Dashboard UI (Week 3)

### 1. New Tab: "Pricing" in OrganizerDashboard

**Components to create:**

#### `PricingRulesCard.tsx`
- Toggle: "Enable dynamic pricing"
- Form: Max capacity, Base price, Min price guardrail
- Save button

#### `InventoryUpdateForm.tsx`
- Number input: Current tickets sold
- Display: Occupancy %, Seats remaining
- Button: "Update Inventory"
- Auto-triggers recommendation calculation

#### `RecommendationCard.tsx`
- Alert style card when recommendation exists
- Shows: Current occupancy, Hours remaining, Suggested discount
- Reason: "Low attendance - fill remaining seats"
- Actions: "Approve & Generate Code", "Reject", "Modify"

#### `PromoCodeDisplay.tsx`
```
┌─────────────────────────────┐
│ Your Promo Code             │
│                             │
│ YOGA30-ER                   │
│ [Copy] [Regenerate]         │
│                             │
│ 30% off • Max 15 uses        │
│ Valid: Now - 6:00 PM        │
│                             │
│ Claims: 8  | Used: 3 (est.)  │
└─────────────────────────────┘
```

#### `PricingAnalyticsCard.tsx`
- Active deals count
- Total claims this month
- Estimated commission earned

### 2. Sidebar Integration
- Add "Pricing" icon to OrganizerDashboard sidebar
- Badge: Number of pending recommendations

### 3. Notification Integration
- Toast notification when recommendation created
- Email notification (using existing notification system)

## Phase 4: User Deal Discovery (Week 4)

### 1. Event Card Badge

**Update:** `EventCard.tsx` or `OrganizerEventCard.tsx`

```tsx
{hasActivePromoCode && (
  <Badge variant="destructive" className="animate-pulse">
    {discountPercent}% OFF
  </Badge>
)}
```

### 2. Deal Detail View

**New Component:** `DealCard.tsx`

```tsx
<Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
  <CardHeader>
    <Badge>Last-Minute Deal</Badge>
    <h3>Save {discountPercent}%</h3>
  </CardHeader>
  <CardContent>
    <div className="flex items-center gap-2">
      <span className="line-through text-gray-400">${originalPrice}</span>
      <span className="text-2xl font-bold text-red-600">${discountedPrice}</span>
    </div>
    
    {codeRevealed ? (
      <div className="bg-white p-4 rounded border">
        <code className="text-lg font-mono">{promoCode}</code>
        <Button onClick={copyToClipboard}>Copy</Button>
      </div>
    ) : (
      <Button onClick={claimDeal}>Get Deal</Button>
    )}
    
    <Button variant="outline" onClick={openExternalTicketing}>
      Go to Eventbrite →
    </Button>
    
    <p className="text-sm text-gray-500">
      ⚡ {seatsRemaining} seats left • Expires {timeRemaining}
    </p>
  </CardContent>
</Card>
```

### 3. Deals Feed Page (Optional MVP Stretch)

**New Page:** `/deals`

- Filter: Last-minute, This weekend, Near me
- Sort: Biggest discount, Expiring soon
- Radius-based discovery

## Phase 5: Cron Jobs & Automation (Week 4-5)

### 1. Check Upcoming Events (Every 2 hours)
```python
# Find events starting in 4-48 hours with pricing rules
# Send notification: "Update your ticket count"
```

### 2. Generate Recommendations (Every 30 minutes)
```python
# For events with inventory snapshots < 1 hour old
# Calculate if recommendation should be created
# Create pending recommendation record
```

### 3. Expire Old Codes (Every hour)
```python
# Deactivate codes past valid_until
# Close pending recommendations after 2 hours
```

## Integration Points

### With Existing Event System
- Extend `EventAttributes` model with pricing fields
- Link to `events` table via `event_id`
- Use existing `organizer_id` from events

### With Existing Notification System
- Use current email/notification infrastructure
- Add new notification types: `PRICING_RECOMMENDATION`, `INVENTORY_UPDATE_REMINDER`

### With Existing User System
- Track claims against `auth.users(id)`
- Support anonymous claims (track by IP/session)

## Success Metrics

1. **Adoption Rate**: % of eligible organizers enabling dynamic pricing
2. **Activation Rate**: % of recommendations approved by organizers
3. **Claim Rate**: % of deal views → code claims
4. **Revenue Impact**: Total estimated commission from discounted tickets

## Post-MVP Enhancements

1. **Auto-approval**: Let organizers set "auto-approve up to X%"
2. **API Integrations**: Eventbrite, Square, Ticketmaster auto-sync
3. **Unique Codes**: Per-user tracking with better fraud prevention
4. **Real Commission Collection**: Stripe Connect integration
5. **Push Notifications**: Smart deal alerts based on user preferences
6. **Package Deals**: Multi-event bundles

## Files to Create/Modify

### New Files
```
backend/api/pricing_rules.py
backend/api/pricing_inventory.py
backend/api/pricing_recommendations.py
backend/api/promo_codes.py
backend/api/deals.py
backend/services/pricing_engine.py
backend/services/promo_code_generator.py

frontend/src/components/pricing/PricingRulesCard.tsx
frontend/src/components/pricing/InventoryUpdateForm.tsx
frontend/src/components/pricing/RecommendationCard.tsx
frontend/src/components/pricing/PromoCodeDisplay.tsx
frontend/src/components/pricing/PricingAnalyticsCard.tsx
frontend/src/components/deals/DealCard.tsx
frontend/src/components/deals/DealBadge.tsx

supabase/migrations/consolidated/04_dynamic_pricing.sql
```

### Modified Files
```
backend/api/events.py - Add pricing fields to Event model
backend/main.py - Register new API routers

frontend/src/pages/OrganizerDashboard.tsx - Add Pricing tab
frontend/src/components/OrganizerDashboard/Sidebar.tsx - Add Pricing icon
frontend/src/integrations/backend/api.ts - Add pricing API calls
frontend/src/integrations/backend/types/index.ts - Add pricing types
```

## Timeline Summary

| Week | Focus | Deliverables |
|------|-------|--------------|
| 1 | Database | Schema migration, tables, indexes, RLS |
| 2 | Backend | All API endpoints, calculation engine |
| 3 | Organizer UI | Pricing tab, forms, approval workflow |
| 4 | User UI | Deal badges, claim flow, external linking |
| 5 | Automation | Cron jobs, notifications, testing, polish |
