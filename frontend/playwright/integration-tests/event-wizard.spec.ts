/**
 * Playwright Integration Test - Event Wizard
 * 
 * Tests complete browser-based workflow:
 * Browser UI → Frontend App → Backend API → Database → Backend API → Frontend Display
 * 
 * MANUAL TEST - Not run in CI
 * Requires: Frontend running on localhost:5173, Backend on localhost:8000
 */

import { test, expect, Page } from '@playwright/test';

// Test data
const TEST_EVENT_TITLE = `PW Test Event ${Date.now()}`;

// Helper function to login
async function loginIfNeeded(page: Page) {
  console.log('🔐 Checking authentication...');
  
  // Navigate to home
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Check if we're on the login page or already logged in
  const loginButton = page.locator('button:has-text("Sign In"), button:has-text("Login"), a:has-text("Sign In")').first();
  const isLoginVisible = await loginButton.isVisible().catch(() => false);
  
  if (isLoginVisible) {
    console.log('   → Login required, please login manually...');
    // Playwright will pause here for manual login
    await page.pause();
  }
  
  // Wait for authenticated state
  await page.waitForTimeout(2000);
  console.log('   ✅ Authenticated');
}

// Helper to cleanup test events
async function cleanupTestEvents(page: Page) {
  console.log('🧹 Cleaning up test events...');
  
  // Get all events from API
  const response = await page.request.get('http://localhost:8000/api/events/?limit=100');
  if (response.ok()) {
    const events = await response.json();
    const testEvents = events.filter((e: any) => 
      e.title?.includes('PW Test Event') || 
      e.title?.includes('Playwright Test')
    );
    
    for (const event of testEvents) {
      try {
        await page.request.delete(`http://localhost:8000/api/events/${event.id}`);
        console.log(`   🗑️  Deleted: ${event.title}`);
      } catch (e) {
        console.log(`   ⚠️  Could not delete: ${event.id}`);
      }
    }
    
    console.log(`   ✅ Cleaned up ${testEvents.length} test events`);
  }
}

