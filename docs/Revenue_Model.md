# EventRadius.ai Revenue Model

## Core Principle

**"We don't sell tickets. We optimize pricing to fill seats. Revenue comes from successful sales enabled by our AI."**

Unlike Eventbrite which charges per-ticket fees, EventRadius takes a **commission on sales generated through dynamic pricing optimization**.

---

## 💰 Primary Revenue: Dynamic Pricing Commission

### How It Works

```
1. Organizer lists event (cinema seat, fitness class, restaurant table)
2. AI analyzes demand, occupancy, time, location
3. AI recommends optimal discount to fill empty slot
4. User books through organizer's payment system
5. EventRadius takes commission on the sale
```

### Commission Structure

| Tier | Base Commission | Dynamic Pricing Discount | Effective Commission |
|------|-----------------|--------------------------|---------------------|
| **Free Tier** | 8% of sale | AI recommends discount | 8% of final sale price |
| **Starter ($9/mo)** | 5% of sale | AI recommends discount | 5% of final sale price |
| **Pro ($29/mo)** | 3% of sale | AI recommends discount | 3% of final sale price |
| **Enterprise ($99/mo)** | 1% of sale | AI recommends discount | 1% of final sale price |

### Example: Cinema Tuesday 7pm Showing

**Scenario**: Movie theater has 50 empty seats 2 hours before showtime

```
Regular ticket price: $12
AI recommends: $7.20 (40% off) to fill seats
Customer pays: $7.20
Theater receives: $7.20 minus commission

Free Tier (8% commission):
  Theater gets: $7.20 - $0.58 = $6.62
  EventRadius: $0.58
  
Pro Tier (3% commission):
  Theater gets: $7.20 - $0.22 = $6.98
  EventRadius: $0.22
  Theater saves: $0.36 vs Free tier
```

**Without EventRadius**: 50 empty seats = $0 revenue
**With EventRadius**: 50 filled seats × $6.62 = $331 revenue for theater

---

## 🎯 Revenue Only on Successful Sales

### What We Charge Commission On

✅ **Yes - Commission Applied:**
- Ticket sold through dynamic pricing recommendation
- Class spot filled via AI-optimized price
- Table booked through last-minute deal alert
- Appointment slot filled via smart notification

❌ **No Commission:**
- Regular price sales (no AI optimization used)
- Free events
- Sales outside our platform
- Organizer's existing customers (attribution tracking)

### Attribution Model

| Sale Type | Commission? | Tracking |
|-----------|-------------|----------|
| **AI Dynamic Pricing Sale** | ✅ Yes | User clicked AI-recommended price |
| **Proactive Notification Sale** | ✅ Yes | User booked from push notification |
| **Smart Targeting Sale** | ✅ Yes | Matched via AI audience targeting |
| **Last-Minute Deal Sale** | ✅ Yes | Filled via urgency alert |
| **Regular Listing Sale** | ❌ No | No AI optimization applied |
| **Direct Organizer Sale** | ❌ No | Customer bypassed platform |

---

## 📊 Revenue Calculation Examples

### Example 1: Fitness Studio

**Profile**: Yoga studio, 20 classes/week, 20 spots/class

| Metric | Without EventRadius | With EventRadius |
|--------|---------------------|------------------|
| Average occupancy | 65% (13/20 spots) | 90% (18/20 spots) |
| Empty spots/week | 140 spots | 40 spots |
| Avg class price | $25 | $22 (AI-optimized) |
| Gross revenue/week | $3,250 | $3,960 |
| EventRadius commission (3%) | $0 | $118.80 |
| **Net revenue for studio** | **$3,250** | **$3,841.20** |
| **Studio gain** | - | **+$591.20/week** |

**Annual Impact**:
- Studio additional revenue: $30,742/year
- EventRadius revenue: $6,178/year from this one studio

---

### Example 2: Cinema Chain

**Profile**: 5-screen cinema, 6 showings/day/screen

| Metric | Without EventRadius | With EventRadius |
|--------|---------------------|------------------|
| Average occupancy | 45% | 70% |
| Empty seats/day | 330 seats | 90 seats |
| Avg ticket price | $12 | $9 (AI-optimized) |
| Daily ticket revenue | $1,782 | $3,780 |
| Concession revenue* | $891 | $1,890 |
| EventRadius commission (1%) | $0 | $37.80 |
| **Total daily revenue** | **$2,673** | **$5,632.20** |
| **Daily gain** | - | **+$2,959.20** |

*Assumes $0.50 concession spend per ticket

**Annual Impact**:
- Cinema additional revenue: $1.08M/year
- EventRadius revenue: $13,797/year from this one location

