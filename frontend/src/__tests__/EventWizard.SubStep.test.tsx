// Test for the new sub-step wizard structure
import { render, screen, fireEvent } from '@testing-library/react';
import { EventWizard, type EventFormData } from '../components/CreateEvent/EventWizard';

// Mock all the components to focus on testing the sub-step structure
jest.mock('../components/CreateEvent/BasicInfo', () => {
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
  return function MockEventTypeSection({ eventType, onEventTypeChange, eventFormat, onEventFormatChange }: any) {
    return (
      <div>
        <select
          data-testid="event-type"
          value={eventType}
          onChange={(e) => onEventTypeChange(e.target.value)}
        >
          <option value="in_person">In Person</option>
          <option value="online">Online</option>
        </select>
        <select
          data-testid="event-format"
          value={eventFormat}
          onChange={(e) => onEventFormatChange(e.target.value)}
        >
          <option value="single">Single</option>
          <option value="recurring">Recurring</option>
        </select>
      </div>
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
  return function MockImageUpload() {
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

describe('Sub-Step EventWizard', () => {
  const mockOnSave = jest.fn();
  const mockOnPublish = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders first sub-step correctly', () => {
    render(<EventWizard onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    // Should show the first sub-step: Event Info
    expect(screen.getByText('Event Info')).toBeInTheDocument();
    expect(screen.getByText('Title, description and image')).toBeInTheDocument();
    expect(screen.getByTestId('event-title')).toBeInTheDocument();
    expect(screen.getByTestId('event-description')).toBeInTheDocument();
    expect(screen.getByTestId('image-upload')).toBeInTheDocument();
  });

  test('shows correct progress for sub-steps', () => {
    render(<EventWizard onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    // Should show "Step 1 of 6" (6 total sub-steps)
    expect(screen.getByText('Step 1 of 6')).toBeInTheDocument();
    expect(screen.getByText('16% Complete')).toBeInTheDocument(); // 1/6 = 16.67%
  });

  test('navigates through basic sub-steps correctly', () => {
    render(<EventWizard onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    // Step 1: Event Info
    expect(screen.getByText('Event Info')).toBeInTheDocument();
    
    // Fill required fields for Event Info
    const titleInput = screen.getByTestId('event-title');
    const descriptionInput = screen.getByTestId('event-description');
    fireEvent.change(titleInput, { target: { value: 'Test Event' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    
    // Click Next to go to Type & Format
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    // Step 2: Type & Format
    expect(screen.getByText('Type & Format')).toBeInTheDocument();
    expect(screen.getByText('Event type and format')).toBeInTheDocument();
    expect(screen.getByTestId('event-type')).toBeInTheDocument();
    expect(screen.getByTestId('event-format')).toBeInTheDocument();
    expect(screen.getByText('Step 2 of 6')).toBeInTheDocument();
    expect(screen.getByText('33% Complete')).toBeInTheDocument(); // 2/6 = 33.33%
    
    // Click Next to go to Date & Location
    fireEvent.click(nextButton);
    
    // Step 3: Date & Location
    expect(screen.getByText('Date & Location')).toBeInTheDocument();
    expect(screen.getByText('Schedule and venue')).toBeInTheDocument();
    expect(screen.getByTestId('start-date')).toBeInTheDocument();
    expect(screen.getByTestId('end-date')).toBeInTheDocument();
    expect(screen.getByText('Step 3 of 6')).toBeInTheDocument();
    expect(screen.getByText('50% Complete')).toBeInTheDocument(); // 3/6 = 50%
  });

  test('navigates through advanced sub-steps correctly', () => {
    render(<EventWizard onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    // Quickly navigate through all basic steps
    const nextButton = screen.getByText('Next');
    
    // Fill and skip through basic steps
    fireEvent.change(screen.getByTestId('event-title'), { target: { value: 'Test Event' } });
    fireEvent.change(screen.getByTestId('event-description'), { target: { value: 'Test Description' } });
    fireEvent.click(nextButton); // To Type & Format
    
    fireEvent.click(nextButton); // To Date & Location
    
    // Fill date and location to proceed
    fireEvent.change(screen.getByTestId('start-date'), { target: { value: '2026-12-01T10:00' } });
    fireEvent.change(screen.getByTestId('end-date'), { target: { value: '2026-12-01T12:00' } });
    fireEvent.change(screen.getByTestId('location'), { target: { value: 'Test Location' } });
    fireEvent.click(nextButton); // To Registration
    
    // Step 4: Registration
    expect(screen.getByText('Registration')).toBeInTheDocument();
    expect(screen.getByText('Registration settings')).toBeInTheDocument();
    expect(screen.getByTestId('registration-section')).toBeInTheDocument();
    expect(screen.getByText('Step 4 of 6')).toBeInTheDocument();
    expect(screen.getByText('66% Complete')).toBeInTheDocument(); // 4/6 = 66.67%
    
    fireEvent.click(nextButton); // To Ticketing
    
    // Step 5: Ticketing
    expect(screen.getByText('Ticketing')).toBeInTheDocument();
    expect(screen.getByText('Ticket types and pricing')).toBeInTheDocument();
    expect(screen.getByTestId('ticketing-section')).toBeInTheDocument();
    expect(screen.getByText('Step 5 of 6')).toBeInTheDocument();
    expect(screen.getByText('83% Complete')).toBeInTheDocument(); // 5/6 = 83.33%
    
    fireEvent.click(nextButton); // To Settings & Review
    
    // Step 6: Settings & Review
    expect(screen.getByText('Settings & Review')).toBeInTheDocument();
    expect(screen.getByText('Policies and publishing')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-section')).toBeInTheDocument();
    expect(screen.getByTestId('publish-button')).toBeInTheDocument();
    expect(screen.getByText('Step 6 of 6')).toBeInTheDocument();
    expect(screen.getByText('100% Complete')).toBeInTheDocument(); // 6/6 = 100%
  });

  test('sidebar navigation shows all sub-steps grouped by sections', () => {
    render(<EventWizard onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    // Should show section headers
    expect(screen.getByText('Basic Event Details')).toBeInTheDocument();
    expect(screen.getByText('Advanced Options')).toBeInTheDocument();
    
    // Should show all sub-steps under their sections
    expect(screen.getByText('Event Info')).toBeInTheDocument();
    expect(screen.getByText('Type & Format')).toBeInTheDocument();
    expect(screen.getByText('Date & Location')).toBeInTheDocument();
    expect(screen.getByText('Registration')).toBeInTheDocument();
    expect(screen.getByText('Ticketing')).toBeInTheDocument();
    expect(screen.getByText('Settings & Review')).toBeInTheDocument();
  });

  test('can navigate directly to any sub-step via sidebar', () => {
    render(<EventWizard onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    // Click on "Date & Location" in sidebar
    const dateLocationButton = screen.getAllByText('Date & Location')[1]; // Sidebar link
    fireEvent.click(dateLocationButton);
    
    // Should jump directly to that sub-step
    expect(screen.getByText('Date & Location')).toBeInTheDocument();
    expect(screen.getByText('Step 3 of 6')).toBeInTheDocument();
    expect(screen.getByText('50% Complete')).toBeInTheDocument();
  });

  test('previous navigation works correctly', () => {
    render(<EventWizard onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    // Navigate to second step
    fireEvent.change(screen.getByTestId('event-title'), { target: { value: 'Test Event' } });
    fireEvent.change(screen.getByTestId('event-description'), { target: { value: 'Test Description' } });
    fireEvent.click(screen.getByText('Next'));
    
    // Should be on Type & Format step
    expect(screen.getByText('Type & Format')).toBeInTheDocument();
    
    // Click Previous
    const previousButton = screen.getByText('Previous');
    fireEvent.click(previousButton);
    
    // Should be back on Event Info step
    expect(screen.getByText('Event Info')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 6')).toBeInTheDocument();
  });

  test('publish button appears on final step', () => {
    render(<EventWizard onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    // Navigate all the way to the final step
    const nextButton = screen.getByText('Next');
    
    // Quick navigation through all steps
    fireEvent.change(screen.getByTestId('event-title'), { target: { value: 'Test Event' } });
    fireEvent.change(screen.getByTestId('event-description'), { target: { value: 'Test Description' } });
    fireEvent.click(nextButton); // Type & Format
    fireEvent.click(nextButton); // Date & Location
    
    fireEvent.change(screen.getByTestId('start-date'), { target: { value: '2026-12-01T10:00' } });
    fireEvent.change(screen.getByTestId('end-date'), { target: { value: '2026-12-01T12:00' } });
    fireEvent.change(screen.getByTestId('location'), { target: { value: 'Test Location' } });
    fireEvent.click(nextButton); // Registration
    fireEvent.click(nextButton); // Ticketing
    fireEvent.click(nextButton); // Settings & Review
    
    // Should show publish button instead of next
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
    expect(screen.getByText('Publish Event')).toBeInTheDocument();
  });

  test('calls onPublish when publish button is clicked', () => {
    render(<EventWizard onSave={mockOnSave} onPublish={mockOnPublish} />);
    
    // Navigate to final step
    const nextButton = screen.getByText('Next');
    
    fireEvent.change(screen.getByTestId('event-title'), { target: { value: 'Test Event' } });
    fireEvent.change(screen.getByTestId('event-description'), { target: { value: 'Test Description' } });
    fireEvent.click(nextButton); // Type & Format
    fireEvent.click(nextButton); // Date & Location
    
    fireEvent.change(screen.getByTestId('start-date'), { target: { value: '2026-12-01T10:00' } });
    fireEvent.change(screen.getByTestId('end-date'), { target: { value: '2026-12-01T12:00' } });
    fireEvent.change(screen.getByTestId('location'), { target: { value: 'Test Location' } });
    fireEvent.click(nextButton); // Registration
    fireEvent.click(nextButton); // Ticketing
    fireEvent.click(nextButton); // Settings & Review
    
    // Click publish
    const publishButton = screen.getByTestId('publish-button');
    fireEvent.click(publishButton);
    
    expect(mockOnPublish).toHaveBeenCalled();
  });
});
