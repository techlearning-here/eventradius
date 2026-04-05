-- =====================================================
-- Add Organizer Onboarding Fields to User Preferences
-- =====================================================

-- Add organizer-specific fields to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS organizer_onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS business_description TEXT,
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS business_city TEXT,
ADD COLUMN IF NOT EXISTS business_state_province TEXT,
ADD COLUMN IF NOT EXISTS business_zip_pin TEXT,
ADD COLUMN IF NOT EXISTS business_country TEXT,
ADD COLUMN IF NOT EXISTS event_types TEXT[] DEFAULT '{}';

-- Add comments for documentation
COMMENT ON COLUMN public.user_preferences.organizer_onboarding_completed IS 'Tracks if user has completed organizer-specific onboarding';
COMMENT ON COLUMN public.user_preferences.business_name IS 'Organizer business or organization name';
COMMENT ON COLUMN public.user_preferences.business_type IS 'Type of business (individual, nonprofit, business, educational, government, other)';
COMMENT ON COLUMN public.user_preferences.business_description IS 'Description of organizer business';
COMMENT ON COLUMN public.user_preferences.business_address IS 'Street address where organizer hosts events';
COMMENT ON COLUMN public.user_preferences.business_city IS 'City where organizer is located';
COMMENT ON COLUMN public.user_preferences.business_state_province IS 'State or province where organizer is located';
COMMENT ON COLUMN public.user_preferences.business_zip_pin IS 'ZIP or PIN code of organizer location';
COMMENT ON COLUMN public.user_preferences.business_country IS 'Country where organizer is located';
COMMENT ON COLUMN public.user_preferences.event_types IS 'Array of event categories organizer plans to create';

-- Update updated_at timestamp
UPDATE public.user_preferences SET updated_at = now() WHERE 1=1;
