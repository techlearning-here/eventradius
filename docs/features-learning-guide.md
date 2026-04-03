# EventRadius — features learning guide

This document distills **`Feature_plan.md`** (product vision, categories, future verticals) and **`Website_Prompt.md`** (functional spec for "Event Radius" / EventRadius). Use it to learn what the product is meant to do and how pieces fit together.

**Sources:** `docs/Feature_plan.md`, `docs/Website_Prompt.md`. For a shipped vs backlog checklist, see `docs/feature_list.md`.

---

## 1. What the product is

- **Hyper-local event discovery:** users see events within a **distance** from their location, filtered by **interests** and **demographics** (e.g. kid-friendly).
- **Two sides:** **Organizers** publish events; **End users** discover, register, and participate. **Admins** moderate the platform.
- **Roles:** End users can also act as organizers (organizers retain discovery based on their preferences). **Admin** has site-wide access plus organizer capabilities.

---

## 2. End user

- **Signup / login** (email/password in spec).
- **Onboarding:** demographics (age range, kids/no kids), **interest categories**, **location** (city/address or geolocation), **preferred distance**.
- **Discovery:** browse/search only within radius + matching categories; optional filters (e.g. kid-friendly).
- **Settings:** edit preferences and distance anytime.
- **Cannot** create or edit others’ events (unless they also have organizer role).

---

## 3. Organizer

- **Dashboard:** create events, see own events and status (including approval).
- **Event fields (typical):** title, description, geocoded address, date/time, category, kid-friendly, price, tags.
- **Visibility:** events appear to end users only when **location + preferences + distance** match—and after **admin approval** (see below).

---

## 4. Event types and lifecycle (Standard vs Preview)

| Concept | Meaning |
|--------|---------|
| **Standard** | Default confirmed listing; participation is for tracking/insight. |
| **Preview** | Organizer tests interest first; can **convert to Standard** when ready. |

**Model (spec):**

- `eventType`: `standard` \| `preview`
- `eventStatus`: e.g. `draft` \| `collecting_interest` \| `confirmed` \| `completed`

**Behavior:**

- **Standard:** default `eventType`; status effectively **confirmed** (still subject to admin approval before public discovery).
- **Preview:** `collecting_interest` while gathering interest; organizer runs **Confirm & convert to Standard** → `eventType = standard`, `eventStatus = confirmed`, **participants and chat history preserved**.

**Completed:** after end time, **completed**; event space becomes **read-only** for chat (messages visible historically).

---

## 5. Event Space (one space per event)

Each event ties together:

- The **event** row  
- **Participants** (`interested` / `going` / `not_going`)  
- **Chat messages** (for coordination)

**Participation (all event types):**

- Buttons: Interested, Going, Not going — one record per user per event; show **counts** on cards and detail.
- Standard: participation does not change event status.
- Preview: same states during `collecting_interest`; after conversion, participation stays.

**Chat (spec):**

- Shown for Preview flows while status is `collecting_interest` or `confirmed` (implementation may scope UI to preview-related events).
- **Post:** organizer **or** users with participation **going**.
- **Read-only** when `completed`.
- MVP: request/response + refresh is enough; live WebSockets optional.

---

## 6. Registration

- Separate from “going / interested”: users can **register** for events where that flow exists; spec ties registration + participation to visibility.

---

## 7. Admin moderation

**Approval model (spec):**

- `approvalStatus`: `pending_approval` \| `approved` \| `rejected`
- `adminRemark`: optional text; **required** on approve/reject in the spec flow.
- New events default to **pending**; **pending must not appear** in public discovery until **approved**.

**Admin dashboard:**

- Lists pending / approved / rejected; detail view; approve/reject with remark.
- Organizers always see their events, including **rejected** with remark.

**Note:** The original spec mentioned a **hardcoded** admin username/password. The **EventRadius app** typically uses **Supabase Auth** and an **`admin` role** in the database—see `feature_list.md` and the codebase, not the literal placeholder credentials.

---

## 8. Main pages (spec)

- Public **landing** with CTAs: discover vs post events.
- **Auth** with role selection (end user vs organizer).
- **Onboarding** wizard.
- **Discover** (filtered list).
- **Event detail** (meta, participation, registration, chat as applicable).
- **Organizer dashboard** + create/edit event.
- **Admin dashboard** (users, events, moderation).

**Design:** mobile-first, relational schema (users, preferences, events, participants, messages, admin metadata).

---

## 9. From Feature_plan: categories and future engine

**Product idea:** almost any **time-bound, location-bound** offering with a **capacity** or **offer** can be modeled as an event: category, **location**, **time window**, **audience** (age, family-friendly, interests), optional **offer type** (discount, bundle, early bird).

**Example taxonomy (roadmap):** movies & entertainment, kids & family, arts & culture, learning, sports, social, food & drink, shopping/local business, education/youth, faith, work/networking.

**Adjacent verticals (“perishable” capacity):** cinemas, restaurants (off-peak), fitness classes, salons, tours, small live shows—**fixed seats/slots**; revenue drops after the slot passes. Later: **last-minute deals** UX for inventory-style items (still: time + location + discount → match nearby users).

**Strategic wedge (examples):** restaurants off-peak, fitness/wellness slots, small live shows—same **yield** logic as cinema-style previews.

---

## 10. End-to-end flow (spec checklist)

1. Organizer creates Standard or Preview → **pending approval**.  
2. Admin approves or rejects **with remark**.  
3. **Approved** events appear in discovery (distance + preferences).  
4. Users set **Interested / Going / Not going**; counts show everywhere.  
5. For Preview: organizer manages interest, **converts to Standard**, chat with **going** users until **completed** and archived.

---

## 11. Related docs

| Doc | Use |
|-----|-----|
| `docs/features-learning-guide.md` | This summary |
| `docs/Website_Prompt.md` | Full original spec |
| `docs/Feature_plan.md` | Category / vertical / cinema-style expansion ideas |
| `docs/feature_list.md` | Implemented vs pending features |
