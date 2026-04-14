# Frontend Integration Tests

End-to-end integration tests for the frontend that verify complete data flow:
**Frontend Component → API Client → Backend API → Database → Backend API → Frontend Component**

## What These Tests Verify

Unlike unit tests that mock API responses, these tests:
- Use the **real API client** (same code the UI uses)
- Connect to the **real backend** (localhost:8000)
- Read/write to the **real database**
- Verify data is **correctly displayed in React components**

## Test Structure

```
frontend/src/__tests__/integration/
├── README.md                           # This file
├── setup.ts                            # Test setup and utilities
├── eventWizard.test.tsx               # Event creation wizard tests
├── eventDetails.test.tsx              # Event details page tests
└── roundtrip.test.tsx                 # Complete round-trip verification
```

## Prerequisites

1. **Frontend dev server running:**
   ```bash
   cd frontend && npm run dev
   ```

2. **Backend server running:**
   ```bash
   ./scripts/start-backend.sh
   ```

3. **Authentication:**
   - User must be logged in via the frontend UI
   - JWT token stored in localStorage
   - Tests will extract token automatically

## Running Tests

### Run all integration tests:
```bash
cd frontend
npm run test:integration
```

### Run specific test:
```bash
cd frontend
npm test -- src/__tests__/integration/eventWizard.test.tsx
```

### Run with UI (for debugging):
```bash
cd frontend
npm test -- --ui
```

## Test Categories

### 1. Event Wizard Integration Tests
- Create event with all wizard fields
- Verify each step saves data correctly
- Test file uploads (event images)
- Verify form validation works end-to-end

### 2. Event Details Integration Tests
- Navigate to event details page
- Verify all fields display correctly
- Test event registration flow
- Test organizer actions (edit, delete)

### 3. Round-trip Tests
- Create event via API
- Fetch event via API
- Verify data integrity (what goes in = what comes out)
- Test all new Event Wizard fields

## Environment Variables

Create `.env.test.local` in frontend folder:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## CI/CD Exclusion

These tests are **excluded from CI** because they require:
- Running backend server
- Database connection
- User authentication

To run in CI, you'd need to:
1. Start backend in CI
2. Seed test database
3. Generate test JWT tokens

## Troubleshooting

### Test fails with "Cannot connect to backend"
- Ensure backend is running on localhost:8000
- Check `npm run dev` is running

### Test fails with "Unauthorized"
- Login via frontend UI first
- Check localStorage has valid JWT token
- Run tests in same browser context

### Test data persists in database
- Tests clean up created events automatically
- Check `cleanup_test_events` helper function
- Manual cleanup: Use Supabase dashboard
