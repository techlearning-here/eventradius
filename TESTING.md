# Testing Guide for EventRadius

This document provides comprehensive testing guidelines for the EventRadius application.

## Overview

EventRadius has a complete test suite covering:
- **Backend API tests** - FastAPI endpoint testing
- **Frontend component tests** - React component testing
- **Integration tests** - End-to-end workflow testing
- **Authentication tests** - JWT and OAuth testing

## Backend Testing

### Setup

1. **Install test dependencies:**
   ```bash
   cd backend
   pip install -r requirements-test.txt
   ```

2. **Activate virtual environment:**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # Mac/Linux
   source venv/bin/activate
   ```

### Running Tests

#### All Backend Tests
```bash
python -m pytest tests/ -v
```

#### Specific Test Categories
```bash
# User API tests
python -m pytest tests/test_users_api.py -v

# Events API tests
python -m pytest tests/test_events_api.py -v

# Authentication tests
python -m pytest tests/test_auth.py -v
```

#### With Coverage
```bash
python -m pytest tests/ --cov=. --cov-report=html --cov-report=term
```

### Backend Test Structure

```
backend/tests/
├── __init__.py
├── test_users_api.py      # User profile and preferences tests
├── test_events_api.py      # Event management tests
├── test_auth.py           # Authentication and JWT tests
└── pytest.ini           # Pytest configuration
```

### Key Backend Test Cases

#### Authentication Tests
- ✅ JWT token validation
- ✅ User authentication flow
- ✅ Authorization middleware
- ✅ Token expiration handling

#### User API Tests
- ✅ Get current user profile
- ✅ Update user preferences
- ✅ Handle missing profiles (create default)
- ✅ User role management
- ✅ Error handling for unauthorized access

#### Events API Tests
- ✅ Get events list
- ✅ Get single event
- ✅ Send event messages
- ✅ Get event messages
- ✅ Admin event status updates
- ✅ Event creation and management

## Frontend Testing

### Setup

1. **Install test dependencies:**
   ```bash
   cd frontend
   npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest jest jest-environment-jsdom ts-jest
   ```

### Running Tests

#### All Frontend Tests
```bash
npm test
```

#### With Coverage
```bash
npm test -- --coverage
```

#### Watch Mode
```bash
npm test -- --watch
```

### Frontend Test Structure

```
frontend/src/tests/
├── __init__.ts
├── setup.ts              # Jest configuration and mocks
├── api.test.ts           # API client tests
├── auth.test.ts          # Authentication hook tests
├── components.test.tsx   # React component tests
└── package.test.json     # Jest configuration
```

### Key Frontend Test Cases

#### API Client Tests
- ✅ Authentication header handling
- ✅ User preferences CRUD operations
- ✅ Events API calls
- ✅ Admin operations
- ✅ Error handling and network failures

#### Authentication Hook Tests
- ✅ User authentication flow
- ✅ Onboarding completion
- ✅ Role management
- ✅ Sign out functionality

#### Component Tests
- ✅ AuthSheet component rendering
- ✅ Role selection functionality
- ✅ Google sign-in integration
- ✅ Event chat component
- ✅ Event detail page

## Running All Tests

### Quick Start (Windows)
```bash
# Run the test runner script
.\run-tests.bat
```

### Quick Start (Mac/Linux)
```bash
# Make script executable
chmod +x run-tests.sh

# Run the test runner script
./run-tests.sh
```

### Manual Testing

#### Backend Only
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m pytest tests/ -v --cov=. --cov-report=html
```

#### Frontend Only
```bash
cd frontend
npm test -- --watchAll=false --coverage
```

## Test Coverage Reports

### Backend Coverage
- **HTML Report:** `backend/htmlcov/index.html`
- **Terminal Report:** Shown in console after running tests

### Frontend Coverage
- **HTML Report:** `frontend/coverage/lcov-report/index.html`
- **LCOV Report:** `frontend/coverage/lcov.info`

## Test Data and Mocking

### Backend Mocking
- Uses `unittest.mock` for mocking database operations
- Mocks Supabase client for database interactions
- Mocks JWT tokens for authentication testing

### Frontend Mocking
- Uses Jest mocks for API calls
- Mocks Supabase client for authentication
- Mocks React Router for navigation testing

## Continuous Integration

### GitHub Actions
The test suite is configured to run on:
- **Pull requests** - All tests must pass
- **Push to main** - Full test suite with coverage
- **Scheduled runs** - Nightly regression tests

### Test Requirements
- **Backend:** Minimum 80% code coverage
- **Frontend:** Minimum 70% code coverage
- **All tests:** Must pass without errors

## Writing New Tests

### Backend Test Template
```python
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

class TestNewFeature:
    def test_success_case(self):
        # Test successful operation
        pass
    
    def test_error_case(self):
        # Test error handling
        pass
    
    def test_edge_case(self):
        # Test edge cases
        pass
```

### Frontend Test Template
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Component } from '@/components/Component';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    render(<Component />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('Updated Text')).toBeInTheDocument();
    });
  });
});
```

## Debugging Tests

### Backend Debugging
```bash
# Run with verbose output
python -m pytest tests/ -v -s

# Run specific test with debugging
python -m pytest tests/test_users_api.py::TestUsersAPI::test_get_current_user_profile_success -v -s
```

### Frontend Debugging
```bash
# Run in watch mode with console output
npm test -- --watch --verbose

# Run specific test file
npm test -- src/tests/api.test.ts
```

## Common Issues and Solutions

### Backend Test Issues
1. **Database connection errors** - Ensure test database is configured
2. **Import errors** - Check virtual environment activation
3. **Mock failures** - Verify mock setup and patching

### Frontend Test Issues
1. **Module resolution errors** - Check Jest configuration
2. **Mock setup issues** - Verify mock implementations
3. **Async test failures** - Use proper async/await patterns

## Best Practices

### Backend Testing
- ✅ Use descriptive test names
- ✅ Test both success and failure cases
- ✅ Mock external dependencies
- ✅ Keep tests independent and isolated
- ✅ Use fixtures for complex test data

### Frontend Testing
- ✅ Test user interactions, not implementation details
- ✅ Use semantic HTML queries
- ✅ Mock API calls and external dependencies
- ✅ Test loading and error states
- ✅ Keep component tests focused

## Troubleshooting

### Tests Not Running
1. Check dependencies are installed
2. Verify virtual environment is activated (backend)
3. Check test file naming conventions
4. Verify configuration files

### Coverage Reports Missing
1. Install coverage dependencies
2. Check coverage configuration
3. Verify report output directories
4. Check file permissions

### Mock Failures
1. Verify mock setup before tests
2. Check mock implementation
3. Ensure proper patching of modules
4. Verify mock return values

This testing guide ensures comprehensive coverage of the EventRadius application's functionality and helps maintain code quality and reliability.
