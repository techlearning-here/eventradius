-- SQL Script to truncate all event-related tables
-- WARNING: This will permanently delete all event data!
-- Run with caution - this cannot be undone
-- 
-- This script clears all event data while preserving user accounts
-- For complete reset including users, use 03_truncate_all_users.sql instead

-- =====================================================
-- 1. TRUNCATE EVENT MANAGEMENT TABLES (no user dependencies)
-- =====================================================
TRUNCATE TABLE IF EXISTS public.event_schedule CASCADE;
TRUNCATE TABLE IF EXISTS public.event_tags CASCADE;
TRUNCATE TABLE IF EXISTS public.event_notifications CASCADE;
TRUNCATE TABLE IF EXISTS public.event_media CASCADE;
TRUNCATE TABLE IF EXISTS public.registration_fields CASCADE;
TRUNCATE TABLE IF EXISTS public.ticket_types CASCADE;
TRUNCATE TABLE IF EXISTS public.event_venues CASCADE;
TRUNCATE TABLE IF EXISTS public.event_audit CASCADE;

-- =====================================================
-- 2. TRUNCATE EVENT RELATIONSHIPS (depends on events)
-- =====================================================
TRUNCATE TABLE IF EXISTS public.event_registrations CASCADE;
TRUNCATE TABLE IF EXISTS public.event_categories CASCADE;
TRUNCATE TABLE IF EXISTS public.event_participants CASCADE;

-- =====================================================
-- 3. TRUNCATE VENUES (referenced by events)
-- =====================================================
TRUNCATE TABLE IF EXISTS public.venues CASCADE;

-- =====================================================
-- 4. TRUNCATE MAIN EVENTS TABLE (parent table)
-- =====================================================
TRUNCATE TABLE IF EXISTS public.events CASCADE;

-- =====================================================
-- 5. RESET SEQUENCES (if any auto-increment IDs exist)
-- =====================================================
-- Note: Most tables use UUIDs, but keeping for completeness
-- ALTER SEQUENCE IF EXISTS public.events_id_seq RESTART WITH 1;

-- =====================================================
-- 6. VERIFY TRUNCATION
-- =====================================================
SELECT 
    'events' as table_name, 
    COUNT(*) as row_count 
FROM public.events
UNION ALL SELECT 'event_participants', COUNT(*) FROM public.event_participants
UNION ALL SELECT 'event_registrations', COUNT(*) FROM public.event_registrations
UNION ALL SELECT 'event_categories', COUNT(*) FROM public.event_categories
UNION ALL SELECT 'event_tags', COUNT(*) FROM public.event_tags
UNION ALL SELECT 'event_media', COUNT(*) FROM public.event_media
UNION ALL SELECT 'event_notifications', COUNT(*) FROM public.event_notifications
UNION ALL SELECT 'event_schedule', COUNT(*) FROM public.event_schedule
UNION ALL SELECT 'event_venues', COUNT(*) FROM public.event_venues
UNION ALL SELECT 'event_audit', COUNT(*) FROM public.event_audit
UNION ALL SELECT 'venues', COUNT(*) FROM public.venues
UNION ALL SELECT 'ticket_types', COUNT(*) FROM public.ticket_types
UNION ALL SELECT 'registration_fields', COUNT(*) FROM public.registration_fields
ORDER BY table_name;
