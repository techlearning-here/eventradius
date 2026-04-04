-- Update existing user preferences to include is_organizer field
-- This sets default values for existing records that don't have is_organizer

UPDATE public.user_preferences 
SET is_organizer = false 
WHERE is_organizer IS NULL;

-- Verify the update
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN is_organizer IS NOT NULL THEN 1 END) as records_with_is_organizer,
    COUNT(CASE WHEN is_organizer = true THEN 1 END) as organizers,
    COUNT(CASE WHEN is_organizer = false THEN 1 END) as non_organizers
FROM public.user_preferences;