---

### Example 3: Restaurant Off-Peak

**Profile**: 40-seat restaurant, slow Tuesday 2-5pm

| Metric | Without EventRadius | With EventRadius |
|--------|---------------------|------------------|
| Tables filled (2-5pm) | 5 tables | 25 tables |
| Average check | $35 | $28 (AI-optimized menu) |
| Afternoon revenue | $175 | $700 |
| EventRadius commission (5%) | $0 | $35 |
| **Net restaurant revenue** | **$175** | **$665** |
| **Daily gain** | - | **+$490** |

**Annual Impact**:
- Restaurant additional revenue: $127,400/year (just Tue afternoons)
- EventRadius revenue: $12,740/year from this restaurant

---

## 💵 Secondary Revenue Streams

### 1. Base Subscription (Monthly SaaS)

Flat monthly fee for platform access:

| Tier | Monthly | Annual |
|------|---------|--------|
| Free | $0 | $0 |
| Starter | $9 | $90 (17% savings) |
| Pro | $29 | $290 (17% savings) |
| Enterprise | $99 | $990 (17% savings) |

**What subscription includes**:
- Platform access
- Basic analytics
- Event creation tools
- Reduced commission rates
- Priority support

---

### 2. Advertising Revenue

| Ad Type | Price | Target |
|---------|-------|--------|
| **Featured Event Placement** | $50/week | Top of discovery feed |
| **Sponsored Notifications** | $0.15/notification | Push to matched users |
| **Category Sponsorship** | $500/month | "Presented by [Brand]" |
| **Homepage Banner** | $1,000/week | High visibility |

---

### 3. Marketplace Services

Commission on value-added services:

| Service | Commission | When Used |
|---------|------------|-----------|
| **Payment Processing** | 1% | If using our Stripe integration |
| **SMS Notifications** | $0.05/message | Text alerts to attendees |
| **Email Campaigns** | $0.01/email | Marketing blasts |
| **Insurance** | 15% | Event liability coverage |

---

### 4. Enterprise Services

| Service | Price | Description |
|---------|-------|-------------|
| **Custom AI Training** | $5,000 setup | Train on historical data |
| **API Integration** | $500/month | Connect to POS/CRM |
| **White-label Solution** | $2,000/month | Branded platform |
| **Consulting** | $250/hour | Yield optimization strategy |
| **Dedicated Support** | $500/month | Account manager |

---

## 📈 Revenue Model Comparison

### EventRadius vs Competitors

| Platform | Revenue Model | Organizer Pays |
|----------|---------------|----------------|
| **Eventbrite** | Per-ticket fee | 3.7% + $1.79 per ticket |
| **Meetup** | Monthly subscription | $16-47/month |
| **EventRadius** | Commission on AI-optimized sales | % of dynamic pricing sales only |

### Key Difference

