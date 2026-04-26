# Hyper-Local Event Discovery: Geolocation Filtering Implementation Plan

## Executive Summary

This document outlines the implementation strategy for enabling hyper-local event discovery based on a user's location and preferred search radius. The system will efficiently filter in-person events within a specified distance from the discoverer's location.

## Current State Analysis

### Existing Database Schema

**Venues Table** (`@/supabase/migrations/01_eventradius_complete_setup.sql:103-125`):
- Has `latitude DECIMAL(10, 8)` and `longitude DECIMAL(11, 8)` columns
- Stores structured address information

**User Preferences Table** (`@/supabase/migrations/01_eventradius_complete_setup.sql:187-214`):
- Has `latitude DOUBLE PRECISION` and `longitude DOUBLE PRECISION` columns
- Has `distance_range INTEGER DEFAULT 25` (kilometers/miles)
- Has `city TEXT` for user's location

**Events Table** (`@/supabase/migrations/01_eventradius_complete_setup.sql:128-185`):
- Has structured venue fields: `venue_street`, `venue_city`, `venue_state`, `venue_zip_code`, `venue_country`, `venue_building_name`
- Has `primary_venue_id UUID` referencing venues table
- Has `location TEXT` (free-form)
- Has `event_type` ('online', 'in_person', 'hybrid')
- **Missing**: Direct `latitude` and `longitude` columns on events table

**Existing Database Function** (`@/frontend/src/integrations/supabase/types.ts:301-303`):
- `calculate_distance(lat1, lat2, lon1, lon2)` already exists

### Current Gaps

1. **Events don't store coordinates directly** - Only venues have lat/lng
2. **No geocoding pipeline** - Address to coordinate conversion not implemented
3. **No radius-based filtering API** - Backend doesn't support distance queries
4. **Frontend doesn't send location** - Discover page lacks geolocation integration

---

## API Call Optimization Strategy

### Goal: Minimize Mapbox API Calls

To stay well within the free tier and reduce costs, we implement a **minimal API call strategy**:

| Component | Original Plan | Optimized Approach | Mapbox Calls |
|-----------|---------------|-------------------|--------------|
| **Frontend** | Reverse geocode GPS → City name | Browser geolocation only (GPS coords) | **0** |
| **Backend (Events)** | Geocode event addresses | Geocode on event creation | ~1,000/month |
| **Backend (Users)** | Reverse geocode user location | Store coords only, skip reverse geocode | **0** |
| **Total** | ~11,000/month | **~1,000/month** | **91% reduction** |

### UX Trade-off
- **Original**: "Events near San Francisco"
- **Optimized**: "Events near your location" + distance badge ("5 km away")

The user still gets hyper-local event discovery with distance indicators, just without the city name display. This is acceptable given the significant cost savings.

---

## Implementation Plan

### Phase 1: Database Schema Enhancement

#### 1.1 Add Geolocation Columns to Events Table

```sql
-- Migration: 09_add_event_geolocation.sql
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS geolocation_accuracy VARCHAR(20), -- 'exact', 'approximate', 'manual', 'venue_derived'
ADD COLUMN IF NOT EXISTS geocoded_at TIMESTAMP WITH TIME ZONE;

-- Create GiST index for efficient spatial queries (using pg_trgm or cube/earthdistance)
CREATE INDEX IF NOT EXISTS idx_events_location 
ON public.events USING btree (latitude, longitude) 
WHERE event_type IN ('in_person', 'hybrid') AND latitude IS NOT NULL AND longitude IS NOT NULL;
```

**Rationale**: Store coordinates directly on events for query efficiency. Joining with venues table for every distance query would be slower at scale.

#### 1.2 Enhanced Distance Calculation Function

```sql
-- Haversine formula for accurate distance calculation
CREATE OR REPLACE FUNCTION public.calculate_distance_km(
    lat1 DECIMAL(10, 8),
    lon1 DECIMAL(11, 8),
    lat2 DECIMAL(10, 8),
    lon2 DECIMAL(11, 8)
)
RETURNS DECIMAL(10, 2)
LANGUAGE SQL
IMMUTABLE
PARALLEL SAFE
AS $$
    SELECT (
        6371 * acos(
            cos(radians(lat1)) * 
            cos(radians(lat2)) * 
            cos(radians(lon2) - radians(lon1)) + 
            sin(radians(lat1)) * 
            sin(radians(lat2))
        )
    )::DECIMAL(10, 2);
$$;

-- Alternative: Earthdistance extension (more efficient for large datasets)
-- Requires: CREATE EXTENSION IF NOT EXISTS cube;
--           CREATE EXTENSION IF NOT EXISTS earthdistance;
```

