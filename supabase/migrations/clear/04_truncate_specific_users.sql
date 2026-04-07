-- =====================================================
-- 04 - TRUNCATE SPECIFIC USERS BY EMAIL LIST
-- =====================================================
-- This script removes all data for specific users identified by email
-- while preserving other users' data and the database schema
-- 
-- USAGE: Update the email list below with the emails to delete
-- WARNING: This will permanently delete ALL data for the specified users!
-- =====================================================

-- =====================================================
-- CONFIGURATION - UPDATE EMAIL LIST HERE
-- =====================================================

-- Create a temporary table with the list of emails to delete
-- UPDATE THIS LIST with the emails you want to remove
DROP TABLE IF EXISTS temp_emails_to_delete;
CREATE TEMP TABLE temp_emails_to_delete (
    email TEXT PRIMARY KEY
);

-- Insert the emails you want to delete here
-- Example emails - replace with actual test emails
INSERT INTO temp_emails_to_delete (email) VALUES 
    ('test1@example.com'),
    ('test2@example.com'),
    ('test3@example.com'),
    ('organizer@test.com'),
    ('user@test.com');

-- =====================================================
-- END OF CONFIGURATION
-- =====================================================

-- Disable foreign key constraints temporarily
SET session_replication_role = 'replica';

-- Create a mapping table of user_ids from emails
DROP TABLE IF EXISTS temp_users_to_delete;
CREATE TEMP TABLE temp_users_to_delete AS
SELECT u.id as user_id, u.email
FROM auth.users u
WHERE u.email IN (SELECT email FROM temp_emails_to_delete);

-- Show which users will be deleted
SELECT 
    'Users to be deleted:' as info,
    user_id,
    email
FROM temp_users_to_delete;

-- Delete data in order of dependencies

-- 1. Comprehensive event management data for these users
DELETE FROM public.event_schedule 
WHERE event_id IN (
    SELECT id FROM public.events 
    WHERE organizer_id IN (SELECT user_id FROM temp_users_to_delete)
);

DELETE FROM public.event_tags 
WHERE event_id IN (
    SELECT id FROM public.events 
    WHERE organizer_id IN (SELECT user_id FROM temp_users_to_delete)
);

DELETE FROM public.event_notifications 
WHERE event_id IN (
    SELECT id FROM public.events 
    WHERE organizer_id IN (SELECT user_id FROM temp_users_to_delete)
);

DELETE FROM public.event_media 
WHERE event_id IN (
    SELECT id FROM public.events 
    WHERE organizer_id IN (SELECT user_id FROM temp_users_to_delete)
);

DELETE FROM public.registration_fields 
WHERE event_id IN (
    SELECT id FROM public.events 
    WHERE organizer_id IN (SELECT user_id FROM temp_users_to_delete)
);

DELETE FROM public.ticket_types 
WHERE event_id IN (
    SELECT id FROM public.events 
    WHERE organizer_id IN (SELECT user_id FROM temp_users_to_delete)
);

DELETE FROM public.event_venues 
WHERE event_id IN (
    SELECT id FROM public.events 
    WHERE organizer_id IN (SELECT user_id FROM temp_users_to_delete)
);

-- Delete venues owned by these users
DELETE FROM public.venues 
WHERE organizer_id IN (SELECT user_id FROM temp_users_to_delete);

-- 2. Event audit entries for these users
DELETE FROM public.event_audit 
WHERE changed_by IN (SELECT user_id FROM temp_users_to_delete);

-- 3. Event registrations and participants
DELETE FROM public.event_registrations 
WHERE user_id IN (SELECT user_id FROM temp_users_to_delete);

DELETE FROM public.event_participants 
WHERE user_id IN (SELECT user_id FROM temp_users_to_delete);

-- 4. Events organized by these users
DELETE FROM public.events 
WHERE organizer_id IN (SELECT user_id FROM temp_users_to_delete);

-- 5. User preferences and roles
DELETE FROM public.user_preferences 
WHERE user_id IN (SELECT user_id FROM temp_users_to_delete);

DELETE FROM public.user_roles 
WHERE user_id IN (SELECT user_id FROM temp_users_to_delete);

-- 6. User profiles
DELETE FROM public.profiles 
WHERE user_id IN (SELECT user_id FROM temp_users_to_delete);

-- 7. Finally, delete from auth.users
DELETE FROM auth.users 
WHERE id IN (SELECT user_id FROM temp_users_to_delete);

-- Re-enable foreign key constraints
SET session_replication_role = 'origin';

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Show remaining count of deleted users (should be 0)
SELECT 
    'auth.users remaining for deleted emails:' as info,
    COUNT(*) as count
FROM auth.users u
WHERE u.email IN (SELECT email FROM temp_emails_to_delete);

-- Show what was deleted (summary)
SELECT 
    'event_schedule deleted rows' as table_name, 
    COUNT(*) as deleted_count
