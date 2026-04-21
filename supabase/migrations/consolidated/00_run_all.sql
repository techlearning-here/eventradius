-- =====================================================
-- EVENTRADIUS DATABASE SETUP - MASTER RUNNER
-- =====================================================
-- This file executes all 3 parts in the correct order:
--   1. 01_schema.sql - Types and CREATE TABLE statements
--   2. 02_functions.sql - Functions and stored procedures
--   3. 03_indexes_rls_views.sql - Triggers, RLS, indexes, views
--
-- ⚠️ IMPORTANT: Run this in Supabase SQL Editor to set up the complete database
--
-- If you have an existing database with old schema:
--    1. Run clear/drop_all_tables.sql FIRST to drop all views
--    2. Then run this script to recreate everything
--
-- =====================================================

-- Show progress
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'EventRadius Database Setup - Starting...';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'This will execute:';
    RAISE NOTICE '  1. Schema (types and tables)';
    RAISE NOTICE '  2. Functions and stored procedures';
    RAISE NOTICE '  3. Triggers, RLS, indexes, and views';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- PART 1: SCHEMA (Types & Tables)
-- =====================================================
\ir 01_schema.sql

-- =====================================================
-- PART 2: FUNCTIONS & STORED PROCEDURES
-- =====================================================
\ir 02_functions.sql

-- =====================================================
-- PART 3: TRIGGERS, RLS, INDEXES, VIEWS
-- =====================================================
\ir 03_indexes_rls_views.sql

-- Show completion
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'EventRadius Database Setup - COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ All tables created with consolidated columns';
    RAISE NOTICE '✅ All functions and stored procedures created';
    RAISE NOTICE '✅ All triggers, RLS policies, and indexes applied';
    RAISE NOTICE '✅ All views created';
    RAISE NOTICE '';
    RAISE NOTICE 'Features included:';
    RAISE NOTICE '  • User management with profiles and roles';
    RAISE NOTICE '  • Event management with participant tracking';
    RAISE NOTICE '  • Approval workflow with waitlist support';
    RAISE NOTICE '  • Cancellation request system';
    RAISE NOTICE '  • Geolocation with distance calculation';
    RAISE NOTICE '  • Row Level Security (RLS) policies';
    RAISE NOTICE '  • Performance indexes';
    RAISE NOTICE '  • Comprehensive views';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;