#### 1.3 Radius-Based Event Search Function

```sql
-- RPC function for efficient radius filtering
CREATE OR REPLACE FUNCTION public.events_within_radius(
    user_lat DECIMAL(10, 8),
    user_lng DECIMAL(11, 8),
    radius_km INTEGER,
    event_type_filter TEXT[] DEFAULT ARRAY['in_person', 'hybrid']
)
RETURNS TABLE (
    event_id UUID,
    distance_km DECIMAL(10, 2)
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT 
        e.id as event_id,
        calculate_distance_km(user_lat, user_lng, e.latitude, e.longitude) as distance_km
    FROM public.events e
    WHERE 
        e.latitude IS NOT NULL 
        AND e.longitude IS NOT NULL
        AND e.event_type = ANY(event_type_filter)
        AND e.is_public = true
        AND e.status IN ('published', 'upcoming')
        AND calculate_distance_km(user_lat, user_lng, e.latitude, e.longitude) <= radius_km
    ORDER BY distance_km ASC;
$$;

-- Optimized version with bounding box pre-filter (faster)
CREATE OR REPLACE FUNCTION public.events_within_radius_fast(
    user_lat DECIMAL(10, 8),
    user_lng DECIMAL(11, 8),
    radius_km INTEGER,
    event_type_filter TEXT[] DEFAULT ARRAY['in_person', 'hybrid'],
    max_results INTEGER DEFAULT 100
)
RETURNS TABLE (
    event_id UUID,
    distance_km DECIMAL(10, 2)
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    WITH bounding_box AS (
        -- Pre-filter with bounding box for performance
        -- 1 degree latitude ≈ 111km, longitude varies by latitude
        SELECT 
            user_lat - (radius_km / 111.0) as min_lat,
            user_lat + (radius_km / 111.0) as max_lat,
            user_lng - (radius_km / (111.0 * cos(radians(user_lat)))) as min_lng,
            user_lng + (radius_km / (111.0 * cos(radians(user_lat)))) as max_lng
    )
    SELECT 
        e.id as event_id,
        calculate_distance_km(user_lat, user_lng, e.latitude, e.longitude) as distance_km
    FROM public.events e
    CROSS JOIN bounding_box bb
    WHERE 
        e.latitude BETWEEN bb.min_lat AND bb.max_lat
        AND e.longitude BETWEEN bb.min_lng AND bb.max_lng
        AND e.event_type = ANY(event_type_filter)
        AND e.is_public = true
        AND e.status IN ('published', 'upcoming')
        AND calculate_distance_km(user_lat, user_lng, e.latitude, e.longitude) <= radius_km
    ORDER BY distance_km ASC
    LIMIT max_results;
$$;
```

---

### Phase 2: Geocoding Integration

#### 2.1 Address-to-Coordinates Pipeline

**Options for Geocoding Service:**

| Service | Free Tier | Accuracy | Rate Limits | Best For |
|---------|-----------|----------|-------------|----------|
| **Google Geocoding API** | $200 credit/month | High | 50 QPS | Production accuracy |
| **OpenStreetMap Nominatim** | Free (with limits) | Medium | 1 req/sec | Cost-conscious |
| **Mapbox Geocoding** | 100K requests/month | High | 600 req/min | Good balance |
| **PositionStack** | 25K requests/month | Medium | Fair usage | Budget option |

**Recommended: Mapbox Geocoding API**
- Generous free tier (100K/month)
- High accuracy
- Good rate limits
- Affordable beyond free tier

#### 2.2 Backend Geocoding Service

