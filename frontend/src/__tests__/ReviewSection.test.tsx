import { render, screen, fireEvent } from '@testing-library/react';
import { ReviewSection } from '../components/EventWizard/ReviewSection';
import { type EventFormData } from '../components/EventWizard/EventWizard';

// Mock the UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>{children}</button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}));

const mockFormData: EventFormData = {
  title: 'Test Event',
  description: 'Test Description',
  language: 'en',
  event_type: 'in_person',
  event_format: 'single',
  event_privacy: 'public',
  is_paid_event: false,
  is_virtual: false,
  start_time: new Date('2026-12-01T10:00'),
  end_time: new Date('2026-12-01T12:00'),
  timezone: 'America/New_York',
  location: 'Test Location',
  venue_street: '123 Main St',
  venue_city: 'New York',
  venue_state: 'NY',
  venue_zip_code: '10001',
  venue_country: 'USA',
  virtual_event_url: '',
  refund_policy: 'no_refunds',
  status: 'draft',
};

describe('ReviewSection', () => {
  const mockOnEdit = jest.fn();
  const mockOnPublish = jest.fn();
  const mockOnAgreedToTermsChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Publish Button', () => {
    test('should NOT render a duplicate Publish Event button in the review section', () => {
      render(
        <ReviewSection
          formData={mockFormData}
          onEdit={mockOnEdit}
          onPublish={mockOnPublish}
          isPublishing={false}
          onAgreedToTermsChange={mockOnAgreedToTermsChange}
        />
      );

      // Get all buttons with "Publish Event" text
      const publishButtons = screen.queryAllByText(/Publish Event/i);
      
      // Should be 0 since we removed the duplicate from ReviewSection
      // The main Publish button is in EventWizard.tsx navigation, not here
      expect(publishButtons).toHaveLength(0);
    });

    test('should NOT render any button with "Publishing..." text when not publishing', () => {
      render(
        <ReviewSection
          formData={mockFormData}
          onEdit={mockOnEdit}
          onPublish={mockOnPublish}
          isPublishing={false}
          onAgreedToTermsChange={mockOnAgreedToTermsChange}
        />
      );

      const publishingButtons = screen.queryAllByText(/Publishing\.\.\./i);
      expect(publishingButtons).toHaveLength(0);
    });
  });

  describe('Terms Agreement Checkbox', () => {
    test('should render terms agreement checkbox', () => {
      render(
        <ReviewSection
          formData={mockFormData}
          onEdit={mockOnEdit}
          onPublish={mockOnPublish}
          isPublishing={false}
          onAgreedToTermsChange={mockOnAgreedToTermsChange}
        />
      );

      const checkbox = screen.getByLabelText(/I agree to the EventRadius Terms of Service/i);
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    test('should call onAgreedToTermsChange when checkbox is checked', () => {
      render(
        <ReviewSection
          formData={mockFormData}
          onEdit={mockOnEdit}
          onPublish={mockOnPublish}
          isPublishing={false}
          onAgreedToTermsChange={mockOnAgreedToTermsChange}
        />
      );

      const checkbox = screen.getByLabelText(/I agree to the EventRadius Terms of Service/i);
      
      fireEvent.click(checkbox);
      
      expect(mockOnAgreedToTermsChange).toHaveBeenCalledWith(true);
    });

    test('should call onAgreedToTermsChange with false when checkbox is unchecked', () => {
      render(
        <ReviewSection
          formData={mockFormData}
          onEdit={mockOnEdit}
          onPublish={mockOnPublish}
          isPublishing={false}
          onAgreedToTermsChange={mockOnAgreedToTermsChange}
        />
      );

      const checkbox = screen.getByLabelText(/I agree to the EventRadius Terms of Service/i);
      
      // Check first
      fireEvent.click(checkbox);
      expect(mockOnAgreedToTermsChange).toHaveBeenCalledWith(true);
      
      // Then uncheck
      fireEvent.click(checkbox);
      expect(mockOnAgreedToTermsChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Edit Button Navigation', () => {
    test('should call onEdit with "info" when clicking Edit on Basic Information card', () => {
      render(
        <ReviewSection
          formData={mockFormData}
          onEdit={mockOnEdit}
          onPublish={mockOnPublish}
          isPublishing={false}
          onAgreedToTermsChange={mockOnAgreedToTermsChange}
        />
      );

      // Find all Edit buttons
      const editButtons = screen.getAllByText('Edit');
      
      // Click the first Edit button (Basic Information)
      fireEvent.click(editButtons[0]);
      
      expect(mockOnEdit).toHaveBeenCalledWith('info');
    });

    test('should call onEdit with "type" when clicking Edit on Event Type & Format card', () => {
      render(
        <ReviewSection
          formData={mockFormData}
          onEdit={mockOnEdit}
          onPublish={mockOnPublish}
          isPublishing={false}
          onAgreedToTermsChange={mockOnAgreedToTermsChange}
        />
      );

      const editButtons = screen.getAllByText('Edit');
      
      // Click the second Edit button (Event Type & Format)
      fireEvent.click(editButtons[1]);
      
      expect(mockOnEdit).toHaveBeenCalledWith('type');
    });

    test('should call onEdit with "type" when clicking Edit on Date & Time card', () => {
      render(
        <ReviewSection
          formData={mockFormData}
          onEdit={mockOnEdit}
          onPublish={mockOnPublish}
          isPublishing={false}
          onAgreedToTermsChange={mockOnAgreedToTermsChange}
        />
      );

      const editButtons = screen.getAllByText('Edit');
      
      // Click the third Edit button (Date & Time)
      fireEvent.click(editButtons[2]);
      
      // Date & Time maps to 'type' step
      expect(mockOnEdit).toHaveBeenCalledWith('type');
    });

    test('should call onEdit with "type" when clicking Edit on Location card', () => {
      render(
        <ReviewSection
          formData={mockFormData}
          onEdit={mockOnEdit}
          onPublish={mockOnPublish}
          isPublishing={false}
          onAgreedToTermsChange={mockOnAgreedToTermsChange}
        />
      );

      const editButtons = screen.getAllByText('Edit');
      
      // Click the fourth Edit button (Location)
      fireEvent.click(editButtons[3]);
      
      // Location maps to 'type' step
      expect(mockOnEdit).toHaveBeenCalledWith('type');
    });

    test('should call onEdit with "contact" when clicking Edit on Category & Settings card', () => {
      render(
        <ReviewSection
          formData={mockFormData}
          onEdit={mockOnEdit}
          onPublish={mockOnPublish}
          isPublishing={false}
          onAgreedToTermsChange={mockOnAgreedToTermsChange}
        />
      );

      const editButtons = screen.getAllByText('Edit');
      
      // Click the fifth Edit button (Category & Settings)
      fireEvent.click(editButtons[4]);
      
      // Category & Settings maps to 'contact' step
      expect(mockOnEdit).toHaveBeenCalledWith('contact');
    });

    test('should call onEdit exactly once per click', () => {
      render(
        <ReviewSection
          formData={mockFormData}
          onEdit={mockOnEdit}
          onPublish={mockOnPublish}
          isPublishing={false}
          onAgreedToTermsChange={mockOnAgreedToTermsChange}
        />
      );

      const editButtons = screen.getAllByText('Edit');
      
      // Click each Edit button
      editButtons.forEach((button) => {
        fireEvent.click(button);
      });
      
      // Should have been called exactly 5 times (once per card)
      expect(mockOnEdit).toHaveBeenCalledTimes(5);
    });
  });

  describe('Review Cards Rendering', () => {
    test('should render all review section cards', () => {
      render(
        <ReviewSection
          formData={mockFormData}
          onEdit={mockOnEdit}
          onPublish={mockOnPublish}
          isPublishing={false}
          onAgreedToTermsChange={mockOnAgreedToTermsChange}
        />
      );

      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByText('Event Type & Format')).toBeInTheDocument();
      expect(screen.getByText('Date & Time')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('Category & Settings')).toBeInTheDocument();
    });

    test('should render 5 Edit buttons (one per review card)', () => {
      render(
        <ReviewSection
          formData={mockFormData}
          onEdit={mockOnEdit}
          onPublish={mockOnPublish}
          isPublishing={false}
          onAgreedToTermsChange={mockOnAgreedToTermsChange}
        />
      );

      const editButtons = screen.getAllByText('Edit');
      expect(editButtons).toHaveLength(5);
    });

    test('should display event title in Basic Information card', () => {
      render(
        <ReviewSection
          formData={mockFormData}
          onEdit={mockOnEdit}
          onPublish={mockOnPublish}
          isPublishing={false}
          onAgreedToTermsChange={mockOnAgreedToTermsChange}
        />
      );

      expect(screen.getByText('Test Event')).toBeInTheDocument();
    });

    test('should display language badge in Basic Information card', () => {
      render(
        <ReviewSection
          formData={mockFormData}
          onEdit={mockOnEdit}
          onPublish={mockOnPublish}
          isPublishing={false}
          onAgreedToTermsChange={mockOnAgreedToTermsChange}
        />
      );

      expect(screen.getByText('EN')).toBeInTheDocument();
    });

    test('should display event type badge', () => {
      render(
        <ReviewSection
          formData={mockFormData}
          onEdit={mockOnEdit}
          onPublish={mockOnPublish}
          isPublishing={false}
          onAgreedToTermsChange={mockOnAgreedToTermsChange}
        />
      );

      expect(screen.getByText('In-Person Event')).toBeInTheDocument();
    });

    test('should display location for in-person events', () => {
      render(
        <ReviewSection
          formData={mockFormData}
          onEdit={mockOnEdit}
          onPublish={mockOnPublish}
          isPublishing={false}
          onAgreedToTermsChange={mockOnAgreedToTermsChange}
        />
      );

      expect(screen.getByText('Test Location')).toBeInTheDocument();
    });
  });

  describe('Validation Status', () => {
    test('should show validation errors when form is incomplete', () => {
      const incompleteFormData: EventFormData = {
        ...mockFormData,
        title: '',
        description: '',
      };

      render(
        <ReviewSection
          formData={incompleteFormData}
          onEdit={mockOnEdit}
          onPublish={mockOnPublish}
          isPublishing={false}
          onAgreedToTermsChange={mockOnAgreedToTermsChange}
        />
      );

      expect(screen.getByText(/Please complete required fields/i)).toBeInTheDocument();
      expect(screen.getByText(/Event title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Event description is required/i)).toBeInTheDocument();
    });

    test('should NOT show validation errors when form is complete', () => {
      render(
        <ReviewSection
          formData={mockFormData}
          onEdit={mockOnEdit}
          onPublish={mockOnPublish}
          isPublishing={false}
          onAgreedToTermsChange={mockOnAgreedToTermsChange}
        />
      );

      expect(screen.queryByText(/Please complete required fields/i)).not.toBeInTheDocument();
    });

    test('should show location required error for in-person events without location', () => {
      const noLocationFormData: EventFormData = {
        ...mockFormData,
        location: '',
        venue_street: '',
        venue_city: '',
        venue_state: '',
      };

      render(
        <ReviewSection
          formData={noLocationFormData}
          onEdit={mockOnEdit}
          onPublish={mockOnPublish}
          isPublishing={false}
          onAgreedToTermsChange={mockOnAgreedToTermsChange}
        />
      );

      expect(screen.getByText(/Location is required for in-person events/i)).toBeInTheDocument();
    });

    test('should show virtual URL required error for online events without URL', () => {
      const onlineNoUrlFormData: EventFormData = {
        ...mockFormData,
        event_type: 'online',
        location: '',
        virtual_event_url: '',
      };

      render(
        <ReviewSection
          formData={onlineNoUrlFormData}
          onEdit={mockOnEdit}
          onPublish={mockOnPublish}
          isPublishing={false}
          onAgreedToTermsChange={mockOnAgreedToTermsChange}
        />
      );

      expect(screen.getByText(/Virtual event URL is required for online events/i)).toBeInTheDocument();
    });
  });

  describe('Ready to Publish Section', () => {
    test('should render Ready to Publish tips section', () => {
      render(
        <ReviewSection
          formData={mockFormData}
          onEdit={mockOnEdit}
          onPublish={mockOnPublish}
          isPublishing={false}
          onAgreedToTermsChange={mockOnAgreedToTermsChange}
        />
      );

      expect(screen.getByText(/Ready to Publish!/i)).toBeInTheDocument();
    });

    test('should display publishing tips', () => {
      render(
        <ReviewSection
          formData={mockFormData}
          onEdit={mockOnEdit}
          onPublish={mockOnPublish}
          isPublishing={false}
          onAgreedToTermsChange={mockOnAgreedToTermsChange}
        />
      );

      expect(screen.getByText(/Your event will be immediately visible to attendees/i)).toBeInTheDocument();
      expect(screen.getByText(/You can edit event details at any time/i)).toBeInTheDocument();
    });
  });
});
