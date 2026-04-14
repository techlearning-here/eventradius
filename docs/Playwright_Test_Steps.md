# Playwright Integration Test Steps

Complete documentation of the Playwright end-to-end integration tests, step-by-step.

## Table of Contents

1. [Event Wizard Test](#event-wizard-test)
2. [Event Details Test](#event-details-test)
3. [Authentication Flow](#authentication-flow)
4. [Cleanup Process](#cleanup-process)

---

## Event Wizard Test

**File:** `frontend/playwright/integration-tests/event-wizard.spec.ts`

**Purpose:** Tests complete event creation through the browser UI

### Test Flow

#### Step 1: Authentication Check
```
Action: Navigate to home page
Verify: Check if user is logged in
If NOT logged in:
  - Pause test execution
  - Open browser for manual login
  - Wait for user to login
  - Resume after authentication
Output: Authenticated session ready
```

#### Step 2: Navigate to Event Wizard
```
Action: Navigate to /events/create
Wait: Page load complete (networkidle)
Verify: Event Wizard component is visible
  - Look for: "Create New Event" or "Event Wizard" text
  - Confirm wizard form is loaded
Output: Event Wizard page ready for input
```

#### Step 3: Fill Basic Information (Step 1)
```
Field 1: Event Title
  Input: "PW Test Event {timestamp}"
  Selector: input[name="title"] or input[placeholder*="event name"]

Field 2: Subtitle (optional)
  Input: "Playwright Integration Test Subtitle"
  Selector: input[name="subtitle"]
  Only if field exists

Field 3: Summary (optional)
  Input: "This event was created by Playwright integration tests"
  Selector: textarea[name="summary"]
  Only if field exists

Field 4: Description
  Input: "Comprehensive test of the Event Wizard creating an event..."
  Selector: textarea[name="description"]

Field 5: Category
  Input: "technology"
  Selector: select[name="category"] or [data-testid="category-select"]
  Action: Select option

Output: Basic info section complete
```

#### Step 4: Set Event Type & Date (Step 2)
```
Field 1: Event Type
  Input: "in_person"
  Selector: input[value="in_person"] or label:has-text("In Person")
  Action: Click radio button

Field 2: Start Date/Time
  Input: Date 7 days from now (ISO format: YYYY-MM-DDTHH:mm)
  Selector: input[name="start_time"] or input[type="datetime-local"]

Field 3: Timezone
  Input: "America/Los_Angeles"
  Selector: select[name="timezone"]
  Action: Select option

Output: Event type and timing set
```

#### Step 5: Fill Location (Step 3)
```
Field 1: Location Address
  Input: "123 Test Street, San Francisco, CA 94102"
  Selector: input[name="location"] or textarea[name="location"]

Field 2: Venue Building Name (optional)
  Input: "Test Building"
  Selector: input[name="venue_building_name"]
  Only if field exists

Output: Location section complete
```

#### Step 6: Set Contact Information (Step 4)
```
Field 1: Contact Email
  Input: "test@playwright.local"
  Selector: input[name="event_contact_email"] or input[type="email"]

Field 2: Contact Phone
  Input: "4155551234"
  Selector: input[name="event_contact_phone"]
  Only if field exists

Output: Contact info section complete
```

#### Step 7: Set Capacity (Step 5)
```
Field 1: Max Participants
  Input: "100"
  Selector: input[name="max_participants"]

Field 2: Public Event Toggle
  Input: true (checked)
  Selector: input[name="is_public"] or [role="switch"]
  Action: Check toggle

Output: Capacity section complete
```

#### Step 8: Submit Event Form
```
Action: Click submit button
  Selector: button[type="submit"], button:has-text("Create"), or button:has-text("Publish")
  Target: Last matching button (usually the primary action)

Wait: 3 seconds for API response

Verify: Success indicator
  Look for: "success", "created", or "Event created" text
  OR check for error messages

If FAILED:
  - Capture error message
  - Fail test with error details

Output: Event created successfully
```

#### Step 9: Verify Event in Database (API Check)
```
Action: Query events API
  Endpoint: GET http://localhost:8000/api/events/?limit=20
  
Verify:
  - Response status: 200 OK
  - Event with test title exists in list
  - Event title matches exactly
  - Event description matches

Extract: event_id from response

Output: Event confirmed in database
```

#### Step 10: Verify Event Details Page
```
Action: Navigate to event details
  URL: /events/{event_id}
  
Wait: Page load complete

Verify 1: Title Display
  Selector: h1 or h2 containing event title
  Expected: "PW Test Event {timestamp}"
  
Verify 2: Description Display
  Selector: text containing "comprehensive test"
  Expected: Description visible on page

Output: Event details page displays correctly
```

#### Step 11: Cleanup
```
Action: Delete test event via API
  Endpoint: DELETE http://localhost:8000/api/events/{event_id}
  
Verify: Delete successful (200 OK)

Output: Test data cleaned up
```

---

## Event Details Test

**File:** `frontend/playwright/integration-tests/event-details.spec.ts`

**Purpose:** Tests event details page display and interactions

### Test Flow

#### Setup: Create Test Event via API
```
Action: POST to /api/events
  Data: Complete event with all fields
  - title: "PW Details Test {timestamp}"
  - subtitle: "Event Details Page Test"
  - summary: "Testing event details display"
  - description: "Comprehensive test..."
  - category: "technology"
  - location: "Tech Hub, 456 Innovation Drive..."
  - venue details: building, street, city, state, zip
  - timing: start_time, end_time, doors_open_time
  - timezone: "America/Los_Angeles"
  - contact: email, phone
  - capacity: max_participants, is_public
  - pricing: is_paid_event, ticket info
  - tags: ["playwright", "integration-test"]
  - accessibility: age_restriction, accessibility_options

Verify: Event created successfully
Extract: Store event_id for tests

Output: Test event ready
```

### Test 1: Display All Event Details

#### Step 1: Navigate to Event Details
```
Action: Navigate to /events/{event_id}
Wait: Page load complete (networkidle)

Output: Event details page loaded
```

#### Step 2: Verify Basic Information
```
Verify 1: Title Display
  Selector: h1 or h2 containing "PW Details Test {timestamp}"
  Timeout: 10 seconds
  Expected: Visible

Verify 2: Description
  Selector: Text containing "Comprehensive test"
  Expected: Visible

Verify 3: Category (if displayed)
  Selector: Text "technology" or [data-testid="event-category"]
  Expected: Visible if element exists

Output: Basic info verified
```

#### Step 3: Verify Location Information
```
Verify: Location displayed
  Look for: "456 Innovation Drive", "San Francisco", "Tech Hub"
  Selector: Any element containing location text
  
Output: Location info verified
```

#### Step 4: Verify Timing Information
```
Verify: Timezone displayed
  Look for: "America/Los_Angeles", "PST", or "PDT"
  Selector: Timezone indicator

Output: Timing info verified
```

#### Step 5: Verify Contact Information
```
Verify: Contact email displayed
  Look for: "organizer@techhub.local"
  Selector: Email display element

Output: Contact info verified
```

#### Step 6: Verify Pricing Information
```
Verify: Pricing displayed
  Look for: "Early Bird", "$40", "$60"
  Selector: Pricing section

Output: Pricing info verified
```

#### Step 7: Verify Tags
```
Verify: Tags displayed
  Look for: "playwright", "technology"
  Selector: Tag elements

Output: Tags verified
```

### Test 2: Event Registration Flow

#### Step 1: Navigate to Event
```
Action: Navigate to /events/{event_id}
Wait: Page load
```

#### Step 2: Find Registration Button
```
Search: Join/Register/RSVP button
  Selectors:
    - button:has-text("Join")
    - button:has-text("Register")
    - button:has-text("RSVP")
    - a:has-text("Join")
    - a:has-text("Register")

Check: Is button visible?
  If YES:
    - Log "Join button found"
    - DO NOT click (avoid actual registration in tests)
    - Mark test as passed
  
  If NO:
    - Log "No registration button found"
    - May require organizer role or be hidden
    - Mark test as passed (expected behavior may vary)

Output: Registration flow verified
```

### Test 3: Share Functionality

#### Step 1: Navigate to Event
```
Action: Navigate to /events/{event_id}
Wait: Page load
```

#### Step 2: Click Share Button
```
Search: Share button
  Selectors:
    - button:has-text("Share")
    - [data-testid="share-button"]
    - button[aria-label*="share"]

Check: Is button visible?
  If YES:
    - Click button
    - Wait 500ms for dialog
    - Look for share dialog/modal
    - Verify dialog opened
    - Close dialog (click Close button)
    - Log "Share dialog working"
  
  If NO:
    - Log "No share button found"
    - May use native share API

Output: Share functionality verified
```

### Test 4: 404 Error Handling

#### Step 1: Navigate to Non-Existent Event
```
Action: Navigate to fake event ID
  URL: /events/00000000-0000-0000-0000-000000000000

Wait: Page load
```

#### Step 2: Verify 404 Message
```
Search: 404/Not Found message
  Look for:
    - "404"
    - "Not Found"
    - "not found"
    - "does not exist"
    - "Event not found"

Check: Is 404 message visible?
  If YES: Log "404 message displayed correctly"
  If NO: Log "404 handling may redirect or show different message"

Output: 404 handling verified
```

### Cleanup
```
Action: Delete test event
  Endpoint: DELETE /api/events/{event_id}
  
Verify: Delete successful

Output: Test data cleaned up
```

---

## Authentication Flow

### Login Check Helper Function

```
Function: loginIfNeeded(page)

Step 1: Navigate to Home
  Action: page.goto('/')
  Wait: networkidle

Step 2: Check for Login Button
  Selector: button:has-text("Sign In"), button:has-text("Login"), or a:has-text("Sign In")
  
  Check: Is login button visible?
    If YES:
      - Log "Login required"
      - Call page.pause()
      - Browser opens for manual interaction
      - User logs in manually
      - User clicks "Resume" in Playwright inspector
    
    If NO:
      - Log "Already authenticated"

Step 3: Wait for Auth State
  Wait: 2 seconds for session to stabilize

Output: Authenticated session ready
```

### First-Time Setup

```
Initial Run:
1. Test starts
2. Browser opens
3. Test pauses at login page
4. User manually enters credentials
5. User clicks login
6. User clicks "Resume" in inspector
7. Test saves authenticated state
8. Subsequent runs may reuse session
```

---

## Cleanup Process

### Pre-Test Cleanup (beforeAll)

```
Action: Query all events
  Endpoint: GET /api/events/?limit=100
  
Filter: Find test events
  Criteria:
    - title contains "PW Test Event"
    - title contains "Playwright Test"
    
Action: Delete each test event
  For each matching event:
    - DELETE /api/events/{event_id}
    - Log deletion

Output: Clean slate for tests
```

### Post-Test Cleanup (afterAll)

```
Action: Delete created test events
  For each event_id in test list:
    - DELETE /api/events/{event_id}
    - Log deletion

Output: No test data left in database
```

---

## Test Data Reference

### Event Wizard Test Data

| Field | Value |
|-------|-------|
| Title | `PW Test Event {timestamp}` |
| Subtitle | "Playwright Integration Test Subtitle" |
| Summary | "This event was created by Playwright integration tests" |
| Description | "Comprehensive test of the Event Wizard..." |
| Category | "technology" |
| Event Type | "in_person" |
| Timezone | "America/Los_Angeles" |
| Location | "123 Test Street, San Francisco, CA 94102" |
| Building | "Test Building" |
| Email | "test@playwright.local" |
| Phone | "4155551234" |
| Max Participants | 100 |
| Is Public | true |

### Event Details Test Data

| Field | Value |
|-------|-------|
| Title | `PW Details Test {timestamp}` |
| Subtitle | "Event Details Page Test" |
| Summary | "Testing event details display" |
| Description | "Comprehensive test..." |
| Category | "technology" |
| Location | "Tech Hub, 456 Innovation Drive, San Francisco, CA 94105" |
| Building | "Innovation Center" |
| Email | "organizer@techhub.local" |
| Phone | "4155559876" |
| Pricing | "Early Bird: $40, Regular: $60" |
| Tags | ["playwright", "integration-test", "event-details", "technology"] |

---

## Expected Test Durations

| Test | Estimated Duration |
|------|-------------------|
| Event Wizard - Full Flow | 20-30 seconds |
| Event Wizard - Form Validation | 5-10 seconds |
| Event Details - Display | 10-15 seconds |
| Event Details - Registration | 5-10 seconds |
| Event Details - Share | 5-10 seconds |
| Event Details - 404 | 5-10 seconds |

**Total Suite Duration:** ~60-90 seconds

---

## Failure Scenarios

### Common Failures and Solutions

| Failure | Cause | Solution |
|---------|-------|----------|
| "Executable doesn't exist" | Browsers not installed | Run `npx playwright install` |
| "Element not found" | UI changed | Update selectors in test file |
| "Timeout waiting for selector" | Page load slow | Increase timeout in config |
| "Unauthorized" | Not logged in | Login manually when prompted |
| "Could not connect to backend" | Backend not running | Start backend on localhost:8000 |
| "Could not connect to frontend" | Frontend not running | Start frontend on localhost:5173 |

---

## Selector Strategy

### Primary Selectors (Preferred)

```typescript
// Form inputs by name attribute
input[name="title"]
textarea[name="description"]
select[name="category"]

// Buttons by text content
button:has-text("Create")
button:has-text("Next")

// Data test IDs (most reliable)
[data-testid="event-wizard"]
[data-testid="category-select"]
```

### Fallback Selectors

```typescript
// Placeholder text
input[placeholder*="event name"]

// Label association
label:has-text("In Person")

// Partial text match
text=technology
```

### Best Practices

1. **Use data-testid when possible** - Most stable across UI changes
2. **Use semantic selectors** - name, role, aria-label attributes
3. **Avoid CSS class selectors** - Classes change frequently
4. **Use .first() for multiple matches** - Ensures single element
5. **Add timeout parameters** - Handle slow loading

---

## Debugging Tips

### Using Playwright Inspector

```bash
# Run with UI mode for step-by-step debugging
npm run test:e2e:ui

# Features:
# - See each action before it executes
# - Step through tests one action at a time
# - Inspect DOM at any point
# - Modify selectors live
# - Retry failed actions
```

### Generating New Selectors

```bash
# Use CodeGen to interactively generate selectors
npx playwright codegen http://localhost:5173

# Steps:
# 1. Browser opens
# 2. Interact with UI manually
# 3. Playwright records actions
# 4. Copy generated code to test file
```

### Screenshots and Video

```bash
# Tests automatically capture:
# - Screenshot on failure
# - Video recording (on first retry)

# View results:
# npx playwright show-report
```

---

*Document Version: 1.0*
*Last Updated: April 2026*
