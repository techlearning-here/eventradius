
Build a responsive web application called "Event Pinger" with three user roles: Organizer, End User, and Admin. Only Organizers can post events; End Users can discover events based on demographics and preferences configured at signup; Admins manage and moderate the platform. end user can switch to the role of Organizer and organizor can also discover the events based on there preferences

Admin has site level access + organizers feature access
Organizor has add event previlage and end users feature access

Core concept: a hyper‑local event discovery platform where users see only events within a selected distance from their location, filtered by their interests and demographics.

Roles and permissions:

End User (normal user)

Can sign up, log in, and complete an onboarding flow.

During signup, they provide:

Basic demographics (e.g., age range, optional “have kids / no kids”, interests like kids/family, arts & culture, sports, social, classes, community).

Location (city/address or geolocation) and preferred distance range.

Can browse and search events, but cannot create or edit events.

Discovery is filtered by: distance from their location, their selected categories, and optional demographics (e.g., show only kid‑friendly if they indicated that).

After login, they can go to a Settings / Preferences page to edit their demographics, categories of interest, and distance range at any time.

Organizer

Can sign up and log in as an Organizer (separate role from End User).

Has access to an “Organizer Dashboard” where they can:

Create events with fields: title, description, address (geocoded), date/time, category, optional “kid‑friendly” toggle, price (free or amount), and tags.

See a list of their events and basic status (active, past, pending approval if needed).

Their events are visible to End Users whose location and preferences match (distance radius + categories/demographics).

Admin

Admin login with access to an “Admin Dashboard”.

Can view all users, all organizers, and all events.

Can approve/reject or deactivate events, and optionally suspend users/organizers.

Can edit basic site settings (e.g., default distance options, default categories).

Main pages and flows:

Public landing page

Explains the platform and has CTAs: “Discover events” (End User signup) and “Post events” (Organizer signup).

Authentication

Email/password signup and login with role selection: End User or Organizer.

Admin seeded manually or via config.

End User flow

Onboarding wizard on first login to capture demographics, interests, location, and distance range.

Event discovery page showing only events within the selected distance and matching interests.

Filters for date range and categories on top of the page.

Settings page to update demographics, interests, and distance later.

Organizer flow

Organizer dashboard with event creation form and list of created events.

Admin flow

Admin dashboard to manage users, organizers, and events, and to moderate content.

Tech and design:

Clean, modern, mobile‑first UI.

Use a relational schema with Users (including role), UserPreferences, Events, and any admin metadata.

Implement correct distance‑based filtering so only events within the user’s chosen radius are shown.


Extend the existing Event Pinger web application with the following features:

Two event types: Standard Event and Preview Event, with Preview → Standard conversion

Event Spaces and event status transitions

Participation buttons and interest/going counts for all events

Admin login with event approval, remarks, and logout

Please modify the current Event Pinger codebase and schema rather than creating a new project.

1. Event types: Standard vs Preview
Data model
Update the existing Event model to include:

eventType: "standard" or "preview"

eventStatus: "draft" | "collecting_interest" | "confirmed" | "completed"

If some of these fields already exist, align them to the behavior below.

Meaning of types
Standard Event

Default event type.

The event is already confirmed by the organizer.

Users can still mark “Interested / Going / Not going” to track their participation and for organizer insight.

Preview Event

Used when an organizer wants to test interest and coordinate before fully confirming.

Supports interest collection, attendee management, chat, and then conversion into a Standard Event once confirmed.

Organizer: Create / Edit Event
On the Create Event (and Edit Event) form:

Add an Event type section, with radio buttons (or dropdown):

Standard Event (default, pre‑selected)

Description: “Regular confirmed event, simple listing.”
Preview Event

Description: “Test interest first, confirm attendees, then it becomes a Standard Event.”
Behavior:

If Standard Event is selected:

Save eventType = "standard".

Set eventStatus = "confirmed" by default (subject to admin approval).

If Preview Event is selected:

Save eventType = "preview".

Set eventStatus = "collecting_interest" by default.

2. Event Space concept and transitions
Treat every event as having its own Event Space made up of:

The event record (Event)

The participant records (EventParticipant)

The chat messages (EventMessage)

Define and implement these phases for an Event Space:

Collecting Interest

Applies when eventType = "preview" and eventStatus = "collecting_interest".

Users can mark “Interested / Going / Not going”.

Organizer can see interest and going counts, and use chat to coordinate.

Confirmed Standard

When the organizer clicks “Confirm & Convert to Standard Event” on a Preview Event:

Set eventType = "standard".

Set eventStatus = "confirmed".

Keep all EventParticipant records and all EventMessage history.

After conversion, the Event Space behaves like a Standard Event but still has chat available for organizer + Going users.

Completed / Archived

After the event’s end time passes, automatically set eventStatus = "completed".

Event Space becomes read‑only: no new messages, but organizer and attendees can still view past messages and details under “Past Events”.

Use the existing models (or create them if missing):

EventParticipant

Fields: id, eventId, userId, status: "interested" | "going" | "not_going", createdAt, updatedAt.
EventMessage

