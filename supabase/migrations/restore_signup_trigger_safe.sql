-- Safely restore essential trigger for user signup
-- This drops existing triggers/functions first, then recreates them

-- Drop existing triggers and functions if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Recreate the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _role app_role;
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  
  _role := COALESCE(NULLIF(new.raw_user_meta_data->>'role', '')::app_role, 'user'::app_role);
  
  INSERT INTO public.user_roles (user_id, role) VALUES (new.id, _role) ON CONFLICT (user_id, role) DO NOTHING;
  
  IF _role = 'user' THEN
    INSERT INTO public.user_preferences (user_id) VALUES (new.id) ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN new;
END;
$$;

-- Recreate the trigger on auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Recreate the update triggers for timestamp management
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the triggers are created
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema IN ('public', 'auth')
AND event_object_table IN ('users', 'profiles', 'user_preferences')
ORDER BY trigger_name;
