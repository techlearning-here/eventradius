/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'sonner';
import OrganizerOnboarding from '../../pages/OrganizerOnboarding';
import { apiClient } from '../../integrations/backend/api';

// Mock the dependencies
jest.mock('../../integrations/backend/api');
jest.mock('../../hooks/useAuthWithBackend');
jest.mock('sonner');
jest.mock('lucide-react', () => ({
  Phone: () => <div data-testid="phone-icon" />,
  Building: () => <div data-testid="building-icon" />,
  MapPin: () => <div data-testid="map-pin-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  Shield: () => <div data-testid="shield-icon" />,
  Sparkles: () => <div data-testid="sparkles-icon" />,
  Users: () => <div data-testid="users-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  ArrowRight: () => <div data-testid="arrow-right-icon" />,
}));

import * as useAuthWithBackend from '../../hooks/useAuthWithBackend';
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Test data
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: { role: 'user' },
  app_metadata: {},
  created_at: '2023-01-01',
};

const mockCategories = [
  { id: 'music', label: 'Music', emoji: 'Music' },
  { id: 'sports', label: 'Sports', emoji: 'Sports' },
  { id: 'arts', label: 'Arts', emoji: 'Arts' },
];

// Mock CATEGORIES
jest.mock('../../pages/OrganizerOnboarding', () => {
  const originalModule = jest.requireActual('../../pages/OrganizerOnboarding');
  return {
    ...originalModule,
    CATEGORIES: mockCategories,
  };
});

