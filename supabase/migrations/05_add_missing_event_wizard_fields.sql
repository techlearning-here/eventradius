-- =====================================================
-- 05 - ADD MISSING EVENT WIZARD FIELDS TO EVENTS TABLE
-- =====================================================
-- This migration adds missing structured venue fields from EventWizard to the events table
-- to ensure that database schema matches the frontend interface
-- =====================================================

-- Add missing structured venue fields to events table
DO $$
BEGIN
    -- Add venue_street field
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'venue_street'
    ) THEN
        RAISE NOTICE 'venue_street column already exists';
    ELSE
        ALTER TABLE public.events ADD COLUMN venue_street TEXT;
        RAISE NOTICE 'Added venue_street column to events table';
    END IF;

    -- Add venue_city field
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'venue_city'
    ) THEN
        RAISE NOTICE 'venue_city column already exists';
    ELSE
        ALTER TABLE public.events ADD COLUMN venue_city TEXT;
        RAISE NOTICE 'Added venue_city column to events table';
    END IF;

    -- Add venue_state field
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'venue_state'
    ) THEN
        RAISE NOTICE 'venue_state column already exists';
    ELSE
        ALTER TABLE public.events ADD COLUMN venue_state TEXT;
        RAISE NOTICE 'Added venue_state column to events table';
    END IF;

    -- Add venue_zip_code field
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'venue_zip_code'
    ) THEN
        RAISE NOTICE 'venue_zip_code column already exists';
    ELSE
        ALTER TABLE public.events ADD COLUMN venue_zip_code TEXT;
        RAISE NOTICE 'Added venue_zip_code column to events table';
    END IF;

    -- Add venue_country field
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'venue_country'
    ) THEN
        RAISE NOTICE 'venue_country column already exists';
    ELSE
        ALTER TABLE public.events ADD COLUMN venue_country TEXT;
        RAISE NOTICE 'Added venue_country column to events table';
    END IF;

    -- Add venue_building_name field
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'venue_building_name'
    ) THEN
        RAISE NOTICE 'venue_building_name column already exists';
    ELSE
        ALTER TABLE public.events ADD COLUMN venue_building_name TEXT;
        RAISE NOTICE 'Added venue_building_name column to events table';
    END IF;

    -- Add is_virtual field
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'is_virtual'
    ) THEN
        RAISE NOTICE 'is_virtual column already exists';
    ELSE
        ALTER TABLE public.events ADD COLUMN is_virtual BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_virtual column to events table';
    END IF;

    -- Add is_paid_event field
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'is_paid_event'
    ) THEN
        RAISE NOTICE 'is_paid_event column already exists';
    ELSE
        ALTER TABLE public.events ADD COLUMN is_paid_event BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_paid_event column to events table';
    END IF;

END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify all structured venue fields were added successfully
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'events' 
    AND column_name IN (
        'venue_street', 'venue_city', 'venue_state', 'venue_zip_code', 
        'venue_country', 'venue_building_name', 'is_virtual', 'is_paid_event'
)
ORDER BY column_name;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'EventWizard structured venue fields migration completed successfully!';
    RAISE NOTICE 'Added missing venue fields to events table';
    RAISE NOTICE 'Events table now fully matches EventWizard interface';
END $$;
