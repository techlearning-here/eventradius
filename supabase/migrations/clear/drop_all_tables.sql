-- =====================================================
-- DROP ALL EVENTRADIUS DATABASE OBJECTS - COMPREHENSIVE
-- =====================================================
-- This script will drop ALL EventRadius database objects:
--   - Views
--   - Triggers
--   - RLS Policies  
--   - Functions/Stored Procedures
--   - Tables (with CASCADE for FK dependencies)
--   - Custom Types/Enums
-- WARNING: This will permanently delete all data!
-- =====================================================

-- =====================================================
-- 1. DROP VIEWS FIRST (to avoid dependency issues)
-- =====================================================

DO $$
DECLARE
    view_record RECORD;
BEGIN
    -- Drop all EventRadius views
    FOR view_record IN 
        SELECT table_name 
        FROM information_schema.views 
        WHERE table_schema = 'public' 
        AND table_name IN (
            'events_with_participants',
            'user_events_view', 
            'events_enhanced_view',
            'deleted_events_with_countdown',
            'event_geolocation_stats',
            'ticket_sales_view'
        )
    LOOP
        EXECUTE format('DROP VIEW IF EXISTS public.%I CASCADE', view_record.table_name);
        RAISE NOTICE 'Dropped view: %', view_record.table_name;
    END LOOP;
END $$;

-- =====================================================
-- 2. DROP TRIGGERS
-- =====================================================

DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    -- Drop all triggers on auth.users
    FOR trigger_record IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'users' 
        AND trigger_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users CASCADE', trigger_record.trigger_name);
        RAISE NOTICE 'Dropped trigger on auth.users: %', trigger_record.trigger_name;
    END LOOP;
END $$;

-- Drop triggers on all public tables
DO $$
DECLARE
    trigger_rec RECORD;
BEGIN
    FOR trigger_rec IN 
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public'
        AND event_object_table IN (
            'profiles', 'events', 'user_preferences', 'venues',
            'ticket_types', 'event_participants', 'event_venues',
            'event_schedule', 'event_registrations', 'event_audit'
        )
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I CASCADE', trigger_rec.trigger_name, trigger_rec.event_object_table);
        RAISE NOTICE 'Dropped trigger: % on %', trigger_rec.trigger_name, trigger_rec.event_object_table;
    END LOOP;
END $$;

-- =====================================================
-- 3. DROP RLS POLICIES
-- =====================================================

DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND tablename IN (
            'profiles', 'user_roles', 'events', 'user_preferences',
            'venues', 'event_participants', 'event_categories', 
            'event_registrations', 'event_audit', 'event_venues',
            'ticket_types', 'registration_fields', 'event_media',
            'event_notifications', 'event_tags', 'event_schedule'
        )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_record.policyname, policy_record.tablename);
        RAISE NOTICE 'Dropped policy: % on %', policy_record.policyname, policy_record.tablename;
    END LOOP;
END $$;

-- =====================================================
-- 4. DROP ALL FUNCTIONS
-- =====================================================

-- Use simpler approach: drop functions without parameters first, then with CASCADE
DO $$
DECLARE
    func_name TEXT;
    func_list TEXT[] := ARRAY[
        -- Core utility functions
        'update_updated_at_column',
        'handle_new_user',
        'has_role',
        -- Event management functions
        'update_participant_count',
        'update_event_status',
        'validate_event_data',
        'validate_event_data_enhanced',
        'validate_ticket_data',
        'log_event_changes',
        -- Geolocation functions (with specific signatures for array params)
        'calculate_distance_km',
        'events_within_radius',
        'events_within_radius_fast',
        'get_nearby_events_with_details',
        -- Approval workflow functions
        'submit_approval_request',
        'process_cancellation_action',
        'cancel_approved_participation',
        -- Event lifecycle functions
        'cleanup_old_deleted_events',
        'cleanup_expired_deleted_events',
        'get_days_until_deletion',
        'permanently_delete_event',
        'restore_event',
        'restore_deleted_event',
        'soft_delete_event',
        'trigger_cleanup_on_event_access',
        -- API functions
        'assign_default_role',
        'get_events_with_details',
        'search_events',
        'get_user_events',
        'get_event_participants_with_profiles',
        'get_popular_events',
        'get_upcoming_user_events',
        'register_user_for_event',
        'unregister_user_from_event',
        'check_event_capacity',
        'is_user_registered_for_event',
        'get_event_statistics',
        'get_organizer_events',
        'update_event_status_bulk',
        'get_events_by_category',
        'get_events_by_location',
        'get_events_by_date_range',
        'delete_expired_events',
        'cleanup_soft_deleted_events',
        'get_deleted_events',
        'get_deleted_events_for_user',
        'permanently_delete_user_event'
    ];
