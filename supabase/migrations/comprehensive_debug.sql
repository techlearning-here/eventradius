-- Comprehensive debug script to identify all database constraints and triggers
-- Run this in Supabase SQL Editor

-- Check ALL triggers on auth schema (including hidden ones)
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_condition,
    action_orientation,
    trigger_schema
FROM information_schema.triggers 
WHERE event_object_table IN ('users', 'profiles')
ORDER BY trigger_schema, event_object_table;

-- Check constraints on auth.users table
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'users'
AND tc.table_schema = 'auth'
ORDER BY tc.constraint_type, tc.constraint_name;

-- Check constraints on profiles table
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'profiles'
AND tc.table_schema = 'public'
ORDER BY tc.constraint_type, tc.constraint_name;

-- Check RLS policies on profiles table
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Check if profiles table has the required columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Try to manually create a test user to see exact error
DO $$
BEGIN
    -- Try to insert a test profile to see what breaks
    INSERT INTO public.profiles (user_id, display_name) 
    VALUES ('00000000-0000-0000-0000-000000000000', 'test');
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
END $$;
ROLLBACK;
