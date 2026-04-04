-- Add missing is_organizer column to user_preferences table
-- Migration to fix onboarding error

ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS is_organizer BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.user_preferences.is_organizer IS 'Whether the user is an event organizer (set during onboarding)';
