// Simple test to verify the simplified EventWizard works correctly
import { render, screen, fireEvent } from '@testing-library/react';
import { EventWizard, type EventFormData } from '../components/EventWizard/EventWizard';

// Mock the components to avoid dependency issues
jest.mock('../components/EventWizard/BasicInfo', () => {
  return function MockBasicInfo({ eventName, onEventNameChange, description, onDescriptionChange }: any) {
    return (
      <div>
        <input
          data-testid="event-title"
          value={eventName}
          onChange={(e) => onEventNameChange(e.target.value)}
          placeholder="Event Title"
        />
        <textarea
          data-testid="event-description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Event Description"
        />
      </div>
    );
  };
});

jest.mock('../components/CreateEvent/EventTypeSection', () => {
  return function MockEventTypeSection({ eventType, onEventTypeChange }: any) {
    return (
      <select
        data-testid="event-type"
        value={eventType}
        onChange={(e) => onEventTypeChange(e.target.value)}
      >
        <option value="in_person">In Person</option>
        <option value="online">Online</option>
        <option value="hybrid">Hybrid</option>
      </select>
    );
  };
});

jest.mock('../components/CreateEvent/DateTimeSection', () => {
  return function MockDateTimeSection({ startDate, onStartDateChange, endDate, onEndDateChange }: any) {
    return (
      <div>
        <input
          data-testid="start-date"
          type="datetime-local"
          value={startDate ? new Date(startDate).toISOString().slice(0, 16) : ''}
          onChange={(e) => onStartDateChange(new Date(e.target.value))}
        />
        <input
          data-testid="end-date"
          type="datetime-local"
          value={endDate ? new Date(endDate).toISOString().slice(0, 16) : ''}
          onChange={(e) => onEndDateChange(new Date(e.target.value))}
        />
      </div>
    );
  };
});

jest.mock('../components/CreateEvent/LocationSection', () => {
  return function MockLocationSection({ location, onLocationChange, eventType }: any) {
    if (eventType === 'online') {
      return (
        <input
          data-testid="virtual-url"
          value=""
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder="Virtual Event URL"
        />
      );
    }
    return (
      <input
        data-testid="location"
        value={location}
        onChange={(e) => onLocationChange(e.target.value)}
        placeholder="Event Location"
      />
    );
  };
});

jest.mock('../components/CreateEvent/ImageUpload', () => {
  return function MockImageUpload({ onImageUpload }: any) {
    return <div data-testid="image-upload">Image Upload Component</div>;
  };
});

jest.mock('../components/CreateEvent/RegistrationSection', () => {
  return function MockRegistrationSection() {
    return <div data-testid="registration-section">Registration Section</div>;
  };
});

jest.mock('../components/CreateEvent/TicketingSection', () => {
  return function MockTicketingSection() {
    return <div data-testid="ticketing-section">Ticketing Section</div>;
  };
});

jest.mock('../components/CreateEvent/AdvancedSection', () => {
  return function MockAdvancedSection() {
    return <div data-testid="advanced-section">Advanced Section</div>;
  };
});

jest.mock('../components/CreateEvent/ReviewSection', () => {
  return function MockReviewSection({ onPublish }: any) {
    return (
      <button data-testid="publish-button" onClick={onPublish}>
        Publish Event
      </button>
    );
  };
});

