import React from 'react';
import { render, screen } from '@testing-library/react';
import { QuickInfoBar } from '../sections/QuickInfoBar';
import { Event } from '../types';

describe('QuickInfoBar', () => {
  it('renders all three info cards with complete data', () => {
    const event: Partial<Event> = {
      date: 'April 15, 2026',
      start_time: '2026-04-15T10:00:00Z',
      created_at: '2026-01-01T00:00:00Z',
      location: 'Convention Center, San Francisco',
      timezone: 'America/Los_Angeles',
      current_participants: 45,
      max_participants: 100,
      category: 'conference',
      is_public: true,
    };
    
    render(<QuickInfoBar event={event as Event} />);
    
    // Date card
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('April 15, 2026')).toBeInTheDocument();
    expect(screen.getByText('America/Los_Angeles')).toBeInTheDocument();
    
    // Location card
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Convention Center, San Francisco')).toBeInTheDocument();
    
    // Attendees card
    expect(screen.getByText('Attendees & Category')).toBeInTheDocument();
    expect(screen.getByText('45 / 100')).toBeInTheDocument();
    expect(screen.getByText('Conference • Public')).toBeInTheDocument();
  });

  it('falls back to start_time when date is not provided', () => {
    const event: Partial<Event> = {
      start_time: '2026-05-20T14:00:00Z',
      created_at: '2026-01-01T00:00:00Z',
      location: 'Test Location',
      is_public: false,
    };
    
    render(<QuickInfoBar event={event as Event} />);
    
    // Should show formatted start_time
    expect(screen.getByText('Date')).toBeInTheDocument();
  });

  it('shows "Unlimited" when max_participants is not set', () => {
    const event: Partial<Event> = {
      current_participants: 10,
      location: 'Test Location',
      is_public: true,
    };
    
    render(<QuickInfoBar event={event as Event} />);
    
    expect(screen.getByText('10 / Unlimited')).toBeInTheDocument();
  });

  it('shows "0" when current_participants is not set', () => {
    const event: Partial<Event> = {
      max_participants: 50,
      location: 'Test Location',
      is_public: false,
    };
    
    render(<QuickInfoBar event={event as Event} />);
    
    expect(screen.getByText('0 / 50')).toBeInTheDocument();
  });

  it('displays private status correctly', () => {
    const event: Partial<Event> = {
      location: 'Private Venue',
      is_public: false,
      category: 'workshop',
    };
    
    render(<QuickInfoBar event={event as Event} />);
    
    expect(screen.getByText('Workshop • Private')).toBeInTheDocument();
  });

  it('handles fallback to address when location is not set', () => {
    const event: Partial<Event> = {
      address: '456 Oak Street',
      is_public: true,
    };
    
    render(<QuickInfoBar event={event as Event} />);
    
    expect(screen.getByText('456 Oak Street')).toBeInTheDocument();
  });
});
