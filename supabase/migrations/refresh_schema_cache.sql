-- =====================================================
-- REFRESH SCHEMA CACHE
-- =====================================================
-- This script refreshes the PostgREST schema cache
-- Run this after modifying table structure to update API endpoints
-- =====================================================

-- 1. Alternative ways to refresh schema cache
-- Option A: Create and drop a dummy table to force schema refresh
CREATE TEMP TABLE temp_schema_refresh AS SELECT 1 as dummy;
DROP TABLE temp_schema_refresh;

-- Option B: Update table statistics (may trigger cache refresh)
ANALYZE public.user_preferences;

-- Option C: Touch the table by updating a comment
COMMENT ON TABLE public.user_preferences IS 'User preferences for onboarding and personalization - updated';

-- 3. Verify the column exists
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_preferences' 
    AND table_schema = 'public'
    AND column_name = 'is_organizer';

-- 4. Check if the table is in the API schema
SELECT 
    schemaname, 
    tablename, 
    hasindexes, 
    hasrules, 
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename = 'user_preferences';

-- =====================================================
-- NOTES:
-- 1. The NOTIFY command should refresh PostgREST schema cache
-- 2. If that doesn't work, you may need to restart the PostgREST service
-- 3. In Supabase dashboard, you can also try: Settings > API > Reload schema
-- 4. The verification queries confirm the column exists and is accessible
-- =====================================================
