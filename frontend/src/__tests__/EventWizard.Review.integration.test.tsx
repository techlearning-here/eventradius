import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EventWizard } from '../components/EventWizard/EventWizard';

// Mock all child components to isolate EventWizard behavior
jest.mock('../components/EventWizard/BasicInfo', () => ({
  BasicInfo: ({ eventName, onEventNameChange, description, onDescriptionChange }: any) => (
    <div data-testid="basic-info-step">
      <input
        data-testid="event-title"
        value={eventName || ''}
        onChange={(e) => onEventNameChange(e.target.value)}
        placeholder="Event Title"
      />
      <textarea
        data-testid="event-description"
        value={description || ''}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="Event Description"
      />
    </div>
  ),
}));

jest.mock('../components/EventWizard/EventTypeSection', () => ({
  EventTypeSection: ({ eventType, onEventTypeChange, eventFormat, onEventFormatChange }: any) => (
    <div data-testid="event-type-step">
      <select
        data-testid="event-type"
        value={eventType}
        onChange={(e) => onEventTypeChange(e.target.value)}
      >
        <option value="in_person">In Person</option>
        <option value="online">Online</option>
        <option value="hybrid">Hybrid</option>
      </select>
      <select
        data-testid="event-format"
        value={eventFormat}
        onChange={(e) => onEventFormatChange(e.target.value)}
      >
        <option value="single">Single Event</option>
        <option value="recurring">Recurring</option>
        <option value="multi_date">Multi-Date</option>
      </select>
    </div>
  ),
}));

jest.mock('../components/EventWizard/ContactInfo', () => ({
  ContactInfo: ({ contactPhone, onContactPhoneChange, contactEmail, onContactEmailChange }: any) => (
    <div data-testid="contact-info-step">
      <input
        data-testid="contact-phone"
        value={contactPhone || ''}
        onChange={(e) => onContactPhoneChange(e.target.value)}
        placeholder="Phone"
      />
      <input
        data-testid="contact-email"
        value={contactEmail || ''}
        onChange={(e) => onContactEmailChange(e.target.value)}
        placeholder="Email"
      />
    </div>
  ),
}));

jest.mock('../components/EventWizard/ReviewSection', () => ({
  ReviewSection: ({ formData, onEdit, onPublish, isPublishing, onAgreedToTermsChange }: any) => (
    <div data-testid="review-section">
      <div data-testid="review-title">{formData.title || 'Untitled'}</div>
      <div data-testid="review-type">{formData.event_type}</div>
      
      {/* Edit buttons for each section */}
      <button data-testid="edit-basic" onClick={() => onEdit('info')}>Edit Basic</button>
      <button data-testid="edit-type" onClick={() => onEdit('type')}>Edit Type</button>
      <button data-testid="edit-contact" onClick={() => onEdit('contact')}>Edit Contact</button>
      
      {/* Terms checkbox */}
      <label>
        <input
          data-testid="terms-checkbox"
          type="checkbox"
          onChange={(e) => onAgreedToTermsChange?.(e.target.checked)}
        />
        I agree to terms
      </label>
      
      {/* Publish button removed - should be in parent navigation only */}
    </div>
  ),
}));

