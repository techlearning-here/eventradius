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

### Frontend Tests (`frontend/src/__tests__/integration/`)

| Test File | Purpose |
|-----------|---------|
| `roundtrip.test.tsx` | Tests frontend API client → backend → database round-trip |
| `setup.ts` | Test utilities and configuration |

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

### Frontend Tests

Run all frontend integration tests:
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

## Test Cleanup

Tests automatically:
1. **Pre-test:** Delete old test events from previous runs
2. **Post-test:** Delete events created during current test

This ensures the database stays clean.

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

To run all tests including manual (not recommended in CI):
```bash
# Backend
pytest -m manual

# Frontend
npm run test:integration
```
