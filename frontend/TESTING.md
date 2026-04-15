# Frontend Testing Guide

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

## Test Files

### 1. `src/hooks/__tests__/useEvents.test.ts`
Tests for the caching logic in useEvents hook:
- ✅ Fetch events on first call
- ✅ Use cached data on subsequent calls
- ✅ Deduplicate concurrent requests
- ✅ Refresh data when params change
- ✅ Handle errors gracefully
- ✅ Not cache error responses

### 2. `src/components/__tests__/AccountDetails.test.tsx`
Tests for AccountDetails component:
- ✅ Renders when user is authenticated
- ✅ Renders null when user is not authenticated
- ✅ Opens dropdown when button is clicked
- ✅ Calls signOut when sign out button is clicked
- ✅ Persists open state in localStorage
- ✅ Handles localStorage errors gracefully

### 3. `src/components/__tests__/Navbar.test.tsx`
Tests for Navbar mobile view:
- ✅ Show hamburger menu on mobile
- ✅ Show mobile menu when hamburger is clicked
- ✅ Toggle Create Event button based on page
- ✅ Show loading placeholder when user is loading
- ✅ Not show Account Details in hamburger menu
- ✅ Show desktop navigation on large screens
- ✅ Hide hamburger on desktop

### 4. `src/pages/__tests__/OrganizerDashboard.test.tsx`
Tests for OrganizerDashboard caching:
- ✅ Use cached events on subsequent renders
- ✅ Use cached bulk participants on subsequent renders
- ✅ Show events immediately from cache without loading
- ✅ Not show loading when cached data exists
- ✅ Render without errors
- ✅ Handle empty events gracefully

## Testing Best Practices

1. **Always test caching behavior**: Ensure cached data is used correctly
2. **Test loading states**: Verify loading states work as expected
3. **Mock external dependencies**: Use mocks for API calls and context
4. **Clean up after tests**: Clear mocks and caches in `beforeEach`
5. **Test error handling**: Ensure errors are handled gracefully

## Adding New Tests

When adding new features, create corresponding tests in the `__tests__` directory:

```typescript
describe('NewFeature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should do something', () => {
    // Your test here
  });
});
```
