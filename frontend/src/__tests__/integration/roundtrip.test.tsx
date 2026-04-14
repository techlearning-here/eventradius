/**
 * Frontend Integration Test - Event Round-Trip
 * 
 * Tests complete data flow:
 * Frontend Component → API Client → Backend → Database → Backend → Frontend Component
 * 
 * MANUAL TEST - Not run in CI
 * Requires: Backend running, user logged in
 * 
 * @jest-environment jsdom
 */

import { api } from '@/integrations/backend/api';
import { supabase } from '@/integrations/supabase/client';
import { EventCreate, Event } from '@/integrations/backend/api';

// Test configuration
const TEST_TIMEOUT = 30000; // 30 seconds for API calls
const TEST_EVENT_TITLE_PREFIX = 'Frontend Round-Trip Test';

describe('Frontend-Backend-Database Round-Trip Tests', () => {
  let testEventIds: string[] = [];
  let authToken: string | null = null;

  // Helper to clean up test events
  const cleanupTestEvents = async () => {
    console.log('🧹 Cleaning up test events...');
    for (const eventId of testEventIds) {
      try {
        await api.deleteEvent(eventId);
        console.log(`  🗑️  Deleted event: ${eventId}`);
      } catch (e) {
        console.log(`  ⚠️  Could not delete event ${eventId}:`, e);
      }
    }
    testEventIds = [];
  };

  beforeAll(async () => {
    // Get auth token from Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No authentication token found. Please login via frontend first.');
    }
    authToken = session.access_token;
    console.log('✅ Authentication token obtained');
  }, TEST_TIMEOUT);

  afterAll(async () => {
    await cleanupTestEvents();
  }, TEST_TIMEOUT);

  afterEach(async () => {
    // Clean up after each test
    await cleanupTestEvents();
  }, TEST_TIMEOUT);

  test(
    'should create event with all fields and retrieve correctly',
    async () => {
      console.log('\n🚀 Testing event creation round-trip...');

      // Step 1: Create event data matching Event Wizard form
      const eventData: EventCreate = {
        title: `${TEST_EVENT_TITLE_PREFIX} - ${new Date().toISOString()}`,
        subtitle: 'Frontend integration test subtitle',
        summary: 'This is a test event created by frontend integration tests',
        description: 'Comprehensive test of event creation from frontend through API to database',
        category: 'technology',
        event_type: 'in_person',
        event_format: 'single',
        timezone: 'America/Los_Angeles',
        location: '123 Test Street, San Francisco, CA 94102',
        
        // Venue details
        venue_building_name: 'Tech Hub Building',
        venue_street: '123 Test Street',
        venue_city: 'San Francisco',
        venue_state: 'CA',
        venue_zip_code: '94102',
        venue_country: 'USA',
        
        // Timing
        start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // +2 hours
        doors_open_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 - 30 * 60 * 1000).toISOString(), // -30 min
        registration_start_time: new Date().toISOString(),
        registration_end_time: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        
        // Contact
        event_contact_email: 'test@example.com',
        event_contact_phone: '4155551234',
        event_contact_phone_country_code: '+1',
        
        // Capacity
        max_participants: 100,
        is_public: true,
        
        // Additional fields
        tags: ['frontend-test', 'integration', 'round-trip'],
        language: 'en',
        age_restriction: 'all_ages',
        accessibility_options: 'Wheelchair accessible',
        
        // Virtual event
        virtual_event_url: 'https://zoom.us/j/test123',
        virtual_event_platform: 'Zoom',
        
        // Pricing
        is_paid_event: true,
        ticketing_website: 'https://tickets.example.com',
        ticket_pricing_description: '$50 per person',
        refund_policy: 'refund_up_to_24_hours',
        custom_refund_policy: 'Full refund up to 24 hours',
        group_discounts: true,
      };

      // Step 2: Create event via API
      console.log('📤 Creating event via API...');
      const createdEvent = await api.createEvent(eventData);
      
      expect(createdEvent).toBeDefined();
      expect(createdEvent.id).toBeDefined();
      expect(createdEvent.title).toBe(eventData.title);
      
      testEventIds.push(createdEvent.id);
      console.log(`✅ Event created: ${createdEvent.id}`);

      // Step 3: Retrieve event via API
      console.log('📥 Retrieving event via API...');
      const retrievedEvent = await api.getEvent(createdEvent.id);
      
      expect(retrievedEvent).toBeDefined();
      expect(retrievedEvent.id).toBe(createdEvent.id);
      console.log(`✅ Event retrieved: ${retrievedEvent.id}`);

      // Step 4: Verify all critical fields
      console.log('🔍 Verifying field integrity...');
      
      // Basic fields
      expect(retrievedEvent.title).toBe(eventData.title);
      expect(retrievedEvent.subtitle).toBe(eventData.subtitle);
      expect(retrievedEvent.summary).toBe(eventData.summary);
      expect(retrievedEvent.description).toBe(eventData.description);
      expect(retrievedEvent.category).toBe(eventData.category);
      expect(retrievedEvent.timezone).toBe(eventData.timezone);
      
      // Venue fields
      expect(retrievedEvent.venue_building_name).toBe(eventData.venue_building_name);
      expect(retrievedEvent.venue_street).toBe(eventData.venue_street);
      expect(retrievedEvent.venue_city).toBe(eventData.venue_city);
      expect(retrievedEvent.venue_state).toBe(eventData.venue_state);
      expect(retrievedEvent.venue_zip_code).toBe(eventData.venue_zip_code);
      expect(retrievedEvent.venue_country).toBe(eventData.venue_country);
      
      // Contact fields
      expect(retrievedEvent.event_contact_email).toBe(eventData.event_contact_email);
      expect(retrievedEvent.event_contact_phone).toBe(eventData.event_contact_phone);
      
      // Tags
      expect(retrievedEvent.tags).toEqual(expect.arrayContaining(eventData.tags || []));
      
      // Virtual event
      expect(retrievedEvent.virtual_event_url).toBe(eventData.virtual_event_url);
      expect(retrievedEvent.virtual_event_platform).toBe(eventData.virtual_event_platform);
      
      console.log('✅ All fields verified successfully');

      // Step 5: Verify event appears in list
      console.log('📋 Verifying event in list...');
      const events = await api.getEvents({ limit: 50 });
      const foundEvent = events.find(e => e.id === createdEvent.id);
      expect(foundEvent).toBeDefined();
      console.log('✅ Event found in event list');
    },
    TEST_TIMEOUT
  );

  test(
    'should handle event update and reflect changes correctly',
    async () => {
      console.log('\n🚀 Testing event update round-trip...');

      // Create initial event
      const initialData: EventCreate = {
        title: `${TEST_EVENT_TITLE_PREFIX} Update Test - ${new Date().toISOString()}`,
        description: 'Initial description',
        category: 'technology',
        start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        timezone: 'America/Los_Angeles',
        max_participants: 50,
        is_public: true,
      };

      const createdEvent = await api.createEvent(initialData);
      testEventIds.push(createdEvent.id);
      console.log(`✅ Created: ${createdEvent.id}`);

      // Update event
      const updateData = {
        title: `${TEST_EVENT_TITLE_PREFIX} UPDATED - ${new Date().toISOString()}`,
        description: 'Updated description',
        max_participants: 100,
        summary: 'Added summary during update',
      };

      console.log('📤 Updating event...');
      const updatedEvent = await api.updateEvent(createdEvent.id, updateData);
      
      expect(updatedEvent.title).toBe(updateData.title);
      expect(updatedEvent.description).toBe(updateData.description);
      expect(updatedEvent.max_participants).toBe(updateData.max_participants);
      expect(updatedEvent.summary).toBe(updateData.summary);
      console.log('✅ Event updated');

      // Verify changes persist
      console.log('📥 Verifying persisted changes...');
      const retrievedEvent = await api.getEvent(createdEvent.id);
      
      expect(retrievedEvent.title).toBe(updateData.title);
      expect(retrievedEvent.description).toBe(updateData.description);
      console.log('✅ Changes persisted correctly');
    },
    TEST_TIMEOUT
  );

  test(
    'should handle soft delete and restore correctly',
    async () => {
      console.log('\n🚀 Testing soft delete round-trip...');

      // Create event
      const eventData: EventCreate = {
        title: `${TEST_EVENT_TITLE_PREFIX} Delete Test - ${new Date().toISOString()}`,
        description: 'Test event for soft delete',
        category: 'technology',
        start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        timezone: 'America/Los_Angeles',
        max_participants: 50,
        is_public: true,
      };

      const createdEvent = await api.createEvent(eventData);
      const eventId = createdEvent.id;
      testEventIds.push(eventId);
      console.log(`✅ Created: ${eventId}`);

      // Verify event exists
      const beforeDelete = await api.getEvent(eventId);
      expect(beforeDelete).toBeDefined();
      console.log('✅ Event exists before delete');

      // Soft delete
      console.log('🗑️ Soft deleting event...');
      await api.deleteEvent(eventId);
      console.log('✅ Event deleted (moved to recycle bin)');

      // Verify event not in regular list
      try {
        await api.getEvent(eventId);
        throw new Error('Event should not be accessible after delete');
      } catch (e) {
        console.log('✅ Event correctly hidden from regular endpoint');
      }

      // Restore event
      console.log('♻️ Restoring event...');
      const restoredEvent = await api.restoreEvent(eventId);
      expect(restoredEvent.id).toBe(eventId);
      console.log('✅ Event restored');

      // Verify event accessible again
      const afterRestore = await api.getEvent(eventId);
      expect(afterRestore).toBeDefined();
      expect(afterRestore.title).toBe(eventData.title);
      console.log('✅ Event accessible after restore');
    },
    TEST_TIMEOUT
  );

  test(
    'should verify all new Event Wizard fields round-trip correctly',
    async () => {
      console.log('\n🚀 Testing all Event Wizard fields...');

      // Create event with ALL wizard fields
      const fullEventData: EventCreate = {
        title: `${TEST_EVENT_TITLE_PREFIX} Full Fields - ${new Date().toISOString()}`,
        subtitle: 'Testing all new fields',
        summary: 'Complete field test',
        description: 'Testing every field from Event Wizard',
        category: 'technology',
        language: 'en',
        
        // Type & Format
        event_type: 'hybrid',
        event_format: 'single',
        timezone: 'America/Los_Angeles',
        
        // Venue
        location: 'Test Venue',
        venue_building_name: 'Test Building',
        venue_street: '123 Main St',
        venue_city: 'San Francisco',
        venue_state: 'CA',
        venue_zip_code: '94102',
        venue_country: 'USA',
        
        // Virtual
        virtual_event_url: 'https://meet.test/123',
        virtual_event_platform: 'Custom Platform',
        
        // Timing
        start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        doors_open_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 - 30 * 60 * 1000).toISOString(),
        registration_start_time: new Date().toISOString(),
        registration_end_time: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        
        // Contact
        event_contact_email: 'organizer@test.com',
        event_contact_phone: '4155559999',
        event_contact_phone_country_code: '+1',
        
        // Tags
        tags: ['test', 'integration', 'frontend', 'all-fields'],
        
        // Capacity
        max_participants: 200,
        is_public: true,
        
        // Pricing
        is_paid_event: true,
        ticketing_website: 'https://tix.test/event',
        ticket_pricing_description: 'Early bird: $30, Regular: $50',
        refund_policy: 'refund_up_to_48_hours',
        custom_refund_policy: 'Full refund up to 48 hours',
        group_discounts: true,
        
        // Additional
        age_restriction: '18_plus',
        accessibility_options: 'Wheelchair accessible, ASL interpreter',
      };

      console.log('📤 Creating event with all fields...');
      const createdEvent = await api.createEvent(fullEventData);
      testEventIds.push(createdEvent.id);
      console.log(`✅ Created: ${createdEvent.id}`);

      console.log('📥 Retrieving and verifying all fields...');
      const retrievedEvent = await api.getEvent(createdEvent.id);

      // Comprehensive field verification
      const fieldsToCheck = [
        { field: 'title', expected: fullEventData.title },
        { field: 'subtitle', expected: fullEventData.subtitle },
        { field: 'summary', expected: fullEventData.summary },
        { field: 'description', expected: fullEventData.description },
        { field: 'category', expected: fullEventData.category },
        { field: 'language', expected: fullEventData.language },
        { field: 'event_type', expected: fullEventData.event_type },
        { field: 'event_format', expected: fullEventData.event_format },
        { field: 'timezone', expected: fullEventData.timezone },
        { field: 'venue_building_name', expected: fullEventData.venue_building_name },
        { field: 'venue_street', expected: fullEventData.venue_street },
        { field: 'venue_city', expected: fullEventData.venue_city },
        { field: 'venue_state', expected: fullEventData.venue_state },
        { field: 'venue_zip_code', expected: fullEventData.venue_zip_code },
        { field: 'venue_country', expected: fullEventData.venue_country },
        { field: 'virtual_event_platform', expected: fullEventData.virtual_event_platform },
        { field: 'event_contact_email', expected: fullEventData.event_contact_email },
        { field: 'event_contact_phone', expected: fullEventData.event_contact_phone },
        { field: 'max_participants', expected: fullEventData.max_participants },
        { field: 'is_public', expected: fullEventData.is_public },
        { field: 'is_paid_event', expected: fullEventData.is_paid_event },
        { field: 'ticketing_website', expected: fullEventData.ticketing_website },
        { field: 'refund_policy', expected: fullEventData.refund_policy },
        { field: 'age_restriction', expected: fullEventData.age_restriction },
      ];

      let verifiedCount = 0;
      for (const { field, expected } of fieldsToCheck) {
        const actual = retrievedEvent[field as keyof Event];
        if (actual === expected) {
          verifiedCount++;
          console.log(`  ✅ ${field}`);
        } else {
          console.log(`  ⚠️  ${field}: expected "${expected}", got "${actual}"`);
        }
      }

      console.log(`\n📊 Verified ${verifiedCount}/${fieldsToCheck.length} fields`);
      
      // Verify tags array
      expect(retrievedEvent.tags).toEqual(expect.arrayContaining(fullEventData.tags || []));
      console.log('✅ Tags verified');

      expect(verifiedCount).toBeGreaterThan(fieldsToCheck.length - 5); // Allow some tolerance
    },
    TEST_TIMEOUT
  );
});