describe('Simplified EventWizard', () => {
  const mockOnSave = jest.fn();
  const mockOnPublish = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders basic event details step by default', () => {
    render(<EventWizard onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    expect(screen.getByText('Basic Event Details')).toBeInTheDocument();
    expect(screen.getByText('Essential information for your event')).toBeInTheDocument();
    expect(screen.getByTestId('event-title')).toBeInTheDocument();
    expect(screen.getByTestId('event-description')).toBeInTheDocument();
    expect(screen.getByTestId('event-type')).toBeInTheDocument();
  });

  test('allows filling basic event details', () => {
    render(<EventWizard onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    const titleInput = screen.getByTestId('event-title');
    const descriptionInput = screen.getByTestId('event-description');
    const eventTypeSelect = screen.getByTestId('event-type');
    
    fireEvent.change(titleInput, { target: { value: 'Test Event' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.change(eventTypeSelect, { target: { value: 'in_person' } });
    
    expect(titleInput).toHaveValue('Test Event');
    expect(descriptionInput).toHaveValue('Test Description');
    expect(eventTypeSelect).toHaveValue('in_person');
  });

  test('shows validation errors for incomplete basic details', () => {
    render(<EventWizard onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  test('enables next button when basic details are complete', () => {
    render(<EventWizard onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    const titleInput = screen.getByTestId('event-title');
    const descriptionInput = screen.getByTestId('event-description');
    const startDateInput = screen.getByTestId('start-date');
    const endDateInput = screen.getByTestId('end-date');
    const locationInput = screen.getByTestId('location');
    const nextButton = screen.getByText('Next');
    
    // Fill required fields
    fireEvent.change(titleInput, { target: { value: 'Test Event' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.change(startDateInput, { target: { value: '2026-12-01T10:00' } });
    fireEvent.change(endDateInput, { target: { value: '2026-12-01T12:00' } });
    fireEvent.change(locationInput, { target: { value: 'Test Location' } });
    
    // Next button should be enabled
    expect(nextButton).not.toBeDisabled();
  });

  test('navigates to advanced step when next is clicked', () => {
    render(<EventWizard onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    const titleInput = screen.getByTestId('event-title');
    const descriptionInput = screen.getByTestId('event-description');
    const startDateInput = screen.getByTestId('start-date');
    const endDateInput = screen.getByTestId('end-date');
    const locationInput = screen.getByTestId('location');
    const nextButton = screen.getByText('Next');
    
    // Fill required fields
    fireEvent.change(titleInput, { target: { value: 'Test Event' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.change(startDateInput, { target: { value: '2026-12-01T10:00' } });
    fireEvent.change(endDateInput, { target: { value: '2026-12-01T12:00' } });
    fireEvent.change(locationInput, { target: { value: 'Test Location' } });
    
    // Click next
    fireEvent.click(nextButton);
    
    // Should show advanced step
    expect(screen.getByText('Advanced Options')).toBeInTheDocument();
    expect(screen.getByText('Additional settings and features (optional)')).toBeInTheDocument();
    expect(screen.getByTestId('registration-section')).toBeInTheDocument();
    expect(screen.getByTestId('ticketing-section')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-section')).toBeInTheDocument();
  });

  test('shows publish button on advanced step', () => {
    render(<EventWizard onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    // Fill basic details and navigate to advanced
    const titleInput = screen.getByTestId('event-title');
    const descriptionInput = screen.getByTestId('event-description');
    const startDateInput = screen.getByTestId('start-date');
    const endDateInput = screen.getByTestId('end-date');
    const locationInput = screen.getByTestId('location');
    const nextButton = screen.getByText('Next');
    
    fireEvent.change(titleInput, { target: { value: 'Test Event' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.change(startDateInput, { target: { value: '2026-12-01T10:00' } });
    fireEvent.change(endDateInput, { target: { value: '2026-12-01T12:00' } });
    fireEvent.change(locationInput, { target: { value: 'Test Location' } });
    fireEvent.click(nextButton);
    
    // Should show publish button
    expect(screen.getByTestId('publish-button')).toBeInTheDocument();
    expect(screen.getByText('Publish Event')).toBeInTheDocument();
  });

  test('calls onPublish when publish is clicked', () => {
    render(<EventWizard onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    // Fill basic details and navigate to advanced
    const titleInput = screen.getByTestId('event-title');
    const descriptionInput = screen.getByTestId('event-description');
    const startDateInput = screen.getByTestId('start-date');
    const endDateInput = screen.getByTestId('end-date');
    const locationInput = screen.getByTestId('location');
    const nextButton = screen.getByText('Next');
    
    fireEvent.change(titleInput, { target: { value: 'Test Event' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.change(startDateInput, { target: { value: '2026-12-01T10:00' } });
    fireEvent.change(endDateInput, { target: { value: '2026-12-01T12:00' } });
    fireEvent.change(locationInput, { target: { value: 'Test Location' } });
    fireEvent.click(nextButton);
    
    // Click publish
    const publishButton = screen.getByTestId('publish-button');
    fireEvent.click(publishButton);
    
    expect(mockOnPublish).toHaveBeenCalled();
  });
});
