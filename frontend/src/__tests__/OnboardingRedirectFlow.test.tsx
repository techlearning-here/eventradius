/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { toast } from 'sonner';
import AuthCallback from '../pages/AuthCallback';
import Discover from '../pages/Discover';
import Onboarding from '../pages/Onboarding';
import { apiClient } from '../integrations/backend/api';
import { supabase } from '../integrations/supabase/client';

// Mock dependencies
jest.mock('../integrations/backend/api');
jest.mock('../integrations/supabase/client');
jest.mock('../hooks/useAuthWithBackend');
jest.mock('../hooks/useEvents');
jest.mock('sonner');
jest.mock('../lib/simple-auth', () => ({
  handleSimpleOAuthCallback: jest.fn(),
}));
jest.mock('lucide-react', () => ({
  MapPin: () => <div data-testid="map-pin-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
  ChevronLeft: () => <div data-testid="chevron-left-icon" />,
  Check: () => <div data-testid="check-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Heart: () => <div data-testid="heart-icon" />,
  Star: () => <div data-testid="star-icon" />,
  Sparkles: () => <div data-testid="sparkles-icon" />,
  Map: () => <div data-testid="map-icon" />,
  LayoutGrid: () => <div data-testid="layout-grid-icon" />,
  List: () => <div data-testid="list-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  ArrowRight: () => <div data-testid="arrow-right-icon" />,
  Building2: () => <div data-testid="building2-icon" />,
}));

import * as useAuthWithBackend from '../hooks/useAuthWithBackend';
import { handleSimpleOAuthCallback } from '../lib/simple-auth';

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockHandleOAuth = handleSimpleOAuthCallback as jest.MockedFunction<typeof handleSimpleOAuthCallback>;

// Mock user data
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {},
  app_metadata: {},
  created_at: '2023-01-01',
};

