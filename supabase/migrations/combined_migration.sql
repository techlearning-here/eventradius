--- Migration: 20251020114939_473ce949-108e-4de1-849d-5bebe6ccf628.sql ---
-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  creator TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  address TEXT NOT NULL,
  background_image_url TEXT NOT NULL,
  map_image_url TEXT NOT NULL,
  target_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to view events
CREATE POLICY "Events are viewable by everyone" 
ON public.events 
FOR SELECT 
USING (true);

-- Create policy to allow authenticated users to insert events
CREATE POLICY "Authenticated users can insert events" 
ON public.events 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Create policy to allow authenticated users to update events
CREATE POLICY "Authenticated users can update events" 
ON public.events 
FOR UPDATE 
TO authenticated
USING (true);

-- Create policy to allow authenticated users to delete events
CREATE POLICY "Authenticated users can delete events" 
ON public.events 
FOR DELETE 
TO authenticated
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample event data
INSERT INTO public.events (
  title,
  creator,
  description,
  date,
  time,
  address,
  background_image_url,
  map_image_url,
  target_date
) VALUES (
  'Cocktails with a Side of Sounds',
  'EBBA STOPPELBURG',
  'Experience the perfect blend of lakeside serenity, culture, and local charm. Explore stunning waterfronts, discover top wineries and galleries, and savour local dining—your ultimate destination for relaxation, discovery, and adventure.',
  'THURSDAY, OCTOBER 30',
  '16:30 - 18:30 CET',
  'ADDRESS GOES HERE',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
  'https://api.builder.io/api/v1/image/assets/TEMP/332f98a4dad5cb2efedd96ff4032a25b1c4d8e3a?width=910',
  now() + interval '132 days 12 hours 51 minutes'
);

--- Migration: 20251020115814_27eaaaed-2a39-4797-a80f-eecefe910485.sql ---
-- Remove created_at and updated_at columns from events table
ALTER TABLE public.events DROP COLUMN created_at;
ALTER TABLE public.events DROP COLUMN updated_at;

-- Remove map_image_url since we'll use dynamic maps
ALTER TABLE public.events DROP COLUMN map_image_url;

-- Drop the trigger for updated_at since we removed the column
DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;

-- Create storage bucket for event background images
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for event images
CREATE POLICY "Event images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

CREATE POLICY "Authenticated users can upload event images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update event images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'event-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete event images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-images' 
  AND auth.role() = 'authenticated'
);

--- Migration: 20251020122841_8798313b-f855-423d-9944-c2cbcdd14ffd.sql ---
-- Storage policies for event-images bucket
-- Ensure public read and authenticated write/update

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Event images public read'
  ) THEN
    CREATE POLICY "Event images public read"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'event-images');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Event images upload (authenticated)"
  ) THEN
    CREATE POLICY "Event images upload (authenticated)"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'event-images');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = "Event images update (authenticated)"
  ) THEN
    CREATE POLICY "Event images update (authenticated)"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'event-images')
    WITH CHECK (bucket_id = 'event-images');
  END IF;
END $$;

--- Migration: 20251020122859_3486b2e2-795f-44b0-9a48-2113c7d2b56c.sql ---
-- Storage policies for event-images bucket
-- Ensure public read and authenticated write/update

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Event images public read'
  ) THEN
    CREATE POLICY "Event images public read"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'event-images');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Event images upload (authenticated)"
  ) THEN
    CREATE POLICY "Event images upload (authenticated)"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'event-images');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = "Event images update (authenticated)"
  ) THEN
    CREATE POLICY "Event images update (authenticated)"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'event-images')
    WITH CHECK (bucket_id = 'event-images');
  END IF;
END $$;

--- Migration: 20251021175330_e48c7bfe-0218-4267-9262-23e9ac35fbf6.sql ---
-- Add created_by column to events table to track who created each event
ALTER TABLE public.events ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create event_registrations table to track user registrations
CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Enable Row Level Security
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_registrations
CREATE POLICY "Users can view their own registrations"
ON public.event_registrations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own registrations"
ON public.event_registrations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own registrations"
ON public.event_registrations
FOR DELETE
USING (auth.uid() = user_id);

-- Update events RLS policies to allow users to see their own created events
CREATE POLICY "Users can view their own created events"
ON public.events
FOR SELECT
USING (auth.uid() = created_by OR created_by IS NULL);

-- Update events insert policy to set created_by
DROP POLICY IF EXISTS "Authenticated users can insert events" ON public.events;
CREATE POLICY "Authenticated users can insert events"
ON public.events
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Update events update policy  
DROP POLICY IF EXISTS "Authenticated users can update events" ON public.events;
CREATE POLICY "Users can update their own events"
ON public.events
FOR UPDATE
USING (auth.uid() = created_by);

-- Update events delete policy
DROP POLICY IF EXISTS "Authenticated users can delete events" ON public.events;
CREATE POLICY "Users can delete their own events"
ON public.events
FOR DELETE
USING (auth.uid() = created_by);

