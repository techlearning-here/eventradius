# AI Dynamic Pricing Decision Engine

## Overview

The EventRadius AI Dynamic Pricing Engine helps organizers make optimal pricing decisions to maximize revenue and fill perishable inventory (seats, slots, tables).

**Core Principle**: "AI recommends the best price at the best time to the best customer"

---

## 🤖 How AI Makes Pricing Decisions

### Input Factors (Data Points)

| Factor | Weight | Source |
|--------|--------|--------|
| **Current Occupancy** | 30% | Real-time booking data |
| **Time to Event** | 25% | Event start time vs now |
| **Historical Demand** | 20% | Past similar events performance |
| **Day/Time Patterns** | 15% | Weekday vs weekend, time of day |
| **External Factors** | 10% | Weather, holidays, local events |

### Decision Process

```
Step 1: Calculate Baseline Price
  ↓
Step 2: Apply Occupancy Adjustment
  ↓
Step 3: Apply Time Pressure Adjustment
  ↓
Step 4: Apply Demand Forecasting
  ↓
Step 5: Generate Final Recommendation
```

---

## 📊 Pricing Decision Matrix

### Decision 1: Should We Discount?

| Current Occupancy | Time Remaining | AI Decision |
|-------------------|----------------|-------------|
| >80% | >24 hours | ❌ No discount needed |
| 60-80% | >24 hours | ❌ Monitor, no action |
| 40-60% | 12-24 hours | ✅ Slight discount (10-15%) |
| 20-40% | 6-12 hours | ✅ Moderate discount (20-30%) |
| <20% | <6 hours | ✅ Aggressive discount (35-50%) |
| <10% | <2 hours | ✅ Maximum discount (50-60%) |

### Decision 2: How Much to Discount?

```
Base Price: $20 (regular ticket price)

Scenario A: 65% sold, 18 hours remaining
  → AI recommends: $18 (10% off)
  → Reason: Slight nudge to reach 85% capacity

Scenario B: 35% sold, 4 hours remaining  
  → AI recommends: $14 (30% off)
  → Reason: Fill seats that would be empty

Scenario C: 8% sold, 45 minutes remaining
  → AI recommends: $10 (50% off)
  → Reason: Last-minute deal, any revenue better than $0
```

### Decision 3: Who to Target?

| Discount Level | Target Audience | Notification Channel |
|--------------|-----------------|---------------------|
| 10-15% | Past attendees, nearby users | Email, in-app |
| 20-30% | Interest-matched, price-sensitive | Push notification |
| 35-50% | Broad local audience | Push + SMS |
| 50-60% | Everyone within radius | All channels + social |

---

## 🎯 AI Recommendation Examples

### Example 1: Cinema Tuesday 7pm

**Event**: Movie showing, 100 seats
**Current State**: 2 hours before showtime

| Time | Occupancy | AI Recommendation | Action |
|------|-----------|-------------------|--------|
| 4:00 PM (T-3h) | 45% | "Monitor, no discount yet" | Wait |
| 5:00 PM (T-2h) | 48% | "Recommend 20% discount to nearby movie fans" | Send push |
| 5:30 PM (T-1.5h) | 52% | "Increase to 30% discount, expand radius" | Broaden targeting |
| 6:00 PM (T-1h) | 58% | "Final push: 40% off + free popcorn upsell" | Urgent alert |
| 6:30 PM (T-30min) | 70% | "Success: 18 additional seats filled" | Stop promoting |

**Result**: 18 seats × $12 avg = $216 additional revenue (vs $0 if empty)

---

### Example 2: Yoga Studio Saturday Morning

**Event**: 9am Vinyasa class, 20 mats
**Current State**: Friday evening

| Metric | Value |
|--------|-------|
| Regular price | $25 |
| Bookings (Fri 6pm) | 8/20 (40%) |
| Historical Sat 9am | Usually 90% full |
| Weather forecast | Sunny (good for attendance) |

**AI Analysis**:
- Current occupancy (40%) is below historical average (90%)
- 15 hours remaining = time for recovery
- Sunny weather = positive factor
- Weekend morning = high demand time

**AI Recommendation**:
```
"Don't discount yet. Send reminder to:
  - 12 past attendees who haven't booked
  - 8 users with 'yoga' interest within 2 miles
Expected fill rate: 85% by 8am tomorrow"
```

**Result**: 17/20 filled at full price = $425 revenue (no discount needed)

