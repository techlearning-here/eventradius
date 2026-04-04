-- =====================================================
-- 02 - ADD MISSING PHONE COLUMNS TO PROFILES TABLE
-- =====================================================
-- This script adds the missing phone-related columns to the profiles table
-- Run this if you're getting "column does not exist" errors
-- =====================================================

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add phone_country_code column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'phone_country_code'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN phone_country_code TEXT;
        RAISE NOTICE 'Added phone_country_code column';
    END IF;

    -- Add phone_verified column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'phone_verified'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added phone_verified column';
    END IF;

    -- Add email_verified column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'email_verified'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added email_verified column';
    END IF;

    -- Add organizer_status column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'organizer_status'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN organizer_status TEXT DEFAULT 'pending';
        RAISE NOTICE 'Added organizer_status column';
    END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_phone_verified ON public.profiles(phone_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON public.profiles(email_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_organizer_status ON public.profiles(organizer_status);

-- Add comments
COMMENT ON COLUMN public.profiles.phone_country_code IS 'Phone number country code';
COMMENT ON COLUMN public.profiles.phone_verified IS 'Whether phone number has been verified';
COMMENT ON COLUMN public.profiles.email_verified IS 'Whether email address has been verified';
COMMENT ON COLUMN public.profiles.organizer_status IS 'Organizer verification status (pending, verified, active, suspended)';

-- Verify columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('phone_country_code', 'phone_verified', 'email_verified', 'organizer_status')
ORDER BY column_name;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