BEGIN
    -- First pass: try to drop functions with CASCADE (handles dependencies)
    FOREACH func_name IN ARRAY func_list
    LOOP
        BEGIN
            EXECUTE format('DROP FUNCTION IF EXISTS public.%I CASCADE', func_name);
            RAISE NOTICE 'Dropped function: %', func_name;
        EXCEPTION WHEN OTHERS THEN
            -- Function might have different signature, ignore error
            RAISE NOTICE 'Could not drop function % (may not exist or different signature)', func_name;
        END;
    END LOOP;
END $$;

-- =====================================================
-- 5. DROP TABLES (in reverse order of creation to handle dependencies)
-- =====================================================

-- Drop dynamic pricing tables first (reverse dependency order)
DO $$
BEGIN
    -- Drop promo codes (depends on recommendations)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'promo_codes') THEN
        DROP TABLE public.promo_codes CASCADE;
        RAISE NOTICE 'Dropped table: promo_codes';
    END IF;
    
    -- Drop discount recommendations (depends on pricing_rules)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'discount_recommendations') THEN
        DROP TABLE public.discount_recommendations CASCADE;
        RAISE NOTICE 'Dropped table: discount_recommendations';
    END IF;
    
    -- Drop discount rules config (depends on events)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'discount_rules_config') THEN
        DROP TABLE public.discount_rules_config CASCADE;
        RAISE NOTICE 'Dropped table: discount_rules_config';
    END IF;
    
    -- Drop inventory snapshots (depends on pricing_rules)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'inventory_snapshots') THEN
        DROP TABLE public.inventory_snapshots CASCADE;
        RAISE NOTICE 'Dropped table: inventory_snapshots';
    END IF;
    
    -- Drop dynamic pricing rules (depends on events)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dynamic_pricing_rules') THEN
        DROP TABLE public.dynamic_pricing_rules CASCADE;
        RAISE NOTICE 'Dropped table: dynamic_pricing_rules';
    END IF;
END $$;

-- Drop event-related tables (due to foreign key dependencies)
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
-- 6. DROP ALL CUSTOM TYPES/ENUMS
-- =====================================================

DO $$
BEGIN
    -- Drop all custom enum types
    DROP TYPE IF EXISTS public.app_role CASCADE;
    RAISE NOTICE 'Dropped type: app_role';
    
    DROP TYPE IF EXISTS public.event_type CASCADE;
    RAISE NOTICE 'Dropped type: event_type';
    
    DROP TYPE IF EXISTS public.event_format CASCADE;
    RAISE NOTICE 'Dropped type: event_format';
    
    DROP TYPE IF EXISTS public.event_privacy CASCADE;
    RAISE NOTICE 'Dropped type: event_privacy';
    
    DROP TYPE IF EXISTS public.refund_policy CASCADE;
    RAISE NOTICE 'Dropped type: refund_policy';
    
    DROP TYPE IF EXISTS public.currency_type CASCADE;
    RAISE NOTICE 'Dropped type: currency_type';
END $$;

-- =====================================================
-- 7. DROP SPECIFIC NAMED RLS POLICIES
-- =====================================================
-- Additional cleanup for policies not caught by the bulk drop in section 3

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
-- 8. COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ALL EVENTRADIUS OBJECTS DROPPED!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '  ✓ All views (3)';
    RAISE NOTICE '  ✓ All triggers (20+)';
    RAISE NOTICE '  ✓ All RLS policies (15+)';
    RAISE NOTICE '  ✓ All functions (25+)';
    RAISE NOTICE '  ✓ All tables (20)';
    RAISE NOTICE '  ✓ All custom types/enums (6)';
    RAISE NOTICE '';
    RAISE NOTICE 'Database is now clean for fresh setup.';
    RAISE NOTICE 'Run the consolidated migration to recreate everything.';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;
