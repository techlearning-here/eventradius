-- Migration: Add Comprehensive Event Attributes
-- Description: Add demographic, accessibility, cultural, prerequisite, and content rating fields to events table
-- Created: 2026-04-08

-- Add Audience & Demographics fields
ALTER TABLE events
ADD COLUMN IF NOT EXISTS age_categories text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS gender_preference varchar(50) DEFAULT 'all',
ADD COLUMN IF NOT EXISTS family_friendly boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS senior_friendly boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS singles_friendly boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS couples_oriented boolean DEFAULT false;

-- Add Accessibility fields
ALTER TABLE events
ADD COLUMN IF NOT EXISTS wheelchair_accessible boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS mobility_friendly boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS hearing_accessible boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS vision_accessible boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sensory_friendly boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS service_animals_allowed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS accessibility_notes text;

-- Add Cultural Context fields
ALTER TABLE events
ADD COLUMN IF NOT EXISTS religious_context text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS dietary_context text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS traditional_attire varchar(50) DEFAULT 'not_applicable';

-- Add Prerequisites & Requirements fields
ALTER TABLE events
ADD COLUMN IF NOT EXISTS skill_level varchar(50) DEFAULT 'all_levels',
ADD COLUMN IF NOT EXISTS prior_experience varchar(50) DEFAULT 'none_required',
ADD COLUMN IF NOT EXISTS physical_fitness varchar(50) DEFAULT 'sedentary',
ADD COLUMN IF NOT EXISTS equipment_required text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS dress_code varchar(50) DEFAULT 'casual',
ADD COLUMN IF NOT EXISTS prerequisites_notes text;

-- Add Content & Intensity fields
ALTER TABLE events
ADD COLUMN IF NOT EXISTS content_rating varchar(50) DEFAULT 'all_ages',
ADD COLUMN IF NOT EXISTS alcohol_served varchar(50) DEFAULT 'no_alcohol',
ADD COLUMN IF NOT EXISTS smoking_policy varchar(50) DEFAULT 'non_smoking',
ADD COLUMN IF NOT EXISTS noise_level varchar(50) DEFAULT 'moderate',
ADD COLUMN IF NOT EXISTS physical_intensity varchar(50) DEFAULT 'none';

-- Add Social & Networking fields
ALTER TABLE events
ADD COLUMN IF NOT EXISTS networking_focus boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS social_mixer boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ice_breakers boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS group_activities boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS team_building boolean DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN events.age_categories IS 'Array of age groups suitable for the event: all_ages, kids, teens, young_adults, adults_25_35, middle_age, 50_plus, seniors_65_plus, etc.';
COMMENT ON COLUMN events.gender_preference IS 'Target gender audience: all, women_only, men_only, lgbtq_friendly, gender_neutral';
COMMENT ON COLUMN events.religious_context IS 'Array of religious/spiritual contexts: hindu, christian, muslim, buddhist, jewish, sikh, jain, interfaith, secular, etc.';
COMMENT ON COLUMN events.dietary_context IS 'Array of dietary accommodations: vegetarian, vegan, halal, kosher, jain, gluten_free, nut_free, dairy_free';
COMMENT ON COLUMN events.skill_level IS 'Required skill level: beginner, intermediate, advanced, all_levels';
COMMENT ON COLUMN events.content_rating IS 'Age appropriateness: all_ages, pg, pg_13, mature_18, explicit';
COMMENT ON COLUMN events.wheelchair_accessible IS 'Venue is wheelchair accessible with ramps and wide doorways';

-- Create indexes for common filter queries
CREATE INDEX IF NOT EXISTS idx_events_age_categories ON events USING GIN (age_categories);
CREATE INDEX IF NOT EXISTS idx_events_religious_context ON events USING GIN (religious_context);
CREATE INDEX IF NOT EXISTS idx_events_dietary_context ON events USING GIN (dietary_context);
CREATE INDEX IF NOT EXISTS idx_events_equipment_required ON events USING GIN (equipment_required);
CREATE INDEX IF NOT EXISTS idx_events_family_friendly ON events (family_friendly) WHERE family_friendly = true;
CREATE INDEX IF NOT EXISTS idx_events_senior_friendly ON events (senior_friendly) WHERE senior_friendly = true;
CREATE INDEX IF NOT EXISTS idx_events_wheelchair_accessible ON events (wheelchair_accessible) WHERE wheelchair_accessible = true;
CREATE INDEX IF NOT EXISTS idx_events_content_rating ON events (content_rating);
CREATE INDEX IF NOT EXISTS idx_events_skill_level ON events (skill_level);

-- Add composite index for AI matching queries
CREATE INDEX IF NOT EXISTS idx_events_matching_attributes ON events 
  (gender_preference, skill_level, content_rating, family_friendly, senior_friendly);

-- Update RLS policies to include new fields if needed
-- (New fields are automatically covered by existing SELECT/INSERT/UPDATE policies)

-- Verify migration
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM information_schema.columns
  WHERE table_name = 'events'
  AND column_name IN (
    'age_categories', 'gender_preference', 'family_friendly',
    'wheelchair_accessible', 'religious_context', 'skill_level',
    'content_rating', 'networking_focus'
  );
  
  IF v_count >= 8 THEN
    RAISE NOTICE 'Migration successful: % new attribute columns added to events table', v_count;
  ELSE
    RAISE WARNING 'Migration may be incomplete: only % columns found', v_count;
  END IF;
END $$;
