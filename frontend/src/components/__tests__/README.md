# AccountDetails Component Tests

This directory contains comprehensive tests for the AccountDetails component.

## Test Coverage

### ✅ What's Tested

1. **Basic Rendering**
   - Component renders when user is authenticated
   - Component doesn't render when user is not authenticated
   - User information displays correctly
   - User email displays correctly

2. **Dropdown Functionality**
   - Dropdown opens when user button is clicked
   - Dropdown closes when user clicks away
   - Dropdown menu items render correctly
   - Settings button works
   - Sign out button works

3. **State Persistence**
   - Open/close state persists to localStorage
   - State is restored from localStorage on component mount
   - localStorage errors are handled gracefully

4. **Authentication Integration**
   - Sign out function is called when sign out button is clicked
   - Component integrates properly with useAuthWithBackend hook
   - Loading states are handled correctly

5. **Error Handling**
   - Component doesn't crash when localStorage fails
   - Component handles missing user data gracefully
   - Component handles missing profile data gracefully

## Running Tests

### Development
```bash
npm run test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage
```bash
npm run test:coverage
```

## Test Files

- `AccountDetails.test.tsx` - Main component tests
- Future: Integration tests with actual backend

## Mock Strategy

The tests use comprehensive mocking to isolate the AccountDetails component:

- **useAuthWithBackend** - Mocked to control user state
- **localStorage** - Mocked to test persistence
- **Supabase** - Mocked to avoid actual auth calls
- **Navigation** - Mocked to test routing

## Test Data

Mock data represents typical user state:
- User email: test@example.com
- User name: Test User
- User roles: ['user']
- Onboarding completed: true
- Profile data: Complete user profile

## Future Improvements

1. **Integration Tests** - Test with actual backend
2. **E2E Tests** - Full user flow testing
3. **Visual Regression** - Screenshot comparison tests
4. **Performance Tests** - Component render performance