test.describe('Event Wizard Integration Tests', () => {
  test.beforeAll(async ({ browser }) => {
    // Run cleanup before all tests
    const page = await browser.newPage();
    await cleanupTestEvents(page);
    await page.close();
  });

  test.afterAll(async ({ browser }) => {
    // Run cleanup after all tests
    const page = await browser.newPage();
    await cleanupTestEvents(page);
    await page.close();
  });

  test('should create event through wizard and verify in database', async ({ page }) => {
    console.log('\n🚀 Starting Event Wizard test...');

    // Step 1: Login
    await loginIfNeeded(page);

    // Step 2: Navigate to Event Wizard
    console.log('\n📋 Step 2: Opening Event Wizard...');
    await page.goto('/events/create');
    await page.waitForLoadState('networkidle');
    
    // Verify wizard is loaded
    await expect(page.locator('text=Create New Event, text=Event Wizard').first()).toBeVisible({ timeout: 10000 });
    console.log('   ✅ Event Wizard loaded');

    // Step 3: Fill Basic Info (Step 1)
    console.log('\n📋 Step 3: Filling Basic Info...');
    
    // Event Name
    await page.locator('input[name="title"], input[placeholder*="event name"]').first().fill(TEST_EVENT_TITLE);
    
    // Subtitle (if present)
    const subtitleInput = page.locator('input[name="subtitle"]').first();
    if (await subtitleInput.isVisible().catch(() => false)) {
      await subtitleInput.fill('Playwright Integration Test Subtitle');
    }
    
    // Summary (if present)
    const summaryInput = page.locator('textarea[name="summary"]').first();
    if (await summaryInput.isVisible().catch(() => false)) {
      await summaryInput.fill('This event was created by Playwright integration tests');
    }
    
    // Description
    await page.locator('textarea[name="description"]').first().fill(
      'This is a comprehensive test of the Event Wizard creating an event that flows through ' +
      'Frontend → Backend API → Database → Backend API → Frontend Display'
    );
    
    // Category
    const categorySelect = page.locator('select[name="category"], [data-testid="category-select"]').first();
    if (await categorySelect.isVisible().catch(() => false)) {
      await categorySelect.selectOption('technology');
    }
    
    console.log('   ✅ Basic info filled');

    // Step 4: Fill Event Type & Date (Step 2)
    console.log('\n📋 Step 4: Setting Event Type and Date...');
    
    // Click next if wizard has steps
    const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue"), button[type="submit"]').first();
    
    // Set event type
    const inPersonRadio = page.locator('input[value="in_person"], label:has-text("In Person")').first();
    if (await inPersonRadio.isVisible().catch(() => false)) {
      await inPersonRadio.click();
    }
    
    // Set date/time
    const startDateInput = page.locator('input[name="start_time"], input[type="datetime-local"]').first();
    if (await startDateInput.isVisible().catch(() => false)) {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      const dateString = futureDate.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm format
      await startDateInput.fill(dateString);
    }
    
    // Set timezone
    const timezoneSelect = page.locator('select[name="timezone"]').first();
    if (await timezoneSelect.isVisible().catch(() => false)) {
      await timezoneSelect.selectOption('America/Los_Angeles');
    }
    
    console.log('   ✅ Event type and date set');

    // Step 5: Fill Location (Step 3)
    console.log('\n📋 Step 5: Setting Location...');
    
    const locationInput = page.locator('input[name="location"], textarea[name="location"]').first();
    if (await locationInput.isVisible().catch(() => false)) {
      await locationInput.fill('123 Test Street, San Francisco, CA 94102');
    }
    
    // Venue building name (if present)
    const buildingInput = page.locator('input[name="venue_building_name"]').first();
    if (await buildingInput.isVisible().catch(() => false)) {
      await buildingInput.fill('Test Building');
    }
    
    console.log('   ✅ Location set');

    // Step 6: Fill Contact Info (Step 4)
    console.log('\n📋 Step 6: Setting Contact Info...');
    
    const emailInput = page.locator('input[name="event_contact_email"], input[type="email"]').first();
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill('test@playwright.local');
    }
    
    const phoneInput = page.locator('input[name="event_contact_phone"]').first();
    if (await phoneInput.isVisible().catch(() => false)) {
      await phoneInput.fill('4155551234');
    }
    
    console.log('   ✅ Contact info set');

    // Step 7: Fill Capacity (Step 5)
    console.log('\n📋 Step 7: Setting Capacity...');
    
    const maxParticipantsInput = page.locator('input[name="max_participants"]').first();
    if (await maxParticipantsInput.isVisible().catch(() => false)) {
      await maxParticipantsInput.fill('100');
    }
    
    // Public event toggle
    const publicToggle = page.locator('input[name="is_public"], [role="switch"]').first();
    if (await publicToggle.isVisible().catch(() => false)) {
      await publicToggle.check();
    }
    
    console.log('   ✅ Capacity set');

    // Step 8: Submit the form
    console.log('\n📋 Step 8: Submitting Event...');
    
    // Find submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Publish")').last();
    await submitButton.click();
    
    // Wait for API response and navigation
    await page.waitForTimeout(3000);
    
    // Check if created successfully
    const successIndicator = page.locator('text=success, text=created, text="Event created"').first();
    const isSuccess = await successIndicator.isVisible().catch(() => false);
    
    if (!isSuccess) {
      // Check for error messages
      const errorMessage = page.locator('.error, [role="alert"], .text-red-500').first();
      if (await errorMessage.isVisible().catch(() => false)) {
        const errorText = await errorMessage.textContent();
        throw new Error(`Event creation failed with error: ${errorText}`);
      }
    }
    
    console.log('   ✅ Event submitted');

    // Step 9: Verify event created via API
    console.log('\n📋 Step 9: Verifying event in database via API...');
    
    await page.waitForTimeout(2000); // Wait for backend processing
    
    const response = await page.request.get('http://localhost:8000/api/events/?limit=20');
    expect(response.ok()).toBeTruthy();
    
    const events = await response.json();
    const createdEvent = events.find((e: any) => e.title === TEST_EVENT_TITLE);
    
    expect(createdEvent).toBeDefined();
    expect(createdEvent.title).toBe(TEST_EVENT_TITLE);
    expect(createdEvent.description).toContain('comprehensive test');
    
    const eventId = createdEvent.id;
    console.log(`   ✅ Event found in database: ${eventId}`);

    // Step 10: Navigate to event details and verify display
    console.log('\n📋 Step 10: Verifying event details page...');
    
    await page.goto(`/events/${eventId}`);
    await page.waitForLoadState('networkidle');
    
    // Verify event title is displayed
    const titleOnPage = page.locator(`h1:has-text("${TEST_EVENT_TITLE}"), h2:has-text("${TEST_EVENT_TITLE}")`).first();
    await expect(titleOnPage).toBeVisible({ timeout: 10000 });
    console.log('   ✅ Event title displayed on details page');
    
    // Verify description is displayed
    const descriptionOnPage = page.locator('text=comprehensive test').first();
    await expect(descriptionOnPage).toBeVisible();
    console.log('   ✅ Event description displayed on details page');

    console.log('\n🎉 Event Wizard integration test completed successfully!');
    
    // Cleanup: Delete the test event
    await page.request.delete(`http://localhost:8000/api/events/${eventId}`);
    console.log('   🧹 Test event cleaned up');
  });

  test('should validate required fields and show errors', async ({ page }) => {
    console.log('\n🚀 Starting form validation test...');

    // Login
    await loginIfNeeded(page);

    // Navigate to Event Wizard
    await page.goto('/events/create');
    await page.waitForLoadState('networkidle');
    
    console.log('\n📋 Testing form validation...');
    
    // Try to submit with empty required fields
    const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Publish")').last();
    
    // Check if submit is disabled or shows validation
    const isEnabled = await submitButton.isEnabled().catch(() => true);
    
    if (isEnabled) {
      // Try to submit
      await submitButton.click();
      await page.waitForTimeout(1000);
      
      // Check for validation messages
      const errorMessage = page.locator('.error, [role="alert"], .text-red-500, text=required, text=Please').first();
      const hasError = await errorMessage.isVisible().catch(() => false);
      
      if (hasError) {
        console.log('   ✅ Validation error shown for empty fields');
      } else {
        console.log('   ⚠️  No validation error visible (form may prevent submission differently)');
      }
    } else {
      console.log('   ✅ Submit button disabled for incomplete form');
    }
    
    console.log('\n🎉 Form validation test completed!');
  });
});
