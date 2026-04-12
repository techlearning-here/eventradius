# Beacon: Founding Team Vision & Opportunity

**Prepared for Prospective Founding Team Members**
*Last Updated: April 2026*

---

## Executive Summary

Beacon is building an intelligent hyper-local event subscription platform. We match **end users** with nearby events based on their pre-captured preferences — and notify them the moment something relevant appears.

**The core innovation**: Instead of expecting users to constantly search and browse, we use their preferences (distance, demographics, language, age, interests) to proactively push matching events in real-time. When an organizer publishes an event, the right users know about it within minutes — not days.

**Our north star**: Every user discovers every relevant event near them, automatically.

---

## The Problem We're Solving

### The Discovery Gap

**For End Users:**
Every day, people miss events they would have loved because:

- **Eventbrite**: You must search; if you don't search today, you miss tomorrow's event
- **Facebook**: Events get buried in feeds; algorithm decides what you see
- **Meetup**: Requires joining groups first; doesn't match individual preferences
- **Google**: Hard to find hyper-local events; no personalization
- **Local blogs/newsletters**: Inconsistent, easy to miss, not real-time

**Real user scenarios**:
- "I live in Brooklyn, speak Spanish, have kids, and love food events. I had no idea there was a family-friendly Mexican cooking class 2 miles away last weekend."
- "I check Eventbrite once a week, but events get posted and sell out between my visits."
- "I'm a 65-year-old retiree interested in wellness workshops. Finding age-appropriate local events is exhausting."
- "I moved to a new city. How do I discover events that match my interests without spending hours searching?"

**The result**: Users miss relevant events. Organizers struggle to reach the right audience. Great experiences happen in half-empty rooms because discovery is broken.

**For Organizers:**
Every organizer faces the same challenge:
- "How do I get my event in front of people who actually care?"
- "I post on social media but reach the wrong people (or nobody at all)."
- "Eventbrite lists my event, but nobody finds it unless they search for it specifically."

The current model is **reactive**: Hope the right person searches at the right time. This is broken.

We believe event discovery should be **proactive**: The moment an event is published, the right users are notified automatically.

---

## Our Solution

### The Beacon Preference-Matching Platform

We built a **preference-based matching system** that proactively connects users with events they'll love.

#### 1. One-Time Preference Capture
During onboarding, users set their "event preference profile":

```
Preferences captured:
- Location: Home address or current location
- Distance radius: 1, 3, 5, 10, or 25 miles
- Demographics: Age, family status (kids/no kids), languages spoken
- Interests: Food & drink, wellness, arts, sports, professional networking, family activities, etc.
- Timing: Preferred days of week, times of day
- Accessibility: Wheelchair accessible, sensory-friendly, etc.
- Cultural context: Religious observances, dietary restrictions, preferred languages
```

**Set once, match forever.** No daily searching required.

#### 2. Real-Time Event Matching
When an organizer publishes an event, our matching engine immediately identifies all users whose preferences align:

```
New event published:
- Title: "Spanish Language Book Club"
- Location: Downtown Library (2.3 miles from user)
- Category: Learning & Culture
- Languages: Spanish, English
- Age focus: Adults 25-65
- Kid-friendly: No

Matching users notified within seconds:
- User A: 1.8 mi away, speaks Spanish, interested in learning, age 34
- User B: 2.1 mi away, speaks Spanish & English, interested in books, age 45
- User C: 2.9 mi away, language learner, interested in Spanish culture, age 28

Result: The right users know about it immediately
```

#### 3. Proactive Notification System
Users receive notifications through their preferred channels:
- **Push notifications** (mobile app): Instant alerts for high-relevance matches
- **Email digest**: Daily or weekly summary of new matching events
- **In-app notifications**: Badge counts and alerts when users open the app
- **SMS** (optional): For last-minute or urgent local happenings

**The key difference**: Users don't search. They set their preferences once, and we automatically deliver matching events to them.

#### 4. Organizer Reach Dashboard
Organizers see exactly who their event reached:

```
Event: "Italian Cooking Class"

Reach Metrics:
- 847 users matched based on preferences
- 312 users notified (within radius + interests)
- 89 users opened notification
- 24 users clicked "Interested"
- 12 users marked "Going"

Demographic breakdown:
- Primary languages: English (80%), Spanish (15%), Italian (5%)
- Age groups: 25-34 (45%), 35-44 (30%), 45-54 (20%)
- Family status: 60% no kids, 40% have kids

Result: Organizers understand their audience before the event even happens
```