---

### Example 3: Restaurant Tuesday Lunch

**Event**: 12pm-2pm lunch service, 30 tables
**Current State**: Tuesday 10am

| Metric | Value |
|--------|-------|
| Regular avg check | $35 |
| Reservations (10am) | 8/30 tables (27%) |
| Historical Tue lunch | Usually 50% full |
| Weather | Rainy (negative factor) |
| Local events | Convention downtown (positive) |

**AI Analysis**:
- Current occupancy (27%) concerning
- Rainy weather = negative
- Convention nearby = positive offset
- Only 2 hours to service = urgency

**AI Recommendation**:
```
"Launch 'Rainy Day Lunch Special':
  - 30% off all tables
  - Target: Convention attendees (1 mile radius)
  - Message: 'Escape the rain, warm lunch deal'
  - Channel: Push notification to nearby users"
```

**Pricing**: $35 → $24.50
**Result**: 22 tables filled = $539 revenue (vs $280 without AI)
**Gain**: +$259 (+92% improvement)

---

## 🧠 AI Decision Framework

### The 3 Questions AI Asks

```
1. WILL IT SELL?
   → Demand forecasting model
   → Predicts probability of sale at current price
   → If <30% probability: recommend discount

2. AT WHAT PRICE?
   → Price elasticity model
   → Finds optimal price for maximum revenue
   → Balances: discount depth vs fill rate

3. TO WHOM?
   → Audience targeting model
   → Matches event to most likely buyers
   → Prioritizes: past customers > interest match > location
```

---

## 📈 AI Models Used

### Model 1: Demand Forecasting

**Purpose**: Predict how many seats will sell at current price

```python
# Simplified logic
def forecast_demand(occupancy, time_remaining, historical_avg):
    base_probability = occupancy / 100
    time_pressure = 1 / (time_remaining / 24)  # Hours to days
    historical_trend = historical_avg / 100
    
    sale_probability = (base_probability * 0.4 + 
                     time_pressure * 0.3 + 
                     historical_trend * 0.3)
    
    return sale_probability
```

**Output**: "87% chance of selling at current price" or "23% chance - recommend discount"

---

### Model 2: Price Optimization

**Purpose**: Find the price that maximizes expected revenue

```python
# Expected Revenue = Price × Probability of Sale

def optimize_price(base_price, occupancy, time_remaining):
    test_discounts = [0, 0.10, 0.20, 0.30, 0.40, 0.50]
    best_revenue = 0
    best_discount = 0
    
    for discount in test_discounts:
        price = base_price * (1 - discount)
        probability = calculate_sale_probability(occupancy, time_remaining, discount)
        expected_revenue = price * probability
        
        if expected_revenue > best_revenue:
            best_revenue = expected_revenue
            best_discount = discount
    
    return best_discount, best_revenue
```

**Example**:
```
$20 ticket, 30% occupancy, 4 hours remaining:
  - 0% discount: $20 × 15% chance = $3.00 expected
  - 20% discount: $16 × 45% chance = $7.20 expected  ← OPTIMAL
  - 40% discount: $12 × 70% chance = $8.40 expected
  
AI recommends: 20% discount (best risk/reward)
```

---

### Model 3: Audience Targeting

**Purpose**: Find the users most likely to book at the recommended price

**Scoring Algorithm**:
```
User Score = 
  (Interest Match × 0.3) +
  (Distance Score × 0.25) +
  (Past Behavior × 0.25) +
  (Price Sensitivity × 0.2)

Where:
  Interest Match: % overlap with event category
  Distance Score: 1 - (miles / max_radius)
  Past Behavior: Historical booking rate for similar events
  Price Sensitivity: Response rate to past discounts
```

**Result**: Ranked list of users to notify

---

## 🎛️ Organizer Control Panel

Organizers can set AI parameters:

### Setting 1: Discount Range

| Option | Description | Use Case |
|--------|-------------|----------|
| Conservative | Max 20% discount | Premium brands, luxury venues |
| Balanced | Max 40% discount | Most venues (default) |
| Aggressive | Max 60% discount | High volume, budget venues |
| Custom | Set your own max | Specific brand requirements |

### Setting 2: Minimum Price Floor

```
"Never discount below $X"

Example: $20 ticket, $12 floor
  - AI can recommend: $20, $18, $16, $14, $12
  - AI cannot recommend: $10, $8, etc.
```

