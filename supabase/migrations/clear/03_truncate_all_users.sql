-- =====================================================
-- 03 - TRUNCATE ALL USER DATA FOR FRESH TESTING
-- =====================================================
-- This script truncates all user-related tables to allow fresh testing
-- while preserving the database schema and structure
-- 
-- WARNING: This will permanently delete ALL user data!
-- Including auth.users table and all related user data!
-- =====================================================

-- Disable foreign key constraints temporarily
SET session_replication_role = 'replica';

-- Truncate user-related tables in order of dependencies
DO $$
DECLARE
    tbl_name TEXT;
    tables TEXT[] := ARRAY[
        -- 1. Comprehensive event management data (depends on users and events)
        'public.event_schedule',
        'public.event_tags',
        'public.event_notifications',
        'public.event_media',
        'public.registration_fields',
        'public.ticket_types',
        'public.event_venues',
        'public.venues',
        -- 2. Core event data (depends on users)
        'public.event_audit',
        'public.event_registrations',
        'public.event_categories',
        'public.event_participants',
        'public.events',
        -- 3. User preferences and roles
        'public.user_preferences',
        'public.user_roles',
        -- 4. User profiles
        'public.profiles',
        -- 5. Core authentication users table
        'auth.users'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY tables
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = split_part(tbl_name, '.', 1)
            AND table_name = split_part(tbl_name, '.', 2)
        ) THEN
            EXECUTE 'TRUNCATE TABLE ' || tbl_name || ' CASCADE';
        END IF;
    END LOOP;
END $$;

-- Re-enable foreign key constraints
SET session_replication_role = 'origin';

-- Reset sequences if any (for auto-incrementing IDs)
-- Note: Most tables use UUIDs, but this is for completeness
DO $$
DECLARE
    table_name TEXT;
    seq_name TEXT;
BEGIN
    FOR table_name IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE '%_seq'
    LOOP
        EXECUTE 'ALTER SEQUENCE ' || table_name || ' RESTART WITH 1';
    END LOOP;
END $$;

-- Verify truncation by showing table counts
SELECT 
    schemaname,
    relname as tablename,
    seq_scan as total_scans,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables 
WHERE schemaname IN ('public', 'auth') 
    AND relname IN ('users', 'profiles', 'user_roles', 'user_preferences', 'venues', 'events', 'event_participants', 'event_registrations', 'event_categories', 'event_audit', 'event_venues', 'ticket_types', 'registration_fields', 'event_media', 'event_notifications', 'event_tags', 'event_schedule')
ORDER BY schemaname, relname;

-- Show that tables are empty
SELECT 
    'auth.users' as table_name, COUNT(*) as row_count FROM auth.users
UNION ALL
SELECT 
    'profiles' as table_name, COUNT(*) as row_count FROM public.profiles
UNION ALL
SELECT 
    'user_roles' as table_name, COUNT(*) as row_count FROM public.user_roles
UNION ALL
SELECT 
    'user_preferences' as table_name, COUNT(*) as row_count FROM public.user_preferences
UNION ALL
SELECT 
    'venues' as table_name, COUNT(*) as row_count FROM public.venues
UNION ALL
SELECT 
    'events' as table_name, COUNT(*) as row_count FROM public.events
UNION ALL
SELECT 
    'event_participants' as table_name, COUNT(*) as row_count FROM public.event_participants
UNION ALL
SELECT 
    'event_registrations' as table_name, COUNT(*) as row_count FROM public.event_registrations
UNION ALL
SELECT 
    'event_categories' as table_name, COUNT(*) as row_count FROM public.event_categories
UNION ALL
SELECT 
    'event_audit' as table_name, COUNT(*) as row_count FROM public.event_audit
UNION ALL
SELECT 
    'event_venues' as table_name, COUNT(*) as row_count FROM public.event_venues
UNION ALL
SELECT 
    'ticket_types' as table_name, COUNT(*) as row_count FROM public.ticket_types
UNION ALL
SELECT 
    'registration_fields' as table_name, COUNT(*) as row_count FROM public.registration_fields
UNION ALL
SELECT 
    'event_media' as table_name, COUNT(*) as row_count FROM public.event_media
UNION ALL
SELECT 
    'event_notifications' as table_name, COUNT(*) as row_count FROM public.event_notifications
UNION ALL
SELECT 
    'event_tags' as table_name, COUNT(*) as row_count FROM public.event_tags
UNION ALL
SELECT 
    'event_schedule' as table_name, COUNT(*) as row_count FROM public.event_schedule
ORDER BY table_name;

-- =====================================================
-- TRUNCATION COMPLETE
-- =====================================================
--
-- All user data has been removed. The database schema is preserved.
-- You can now test fresh user registration and onboarding flows.
--
-- Tables truncated:
-- ✅ auth.users (core authentication table)
-- ✅ event_schedule
-- ✅ event_tags
-- ✅ event_notifications
-- ✅ event_media
-- ✅ registration_fields
-- ✅ ticket_types
-- ✅ event_venues
-- ✅ venues
-- ✅ event_audit
-- ✅ event_registrations  
-- ✅ event_categories
-- ✅ event_participants
-- ✅ events
-- ✅ user_preferences (including organizer onboarding fields)
-- ✅ user_roles
-- ✅ profiles
--
-- Next steps:
-- 1. Test user registration with Google OAuth
-- 2. Verify onboarding flow works correctly
-- 3. Test organizer onboarding and business information
-- 4. Test comprehensive event creation with venues, tickets, media
-- 5. Test event notifications and scheduling
-- =====================================================
