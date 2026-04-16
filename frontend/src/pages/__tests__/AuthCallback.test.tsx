import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate, useLocation } from 'react-router-dom';
import AuthCallback from '../AuthCallback';
import { supabase } from '@/integrations/supabase/client';

// Mock dependencies
jest.mock('@/integrations/supabase/client');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

describe('AuthCallback', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useLocation as jest.Mock).mockReturnValue({
      search: '?code=test-auth-code',
    });
  });

  it('should redirect to /post-auth after successful OAuth', async () => {
    // Mock successful OAuth exchange
    (supabase.auth.exchangeCodeForSession as jest.Mock).mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
        },
      },
      error: null,
    });

    render(
      <MemoryRouter>
        <AuthCallback />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith('test-auth-code');
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/post-auth', { replace: true });
    });

    // Check that sessionStorage flag was set
    expect(sessionStorage.getItem('just_completed_oauth')).toBe('true');

    // Check that localStorage was cleared
    expect(localStorage.getItem('eventradius_user')).toBeNull();
    expect(localStorage.getItem('eventradius_user_id')).toBeNull();
  });

  it('should redirect to /signin on OAuth error', async () => {
    (supabase.auth.exchangeCodeForSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: { message: 'Invalid code' },
    });

    render(
      <MemoryRouter>
        <AuthCallback />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/signin');
    });
  });

  it('should handle missing code parameter', () => {
    (useLocation as jest.Mock).mockReturnValue({
      search: '',
    });

    render(
      <MemoryRouter>
        <AuthCallback />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/signin');
  });

  it('should clear old cached user data on successful OAuth', async () => {
    // Set some old cached data
    localStorage.setItem('eventradius_user', JSON.stringify({ id: 'old-user' }));
    localStorage.setItem('eventradius_user_id', 'old-user-id');

    (supabase.auth.exchangeCodeForSession as jest.Mock).mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'new-user-id',
            email: 'test@example.com',
          },
        },
      },
      error: null,
    });

    render(
      <MemoryRouter>
        <AuthCallback />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/post-auth', { replace: true });
    });

    // Verify old data was cleared
    expect(localStorage.getItem('eventradius_user')).toBeNull();
    expect(localStorage.getItem('eventradius_user_id')).toBeNull();
  });
});
