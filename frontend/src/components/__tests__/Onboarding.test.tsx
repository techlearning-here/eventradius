/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'sonner';
import Onboarding from '../../pages/Onboarding';
import { apiClient } from '../../integrations/backend/api';

// Mock the dependencies
jest.mock('../../integrations/backend/api');
jest.mock('../../hooks/useAuthWithBackend');
jest.mock('sonner');
jest.mock('lucide-react', () => ({
  MapPin: () => <div data-testid="map-pin-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
  ChevronLeft: () => <div data-testid="chevron-left-icon" />,
  Check: () => <div data-testid="check-icon" />,
}));

const mockUseAuthWithBackend = require('../../hooks/useAuthWithBackend');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Test data
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: { role: 'user' },
  app_metadata: {},
  created_at: '2023-01-01',
};

const mockCities = [
  { name: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060 },
  { name: 'Boston', state: 'MA', lat: 42.3601, lng: -71.0589 },
];

const mockCategories = [
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
];

describe('Onboarding Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useAuthWithBackend
    mockUseAuthWithBackend.useAuthWithBackend = () => ({
      user: mockUser,
      fetchOnboardingStatus: jest.fn().mockResolvedValue(true),
    });

    // Mock react-router-dom
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }));

    // Mock data imports
    jest.mock('../../data/cities', () => ({
      CITIES: mockCities,
      CATEGORIES: mockCategories,
      AGE_RANGES: ['18-24', '25-34', '35-44'],
      DISTANCE_OPTIONS: [10, 25, 50],
    }));
  });

  const renderOnboarding = () => {
    return render(
      <BrowserRouter>
        <Onboarding />
      </BrowserRouter>
    );
  };

  describe('Step Navigation', () => {
    test('starts with step 1 (Demographics)', () => {
      renderOnboarding();
      
      expect(screen.getByText('About you')).toBeInTheDocument();
      expect(screen.getByText('Help us personalize your event feed.')).toBeInTheDocument();
      expect(screen.getByText('Age Range')).toBeInTheDocument();
      expect(screen.getByText('Do you have kids?')).toBeInTheDocument();
    });

    test('navigates to step 2 when Next is clicked', async () => {
      renderOnboarding();
      
      // Select an age range
      fireEvent.click(screen.getByText('25-34'));
      
      // Click Next
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        expect(screen.getByText('Your interests')).toBeInTheDocument();
        expect(screen.getByText('Select categories you\'re interested in.')).toBeInTheDocument();
      });
    });

    test('navigates back from step 2 to step 1', async () => {
      renderOnboarding();
      
      // Go to step 2
      fireEvent.click(screen.getByText('25-34'));
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        expect(screen.getByText('Your interests')).toBeInTheDocument();
      });
      
      // Click Back
      fireEvent.click(screen.getByText('Back'));
      
      await waitFor(() => {
        expect(screen.getByText('About you')).toBeInTheDocument();
      });
    });

    test('requires interests selection to proceed to step 3', async () => {
      renderOnboarding();
      
      // Go to step 2
      fireEvent.click(screen.getByText('25-34'));
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        expect(screen.getByText('Your interests')).toBeInTheDocument();
      });
      
      // Try to proceed without selecting interests
      const nextButton = screen.getByText('Next');
      expect(nextButton).toBeDisabled();
      
      // Select an interest
      fireEvent.click(screen.getByText('Music'));
      
      // Now Next should be enabled
      expect(nextButton).not.toBeDisabled();
      
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Your location')).toBeInTheDocument();
      });
    });
  });

  describe('Form Interactions', () => {
    test('allows age range selection', () => {
      renderOnboarding();
      
      const ageRange25 = screen.getByText('25-34');
      const ageRange35 = screen.getByText('35-44');
      
      fireEvent.click(ageRange25);
      expect(ageRange25).toHaveClass('border-[hsl(295,100%,73%)]');
      
      fireEvent.click(ageRange35);
      expect(ageRange35).toHaveClass('border-[hsl(295,100%,73%)]');
      expect(ageRange25).not.toHaveClass('border-[hsl(295,100%,73%)]');
    });

    test('allows kids selection', () => {
      renderOnboarding();
      
      const yesButton = screen.getByText('Yes');
      const noButton = screen.getByText('No');
      
      fireEvent.click(yesButton);
      expect(yesButton).toHaveClass('border-[hsl(295,100%,73%)]');
      
      fireEvent.click(noButton);
      expect(noButton).toHaveClass('border-[hsl(295,100%,73%)]');
      expect(yesButton).not.toHaveClass('border-[hsl(295,100%,73%)]');
    });

    test('allows multiple interests selection', () => {
      renderOnboarding();
      
      // Navigate to step 2
      fireEvent.click(screen.getByText('25-34'));
      fireEvent.click(screen.getByText('Next'));
      
      waitFor(() => {
        const musicButton = screen.getByText('Music');
        const sportsButton = screen.getByText('Sports');
        
        fireEvent.click(musicButton);
        expect(musicButton).toHaveClass('border-[hsl(295,100%,73%)]');
        expect(screen.getByTestId('check-icon')).toBeInTheDocument();
        
        fireEvent.click(sportsButton);
        expect(sportsButton).toHaveClass('border-[hsl(295,100%,73%)]');
      });
    });

    test('allows city search and selection', async () => {
      renderOnboarding();
      
      // Navigate to step 3
      fireEvent.click(screen.getByText('25-34'));
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Music'));
        fireEvent.click(screen.getByText('Next'));
      });
      
      await waitFor(() => {
        expect(screen.getByText('Your location')).toBeInTheDocument();
      });
      
      // Search for city
      const searchInput = screen.getByPlaceholderText('Search for your city...');
      fireEvent.change(searchInput, { target: { value: 'New York' } });
      
      // City should appear in dropdown
      await waitFor(() => {
        expect(screen.getByText('New York, NY')).toBeInTheDocument();
      });
      
      // Select city
      fireEvent.click(screen.getByText('New York, NY'));
      
      expect(searchInput).toHaveValue('New York, NY');
    });

    test('allows distance range selection', async () => {
      renderOnboarding();
      
      // Navigate to step 3
      fireEvent.click(screen.getByText('25-34'));
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Music'));
        fireEvent.click(screen.getByText('Next'));
      });
      
      await waitFor(() => {
        expect(screen.getByText('Your location')).toBeInTheDocument();
      });
      
      const distance25 = screen.getByText('25 mi');
      const distance50 = screen.getByText('50 mi');
      
      fireEvent.click(distance25);
      expect(distance25).toHaveClass('border-[hsl(295,100%,73%)]');
      
      fireEvent.click(distance50);
      expect(distance50).toHaveClass('border-[hsl(295,100%,73%)]');
      expect(distance25).not.toHaveClass('border-[hsl(295,100%,73%)]');
    });
  });

  describe('Form Submission', () => {
    test('successfully completes onboarding with valid data', async () => {
      mockApiClient.updateUserPreferences.mockResolvedValue({ message: 'Success' });
      
      renderOnboarding();
      
      // Fill step 1
      fireEvent.click(screen.getByText('25-34'));
      fireEvent.click(screen.getByText('No'));
      fireEvent.click(screen.getByText('Next'));
      
      // Fill step 2
      await waitFor(() => {
        fireEvent.click(screen.getByText('Music'));
        fireEvent.click(screen.getByText('Next'));
      });
      
      // Fill step 3
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search for your city...');
        fireEvent.change(searchInput, { target: { value: 'New York' } });
      });
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('New York, NY'));
      });
      
      fireEvent.click(screen.getByText('25 mi'));
      
      // Submit
      const finishButton = screen.getByText('Finish');
      fireEvent.click(finishButton);
      
      await waitFor(() => {
        expect(mockApiClient.updateUserPreferences).toHaveBeenCalledWith({
          age_range: '25-34',
          has_kids: false,
          interests: ['music'],
          city: 'New York, NY',
          latitude: 40.7128,
          longitude: -74.0060,
          distance_range: 25,
          onboarding_completed: true,
        });
      });
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Preferences saved!');
        expect(mockNavigate).toHaveBeenCalledWith('/discover');
      });
    });

    test('shows validation error when required fields are missing', async () => {
      renderOnboarding();
      
      // Navigate to step 3 without filling required fields
      fireEvent.click(screen.getByText('25-34'));
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Music'));
        fireEvent.click(screen.getByText('Next'));
      });
      
      await waitFor(() => {
        expect(screen.getByText('Your location')).toBeInTheDocument();
      });
      
      // Try to finish without selecting city
      const finishButton = screen.getByText('Finish');
      expect(finishButton).toBeDisabled();
      
      // Select city but don't select interests
      const searchInput = screen.getByPlaceholderText('Search for your city...');
      fireEvent.change(searchInput, { target: { value: 'New York' } });
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('New York, NY'));
      });
      
      // Now finish should be enabled
      expect(finishButton).not.toBeDisabled();
      
      fireEvent.click(finishButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please complete all fields');
      });
    });

    test('handles API error gracefully', async () => {
      mockApiClient.updateUserPreferences.mockRejectedValue(new Error('API Error'));
      
      renderOnboarding();
      
      // Fill all steps
      fireEvent.click(screen.getByText('25-34'));
      fireEvent.click(screen.getByText('No'));
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Music'));
        fireEvent.click(screen.getByText('Next'));
      });
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search for your city...');
        fireEvent.change(searchInput, { target: { value: 'New York' } });
      });
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('New York, NY'));
        fireEvent.click(screen.getByText('25 mi'));
        fireEvent.click(screen.getByText('Finish'));
      });
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to save preferences');
      });
    });
  });

  describe('Loading States', () => {
    test('shows loading state during submission', async () => {
      mockApiClient.updateUserPreferences.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      renderOnboarding();
      
      // Fill all steps quickly
      fireEvent.click(screen.getByText('25-34'));
      fireEvent.click(screen.getByText('No'));
      fireEvent.click(screen.getByText('Next'));
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Music'));
        fireEvent.click(screen.getByText('Next'));
      });
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search for your city...');
        fireEvent.change(searchInput, { target: { value: 'New York' } });
      });
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('New York, NY'));
        fireEvent.click(screen.getByText('25 mi'));
        fireEvent.click(screen.getByText('Finish'));
      });
      
      // Should show loading state
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(screen.getByText('Saving...')).toBeDisabled();
      
      // Wait for completion
      await waitFor(() => {
        expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
      }, { timeout: 200 });
    });
  });
});
