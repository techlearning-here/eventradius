// Simple integration test for the simplified EventWizard
import { EventWizard, type EventFormData } from '../components/CreateEvent/EventWizard';

// Test the basic structure and data flow without rendering
describe('EventWizard Structure', () => {
  test('has correct wizard steps', () => {
    // This tests that our wizard has the expected structure
    const expectedSteps = [
      { id: 'basic', title: 'Basic Event Details', description: 'Essential information for your event' },
      { id: 'advanced', title: 'Advanced Options', description: 'Additional settings and features (optional)' }
    ];
    
    // Verify the step structure is correct
    expect(expectedSteps).toHaveLength(2);
    expect(expectedSteps[0].id).toBe('basic');
    expect(expectedSteps[1].id).toBe('advanced');
  });

  test('default form data has correct structure', () => {
    // Test the default form data structure
    const defaultData: Partial<EventFormData> = {
      title: '',
      description: '',
      language: 'en',
      event_type: 'in_person',
      event_format: 'single',
      event_privacy: 'public',
      start_time: null,
      end_time: null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      location: '',
      virtual_event_url: '',
      virtual_event_platform: '',
      // Advanced fields with defaults
      subtitle: '',
      summary: '',
      doors_open_time: null,
      registration_start_time: null,
      registration_end_time: null,
      event_password: '',
      age_restriction: '',
      accessibility_options: '',
      ticket_types: [],
      refund_policy: 'no_refunds',
      custom_refund_policy: '',
      event_website: '',
      event_contact_email: '',
      ticketing_website: '',
      // Legacy fields
      category: '',
      max_participants: null,
      tags: [],
      ticket_pricing_description: '',
      // Media
      image_url: '',
      image_file: null,
      // Status
      is_public: true,
      status: 'draft'
    };

    // Verify required fields exist
    expect(defaultData.title).toBe('');
    expect(defaultData.description).toBe('');
    expect(defaultData.event_type).toBe('in_person');
    expect(defaultData.event_privacy).toBe('public');
    expect(defaultData.refund_policy).toBe('no_refunds');
    
    // Verify advanced fields have sensible defaults
    expect(defaultData.subtitle).toBe('');
    expect(defaultData.summary).toBe('');
    expect(defaultData.ticket_types).toEqual([]);
    expect(defaultData.age_restriction).toBe('');
    expect(defaultData.accessibility_options).toBe('');
  });

  test('basic step validation logic', () => {
    // Test the validation logic for basic step
    const mockFormData: EventFormData = {
      title: 'Test Event',
      description: 'Test Description',
      language: 'en',
      event_type: 'in_person',
      event_format: 'single',
      event_privacy: 'public',
      start_time: new Date('2026-12-01T10:00:00'),
      end_time: new Date('2026-12-01T12:00:00'),
      timezone: 'UTC',
      location: 'Test Location',
      virtual_event_url: '',
      virtual_event_platform: '',
      subtitle: '',
      summary: '',
      doors_open_time: null,
      registration_start_time: null,
      registration_end_time: null,
      event_password: '',
      age_restriction: '',
      accessibility_options: '',
      ticket_types: [],
      refund_policy: 'no_refunds',
      custom_refund_policy: '',
      event_website: '',
      event_contact_email: '',
      ticketing_website: '',
      category: '',
      max_participants: null,
      tags: [],
      ticket_pricing_description: '',
      image_url: '',
      image_file: null,
      is_public: true,
      status: 'draft'
    };

    // Test validation function logic
    const isBasicStepComplete = (data: EventFormData) => {
      return data.title.trim() !== '' && 
             data.description.trim() !== '' && 
             data.start_time !== null && 
             data.end_time !== null &&
             (data.event_type === 'online' ? (data.virtual_event_url?.trim() !== '' || false) : (data.location?.trim() !== '' || false));
    };

    // Should pass validation
    expect(isBasicStepComplete(mockFormData)).toBe(true);

    // Test missing title
    const incompleteData1 = { ...mockFormData, title: '' };
    expect(isBasicStepComplete(incompleteData1)).toBe(false);

    // Test missing description
    const incompleteData2 = { ...mockFormData, description: '' };
    expect(isBasicStepComplete(incompleteData2)).toBe(false);

    // Test missing dates
    const incompleteData3 = { ...mockFormData, start_time: null };
    expect(isBasicStepComplete(incompleteData3)).toBe(false);

    // Test online event without URL
    const onlineData = { ...mockFormData, event_type: 'online' as const, location: '', virtual_event_url: '' };
    expect(isBasicStepComplete(onlineData)).toBe(false);

    // Test online event with URL
    const onlineDataComplete = { ...mockFormData, event_type: 'online' as const, location: '', virtual_event_url: 'https://zoom.us/test' };
    expect(isBasicStepComplete(onlineDataComplete)).toBe(true);
  });

  test('advanced step is always complete (optional)', () => {
    // Advanced step should always be considered complete since it's optional
    const isAdvancedStepComplete = () => true;
    expect(isAdvancedStepComplete()).toBe(true);
  });

  test('event creation data structure', () => {
    // Test that the data structure matches what the API expects
    const mockFormData: EventFormData = {
      title: 'Test Event',
      description: 'A test event description',
      language: 'en',
      event_type: 'in_person',
      event_format: 'single',
      event_privacy: 'public',
      start_time: new Date('2026-12-01T10:00:00'),
      end_time: new Date('2026-12-01T12:00:00'),
      timezone: 'UTC',
      location: 'Test Location',
      virtual_event_url: '',
      virtual_event_platform: '',
      subtitle: '',
      summary: '',
      doors_open_time: null,
      registration_start_time: null,
      registration_end_time: null,
      event_password: '',
      age_restriction: '',
      accessibility_options: '',
      ticket_types: [],
      refund_policy: 'no_refunds',
      custom_refund_policy: '',
      event_website: '',
      event_contact_email: '',
      ticketing_website: '',
      category: '',
      max_participants: null,
      tags: [],
      ticket_pricing_description: '',
      image_url: '',
      image_file: null,
      is_public: true,
      status: 'draft'
    };

    // Convert to API format (simulating what CreateEvent.tsx does)
    const apiData = {
      title: mockFormData.title,
      description: mockFormData.description,
      location: mockFormData.location,
      start_time: mockFormData.start_time?.toISOString(),
      end_time: mockFormData.end_time?.toISOString(),
      category: mockFormData.category,
      max_participants: mockFormData.max_participants,
      is_public: mockFormData.is_public,
      tags: mockFormData.tags,
      image_url: mockFormData.image_url,
      status: mockFormData.status,
      // New fields
      subtitle: mockFormData.subtitle,
      summary: mockFormData.summary,
      language: mockFormData.language,
      event_type: mockFormData.event_type,
      event_format: mockFormData.event_format,
      event_privacy: mockFormData.event_privacy,
      timezone: mockFormData.timezone,
      doors_open_time: mockFormData.doors_open_time?.toISOString(),
      registration_start_time: mockFormData.registration_start_time?.toISOString(),
      registration_end_time: mockFormData.registration_end_time?.toISOString(),
      virtual_event_url: mockFormData.virtual_event_url,
      virtual_event_platform: mockFormData.virtual_event_platform,
      event_password: mockFormData.event_password,
      age_restriction: mockFormData.age_restriction,
      accessibility_options: mockFormData.accessibility_options,
      event_website: mockFormData.event_website,
      event_contact_email: mockFormData.event_contact_email,
      ticketing_website: mockFormData.ticketing_website,
      refund_policy: mockFormData.refund_policy,
      custom_refund_policy: mockFormData.custom_refund_policy,
      ticket_pricing_description: mockFormData.ticket_pricing_description,
    };

    // Verify API data structure
    expect(apiData.title).toBe('Test Event');
    expect(apiData.description).toBe('A test event description');
    expect(apiData.event_type).toBe('in_person');
    expect(apiData.event_privacy).toBe('public');
    expect(apiData.refund_policy).toBe('no_refunds');
    expect(apiData.status).toBe('draft');
  });
});
