-- Migration: Add geolocation support for hyper-local event discovery
-- Phase 1: Database Schema Enhancement

-- ============================================
-- 1.1 Add Geolocation Columns to Events Table
-- ============================================

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS geolocation_accuracy VARCHAR(20), -- 'exact', 'approximate', 'manual', 'venue_derived'
ADD COLUMN IF NOT EXISTS geocoded_at TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN public.events.latitude IS 'Event latitude coordinate for location-based discovery';
COMMENT ON COLUMN public.events.longitude IS 'Event longitude coordinate for location-based discovery';
COMMENT ON COLUMN public.events.geolocation_accuracy IS 'Accuracy level of geocoded coordinates: exact, approximate, manual, venue_derived';
COMMENT ON COLUMN public.events.geocoded_at IS 'Timestamp when coordinates were geocoded';

-- ============================================
-- 1.2 Create Location Indexes for Performance
-- ============================================

-- Basic btree index for latitude/longitude lookups
CREATE INDEX IF NOT EXISTS idx_events_location 
ON public.events USING btree (latitude, longitude) 
WHERE event_type IN ('in_person', 'hybrid') AND latitude IS NOT NULL AND longitude IS NOT NULL;

-- Composite index with included columns for common query patterns
CREATE INDEX IF NOT EXISTS idx_events_location_with_details 
ON public.events (latitude, longitude) 
INCLUDE (id, title, category, start_time, is_public, status)
WHERE event_type IN ('in_person', 'hybrid') AND is_public = true;

-- Partial index for active events only (most common query)
CREATE INDEX IF NOT EXISTS idx_events_active_location
ON public.events (latitude, longitude, start_time)
WHERE status IN ('published', 'upcoming') 
  AND event_type IN ('in_person', 'hybrid')
  AND is_public = true
  AND latitude IS NOT NULL 
  AND longitude IS NOT NULL;

-- ============================================
-- 1.3 Enhanced Distance Calculation Function
-- ============================================

-- Haversine formula for accurate distance calculation between two points
-- Returns distance in kilometers
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
            LEAST(1.0, GREATEST(-1.0,
                cos(radians(lat1)) * 
                cos(radians(lat2)) * 
                cos(radians(lon2) - radians(lon1)) + 
                sin(radians(lat1)) * 
                sin(radians(lat2))
            ))
        )
    )::DECIMAL(10, 2);
$$;

COMMENT ON FUNCTION public.calculate_distance_km IS 'Calculate distance between two lat/lng points using Haversine formula (returns km)';

-- ============================================
-- 1.4 Radius-Based Event Search Functions
-- ============================================

-- Basic radius search function
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
        AND e.event_type::TEXT = ANY(event_type_filter)
        AND e.is_public = true
        AND e.status IN ('published', 'upcoming')
        AND e.deleted_at IS NULL
        AND calculate_distance_km(user_lat, user_lng, e.latitude, e.longitude) <= radius_km
    ORDER BY distance_km ASC;
$$;

COMMENT ON FUNCTION public.events_within_radius IS 'Find events within specified radius using haversine distance calculation';

-- Optimized radius search with bounding box pre-filter (faster for large datasets)
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
        AND e.event_type::TEXT = ANY(event_type_filter)
        AND e.is_public = true
        AND e.status IN ('published', 'upcoming')
        AND e.deleted_at IS NULL
        AND calculate_distance_km(user_lat, user_lng, e.latitude, e.longitude) <= radius_km
    ORDER BY distance_km ASC
    LIMIT max_results;
$$;

COMMENT ON FUNCTION public.events_within_radius_fast IS 'Optimized radius search using bounding box pre-filter for better performance';

-- ============================================
-- 1.5 Additional Utility Functions
-- ============================================

-- Function to get events with full details within radius
CREATE OR REPLACE FUNCTION public.get_nearby_events_with_details(
    user_lat DECIMAL(10, 8),
    user_lng DECIMAL(11, 8),
    radius_km INTEGER DEFAULT 25,
    category_filter TEXT DEFAULT NULL,
    max_results INTEGER DEFAULT 50
)
RETURNS TABLE (
    event_id UUID,
    title TEXT,
    description TEXT,
    category TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    venue_city TEXT,
    venue_state TEXT,
    image_url TEXT,
    is_paid_event BOOLEAN,
    distance_km DECIMAL(10, 2)
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    WITH nearby AS (
        SELECT * FROM events_within_radius_fast(user_lat, user_lng, radius_km, ARRAY['in_person', 'hybrid'], max_results * 2)
    )
    SELECT 
        e.id as event_id,
        e.title,
        e.description,
        e.category,
        e.start_time,
        e.venue_city,
        e.venue_state,
        e.image_url,
        e.is_paid_event,
        n.distance_km
    FROM public.events e
    JOIN nearby n ON e.id = n.event_id
    WHERE 
        e.deleted_at IS NULL
        AND (category_filter IS NULL OR e.category = category_filter)
    ORDER BY n.distance_km ASC
    LIMIT max_results;
$$;

COMMENT ON FUNCTION public.get_nearby_events_with_details IS 'Get nearby events with essential details for display';

-- ============================================
-- 1.6 RLS Policy Updates for Location Data
-- ============================================

-- Ensure event coordinates are public for public events
DROP POLICY IF EXISTS "Event locations are public for public events" ON public.events;

CREATE POLICY "Event locations are public for public events"
ON public.events
FOR SELECT
USING (
    is_public = true 
    OR auth.uid() = organizer_id
    OR auth.uid() IS NULL  -- Allow anonymous access to public events
);

-- User preferences location data protection (already exists, verify)
-- Users should only see their own precise location
DROP POLICY IF EXISTS "Users can only see their own precise location" ON public.user_preferences;

CREATE POLICY "Users can only see their own precise location"
ON public.user_preferences
FOR SELECT
USING (auth.uid() = user_id);

-- ============================================
-- 1.7 Backfill Existing Events from Venues
-- ============================================

-- Populate coordinates for existing events that have venue data
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
    AND v.latitude IS NOT NULL
    AND v.longitude IS NOT NULL;

-- Create a view to track geolocation coverage
CREATE OR REPLACE VIEW public.event_geolocation_stats AS
SELECT 
    COUNT(*) as total_events,
    COUNT(latitude) as events_with_coordinates,
    COUNT(*) - COUNT(latitude) as events_needing_geocoding,
    ROUND(COUNT(latitude) * 100.0 / NULLIF(COUNT(*), 0), 2) as coverage_percentage,
    geolocation_accuracy,
    COUNT(*) FILTER (WHERE geolocation_accuracy IS NOT NULL) as count_by_accuracy
FROM public.events
WHERE event_type IN ('in_person', 'hybrid')
  AND deleted_at IS NULL
GROUP BY geolocation_accuracy;

COMMENT ON VIEW public.event_geolocation_stats IS 'Statistics on event geolocation coverage';

-- ============================================
-- Migration Complete
-- ============================================
