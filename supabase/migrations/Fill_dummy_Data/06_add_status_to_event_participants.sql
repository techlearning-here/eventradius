-- =====================================================
-- 06 - ADD STATUS COLUMN TO EVENT_PARTICIPANTS TABLE
-- =====================================================
-- This migration adds the missing 'status' column to event_participants table
-- to support different participation states (interested, going, not_going)
-- =====================================================

-- Start transaction
BEGIN;

-- Add status column to event_participants table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'event_participants' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.event_participants 
        ADD COLUMN status TEXT NOT NULL DEFAULT 'going';
    END IF;
END $$;

-- Add check constraint for valid status values if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints cc
        JOIN information_schema.constraint_column_usage ccu ON cc.constraint_name = ccu.constraint_name
        WHERE ccu.table_name = 'event_participants' 
        AND ccu.column_name = 'status'
        AND cc.constraint_name = 'event_participants_status_check'
    ) THEN
        ALTER TABLE public.event_participants 
        ADD CONSTRAINT event_participants_status_check 
        CHECK (status IN ('interested', 'going', 'not_going'));
    END IF;
END $$;

-- Create index on status column for better query performance
CREATE INDEX IF NOT EXISTS idx_event_participants_status 
ON public.event_participants(status);

-- Update existing records to have 'going' as default status
UPDATE public.event_participants 
SET status = 'going' 
WHERE status IS NULL;

-- Commit transaction
COMMIT;

-- =====================================================
-- VERIFICATION QUERIES (for manual checking)
-- =====================================================

-- Verify column was added successfully
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'event_participants' AND column_name = 'status';

-- Verify constraint was added
-- SELECT constraint_name, check_clause
-- FROM information_schema.check_constraints cc
-- JOIN information_schema.constraint_column_usage ccu ON cc.constraint_name = ccu.constraint_name
-- WHERE ccu.table_name = 'event_participants' AND ccu.column_name = 'status';

-- Check sample data with status
-- SELECT event_id, user_id, status, registered_at
-- FROM public.event_participants 
-- LIMIT 5;

-- Count records by status
-- SELECT status, COUNT(*) as count
-- FROM public.event_participants 
-- GROUP BY status;
