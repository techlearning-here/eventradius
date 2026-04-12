# Competitive Analysis: EventRadius vs Luma

**Date**: April 2026  
**Analyst**: Product Strategy Team  
**Status**: Deep-dive competitive assessment

---

## Executive Summary

Luma has emerged as a **major competitive threat** in the event discovery and management space. With 2M monthly event signups and 5x user growth (2023-2024), they've captured significant market share, especially in tech-centric communities. They are successful because they solved the **community calendar** and **beautiful event pages** problems elegantly.

**Key Finding**: Luma and EventRadius have significant overlap in core functionality, but different philosophical approaches. Luma focuses on **event creation and community building** while EventRadius aims for **proactive preference-based matching**.

---

## 📊 Luma At A Glance

| Metric | Value |
|--------|-------|
| **Monthly Event Signups** | 2 million |
| **User Growth (2023-24)** | 5x |
| **Pricing (Free)** | Unlimited events, 5% platform fee |
| **Pricing (Plus)** | $69/month ($59 annual), 0% platform fee |
| **Target Audience** | Tech-savvy organizers, Gen Z, Web3 communities |
| **Notable Customers** | NBA, Stripe, Alo |

---

## 🔍 Luma Feature Deep-Dive

### 1. Event Creation & Pages
| Feature | Luma Implementation | EventRadius Status |
|---------|---------------------|-------------------|
| **Beautiful Event Pages** | Pre-designed cover image gallery, pro aesthetics | ✅ Similar - Custom cover images, modern UI |
| **Custom Fields** | Easy to add custom questions | ✅ Similar - Comprehensive attribute system |
| **Event Categories** | Tech, AI, Food, Arts, Climate, Fitness, Wellness, Crypto | ✅ More comprehensive (9 categories, 50+ subcategories) |
| **Location/Maps** | Google Maps integration | ✅ Google Maps autocomplete |
| **Virtual/Hybrid** | Zoom auto-integration | ✅ Supported |

**Gap Analysis**: EventRadius has **more detailed attribute capture** (cultural, accessibility, demographics) but Luma has **faster, simpler event creation**.

### 2. Discovery & Distribution
| Feature | Luma Implementation | EventRadius Status |
|---------|---------------------|-------------------|
| **Browse by Category** | Category browsing (Tech, AI, Food, etc.) | ✅ Implemented |
| **Popular Events** | Location-based popular events | ✅ Similar |
| **Community Calendars** | **Subscribable calendars - subscribers get notified** | 🔄 In Development |
| **Featured Calendars** | Curated community calendars | ❌ Not yet implemented |
| **Email/SMS Invites** | Mass SMS + Email with calendar integration | ✅ Email planned |
| **QR Code Check-ins** | Built-in QR scanner | ❌ Not implemented |

**Critical Gap**: Luma's **Community Calendars** are a key differentiator. Users subscribe once, get notified of new events automatically. This is very similar to EventRadius's core "proactive notification" vision.

### 3. Ticketing & Payments
| Feature | Luma Implementation | EventRadius Status |
|---------|---------------------|-------------------|
| **Free Events** | Unlimited, no fee | ✅ Same |
| **Paid Events** | Stripe integration, next-day payouts | 🔄 Planned |
| **Platform Fee** | 5% (Free) / 0% (Plus) | TBD |
| **Payment Methods** | Credit cards, Apple Pay, Google Pay, **Crypto (SOL/USDC)** | ❌ Not planned |
| **Token Gating** | Web3 token-gated events | ❌ Not planned |
| **Donations** | Flexible donation options | ❌ Not planned |

**Gap Analysis**: Luma is winning the **Web3/crypto community** with token-gating and crypto payments. EventRadius has no plans here.

### 4. Community & Engagement
| Feature | Luma Implementation | EventRadius Status |
|---------|---------------------|-------------------|
| **Guest Chat** | Pre/post event messaging | ❌ Not implemented |
| **Guest Referrals** | Attendees can invite friends | ❌ Not implemented |
| **Post-Event Surveys** | Built-in feedback | ❌ Not implemented |
| **Past Guest Re-invite** | Easy re-invite to new events | ❌ Not implemented |
| **Guest List Display** | Configurable public/private | ❌ Not implemented |
| **Zapier Integration** | Automation workflows (Plus only) | ❌ Not implemented |
| **API Access** | Plus tier only | 🔄 Planned |

**Gap Analysis**: Luma has built a **community ecosystem** around events. EventRadius is more transactional (find event → attend).

### 5. Organizer Tools
| Feature | Luma Implementation | EventRadius Status |
|---------|---------------------|-------------------|
| **Analytics Dashboard** | Attendance and analytics (Free) | ✅ Planned |
| **Reminder Messages** | Automated reminders | ✅ Planned |
| **Waitlists** | Built-in waitlist management | ❌ Not implemented |
| **Capacity Management** | RSVP limits + waitlist | ✅ Basic capacity |
| **Multi-User Teams** | Enterprise tier | ❌ Not implemented |
| **5,000 Invites/Week** | Plus tier only | N/A |