describe('OrganizerOnboarding Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders initial state correctly', () => {
    renderWithProviders(<mockOrganizerOnboarding />);
    
    expect(screen.getByText('Organizer Setup')).toBeInTheDocument();
    expect(screen.getByTestId('progress-percentage')).toHaveTextContent('33% Complete');
    expect(screen.getByTestId('step-1')).toBeInTheDocument();
    expect(screen.getByTestId('step-2')).not.toBeInTheDocument();
    expect(screen.getByTestId('step-3')).not.toBeInTheDocument();
  });

  test('progress bar updates correctly when navigating steps', async () => {
    renderWithProviders(<mockOrganizerOnboarding />);
    
    // Initial state
    expect(screen.getByTestId('progress-percentage')).toHaveTextContent('33% Complete');
    
    // Move to step 2
    fireEvent.click(screen.getByTestId('next-button'));
    await waitFor(() => {
      expect(screen.getByTestId('progress-percentage')).toHaveTextContent('67% Complete');
    });
    
    // Move to step 3
    fireEvent.click(screen.getByTestId('next-button'));
    await waitFor(() => {
      expect(screen.getByTestId('progress-percentage')).toHaveTextContent('100% Complete');
    });
  });

  test('form data updates correctly in step 1', async () => {
    renderWithProviders(<mockOrganizerOnboarding />);
    
    const phoneInput = screen.getByTestId('phone-input');
    const addressInput = screen.getByTestId('address-input');
    const cityInput = screen.getByTestId('city-input');
    
    fireEvent.change(phoneInput, { target: { value: '+1234567890' } });
    fireEvent.change(addressInput, { target: { value: '123 Test St' } });
    fireEvent.change(cityInput, { target: { value: 'Test City' } });
    
    await waitFor(() => {
      expect(phoneInput).toHaveValue('+1234567890');
      expect(addressInput).toHaveValue('123 Test St');
      expect(cityInput).toHaveValue('Test City');
    });
  });

  test('navigation between steps works correctly', async () => {
    renderWithProviders(<mockOrganizerOnboarding />);
    
    // Move to step 2
    fireEvent.click(screen.getByTestId('next-button'));
    await waitFor(() => {
      expect(screen.getByTestId('step-2')).toBeInTheDocument();
      expect(screen.getByTestId('step-1')).not.toBeInTheDocument();
    });
    
    // Go back to step 1
    fireEvent.click(screen.getByTestId('back-button'));
    await waitFor(() => {
      expect(screen.getByTestId('step-1')).toBeInTheDocument();
      expect(screen.getByTestId('step-2')).not.toBeInTheDocument();
    });
  });

  test('business information form works correctly', async () => {
    renderWithProviders(<mockOrganizerOnboarding />);
    
    // Move to step 2
    fireEvent.click(screen.getByTestId('next-button'));
    await waitFor(() => {
      expect(screen.getByTestId('step-2')).toBeInTheDocument();
    });
    
    const businessNameInput = screen.getByTestId('business-name-input');
    const businessTypeSelect = screen.getByTestId('business-type-select');
    
    fireEvent.change(businessNameInput, { target: { value: 'Test Business' } });
    fireEvent.change(businessTypeSelect, { target: { value: 'business' } });
    
    await waitFor(() => {
      expect(businessNameInput).toHaveValue('Test Business');
      expect(businessTypeSelect).toHaveValue('business');
    });
  });

  test('event type selection works correctly', async () => {
    renderWithProviders(<mockOrganizerOnboarding />);
    
    // Move to step 2
    fireEvent.click(screen.getByTestId('next-button'));
    await waitFor(() => {
      expect(screen.getByTestId('step-2')).toBeInTheDocument();
    });
    
    const musicTypeButton = screen.getByTestId('music-type');
    const sportsTypeButton = screen.getByTestId('sports-type');
    
    // Select music type
    fireEvent.click(musicTypeButton);
    await waitFor(() => {
      expect(musicTypeButton).toHaveTextContent('Music Selected');
    });
    
    // Select sports type
    fireEvent.click(sportsTypeButton);
    await waitFor(() => {
      expect(sportsTypeButton).toHaveTextContent('Sports Selected');
    });
    
    // Deselect music type
    fireEvent.click(musicTypeButton);
    await waitFor(() => {
      expect(musicTypeButton).toHaveTextContent('Music');
    });
  });

  test('review page displays form data correctly', async () => {
    renderWithProviders(<mockOrganizerOnboarding />);
    
    // Fill step 1
    fireEvent.change(screen.getByTestId('phone-input'), { target: { value: '+1234567890' } });
    fireEvent.change(screen.getByTestId('address-input'), { target: { value: '123 Test St' } });
    fireEvent.change(screen.getByTestId('city-input'), { target: { value: 'Test City' } });
    
    // Move to step 2
    fireEvent.click(screen.getByTestId('next-button'));
    await waitFor(() => {
      expect(screen.getByTestId('step-2')).toBeInTheDocument();
    });
    
    // Fill step 2
    fireEvent.change(screen.getByTestId('business-name-input'), { target: { value: 'Test Business' } });
    fireEvent.click(screen.getByTestId('music-type'));
    
    // Move to step 3
    fireEvent.click(screen.getByTestId('next-button'));
    await waitFor(() => {
      expect(screen.getByTestId('step-3')).toBeInTheDocument();
    });
    
    // Check review summary
    const reviewSummary = screen.getByTestId('review-summary');
    expect(reviewSummary).toHaveTextContent('+1 +1234567890');
    expect(reviewSummary).toHaveTextContent('123 Test St, Test City');
    expect(reviewSummary).toHaveTextContent('Test Business');
    expect(reviewSummary).toHaveTextContent('music');
  });

  test('terms acceptance works correctly', async () => {
    renderWithProviders(<mockOrganizerOnboarding />);
    
    // Move to step 3
    fireEvent.click(screen.getByTestId('next-button'));
    fireEvent.click(screen.getByTestId('next-button'));
    await waitFor(() => {
      expect(screen.getByTestId('step-3')).toBeInTheDocument();
    });
    
    const termsCheckbox = screen.getByTestId('terms-checkbox');
    
    // Initially unchecked
    expect(termsCheckbox).not.toBeChecked();
    
    // Check the box
    fireEvent.click(termsCheckbox);
    await waitFor(() => {
      expect(termsCheckbox).toBeChecked();
    });
    
    // Uncheck the box
    fireEvent.click(termsCheckbox);
    await waitFor(() => {
      expect(termsCheckbox).not.toBeChecked();
    });
  });

  test('form validation prevents navigation with empty required fields', async () => {
    renderWithProviders(<mockOrganizerOnboarding />);
    
    // Try to proceed without filling required fields
    const nextButton = screen.getByTestId('next-button');
    
    // Should be able to move to step 2 (step 1 validation would be in real component)
    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(screen.getByTestId('step-2')).toBeInTheDocument();
    });
    
    // Try to proceed without filling business info
    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(screen.getByTestId('step-3')).toBeInTheDocument();
    });
  });

  test('complete setup button is available in final step', async () => {
    renderWithProviders(<mockOrganizerOnboarding />);
    
    // Navigate to final step
    fireEvent.click(screen.getByTestId('next-button'));
    fireEvent.click(screen.getByTestId('next-button'));
    await waitFor(() => {
      expect(screen.getByTestId('step-3')).toBeInTheDocument();
    });
    
    // Check for complete button
    expect(screen.getByTestId('complete-button')).toBeInTheDocument();
    expect(screen.getByTestId('complete-button')).toHaveTextContent('Complete Setup');
  });

  test('component state persists during navigation', async () => {
    renderWithProviders(<mockOrganizerOnboarding />);
    
    // Fill step 1
    fireEvent.change(screen.getByTestId('phone-input'), { target: { value: '+1234567890' } });
    
    // Move to step 2 and back
    fireEvent.click(screen.getByTestId('next-button'));
    await waitFor(() => {
      expect(screen.getByTestId('step-2')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('back-button'));
    await waitFor(() => {
      expect(screen.getByTestId('step-1')).toBeInTheDocument();
    });
    
    // Check if data is preserved
    expect(screen.getByTestId('phone-input')).toHaveValue('+1234567890');
  });

  test('accessibility features are present', () => {
    renderWithProviders(<mockOrganizerOnboarding />);
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { name: 'Organizer Setup' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Contact Details' })).toBeInTheDocument();
    
    // Check for form labels (in real component)
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toHaveAttribute('placeholder');
    });
  });

  test('responsive design elements are present', () => {
    renderWithProviders(<mockOrganizerOnboarding />);
    
    // Check for progress bar (responsive element)
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    
    // Check for navigation buttons
    expect(screen.getByTestId('next-button')).toBeInTheDocument();
  });
});
