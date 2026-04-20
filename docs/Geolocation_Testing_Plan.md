# Geolocation Event Filtering - Testing Plan

## Overview
This document outlines the 3-step testing plan for the geolocation-based event discovery feature.

---

## Test 1: User Location Extraction During Onboarding

### Objective
Verify that when a new user completes onboarding and provides their preferred location (city), the backend extracts the latitude and longitude and stores it in the user_preferences table.

### Prerequisites
- Database migration `09_add_event_geolocation.sql` has been applied
- Backend server is running (for saving preferences)
- Mapbox API key configured in backend `.env` (for event geocoding later)
- **Note**: City autocomplete uses Nominatim (OpenStreetMap) directly from frontend - **no backend calls, no API key needed!**

### Test Steps

1. **Navigate to User Onboarding**
   - Go to `/onboarding` as a new user
   - Complete the onboarding flow

2. **Test City Autocomplete (Nominatim - Frontend Only)**
   - When asked for location, type "San Fra" (partial city name)
   - **Verify**: Browser Network tab shows call to `nominatim.openstreetmap.org` (NOT your backend)
   - **Verify**: Autocomplete dropdown appears with "Search Results" section
   - **Verify**: Suggestions include cities matching "San Fra"
   - Select a city from the dropdown
   - **Alternative**: Type a custom city like "Madison, WI" (not in hardcoded list)
   - **Verify**: Frontend calls Nominatim directly and gets results

3. **Provide Location Information**
   - When asked for location, enter a city name (e.g., "San Francisco, CA")
   - Or select from autocomplete dropdown
   - Select distance range (25 km default)
   - Submit the onboarding form

4. **Verify Backend Processing**
   - Frontend sends preferences including city name + lat/lng to `PUT /api/users/me/preferences`
   - Backend saves to database (no geocoding needed - coordinates already from Nominatim)
   - Check browser console for any Nominatim API errors

4. **Database Verification**
   ```sql
   SELECT user_id, city, latitude, longitude, distance_range
   FROM public.user_preferences
   WHERE user_id = '<test_user_id>';
   ```
   **Expected Result:**
   - `city`: "San Francisco, CA"
   - `latitude`: ~37.7749
   - `longitude`: ~-122.4194
   - `distance_range`: default (25 km) or user-selected value

5. **API Verification**
   - Call `GET /api/users/me/preferences`
   - Verify response includes lat/lng fields

### Success Criteria
- [ ] User preferences stored with correct city name
- [ ] Latitude and longitude extracted and stored
- [ ] Distance range preference saved
- [ ] No errors in backend logs

---

## Test 2: Event Location Extraction During Creation

### Objective
Verify that when an organizer creates an in-person or hybrid event, the backend extracts the event's latitude and longitude from the venue address and stores it in the events table.

### Prerequisites
- Organizer account with active status
- Mapbox API key configured
- Test 1 completed (or any user with stored location)

### Test Steps

1. **Navigate to Event Creation**
   - Log in as an organizer
   - Go to `/create-event` or event wizard

2. **Create In-Person/Hybrid Event**
   - Select "In-Person" or "Hybrid" as event type
   - Fill in event details
   - Enter structured venue address:
     - Street: "123 Main St"
     - City: "San Francisco"
     - State: "CA"
     - Zip: "94102"
     - Country: "USA"

3. **Submit Event**
   - Complete event creation
   - Backend receives event data via `POST /api/events`

4. **Verify Geocoding Triggered**
   - Check backend logs for geocoding service calls
   - Verify Mapbox API was called with formatted address

5. **Database Verification**
   ```sql
   SELECT id, title, venue_city, venue_state, latitude, longitude, 
          geolocation_accuracy, geocoded_at
   FROM public.events
   WHERE id = '<test_event_id>';
   ```
   **Expected Result:**
   - `latitude`: ~37.7749 (San Francisco lat)
   - `longitude`: ~-122.4194 (San Francisco lng)
   - `geolocation_accuracy`: 'exact' or 'approximate'
   - `geocoded_at`: timestamp of geocoding

6. **Test Freeform Address**
   - Create another event
   - Use freeform address: "Golden Gate Park, San Francisco, CA"
   - Verify geocoding still works

### Success Criteria
- [ ] Event created successfully
- [ ] Latitude and longitude extracted from address
- [ ] Geolocation accuracy field populated
- [ ] Geocoded timestamp recorded
- [ ] Works with both structured and freeform addresses
- [ ] Online events skip geocoding (no lat/lng)

### Error Handling Test
- [ ] Create event with invalid address
- [ ] Verify event still created (geocoding is non-blocking)
- [ ] Check error logged but event saved without coordinates

---

## Test 3: Event Discovery with Location-Based Filtering

### Objective
Verify that when a discoverer views events, the system uses their stored location (lat/lng) and preferred radius to find and display nearby events sorted by distance.

### Prerequisites
- Test 1 completed (user with location)
- Test 2 completed (multiple events with coordinates in different locations)
- At least 3 events:
  - 1 event within 5 km of user location
  - 1 event within 25 km of user location
  - 1 event 100+ km away (should be excluded with default 25km radius)

### Test Steps

1. **Navigate to Discover Page**
   - Log in as the user from Test 1
   - Go to `/discover`

2. **Verify Location Indicator**
   - Page should show: "Events near your location (within 25 km)"
   - Location filter component should display current location status

