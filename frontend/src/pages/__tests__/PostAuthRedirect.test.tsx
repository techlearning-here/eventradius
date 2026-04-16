import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { PostAuthRedirect } from '../PostAuthRedirect';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/integrations/backend/api';

// Mock the dependencies
jest.mock('@/contexts/AuthContext');
jest.mock('@/integrations/backend/api');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('PostAuthRedirect', () => {
  const mockNavigate = jest.fn();
  const mockGetUserPreferences = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'test-user-id', email: 'test@example.com' },
      loading: false,
    });
    (apiClient.getUserPreferences as jest.Mock) = mockGetUserPreferences;
  });

  it('should redirect to /discover when onboarding is completed', async () => {
    mockGetUserPreferences.mockResolvedValue({
      onboarding_completed: true,
      is_organizer: false,
    });

    render(
      <MemoryRouter>
        <PostAuthRedirect />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/discover', { replace: true });
    });
  });

  it('should redirect to /onboarding when onboarding is not completed', async () => {
    mockGetUserPreferences.mockResolvedValue({
      onboarding_completed: false,
      is_organizer: false,
    });

    render(
      <MemoryRouter>
        <PostAuthRedirect />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/onboarding', { replace: true });
    });
  });

  it('should redirect to /signin when no user is logged in', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <MemoryRouter>
        <PostAuthRedirect />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/signin');
    });
  });

  it('should redirect to /onboarding when API call fails', async () => {
    mockGetUserPreferences.mockRejectedValue(new Error('API Error'));

    render(
      <MemoryRouter>
        <PostAuthRedirect />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/onboarding', { replace: true });
    });
  });

  it('should show loading state while checking', () => {
    mockGetUserPreferences.mockReturnValue(new Promise(() => {})); // Never resolves

    render(
      <MemoryRouter>
        <PostAuthRedirect />
      </MemoryRouter>
    );

    expect(screen.getByText('Redirecting...')).toBeInTheDocument();
  });
});
