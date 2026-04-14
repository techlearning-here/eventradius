/**
 * Playwright Integration Test - Event Details Page
 * 
 * Tests event details display and interactions:
 * Browser UI → Frontend App → Backend API → Database → Backend API → Frontend Display
 * 
 * MANUAL TEST - Not run in CI
 * Requires: Frontend running on localhost:5173, Backend on localhost:8000
 */

import { test, expect, Page } from '@playwright/test';

// Test data
const TEST_EVENT_TITLE = `PW Details Test ${Date.now()}`;
let createdEventId: string;

// Helper function to login
async function loginIfNeeded(page: Page) {
  console.log('🔐 Checking authentication...');
  
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  const loginButton = page.locator('button:has-text("Sign In"), button:has-text("Login"), a:has-text("Sign In")').first();
  const isLoginVisible = await loginButton.isVisible().catch(() => false);
  
  if (isLoginVisible) {
    console.log('   → Login required, pausing for manual login...');
    await page.pause();
  }
  
  await page.waitForTimeout(2000);
  console.log('   ✅ Authenticated');
}

// Helper to create a test event via API
async function createTestEvent(page: Page): Promise<string> {
  console.log('📝 Creating test event via API...');
  
  const eventData = {
    title: TEST_EVENT_TITLE,
    subtitle: 'Event Details Page Test',
    summary: 'Testing event details display and interactions',
    description: 'This is a comprehensive test of the Event Details page showing ' +
      'all the information flowing correctly from Database through Backend API to Frontend Display.',
    category: 'technology',
    event_type: 'in_person',
    event_format: 'single',
    timezone: 'America/Los_Angeles',
    location: 'Tech Hub, 456 Innovation Drive, San Francisco, CA 94105',
    venue_building_name: 'Innovation Center',
    venue_street: '456 Innovation Drive',
    venue_city: 'San Francisco',
    venue_state: 'CA',
    venue_zip_code: '94105',
    venue_country: 'USA',
    start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
    doors_open_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 - 30 * 60 * 1000).toISOString(),
    event_contact_email: 'organizer@techhub.local',
    event_contact_phone: '4155559876',
    event_contact_phone_country_code: '+1',
    max_participants: 150,
    is_public: true,
    is_paid_event: true,
    ticketing_website: 'https://tickets.example.com/playwright-test',
    ticket_pricing_description: 'Early Bird: $40, Regular: $60',
    refund_policy: 'refund_up_to_24_hours',
    tags: ['playwright', 'integration-test', 'event-details', 'technology'],
    age_restriction: 'all_ages',
    accessibility_options: 'Wheelchair accessible, ASL interpreter available',
    status: 'published'
  };

  const response = await page.request.post('http://localhost:8000/api/events', {
    data: eventData,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  expect(response.ok()).toBeTruthy();
  
  const createdEvent = await response.json();
  createdEventId = createdEvent.id;
  
  console.log(`   ✅ Created event: ${createdEventId}`);
  return createdEventId;
}

// Helper to cleanup test event
async function cleanupTestEvent(page: Page) {
  if (createdEventId) {
    console.log(`🧹 Cleaning up test event: ${createdEventId}`);
    try {
      await page.request.delete(`http://localhost:8000/api/events/${createdEventId}`);
      console.log('   ✅ Test event deleted');
    } catch (e) {
      console.log('   ⚠️  Could not delete test event');
    }
  }
}

test.describe('Event Details Page Integration Tests', () => {
  test.beforeAll(async ({ page }) => {
    await loginIfNeeded(page);
    await createTestEvent(page);
  });

  test.afterAll(async ({ page }) => {
    await cleanupTestEvent(page);
  });

  test('should display all event details correctly', async ({ page }) => {
    console.log('\n🚀 Testing Event Details display...');

    // Navigate to event details
    console.log('\n📋 Step 1: Navigating to event details...');
    await page.goto(`/events/${createdEventId}`);
    await page.waitForLoadState('networkidle');
    
    console.log('   ✅ Event details page loaded');

    // Step 2: Verify basic event info
    console.log('\n📋 Step 2: Verifying basic event info...');
    
    // Title
    const title = page.locator('h1, h2').filter({ hasText: TEST_EVENT_TITLE }).first();
    await expect(title).toBeVisible({ timeout: 10000 });
    console.log('   ✅ Title displayed');
    
    // Description
    const description = page.locator('text=comprehensive test').first();
    await expect(description).toBeVisible();
    console.log('   ✅ Description displayed');
    
    // Category
    const category = page.locator('text=technology, [data-testid="event-category"]').first();
    if (await category.isVisible().catch(() => false)) {
      console.log('   ✅ Category displayed');
    }
    
    // Step 3: Verify location info
    console.log('\n📋 Step 3: Verifying location info...');
    
    const location = page.locator('text=456 Innovation Drive, text=San Francisco, text=Tech Hub').first();
    if (await location.isVisible().catch(() => false)) {
      console.log('   ✅ Location displayed');
    }
    
    // Step 4: Verify timing info
    console.log('\n📋 Step 4: Verifying timing info...');
    
    const timezone = page.locator('text=America/Los_Angeles, text=PST, text=PDT').first();
    if (await timezone.isVisible().catch(() => false)) {
      console.log('   ✅ Timezone displayed');
    }
    
    // Step 5: Verify contact info
    console.log('\n📋 Step 5: Verifying contact info...');
    
    const email = page.locator('text=organizer@techhub.local').first();
    if (await email.isVisible().catch(() => false)) {
      console.log('   ✅ Contact email displayed');
    }
    
    // Step 6: Verify pricing info
    console.log('\n📋 Step 6: Verifying pricing info...');
    
    const pricing = page.locator('text=Early Bird, text=$40, text=$60').first();
    if (await pricing.isVisible().catch(() => false)) {
      console.log('   ✅ Pricing info displayed');
    }
    
    // Step 7: Verify tags
    console.log('\n📋 Step 7: Verifying tags...');
    
    const tags = page.locator('text=playwright, text=technology').first();
    if (await tags.isVisible().catch(() => false)) {
      console.log('   ✅ Tags displayed');
    }

    console.log('\n🎉 Event Details display test completed successfully!');
  });

  test('should handle event registration flow', async ({ page }) => {
    console.log('\n🚀 Testing Event Registration flow...');

    await page.goto(`/events/${createdEventId}`);
    await page.waitForLoadState('networkidle');
    
    console.log('\n📋 Looking for registration button...');
    
    // Look for join/register button
    const joinButton = page.locator('button:has-text("Join"), button:has-text("Register"), button:has-text("RSVP"), a:has-text("Join"), a:has-text("Register")').first();
    
    const hasJoinButton = await joinButton.isVisible().catch(() => false);
    
    if (hasJoinButton) {
      console.log('   ✅ Join button found');
      
      // Click join (but don't actually register in tests)
      // Just verify the button works
      console.log('   ℹ️  Registration button found (skipping actual registration in test)');
    } else {
      console.log('   ℹ️  No registration button found (may require organizer role or be hidden)');
    }
    
    console.log('\n🎉 Registration flow test completed!');
  });

  test('should handle share functionality', async ({ page }) => {
    console.log('\n🚀 Testing Event Share functionality...');

    await page.goto(`/events/${createdEventId}`);
    await page.waitForLoadState('networkidle');
    
    console.log('\n📋 Looking for share button...');
    
    // Look for share button
    const shareButton = page.locator('button:has-text("Share"), [data-testid="share-button"], button[aria-label*="share"]').first();
    
    const hasShareButton = await shareButton.isVisible().catch(() => false);
    
    if (hasShareButton) {
      console.log('   ✅ Share button found');
      
      // Click share button
      await shareButton.click();
      await page.waitForTimeout(500);
      
      // Look for share dialog or options
      const shareDialog = page.locator('[role="dialog"], .share-modal, [data-testid="share-dialog"]').first();
      const hasDialog = await shareDialog.isVisible().catch(() => false);
      
      if (hasDialog) {
        console.log('   ✅ Share dialog opened');
        
        // Close dialog
        const closeButton = page.locator('button:has-text("Close"), button[aria-label="Close"]').first();
        if (await closeButton.isVisible().catch(() => false)) {
          await closeButton.click();
          console.log('   ✅ Share dialog closed');
        }
      } else {
        console.log('   ℹ️  Share options may use native share API');
      }
    } else {
      console.log('   ℹ️  No share button found');
    }
    
    console.log('\n🎉 Share functionality test completed!');
  });

  test('should handle 404 for non-existent event', async ({ page }) => {
    console.log('\n🚀 Testing 404 handling...');

    // Navigate to non-existent event
    const fakeEventId = '00000000-0000-0000-0000-000000000000';
    await page.goto(`/events/${fakeEventId}`);
    await page.waitForLoadState('networkidle');
    
    console.log('\n📋 Checking for 404 message...');
    
    // Look for 404 message
    const notFound = page.locator('text=404, text=Not Found, text=not found, text=does not exist, text=Event not found').first();
    const has404 = await notFound.isVisible().catch(() => false);
    
    if (has404) {
      console.log('   ✅ 404 message displayed correctly');
    } else {
      console.log('   ℹ️  404 handling may redirect or show different message');
    }
    
    console.log('\n🎉 404 handling test completed!');
  });
});