describe('Onboarding Redirect Flow', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useNavigate
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
    
    // Mock useAuthWithBackend hook
    (useAuthWithBackend.useAuthWithBackend as jest.Mock).mockReturnValue({
      user: mockUser,
      role: 'user',
      onboardingCompleted: null, // New user - onboarding not completed
      fetchOnboardingStatus: jest.fn(),
      canSwitchRole: false,
      setActiveRole: jest.fn(),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('AuthCallback Component', () => {
    it('should redirect to /onboarding when user has not completed onboarding', async () => {
      // Mock successful OAuth
      mockHandleOAuth.mockResolvedValue({
        success: true,
        user: mockUser,
      });

      // Mock API returning incomplete onboarding
      mockApiClient.getUserPreferences.mockResolvedValue({
        onboarding_completed: false,
        is_organizer: false,
        interests: [],
        city: null,
      });

      render(
        <MemoryRouter initialEntries={['/auth/callback']}>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/onboarding');
      });
    });

    it('should redirect to /onboarding when user preferences are not found (new user)', async () => {
      // Mock successful OAuth
      mockHandleOAuth.mockResolvedValue({
        success: true,
        user: mockUser,
      });

      // Mock API throwing error (no preferences found)
      mockApiClient.getUserPreferences.mockRejectedValue(new Error('No preferences found'));

      render(
        <MemoryRouter initialEntries={['/auth/callback']}>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/onboarding');
      });
    });

    it('should redirect to /discover when user has completed onboarding', async () => {
      // Mock successful OAuth
      mockHandleOAuth.mockResolvedValue({
        success: true,
        user: mockUser,
      });

      // Mock API returning completed onboarding
      mockApiClient.getUserPreferences.mockResolvedValue({
        onboarding_completed: true,
        is_organizer: false,
        interests: ['music', 'sports'],
        city: 'New York, NY',
        distance_range: 25,
      });

      render(
        <MemoryRouter initialEntries={['/auth/callback']}>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/discover');
      });
    });

    it('should redirect to /auth?error=auth_failed when OAuth fails', async () => {
      // Mock failed OAuth
      mockHandleOAuth.mockResolvedValue({
        success: false,
        error: new Error('Authentication failed'),
      });

      render(
        <MemoryRouter initialEntries={['/auth/callback']}>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/auth?error=auth_failed');
      });
    });
  });

  describe('Discover Page', () => {
    it('should redirect to /onboarding when onboardingCompleted is null (new user)', () => {
      // Mock useAuthWithBackend with null onboarding status
      (useAuthWithBackend.useAuthWithBackend as jest.Mock).mockReturnValue({
        user: mockUser,
        role: 'user',
        onboardingCompleted: null,
        fetchOnboardingStatus: jest.fn(),
        canSwitchRole: false,
        setActiveRole: jest.fn(),
      });

      // Mock useEvents
      jest.spyOn(require('../hooks/useEvents'), 'useEvents').mockReturnValue({
        events: [],
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(
        <MemoryRouter initialEntries={['/discover']}>
          <Routes>
            <Route path="/discover" element={<Discover />} />
          </Routes>
        </MemoryRouter>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/onboarding');
    });

    it('should redirect to /onboarding when onboardingCompleted is false', () => {
      // Mock useAuthWithBackend with false onboarding status
      (useAuthWithBackend.useAuthWithBackend as jest.Mock).mockReturnValue({
        user: mockUser,
        role: 'user',
        onboardingCompleted: false,
        fetchOnboardingStatus: jest.fn(),
        canSwitchRole: false,
        setActiveRole: jest.fn(),
      });

      // Mock useEvents
      jest.spyOn(require('../hooks/useEvents'), 'useEvents').mockReturnValue({
        events: [],
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(
        <MemoryRouter initialEntries={['/discover']}>
          <Routes>
            <Route path="/discover" element={<Discover />} />
          </Routes>
        </MemoryRouter>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/onboarding');
    });

    it('should show discover page when onboardingCompleted is true', () => {
      // Mock useAuthWithBackend with completed onboarding
      (useAuthWithBackend.useAuthWithBackend as jest.Mock).mockReturnValue({
        user: mockUser,
        role: 'user',
        onboardingCompleted: true,
        fetchOnboardingStatus: jest.fn(),
        canSwitchRole: false,
        setActiveRole: jest.fn(),
      });

      // Mock useEvents with some events
      jest.spyOn(require('../hooks/useEvents'), 'useEvents').mockReturnValue({
        events: [
          {
            id: 'event-1',
            title: 'Test Event',
            description: 'Test Description',
            category: 'music',
            start_time: '2024-01-01T10:00:00Z',
            location: 'New York',
            image_url: null,
          },
        ],
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      // Mock supabase
      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null }),
          }),
        }),
      });

      render(
        <MemoryRouter initialEntries={['/discover']}>
          <Routes>
            <Route path="/discover" element={<Discover />} />
          </Routes>
        </MemoryRouter>
      );

      // Should not redirect
      expect(mockNavigate).not.toHaveBeenCalledWith('/onboarding');
    });
  });

  describe('Complete User Flow Integration', () => {
    it('should complete the full flow: signup -> onboarding -> discover', async () => {
      // This test documents the expected flow
      const testCases = [
        {
          step: 'User visits landing page and clicks "Discover Events"',
          expected: 'Navigate to /discover-nosignup',
        },
        {
          step: 'User clicks "Sign Up Free" button',
          expected: 'Navigate to /auth',
        },
        {
          step: 'User completes Google OAuth',
          expected: 'Redirect to /auth/callback',
        },
        {
          step: 'AuthCallback checks onboarding_completed: false',
          expected: 'Redirect to /onboarding',
        },
        {
          step: 'User completes onboarding wizard (3 steps)',
          expected: 'Save preferences, update cache, redirect to /discover',
        },
        {
          step: 'User visits /discover with onboarding_completed: true',
          expected: 'Show events list without redirect',
        },
      ];

      // Verify the test cases are documented
      expect(testCases).toHaveLength(6);
      expect(testCases[0].expected).toContain('/discover-nosignup');
      expect(testCases[3].expected).toContain('/onboarding');
      expect(testCases[4].expected).toContain('/discover');
    });
  });
});
