-- SQL Script to truncate all event-related tables
-- WARNING: This will permanently delete all event data!
-- Run with caution - this cannot be undone
--
-- This script clears all event data while preserving user accounts
-- For complete reset including users, use 03_truncate_all_users.sql instead
--
-- Updated: 2026-04-29 - Added user_preferences for event-related preferences

-- =====================================================
-- 1. TRUNCATE CHILD TABLES (no dependencies or leaf nodes)
-- =====================================================
-- Event schedule/agenda items
TRUNCATE TABLE public.event_schedule CASCADE;

-- Event tags for discovery
TRUNCATE TABLE public.event_tags CASCADE;

-- Event notifications (confirmation, reminders, etc.)
TRUNCATE TABLE public.event_notifications CASCADE;

-- Event media (images, videos)
TRUNCATE TABLE public.event_media CASCADE;

-- Custom registration fields for events
TRUNCATE TABLE public.registration_fields CASCADE;

-- Ticket types for paid events
TRUNCATE TABLE public.ticket_types CASCADE;

-- =====================================================
-- 2. TRUNCATE PARTICIPANT/REGISTRATION TABLES
-- =====================================================
-- Event registrations (alias for participants)
TRUNCATE TABLE public.event_registrations CASCADE;

-- Event participants with approval status
TRUNCATE TABLE public.event_participants CASCADE;

-- =====================================================
-- 3. TRUNCATE EVENT RELATIONSHIP TABLES
-- =====================================================
-- Event categories linking
TRUNCATE TABLE public.event_categories CASCADE;

-- Event-venue relationships
TRUNCATE TABLE public.event_venues CASCADE;

-- =====================================================
-- 4. TRUNCATE AUDIT/TRACKING (depends on events)
-- =====================================================
TRUNCATE TABLE public.event_audit CASCADE;

-- =====================================================
-- 5. TRUNCATE USER PREFERENCES (event-related preferences)
-- =====================================================
TRUNCATE TABLE public.user_preferences CASCADE;

-- =====================================================
-- 6. TRUNCATE VENUES (referenced by events)
-- =====================================================
TRUNCATE TABLE public.venues CASCADE;

-- =====================================================
-- 7. TRUNCATE MAIN EVENTS TABLE (parent table - last)
-- =====================================================
TRUNCATE TABLE public.events CASCADE;

-- =====================================================
-- 8. RESET SEQUENCES (if any auto-increment IDs exist)
-- =====================================================
-- Note: Most tables use UUIDs, but keeping for completeness
-- ALTER SEQUENCE IF EXISTS public.events_id_seq RESTART WITH 1;

-- =====================================================
-- 9. VERIFY TRUNCATION
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
UNION ALL SELECT 'user_preferences', COUNT(*) FROM public.user_preferences
ORDER BY table_name;
