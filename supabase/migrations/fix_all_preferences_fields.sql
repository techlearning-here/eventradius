-- Complete fix for user_preferences table
-- This ensures all required fields exist with proper defaults

-- First, let's see what we're working with
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_preferences' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add is_organizer if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND table_schema = 'public' 
        AND column_name = 'is_organizer'
    ) THEN
        RAISE NOTICE 'is_organizer column already exists';
    ELSE
        ALTER TABLE public.user_preferences 
        ADD COLUMN is_organizer BOOLEAN DEFAULT false;
        RAISE NOTICE 'is_organizer column added';
    END IF;
    
    -- Update existing NULL values
    UPDATE public.user_preferences 
    SET is_organizer = false 
    WHERE is_organizer IS NULL;
    
    RAISE NOTICE 'Updated % user preferences with is_organizer = false', 
        (SELECT COUNT(*) FROM public.user_preferences WHERE is_organizer IS NULL);
END $$;

-- Verify the fix
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_preferences' 
    AND table_schema = 'public'
    AND column_name = 'is_organizer';