### Setting 3: Auto-Pilot vs Manual

| Mode | AI Action | Organizer Action |
|------|-----------|------------------|
| **Auto-Pilot** | Implements recommendations automatically | Monitors only |
| **Assistant** | Shows recommendations, suggests actions | Approves each action |
| **Manual** | Provides data and insights only | Makes all decisions |

### Setting 4: Notification Preferences

| Setting | Options |
|---------|---------|
| Target Radius | 1 mile, 3 miles, 5 miles, 10 miles |
| User Types | Past customers, Interest match, New users, Everyone |
| Channels | Push, Email, SMS, All |
| Frequency | Every discount, Daily summary, Only urgent |

---

## 📊 AI Performance Metrics

### Metrics for Organizers

| Metric | Definition | Target |
|--------|-----------|--------|
| **Fill Rate Improvement** | % increase in occupancy vs without AI | +25% |
| **Revenue Per Seat** | Average revenue per available slot | Maximize |
| **Discount Efficiency** | % of discounts that resulted in sales | >70% |
| **Customer Acquisition** | New customers from AI promotions | Track growth |
| **Return on AI** | Additional revenue / Commission paid | >10x |

### Metrics for EventRadius

| Metric | Purpose |
|--------|---------|
| **Recommendation Accuracy** | % of AI recommendations that filled seats |
| **Price Elasticity Accuracy** | How close predicted vs actual sales |
| **User Engagement Rate** | % of notified users who viewed event |
| **Conversion Rate** | % of views that resulted in booking |
| **Organizer Satisfaction** | Feedback on AI usefulness |

---

## 🔄 Continuous Learning Loop

```
1. AI Makes Recommendation
        ↓
2. Organizer Implements (or approves)
        ↓
3. Users Receive Notification
        ↓
4. Some Users Book (conversion)
        ↓
5. AI Measures Results
        ↓
6. AI Updates Models
        ↓
7. Future Recommendations Improve
```

**Learning Sources**:
- Which discounts worked? Which didn't?
- Which users responded? Which ignored?
- What times/days were most effective?
- What messaging drove conversions?

---

## 💡 AI Decision Examples by Industry

### Cinema Chain

**Scenario**: Tuesday 3pm showing (traditionally empty)

**AI Decision Process**:
```
Input:
  - Time: 3 hours before showing
  - Occupancy: 15% (15/100 seats)
  - Historical: Tuesday 3pm usually 20% full
  - Weather: Rainy (positive for movie attendance)
  - Local: School holiday (positive)

Analysis:
  - Occupancy is below historical
  - Time pressure is high (3 hours)
  - External factors positive (rain + holiday)
  - Opportunity for significant discount

Recommendation:
  - Discount: 50% off ($12 → $6)
  - Target: Families with kids (school holiday)
  - Message: "Rainy day movie special! $6 tickets"
  - Channel: Push to parents within 5 miles

Expected Outcome:
  - Fill 40 additional seats
  - Revenue: 40 × $6 = $240
  - Without AI: 15 seats × $12 = $180
  - Net gain: +$60 + 25 more customers
```

---

### Fitness Studio

**Scenario**: Wednesday 6pm spin class

**AI Decision Process**:
```
Input:
  - Time: 18 hours before class
  - Occupancy: 60% (12/20 bikes)
  - Historical: Wed 6pm usually 95% full
  - Weather: Sunny (negative - people exercise outside)
  - Trend: Booking rate dropping

Analysis:
  - Occupancy is concerning for this time slot
  - Sunny weather is negative factor
  - Still time to recover (18 hours)
  - Don't panic discount yet

Recommendation:
  - Discount: 15% off ($25 → $21.25)
  - Target: Past attendees who haven't booked
  - Message: "Your usual Wednesday spot is waiting"
  - Channel: Email + push to loyal customers

Expected Outcome:
  - Fill 5 additional bikes
  - Revenue: 5 × $21.25 = $106.25
  - Without AI: likely 0-2 more sales
  - Net gain: +$80-100
```

---

### Restaurant

**Scenario**: Thursday 2:30pm table (off-peak)