---

## 🎯 Head-to-Head Comparison Matrix

| Capability | EventRadius | Luma | Advantage |
|------------|:-----------:|:----:|:---------:|
| **Proactive Notifications** | 🟢 Core feature | 🟡 Community calendars only | **EventRadius** |
| **Preference Matching** | 🟢 Rich attributes | 🔴 None | **EventRadius** |
| **Event Creation Speed** | 🟡 11-step wizard | 🟢 Fast, simple | **Luma** |
| **Beautiful Event Pages** | 🟢 Modern UI | 🟢 Modern UI | **Tie** |
| **Crypto/Web3** | 🔴 None | 🟢 Token-gating, SOL/USDC | **Luma** |
| **Community Features** | 🔴 Minimal | 🟢 Chat, referrals, surveys | **Luma** |
| **QR Check-ins** | 🔴 None | 🟢 Built-in | **Luma** |
| **Pricing Model** | 🟢 SaaS subscription | 🟢 Free + Plus tiers | **Tie** |
| **Dynamic Pricing** | 🟢 AI-powered | 🔴 Fixed only | **EventRadius** |
| **Cultural Attributes** | 🟢 Comprehensive | 🔴 None | **EventRadius** |
| **Accessibility** | 🟢 Detailed | 🔴 None | **EventRadius** |
| **Zapier/Integrations** | 🔴 None | 🟢 Plus tier | **Luma** |
| **Guest Referrals** | 🔴 None | 🟢 Viral growth | **Luma** |
| **Demographic Matching** | 🟢 Age, language, family | 🔴 None | **EventRadius** |

**Legend**: 🟢 Strong | 🟡 Partial | 🔴 Missing

---

## ⚠️ Key Threats from Luma

### 1. **Community Calendars = Proactive Discovery**
Luma's subscribable calendars achieve similar outcomes to EventRadius's notification vision:
- User subscribes to "SF AI Events" calendar once
- Gets notified automatically of new events
- **This is already live and working for 2M users/month**

**Threat Level**: 🔴 **HIGH** - They've validated the core value prop

### 2. **Web3/Crypto Community Lock-in**
Token-gating and crypto payments have made Luma the default for Web3 events:
- Crypto communities are highly engaged
- High-value events (NFT launches, token events)
- Network effects in this segment

**Threat Level**: 🟡 **MEDIUM** - Niche but high-value segment

### 3. **Viral Growth Mechanics**
Guest referrals and social features drive organic growth:
- Every attendee can become an evangelist
- Network effects compound over time
- Lower CAC than traditional marketing

**Threat Level**: 🟡 **MEDIUM** - EventRadius lacks viral loops

### 4. **Enterprise Traction**
Major brands (NBA, Stripe, Alo) using Luma:
- Social proof for B2B sales
- Enterprise feature development
- Revenue stability

**Threat Level**: 🟡 **MEDIUM** - EventRadius targeting different market

---

## ✅ EventRadius Advantages to Leverage

### 1. **Deep Preference Matching**
Luma has NO user preference system. EventRadius captures:
- 10 user attribute categories (demographics, culture, accessibility)
- 9 event attribute categories
- AI-powered matching (in development)

**Advantage**: Massive moat once matching engine is live

### 2. **Cultural & Inclusive Focus**
Luma ignores cultural context. EventRadius has:
- Religious/cultural celebration tags
- Dietary context (Halal, Kosher, Jain, etc.)
- Language-specific events with interpretation
- Accessibility requirements

**Advantage**: Serves underserved communities Luma ignores

### 3. **Dynamic Pricing (Planned)**
Luma only supports fixed pricing. EventRadius will offer:
- AI-powered yield management
- Perishable inventory optimization
- Automatic discount recommendations

**Advantage**: Unique in local event space

### 4. **SaaS vs Transaction Pricing**
Luma charges 5% per ticket (Free tier). EventRadius offers:
- Flat monthly subscription
- No penalty for success
- Predictable costs for organizers

**Advantage**: Better for high-volume organizers

---

## 🚀 Strategic Recommendations

### Immediate Actions (Next 30 Days)

| Priority | Action | Impact |
|----------|--------|--------|
| **P0** | **Implement Community Calendars** - Match Luma's core discovery feature | Critical gap closure |
| **P0** | **Add Guest Referral Feature** - Viral growth mechanism | Growth acceleration |
| **P1** | **Add QR Check-in** - Standard expectation for events | Feature parity |
| **P1** | **Simplify Event Creation** - Reduce wizard steps | Better UX |

### Short-Term (Next 90 Days)

| Priority | Action | Impact |
|----------|--------|--------|
| **P1** | **Launch Real-Time Matching Engine** - Core differentiator | Moat creation |
| **P2** | **Post-Event Surveys** - Community feedback loop | Engagement |
| **P2** | **Past Guest Re-invite** - Retention tool | Organizer retention |
| **P2** | **Zapier Integration** - Workflow automation | Power users |

### Medium-Term (Next 6 Months)

