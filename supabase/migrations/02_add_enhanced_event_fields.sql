-- Add enhanced event schema fields (only missing ones)
-- Migration: Add missing rich event features to match dummy event schema

-- Add columns that don't already exist in events table
DO $$
BEGIN
    -- Check and add background_image_url if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'background_image_url'
    ) THEN
        ALTER TABLE events ADD COLUMN background_image_url TEXT;
    END IF;
    
    -- Check and add organizer_phone if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'organizer_phone'
    ) THEN
        ALTER TABLE events ADD COLUMN organizer_phone TEXT;
    END IF;
    
    -- Check and add organizer_website if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'organizer_website'
    ) THEN
        ALTER TABLE events ADD COLUMN organizer_website TEXT;
    END IF;
    
    -- Add event_status column if it doesn't exist (use status column as fallback)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'event_status'
    ) THEN
        ALTER TABLE events ADD COLUMN event_status TEXT DEFAULT 'published';
        
        -- Add constraint for new event_status column
        ALTER TABLE events ADD CONSTRAINT events_event_status_check 
        CHECK (event_status IN ('draft', 'published', 'cancelled', 'pending'));
    ELSE
        -- If column exists, add constraint if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.check_constraints 
            WHERE constraint_name = 'events_event_status_check'
        ) THEN
            ALTER TABLE events ADD CONSTRAINT events_event_status_check 
            CHECK (event_status IN ('draft', 'published', 'cancelled', 'pending'));
        END IF;
    END IF;
    
    -- Update event_type enum to include recurring and multi_date if needed
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'event_type') AND enumlabel = 'recurring'
    ) THEN
        ALTER TYPE event_type ADD VALUE 'recurring';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'event_type') AND enumlabel = 'multi_date'
    ) THEN
        ALTER TYPE event_type ADD VALUE 'multi_date';
    END IF;
END $$;

-- Add indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_events_background_image_url ON events(background_image_url);
CREATE INDEX IF NOT EXISTS idx_events_organizer_phone ON events(organizer_phone);
CREATE INDEX IF NOT EXISTS idx_events_organizer_website ON events(organizer_website);

-- Add comments for documentation
COMMENT ON COLUMN events.background_image_url IS 'Background image for event detail pages';
COMMENT ON COLUMN events.organizer_phone IS 'Organizer contact phone';
COMMENT ON COLUMN events.organizer_website IS 'Organizer website URL';

-- Update existing events to have default values for new fields
UPDATE events SET 
    background_image_url = image_url,
    organizer_phone = COALESCE(split_part(event_contact_email, '@', 1) || '-phone', '555-0000'),
    organizer_website = COALESCE(event_website, 'https://example.com')
WHERE background_image_url IS NULL 
   OR organizer_phone IS NULL 
   OR organizer_website IS NULL;

-- Create a view or update logic to map existing fields to expected interface
-- Note: event_contact_email maps to organizer_email in our interface
-- ticket_pricing_description already exists
-- ticketing_website already exists  
-- event_status already exists
-- timezone already exists
-- is_paid_event already exists
