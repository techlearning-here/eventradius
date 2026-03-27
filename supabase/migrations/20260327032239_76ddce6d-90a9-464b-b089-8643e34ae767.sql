
-- Add 'organizer' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'organizer';

-- Create user_preferences table
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

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prefs" ON public.user_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own prefs" ON public.user_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own prefs" ON public.user_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all prefs" ON public.user_preferences FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add new columns to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS category text DEFAULT 'community';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS kid_friendly boolean DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS price numeric DEFAULT 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS status text DEFAULT 'approved';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS city text;

-- Change default for future inserts to 'pending'
ALTER TABLE public.events ALTER COLUMN status SET DEFAULT 'pending';

-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.site_settings (key, value) VALUES 
  ('default_categories', '["kids-family","arts-culture","sports","social","classes","community"]'::jsonb),
  ('default_distance_options', '[5,10,25,50,100]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Distance calculation function (Haversine, returns miles)
CREATE OR REPLACE FUNCTION public.calculate_distance(lat1 double precision, lon1 double precision, lat2 double precision, lon2 double precision)
RETURNS double precision LANGUAGE sql IMMUTABLE AS $$
  SELECT 3959 * acos(LEAST(1.0, cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lon2) - radians(lon1)) + sin(radians(lat1)) * sin(radians(lat2))))
$$;

-- Update events RLS for status-aware visibility
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
CREATE POLICY "Approved events viewable by everyone" ON public.events FOR SELECT USING (status = 'approved' OR auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- Allow users to insert their own initial role
CREATE OR REPLACE FUNCTION public.user_has_no_role(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id)
$$;

CREATE POLICY "Users can insert own initial role" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.user_has_no_role(auth.uid()));

-- Update handle_new_user to assign roles and create preferences
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