---

## Where We Are Today

### Platform Status: Functional Foundation

**✅ Built and Tested**:
- React + TypeScript frontend with Tailwind/shadcn-ui
- FastAPI Python backend
- Supabase PostgreSQL database
- Google OAuth authentication
- **User onboarding with rich preference capture**: demographics, interests, location, distance radius, languages, family status, accessibility needs
- Role-switching (Event Discoverer ↔ Event Publisher)
- Event creation wizard with comprehensive attribute system (11 categories)
- Event discovery page with location-based filtering
- Location autocomplete with Google Maps
- Admin dashboard for event moderation

**🔄 In Development**:
- **Real-time matching engine** — core algorithm to match events with user preferences
- **Push notification system** — instant delivery of matching events
- **Email digest system** — daily/weekly summaries
- **Matching analytics** — organizer dashboard showing reach and conversion
- Mobile-responsive refinements

**📊 Ready for Launch**:
- Platform demo-ready for end users and organizers
- Comprehensive attribute framework supporting rich matching criteria
- Admin moderation system in place
- Preference-based discovery engine foundation built

---

## The Market Opportunity

### Total Addressable Market (TAM)

| Segment | US Market | Pain Point |
|---------|-----------|------------|
| Local event attendees | 200M+ people | Missing relevant nearby events |
| Event organizers | 5M+ businesses & creators | Hard to reach the right audience |
| Experience economy | $100B+/year | Discovery friction limits growth |
| Subscription services | $30B/year | Users expect personalized delivery |

**Combined TAM**: $130B+ and growing. The shift from "search-based" to "subscription-based" discovery is happening everywhere (Netflix, Spotify, TikTok) — except local events.

### Our Beachhead: Preference-Driven Discovery

**Primary target: End Users**
- Urban/suburban residents aged 25-65
- Busy professionals who won't spend time searching
- Parents looking for family-friendly activities
- Language communities seeking culturally relevant events
- Older adults wanting age-appropriate local happenings
- New residents trying to connect with their community

**Why this works:**
- **Pain point is universal**: Everyone has missed an event they would have loved
- **Behavior shift complete**: Users expect content to come to them (Netflix model)
- **Data moat**: Every preference captured improves matching for everyone
- **Network effects**: More users = more organizers = better matches

**Secondary target: Organizers**
- Small businesses with events to promote
- Community organizations
- Local creators and teachers
- Anyone who needs to reach a specific local demographic

**Expansion Path**:
1. Dense urban markets (NYC, SF, Chicago, Austin)
2. Suburban family communities
3. Language/cultural communities (Spanish-speaking, immigrant communities)
4. Age-specific segments (parents with young kids, active retirees)
5. Multi-city expansion

---

## Revenue Model: Free for Users, SaaS for Organizers

### Our Philosophy
> "Free for users to discover. Affordable for organizers to reach the right audience."

**End Users**: Always free
- Capture preferences once
- Receive matching event notifications
- No paywall for discovery

**Organizers**: Freemium SaaS

| Tier | Monthly Fee | Features | Best For |
|------|-------------|----------|----------|
| **Free** | $0 | 3 events/mo, basic reach analytics | Occasional organizers |
| **Starter** | $19 | Unlimited events, advanced reach analytics, priority matching | Regular local businesses |
| **Pro** | $49 | Unlimited + demographic insights, notification prioritization, API access | Professional organizers |
| **Enterprise** | $199 | White-label, dedicated matching algorithm, account manager | Chains & platforms |

### Example: Language School (Starter Tier)
**Scenario**: Publishes Spanish conversation meetup

**Reach**:
- 2,400 users matched (Spanish speakers + learning interest + within 5 miles)
- 680 users notified immediately
- 145 users clicked through
- 42 users registered

**Monthly cost**: $19  
**Value**: Reached 2,400 targeted users instantly  
**Alternative**: Facebook ad spend of $200+ for similar reach, with no targeting precision

### Revenue Projections (Conservative)