```python
# backend/services/geocoding.py
import logging
from typing import Optional, Tuple
import httpx
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class GeocodedLocation(BaseModel):
    latitude: float
    longitude: float
    accuracy: str  # 'rooftop', 'interpolated', 'approximate', 'center'
    formatted_address: str
    place_id: Optional[str] = None

class GeocodingService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.mapbox.com/geocoding/v5/mapbox.places"
    
    async def geocode_address(
        self, 
        street: str, 
        city: str, 
        state: str, 
        zip_code: str, 
        country: str = "US"
    ) -> Optional[GeocodedLocation]:
        """Convert address to coordinates using Mapbox API."""
        
        # Construct full address query
        address_parts = [p for p in [street, city, state, zip_code, country] if p]
        query = ", ".join(address_parts)
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/{query}.json",
                    params={
                        "access_token": self.api_key,
                        "limit": 1,
                        "types": "address,poi,place",
                    },
                    timeout=10.0
                )
                response.raise_for_status()
                data = response.json()
                
                if not data.get("features"):
                    logger.warning(f"No geocoding results for address: {query}")
                    return None
                
                feature = data["features"][0]
                coords = feature["center"]  # [longitude, latitude]
                
                # Map accuracy
                accuracy_map = {
                    "rooftop": "exact",
                    "interpolated": "approximate",
                    "approximate": "approximate",
                    "center": "center"
                }
                
                return GeocodedLocation(
                    latitude=coords[1],
                    longitude=coords[0],
                    accuracy=accuracy_map.get(feature.get("accuracy"), "approximate"),
                    formatted_address=feature.get("place_name", query),
                    place_id=feature.get("id")
                )
                
        except Exception as e:
            logger.error(f"Geocoding failed for '{query}': {e}")
            return None
```

#### 2.3 Event Creation/Update Geocoding Hook

```python
# backend/api/events.py - enhanced create/update logic

async def geocode_event_location(event_data: dict) -> dict:
    """Add geocoding to event data if venue address provided."""
    
    # Skip for online-only events
    if event_data.get("event_type") == "online":
        return event_data
    
    # Check if we have venue address data
    venue_fields = ["venue_street", "venue_city", "venue_state", "venue_zip_code"]
    if not any(event_data.get(f) for f in venue_fields):
        return event_data
    
    # Initialize geocoding service
    from config.settings import settings
    from services.geocoding import GeocodingService
    
    geocoder = GeocodingService(settings.mapbox_api_key)
    
    # Geocode the address
    location = await geocoder.geocode_address(
        street=event_data.get("venue_street", ""),
        city=event_data.get("venue_city", ""),
        state=event_data.get("venue_state", ""),
        zip_code=event_data.get("venue_zip_code", ""),
        country=event_data.get("venue_country", "US")
    )
    
    if location:
        event_data["latitude"] = location.latitude
        event_data["longitude"] = location.longitude
        event_data["geolocation_accuracy"] = location.accuracy
        event_data["geocoded_at"] = datetime.now().isoformat()
    
    return event_data

# Update create_event logic:
async def _create_event_logic(event: EventCreate, user: dict) -> EventResponse:
    """Shared logic for creating an event with geocoding."""
    try:
        event_data = event.model_dump()
        event_data["organizer_id"] = user["id"]
        
        # Add geocoding for in-person events
        event_data = await geocode_event_location(event_data)
        
        response = insert_record("events", event_data)
        # ... rest of logic
```

---

### Phase 3: API Endpoints for Distance-Based Discovery

#### 3.1 Enhanced Events List Endpoint

```python
# backend/api/events.py - enhanced get_events

@router.get("/discover/nearby", response_model=List[EventResponse])
async def get_nearby_events(
    lat: float = Query(..., description="User latitude"),
    lng: float = Query(..., description="User longitude"),
    radius: int = Query(25, ge=1, le=500, description="Search radius in km"),
    category: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    user: Optional[dict] = Depends(optional_auth),
):
    """
    Get events within specified radius from user location.
    Uses optimized bounding box + haversine calculation.
    """
    try:
        # Call the database function for efficient radius filtering
        result = call_rpc(
            "events_within_radius_fast",
            {
                "user_lat": lat,
                "user_lng": lng,
                "radius_km": radius,
                "max_results": limit + offset
            }
        )
        
        if not result.data:
            return []
        
        # Get full event details for filtered IDs
        event_ids = [r["event_id"] for r in result.data[offset:offset+limit]]
        distances = {r["event_id"]: r["distance_km"] for r in result.data}
        
        if not event_ids:
            return []
        
        # Fetch full event details
        table = get_table("events")
        query = table.select("*").in_("id", event_ids)
        
        if category:
            query = query.eq("category", category)
        
        query = query.is_("deleted_at", "null")
        query = query.or_("status.eq.published,status.eq.upcoming,status.is.null")
        
        response = query.execute()
        
        # Add distance to each event
        events = []
        for event in response.data:
            event["distance_km"] = distances.get(event["id"])
            event["current_participants"] = 0
            events.append(event)
        
        # Sort by distance
        events.sort(key=lambda x: x.get("distance_km", float('inf')))
        
        return events
        
    except Exception as e:
        logger.error(f"Error fetching nearby events: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch nearby events",
        )
```

