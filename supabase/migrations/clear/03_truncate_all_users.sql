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

-- 1. Event-related data (depends on users)
TRUNCATE TABLE public.event_audit CASCADE;
TRUNCATE TABLE public.event_registrations CASCADE;
TRUNCATE TABLE public.event_categories CASCADE;
TRUNCATE TABLE public.event_participants CASCADE;
TRUNCATE TABLE public.events CASCADE;

-- 2. User preferences and roles
TRUNCATE TABLE public.user_preferences CASCADE;
TRUNCATE TABLE public.user_roles CASCADE;

-- 3. User profiles
TRUNCATE TABLE public.profiles CASCADE;

-- 4. Core authentication users table
-- This removes all user accounts from the auth system
TRUNCATE TABLE auth.users CASCADE;

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
    AND relname IN ('users', 'profiles', 'user_roles', 'user_preferences', 'events', 'event_participants', 'event_registrations', 'event_categories', 'event_audit')
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
-- ✅ event_audit
-- ✅ event_registrations  
-- ✅ event_categories
-- ✅ event_participants
-- ✅ events
-- ✅ user_preferences
-- ✅ user_roles
-- ✅ profiles
--
-- Next steps:
-- 1. Test user registration with Google OAuth
-- 2. Verify onboarding flow works correctly
-- 3. Test event creation and participation
-- =====================================================
