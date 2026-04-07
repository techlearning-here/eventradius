-- Migration: Add soft delete (recycle bin) support to events table
-- Created: April 2026
-- Description: Adds deleted_at column and updates RLS policies for soft delete functionality

-- 1. Add deleted_at column to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 2. Create index for efficient querying of deleted/non-deleted events
CREATE INDEX IF NOT EXISTS idx_events_deleted_at ON public.events(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_events_deleted_at_only ON public.events(deleted_at) WHERE deleted_at IS NOT NULL;

-- 3. Update RLS policy to exclude deleted events from default queries
-- First, drop and recreate the "Events are viewable by everyone" policy to exclude deleted events
DO $$ BEGIN
    DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
    
    -- Create new policy that excludes deleted events
    CREATE POLICY "Events are viewable by everyone"
    ON public.events
    FOR SELECT
    USING (deleted_at IS NULL);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Create policy for organizers to view their own deleted events (for recycle bin)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Organizers can view their deleted events" ON public.events;
    
    CREATE POLICY "Organizers can view their deleted events"
    ON public.events
    FOR SELECT
    TO authenticated
    USING (auth.uid() = organizer_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. Create function to soft delete events (set deleted_at instead of hard delete)
CREATE OR REPLACE FUNCTION public.soft_delete_event(event_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    event_organizer_id UUID;
BEGIN
    -- Get the organizer_id of the event
    SELECT organizer_id INTO event_organizer_id
    FROM public.events
    WHERE id = event_id;
    
    -- Check if event exists and user is the organizer
    IF event_organizer_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    IF event_organizer_id != user_id THEN
        RETURN FALSE;
    END IF;
    
    -- Soft delete: set deleted_at timestamp
    UPDATE public.events
    SET deleted_at = NOW(),
        updated_at = NOW()
    WHERE id = event_id;
    
    RETURN TRUE;
END;
$$;

-- 6. Create function to restore soft-deleted events
CREATE OR REPLACE FUNCTION public.restore_event(event_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    event_organizer_id UUID;
BEGIN
    -- Get the organizer_id of the event
    SELECT organizer_id INTO event_organizer_id
    FROM public.events
    WHERE id = event_id AND deleted_at IS NOT NULL;
    
    -- Check if deleted event exists and user is the organizer
    IF event_organizer_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    IF event_organizer_id != user_id THEN
        RETURN FALSE;
    END IF;
    
    -- Restore: clear deleted_at timestamp
    UPDATE public.events
    SET deleted_at = NULL,
        updated_at = NOW()
    WHERE id = event_id;
    
    RETURN TRUE;
END;
$$;

-- 7. Create function to permanently delete events (for recycle bin cleanup)
CREATE OR REPLACE FUNCTION public.permanently_delete_event(event_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    event_organizer_id UUID;
BEGIN
    -- Get the organizer_id of the event
    SELECT organizer_id INTO event_organizer_id
    FROM public.events
    WHERE id = event_id AND deleted_at IS NOT NULL;
    
    -- Check if deleted event exists and user is the organizer
    IF event_organizer_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    IF event_organizer_id != user_id THEN
        RETURN FALSE;
    END IF;
    
    -- Hard delete the event (only if it's already soft deleted)
    DELETE FROM public.events
    WHERE id = event_id AND deleted_at IS NOT NULL;
    
    RETURN TRUE;
END;
$$;

-- 8. Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.soft_delete_event(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_event(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.permanently_delete_event(UUID, UUID) TO authenticated;

-- 9. Comment on column for documentation
COMMENT ON COLUMN public.events.deleted_at IS 'Timestamp when event was soft deleted (moved to recycle bin). NULL means event is active.';
