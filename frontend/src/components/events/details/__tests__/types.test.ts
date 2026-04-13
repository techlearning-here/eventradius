import { Event, OrganizerProfile } from '../types';

describe('Event Types', () => {
  const mockEvent: Event = {
    id: 'test-event-123',
    title: 'Test Event',
    description: 'A test event description',
    location: '123 Test St, Test City',
    start_time: '2026-04-15T10:00:00Z',
    end_time: '2026-04-15T14:00:00Z',
    is_public: true,
    organizer_id: 'user-123',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    category: 'arts_culture',
    // New Event Wizard fields
    subtitle: 'An amazing test event',
    summary: 'Join us for this test event',
    tags: ['test', 'event', 'demo'],
    timezone: 'America/Los_Angeles',
    venue_street: '123 Test St',
    venue_city: 'Test City',
    venue_state: 'CA',
    venue_zip_code: '90210',
    venue_country: 'USA',
    venue_building_name: 'Test Building',
    virtual_event_url: 'https://zoom.us/j/123456',
    virtual_event_platform: 'Zoom',
    event_password: 'test123',
    is_paid_event: false,
    age_restriction: '18_plus',
    custom_refund_policy: 'No refunds after 24 hours',
  };

  const mockOrganizerProfile: OrganizerProfile = {
    business_name: 'Test Business',
    full_name: 'John Doe',
    email: 'john@test.com',
    phone: '123-456-7890',
  };

  it('should accept a valid Event object with all fields', () => {
    expect(mockEvent.id).toBe('test-event-123');
    expect(mockEvent.title).toBe('Test Event');
    expect(mockEvent.is_public).toBe(true);
    expect(mockEvent.subtitle).toBe('An amazing test event');
    expect(mockEvent.tags).toEqual(['test', 'event', 'demo']);
  });

  it('should accept a valid OrganizerProfile object', () => {
    expect(mockOrganizerProfile.business_name).toBe('Test Business');
    expect(mockOrganizerProfile.full_name).toBe('John Doe');
    expect(mockOrganizerProfile.email).toBe('john@test.com');
  });

  it('should have optional fields as undefined when not provided', () => {
    const minimalEvent: Event = {
      id: 'minimal-123',
      title: 'Minimal Event',
      is_public: false,
      organizer_id: 'user-456',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };

    expect(minimalEvent.subtitle).toBeUndefined();
    expect(minimalEvent.description).toBeUndefined();
    expect(minimalEvent.venue_street).toBeUndefined();
  });

  it('should support all venue address fields', () => {
    expect(mockEvent.venue_street).toBe('123 Test St');
    expect(mockEvent.venue_city).toBe('Test City');
    expect(mockEvent.venue_state).toBe('CA');
    expect(mockEvent.venue_zip_code).toBe('90210');
    expect(mockEvent.venue_country).toBe('USA');
    expect(mockEvent.venue_building_name).toBe('Test Building');
  });

  it('should support virtual event fields', () => {
    expect(mockEvent.virtual_event_url).toBe('https://zoom.us/j/123456');
    expect(mockEvent.virtual_event_platform).toBe('Zoom');
    expect(mockEvent.event_password).toBe('test123');
  });
});