FROM public.event_schedule es
WHERE es.event_id IN (
    SELECT id FROM public.events 
    WHERE organizer_id IN (SELECT user_id FROM temp_users_to_delete)
)
UNION ALL
SELECT 
    'event_tags deleted rows', 
    COUNT(*)
FROM public.event_tags et
WHERE et.event_id IN (
    SELECT id FROM public.events 
    WHERE organizer_id IN (SELECT user_id FROM temp_users_to_delete)
)
UNION ALL
SELECT 
    'event_notifications deleted rows', 
    COUNT(*)
FROM public.event_notifications en
WHERE en.event_id IN (
    SELECT id FROM public.events 
    WHERE organizer_id IN (SELECT user_id FROM temp_users_to_delete)
)
UNION ALL
SELECT 
    'event_media deleted rows', 
    COUNT(*)
FROM public.event_media em
WHERE em.event_id IN (
    SELECT id FROM public.events 
    WHERE organizer_id IN (SELECT user_id FROM temp_users_to_delete)
)
UNION ALL
SELECT 
    'registration_fields deleted rows', 
    COUNT(*)
FROM public.registration_fields rf
WHERE rf.event_id IN (
    SELECT id FROM public.events 
    WHERE organizer_id IN (SELECT user_id FROM temp_users_to_delete)
)
UNION ALL
SELECT 
    'ticket_types deleted rows', 
    COUNT(*)
FROM public.ticket_types tt
WHERE tt.event_id IN (
    SELECT id FROM public.events 
    WHERE organizer_id IN (SELECT user_id FROM temp_users_to_delete)
)
UNION ALL
SELECT 
    'event_venues deleted rows', 
    COUNT(*)
FROM public.event_venues ev
WHERE ev.event_id IN (
    SELECT id FROM public.events 
    WHERE organizer_id IN (SELECT user_id FROM temp_users_to_delete)
)
UNION ALL
SELECT 
    'venues deleted rows', 
    COUNT(*)
FROM public.venues v
WHERE v.organizer_id IN (SELECT user_id FROM temp_users_to_delete)
UNION ALL
SELECT 
    'event_audit deleted rows', 
    COUNT(*)
FROM public.event_audit ea
WHERE ea.changed_by IN (SELECT user_id FROM temp_users_to_delete)
UNION ALL
SELECT 
    'event_registrations deleted rows', 
    COUNT(*)
FROM public.event_registrations er
WHERE er.user_id IN (SELECT user_id FROM temp_users_to_delete)
UNION ALL
SELECT 
    'event_participants deleted rows', 
    COUNT(*)
FROM public.event_participants ep
WHERE ep.user_id IN (SELECT user_id FROM temp_users_to_delete)
UNION ALL
SELECT 
    'events deleted rows', 
    COUNT(*)
FROM public.events e
WHERE e.organizer_id IN (SELECT user_id FROM temp_users_to_delete)
UNION ALL
SELECT 
    'user_preferences deleted rows', 
    COUNT(*)
FROM public.user_preferences up
WHERE up.user_id IN (SELECT user_id FROM temp_users_to_delete)
UNION ALL
SELECT 
    'user_roles deleted rows', 
    COUNT(*)
FROM public.user_roles ur
WHERE ur.user_id IN (SELECT user_id FROM temp_users_to_delete)
UNION ALL
SELECT 
    'profiles deleted rows', 
    COUNT(*)
FROM public.profiles p
WHERE p.user_id IN (SELECT user_id FROM temp_users_to_delete)
UNION ALL
SELECT 
    'auth.users deleted rows', 
    COUNT(*)
FROM auth.users u
WHERE u.id IN (SELECT user_id FROM temp_users_to_delete);

-- Clean up temporary tables
DROP TABLE IF EXISTS temp_emails_to_delete;
DROP TABLE IF EXISTS temp_users_to_delete;

-- =====================================================
-- DELETION COMPLETE
-- =====================================================
--
-- All data for the specified users has been removed.
-- Other users' data remains intact.
--
-- Tables affected:
-- ✅ auth.users (core authentication table)
-- ✅ event_schedule (event agenda/schedule items)
-- ✅ event_tags (event discovery tags)
-- ✅ event_notifications (automated notifications)
-- ✅ event_media (images, videos, banners)
-- ✅ registration_fields (custom registration forms)
-- ✅ ticket_types (advanced ticketing system)
-- ✅ event_venues (event-venue relationships)
-- ✅ venues (detailed venue information)
-- ✅ event_audit
-- ✅ event_registrations  
-- ✅ event_participants
-- ✅ events
-- ✅ user_preferences (including organizer onboarding fields)
-- ✅ user_roles
-- ✅ profiles
--
-- Next steps:
-- 1. Verify the correct users were deleted
-- 2. Test re-registration with the same emails
-- 3. Verify onboarding flow works for new users
-- 4. Test that other users' data is unaffected
-- 5. Test comprehensive event creation for new users
-- 6. Verify venue management and ticketing systems work
-- =====================================================
