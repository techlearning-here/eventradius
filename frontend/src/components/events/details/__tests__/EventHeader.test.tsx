import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventHeader } from '../sections/EventHeader';
import { Event, OrganizerProfile } from '../types';

const mockOnClose = jest.fn();
const mockFormatLabel = (text: string | null | undefined) => text || '';

describe('EventHeader', () => {
  const mockEvent: Partial<Event> = {
    title: 'Annual Tech Conference',
    category: 'technology',
    event_type: 'in_person',
    is_public: true,
    background_image_url: 'https://example.com/image.jpg',
    tags: ['tech', 'conference', '2026'],
    creator: 'Tech Org',
    organizer_email: 'organizer@example.com',
  };

  const mockOrganizer: OrganizerProfile = {
    business_name: 'Tech Events LLC',
    full_name: 'Jane Smith',
    email: 'jane@techevents.com',
  };

  it('renders event title and category', () => {
    render(
      <EventHeader 
        event={mockEvent as Event}
        organizerProfile={null}
        onClose={mockOnClose}
        formatLabel={mockFormatLabel}
      />
    );
    
    expect(screen.getByText('Annual Tech Conference')).toBeInTheDocument();
    expect(screen.getByText('technology')).toBeInTheDocument();
  });

  it('renders organizer business name when available', () => {
    render(
      <EventHeader 
        event={mockEvent as Event}
        organizerProfile={mockOrganizer}
        onClose={mockOnClose}
        formatLabel={mockFormatLabel}
      />
    );
    
    expect(screen.getByText(/By Tech Events LLC/)).toBeInTheDocument();
  });

  it('falls back to organizer full name when business name not available', () => {
    const organizerWithoutBusiness: OrganizerProfile = {
      full_name: 'John Doe',
    };
    
    render(
      <EventHeader 
        event={mockEvent as Event}
        organizerProfile={organizerWithoutBusiness}
        onClose={mockOnClose}
        formatLabel={mockFormatLabel}
      />
    );
    
    expect(screen.getByText(/By John Doe/)).toBeInTheDocument();
  });

  it('falls back to creator when no organizer profile', () => {
    render(
      <EventHeader 
        event={mockEvent as Event}
        organizerProfile={null}
        onClose={mockOnClose}
        formatLabel={mockFormatLabel}
      />
    );
    
    expect(screen.getByText(/By Tech Org/)).toBeInTheDocument();
  });

  it('displays tags as hashtags', () => {
    render(
      <EventHeader 
        event={mockEvent as Event}
        organizerProfile={null}
        onClose={mockOnClose}
        formatLabel={mockFormatLabel}
      />
    );
    
    expect(screen.getByText('#tech')).toBeInTheDocument();
    expect(screen.getByText('#conference')).toBeInTheDocument();
    expect(screen.getByText('#2026')).toBeInTheDocument();
  });

  it('calls onClose when back button is clicked', () => {
    render(
      <EventHeader 
        event={mockEvent as Event}
        organizerProfile={null}
        onClose={mockOnClose}
        formatLabel={mockFormatLabel}
      />
    );
    
    const backButton = screen.getByText('Back to Events');
    fireEvent.click(backButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows "In Person Event" badge for in_person type', () => {
    render(
      <EventHeader 
        event={mockEvent as Event}
        organizerProfile={null}
        onClose={mockOnClose}
        formatLabel={mockFormatLabel}
      />
    );
    
    expect(screen.getByText('In Person Event')).toBeInTheDocument();
  });

  it('shows "Public Event" badge when is_public is true', () => {
    render(
      <EventHeader 
        event={mockEvent as Event}
        organizerProfile={null}
        onClose={mockOnClose}
        formatLabel={mockFormatLabel}
      />
    );
    
    expect(screen.getByText('Public Event')).toBeInTheDocument();
  });

  it('does not show "Public Event" badge when is_public is false', () => {
    const privateEvent: Partial<Event> = {
      ...mockEvent,
      is_public: false,
    };
    
    render(
      <EventHeader 
        event={privateEvent as Event}
        organizerProfile={null}
        onClose={mockOnClose}
        formatLabel={mockFormatLabel}
      />
    );
    
    expect(screen.queryByText('Public Event')).not.toBeInTheDocument();
  });

  it('falls back to organizer_email when no creator or profile', () => {
    const eventWithEmail: Partial<Event> = {
      title: 'Email Event',
      category: 'general',
      is_public: true,
      organizer_email: 'fallback@example.com',
    };
    
    render(
      <EventHeader 
        event={eventWithEmail as Event}
        organizerProfile={null}
        onClose={mockOnClose}
        formatLabel={mockFormatLabel}
      />
    );
    
    expect(screen.getByText(/By fallback@example.com/)).toBeInTheDocument();
  });

  it('falls back to "Event Organizer" when no organizer info', () => {
    const eventWithNoOrganizer: Partial<Event> = {
      title: 'Anonymous Event',
      category: 'general',
      is_public: true,
    };
    
    render(
      <EventHeader 
        event={eventWithNoOrganizer as Event}
        organizerProfile={null}
        onClose={mockOnClose}
        formatLabel={mockFormatLabel}
      />
    );
    
    expect(screen.getByText(/By Event Organizer/)).toBeInTheDocument();
  });

  it('does not render tags section when no tags exist', () => {
    const eventWithoutTags: Partial<Event> = {
      ...mockEvent,
      tags: undefined,
    };
    
    render(
      <EventHeader 
        event={eventWithoutTags as Event}
        organizerProfile={null}
        onClose={mockOnClose}
        formatLabel={mockFormatLabel}
      />
    );
    
    expect(screen.queryByText('#tech')).not.toBeInTheDocument();
  });
});
