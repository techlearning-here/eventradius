-- =====================================================
-- DROP ALL EVENTRADIUS DATABASE OBJECTS
-- =====================================================
-- This script will drop all tables, types, and objects created by EventRadius
-- WARNING: This will permanently delete all data!
-- =====================================================

-- =====================================================
-- 1. DROP TABLES (in reverse order of creation to handle dependencies)
-- =====================================================

-- Drop event-related tables first (due to foreign key dependencies)
DO $$
BEGIN
    -- Drop tables with foreign key dependencies first
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_registrations') THEN
        DROP TABLE public.event_registrations CASCADE;
        RAISE NOTICE 'Dropped table: event_registrations';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_categories') THEN
        DROP TABLE public.event_categories CASCADE;
        RAISE NOTICE 'Dropped table: event_categories';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_participants') THEN
        DROP TABLE public.event_participants CASCADE;
        RAISE NOTICE 'Dropped table: event_participants';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_tags') THEN
        DROP TABLE public.event_tags CASCADE;
        RAISE NOTICE 'Dropped table: event_tags';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_media') THEN
        DROP TABLE public.event_media CASCADE;
        RAISE NOTICE 'Dropped table: event_media';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_schedule') THEN
        DROP TABLE public.event_schedule CASCADE;
        RAISE NOTICE 'Dropped table: event_schedule';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_notifications') THEN
        DROP TABLE public.event_notifications CASCADE;
        RAISE NOTICE 'Dropped table: event_notifications';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_venues') THEN
        DROP TABLE public.event_venues CASCADE;
        RAISE NOTICE 'Dropped table: event_venues';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'registration_fields') THEN
        DROP TABLE public.registration_fields CASCADE;
        RAISE NOTICE 'Dropped table: registration_fields';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ticket_types') THEN
        DROP TABLE public.ticket_types CASCADE;
        RAISE NOTICE 'Dropped table: ticket_types';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_audit') THEN
        DROP TABLE public.event_audit CASCADE;
        RAISE NOTICE 'Dropped table: event_audit';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'venues') THEN
        DROP TABLE public.venues CASCADE;
        RAISE NOTICE 'Dropped table: venues';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
        DROP TABLE public.events CASCADE;
        RAISE NOTICE 'Dropped table: events';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_preferences') THEN
        DROP TABLE public.user_preferences CASCADE;
        RAISE NOTICE 'Dropped table: user_preferences';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
        DROP TABLE public.user_roles CASCADE;
        RAISE NOTICE 'Dropped table: user_roles';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        DROP TABLE public.profiles CASCADE;
        RAISE NOTICE 'Dropped table: profiles';
    END IF;
END $$;

-- =====================================================
-- 2. DROP VIEWS
-- =====================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'events_with_participants') THEN
        DROP VIEW public.events_with_participants CASCADE;
        RAISE NOTICE 'Dropped view: events_with_participants';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'user_events_view') THEN
        DROP VIEW public.user_events_view CASCADE;
        RAISE NOTICE 'Dropped view: user_events_view';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'events_enhanced_view') THEN
        DROP VIEW public.events_enhanced_view CASCADE;
        RAISE NOTICE 'Dropped view: events_enhanced_view';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'deleted_events_with_countdown') THEN
        DROP VIEW public.deleted_events_with_countdown CASCADE;
        RAISE NOTICE 'Dropped view: deleted_events_with_countdown';
    END IF;
END $$;

-- =====================================================
-- 3. DROP TYPES
-- =====================================================

-- Drop custom enum types
DROP TYPE IF EXISTS public.app_role CASCADE;

-- =====================================================
-- 4. DROP FUNCTIONS AND TRIGGERS
-- =====================================================