3. **Check Default Event Loading**
   - Events should load automatically
   - Events should be filtered by user's stored location + 25km radius

4. **API Verification**
   - Browser Network tab: verify call to `GET /api/events/discover/nearby?lat=<user_lat>&lng=<user_lng>&radius=25`
   - Response should include events with `distance_km` field

5. **Database Verification (via API)**
   ```sql
   -- Verify the SQL function works
   SELECT * FROM public.events_within_radius_fast(
       <user_latitude>, 
       <user_longitude>, 
       25
   );
   ```

6. **UI Verification**
   - Events displayed should include distance badges (e.g., "2.3 km away")
   - Events sorted by distance (closest first)
   - Far events (100+ km) should NOT appear

7. **Test Radius Adjustment**
   - Change radius to 50 km in LocationFilter
   - Verify API call includes new radius
   - More events should appear (including the 100km event if within 50km)
   - Check database updated with new preference:
     ```sql
     SELECT distance_range FROM public.user_preferences WHERE user_id = '<user_id>';
     ```

8. **Test Location Update**
   - Click "Update" in LocationFilter to get fresh GPS coordinates
   - Verify browser geolocation prompt appears
   - Grant permission
   - Verify `PUT /api/users/me/location` called with new coordinates

9. **Test Without Location**
   - Clear location (or use new user without location)
   - Verify all events shown (no location filter applied)
   - Verify "Enable location for nearby events" CTA appears

### Success Criteria
- [ ] Events filtered by user's location and radius
- [ ] Distance badges shown on event cards
- [ ] Events sorted by proximity
- [ ] Radius changes update results
- [ ] Location update refreshes results
- [ ] Graceful fallback when no location available
- [ ] API response includes computed distance_km for each event

### Edge Cases to Test
- [ ] User denies browser geolocation permission
- [ ] User has location but no events within radius (empty state)
- [ ] Switch between "all events" and "nearby events" views
- [ ] User with saved location visits from different city (should use saved, not current)

---

## Test Data Setup

### Sample Locations for Testing
```sql
-- Create test events at known distances from San Francisco (37.7749, -122.4194)

-- Event 1: Very close (1 km away) - Downtown SF
INSERT INTO public.events (title, venue_street, venue_city, venue_state, venue_zip_code, 
    venue_country, latitude, longitude, geolocation_accuracy, geocoded_at, 
    event_type, is_public, status, organizer_id)
VALUES (
    'Close Event - Downtown', '123 Market St', 'San Francisco', 'CA', '94102', 'USA',
    37.7849, -122.4094, 'exact', NOW(),
    'in_person', true, 'published', '<organizer_id>'
);

-- Event 2: Medium distance (15 km away) - Oakland
INSERT INTO public.events (title, venue_street, venue_city, venue_state, venue_zip_code,
    venue_country, latitude, longitude, geolocation_accuracy, geocoded_at,
    event_type, is_public, status, organizer_id)
VALUES (
    'Medium Event - Oakland', '456 Broadway', 'Oakland', 'CA', '94607', 'USA',
    37.8044, -122.2712, 'exact', NOW(),
    'in_person', true, 'published', '<organizer_id>'
);

-- Event 3: Far away (120 km away) - San Jose
INSERT INTO public.events (title, venue_street, venue_city, venue_state, venue_zip_code,
    venue_country, latitude, longitude, geolocation_accuracy, geocoded_at,
    event_type, is_public, status, organizer_id)
VALUES (
    'Far Event - San Jose', '789 N 1st St', 'San Jose', 'CA', '95110', 'USA',
    37.3382, -121.8863, 'exact', NOW(),
    'in_person', true, 'published', '<organizer_id>'
);

-- Event 4: Online event (should appear regardless of location)
INSERT INTO public.events (title, latitude, longitude, geolocation_accuracy,
    event_type, is_public, status, organizer_id, virtual_event_url)
VALUES (
    'Virtual Workshop', NULL, NULL, NULL,
    'online', true, 'published', '<organizer_id>', 'https://zoom.us/j/123'
);
```

---

## Debugging Commands

### Check User Location
```sql
SELECT user_id, city, latitude, longitude, distance_range
FROM public.user_preferences
WHERE user_id = '<user_id>';
```

### Check Event Coordinates
```sql
SELECT id, title, venue_city, latitude, longitude, geolocation_accuracy
FROM public.events
WHERE latitude IS NOT NULL
ORDER BY geocoded_at DESC
LIMIT 10;
```

### Test Radius Search Directly
```sql
-- Find events within 25km of San Francisco
SELECT * FROM public.events_within_radius_fast(37.7749, -122.4194, 25);
```

### Check Geocoding Queue (if implemented)
```sql
SELECT * FROM public.geocoding_queue
WHERE status = 'pending'
ORDER BY created_at;
```

### Backend Logs
```bash
# Tail backend logs for geocoding activity
tail -f backend/logs/app.log | grep -i "geocod"

# Or check specific API calls
tail -f backend/logs/app.log | grep -E "(discover/nearby|/location)"
```

---

## Post-Test Cleanup

After testing, run the clear script to reset event data:
```bash
# In Supabase SQL Editor or psql
\i supabase/migrations/clear/clear_all_events.sql
```

Or keep test data for demo purposes by skipping the cleanup step.
