-- Migration: Add automatic 30-day cleanup for soft-deleted events
-- Created: April 2026
-- Description: Automatically permanently deletes events that have been in recycle bin for 30+ days

-- 1. Create function to permanently delete old soft-deleted events
CREATE OR REPLACE FUNCTION public.cleanup_old_deleted_events()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Permanently delete events that have been soft-deleted for more than 30 days
    DELETE FROM public.events
    WHERE deleted_at IS NOT NULL
      AND deleted_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup action
    IF deleted_count > 0 THEN
        INSERT INTO public.event_audit (event_id, action, old_data, changed_by, changed_at)
        VALUES (
            gen_random_uuid(),
            'CLEANUP_OLD_DELETED',
            jsonb_build_object('deleted_count', deleted_count, 'cutoff_days', 30),
            auth.uid(),
            NOW()
        );
    END IF;
    
    RETURN deleted_count;
END;
$$;

-- 2. Create function to get days remaining until permanent deletion
CREATE OR REPLACE FUNCTION public.get_days_until_deletion(event_deleted_at TIMESTAMP WITH TIME ZONE)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    days_remaining INTEGER;
BEGIN
    IF event_deleted_at IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Calculate days remaining (30 days total - days since deletion)
    days_remaining := 30 - EXTRACT(DAY FROM (NOW() - event_deleted_at));
    
    -- Return 0 if already past 30 days
    RETURN GREATEST(days_remaining, 0);
END;
$$;

-- 3. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.cleanup_old_deleted_events() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_days_until_deletion(TIMESTAMP WITH TIME ZONE) TO authenticated;

-- 4. Comment on functions
COMMENT ON FUNCTION public.cleanup_old_deleted_events() IS 'Permanently deletes events that have been soft-deleted for more than 30 days';
COMMENT ON FUNCTION public.get_days_until_deletion(TIMESTAMP WITH TIME ZONE) IS 'Returns the number of days remaining until a soft-deleted event is permanently deleted (max 30 days)';

-- 5. Create pg_cron job to run cleanup daily (if pg_cron extension is available)
-- Note: This requires the pg_cron extension to be enabled in Supabase
-- If pg_cron is not available, the cleanup can be triggered manually or via an external scheduler
DO $$
BEGIN
    -- Try to create the cron job, but don't fail if pg_cron is not available
    BEGIN
        -- Schedule cleanup to run daily at 3 AM UTC
        PERFORM cron.schedule(
            'cleanup-old-deleted-events',  -- job name
            '0 3 * * *',                   -- cron expression (daily at 3 AM UTC)
            'SELECT public.cleanup_old_deleted_events()'  -- SQL to execute
        );
        
        RAISE NOTICE 'pg_cron job created successfully';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'pg_cron not available or error creating job. Manual cleanup or external scheduler required. Error: %', SQLERRM;
    END;
END $$;

-- 6. Alternative: Create a trigger to run cleanup when events are accessed
-- This ensures cleanup runs periodically even without pg_cron
CREATE OR REPLACE FUNCTION public.trigger_cleanup_on_event_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Run cleanup occasionally (1% chance) when events table is accessed
    -- This is a fallback mechanism when pg_cron is not available
    IF random() < 0.01 THEN
        PERFORM public.cleanup_old_deleted_events();
    END IF;
    
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS cleanup_on_event_access ON public.events;

-- Create trigger (uncomment if you want to use this fallback mechanism)
-- CREATE TRIGGER cleanup_on_event_access
--     BEFORE INSERT OR UPDATE ON public.events
--     FOR EACH STATEMENT
--     EXECUTE FUNCTION public.trigger_cleanup_on_event_access();

-- 7. Add comments explaining the 30-day retention policy
COMMENT ON TABLE public.events IS 'Events table with soft delete (recycle bin) and 30-day automatic permanent deletion';

-- 8. Create a view to show events with days until deletion
CREATE OR REPLACE VIEW public.deleted_events_with_countdown AS
SELECT 
    e.*,
    public.get_days_until_deletion(e.deleted_at) as days_until_deletion,
    e.deleted_at + INTERVAL '30 days' as permanent_deletion_date
FROM public.events e
WHERE e.deleted_at IS NOT NULL;

-- Grant permissions on view
GRANT SELECT ON public.deleted_events_with_countdown TO authenticated;