#### 3.2 User Location Update Endpoint

```python
# backend/api/users.py

@router.put("/me/location")
async def update_user_location(
    lat: float = Body(..., embed=True),
    lng: float = Body(..., embed=True),
    city: Optional[str] = Body(None, embed=True),
    distance_range: Optional[int] = Body(None, embed=True, ge=1, le=500),
    user: dict = Depends(get_current_user),
):
    """Update user's location and search preferences."""
    try:
        update_data = {
            "latitude": lat,
            "longitude": lng,
            "updated_at": datetime.now().isoformat()
        }
        
        if city:
            update_data["city"] = city
        if distance_range:
            update_data["distance_range"] = distance_range
        
        response = update_record(
            "user_preferences", 
            user["id"], 
            update_data,
            id_column="user_id"
        )
        
        return {"message": "Location updated", "data": response.data[0]}
        
    except Exception as e:
        logger.error(f"Error updating user location: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update location",
        )
```

---

### Phase 4: Frontend Implementation

#### 4.1 Geolocation Hook

```typescript
// frontend/src/hooks/useGeolocation.ts
import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  permission: 'granted' | 'denied' | 'prompt' | 'unknown';
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  onLocationUpdate?: (lat: number, lng: number) => void;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    city: null,
    accuracy: null,
    loading: false,
    error: null,
    permission: 'unknown',
  });

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocation not supported' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Check permission state first
      if ('permissions' in navigator) {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setState(prev => ({ ...prev, permission: result.state as GeolocationState['permission'] }));
        
        if (result.state === 'denied') {
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            error: 'Location permission denied. Please enable in browser settings.' 
          }));
          return;
        }
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          // NO Mapbox reverse geocoding - just use GPS coordinates
          // City name lookup is skipped to minimize API costs
          
          setState({
            latitude,
            longitude,
            city: null, // No reverse geocoding
            accuracy,
            loading: false,
            error: null,
            permission: 'granted',
          });

          options.onLocationUpdate?.(latitude, longitude);
        },
        (error) => {
          let errorMessage = 'Failed to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            error: errorMessage,
            permission: 'denied'
          }));
        },
        {
          enableHighAccuracy: options.enableHighAccuracy ?? true,
          timeout: options.timeout ?? 10000,
          maximumAge: options.maximumAge ?? 300000, // 5 minutes
        }
      );
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: 'Failed to access geolocation' }));
    }
  }, [options]);

  // NOTE: No reverse geocoding function - city lookup removed to save API calls

  return {
    ...state,
    requestLocation,
  };
}
```

#### 4.2 Location-Based Discovery Component

```tsx
// frontend/src/components/discovery/LocationFilter.tsx
import React from 'react';
import { MapPin, Crosshair, Settings2 } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';

interface LocationFilterProps {
  radius: number;
  onRadiusChange: (radius: number) => void;
  onLocationChange: (lat: number, lng: number, city: string | null) => void;
}

const RADIUS_OPTIONS = [
  { value: 5, label: '5 km', description: 'Walking distance' },
  { value: 10, label: '10 km', description: 'Nearby' },
  { value: 25, label: '25 km', description: 'City area' },
  { value: 50, label: '50 km', description: 'Metro area' },
  { value: 100, label: '100 km', description: 'Day trip' },
];

export function LocationFilter({ radius, onRadiusChange, onLocationChange }: LocationFilterProps) {
  const { 
    latitude, 
    longitude, 
    city, 
    loading, 
    error, 
    permission, 
    requestLocation 
  } = useGeolocation({
    onLocationUpdate: (lat, lng) => onLocationChange(lat, lng, city),
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Location
        </h3>
        <button
          onClick={requestLocation}
          disabled={loading}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <Crosshair className="w-4 h-4" />
          {loading ? 'Detecting...' : latitude ? 'Update' : 'Detect'}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
      )}

      {latitude && (
        <p className="text-sm text-gray-600">
          Showing events <span className="font-medium text-gray-900">near your location</span>
        </p>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Settings2 className="w-4 h-4" />
          Search radius
        </label>
        <div className="grid grid-cols-3 gap-2">
          {RADIUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onRadiusChange(option.value)}
              className={`p-2 text-sm rounded-lg border transition-colors ${
                radius === option.value
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-xs text-gray-500">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {!latitude && permission !== 'denied' && (
        <button
          onClick={requestLocation}
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Getting location...' : 'Enable location for nearby events'}
        </button>
      )}
    </div>
  );
}
```

#### 4.3 Enhanced Discover Page

```tsx
// frontend/src/pages/Discover.tsx - key additions

