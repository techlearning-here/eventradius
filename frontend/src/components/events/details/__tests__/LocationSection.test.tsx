import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LocationSection } from '../sections/LocationSection';
import { Event } from '../types';

const mockOnGetDirections = jest.fn();

describe('LocationSection', () => {
  it('renders location with map iframe', () => {
    const event: Partial<Event> = {
      location: '123 Main St, San Francisco, CA',
    };
    
    render(<LocationSection event={event as Event} onGetDirections={mockOnGetDirections} />);
    
    expect(screen.getByText('Location & Venue')).toBeInTheDocument();
    expect(screen.getByText('123 Main St, San Francisco, CA')).toBeInTheDocument();
    expect(screen.getByTitle('Event location map')).toBeInTheDocument();
  });

  it('renders with address when location is not provided', () => {
    const event: Partial<Event> = {
      address: '456 Oak Ave, Los Angeles, CA',
    };
    
    render(<LocationSection event={event as Event} onGetDirections={mockOnGetDirections} />);
    
    expect(screen.getByText('456 Oak Ave, Los Angeles, CA')).toBeInTheDocument();
  });

  it('renders venue address details when provided', () => {
    const event: Partial<Event> = {
      location: 'Convention Center',
      venue_building_name: 'Main Hall',
      venue_street: '789 Center Blvd',
      venue_city: 'New York',
      venue_state: 'NY',
      venue_zip_code: '10001',
      venue_country: 'USA',
    };
    
    render(<LocationSection event={event as Event} onGetDirections={mockOnGetDirections} />);
    
    expect(screen.getByText('Venue Address')).toBeInTheDocument();
    expect(screen.getByText('Main Hall')).toBeInTheDocument();
    expect(screen.getByText('789 Center Blvd')).toBeInTheDocument();
    expect(screen.getByText('New York, NY, 10001')).toBeInTheDocument();
    expect(screen.getByText('USA')).toBeInTheDocument();
  });

  it('calls onGetDirections when button is clicked', () => {
    const event: Partial<Event> = {
      location: 'Test Location',
    };
    
    render(<LocationSection event={event as Event} onGetDirections={mockOnGetDirections} />);
    
    const button = screen.getByText('Get Directions');
    fireEvent.click(button);
    
    expect(mockOnGetDirections).toHaveBeenCalledTimes(1);
  });

  it('returns null when no location, address, or venue details exist', () => {
    const event: Partial<Event> = {
      title: 'Test Event',
    };
    
    const { container } = render(<LocationSection event={event as Event} onGetDirections={mockOnGetDirections} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('renders partial venue address (only city/state)', () => {
    const event: Partial<Event> = {
      location: 'City Park',
      venue_city: 'Chicago',
      venue_state: 'IL',
    };
    
    render(<LocationSection event={event as Event} onGetDirections={mockOnGetDirections} />);
    
    expect(screen.getByText('Venue Address')).toBeInTheDocument();
    expect(screen.getByText('Chicago, IL')).toBeInTheDocument();
  });
});
