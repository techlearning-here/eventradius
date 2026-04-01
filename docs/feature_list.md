Conceptual overview (roles, Standard vs Preview, event space, admin model): **`docs/features-learning-guide.md`**.  
Full original spec: `docs/Website_Prompt.md`. Category / vertical roadmap: `docs/Feature_plan.md`.

---

### Authentication & Roles
- [x] Email/password signup & login (via AuthSheet component)
- [x] Email auto-confirm enabled
- [x] Three roles: admin, organizer, user (stored in `user_roles` table; `UNIQUE (user_id, role)` allows **both** `user` and `organizer` for one account)
- [x] Role-based routing and access control (`useAuth`: `role`, `roles`, `setActiveRole`, `hasUserRole` / `hasOrganizerRole`, `canSwitchRole`)
- [x] **Active UI mode** when both roles exist: Discover vs Organize — persisted in **`localStorage`** (`eventradius_active_role`); `RoleSwitcher` in navbar (hidden for admins)
- [x] Auto-creation of profiles, user_roles, user_preferences on signup (DB trigger `handle_new_user`)
- [x] Sign out functionality
- [x] **Admin access:** Supabase Auth + `admin` role in `user_roles` (not hardcoded credentials from the old spec)
- [x] **RLS:** policy `Users can add complementary user or organizer role` — authenticated user with exactly one `user`/`organizer` row may insert the other role (see `combined_migration.sql`)

### Onboarding (End User)
- [x] 3-step wizard: Demographics → Interests → Location
- [x] Age range selection
- [x] Has kids toggle
- [x] Interest/category selection (multi-select)
- [x] City selection with search (manual, from predefined US cities list)
- [x] Distance range slider
- [x] Saves to `user_preferences` table
- [x] `onboarding_completed` flag to prevent re-onboarding

### Event Discovery (End User)
- [x] Discover page with event cards grid
- [x] Distance-based filtering (Haversine formula, **client-side**)
- [x] Category/interest-based filtering from user preferences
- [x] Date filter via calendar popover
- [x] Category filter pills
- [x] Only shows **approved** events (pending hidden from discovery)
- [x] Event cards show title, date, time, location, image, event type badge
- [x] Participation counts on discovery cards (interested / going)

### Event Detail Page
- [x] Full event detail view (`/event/:id`)
- [x] Event header with background image
- [x] Countdown timer to event
- [x] Event meta info (date, time, type, status)
- [x] Event description
- [x] Event location display
- [x] Event registration button
- [x] Participation buttons (Interested / Going / Not Going)
- [x] Participation counts (updates when user changes status or reloads)
- [x] Event Chat (see rules below)
- [x] Auth prompt for unauthenticated users
- [x] SEO head with dynamic meta tags

### Event Types & Workflow
- [x] Two event types: **Standard** and **Preview** (`event_type` in DB)
- [x] Event lifecycle: `collecting_interest` (preview) → `confirmed` / ongoing handling → `completed` (plus approval `status` on events)
- [x] Preview → Standard conversion by organizer (preserves participants & chat)
- [x] Admin approval on events: pending / approved / rejected / deactivated (+ `admin_remark`)

### Event Creation (Organizer)
- [x] Create event form with validation (Zod schema)
- [x] Fields: name, date range, time range, location (Google Places autocomplete), description
- [x] Event type selection (Standard / Preview)
- [x] Category selection
- [x] Kid-friendly toggle
- [x] Price field
- [x] Background image URL
- [x] Tags input
- [x] City auto-detection from address
- [x] Lat/lng extraction from Google Places
- [x] New events created **pending** until admin approves

### Event Editing (Organizer)
- [x] Edit event page (`/event/:id/edit`)
- [x] Pre-populated form with existing event data

### Organizer Dashboard
- [x] List of organizer's own events
- [x] Event status badges (approval + event status)
- [x] Admin remark display on rejected events
- [x] Delete event functionality
- [x] Preview → Standard conversion action
- [x] Event status management (upcoming → ongoing → completed)

### My Events (End User)
- [x] Shows events user is registered for
- [x] Shows events user created
- [x] Tabbed view (Registered / Created)
- [x] Delete own events

### Admin Dashboard
- [x] Events tab with list of all events
- [x] Users tab with list of all users + roles
- [x] Status filter (all / pending / approved / rejected / deactivated)
- [x] Event detail review view with image, metadata, description
- [x] Approve / Reject with **mandatory** admin remark
- [x] Quick approve / deactivate actions from list
- [x] Role-based access (admin only)

### Event Participation
- [x] Interested / Going / Not Going buttons
- [x] Count display on cards and detail (not WebSocket-driven; updates on interaction / reload)
- [x] Toggle/switch status
- [x] Auth required prompt

### Event Chat
- [x] Messages loaded on open and after send (**fetch / refresh**; not Supabase Realtime channel)
- [x] Posting: organizer **or** participant with status **going** (per spec)
- [x] Chat section shown for preview-type / collecting-interest flows (see `EventDetailPage` logic)
- [x] Read-only mode when event is **completed**
- [x] Sender name display

### Event Registration
- [x] Register / Unregister for events (**separate** from participation Interested/Going/Not going — see learning guide §6)
- [x] Registration count display
- [x] Auth required prompt

