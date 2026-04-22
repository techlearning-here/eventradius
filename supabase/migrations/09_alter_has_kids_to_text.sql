-- Migration: Alter has_kids column from BOOLEAN to TEXT to support more inclusive options
-- Options: 'yes', 'no', 'prefer_not_to_say', or NULL

-- Alter the column type from BOOLEAN to TEXT
ALTER TABLE public.user_preferences 
  ALTER COLUMN has_kids TYPE TEXT 
  USING CASE 
    WHEN has_kids = true THEN 'yes'
    ELSE NULL
  END;

-- Remove the default constraint (previously was boolean DEFAULT false)
ALTER TABLE public.user_preferences 
  ALTER COLUMN has_kids DROP DEFAULT;

-- Add comment to explain valid values
COMMENT ON COLUMN public.user_preferences.has_kids IS 'User response to "Do you have kids?": yes, no, prefer_not_to_say, or NULL if not answered';