Fields: id, eventId, senderUserId, messageText, createdAt.
3. Participation and counts (Standard & Preview)
Event detail (End User)
For all events (Standard and Preview), when a logged‑in End User opens the Event detail page:

Show participation buttons:

“Interested”

“Going”

“Not going”

Clicking one:

Creates or updates the EventParticipant record for this (user, event) with the chosen status.

Highlight the selected button so the user sees their current status.

Specifics per type:

Standard Event

Already confirmed.

Participation is for tracking and visibility; it does not change event status.

Preview Event

During collecting_interest, users can set any of the three states.

After the organizer confirms and converts it to Standard Event, the event is treated as confirmed but existing participation remains.

Counts on cards and detail
For all events:

Calculate counts:

interestedCount = number of EventParticipants with status = "interested".

goingCount = number with status = "going".

On the event card in discovery lists, show something like:

“👍 Interested: X · ✅ Going: Y”
On the event detail page, also show these counts near the title or under date/time.

Organizer dashboard (Preview management)
For events with eventType = "preview":

Show:

Current eventStatus badge: collecting_interest / confirmed / completed.

Counts: “Interested: X · Going: Y”.

Lists of users in each state (basic table or list is enough).

Provide a button when eventStatus = "collecting_interest":

“Confirm & Convert to Standard Event”

On click:

Set eventType = "standard".

Set eventStatus = "confirmed".

Keep all EventParticipants and EventMessages.

Afterward, it behaves like a Standard Event while preserving chat and participant data.

4. Event chat (Event Space communication)
Implement event‑level chat mainly for events that originated as Preview Events.

Visibility and posting rules
On the Event detail page:

If the event started as a Preview Event (you can check original eventType or simply allow chat for any event with a non‑null chat history) AND eventStatus is in "collecting_interest" or "confirmed":

Show an Event Chat section.
Posting rules:

The Organizer of the event can post messages.

Any End User with EventParticipant.status = "going" for this event can post messages.

Show messages with: sender name, timestamp, messageText.

No real‑time websockets required; a simple request/response and page refresh is sufficient for MVP.

After completion
When eventStatus = "completed":

Make the chat read‑only (no new messages).

Keep it visible under a “Past Events” section for organizers and going attendees.

5. Admin login, approval, remarks, and logout
Admin authentication
Create a separate Admin login page (URL/endpoints distinct from normal user/organizer login):

Hard‑code a single admin for now:

Username: eventadmin

Password: complexPassword123

On successful login:

Start an admin session.

Redirect to Admin Dashboard.

On all Admin pages:

Show a Logout button in the header or side navigation.

Logout should clear the admin session and redirect back to the Admin login page.

Event approval fields
Extend the Event model with:

approvalStatus: "pending_approval" | "approved" | "rejected"

adminRemark: text, optional, stores the latest admin remark for the approval decision.

When an Organizer creates any event (Standard or Preview):

Set approvalStatus = "pending_approval" by default.

Events with pending_approval must NOT appear in End User discovery/search until approved.

Admin Dashboard – Event approvals
In the Admin Dashboard, add sections/tabs:

Pending Events (default)

List all events where approvalStatus = "pending_approval".

Show: title, organizer name/email, eventType, eventStatus, date/time, category, createdAt.

Provide a “View details” link for each.

Approved Events

List events where approvalStatus = "approved", show adminRemark.
Rejected Events

List events where approvalStatus = "rejected", show adminRemark.
Approve / Reject with remarks
In the Admin event detail view for a pending event:

Show full event info plus current eventType, eventStatus, and approvalStatus.

Include:

A textarea labeled “Admin remark” (reason for approval or rejection).

Two buttons:

Approve

Reject

Behavior:

Approve:

Require the Admin remark (at least non‑empty).

On confirm:

Set approvalStatus = "approved".

Save adminRemark.

Approved events now become visible in End User discovery (subject to existing filters like time, distance, preferences).

Reject:

Require the Admin remark.

On confirm:

Set approvalStatus = "rejected".

Save adminRemark.

Keep event hidden from End User discovery.

Organizer visibility of approval
In Organizer dashboards and event detail pages:

Show the event’s approvalStatus and adminRemark, e.g.:

“Status: Pending approval”

“Status: Approved – Remark: <text>”

“Status: Rejected – Remark: <text>”

Rejected events remain visible to the Organizer (with the remark), but not to End Users.

6. General notes
Keep all UI mobile‑first and consistent with the existing Event Pinger design.

Ensure the following flows work end‑to‑end:

Organizer creates an event, chooses Standard Event (default) or Preview Event.

Event is created with approvalStatus = "pending_approval".

Admin logs in as eventadmin / complexPassword123, reviews pending events, and approves or rejects each with a remark.

Approved events appear in End User discovery, filtered by location, distance, and preferences.

End Users (for any event) can mark “Interested / Going / Not going”, and see counts on cards and detail.

For Preview Events, organizers can manage interest, then Confirm & Convert to Standard Event, and use Event Chat with going attendees until the event is completed and archived.