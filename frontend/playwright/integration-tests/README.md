# Playwright E2E Integration Tests

End-to-end browser tests that verify complete data flow:
**Browser UI → Frontend App → Backend API → Database → Backend API → Frontend Display**

📖 **Detailed Test Steps:** See [`/docs/Playwright_Test_Steps.md`](/docs/Playwright_Test_Steps.md) for complete step-by-step documentation of every test action, selector, and verification point.

## What These Tests Do

Unlike API integration tests, these tests:
- Launch a **real browser** (Chromium by default)
- Interact with **actual UI elements** (clicking buttons, filling forms)
- Navigate through **Event Wizard** like a real user
- Verify **data is displayed correctly** on Event Details pages
- Test the **complete user journey**

## Test Files

| File | Tests |
|------|-------|
| `event-wizard.spec.ts` | Complete event creation through wizard UI |
| `event-details.spec.ts` | Event details page display and interactions |

## Prerequisites

1. **Install Playwright browsers** (already done):
   ```bash
   npx playwright install
   ```

2. **Start all services:**
   ```bash
   # Terminal 1: Backend
   cd backend && uv run uvicorn main:app --reload --port 8000
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

3. **Login once** (Playwright will pause for manual login on first run)

## Running Tests

### Run all tests (headless):
```bash
cd frontend
npm run test:e2e
```

### Run with visible browser:
```bash
cd frontend
npm run test:e2e:headed
```

### Run with UI mode (interactive debugging):
```bash
cd frontend
npm run test:e2e:ui
```

### Run specific test file:
```bash
cd frontend
npx playwright test --config playwright.integration.config.ts event-wizard.spec.ts
```

### Debug mode (step through each action):
```bash
cd frontend
npm run test:e2e:debug
```

## Test Flow

### Event Wizard Test (`event-wizard.spec.ts`)

1. **Login Check** - Verifies user is authenticated (pauses if login needed)
2. **Navigate to Wizard** - Opens `/events/create`
3. **Fill Basic Info** - Title, subtitle, description, category
4. **Set Event Type & Date** - Type, timezone, start/end times
5. **Fill Location** - Address, venue details
6. **Set Contact Info** - Email, phone
7. **Set Capacity** - Max participants, public/private
8. **Submit Form** - Creates event
9. **Verify via API** - Checks event exists in database
10. **Verify Details Page** - Navigates to event page, confirms display
11. **Cleanup** - Deletes test event

### Event Details Test (`event-details.spec.ts`)

1. **Create Test Event** - Via API for consistent test data
2. **Navigate to Details** - Opens event page
3. **Verify All Info** - Title, description, location, timing, contact, pricing, tags
4. **Test Registration** - Verifies join/register button exists
5. **Test Share** - Opens share dialog
6. **Test 404** - Navigates to non-existent event
7. **Cleanup** - Deletes test event

## Authentication

Playwright tests handle authentication by:
- Checking for login button on page load
- If found, **pausing** (`page.pause()`) for manual login
- After login, tests continue automatically

**First time setup:**
1. Run tests: `npm run test:e2e`
2. Browser opens and pauses at login
3. Login with your credentials
4. Click "Resume" in Playwright inspector
5. Tests continue and save authenticated state

## Selectors

Tests use flexible selectors that work with your UI:
```typescript
// Form inputs
page.locator('input[name="title"], input[placeholder*="event name"]').first()

// Buttons
page.locator('button:has-text("Create"), button:has-text("Publish")').last()

// By text content
page.locator('text=technology').first()
```

If UI changes, update selectors or use CodeGen:
```bash
npx playwright codegen http://localhost:5173
```

## Configuration

Tests configured in `playwright.integration.config.ts`:
- **Base URL:** `http://localhost:5173`
- **Backend:** `http://localhost:8000`
- **Timeout:** 30s for navigation
- **Browser:** Chromium (add Firefox/Safari in config for cross-browser)
- **Retries:** 2 retries on CI, 0 locally
- **Screenshots:** On failure only
- **Video:** On first retry only

## Troubleshooting

### "Executable doesn't exist"
```bash
npx playwright install
```

### Tests pause at login every time
- Login once in headed mode
- Consider adding auth state saving to config

### Elements not found
- UI may have changed
- Use `npm run test:e2e:ui` to debug
- Update selectors in test file

### Slow tests
- Normal! Browser tests are slower than API tests
- API integration tests: ~1-3 seconds per test
- Playwright E2E tests: ~10-30 seconds per test

## CI/CD

These tests are **excluded from CI** because they require:
- Running backend
- Running frontend
- Real browser
- User authentication

To include in CI, you'd need to:
1. Start backend in CI
2. Start frontend in CI
3. Seed test database with test user
4. Generate test JWT token
5. Use headless browser

## Comparison: Test Types

| Test Type | Speed | Scope | Purpose |
|-----------|-------|-------|---------|
| **Unit Tests** | <1s | Function | Test individual functions |
| **API Integration** | 1-3s | API Layer | Test API client ↔ Backend |
| **Playwright E2E** | 10-30s | Full Stack | Test Browser ↔ UI ↔ API ↔ DB |

All three together provide complete test coverage!
