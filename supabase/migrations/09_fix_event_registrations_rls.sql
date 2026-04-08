-- =====================================================
-- 09 - Fix Event Registrations RLS Policies
-- =====================================================
-- This migration adds the missing RLS policies for event_registrations table
-- The table exists but has no policies, causing 400 errors

-- Enable RLS if not already enabled
ALTER TABLE IF EXISTS public.event_registrations ENABLE ROW LEVEL SECURITY;

-- 5.8 Event Registrations RLS policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view their own registrations" ON public.event_registrations;
    CREATE POLICY "Users can view their own registrations"
    ON public.event_registrations
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can insert their own registrations" ON public.event_registrations;
    CREATE POLICY "Users can insert their own registrations"
    ON public.event_registrations
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can delete their own registrations" ON public.event_registrations;
    CREATE POLICY "Users can delete their own registrations"
    ON public.event_registrations
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Event organizers can view all registrations for their events" ON public.event_registrations;
    CREATE POLICY "Event organizers can view all registrations for their events"
    ON public.event_registrations
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.events 
        WHERE events.id = event_registrations.event_id 
        AND events.organizer_id = auth.uid()
    ));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can view all registrations" ON public.event_registrations;
    CREATE POLICY "Admins can view all registrations"
    ON public.event_registrations
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role = 'admin'
        )
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
