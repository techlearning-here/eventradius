# Event Wizard Simplification - Test Guide

## Summary
Successfully simplified the Event Wizard from 8 steps to 2 main categories:

### ✅ Basic Event Details (Step 1)
**Required fields for event creation:**
- Event title
- Event description  
- Event type (online/in-person/hybrid)
- Date & Time (start/end)
- Location (physical address or virtual URL)
- Event image (optional but important)

### ✅ Advanced Options (Step 2) 
**Optional fields with sensible defaults:**
- Registration settings (privacy, timing, password, age restrictions)
- Ticketing (types, pricing, quantity)
- Advanced settings (refund policies, custom policies, contact info)
- Review and publish

## Default Values Set
```typescript
{
  event_type: 'in_person',
  event_format: 'single', 
  event_privacy: 'public',
  language: 'en',
  timezone: user's timezone,
  refund_policy: 'no_refunds',
  // All other advanced fields set to empty/null defaults
}
```

## Validation Logic
- **Basic Step**: Requires title, description, dates, and appropriate location/URL
- **Advanced Step**: Always complete (optional - can proceed without filling)

## Testing Results
✅ All integration tests pass (5/5)
✅ Wizard structure verified
✅ Form data structure correct
✅ Validation logic working
✅ API data conversion verified

## Manual Testing Steps

### 1. Test Basic Event Creation
1. Navigate to `/create-event`
2. Fill in basic details:
   - Title: "Test Event"
   - Description: "This is a test event"
   - Event Type: "In Person"
   - Start Date: Tomorrow 10:00 AM
   - End Date: Tomorrow 12:00 PM
   - Location: "Test Venue"
3. Click "Next" → Should go to Advanced Options
4. Click "Publish Event" → Should create event successfully

### 2. Test Online Event
1. Event Type: "Online"
2. Virtual URL: "https://zoom.us/test"
3. Location field should be hidden/optional
4. Should validate that URL is required for online events

### 3. Test Advanced Options (Optional)
1. Skip all advanced fields
2. Should still be able to publish
3. Advanced fields should use default values

### 4. Test Validation
1. Try to proceed with empty title → Should be blocked
2. Try to proceed with empty description → Should be blocked
3. Try to proceed without dates → Should be blocked
4. Try online event without URL → Should be blocked

## Benefits Achieved
- ✅ Reduced cognitive load (8 steps → 2 steps)
- ✅ Faster event creation (essential info first)
- ✅ Advanced features still available (optional step)
- ✅ Sensible defaults reduce configuration
- ✅ Better user experience for quick event creation
- ✅ Maintains all enterprise-level capabilities

## Files Modified
- `EventWizard.tsx` - Simplified wizard structure
- `EventFormData` interface - Updated with all fields
- `ReviewSection.tsx` - Updated to use shared interface
- Added integration tests

## Next Steps
1. ✅ Test basic event creation functionality
2. ✅ Verify advanced options work with defaults
3. Consider adding AI assistance for basic details
4. Add progressive disclosure for advanced features
5. Consider adding event templates for common use cases
