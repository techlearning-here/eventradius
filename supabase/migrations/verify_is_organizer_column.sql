-- Verify the is_organizer column exists and has correct properties
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'user_preferences' 
    AND table_schema = 'public'
    AND column_name = 'is_organizer';

-- Show all columns in user_preferences table for comparison
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_preferences' 
    AND table_schema = 'public'
ORDER BY ordinal_position;
