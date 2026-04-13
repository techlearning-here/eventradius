import React from 'react';
import { render, screen } from '@testing-library/react';
import { VirtualEventSection } from '../sections/VirtualEventSection';
import { Event } from '../types';

describe('VirtualEventSection', () => {
  it('renders all virtual event details', () => {
    const event: Partial<Event> = {
      virtual_event_platform: 'Zoom',
      virtual_event_url: 'https://zoom.us/j/123456',
      event_password: 'secret123',
    };
    
    render(<VirtualEventSection event={event as Event} />);
    
    expect(screen.getByText('Virtual Event Details')).toBeInTheDocument();
    expect(screen.getByText('Join Online')).toBeInTheDocument();
    expect(screen.getByText('Zoom')).toBeInTheDocument();
    expect(screen.getByText('Join Virtual Event')).toBeInTheDocument();
    expect(screen.getByText('Password:')).toBeInTheDocument();
    expect(screen.getByText('secret123')).toBeInTheDocument();
  });

  it('renders only platform when no URL or password', () => {
    const event: Partial<Event> = {
      virtual_event_platform: 'Google Meet',
    };
    
    render(<VirtualEventSection event={event as Event} />);
    
    expect(screen.getByText('Virtual Event Details')).toBeInTheDocument();
    expect(screen.getByText('Google Meet')).toBeInTheDocument();
    expect(screen.queryByText('Join Virtual Event')).not.toBeInTheDocument();
    expect(screen.queryByText('Password:')).not.toBeInTheDocument();
  });

  it('renders only URL when no platform or password', () => {
    const event: Partial<Event> = {
      virtual_event_url: 'https://teams.microsoft.com/l/meetup-join',
    };
    
    render(<VirtualEventSection event={event as Event} />);
    
    expect(screen.getByText('Virtual Event Details')).toBeInTheDocument();
    expect(screen.getByText('Join Virtual Event')).toBeInTheDocument();
    expect(screen.queryByText('Password:')).not.toBeInTheDocument();
  });

  it('returns null when no virtual event data', () => {
    const event: Partial<Event> = {
      title: 'In-person Event',
    };
    
    const { container } = render(<VirtualEventSection event={event as Event} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('has correct link attributes for external URL', () => {
    const event: Partial<Event> = {
      virtual_event_url: 'https://zoom.us/j/123456',
    };
    
    render(<VirtualEventSection event={event as Event} />);
    
    const link = screen.getByText('Join Virtual Event').closest('a');
    expect(link).toHaveAttribute('href', 'https://zoom.us/j/123456');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