| Priority | Action | Impact |
|----------|--------|--------|
| **P2** | **Waitlist Management** - Better capacity handling | Organizer satisfaction |
| **P3** | **Guest Chat/Messaging** - Community building | Engagement |
| **P3** | **Mobile App** - Push notifications, QR check-in | User experience |
| **P3** | **Crypto Payments** - Web3 community access | Market expansion |

---

## 📈 Market Positioning Strategy

### Against Luma

**EventRadius Positioning**:
> "Luma helps you create beautiful events. EventRadius helps the right people find them."

**Key Differentiators to Emphasize**:
1. **"Set it and forget it"** - Users get notified automatically, no browsing required
2. **"Events for people like you"** - Cultural, language, accessibility matching
3. **"Fill every seat"** - Dynamic pricing + smart targeting
4. **"Your community, not theirs"** - Build your audience, not Luma's platform

### Target Segments Where We Win

| Segment | Why EventRadius Wins | Luma Weakness |
|---------|---------------------|---------------|
| **Cultural communities** | Language/religion matching | No cultural attributes |
| **Parents/Families** | Age-appropriate matching, family-friendly filters | No demographic targeting |
| **Accessibility needs** | Wheelchair, sensory-friendly filters | No accessibility features |
| **Professional organizers** | SaaS pricing, yield management | 5% transaction fee |
| **Cinemas/Fitness/Restaurants** | Dynamic pricing for perishable inventory | Fixed pricing only |
| **Older adults (50+)** | Age-specific matching | Gen Z focused |

### Target Segments Where Luma Wins

| Segment | Why Luma Wins | Our Gap |
|---------|--------------|---------|
| **Web3/Crypto** | Token-gating, crypto payments | No crypto support |
| **Tech meetups** | Community calendars, viral growth | No guest referrals |
| **Gen Z casual events** | Simple, fast, social | Complex wizard |
| **Enterprise brands** | NBA, Stripe using it | No enterprise tier |
| **Virtual events** | Zoom auto-integration | Manual setup |

---

## 🎓 Lessons from Luma's Success

### 1. **Simplicity Wins**
Luma's event creation is faster than EventRadius. Users can create an event in under 2 minutes. Our 11-step wizard captures more data but adds friction.

**Lesson**: Offer "Quick Create" mode alongside "Advanced" mode

### 2. **Community > Transactions**
Luma built community features (chat, referrals, calendars) that keep users engaged beyond individual events.

**Lesson**: Build ongoing relationships, not one-time transactions

### 3. **Viral Loops Work**
Guest referrals drive organic growth. Every attendee can invite friends.

**Lesson**: Add growth mechanics to every interaction

### 4. **Free Tier Converts**
Luma's free tier is genuinely useful (unlimited events), but 5% fee drives upgrades for paid events.

**Lesson**: Generous free tier + clear upgrade path = conversion

### 5. **Design Matters**
Luma's aesthetic appeal is a core selling point. "Beautiful event pages" is in their headline.

**Lesson**: Invest in design as a competitive advantage

---

## 🔮 Future Threat Scenarios

### Scenario 1: Luma Adds Preference Matching (Likelihood: Medium)
If Luma implements user preferences and proactive notifications, our core moat erodes.

**Mitigation**: 
- Build data moat with rich preference profiles
- Focus on AI matching quality
- Lock in organizers with SaaS pricing

### Scenario 2: Luma Expands to Cultural Communities (Likelihood: Low)
Luma currently ignores cultural context. If they add these features, they could capture our target market.

**Mitigation**:
- Move fast to capture language/cultural communities
- Build brand association with inclusivity
- Partner with cultural organizations

### Scenario 3: Luma Adds Dynamic Pricing (Likelihood: Medium)
If Luma implements yield management, we lose a key differentiator.

**Mitigation**:
- Patent/protect AI pricing algorithms
- Focus on perishable inventory verticals
- Build cinema/fitness/restaurant integrations

---

## 📋 Competitive Monitoring Checklist

Track these Luma developments monthly:

- [ ] New feature releases (check /changelog or blog)
- [ ] Pricing changes
- [ ] New enterprise customers
- [ ] Geographic expansion
- [ ] Category expansion (beyond Tech/AI/Crypto)
- [ ] Mobile app updates
- [ ] API/Integration additions
- [ ] Community calendar growth

---

## Conclusion

Luma is a **validated competitor** that has proven:
1. Users want proactive event discovery (community calendars)
2. Beautiful design drives adoption
3. Viral growth mechanics work in events
4. Free tier + usage-based pricing converts

**EventRadius must**:
1. Close the community calendar gap (P0)
2. Maintain preference matching leadership
3. Build viral growth features
4. Serve communities Luma ignores (cultural, accessibility, families)
5. Deliver dynamic pricing as promised

**Bottom Line**: Luma has validated the market. EventRadius needs to execute faster on differentiation while closing feature gaps.

---

*Document Version: 1.0*  
*Next Review: May 2026*  
*Owner: Product Strategy*