**AI Decision Process**:
```
Input:
  - Time: 1 hour before service
  - Reservations: 25% (10/40 tables)
  - Historical: Thursday lunch usually 60% full
  - Local: Business district, office workers nearby
  - Weather: Nice (people might go out)

Analysis:
  - Occupancy is low for time remaining
  - Office workers are ideal target
  - Short window (1 hour)
  - Need aggressive discount

Recommendation:
  - Discount: 35% off lunch menu
  - Target: Office workers within 0.5 miles
  - Message: "Quick lunch break deal - 35% off next hour"
  - Channel: Push notification (immediate)

Expected Outcome:
  - Fill 18 additional tables
  - Revenue: 18 × $22 avg = $396
  - Without AI: 10 tables × $35 = $350
  - Net gain: +$46 + 8 more customers
```

---

## 🎓 AI Training Data

### What Data Trains the Models?

| Data Source | Weight | Privacy |
|-------------|--------|---------|
| Historical event performance | 40% | Aggregated, anonymized |
| Booking patterns by time/day | 25% | Anonymized |
| User preferences & interests | 20% | Opt-in only, encrypted |
| Pricing response data | 15% | Aggregated trends |

### How Organizers Benefit from Collective Intelligence

```
Yoga Studio A shares data:
  - "25% discount fills 40% more seats on rainy days"
  
AI learns:
  - Rainy weather + fitness classes = higher discount sensitivity
  
Yoga Studio B benefits:
  - AI applies this learning to their rainy day pricing
  - Better results without experimentation
```

---

## 🚀 AI Features Roadmap

### Phase 1 (Current): Reactive Pricing
- Respond to low occupancy with discounts
- Basic demand forecasting
- Simple audience targeting

### Phase 2: Predictive Pricing
- Predict low demand before it happens
- Preemptive pricing adjustments
- Advanced audience matching

### Phase 3: Prescriptive Pricing
- AI suggests optimal event times
- Recommends best days for maximum revenue
- Predicts ideal capacity limits

### Phase 4: Autonomous Pricing
- Fully automated pricing (organizer sets guardrails)
- Real-time price adjustments
- Cross-event optimization

---

## 📱 Organizer AI Dashboard

### Real-Time View

```
┌─────────────────────────────────────────┐
│  🎬 Cinema: Avengers - Tuesday 7pm     │
├─────────────────────────────────────────┤
│  📊 Current Status:                     │
│     • 45/100 seats filled (45%)        │
│     • 3 hours to showtime                │
│     • $12 regular price                │
├─────────────────────────────────────────┤
│  🤖 AI Recommendation:                  │
│     • Suggest 25% discount ($9)          │
│     • Target: 20 nearby movie fans       │
│     • Expected: +15 seats, +$135         │
├─────────────────────────────────────────┤
│  [✅ Approve & Send] [✏️ Adjust] [❌ Skip]│
└─────────────────────────────────────────┘
```

### Historical Performance

```
┌─────────────────────────────────────────┐
│  📈 AI Performance This Month          │
├─────────────────────────────────────────┤
│  • 23 AI recommendations made           │
│  • 18 resulted in sales (78% success)   │
│  • $3,240 additional revenue generated    │
│  • $97 commission paid to EventRadius   │
│  • ROI: 33.4x return on AI commission   │
└─────────────────────────────────────────┘
```

---

## 💬 Frequently Asked Questions

### Q: Will AI force me to discount?
A: No. AI provides recommendations. You choose whether to implement.

### Q: Can I override AI suggestions?
A: Yes. You can adjust discount amount, target audience, or skip entirely.

### Q: What if AI is wrong?
A: You only pay commission on actual sales. Bad recommendations cost you nothing.

### Q: Does AI learn my specific venue?
A: Yes. AI improves as it learns your customer patterns, preferences, and response rates.

### Q: Can I set maximum discount limits?
A: Yes. Set price floors and discount caps in your AI preferences.

### Q: How often does AI make recommendations?
A: Continuously monitored. Recommendations come when conditions trigger them (low occupancy + time pressure).

---

## 🎯 Summary

**AI Value Proposition**:

> "Our AI analyzes thousands of data points to recommend the exact price, timing, and audience that will maximize your revenue. You stay in control - AI is your smart assistant, not your boss."

**Key Benefits**:
1. **No guesswork**: Data-driven pricing decisions
2. **Higher revenue**: Fill seats that would be empty
3. **Time savings**: AI monitors 24/7, alerts when action needed
4. **Better customers**: Targeted promotions to ideal audience
5. **Learning system**: Gets smarter with every event

**Result**: Organizers make more money with less effort.

---

**Document Version**: 1.0
**Last Updated**: April 2026
**Owner**: Product & AI Team
