-- Drop all tables and related objects in the correct order
-- WARNING: This will delete all data!

-- Drop tables first (with CASCADE to automatically drop dependent triggers and indexes)
DROP TABLE IF EXISTS public.event_messages CASCADE;
DROP TABLE IF EXISTS public.event_participants CASCADE;
DROP TABLE IF EXISTS public.event_registrations CASCADE;
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;

-- Drop triggers that are on auth.users (not dropped by table CASCADE)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop functions (use CASCADE to automatically drop any remaining dependent objects)
DROP FUNCTION IF EXISTS public.calculate_distance(double precision, double precision, double precision, double precision) CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Drop storage policies
DROP POLICY IF EXISTS "Event images public read" ON storage.objects;
DROP POLICY IF EXISTS "Event images upload (authenticated)" ON storage.objects;
DROP POLICY IF EXISTS "Event images update (authenticated)" ON storage.objects;
DROP POLICY IF EXISTS "Event images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete event images" ON storage.objects;

-- Note: Cannot delete from storage.buckets directly due to Supabase security policies
-- The bucket 'event-images' will remain but will be empty after dropping policies