-- =====================================================
-- TRUNCATE USER DATA SCRIPT
-- =====================================================
-- This script truncates all user-related tables and their corresponding data
-- Run this to reset all user data while preserving table structure
-- =====================================================

-- IMPORTANT: This will permanently delete all user data!
-- Make sure you have backups before running this script

-- Disable foreign key constraints temporarily
SET session_replication_role = replica;

-- Truncate tables in correct order to respect foreign key constraints
-- Start with dependent tables first

-- 1. Event participants (depends on events and users)
TRUNCATE TABLE public.event_participants CASCADE;

-- 2. Event audit logs (depends on events and users)
TRUNCATE TABLE public.event_audit CASCADE;

-- 3. Events (depends on users as organizers)
TRUNCATE TABLE public.events CASCADE;

-- 4. User preferences (depends on users)
TRUNCATE TABLE public.user_preferences CASCADE;

-- 5. User roles (depends on users)
TRUNCATE TABLE public.user_roles CASCADE;

-- 6. User profiles (depends on auth.users)
TRUNCATE TABLE public.profiles CASCADE;

-- 7. Auth users (this will cascade to all above tables)
-- WARNING: This requires superuser privileges
-- TRUNCATE TABLE auth.users CASCADE;

-- Re-enable foreign key constraints
SET session_replication_role = DEFAULT;

-- Reset sequences to start from 1 again
-- (Note: UUID tables don't need sequence reset)

-- Verify truncation
SELECT 
    'event_participants' as table_name, COUNT(*) as row_count FROM public.event_participants
UNION ALL
SELECT 
    'event_audit' as table_name, COUNT(*) as row_count FROM public.event_audit
UNION ALL
SELECT 
    'events' as table_name, COUNT(*) as row_count FROM public.events
UNION ALL
SELECT 
    'user_preferences' as table_name, COUNT(*) as row_count FROM public.user_preferences
UNION ALL
SELECT 
    'user_roles' as table_name, COUNT(*) as row_count FROM public.user_roles
UNION ALL
SELECT 
    'profiles' as table_name, COUNT(*) as row_count FROM public.profiles;

-- =====================================================
-- NOTES:
-- 1. This script preserves table structure and constraints
-- 2. All foreign key relationships are handled via CASCADE
-- 3. The auth.users table is commented out - requires superuser access
-- 4. To completely reset, you may need to manually delete auth.users
-- 5. Always run this in a transaction for safety:
--    BEGIN;
--    -- run script
--    COMMIT; or ROLLBACK;
-- =====================================================
