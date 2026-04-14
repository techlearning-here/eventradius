# Frontend Playwright Integration Tests

Dedicated runner for Playwright browser-based E2E tests.

## Why Separate?

Playwright tests are **NOT** included in the main `run-manual-tests.sh` because:
- They open a real browser window
- They may require manual login
- They take longer to run (20-30s per test vs 1-3s for API tests)
- They're interactive and may need human intervention

## Quick Start

```bash
# Run all Playwright tests (headless)
./scripts/FE_Integration_tests/run_FE_Playwright_test.sh

# Run with visible browser
./scripts/FE_Integration_tests/run_FE_Playwright_test.sh --headed

# Run with interactive UI mode (for debugging)
./scripts/FE_Integration_tests/run_FE_Playwright_test.sh --ui
```

## Prerequisites

1. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

2. **Start backend:**
   ```bash
   cd backend && uv run uvicorn main:app --reload --port 8000
   ```

3. **Start frontend:**
   ```bash
   cd frontend && npm run dev
   ```

## Usage Options

| Option | Description |
|--------|-------------|
| `--headed` | Run with visible browser window |
| `--ui` | Run with interactive UI mode (for debugging) |
| `--debug` | Run in debug mode (step through each action) |
| `--wizard` | Run only Event Wizard tests |
| `--details` | Run only Event Details tests |
| `--help` | Show help message |

## Examples

### Run all tests headless (default)
```bash
./scripts/FE_Integration_tests/run_FE_Playwright_test.sh
```

### Run with visible browser
```bash
./scripts/FE_Integration_tests/run_FE_Playwright_test.sh --headed
```

### Run with interactive UI (great for debugging)
```bash
./scripts/FE_Integration_tests/run_FE_Playwright_test.sh --ui
```

### Run only Event Wizard tests
```bash
./scripts/FE_Integration_tests/run_FE_Playwright_test.sh --wizard
```

### Run Event Details with visible browser
```bash
./scripts/FE_Integration_tests/run_FE_Playwright_test.sh --headed --details
```

## What Tests Run

Located in `frontend/playwright/integration-tests/`:

| Test File | What It Tests |
|-----------|---------------|
| `event-wizard.spec.ts` | Complete event creation through browser UI |
| `event-details.spec.ts` | Event details page display and interactions |

## Test Flow

### Event Wizard Test
1. Check authentication (pauses for login if needed)
2. Navigate to Event Wizard
3. Fill all form steps (Basic Info, Type/Date, Location, Contact, Capacity)
4. Submit the form
5. Verify event created in database
6. Navigate to event details page
7. Verify all data displays correctly
8. Cleanup test event

### Event Details Test
1. Create test event via API
2. Navigate to event details page
3. Verify all fields display (title, description, location, timing, pricing, tags)
4. Test registration button
5. Test share functionality
6. Test 404 handling
7. Cleanup test event

## Authentication

The script will check if you're logged in:
- If logged in: Tests proceed automatically
- If not logged in: Browser opens and pauses for manual login
- Login once, then tests continue

## Troubleshooting

### "Backend is not running"
```bash
cd backend
uv run uvicorn main:app --reload --port 8000
```

### "Frontend dev server is not running"
```bash
cd frontend
npm run dev
```

### "Executable doesn't exist" (Playwright browsers not installed)
```bash
npx playwright install
```

### Tests pause at login every time
This is expected on first run. Login manually, then tests will continue.

### Want to see what's happening
Use `--headed` or `--ui` flags:
```bash
./scripts/FE_Integration_tests/run_FE_Playwright_test.sh --ui
```

## View Test Results

After tests complete:
```bash
cd frontend
npx playwright show-report
```

## Detailed Documentation

See [`/docs/Playwright_Test_Steps.md`](/docs/Playwright_Test_Steps.md) for complete step-by-step documentation of every test action.

## Compared to Other Test Types

| Test Type | Speed | How to Run |
|-----------|-------|------------|
| **Unit Tests** | <1s | `npm test` |
| **API Integration** | 1-3s | `npm run test:integration` |
| **Playwright E2E** | 20-30s | This script |

## CI/CD

These tests are **excluded from CI** because they:
- Require running frontend and backend
- Need real browser
- May require manual login

To include in CI, you'd need to set up automated authentication.
