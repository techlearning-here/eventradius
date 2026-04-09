/**
 * Test script to verify all Event interface fields are present in dummy events
 * Run with: npx ts-node testDummyEvents.ts
 */

import { dummyEvents } from './dummyEvents';
import type { Event } from '@/integrations/backend/api';

// List of all expected fields from Event interface (excluding deleted_at which is only for soft-deleted events)
const expectedFields: (keyof Event)[] = [
  // Basic fields
  'id', 'title', 'description', 'location', 'start_time', 'end_time', 
  'image_url', 'category', 'max_participants', 'is_public', 'organizer_id',
  'created_at', 'updated_at', 'current_participants', 'is_paid_event', // 'deleted_at' excluded - only for soft-deleted events
  
  // Audience & Demographics
  'age_categories', 'gender_preference', 'family_friendly', 'senior_friendly',
  'singles_friendly', 'couples_oriented',
  
  // Accessibility
  'wheelchair_accessible', 'mobility_friendly', 'hearing_accessible',
  'vision_accessible', 'sensory_friendly', 'service_animals_allowed', 'accessibility_notes',
  
  // Cultural Context
  'religious_context', 'dietary_context', 'traditional_attire',
  
  // Prerequisites
  'skill_level', 'prior_experience', 'physical_fitness', 'equipment_required',
  'dress_code', 'prerequisites_notes',
  
  // Content & Intensity
  'content_rating', 'alcohol_served', 'smoking_policy', 'noise_level', 'physical_intensity',
  
  // Social Features
  'networking_focus', 'social_mixer', 'ice_breakers', 'group_activities', 'team_building',
  
  // Language
  'primary_language', 'secondary_languages', 'interpretation_available', 'sign_language_interpreter',
  
  // Type & Format
  'event_type', 'format', 'sub_category',
  
  // Pricing
  'refund_policy', 'group_discounts',
];

export function testDummyEvents(): void {
  console.log('🧪 Testing Dummy Events Field Coverage\n');
  
  const allEventIds = Object.keys(dummyEvents);
  console.log(`Found ${allEventIds.length} dummy events: ${allEventIds.join(', ')}\n`);
  
  // Track which fields are present across all events
  const fieldsPresent = new Set<string>();
  const fieldCoverage: Record<string, string[]> = {};
  
  // Check each event for fields
  for (const [eventId, event] of Object.entries(dummyEvents)) {
    const eventFields = Object.keys(event);
    
    for (const field of eventFields) {
      fieldsPresent.add(field);
      if (!fieldCoverage[field]) {
        fieldCoverage[field] = [];
      }
      fieldCoverage[field].push(eventId);
    }
  }
  
  // Check for missing fields
  const missingFields: string[] = [];
  const presentFields: string[] = [];
  
  for (const field of expectedFields) {
    if (fieldsPresent.has(field)) {
      presentFields.push(field);
    } else {
      missingFields.push(field);
    }
  }
  
  // Report results
  console.log(`✅ Present fields (${presentFields.length}/${expectedFields.length}):`);
  console.log(presentFields.sort().join(', '));
  console.log();
  
  if (missingFields.length > 0) {
    console.log(`❌ Missing fields (${missingFields.length}):`);
    for (const field of missingFields) {
      console.log(`  - ${field}`);
    }
    console.log();
  }
  
  // Detailed coverage report
  console.log('📊 Field Coverage Details:\n');
  for (const field of expectedFields.sort()) {
    const coverage = fieldCoverage[field];
    if (coverage) {
      const percentage = ((coverage.length / allEventIds.length) * 100).toFixed(0);
      console.log(`  ${field}: ${coverage.length}/${allEventIds.length} events (${percentage}%)`);
    } else {
      console.log(`  ${field}: 0/${allEventIds.length} events (0%) ❌`);
    }
  }
  
  // Summary
  console.log(`\n📈 Summary:`);
  console.log(`  Total expected fields: ${expectedFields.length}`);
  console.log(`  Fields present: ${presentFields.length}`);
  console.log(`  Fields missing: ${missingFields.length}`);
  console.log(`  Coverage: ${((presentFields.length / expectedFields.length) * 100).toFixed(1)}%`);
  
  if (missingFields.length === 0) {
    console.log(`\n✅ All ${expectedFields.length} fields are present in dummy events!`);
  } else {
    console.log(`\n⚠️  ${missingFields.length} fields are missing from dummy events`);
  }
}

// Run the test
testDummyEvents();
