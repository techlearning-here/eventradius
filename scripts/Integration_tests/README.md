# Integration Tests

This folder contains scripts to run manual integration tests.

## What are Manual Integration Tests?

These tests require:
- Backend server running on `localhost:8000`
- Real Supabase database connection
- Valid JWT authentication token

They are **NOT** run in CI/CD and are excluded from automated test runs.

## Available Tests

### Backend Tests (`backend/tests/manual_IT/`)

| Test File | Purpose |
|-----------|---------|
| `test_real_db_roundtrip.py` | Tests full data flow: Frontend → API → DB → API → Frontend |
| `test_event_wizard_roundtrip.py` | Tests EventWizard data preservation (uses mocks) |
| `test_organizer_onboarding.py` | Tests complete organizer onboarding workflow |
| `test_soft_delete_restore.py` | Tests event recycle bin (soft delete/restore) functionality |
| `test_api.py` | Tests API endpoints (uses mocks) |
| `test_user_journey.py` | Tests complete user journeys (uses mocks) |

### Frontend API Tests (`frontend/src/__tests__/integration/`)

| Test File | Purpose |
|-----------|---------|
| `roundtrip.test.tsx` | Tests frontend API client → backend → database round-trip |
| `setup.ts` | Test utilities and configuration |

### Playwright E2E Tests (`frontend/playwright/integration-tests/`)

| Test File | Purpose |
|-----------|---------|
| `event-wizard.spec.ts` | Tests browser-based Event Wizard form submission |
| `event-details.spec.ts` | Tests browser-based Event Details page display |
| `playwright.integration.config.ts` | Playwright configuration |

📖 **Detailed Test Steps:** See [`/docs/Playwright_Test_Steps.md`](/docs/Playwright_Test_Steps.md) for complete step-by-step documentation.

⚠️ **Note:** Playwright tests are **NOT** run by this script. They require a separate runner:
```bash
./scripts/FE_Integration_tests/run_FE_Playwright_test.sh
```
See [`scripts/FE_Integration_tests/README.md`](scripts/FE_Integration_tests/README.md) for details.

## Prerequisites

1. **Backend running:**
   ```bash
   ./scripts/start-backend.sh
   ```

2. **Environment variables in `backend/.env`:**
   ```bash
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_service_key
   TEST_AUTH_TOKEN=your_jwt_token_here  # Required for real DB tests
   ```

3. **Get JWT Token:**
   - Login at http://localhost:5173
   - Open DevTools → Application → Local Storage
   - Find `sb-[project]-auth-token`
   - Copy the `access_token` value
   - Add to `backend/.env` as `TEST_AUTH_TOKEN`

## Running Tests

### Run all manual integration tests:
```bash
./scripts/Integration_tests/run-manual-tests.sh
```

### Backend Tests

Run specific backend test file:
```bash
cd backend
uv run pytest tests/manual_IT/test_real_db_roundtrip.py -v
```

Run with marker:
```bash
cd backend
uv run pytest -m manual -v
```

### Frontend API Tests (Jest)

Run all frontend API integration tests:
```bash
cd frontend
npm run test:integration
```

Run specific frontend test:
```bash
cd frontend
npm test -- src/__tests__/integration/roundtrip.test.tsx
```

Run with watch mode:
```bash
cd frontend
npm run test:integration:watch
```

### Playwright E2E Tests

Use the dedicated runner script (recommended):
```bash
# Run all tests headless
./scripts/FE_Integration_tests/run_FE_Playwright_test.sh

# Run with visible browser
./scripts/FE_Integration_tests/run_FE_Playwright_test.sh --headed

# Run with interactive UI mode
./scripts/FE_Integration_tests/run_FE_Playwright_test.sh --ui

# Run only Event Wizard tests
./scripts/FE_Integration_tests/run_FE_Playwright_test.sh --wizard

# Run only Event Details tests
./scripts/FE_Integration_tests/run_FE_Playwright_test.sh --details
```

Or use npm directly (requires services already running):
```bash
cd frontend

# Run all tests headless
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run with visible browser
npm run test:e2e:headed
```

## Troubleshooting

### Playwright Tests

#### "Error:Executable doesn't exist"
Browsers not installed. Run:
```bash
npx playwright install
```

#### Tests pause for login
Playwright tests will pause (`page.pause()`) when login is required. 
- The browser window will open
- Login manually through the UI
- Press "Resume" in the Playwright inspector to continue

#### Tests fail on element not found
The UI may have changed. Use Playwright CodeGen to update selectors:
```bash
npx playwright codegen http://localhost:5173
```

#### Want to see what's happening
Run with visible browser:
```bash
npm run test:e2e:headed
```

Or use UI mode for step-by-step debugging:
```bash
npm run test:e2e:ui
```

### General Troubleshooting

#### Test fails with "Cannot connect to backend"
- Ensure backend is running on localhost:8000
- Check `npm run dev` is running for frontend tests

#### Test fails with "Unauthorized"
- Login via frontend UI first
- Check localStorage has valid JWT token
- Run tests in same browser context

#### Test data persists in database
- Tests clean up created events automatically
- Check `cleanup_test_events` helper function
- Manual cleanup: Use Supabase dashboard

## CI/CD Exclusion

These tests are excluded from CI because they require:
- Running backend server
- Database connection
- User authentication

### Backend Tests Exclusion
- `pytest.ini`: `-m "not manual"` flag in addopts
- `pytestmark = pytest.mark.manual` in test files

### Frontend Tests Exclusion
- `jest.config.cjs`: `testPathIgnorePatterns` excludes `/src/__tests__/integration/`
- Separate config file: `jest.integration.config.cjs`
- Regular `npm test` skips integration tests

### Playwright Tests Exclusion
- Playwright tests in `playwright/integration-tests/` are separate from unit tests
- Config file: `playwright.integration.config.ts`
- Must be run explicitly with `npm run test:e2e`

To run all tests including manual (not recommended in CI):
```bash
# Backend
pytest -m manual

# Frontend API
npm run test:integration

# Frontend E2E (Playwright)
npm run test:e2e
```
