import React from 'react';
import { render, screen } from '@testing-library/react';
import { AboutSection } from '../sections/AboutSection';
import { Event } from '../types';

const mockEvent: Partial<Event> = {
  title: 'Test Event',
  description: 'This is a test description\nWith multiple paragraphs',
  subtitle: 'Event Subtitle',
  summary: 'Event Summary',
};

describe('AboutSection', () => {
  it('renders all content when all fields are provided', () => {
    render(<AboutSection event={mockEvent as Event} />);
    
    expect(screen.getByText('About This Event')).toBeInTheDocument();
    expect(screen.getByText('Event Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Event Summary')).toBeInTheDocument();
    expect(screen.getByText('This is a test description')).toBeInTheDocument();
    expect(screen.getByText('With multiple paragraphs')).toBeInTheDocument();
  });

  it('renders only description when subtitle and summary are missing', () => {
    const eventWithoutExtras: Partial<Event> = {
      description: 'Only description',
    };
    
    render(<AboutSection event={eventWithoutExtras as Event} />);
    
    expect(screen.getByText('About This Event')).toBeInTheDocument();
    expect(screen.getByText('Only description')).toBeInTheDocument();
    expect(screen.queryByText('Event Subtitle')).not.toBeInTheDocument();
  });

  it('returns null when no content is provided', () => {
    const { container } = render(<AboutSection event={{ title: 'Test' } as Event} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders only subtitle when provided', () => {
    const eventWithSubtitle: Partial<Event> = {
      subtitle: 'Just a subtitle',
    };
    
    render(<AboutSection event={eventWithSubtitle as Event} />);
    
    expect(screen.getByText('Just a subtitle')).toBeInTheDocument();
    expect(screen.queryByText('Event Summary')).not.toBeInTheDocument();
  });

  it('renders only summary when provided', () => {
    const eventWithSummary: Partial<Event> = {
      summary: 'Just a summary',
    };
    
    render(<AboutSection event={eventWithSummary as Event} />);
    
    expect(screen.getByText('Just a summary')).toBeInTheDocument();
    expect(screen.queryByText('Event Subtitle')).not.toBeInTheDocument();
  });
});
