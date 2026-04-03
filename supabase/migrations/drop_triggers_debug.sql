-- Debug script to drop all problematic triggers
-- Run this in Supabase SQL Editor to disable triggers during OAuth testing

-- Drop the main problematic trigger that's causing "Database error saving new user"
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the trigger function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop the profiles update trigger and related triggers that depend on update_updated_at_column
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;

-- Now drop the timestamp update function with CASCADE to handle dependencies
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Check what triggers remain
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_condition,
    action_orientation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY trigger_name;

-- Check what functions remain
SELECT 
    routine_name,
    routine_type,
    data_type,
    security_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Verify auth.users table has no triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'auth'
AND event_object_table = 'users';
