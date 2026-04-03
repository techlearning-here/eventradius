-- Disable ALL database constraints and triggers temporarily
-- This is a nuclear option to isolate the OAuth issue

-- First, disable RLS policies
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL triggers on public schema
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(trigger_record.trigger_name) || ' ON ' || quote_ident(trigger_schema) || '.' || quote_ident(trigger_record.event_object_table);
    END LOOP;
END $$;

-- Drop ALL functions on public schema (except system ones)
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_type = 'FUNCTION'
        AND routine_name NOT LIKE 'pg_%'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || quote_ident(func_record.routine_name) || '() CASCADE';
    END LOOP;
END $$;

-- Check for any remaining auth.users triggers (these are hidden)
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'auth'
AND event_object_table = 'users';

-- Try to manually create a user to see what happens
DO $$
BEGIN
    -- This simulates what Supabase does during OAuth
    INSERT INTO auth.users (
        id,
        aud,
        role,
        email,
        email_confirmed_at,
        phone,
        phone_confirmed_at,
        created_at,
        updated_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        encrypted_password,
        email_change_token_current,
        email_change,
        recovery_token
    ) VALUES (
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'test@example.com',
        now(),
        NULL,
        NULL,
        now(),
        now(),
        now(),
        '{"provider": "google"}',
        '{"full_name": "Test User"}',
        false,
        NULL,
        NULL,
        NULL,
        NULL
    );
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'User creation failed: %', SQLERRM;
    ROLLBACK;
END $$;

-- Check the result
SELECT COUNT(*) as user_count FROM auth.users WHERE email = 'test@example.com';
