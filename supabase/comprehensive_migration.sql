-- =====================================================
-- COMPREHENSIVE SUPABASE MIGRATION SCRIPT
-- =====================================================
-- This script compiles all essential database migrations
-- for the EventRadius application.
-- 
-- Run this in Supabase SQL Editor to set up the complete database
-- =====================================================

-- =====================================================
-- 1. TYPES AND ENUMS
-- =====================================================

-- Create app_role enum for role-based access control
CREATE TYPE IF NOT EXISTS public.app_role AS ENUM ('admin', 'user', 'organizer');

-- =====================================================
-- 2. CORE TABLES
-- =====================================================

-- 2.1 Profiles table for user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  provider TEXT DEFAULT 'email',
  provider_id TEXT,
  avatar_url TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2.2 User roles table for RBAC
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role public.app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 2.3 Events table for storing event information
CREATE TABLE IF NOT EXISTS public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  image_url TEXT,
  category TEXT,
  max_participants INTEGER,
  is_public BOOLEAN NOT NULL DEFAULT true,
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'pending'
);

-- 2.4 User preferences table for onboarding data
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  age_range text,
  has_kids boolean DEFAULT false,
  interests text[] DEFAULT '{}',
  city text,
  latitude double precision,
  longitude double precision,
  distance_range integer DEFAULT 25,
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- 3. FUNCTIONS AND TRIGGERS
-- =====================================================

-- 3.1 Function to update timestamps automatically
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 3.2 Security function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 3.3 Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _role app_role;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  
  -- Determine role from metadata or default to 'user'
  _role := COALESCE(NULLIF(new.raw_user_meta_data->>'role', '')::app_role, 'user'::app_role);
  
  -- Assign role
  INSERT INTO public.user_roles (user_id, role) VALUES (new.id, _role) ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Create preferences for regular users
  IF _role = 'user' THEN
    INSERT INTO public.user_preferences (user_id) VALUES (new.id) ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN new;
END;
$$;

-- =====================================================
-- 4. TRIGGERS
-- =====================================================

-- 4.1 Trigger to handle new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4.2 Trigger for automatic timestamp updates on profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 4.3 Trigger for automatic timestamp updates on events
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 4.4 Trigger for automatic timestamp updates on user_preferences
CREATE TRIGGER update_user_preferences_updated_at 
BEFORE UPDATE ON public.user_preferences 
FOR EACH ROW 
EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- 5.1 Enable RLS on all tables
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 5.2 Profiles RLS policies
CREATE POLICY IF NOT EXISTS "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY IF NOT EXISTS "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 5.3 User Roles RLS policies
CREATE POLICY IF NOT EXISTS "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Only admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 5.4 Events RLS policies
CREATE POLICY IF NOT EXISTS "Events are viewable by everyone" 
ON public.events 
FOR SELECT 
USING (true);

CREATE POLICY IF NOT EXISTS "Users can create events" 
ON public.events 
FOR INSERT 
WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY IF NOT EXISTS "Organizers can update their events" 
ON public.events 
FOR UPDATE 
USING (auth.uid() = organizer_id);

CREATE POLICY IF NOT EXISTS "Organizers can delete their events" 
ON public.events 
FOR DELETE 
USING (auth.uid() = organizer_id);

-- 5.5 User Preferences RLS policies
CREATE POLICY IF NOT EXISTS "Users can view own prefs" 
ON public.user_preferences 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own prefs" 
ON public.user_preferences 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own prefs" 
ON public.user_preferences 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Admins can view all prefs" 
ON public.user_preferences 
FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 6. INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_provider_id ON public.profiles(provider_id);

-- User roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_events_is_public ON public.events(is_public);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON public.events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);

-- User preferences indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_city ON public.user_preferences(city);
CREATE INDEX IF NOT EXISTS idx_user_preferences_onboarding_completed ON public.user_preferences(onboarding_completed);

-- =====================================================
-- 7. COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.profiles IS 'User profiles with OAuth support';
COMMENT ON COLUMN public.profiles.provider IS 'Authentication provider (email, google, github, etc.)';
COMMENT ON COLUMN public.profiles.provider_id IS 'Unique identifier from the OAuth provider';
COMMENT ON COLUMN public.profiles.avatar_url IS 'Profile picture URL from OAuth provider';
COMMENT ON COLUMN public.profiles.full_name IS 'User full name from OAuth provider';

COMMENT ON TABLE public.user_roles IS 'Role-based access control for users';
COMMENT ON TABLE public.events IS 'Events table for storing event information';
COMMENT ON COLUMN public.events.status IS 'Event status: pending, approved, rejected, cancelled';

COMMENT ON TABLE public.user_preferences IS 'User preferences for onboarding and personalization';
COMMENT ON COLUMN public.user_preferences.distance_range IS 'Preferred distance range in miles/kilometers';

-- =====================================================
-- 8. SAMPLE DATA (OPTIONAL - FOR DEVELOPMENT)
-- =====================================================

-- Uncomment the following lines to create a sample admin user
-- This should be done manually after setting up authentication
/*
-- Create admin user role (replace with actual user UUID from auth.users)
INSERT INTO public.user_roles (user_id, role) 
VALUES ('YOUR_ADMIN_USER_UUID', 'admin') 
ON CONFLICT (user_id, role) DO NOTHING;
*/

-- =====================================================
-- 9. VALIDATION AND CLEANUP
-- =====================================================

-- Ensure all triggers are properly set up
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Verify all tables have RLS enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'user_roles', 'events', 'user_preferences')
ORDER BY tablename;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- 
-- Next steps:
-- 1. Set up authentication providers in Supabase
-- 2. Configure OAuth providers if needed
-- 3. Create initial admin users
-- 4. Test the complete setup
-- 
-- This migration includes:
-- ✅ User management with profiles and roles
-- ✅ Role-based access control (RBAC)
-- ✅ Event management system
-- ✅ User preferences for onboarding
-- ✅ OAuth provider support
-- ✅ Row Level Security (RLS) policies
-- ✅ Performance indexes
-- ✅ Automatic timestamp triggers
-- ✅ Comprehensive documentation
-- =====================================================