| Year | End Users | Organizers | Monthly Revenue | Annual Revenue |
|------|-----------|------------|-----------------|----------------|
| 1 | 50,000 | 500 | $10,000 | $120K |
| 2 | 250,000 | 2,000 | $50,000 | $600K |
| 3 | 1,000,000 | 6,000 | $180,000 | $2.16M |

**Note**: Projections based on organizer subscriptions. Additional revenue potential: sponsored placements, premium user features, affiliate partnerships.

---

## Competitive Position

### Why We Will Win

| Competitor | Their Model | Their Weakness | Our Advantage |
|------------|-------------|----------------|---------------|
| **Eventbrite** | Search-based discovery | Users must actively search; poor matching | Proactive notifications based on preferences |
| **Meetup** | Group-based model | Requires joining groups; no smart matching | Preference-based subscription; no group required |
| **Facebook Events** | Social graph | Reaches friends only; algorithm-driven | Reaches strangers based on preferences, not connections |
| **Nextdoor** | Hyper-local feed | Limited radius; no preference matching | Smart matching on demographics, language, interests |
| **Event listing sites** | Browse and search | Users must remember to check; outdated info | Real-time notifications; always current |
| **Local newsletters** | Email digests | Weekly only; curated by editor, not personalized | Real-time + personalized based on user preferences |

### Our Moat
1. **Preference data**: Rich user profiles create better matching than competitors
2. **Real-time speed**: Notifications within seconds, not days
3. **Two-sided network effects**: More users → more organizers → better matches
4. **Language & demographic focus**: Serves underserved communities others ignore
5. **Subscription mindset**: Users expect this model; competitors still use "search" paradigm

---

## Future Roadmap

### 12-Month Plan

**Months 1-3: Foundation**
- Complete real-time matching engine
- Launch push notification system (email + in-app)
- Onboard 1,000 beta users (dense urban market)
- Onboard 50 beta organizers
- Mobile-responsive web app optimization

**Months 4-6: Validation**
- 50,000 end users capturing preferences
- 200 active organizers
- 70%+ notification open rate
- Launch mobile app beta (iOS)
- First revenue milestone: $5K MRR

**Months 7-9: Growth**
- 250,000 end users
- 1,000 active organizers
- Launch "Featured Events" (sponsored placements)
- Multi-city expansion (3 markets)
- API access for integration partners
- Series A preparation

**Months 10-12: Scale**
- 500,000+ end users
- 3,000+ active organizers
- $30K MRR
- Advanced matching algorithms (ML-based)
- Partnerships with local media and business associations
- Team expansion to 20 people

### 3-Year Vision
- 5M+ end users capturing preferences
- 20,000+ active organizers
- $5M+ ARR
- 50+ team members
- 25+ US markets
- Profitable, sustainable business or strategic acquisition target

---

## Who We're Looking For

### Founding Team Gaps

We are currently 2-3 founders with strong technical backgrounds. We need:

#### 1. Head of Growth / User Acquisition
**Responsibilities**:
- Drive end user acquisition (preference capture is our key metric)
- Build brand awareness in target communities
- Content marketing (neighborhood guides, event recommendations)
- Partnerships with local media, community organizations
- Referral program design and optimization

**Ideal Profile**:
- 4+ years in growth marketing, preferably consumer/marketplace
- Experience with zero-budget growth hacking
- Strong writing and local community knowledge
- Data-driven with expertise in activation and retention
- Passion for solving discovery problems

**Compensation**: Competitive equity (2-5%) + modest salary post-funding

#### 2. Head of Matching Algorithm / Data Science
**Responsibilities**:
- Build and optimize the matching engine (events ↔ users)
- Implement real-time notification delivery
- Analyze match quality and notification effectiveness
- Improve matching based on engagement data
- A/B testing framework for matching quality

**Ideal Profile**:
- 4+ years in data science or recommendation systems
- Experience with real-time matching systems
- Python, SQL, and preferably some ML background
- Strong product intuition for what makes a "good match"
- Experience with notification systems and engagement optimization

**Compensation**: Competitive equity (2-4%) + competitive salary

#### 3. Full-Stack Engineer (Infrastructure Focus)
**Responsibilities**:
- Scale matching engine for real-time performance
- Build notification infrastructure (email, push, SMS)
- Optimize database queries for geographic and preference matching
- Ensure sub-second matching latency as we scale
- Maintain developer experience and code quality

