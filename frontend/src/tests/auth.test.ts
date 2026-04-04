/**
 * Test cases for authentication hooks
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';

// Mock the API client
jest.mock('@/integrations/backend/api', () => ({
  apiClient: {
    getCurrentUserProfile: jest.fn(),
    getUserPreferences: jest.fn(),
    updateUserPreferences: jest.fn(),
    getUserRoles: jest.fn(),
    addUserRole: jest.fn(),
    getUserEvents: jest.fn(),
  },
}));

// Mock Supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

describe('useAuthWithBackend Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useAuthWithBackend());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);
    expect(result.current.roles).toEqual([]);
  });

  it('should handle successful authentication', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
    };

    const mockPreferences = {
      id: 'pref-id',
      user_id: 'test-user-id',
      onboarding_completed: false,
      is_organizer: false,
    };

    const mockRoles = ['user'];

    // Mock API responses
    const { apiClient } = jest.requireMock('@/integrations/backend/api');
    apiClient.getCurrentUserProfile.mockResolvedValue(mockUser);
    apiClient.getUserPreferences.mockResolvedValue(mockPreferences);
    apiClient.getUserRoles.mockResolvedValue({ roles: mockRoles });

    // Mock Supabase session
    const { supabase } = jest.requireMock('@/integrations/supabase/client');
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'test-token' } }
    });

    const { result } = renderHook(() => useAuthWithBackend());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.roles).toEqual(mockRoles);
    });
  });

  it('should handle onboarding completion', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
    };

    const mockPreferences = {
      id: 'pref-id',
      user_id: 'test-user-id',
      onboarding_completed: false,
      is_organizer: true,
    };

    const { apiClient } = jest.requireMock('@/integrations/backend/api');
    apiClient.getCurrentUserUserProfile.mockResolvedValue(mockUser);
    apiClient.getUserPreferences.mockResolvedValue(mockPreferences);
    apiClient.addUserRole.mockResolvedValue({ message: 'Role added' });

    const { supabase } = jest.requireMock('@/integrations/supabase/client');
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'test-token' } }
    });

    const { result } = renderHook(() => useAuthWithBackend());

    await waitFor(() => {
      expect(result.current.roles).toContain('organizer');
      expect(apiClient.addUserRole).toHaveBeenCalledWith('organizer');
    });
  });

  it('should handle authentication errors gracefully', async () => {
    const { apiClient } = jest.requireMock('@/integrations/backend/api');
    apiClient.getCurrentUserUserProfile.mockRejectedValue(new Error('Auth failed'));

    const { supabase } = jest.requireMock('@/integrations/supabase/client');
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'test-token' } }
    });

    const { result } = renderHook(() => useAuthWithBackend());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.user).toBe(null);
      expect(result.current.error).toBeTruthy();
    });
  });

  it('should handle sign out', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
    };

    const { apiClient } = jest.requireMock('@/integrations/backend/api');
    apiClient.getCurrentUserUserProfile.mockResolvedValue(mockUser);
    apiClient.getUserPreferences.mockResolvedValue({ onboarding_completed: true });

    const { supabase } = jest.requireMock('@/integrations/supabase/client');
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'test-token' } }
    });
    supabase.auth.signOut.mockResolvedValue({});

    const { result } = renderHook(() => useAuthWithBackend());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    // Sign out
    await result.current.signOut();

    expect(result.current.user).toBe(null);
    expect(result.current.roles).toEqual([]);
  });
});

describe('Authentication Flow Integration', () => {
  it('should complete full authentication flow', async () => {
    // Mock successful OAuth callback
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
    };

    const mockPreferences = {
      id: 'pref-id',
      user_id: 'test-user-id',
      onboarding_completed: false,
      is_organizer: false,
    };

    const { apiClient } = jest.requireMock('@/integrations/backend/api');
    apiClient.getCurrentUserUserProfile.mockResolvedValue(mockUser);
    apiClient.getUserPreferences.mockResolvedValue(mockPreferences);
    apiClient.getUserRoles.mockResolvedValue({ roles: ['user'] });

    const { supabase } = jest.requireMock('@/integrations/supabase/client');
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'test-token' } }
    });

    const { result } = renderHook(() => useAuthWithBackend());

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.onboardingCompleted).toBe(false);
      expect(result.current.roles).toEqual(['user']);
    });

    // Complete onboarding
    const updatedPreferences = {
      ...mockPreferences,
      onboarding_completed: true,
      is_organizer: true,
    };

    apiClient.updateUserPreferences.mockResolvedValue({ message: 'Updated' });
    apiClient.addUserRole.mockResolvedValue({ message: 'Role added' });

    await result.current.updateUserPreferences(updatedPreferences);

    await waitFor(() => {
      expect(result.current.onboardingCompleted).toBe(true);
      expect(result.current.roles).toContain('organizer');
    });
  });
});