describe('EventWizard Review Page Integration', () => {
  const mockOnPublish = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Edit Navigation from Review Page', () => {
    test('should navigate to info step when clicking Edit from review', async () => {
      render(<EventWizard onPublish={mockOnPublish} />);

      // Fill basic info and navigate to review
      fireEvent.change(screen.getByTestId('event-title'), { target: { value: 'Test Event' } });
      fireEvent.change(screen.getByTestId('event-description'), { target: { value: 'Test Description' } });
      fireEvent.change(screen.getByTestId('event-type'), { target: { value: 'in_person' } });
      
      // Navigate through all steps to reach review
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton); // to type step
      fireEvent.click(nextButton); // to contact step
      fireEvent.click(nextButton); // to review step

      // Should be on review step
      await waitFor(() => {
        expect(screen.getByTestId('review-section')).toBeInTheDocument();
      });

      // Click Edit Basic button
      fireEvent.click(screen.getByTestId('edit-basic'));

      // Should navigate back to info step
      await waitFor(() => {
        expect(screen.getByTestId('basic-info-step')).toBeInTheDocument();
      });
    });

    test('should navigate to type step when clicking Edit Type from review', async () => {
      render(<EventWizard onPublish={mockOnPublish} />);

      // Fill and navigate to review
      fireEvent.change(screen.getByTestId('event-title'), { target: { value: 'Test Event' } });
      fireEvent.change(screen.getByTestId('event-description'), { target: { value: 'Test Description' } });
      fireEvent.change(screen.getByTestId('event-type'), { target: { value: 'in_person' } });
      
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('review-section')).toBeInTheDocument();
      });

      // Click Edit Type button
      fireEvent.click(screen.getByTestId('edit-type'));

      // Should navigate to type step
      await waitFor(() => {
        expect(screen.getByTestId('event-type-step')).toBeInTheDocument();
      });
    });

    test('should navigate to contact step when clicking Edit Contact from review', async () => {
      render(<EventWizard onPublish={mockOnPublish} />);

      // Fill and navigate to review
      fireEvent.change(screen.getByTestId('event-title'), { target: { value: 'Test Event' } });
      fireEvent.change(screen.getByTestId('event-description'), { target: { value: 'Test Description' } });
      fireEvent.change(screen.getByTestId('event-type'), { target: { value: 'in_person' } });
      
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('review-section')).toBeInTheDocument();
      });

      // Click Edit Contact button
      fireEvent.click(screen.getByTestId('edit-contact'));

      // Should navigate to contact step
      await waitFor(() => {
        expect(screen.getByTestId('contact-info-step')).toBeInTheDocument();
      });
    });
  });

  describe('Publish Button Disabled State', () => {
    test('should disable Publish button when terms are not agreed', async () => {
      render(<EventWizard onPublish={mockOnPublish} />);

      // Fill required fields and navigate to review
      fireEvent.change(screen.getByTestId('event-title'), { target: { value: 'Test Event' } });
      fireEvent.change(screen.getByTestId('event-description'), { target: { value: 'Test Description' } });
      fireEvent.change(screen.getByTestId('event-type'), { target: { value: 'in_person' } });
      
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('review-section')).toBeInTheDocument();
      });

      // Get the Publish button in navigation
      const publishButton = screen.getByText('Publish Event');
      
      // Should be disabled because terms not checked
      expect(publishButton).toBeDisabled();
    });

    test('should enable Publish button when terms are agreed', async () => {
      render(<EventWizard onPublish={mockOnPublish} />);

      // Fill required fields and navigate to review
      fireEvent.change(screen.getByTestId('event-title'), { target: { value: 'Test Event' } });
      fireEvent.change(screen.getByTestId('event-description'), { target: { value: 'Test Description' } });
      fireEvent.change(screen.getByTestId('event-type'), { target: { value: 'in_person' } });
      
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('review-section')).toBeInTheDocument();
      });

      // Check the terms checkbox
      fireEvent.click(screen.getByTestId('terms-checkbox'));

      // Get the Publish button in navigation
      const publishButton = screen.getByText('Publish Event');
      
      // Should be enabled now
      expect(publishButton).not.toBeDisabled();
    });

    test('should disable Publish button when terms are unchecked after being checked', async () => {
      render(<EventWizard onPublish={mockOnPublish} />);

      // Fill required fields and navigate to review
      fireEvent.change(screen.getByTestId('event-title'), { target: { value: 'Test Event' } });
      fireEvent.change(screen.getByTestId('event-description'), { target: { value: 'Test Description' } });
      fireEvent.change(screen.getByTestId('event-type'), { target: { value: 'in_person' } });
      
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('review-section')).toBeInTheDocument();
      });

      // Check then uncheck
      const checkbox = screen.getByTestId('terms-checkbox');
      fireEvent.click(checkbox); // check
      fireEvent.click(checkbox); // uncheck

      // Get the Publish button in navigation
      const publishButton = screen.getByText('Publish Event');
      
      // Should be disabled again
      expect(publishButton).toBeDisabled();
    });
  });

  describe('Single Publish Button', () => {
    test('should have only one Publish Event button on review page', async () => {
      render(<EventWizard onPublish={mockOnPublish} />);

      // Fill and navigate to review
      fireEvent.change(screen.getByTestId('event-title'), { target: { value: 'Test Event' } });
      fireEvent.change(screen.getByTestId('event-description'), { target: { value: 'Test Description' } });
      fireEvent.change(screen.getByTestId('event-type'), { target: { value: 'in_person' } });
      
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('review-section')).toBeInTheDocument();
      });

      // Should have exactly one "Publish Event" button (in the navigation)
      const publishButtons = screen.queryAllByText('Publish Event');
      expect(publishButtons).toHaveLength(1);
    });

    test('should have no duplicate Publish Event buttons', async () => {
      render(<EventWizard onPublish={mockOnPublish} />);

      // Fill and navigate to review
      fireEvent.change(screen.getByTestId('event-title'), { target: { value: 'Test Event' } });
      fireEvent.change(screen.getByTestId('event-description'), { target: { value: 'Test Description' } });
      fireEvent.change(screen.getByTestId('event-type'), { target: { value: 'in_person' } });
      
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('review-section')).toBeInTheDocument();
      });

      // Count all Publish Event buttons - should be exactly 1
      const allPublishButtons = screen.queryAllByText(/Publish Event/i);
      expect(allPublishButtons.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Publish Button State Transitions', () => {
    test('should show Publishing... text when publish is in progress', async () => {
      // Mock a delayed publish
      mockOnPublish.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<EventWizard onPublish={mockOnPublish} />);

      // Fill required fields and navigate to review
      fireEvent.change(screen.getByTestId('event-title'), { target: { value: 'Test Event' } });
      fireEvent.change(screen.getByTestId('event-description'), { target: { value: 'Test Description' } });
      fireEvent.change(screen.getByTestId('event-type'), { target: { value: 'in_person' } });
      
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('review-section')).toBeInTheDocument();
      });

      // Check terms
      fireEvent.click(screen.getByTestId('terms-checkbox'));

      // Click publish
      const publishButton = screen.getByText('Publish Event');
      fireEvent.click(publishButton);

      // Should show Publishing... text
      await waitFor(() => {
        expect(screen.getByText('Publishing...')).toBeInTheDocument();
      });
    });
  });
});
