import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AccountDetails } from '../AccountDetails';

// Mock user data for testing
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: { role: 'user' },
} as any;

const mockUserProfile = {
  id: 'test-profile-id',
  user_id: 'test-user-id',
  full_name: 'Test User',
  phone: '+1234567890',
  phone_country_code: '+1',
  phone_verified: true,
  email_verified: true,
} as any;

// Mock useAuthWithBackend hook
const mockUseAuthWithBackend = jest.fn(() => ({
  user: mockUser,
  userProfile: mockUserProfile,
  role: 'user',
  roles: ['user'],
  loading: false,
  onboardingCompleted: true,
  canSwitchRole: false,
  signOut: jest.fn(),
  fetchOnboardingStatus: jest.fn(),
  setActiveRole: jest.fn(),
  addOrganizerRole: jest.fn(),
  addUserRole: jest.fn(),
  updateUserProfile: jest.fn(),
  hasOrganizerRole: false,
  hasUserRole: true,
}));

jest.mock('../../../hooks/useAuthWithBackend', () => mockUseAuthWithBackend);

jest.mock('../../../hooks/useAuthWithBackend', () => mockUseAuthWithBackend);

// Mock localStorage
const mockLocalStorage = (() => {
  const store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
  };
})();

// Mock navigate
const mockNavigate = jest.fn();

// Mock Supabase client
jest.mock('../../../integrations/supabase/client', () => ({
  auth: {
    signOut: jest.fn(),
  },
}));

// Mock API client
jest.mock('../../../integrations/backend/api', () => ({
  getUserPreferences: jest.fn().mockResolvedValue({
    id: 'test-pref-id',
    user_id: 'test-user-id',
    onboarding_completed: true,
    is_organizer: false,
  }),
}));

describe('AccountDetails', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
    
    // Setup screen size
    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      writable: true,
    });
    
    Object.defineProperty(window, 'innerHeight', {
      value: 768,
      writable: true,
    });
  });

  afterEach(() => {
    // Restore original localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorage,
      writable: true,
    });
  });

  it('renders when user is authenticated', () => {
    render(<AccountDetails />, {
      wrapper: ({ children }) => (
        <div>
          {children}
          <div data-testid="account-details-container" />
        </div>
      ),
    });

    // Check if component renders
    expect(screen.getByTestId('account-details-container')).toBeInTheDocument();
    
    // Check if user button is visible
    expect(screen.getByRole('button', { name: /user/i })).toBeInTheDocument();
    
    // Check if user email is displayed
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    
    // Check if user name is displayed
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('renders null when user is not authenticated', () => {
    // Mock hook to return null user
    mockUseAuthWithBackend.mockReturnValue({
      user: null,
      userProfile: null,
      role: null,
      roles: [],
      loading: false,
      onboardingCompleted: null,
      canSwitchRole: false,
      signOut: jest.fn(),
    });

    render(<AccountDetails />, {
      wrapper: ({ children }) => (
        <div>
          {children}
          <div data-testid="account-details-container" />
        </div>
      ),
    });

    // Component should not render when user is null
    expect(screen.queryByTestId('account-details-container')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('opens dropdown when button is clicked', async () => {
    const mockSignOut = jest.fn();
    
    // Mock hook to return authenticated user and signOut function
    mockUseAuthWithBackend.mockReturnValue({
      user: mockUser,
      userProfile: mockUserProfile,
      role: 'user',
      roles: ['user'],
      loading: false,
      onboardingCompleted: true,
      canSwitchRole: false,
      signOut: mockSignOut,
    });

    render(<AccountDetails />, {
      wrapper: ({ children }) => (
        <div>
          {children}
          <div data-testid="account-details-container" />
        </div>
      ),
    });

    // Get the button
    const button = screen.getByRole('button', { name: /user/i });
    
    // Dropdown should not be visible initially
    expect(screen.queryByTestId('account-details-dropdown')).not.toBeInTheDocument();
    
    // Click the button
    fireEvent.click(button);
    
    // Wait for dropdown to appear
    await waitFor(() => {
      expect(screen.getByTestId('account-details-dropdown')).toBeInTheDocument();
    });
    
    // Check dropdown content
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('calls signOut when sign out button is clicked', async () => {
    const mockSignOut = jest.fn();
    
    // Mock hook to return authenticated user and signOut function
    mockUseAuthWithBackend.mockReturnValue({
      user: mockUser,
      userProfile: mockUserProfile,
      role: 'user',
      roles: ['user'],
      loading: false,
      onboardingCompleted: true,
      canSwitchRole: false,
      signOut: mockSignOut,
    });

    render(<AccountDetails />, {
      wrapper: ({ children }) => (
        <div>
          {children}
          <div data-testid="account-details-container" />
        </div>
      ),
    });

    // Get the sign out button
    const signOutButton = screen.getByText('Sign Out');
    
    // Click sign out
    fireEvent.click(signOutButton);
    
    // signOut function should be called
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('persists open state in localStorage', async () => {
    // Mock hook to return authenticated user
    mockUseAuthWithBackend.mockReturnValue({
      user: mockUser,
      userProfile: mockUserProfile,
      role: 'user',
      roles: ['user'],
      loading: false,
      onboardingCompleted: true,
      canSwitchRole: false,
      signOut: jest.fn(),
    });

    render(<AccountDetails />, {
      wrapper: ({ children }) => (
        <div>
          {children}
          <div data-testid="account-details-container" />
        </div>
      ),
    });

    // Get the button
    const button = screen.getByRole('button', { name: /user/i });
    
    // Click to open dropdown
    fireEvent.click(button);
    
    // Check if localStorage was called
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('accountDetailsOpen', 'true');
    
    // Close dropdown
    fireEvent.click(screen.getByText('Settings'));
    
    // Check if localStorage was called with false
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('accountDetailsOpen', 'false');
  });

  it('handles localStorage errors gracefully', () => {
    // Mock localStorage to throw error
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('Storage error');
    });
    
    // Mock hook to return authenticated user
    mockUseAuthWithBackend.mockReturnValue({
      user: mockUser,
      userProfile: mockUserProfile,
      role: 'user',
      roles: ['user'],
      loading: false,
      onboardingCompleted: true,
      canSwitchRole: false,
      signOut: jest.fn(),
    });

    render(<AccountDetails />, {
      wrapper: ({ children }) => (
        <div>
          {children}
          <div data-testid="account-details-container" />
        </div>
      ),
    });

    // Component should still render (error shouldn't crash it)
    expect(screen.getByTestId('account-details-container')).toBeInTheDocument();
  });
});