### Settings Page
- [x] **Enable organizer** / **Enable discovery** — adds the missing `user_roles` row (and `user_preferences` when adding `user`) so one account can post and discover
- [x] Redirect unauthenticated visitors to `/auth`
- [x] Preference form (demographics, interests, city, distance) shown only when account has **`user`** role
- [x] Update demographics (age range, has kids)
- [x] Update interests
- [x] Update city & distance range
- [x] Pre-populated from existing preferences

### Landing Page
- [x] Hero section with CTA
- [x] Dual CTA: "Discover Events" (user) / "Post Events" (organizer)
- [x] **Post Events** when logged in: goes to `/organizer` if organizer role exists; otherwise **`/settings`** to enable organizer
- [x] Discover CTA sets active mode toward **user** when possible (`setActiveRole('user')`)
- [x] Feature highlights (location-based, categories, community)
- [x] Auth flow triggered from landing

### Navigation
- [x] Responsive navbar
- [x] **Role switcher** (Discover | Organize) when `canSwitchRole` (both `user` + `organizer` in DB, not admin)
- [x] **Dashboard** / **Settings** links shown when account has organizer and/or user role respectively (not only current UI mode)
- [x] Discover / Dashboard links optionally sync active mode when both roles exist
- [x] Role-aware navigation links
- [x] Auth state-aware (login/logout)

### SEO
- [x] SEOHead component with dynamic title & description
- [x] Applied across all pages

### Database Schema
- [x] `events` table with full fields (title, date, time, address, lat/lng, category, `event_type`, `event_status`, approval `status`, etc.)
- [x] `profiles` table
- [x] `user_roles` table with `app_role` enum (`UNIQUE (user_id, role)` — dual user+organizer supported)
- [x] `user_preferences` table (interests, city, distance, demographics)
- [x] `event_participants` table (interested / going / not_going)
- [x] `event_registrations` table
- [x] `event_messages` table (chat)
- [x] `site_settings` table
- [x] `has_role()` security definer function
- [x] `calculate_distance()` database function
- [x] RLS policies on tables (including complementary second-role insert on `user_roles`)

---

## Pending / Not Yet Implemented Features

### Authentication & Security
- [ ] Email verification flow (currently auto-confirmed)
- [ ] Password reset / forgot password
- [ ] Social login (Google, Facebook, etc.)
- [ ] Session refresh / token expiration handling
- [ ] Rate limiting on auth endpoints

### User Experience
- [ ] Profile page (view/edit display name, avatar, bio)
- [ ] Avatar/profile picture upload
- [ ] Push notifications for event updates
- [ ] Email notifications (event reminders, approval status, new events matching preferences)
- [ ] Dark mode toggle (theme support exists but no toggle UI)
- [ ] Skeleton loading states on all pages
- [ ] Empty state illustrations
- [ ] Pagination on discover page (currently limited to 1000 rows)
- [ ] Infinite scroll or load more

### Event Discovery Enhancements
- [ ] Search bar (text search for events by title/description)
- [ ] Map view for discovering events
- [ ] Sort options (date, distance, popularity)
- [ ] Save/bookmark events
- [ ] Share event (social sharing / copy link)
- [ ] Trending/popular events section
- [ ] "Events near me" using browser geolocation
- [ ] Server-side distance filtering (PostGIS or DB function; `calculate_distance()` exists but discovery is client-side)

### Event Management
- [ ] Recurring events
- [ ] Multi-day events
- [ ] Event capacity / max attendees
- [ ] Waitlist when capacity is full
- [ ] Event image upload (currently URL-based, no file upload)
- [ ] Multiple event images / gallery
- [ ] Event co-organizers
- [ ] Duplicate/clone event
- [ ] Event cancellation with notification to attendees

### Organizer Features
- [ ] Organizer profile / public page
- [ ] Organizer analytics (views, registrations, engagement)
- [ ] Attendee list export (CSV)
- [ ] Communication tools (broadcast message to attendees)
- [ ] Organizer verification / badge

### Admin Features
- [ ] Dashboard analytics (total events, users, registrations over time)
- [ ] Bulk approve/reject events
- [ ] User ban / suspension
- [ ] Promote/demote user roles from admin UI
- [ ] Content moderation for chat messages
- [ ] Platform-wide announcements
- [ ] Audit log
- [ ] Reported events / flagging system

### Chat & Social
- [ ] **Supabase Realtime** subscriptions for chat (replace fetch-only)
- [ ] Media sharing in chat (images, links)
- [ ] Chat message reactions
- [ ] Direct messaging between users
- [ ] Event reviews / ratings post-event

### Payments & Monetization
- [ ] Paid events with Stripe integration
- [ ] Ticket types (early bird, VIP, etc.)
- [ ] Refund management
- [ ] Organizer payouts

### Technical & Infrastructure
- [ ] PWA support (installable, offline-capable)
- [ ] Image optimization / CDN for event images
- [ ] Error boundary components
- [ ] Comprehensive form validation across all forms
- [ ] Broader unit & integration test coverage
- [ ] CI/CD: **GitHub Actions** present for backend/frontend; expand deploy & coverage as needed
- [ ] Performance monitoring / analytics
- [ ] Accessibility audit (WCAG compliance)
- [ ] i18n / multi-language support

### Future product (from Feature_plan / learning guide §9)
- [ ] Richer **category taxonomy** and marketing for verticals (cinema, dining off-peak, fitness, etc.)
- [ ] **Proactive / “smart” notifications** (preferences + time + radius) — overlaps UX notifications above
- [ ] **Last-minute deals** UX for perishable slots or inventory-style offers
