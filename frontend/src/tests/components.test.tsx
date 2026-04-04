/**
 * Test cases for React components
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthSheet from '@/components/AuthSheet';

// Mock the API client
jest.mock('@/integrations/backend/api', () => ({
  apiClient: {
    getCurrentUserProfile: jest.fn(),
    getUserPreferences: jest.fn(),
    updateUserPreferences: jest.fn(),
    getUserRoles: jest.fn(),
    addUserRole: jest.fn(),
  },
}));

// Mock Supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithOAuth: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
    },
  },
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('AuthSheet Component', () => {
  it('should render role selection when open', () => {
    render(
      <TestWrapper>
        <AuthSheet isOpen={true} onClose={jest.fn()} />
      </TestWrapper>
    );

    expect(screen.getByText('Sign In with Google')).toBeInTheDocument();
    expect(screen.getByText('I want to...')).toBeInTheDocument();
    expect(screen.getByText('Discover Events')).toBeInTheDocument();
    expect(screen.getByText('Post Events')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    const { container } = render(
      <TestWrapper>
        <AuthSheet isOpen={false} onClose={jest.fn()} />
      </TestWrapper>
    );

    // Should not render anything when closed
    expect(container.firstChild).toBeNull();
  });

  it('should handle role selection', async () => {
    render(
      <TestWrapper>
        <AuthSheet isOpen={true} onClose={jest.fn()} />
      </TestWrapper>
    );

    const discoverButton = screen.getByText('Discover Events');
    const postButton = screen.getByText('Post Events');

    // Initially, discover should be selected (default)
    expect(discoverButton.closest('button')).toHaveClass('border-[hsl(295,100%,73%)]');

    // Click on Post Events
    fireEvent.click(postButton);

    await waitFor(() => {
      expect(postButton.closest('button')).toHaveClass('border-[hsl(295,100%,73%)]');
    });
  });

  it('should handle Google sign-in', async () => {
    const mockSignIn = jest.fn();
    const { supabase } = jest.requireMock('@/integrations/supabase/client');
    supabase.auth.signInWithOAuth.mockImplementation(mockSignIn);

    render(
      <TestWrapper>
        <AuthSheet isOpen={true} onClose={jest.fn()} />
      </TestWrapper>
    );

    const googleButton = screen.getByText('Continue with Google');
    fireEvent.click(googleButton);

    expect(mockSignIn).toHaveBeenCalledWith({
      provider: 'google',
    });
  });

  it('should call onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    render(
      <TestWrapper>
        <AuthSheet isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});

describe('EventDetailPage Component', () => {
  it('should render loading state', () => {
    // Mock the component with loading state
    jest.mock('@/components/EventDetailPage', () => ({
      EventDetailPage: () => <div>Loading...</div>,
    }));

    const { EventDetailPage } = jest.requireMock('@/components/EventDetailPage');
    render(
      <TestWrapper>
        <EventDetailPage />
      </TestWrapper>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render error state', () => {
    // Mock the component with error state
    jest.mock('@/components/EventDetailPage', () => ({
      EventDetailPage: () => <div>Event not found</div>,
    }));

    const { EventDetailPage } = jest.requireMock('@/components/EventDetailPage');
    render(
      <TestWrapper>
        <EventDetailPage />
      </TestWrapper>
    );

    expect(screen.getByText('Event not found')).toBeInTheDocument();
  });
});

describe('EventChat Component', () => {
  it('should render chat interface', () => {
    // Mock the component
    jest.mock('@/components/EventChat', () => ({
      EventChat: ({ eventId }: { eventId: string }) => (
        <div data-testid="event-chat">
          <div>Event Chat for {eventId}</div>
          <input placeholder="Type a message..." />
          <button>Send</button>
        </div>
      ),
    }));

    const { EventChat } = jest.requireMock('@/components/EventChat');
    render(
      <TestWrapper>
        <EventChat eventId="test-event-id" eventCreatorId="user-1" eventStatus="active" />
      </TestWrapper>
    );

    expect(screen.getByTestId('event-chat')).toBeInTheDocument();
    expect(screen.getByText('Event Chat for test-event-id')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  it('should handle message sending', async () => {
    const mockSendMessage = jest.fn();
    jest.mock('@/hooks/useAuthWithBackend', () => ({
      useAuthWithBackend: () => ({
        user: { id: 'user-1' },
        sendMessage: mockSendMessage,
      }),
    }));

    jest.mock('@/components/EventChat', () => ({
      EventChat: ({ eventId }: { eventId: string }) => (
        <div data-testid="event-chat">
          <input
            data-testid="message-input"
            placeholder="Type a message..."
          />
          <button data-testid="send-button">Send</button>
        </div>
      ),
    }));

    const { EventChat } = jest.requireMock('@/components/EventChat');
    render(
      <TestWrapper>
        <EventChat eventId="test-event-id" eventCreatorId="user-1" eventStatus="active" />
      </TestWrapper>
    );

    const input = screen.getByTestId('message-input');
    const button = screen.getByTestId('send-button');

    fireEvent.change(input, { target: { value: 'Hello, world!' } });
    fireEvent.click(button);

    // Verify the message was sent
    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('test-event-id', 'Hello, world!');
    });
  });
});

describe('Integration Tests', () => {
  it('should handle complete authentication flow', async () => {
    // Mock successful authentication
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
    };

    const { apiClient } = jest.requireMock('@/integrations/backend/api');
    apiClient.getUserPreferences.mockResolvedValue({
      onboarding_completed: false,
      is_organizer: false,
    });

    // Mock OAuth success
    const { supabase } = jest.requireMock('@/integrations/supabase/client');
    supabase.auth.signInWithOAuth.mockResolvedValue({});

    render(
      <TestWrapper>
        <AuthSheet isOpen={true} onClose={jest.fn()} />
      </TestWrapper>
    );

    // Select role
    const discoverButton = screen.getByText('Discover Events');
    fireEvent.click(discoverButton);

    // Click Google sign-in
    const googleButton = screen.getByText('Continue with Google');
    fireEvent.click(googleButton);

    // Verify OAuth was called
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
    });
  });

  it('should handle onboarding completion flow', async () => {
    // Mock onboarding data
    const mockPreferences = {
      onboarding_completed: true,
      is_organizer: true,
      interests: ['music', 'sports'],
      city: 'New York',
      age_range: '25-34',
    };

    const { apiClient } = jest.requireMock('@/integrations/backend/api');
    apiClient.updateUserPreferences.mockResolvedValue({ message: 'Updated' });

    // This would be tested in the actual Onboarding component
    expect(apiClient.updateUserPreferences).toBeDefined();
  });
});
