-- Migration: Add User Profile Attributes for Event Matching
-- Description: Add comprehensive user attributes for personalized event recommendations
-- Created: 2026-04-08

-- Add Cultural Identity fields
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS religion varchar(50),
ADD COLUMN IF NOT EXISTS religious_observance varchar(50),
ADD COLUMN IF NOT EXISTS ethnicity text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS nationality varchar(100),
ADD COLUMN IF NOT EXISTS cultural_background text;

-- Add Language fields
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS primary_language varchar(50) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS secondary_languages text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_event_languages text[] DEFAULT '{}';

-- Add Interests (stored as JSONB for flexibility)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS interests jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS music_genres text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS sports_fitness text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS arts_culture text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS food_drink text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tech_gaming text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS wellness_mindfulness text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS outdoor_activities text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS learning_education text[] DEFAULT '{}';

-- Add Social Preferences
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS preferred_group_size varchar(50),
ADD COLUMN IF NOT EXISTS social_style varchar(50),
ADD COLUMN IF NOT EXISTS looking_for text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS event_companion varchar(50),
ADD COLUMN IF NOT EXISTS comfort_level varchar(50);

-- Add Event Preferences
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS preferred_days text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_times text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS max_event_duration varchar(50),
ADD COLUMN IF NOT EXISTS price_comfort varchar(50),
ADD COLUMN IF NOT EXISTS virtual_comfort varchar(50);

-- Add Accessibility Needs
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS accessibility_needs text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS dietary_restrictions text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS sensory_sensitivities boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS service_animal boolean DEFAULT false;

-- Add Family & Relationship
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS relationship_status varchar(50),
ADD COLUMN IF NOT EXISTS has_children boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS children_ages text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS pet_owner boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS pet_types text[] DEFAULT '{}';

-- Add Professional/Educational
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS industry varchar(100),
ADD COLUMN IF NOT EXISTS job_function varchar(100),
ADD COLUMN IF NOT EXISTS career_level varchar(50),
ADD COLUMN IF NOT EXISTS education_level varchar(50);

-- Add Geographic Preferences
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS preferred_search_radius varchar(50),
ADD COLUMN IF NOT EXISTS willing_to_travel boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS max_travel_distance varchar(50);

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.interests IS 'JSONB object containing user interest categories with weights for AI matching';
COMMENT ON COLUMN user_profiles.looking_for IS 'Array of goals: friends, networking, dating, learning, entertainment, professional_growth';
COMMENT ON COLUMN user_profiles.social_style IS 'User personality: introvert, extrovert, ambivert';
COMMENT ON COLUMN user_profiles.virtual_comfort IS 'Preference for virtual events: in_person_only, virtual_ok, hybrid_ok, virtual_preferred';
COMMENT ON COLUMN user_profiles.price_comfort IS 'Budget preference: free_only, under_25, under_50, under_100, any';

-- Create GIN indexes for array fields (fast containment queries)
CREATE INDEX IF NOT EXISTS idx_user_profiles_ethnicity ON user_profiles USING GIN (ethnicity);
CREATE INDEX IF NOT EXISTS idx_user_profiles_interests ON user_profiles USING GIN (interests);
CREATE INDEX IF NOT EXISTS idx_user_profiles_music_genres ON user_profiles USING GIN (music_genres);
CREATE INDEX IF NOT EXISTS idx_user_profiles_sports_fitness ON user_profiles USING GIN (sports_fitness);
CREATE INDEX IF NOT EXISTS idx_user_profiles_looking_for ON user_profiles USING GIN (looking_for);
CREATE INDEX IF NOT EXISTS idx_user_profiles_dietary_restrictions ON user_profiles USING GIN (dietary_restrictions);
CREATE INDEX IF NOT EXISTS idx_user_profiles_accessibility_needs ON user_profiles USING GIN (accessibility_needs);
CREATE INDEX IF NOT EXISTS idx_user_profiles_preferred_days ON user_profiles USING GIN (preferred_days);

-- Create B-tree indexes for common filter fields
CREATE INDEX IF NOT EXISTS idx_user_profiles_religion ON user_profiles (religion);
CREATE INDEX IF NOT EXISTS idx_user_profiles_primary_language ON user_profiles (primary_language);
CREATE INDEX IF NOT EXISTS idx_user_profiles_social_style ON user_profiles (social_style);
CREATE INDEX IF NOT EXISTS idx_user_profiles_career_level ON user_profiles (career_level);
CREATE INDEX IF NOT EXISTS idx_user_profiles_relationship_status ON user_profiles (relationship_status);

-- Add composite index for matching queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_matching ON user_profiles 
  (social_style, preferred_group_size, price_comfort, has_children);

-- Create a function to calculate event match score
CREATE OR REPLACE FUNCTION calculate_event_match_score(
  p_user_id uuid,
  p_event_id uuid
)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  v_score numeric := 0;
  v_user user_profiles%ROWTYPE;
  v_event events%ROWTYPE;
BEGIN
  -- Get user and event data
  SELECT * INTO v_user FROM user_profiles WHERE id = p_user_id;
  SELECT * INTO v_event FROM events WHERE id = p_event_id;
  
  IF v_user IS NULL OR v_event IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Strict matches (deal breakers) - high weight
  IF v_event.age_categories && ARRAY['all_ages'] OR 
     v_event.age_categories && v_user.children_ages THEN
    v_score := v_score + 25;
  END IF;
  
  -- Accessibility match
  IF v_user.accessibility_needs && ARRAY['wheelchair'] AND v_event.wheelchair_accessible THEN
    v_score := v_score + 20;
  END IF;
  
  -- Dietary match
  IF v_user.dietary_restrictions && v_event.dietary_context THEN
    v_score := v_score + 15;
  END IF;
  
  -- Religious/cultural match
  IF v_user.religion IS NOT NULL AND v_event.religious_context @> ARRAY[v_user.religion] THEN
    v_score := v_score + 10;
  END IF;
  
  -- Family friendly match
  IF v_user.has_children AND v_event.family_friendly THEN
    v_score := v_score + 10;
  END IF;
  
  -- Skill level match (all_levels matches everyone)
  IF v_event.skill_level = 'all_levels' OR v_user.career_level = 'entry' THEN
    v_score := v_score + 10;
  END IF;
  
  -- Content rating appropriateness
  IF v_user.has_children AND v_event.content_rating IN ('all_ages', 'pg') THEN
    v_score := v_score + 10;
  END IF;
  
  RETURN LEAST(v_score, 100);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION calculate_event_match_score(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_event_match_score(uuid, uuid) TO anon;

-- Verify migration
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM information_schema.columns
  WHERE table_name = 'user_profiles'
  AND column_name IN (
    'religion', 'ethnicity', 'interests', 'looking_for',
    'social_style', 'accessibility_needs', 'dietary_restrictions',
    'preferred_days', 'has_children'
  );
  
  IF v_count >= 9 THEN
    RAISE NOTICE 'Migration successful: % new attribute columns added to user_profiles table', v_count;
  ELSE
    RAISE WARNING 'Migration may be incomplete: only % columns found', v_count;
  END IF;
END $$;