import { useState, useEffect } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { LocationFilter } from '@/components/discovery/LocationFilter';
import { supabase } from '@/integrations/supabase/client';

export function Discover() {
  const [events, setEvents] = useState<Event[]>([]);
  const [radius, setRadius] = useState(25);
  const [useLocation, setUseLocation] = useState(false);
  
  const { latitude, longitude, city, requestLocation } = useGeolocation();

  // Load user's saved preferences
  useEffect(() => {
    const loadPreferences = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from('user_preferences')
        .select('distance_range, latitude, longitude, city')
        .eq('user_id', user.id)
        .single();
        
      if (data) {
        setRadius(data.distance_range || 25);
        if (data.latitude && data.longitude) {
          // User has saved location
          setUseLocation(true);
        }
      }
    };
    
    loadPreferences();
  }, []);

  // Fetch events based on location
  useEffect(() => {
    const fetchNearbyEvents = async () => {
      if (!latitude || !longitude) return;
      
      const response = await fetch(
        `/api/events/discover/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`
      );
      const data = await response.json();
      setEvents(data);
    };
    
    if (useLocation && latitude && longitude) {
      fetchNearbyEvents();
    } else {
      // Fall back to regular event listing
      fetchAllEvents();
    }
  }, [latitude, longitude, radius, useLocation]);

  // Save location preferences when user changes them
  const handleLocationUpdate = async (lat: number, lng: number, newCity: string | null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase
      .from('user_preferences')
      .update({
        latitude: lat,
        longitude: lng,
        city: newCity,
        distance_range: radius,
      })
      .eq('user_id', user.id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with filters */}
        <div className="lg:col-span-1 space-y-4">
          <LocationFilter
            radius={radius}
            onRadiusChange={setRadius}
            onLocationChange={handleLocationUpdate}
          />
          {/* Other filters... */}
        </div>
        
        {/* Event grid */}
        <div className="lg:col-span-3">
          {events.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              showDistance={useLocation}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

#### 4.4 Event Card with Distance Display

```tsx
// frontend/src/components/events/EventCard.tsx

interface EventCardProps {
  event: Event & { distance_km?: number };
  showDistance?: boolean;
}

export function EventCard({ event, showDistance }: EventCardProps) {
  const formatDistance = (km: number): string => {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    if (km < 10) return `${km.toFixed(1)} km`;
    return `${Math.round(km)} km`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Event image, title, etc. */}
      
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{event.title}</h3>
          
          {showDistance && event.distance_km !== undefined && (
            <span className="inline-flex items-center gap-1 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              <MapPin className="w-3 h-3" />
              {formatDistance(event.distance_km)} away
            </span>
          )}
        </div>
        
        {/* Location info */}
        <p className="text-sm text-gray-600 mt-1">
          {event.venue_city || event.city}
          {event.venue_street && ` • ${event.venue_street}`}
        </p>
      </div>
    </div>
  );
}
```

---

### Phase 5: Data Migration & Backfill

#### 5.1 Migrate Existing Events

```sql
-- Migration: 10_backfill_event_geolocation.sql

-- Backfill coordinates for existing events with venue addresses
UPDATE public.events e
SET 
    latitude = v.latitude,
    longitude = v.longitude,
    geolocation_accuracy = 'venue_derived',
    geocoded_at = NOW()
FROM public.venues v
WHERE 
    e.primary_venue_id = v.id
    AND e.latitude IS NULL
    AND v.latitude IS NOT NULL;

-- Create a batch geocoding queue for remaining events
CREATE TABLE IF NOT EXISTS public.geocoding_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    address_text TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
    attempts INTEGER DEFAULT 0,
    result_latitude DECIMAL(10, 8),
    result_longitude DECIMAL(11, 8),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Populate queue with events needing geocoding
INSERT INTO public.geocoding_queue (event_id, address_text)
SELECT 
    e.id,
    CONCAT_WS(', ', 
        NULLIF(e.venue_street, ''),
        NULLIF(e.venue_city, ''),
        NULLIF(e.venue_state, ''),
        NULLIF(e.venue_zip_code, ''),
        NULLIF(e.venue_country, '')
    ) as address_text
FROM public.events e
WHERE 
    e.event_type IN ('in_person', 'hybrid')
    AND e.latitude IS NULL
    AND e.venue_city IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM public.geocoding_queue q WHERE q.event_id = e.id
    );
```

#### 5.2 Background Geocoding Worker

```python
# backend/workers/geocoding_worker.py
import asyncio
import logging
from datetime import datetime
from services.geocoding import GeocodingService
from config.database import get_table, update_record

logger = logging.getLogger(__name__)

async def process_geocoding_queue(batch_size: int = 100):
    """Process pending geocoding jobs in batches."""
    
    geocoder = GeocodingService()
    queue_table = get_table("geocoding_queue")
    
    # Get pending jobs
    response = queue_table.select("*").eq("status", "pending").limit(batch_size).execute()
    
    for job in response.data:
        try:
            # Mark as processing
            queue_table.update({
                "id": job["id"],
                "status": "processing",
                "attempts": job["attempts"] + 1
            }).execute()
            
            # Parse address components from stored data
            event_id = job["event_id"]
            address_text = job["address_text"]
            
            # Geocode
            location = await geocoder.geocode_freeform(address_text)
            
            if location:
                # Update event with coordinates
                update_record("events", event_id, {
                    "latitude": location.latitude,
                    "longitude": location.longitude,
                    "geolocation_accuracy": location.accuracy,
                    "geocoded_at": datetime.now().isoformat()
                })
                
                # Mark queue job as completed
                queue_table.update({
                    "id": job["id"],
                    "status": "completed",
                    "result_latitude": location.latitude,
                    "result_longitude": location.longitude,
                    "processed_at": datetime.now().isoformat()
                }).execute()
            else:
                raise Exception("Geocoding returned no results")
                
        except Exception as e:
            logger.error(f"Geocoding failed for job {job['id']}: {e}")
            
            # Mark as failed or retry
            new_status = "failed" if job["attempts"] >= 2 else "pending"
            queue_table.update({
                "id": job["id"],
                "status": new_status,
                "error_message": str(e)[:500],
                "processed_at": datetime.now().isoformat() if new_status == "failed" else None
            }).execute()

# Run as cron job or background worker
if __name__ == "__main__":
    asyncio.run(process_geocoding_queue())
```

---

## Performance Optimization

### Indexing Strategy

```sql
-- Composite index for common query patterns
CREATE INDEX CONCURRENTLY idx_events_location_radius 
ON public.events (latitude, longitude) 
INCLUDE (id, title, category, start_time, is_public, status)
WHERE event_type IN ('in_person', 'hybrid') AND is_public = true;

-- Partial index for active events only
CREATE INDEX CONCURRENTLY idx_events_active_location
ON public.events (latitude, longitude, start_time)
WHERE status IN ('published', 'upcoming') 
  AND event_type IN ('in_person', 'hybrid')
  AND is_public = true;
```

### Query Optimization

**Bounding Box Pre-filtering** (already implemented in `events_within_radius_fast`):
1. Calculate min/max lat/lng based on radius
2. Filter events within bounding box (uses index)
3. Apply haversine formula only to filtered results
4. Sort by distance

**Caching Strategy**:
- Cache geocoded coordinates for addresses
- Cache user's location in localStorage
- Cache popular event queries with short TTL

---

## Security & Privacy Considerations

### Location Privacy

1. **Opt-in Only**: Location is never requested without explicit user action
2. **Approximate by Default**: Use city-level precision unless user requests exact
3. **No Storage of Raw GPS**: Store only what the user consents to
4. **Clear Indicators**: Always show when location is being used

### Data Access Controls

```sql
-- Ensure RLS policies protect location data
CREATE POLICY "Users can only see their own precise location" 
ON public.user_preferences
FOR SELECT
USING (auth.uid() = user_id);

-- Event coordinates are public (needed for discovery)
CREATE POLICY "Event locations are public for public events"
ON public.events
FOR SELECT
USING (is_public = true OR auth.uid() = organizer_id);
```

---

## Testing Strategy

### Unit Tests

```python
# backend/tests/test_geolocation.py

import pytest
from services.geocoding import GeocodingService

@pytest.mark.asyncio
async def test_geocode_address():
    geocoder = GeocodingService(api_key="test_key")
    
    # Mock response
    location = await geocoder.geocode_address(
        street="1600 Amphitheatre Parkway",
        city="Mountain View",
        state="CA",
        zip_code="94043"
    )
    
    assert location is not None
    assert location.latitude is not None
    assert location.longitude is not None

@pytest.mark.asyncio
async def test_calculate_distance():
    # Test haversine calculation
    # SF to LA: ~550 km
    distance = calculate_distance_km(37.7749, -122.4194, 34.0522, -118.2437)
    assert 540 < distance < 560
```

### Integration Tests

```typescript
// frontend/src/__tests__/LocationFilter.test.tsx

describe('LocationFilter', () => {
  it('requests location permission on mount', async () => {
    const mockGeolocation = {
      getCurrentPosition: jest.fn((success) => 
        success({ coords: { latitude: 37.7749, longitude: -122.4194, accuracy: 10 } })
      )
    };
    global.navigator.geolocation = mockGeolocation;
    
    render(<LocationFilter radius={25} onRadiusChange={jest.fn()} onLocationChange={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText(/San Francisco/i)).toBeInTheDocument();
    });
  });
});
```

---

## Rollout Plan

### Phase 1: Infrastructure (Week 1)
1. Database migrations (add columns, indexes, functions)
2. Backend geocoding service
3. API endpoints

### Phase 2: Core Features (Week 2)
1. Frontend geolocation hook
2. Location filter component
3. Enhanced Discover page

### Phase 3: Data Backfill (Week 3)
1. Run migration for existing venue-linked events
2. Deploy background geocoding worker
3. Monitor queue processing

### Phase 4: Polish (Week 4)
1. Performance monitoring
2. Edge case handling
3. User feedback iteration

---

## Monitoring & Analytics

### Key Metrics

- **Geocoding success rate**: % of addresses successfully geocoded
- **Average geocoding latency**: Time to convert address to coordinates
- **Radius query performance**: P95 response time for nearby events
- **User location adoption**: % of users enabling location services
- **Event discovery lift**: Increase in event views/clicks with location filtering

### Alerts

```yaml
# Alert conditions
- Geocoding success rate < 90% for 1 hour
- Average query time > 500ms for 5 minutes
- Geocoding queue backlog > 1000 jobs
```

---

## Cost Estimates

### Mapbox Geocoding API (Recommended)

| Tier | Requests/Month | Cost |
|------|---------------|------|
| Free | 100,000 | $0 |
| Pay-as-you-go | 500,000 | ~$250 |
| Scale | 1,000,000 | ~$500 |

**Optimized Estimates** (Minimal API Call Strategy):
- 1,000 events/month × 1 geocode each (backend only) = **1,000 requests**
- 10,000 users × location updates = **0 requests** (frontend GPS only, no reverse geocoding)
- **Total**: ~1,000 requests/month → **Well within free tier** (99% buffer remaining)

### Backend-Only Token Configuration

Since we only call Mapbox from the backend:

**Create a Secret Token** (not Public):
1. Mapbox Studio → Account → Access tokens
2. Create token → Select "Secret token"
3. URL restrictions: Add `https://eventradius-api.onrender.com/*`
4. No frontend domains needed

**Environment Variables**:
```bash
# backend/.env
MAPBOX_API_KEY=sk.your_secret_token_here
```

**Note**: No `VITE_MAPBOX_TOKEN` needed in frontend - eliminates frontend API calls entirely.

---

## Summary

This implementation plan provides a comprehensive solution for hyper-local event discovery:

1. **Database Layer**: Efficient spatial queries with bounding box optimization
2. **Geocoding Pipeline**: Mapbox integration for address-to-coordinate conversion
3. **API Layer**: RPC functions for radius-based filtering
4. **Frontend**: Privacy-conscious geolocation with user control
5. **Migration Strategy**: Backfill existing events while maintaining service

The solution balances **accuracy**, **performance**, and **privacy** while remaining cost-effective for the expected scale.
