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
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_registrations') THEN
        DROP TABLE public.event_registrations CASCADE;
        RAISE NOTICE 'Dropped table: event_registrations';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_categories') THEN
        DROP TABLE public.event_categories CASCADE;
        RAISE NOTICE 'Dropped table: event_categories';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
        DROP TABLE public.events CASCADE;
        RAISE NOTICE 'Dropped table: events';
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
-- 2. DROP TYPES
-- =====================================================

-- Drop custom enum types
DROP TYPE IF EXISTS public.app_role CASCADE;

-- =====================================================
-- 3. DROP FUNCTIONS AND TRIGGERS
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
END $$;

-- =====================================================
-- 4. DROP RLS POLICIES
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
-- 5. RESET SEQUENCES
-- =====================================================

-- Reset any sequences (if using auto-increment IDs)
-- (Note: UUIDs don't use sequences, but keeping for completeness)

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE 'All EventRadius database objects have been dropped successfully';
END $$;