**Ideal Profile**:
- 4+ years in full-stack development
- React/TypeScript + Python (FastAPI) experience
- PostgreSQL optimization, geospatial queries
- Experience with high-throughput notification systems
- Comfort with infrastructure decisions

**Compensation**: Competitive equity (1-3%) + competitive salary

#### 4. Head of Product (Consumer Focus)
**Responsibilities**:
- Product roadmap prioritization
- End user research (preference capture, notification preferences)
- UX for both sides of the marketplace
- Matching quality metrics and improvement
- Retention and engagement optimization

**Ideal Profile**:
- 4+ years in product management, preferably consumer
- Experience with subscription or feed-based products
- Technical background (can read code, understand architecture)
- Customer-obsessed with relentless attention to detail
- Experience with notification UX and preference management

**Compensation**: Competitive equity (2-4%) + modest salary post-funding

### Culture Fit

We value:
- **Relentless execution**: Ideas are cheap; shipping is gold
- **Customer obsession**: We talk to users daily, understand their discovery frustrations, obsess over match quality
- **Data-driven decisions**: Every matching algorithm change is measured by engagement
- **Frugality**: We build lean until revenue justifies investment
- **Speed**: Perfect is the enemy of shipped
- **Transparency**: Open metrics, open challenges, open wins
- **Speed of matching**: We obsess over milliseconds of latency in notification delivery

We are not:
- A "lifestyle business" — we aim for scale or significant outcome
- A remote-only team — we believe hybrid/in-person collaboration accelerates early-stage work
- A 9-to-5 operation — startups require flexibility and dedication
- Corporate — we move fast, wear many hats, and learn by doing

---

## The Opportunity for You

### Why Join Now?

**1. Early Equity**
- Joining at founder level means significant equity (1-5%)
- At $50M exit (conservative for successful SaaS), that's $500K-$2.5M
- At $200M exit (realistic for category leader), that's $2M-$10M

**2. Shape the Product**
- Not joining a company with established processes
- Your fingerprints on the core product, brand, and culture
- Direct line to customers from day one

**3. Learn by Doing**
- No established playbook — we write it together
- Exposure to fundraising, hiring, product-market fit
- Build skills that transfer to any future startup

**4. Meaningful Impact**
- Help local businesses survive and thrive
- Transform how people discover local experiences
- Build something that doesn't exist yet

### What We Offer

| Component | Current Stage | Post-Series A |
|-----------|---------------|---------------|
| **Base Salary** | Modest (cover living expenses) | Market rate |
| **Equity** | 1-5% (founding team level) | 0.1-0.5% (employee level) |
| **Title** | Founder/Head of X | VP of X |
| **Benefits** | Minimal | Full benefits |
| **Autonomy** | Total | High |
| **Impact** | Foundational | Significant |

### The Trade-off

We are honest about the risk:
- **90% of startups fail** — this may not work
- **Early-stage means uncertainty** — priorities shift, features pivot
- **Equity is illiquid** — may be years before any payout
- **Hard work** — weekends, evenings, relentless pressure

But for the right person, the upside — financial, learning, impact — is unmatched.

**Why this could work**:
- Large, growing market (people want experiences, not more stuff)
- Clear differentiation (proactive notification vs. reactive search)
- Validated pain point (everyone has missed an event they would have loved)
- Proven model in other verticals (Netflix, Spotify, TikTok all use preference-based delivery)
- Early traction (beta users love the "set it and forget it" discovery model)

---

## Next Steps

If this excites you, here's how to explore further:

1. **Product Demo**: We'll walk you through the preference capture and matching system
2. **User Research**: Review recordings of user interviews about discovery pain points
3. **Matching Algorithm Walkthrough**: Understand how we match events to user preferences
4. **Founder Dinner**: Meet the team, ask hard questions
5. **Trial Project**: 2-week paid project to assess fit (e.g., optimize matching algorithm or build notification system)
6. **Reference Calls**: Talk to our advisors and early beta users



---



### Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI (Python), Supabase (PostgreSQL)
- **Authentication**: Supabase Auth, Google OAuth
- **Mobile**: React Native (planned)
- **Infrastructure**: Vercel, Railway/Render, Supabase


**Ready to make sure every person discovers every event that's perfect for them?**

Let's talk.

---
