/**
 * Jest test setup
 */

import '@testing-library/jest-dom';
import React from 'react';

// Mock Supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signInWithOAuth: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
    storage: {
      from: jest.fn(),
    },
    from: jest.fn(),
  },
}));

// Mock API client
jest.mock('@/integrations/backend/api', () => ({
  apiClient: {
    getCurrentUserProfile: jest.fn(),
    getUserPreferences: jest.fn(),
    updateUserPreferences: jest.fn(),
    getUserRoles: jest.fn(),
    addUserRole: jest.fn(),
    getUserEvents: jest.fn(),
    getEvents: jest.fn(),
    getEvent: jest.fn(),
    sendEventMessage: jest.fn(),
    getEventMessages: jest.fn(),
    getAllProfiles: jest.fn(),
    getAllUserRoles: jest.fn(),
    adminUpdateEventStatus: jest.fn(),
  },
}));

// Mock React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ id: 'test-id' }),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:8080',
    origin: 'http://localhost:8080',
  },
  writable: true,
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock fetch
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