-- Drop any custom functions with existence checking
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'handle_new_user') THEN
        DROP FUNCTION public.handle_new_user() CASCADE;
        RAISE NOTICE 'Dropped function: handle_new_user';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'update_updated_at_column') THEN
        DROP FUNCTION public.update_updated_at_column() CASCADE;
        RAISE NOTICE 'Dropped function: update_updated_at_column';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'update_participant_count') THEN
        DROP FUNCTION public.update_participant_count() CASCADE;
        RAISE NOTICE 'Dropped function: update_participant_count';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'validate_event_data') THEN
        DROP FUNCTION public.validate_event_data() CASCADE;
        RAISE NOTICE 'Dropped function: validate_event_data';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'validate_event_data_enhanced') THEN
        DROP FUNCTION public.validate_event_data_enhanced() CASCADE;
        RAISE NOTICE 'Dropped function: validate_event_data_enhanced';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'validate_ticket_data') THEN
        DROP FUNCTION public.validate_ticket_data() CASCADE;
        RAISE NOTICE 'Dropped function: validate_ticket_data';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'update_event_status') THEN
        DROP FUNCTION public.update_event_status() CASCADE;
        RAISE NOTICE 'Dropped function: update_event_status';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'log_event_changes') THEN
        DROP FUNCTION public.log_event_changes() CASCADE;
        RAISE NOTICE 'Dropped function: log_event_changes';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'cleanup_expired_deleted_events') THEN
        DROP FUNCTION public.cleanup_expired_deleted_events() CASCADE;
        RAISE NOTICE 'Dropped function: cleanup_expired_deleted_events';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'permanently_delete_event') THEN
        DROP FUNCTION public.permanently_delete_event(UUID, UUID) CASCADE;
        RAISE NOTICE 'Dropped function: permanently_delete_event';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'restore_deleted_event') THEN
        DROP FUNCTION public.restore_deleted_event(UUID) CASCADE;
        RAISE NOTICE 'Dropped function: restore_deleted_event';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'get_days_until_deletion') THEN
        DROP FUNCTION public.get_days_until_deletion(TIMESTAMP WITH TIME ZONE) CASCADE;
        RAISE NOTICE 'Dropped function: get_days_until_deletion';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'assign_default_role') THEN
        DROP FUNCTION public.assign_default_role() CASCADE;
        RAISE NOTICE 'Dropped function: assign_default_role';
    END IF;
END $$;

-- =====================================================
-- 5. DROP RLS POLICIES
-- =====================================================

-- Drop Row Level Security policies with existence checking
DO $$
BEGIN
    -- Drop policies for profiles table
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile') THEN
        DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
        RAISE NOTICE 'Dropped policy: Users can view own profile';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile') THEN
        DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
        RAISE NOTICE 'Dropped policy: Users can update own profile';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile') THEN
        DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
        RAISE NOTICE 'Dropped policy: Users can insert their own profile';
    END IF;
    
    -- Drop policies for events table
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Enable read access for all users') THEN
        DROP POLICY IF EXISTS "Enable read access for all users" ON public.events;
        RAISE NOTICE 'Dropped policy: Enable read access for all users';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Enable insert for authenticated users') THEN
        DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.events;
        RAISE NOTICE 'Dropped policy: Enable insert for authenticated users';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Enable update for organizers') THEN
        DROP POLICY IF EXISTS "Enable update for organizers" ON public.events;
        RAISE NOTICE 'Dropped policy: Enable update for organizers';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Enable delete for organizers') THEN
        DROP POLICY IF EXISTS "Enable delete for organizers" ON public.events;
        RAISE NOTICE 'Dropped policy: Enable delete for organizers';
    END IF;
    
    -- Drop policies for event_registrations table
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_registrations' AND policyname = 'Enable read access for all users') THEN
        DROP POLICY IF EXISTS "Enable read access for all users" ON public.event_registrations;
        RAISE NOTICE 'Dropped policy: Enable read access for all users';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_registrations' AND policyname = 'Enable insert for authenticated users') THEN
        DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.event_registrations;
        RAISE NOTICE 'Dropped policy: Enable insert for authenticated users';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_registrations' AND policyname = 'Enable update for users') THEN
        DROP POLICY IF EXISTS "Enable update for users" ON public.event_registrations;
        RAISE NOTICE 'Dropped policy: Enable update for users';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_registrations' AND policyname = 'Enable delete for users') THEN
        DROP POLICY IF EXISTS "Enable delete for users" ON public.event_registrations;
        RAISE NOTICE 'Dropped policy: Enable delete for users';
    END IF;
END $$;

-- =====================================================
-- 6. RESET SEQUENCES
-- =====================================================

-- Reset any sequences (if using auto-increment IDs)
-- (Note: UUIDs don't use sequences, but keeping for completeness)

-- =====================================================
-- 7. COMPLETION MESSAGE
-- =====================================================

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'All EventRadius database objects dropped!';
    RAISE NOTICE '========================================';
END $$;