--- Migration: 20251022111021_cc1033fb-ec5f-4b09-91c7-50ac7b51c93b.sql ---
-- Fix Issue 1: Make created_by NOT NULL and update RLS policies
-- Delete orphaned events with NULL created_by (these are legacy/test data)
DELETE FROM public.events WHERE created_by IS NULL;

-- Now make created_by NOT NULL with default
ALTER TABLE public.events 
ALTER COLUMN created_by SET DEFAULT auth.uid(),
ALTER COLUMN created_by SET NOT NULL;

-- Drop the problematic SELECT policy that allows NULL owners
DROP POLICY IF EXISTS "Users can view their own created events" ON public.events;

-- Fix Issue 2: Add/update storage policies for event-images bucket
-- Drop existing policies if they exist, then recreate with proper restrictions
DROP POLICY IF EXISTS "Authenticated users can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own event images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own event images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view event images" ON storage.objects;

-- Restrict who can upload files (only authenticated users, only images, organized by user ID)
CREATE POLICY "Authenticated users can upload event images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND (LOWER(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'gif', 'webp'))
);

-- Allow users to update their own uploads
CREATE POLICY "Users can update their own event images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'event-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'event-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own event images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Everyone can view event images (bucket is public)
CREATE POLICY "Anyone can view event images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'event-images');

--- Migration: 20251022111522_24b9f18d-163e-4bf2-a806-b64d00709f01.sql ---
-- Create role-based access control system

-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role public.app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS policy: Only admins can insert/update/delete roles
CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 3. Create security definer function to check roles
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

-- 4. Add RLS policy for admins to view all events
CREATE POLICY "Admins can view all events"
ON public.events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Add RLS policy for admins to update any event
CREATE POLICY "Admins can update all events"
ON public.events
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. Update storage policies to allow admins to manage any images
DROP POLICY IF EXISTS "Authenticated users can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own event images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own event images" ON storage.objects;

-- Allow admins to upload any image, regular users only in their folder
CREATE POLICY "Users can upload event images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-images' 
  AND (
    public.has_role(auth.uid(), 'admin')
    OR (
      (storage.foldername(name))[1] = auth.uid()::text
      AND (LOWER(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'gif', 'webp'))
    )
  )
);

-- Allow admins to update any image, regular users only their own
CREATE POLICY "Users can update event images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'event-images' 
  AND (
    public.has_role(auth.uid(), 'admin')
    OR (storage.foldername(name))[1] = auth.uid()::text
  )
)
WITH CHECK (
  bucket_id = 'event-images' 
  AND (
    public.has_role(auth.uid(), 'admin')
    OR (storage.foldername(name))[1] = auth.uid()::text
  )
);

-- Allow admins to delete any image, regular users only their own
CREATE POLICY "Users can delete event images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-images' 
  AND (
    public.has_role(auth.uid(), 'admin')
    OR (storage.foldername(name))[1] = auth.uid()::text
  )
);

--- Migration: 20251029164531_36a31819-5034-4f4f-8368-ba23a9fb400f.sql ---
-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles are viewable by everyone
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add trigger for automatic timestamp updates on profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

--- Migration: 20251105163157_c1c3c2b8-f555-4da7-b116-f2bcd97cf8bf.sql ---
-- Allow event creators to view registrations for their events
CREATE POLICY "Event creators can view registrations"
ON public.event_registrations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.events
    WHERE events.id = event_registrations.event_id
    AND events.created_by = auth.uid()
  )
);

--- Migration: 20260327032239_76ddce6d-90a9-464b-b089-8643e34ae767.sql ---

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


--- Migration: 20260327032255_0d8ac064-17c8-41d3-b186-239ab62a404a.sql ---

CREATE OR REPLACE FUNCTION public.calculate_distance(lat1 double precision, lon1 double precision, lat2 double precision, lon2 double precision)
RETURNS double precision LANGUAGE sql IMMUTABLE SET search_path TO 'public' AS $$
  SELECT 3959 * acos(LEAST(1.0, cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lon2) - radians(lon1)) + sin(radians(lat1)) * sin(radians(lat2))))
$$;


--- Migration: 20260328002055_457ff0bd-5eff-4eb5-be6c-8cd2b4d39935.sql ---

-- Add event_type and event_status columns to events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_type text NOT NULL DEFAULT 'standard';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_status text NOT NULL DEFAULT 'confirmed';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS admin_remark text;

-- Create event_participants table
CREATE TABLE public.event_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'interested',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view event participants" ON public.event_participants FOR SELECT USING (true);
CREATE POLICY "Users can insert own participation" ON public.event_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own participation" ON public.event_participants FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own participation" ON public.event_participants FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create event_messages table
CREATE TABLE public.event_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  sender_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.event_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view event messages" ON public.event_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert messages" ON public.event_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_user_id);

-- Trigger for updated_at on event_participants
CREATE TRIGGER update_event_participants_updated_at
  BEFORE UPDATE ON public.event_participants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--- Migration: 20260328002056_add_is_public_column.sql ---
-- Add is_public column to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true;

-- Update existing events to be public by default
UPDATE public.events SET is_public = true WHERE is_public IS NULL;