**Eventbrite**: Charges on ALL tickets (even full-price, even organizer's own customers)

**EventRadius**: Charges ONLY when our AI generates the sale through:
- Dynamic pricing recommendation
- Proactive notification
- Smart audience targeting
- Last-minute deal alert

---

## 🎯 Revenue Scenarios

### Scenario 1: Small Yoga Studio (Starter Tier)

**Profile**: 10 classes/week, 15 spots/class, $20/class

| Metric | Value |
|--------|-------|
| Monthly subscription | $9 |
| AI-optimized sales/month | 30 spots filled via dynamic pricing |
| Average AI-optimized price | $16 |
| Gross AI sales | $480 |
| Commission (5%) | $24 |
| **Total EventRadius revenue/month** | **$33** |
| **Studio net gain** | $432/month |

---

### Scenario 2: Cinema (Pro Tier)

**Profile**: 3 screens, 5 showings/day, 100 seats/screen

| Metric | Value |
|--------|-------|
| Monthly subscription | $29 |
| Empty seats filled via AI/day | 45 seats |
| Average AI ticket price | $9 |
| Daily AI sales | $405 |
| Monthly AI sales | $12,150 |
| Commission (3%) | $364.50 |
| **Total EventRadius revenue/month** | **$393.50** |
| **Cinema net gain** | $11,786.50/month |

---

### Scenario 3: Restaurant Chain (Enterprise Tier)

**Profile**: 10 locations, 50 tables each

| Metric | Value |
|--------|-------|
| Monthly subscription | $99 |
| AI-optimized table fills/day | 150 tables (across chain) |
| Average AI check | $35 |
| Daily AI sales | $5,250 |
| Monthly AI sales | $157,500 |
| Commission (1%) | $1,575 |
| **Total EventRadius revenue/month** | **$1,674** |
| **Chain net gain** | $155,826/month |

---

## 💡 Revenue Optimization Strategies

### 1. AI Commission Tiering

Higher commission on harder-to-fill inventory:

| Fill Challenge | Base Commission | AI Boost | Total |
|----------------|-----------------|----------|-------|
| Standard slot | 3% | 0% | 3% |
| Hard-to-fill | 3% | +2% | 5% |
| Last-minute (<2hrs) | 3% | +3% | 6% |
| Very last-minute (<30min) | 3% | +4% | 7% |

### 2. Volume Discounts

Reduce commission as organizer volume grows:

| Monthly AI Sales | Commission Rate |
|------------------|-----------------|
| $0 - $1,000 | 5% |
| $1,001 - $5,000 | 4% |
| $5,001 - $20,000 | 3% |
| $20,001 - $50,000 | 2% |
| $50,000+ | 1% |

### 3. Seasonal Pricing

Adjust commission based on demand cycles:

| Season | Commission Modifier |
|--------|---------------------|
| Peak season | -1% (lower commission) |
| Off-peak | +1% (higher commission) |
| Holidays | Standard |

---

## 📊 Revenue Projections (3-Year)

### Conservative Estimate

| Year | Organizers | Avg Monthly Commission/Org | Subscription Revenue | Commission Revenue | Total Revenue |
|------|------------|---------------------------|---------------------|-------------------|---------------|
| 1 | 500 | $50 | $8,700 | $25,000 | $33,700/mo = $404K/yr |
| 2 | 2,000 | $75 | $40,000 | $150,000 | $190,000/mo = $2.28M/yr |
| 3 | 5,000 | $100 | $120,000 | $500,000 | $620,000/mo = $7.44M/yr |

### Assumptions
- Average organizer: 20 events/month
- Average fill rate improvement: 25%
- Average commission: 3%
- Subscription mix: 40% Pro, 20% Starter, 10% Enterprise, 30% Free

---

## 🎭 Value Proposition for Organizers

### "You Only Pay When We Perform"

| Eventbrite | EventRadius |
|------------|-------------|
| Pay on every ticket | Pay only on AI-optimized sales |
| Pay even if you would have sold anyway | Pay only for incremental revenue |
| Fixed fee structure | Success-based pricing |
| No incentive to fill empty seats | We only make money when you fill seats |

### ROI Calculator for Organizers

```
Without EventRadius:
  Empty seats per week: 100
  Revenue from empty seats: $0

With EventRadius:
  Empty seats filled: 70
  AI-optimized price: $15 (vs $20 regular)
  Gross new revenue: $1,050
  EventRadius commission (3%): $31.50
  Net new revenue: $1,018.50

ROI: $1,018.50 / $31.50 = 32x return
```

---

## 🚀 Why This Model Works

### For EventRadius:
1. **Aligned incentives**: We only make money when organizer makes money
2. **Scales with success**: More sales = more revenue for everyone
3. **Predictable revenue**: Base subscriptions + variable commission
4. **High margins**: Commission on digital sales (low cost)

### For Organizers:
1. **No risk**: Only pay for proven results
2. **Incremental revenue**: Pay commission on NEW sales only
3. **Transparent**: Clear attribution of AI-driven sales
4. **Better than alternatives**: Eventbrite charges on ALL sales

### For Discoverers:
1. **Better deals**: Dynamic pricing = lower prices
2. **Discoverability**: AI finds relevant events proactively
3. **Free**: Never pay to browse or register

---

## 📋 Implementation Notes

### Technical Requirements:
1. **Attribution tracking**: Know when sale came from AI recommendation
2. **Payment integration**: Connect to organizer's payment processor
3. **Commission calculation**: Real-time or daily batch
4. **Payout system**: Monthly billing to organizers

### Legal Considerations:
1. **Clear disclosure**: Organizers know commission structure upfront
2. **Attribution transparency**: Show which sales incurred commission
3. **Contract terms**: Monthly billing, commission reconciliation
4. **Dispute resolution**: Process for challenging attribution

---

## 🎯 Summary

**Revenue Formula:**
```
Total Revenue = 
  (Base Subscriptions) +
  (Commission on AI-optimized sales) +
  (Advertising) +
  (Enterprise services)
```

**Key Principle:**
> "We succeed only when our organizers succeed. Our revenue is directly tied to the value our AI creates."

**Competitive Advantage:**
- Eventbrite: 3.7% + $1.79 on ALL tickets
- EventRadius: 1-8% on AI-optimized sales ONLY
- Result: Lower effective cost, higher incremental value

---

**Document Version**: 1.0
**Last Updated**: April 2026
**Owner**: Finance & Strategy Team
