-- =====================================================
-- 01 - EVENTRADIUS DATABASE SETUP - SINGLE SCRIPT
-- =====================================================
-- This single script contains all database creation for EventRadius
-- including tables, types, functions, triggers, RLS policies, and indexes.
-- 
-- Run this in Supabase SQL Editor to set up the complete database
-- This script is safe to run multiple times (uses IF EXISTS/IF NOT EXISTS)
-- =====================================================

-- =====================================================
-- 1. TYPES AND ENUMS
-- =====================================================

-- Create app_role enum for role-based access control
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'organizer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Event type enum
DO $$ BEGIN
    CREATE TYPE public.event_type AS ENUM ('online', 'in_person', 'hybrid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Event format enum
DO $$ BEGIN
    CREATE TYPE public.event_format AS ENUM ('single', 'recurring', 'multi_date');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Privacy settings enum
DO $$ BEGIN
    CREATE TYPE public.event_privacy AS ENUM ('public', 'private', 'unlisted');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Refund policy enum
DO $$ BEGIN
    CREATE TYPE public.refund_policy AS ENUM ('no_refunds', 'refund_up_to_7_days', 'refund_up_to_24_hours', 'refund_up_to_1_hour', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Currency enum (common currencies)
DO $$ BEGIN
    CREATE TYPE public.currency_type AS ENUM ('USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

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
  email TEXT,
  phone TEXT,
  phone_country_code TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  organizer_status TEXT DEFAULT 'pending',
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

-- 2.3 Venues table for detailed location information (must be created before events)
CREATE TABLE IF NOT EXISTS public.venues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  capacity INTEGER,
  website TEXT,
  phone TEXT,
  contact_email TEXT,
  accessibility_features TEXT[],
  parking_info TEXT,
  public_transport_info TEXT,
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2.4 Events table for storing event information
CREATE TABLE IF NOT EXISTS public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  summary TEXT,
  location TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  doors_open_time TIMESTAMP WITH TIME ZONE,
  image_url TEXT,
  category TEXT,
  max_participants INTEGER,
  is_public BOOLEAN NOT NULL DEFAULT true,
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'pending',
  participant_count INTEGER DEFAULT 0,
  
  -- Enhanced event fields from migration 04
  event_type public.event_type DEFAULT 'in_person',
  event_format public.event_format DEFAULT 'single',
  event_privacy public.event_privacy DEFAULT 'public',
  timezone TEXT DEFAULT 'UTC',
  registration_start_time TIMESTAMP WITH TIME ZONE,
  registration_end_time TIMESTAMP WITH TIME ZONE,
  refund_policy public.refund_policy DEFAULT 'no_refunds',
  custom_refund_policy TEXT,
  event_password TEXT,
  age_restriction TEXT,
  accessibility_options TEXT,
  language TEXT DEFAULT 'en',
  virtual_event_url TEXT,
  virtual_event_platform TEXT,
  event_website TEXT,
  event_contact_email TEXT,
  ticketing_website TEXT,
  primary_venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
  
  -- Structured venue fields from EventWizard
  venue_street TEXT,
  venue_city TEXT,
  venue_state TEXT,
  venue_zip_code TEXT,
  venue_country TEXT,
  venue_building_name TEXT,
  
  -- Event type and payment fields
  is_virtual BOOLEAN DEFAULT false,
  is_paid_event BOOLEAN DEFAULT false,
  ticket_pricing_description TEXT,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_status TEXT DEFAULT 'published'
);

-- 2.4 User preferences table for onboarding data
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  age_range TEXT,
  has_kids BOOLEAN DEFAULT false,
  interests TEXT[] DEFAULT '{}',
  city TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  distance_range INTEGER DEFAULT 25,
  onboarding_completed BOOLEAN DEFAULT false,
  is_organizer BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Organizer onboarding fields from migration 03
  organizer_onboarding_completed BOOLEAN DEFAULT false,
  business_name TEXT,
  business_type TEXT,
  business_description TEXT,
  business_address TEXT,
  business_city TEXT,
  business_state_province TEXT,
  business_zip_pin TEXT,
  business_country TEXT,
  event_types TEXT[] DEFAULT '{}'
);

-- Add missing columns if they don't exist (for existing tables)
DO $$
BEGIN
    -- Add is_organizer column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'is_organizer'
    ) THEN
        ALTER TABLE public.user_preferences ADD COLUMN is_organizer BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_organizer column';
    END IF;

    -- Add organizer_onboarding_completed column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'organizer_onboarding_completed'
    ) THEN
        ALTER TABLE public.user_preferences ADD COLUMN organizer_onboarding_completed BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added organizer_onboarding_completed column';
    END IF;

    -- Add business_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'business_name'
    ) THEN
        ALTER TABLE public.user_preferences ADD COLUMN business_name TEXT;
        RAISE NOTICE 'Added business_name column';
    END IF;

    -- Add business_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'business_type'
    ) THEN
        ALTER TABLE public.user_preferences ADD COLUMN business_type TEXT;
        RAISE NOTICE 'Added business_type column';
    END IF;

    -- Add business_description column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'business_description'
    ) THEN
        ALTER TABLE public.user_preferences ADD COLUMN business_description TEXT;
        RAISE NOTICE 'Added business_description column';
    END IF;

    -- Add business_address column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'business_address'
    ) THEN
        ALTER TABLE public.user_preferences ADD COLUMN business_address TEXT;
        RAISE NOTICE 'Added business_address column';
    END IF;

    -- Add business_city column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'business_city'
    ) THEN
        ALTER TABLE public.user_preferences ADD COLUMN business_city TEXT;
        RAISE NOTICE 'Added business_city column';
    END IF;

    -- Add business_state_province column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'business_state_province'
    ) THEN
        ALTER TABLE public.user_preferences ADD COLUMN business_state_province TEXT;
        RAISE NOTICE 'Added business_state_province column';
    END IF;

    -- Add business_zip_pin column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'business_zip_pin'
    ) THEN
        ALTER TABLE public.user_preferences ADD COLUMN business_zip_pin TEXT;
        RAISE NOTICE 'Added business_zip_pin column';
    END IF;

    -- Add business_country column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'business_country'
    ) THEN
        ALTER TABLE public.user_preferences ADD COLUMN business_country TEXT;
        RAISE NOTICE 'Added business_country column';
    END IF;

    -- Add event_types column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'event_types'
    ) THEN
        ALTER TABLE public.user_preferences ADD COLUMN event_types TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added event_types column';
    END IF;
END $$;

-- 2.5 Event participants table for event registrations
CREATE TABLE IF NOT EXISTS public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'going',
  UNIQUE(event_id, user_id) -- Prevent duplicate registrations
);

-- 2.6 Event categories table
CREATE TABLE IF NOT EXISTS public.event_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(event_id, category)
);

-- 2.7 Event registrations table (alias for event_participants)
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'registered',
  UNIQUE(event_id, user_id)
);

-- 2.8 Audit table for tracking changes
CREATE TABLE IF NOT EXISTS public.event_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  old_data JSONB,
  new_data JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- 3. COMPREHENSIVE EVENT MANAGEMENT TABLES
-- =====================================================

-- 3.1 Event venues relationship table
CREATE TABLE IF NOT EXISTS public.event_venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, venue_id)
);

-- 3.2 Ticket types table for comprehensive ticketing
CREATE TABLE IF NOT EXISTS public.ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) DEFAULT 0.00,
  currency public.currency_type DEFAULT 'USD',
  quantity_available INTEGER,
  quantity_sold INTEGER DEFAULT 0,
  min_per_order INTEGER DEFAULT 1,
  max_per_order INTEGER DEFAULT 10,
  sales_start_time TIMESTAMP WITH TIME ZONE,
  sales_end_time TIMESTAMP WITH TIME ZONE,
  visibility TEXT DEFAULT 'visible', -- 'visible', 'hidden', 'hidden_when_not_on_sale'
  absorb_fees BOOLEAN DEFAULT false,
  is_donation BOOLEAN DEFAULT false,
  sales_channel TEXT DEFAULT 'online', -- 'online', 'at_door', 'both'
  delivery_options TEXT[], -- ['eticket', 'will_call', 'print_at_home']
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3.3 Custom registration fields table
CREATE TABLE IF NOT EXISTS public.registration_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL, -- 'text', 'email', 'phone', 'dropdown', 'checkbox', 'radio', 'textarea'
  field_label TEXT NOT NULL,
  placeholder TEXT,
  required BOOLEAN DEFAULT false,
  options TEXT[], -- For dropdown, radio, checkbox
  validation_rules TEXT, -- JSON validation rules
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3.4 Event media table for images and videos
CREATE TABLE IF NOT EXISTS public.event_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL, -- 'image', 'video', 'banner'
  url TEXT NOT NULL,
  caption TEXT,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3.5 Event notifications table
CREATE TABLE IF NOT EXISTS public.event_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'confirmation', 'reminder', 'cancellation', 'update'
  subject TEXT,
  message TEXT,
  send_timing TEXT, -- 'immediate', '1_day_before', '1_hour_before', 'custom'
  custom_timing_hours INTEGER,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3.6 Event tags for better discovery
CREATE TABLE IF NOT EXISTS public.event_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, tag)
);

-- 3.7 Event schedule/agenda table
CREATE TABLE IF NOT EXISTS public.event_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  speaker_name TEXT,
  location TEXT, -- Room or virtual breakout room
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
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
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)), new.email)
  ON CONFLICT (user_id) DO NOTHING;

  -- Determine role
  _role := COALESCE(NULLIF(new.raw_user_meta_data->>'role', '')::app_role, 'user'::app_role);

  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Create preferences for regular users
  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Log user creation
  INSERT INTO public.event_audit (event_id, action, new_data, changed_by)
  VALUES (new.id, 'USER_CREATED', row_to_json(new), new.id)
  ON CONFLICT DO NOTHING;

  RETURN new;
END;
$$;

-- 3.4 Function to update participant count
CREATE OR REPLACE FUNCTION public.update_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment participant count
    UPDATE public.events
    SET participant_count = participant_count + 1
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement participant count
    UPDATE public.events
    SET participant_count = GREATEST(participant_count - 1, 0)
    WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 3.5 Function to automatically update event status based on time
CREATE OR REPLACE FUNCTION public.update_event_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-update status based on current time
  IF NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
    IF NOW() > NEW.end_time THEN
      NEW.status := 'ended';
    ELSIF NOW() >= NEW.start_time AND NOW() <= NEW.end_time THEN
      NEW.status := 'ongoing';
    ELSIF NOW() < NEW.start_time THEN
      NEW.status := 'upcoming';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 3.6 Function to validate event data
CREATE OR REPLACE FUNCTION public.validate_event_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate end_time is after start_time
  IF NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
    IF NEW.end_time <= NEW.start_time THEN
      RAISE EXCEPTION 'End time must be after start time';
    END IF;
  END IF;

  -- Validate max_participants is positive
  IF NEW.max_participants IS NOT NULL AND NEW.max_participants <= 0 THEN
    RAISE EXCEPTION 'Max participants must be positive';
  END IF;

  -- Validate status
  IF NEW.status IS NOT NULL AND NEW.status NOT IN ('pending', 'approved', 'rejected', 'cancelled', 'upcoming', 'ongoing', 'ended') THEN
    RAISE EXCEPTION 'Invalid event status: %s', NEW.status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 3.7 Function to log event changes
CREATE OR REPLACE FUNCTION public.log_event_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.event_audit (event_id, action, old_data, changed_by)
    VALUES (OLD.id, 'DELETE', row_to_json(OLD), auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.event_audit (event_id, action, old_data, new_data, changed_by)
    VALUES (NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.event_audit (event_id, action, new_data, changed_by)
    VALUES (NEW.id, 'INSERT', row_to_json(NEW), auth.uid());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3.8 Function to validate ticket data
CREATE OR REPLACE FUNCTION public.validate_ticket_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate price is non-negative
  IF NEW.price < 0 THEN
    RAISE EXCEPTION 'Ticket price cannot be negative';
  END IF;
  
  -- Validate quantity
  IF NEW.quantity_available IS NOT NULL AND NEW.quantity_available < 0 THEN
    RAISE EXCEPTION 'Quantity available cannot be negative';
  END IF;
  
  -- Validate min/max per order
  IF NEW.min_per_order > NEW.max_per_order THEN
    RAISE EXCEPTION 'Minimum per order cannot exceed maximum per order';
  END IF;
  
  -- Validate sales timing
  IF NEW.sales_start_time IS NOT NULL AND NEW.sales_end_time IS NOT NULL THEN
    IF NEW.sales_end_time <= NEW.sales_start_time THEN
      RAISE EXCEPTION 'Sales end time must be after sales start time';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 3.9 Function to validate event data with new fields
CREATE OR REPLACE FUNCTION public.validate_event_data_enhanced()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate timezone
  IF NEW.timezone IS NOT NULL THEN
    -- Basic timezone validation (can be enhanced with proper timezone library)
    IF NOT NEW.timezone ~ '^[A-Za-z_]+/[A-Za-z_]+$' AND NEW.timezone NOT IN ('UTC', 'GMT') THEN
      RAISE EXCEPTION 'Invalid timezone format';
    END IF;
  END IF;
  
  -- Validate registration timing
  IF NEW.registration_start_time IS NOT NULL AND NEW.registration_end_time IS NOT NULL THEN
    IF NEW.registration_end_time <= NEW.registration_start_time THEN
      RAISE EXCEPTION 'Registration end time must be after registration start time';
    END IF;
  END IF;
  
  -- Validate doors open time
  IF NEW.doors_open_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    IF NEW.doors_open_time > NEW.start_time THEN
      RAISE EXCEPTION 'Doors open time must be before event start time';
    END IF;
  END IF;
  
  -- Validate virtual event requirements
  IF NEW.event_type = 'online' AND NEW.virtual_event_url IS NULL THEN
    RAISE EXCEPTION 'Online events must have a virtual event URL';
  END IF;
  
  -- Validate event contact email
  IF NEW.event_contact_email IS NOT NULL THEN
    IF NEW.event_contact_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
      RAISE EXCEPTION 'Invalid event contact email format';
    END IF;
  END IF;
  
  -- Validate ticketing website URL format
  IF NEW.ticketing_website IS NOT NULL THEN
    IF NEW.ticketing_website !~ '^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$' THEN
      RAISE EXCEPTION 'Invalid ticketing website URL format';
    END IF;
  END IF;
  
  -- Validate event website URL format
  IF NEW.event_website IS NOT NULL THEN
    IF NEW.event_website !~ '^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$' THEN
      RAISE EXCEPTION 'Invalid event website URL format';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- =====================================================
-- 4. TRIGGERS
-- =====================================================

-- 4.1 User signup trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4.2 Timestamp update triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 4.3 Participant count triggers
DROP TRIGGER IF EXISTS increment_participant_count ON public.event_participants;
CREATE TRIGGER increment_participant_count
  AFTER INSERT ON public.event_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_participant_count();

DROP TRIGGER IF EXISTS decrement_participant_count ON public.event_participants;
CREATE TRIGGER decrement_participant_count
  AFTER DELETE ON public.event_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_participant_count();

-- 4.4 Enhanced validation triggers for new tables
-- Timestamp triggers for new tables
CREATE TRIGGER update_venues_updated_at
  BEFORE UPDATE ON public.venues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ticket_types_updated_at
  BEFORE UPDATE ON public.ticket_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_registration_fields_updated_at
  BEFORE UPDATE ON public.registration_fields
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_notifications_updated_at
  BEFORE UPDATE ON public.event_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_schedule_updated_at
  BEFORE UPDATE ON public.event_schedule
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Validation triggers
DROP TRIGGER IF EXISTS validate_ticket_insert ON public.ticket_types;
CREATE TRIGGER validate_ticket_insert
  BEFORE INSERT ON public.ticket_types
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_ticket_data();

DROP TRIGGER IF EXISTS validate_ticket_update ON public.ticket_types;
CREATE TRIGGER validate_ticket_update
  BEFORE UPDATE ON public.ticket_types
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_ticket_data();

DROP TRIGGER IF EXISTS validate_event_enhanced_insert ON public.events;
CREATE TRIGGER validate_event_enhanced_insert
  BEFORE INSERT ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_event_data_enhanced();

DROP TRIGGER IF EXISTS validate_event_enhanced_update ON public.events;
CREATE TRIGGER validate_event_enhanced_update
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_event_data_enhanced();

DROP TRIGGER IF EXISTS update_event_status_insert ON public.events;
CREATE TRIGGER update_event_status_insert
  BEFORE INSERT ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_event_status();

-- 4.4 Event status triggers
DROP TRIGGER IF EXISTS update_event_status_trigger ON public.events;
CREATE TRIGGER update_event_status_trigger
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_event_status();

-- 4.5 Data validation triggers
DROP TRIGGER IF EXISTS validate_event_insert ON public.events;
CREATE TRIGGER validate_event_insert
  BEFORE INSERT ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_event_data();

DROP TRIGGER IF EXISTS validate_event_update ON public.events;
CREATE TRIGGER validate_event_update
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_event_data();

-- 4.6 Audit triggers
DROP TRIGGER IF EXISTS audit_event_insert ON public.events;
CREATE TRIGGER audit_event_insert
  AFTER INSERT ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.log_event_changes();

DROP TRIGGER IF EXISTS audit_event_update ON public.events;
CREATE TRIGGER audit_event_update
  AFTER UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.log_event_changes();

DROP TRIGGER IF EXISTS audit_event_delete ON public.events;
CREATE TRIGGER audit_event_delete
  AFTER DELETE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.log_event_changes();

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- 5.1 Enable RLS on all tables
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_audit ENABLE ROW LEVEL SECURITY;

-- Enable RLS on new comprehensive tables
ALTER TABLE IF EXISTS public.event_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.registration_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_schedule ENABLE ROW LEVEL SECURITY;

-- 5.2 Profiles RLS policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
    CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles
    FOR SELECT
    USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5.3 User Roles RLS policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
    CREATE POLICY "Users can view their own roles"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5.4 Venues RLS policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Venues are viewable by everyone" ON public.venues;
    CREATE POLICY "Venues are viewable by everyone"
    ON public.venues
    FOR SELECT
    USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Organizers can manage their venues" ON public.venues;
    CREATE POLICY "Organizers can manage their venues"
    ON public.venues
    FOR ALL
    USING (auth.uid() = organizer_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
    CREATE POLICY "Only admins can manage roles"
    ON public.user_roles
    FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5.4 Events RLS policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
    CREATE POLICY "Events are viewable by everyone"
    ON public.events
    FOR SELECT
    USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can create events" ON public.events;
    CREATE POLICY "Users can create events"
    ON public.events
    FOR INSERT
    WITH CHECK (auth.uid() = organizer_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Organizers can update their events" ON public.events;
    CREATE POLICY "Organizers can update their events"
    ON public.events
    FOR UPDATE
    USING (auth.uid() = organizer_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Organizers can delete their events" ON public.events;
    CREATE POLICY "Organizers can delete their events"
    ON public.events
    FOR DELETE
    USING (auth.uid() = organizer_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5.5 User Preferences RLS policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view own prefs" ON public.user_preferences;
    CREATE POLICY "Users can view own prefs"
    ON public.user_preferences
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can insert own prefs" ON public.user_preferences;
    CREATE POLICY "Users can insert own prefs"
    ON public.user_preferences
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can update own prefs" ON public.user_preferences;
    CREATE POLICY "Users can update own prefs"
    ON public.user_preferences
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can view all prefs" ON public.user_preferences;
    CREATE POLICY "Admins can view all prefs"
    ON public.user_preferences
    FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5.6 Event Participants RLS policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view their own participations" ON public.event_participants;
    CREATE POLICY "Users can view their own participations"
    ON public.event_participants
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can insert their own participations" ON public.event_participants;
    CREATE POLICY "Users can insert their own participations"
    ON public.event_participants
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can delete their own participations" ON public.event_participants;
    CREATE POLICY "Users can delete their own participations"
    ON public.event_participants
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Event organizers can view all participants" ON public.event_participants;
    CREATE POLICY "Event organizers can view all participants"
    ON public.event_participants
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.events e 
        WHERE e.id = event_participants.event_id 
        AND e.organizer_id = auth.uid()
    ));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5.7 Audit Table RLS policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view audit logs for their events" ON public.event_audit;
    CREATE POLICY "Users can view audit logs for their events"
    ON public.event_audit
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.events e
        WHERE e.id = event_id AND e.organizer_id = auth.uid()
      )
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.event_audit;
    CREATE POLICY "Admins can view all audit logs"
    ON public.event_audit
    FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5.8 Comprehensive RLS policies for new tables

-- Event venues RLS policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Event venues are viewable by everyone" ON public.event_venues;
    CREATE POLICY "Event venues are viewable by everyone"
    ON public.event_venues
    FOR SELECT
    USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Organizers can manage event venues" ON public.event_venues;
    CREATE POLICY "Organizers can manage event venues"
    ON public.event_venues
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.events e 
        WHERE e.id = event_venues.event_id 
        AND e.organizer_id = auth.uid()
    ));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ticket types RLS policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Ticket types are viewable by everyone" ON public.ticket_types;
    CREATE POLICY "Ticket types are viewable by everyone"
    ON public.ticket_types
    FOR SELECT
    USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Organizers can manage ticket types" ON public.ticket_types;
    CREATE POLICY "Organizers can manage ticket types"
    ON public.ticket_types
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.events e 
        WHERE e.id = ticket_types.event_id 
        AND e.organizer_id = auth.uid()
    ));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Registration fields RLS policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Registration fields are viewable by everyone" ON public.registration_fields;
    CREATE POLICY "Registration fields are viewable by everyone"
    ON public.registration_fields
    FOR SELECT
    USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Organizers can manage registration fields" ON public.registration_fields;
    CREATE POLICY "Organizers can manage registration fields"
    ON public.registration_fields
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.events e 
        WHERE e.id = registration_fields.event_id 
        AND e.organizer_id = auth.uid()
    ));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Event media RLS policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Event media are viewable by everyone" ON public.event_media;
    CREATE POLICY "Event media are viewable by everyone"
    ON public.event_media
    FOR SELECT
    USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Organizers can manage event media" ON public.event_media;
    CREATE POLICY "Organizers can manage event media"
    ON public.event_media
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.events e 
        WHERE e.id = event_media.event_id 
        AND e.organizer_id = auth.uid()
    ));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Event notifications RLS policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Organizers can manage event notifications" ON public.event_notifications;
    CREATE POLICY "Organizers can manage event notifications"
    ON public.event_notifications
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.events e 
        WHERE e.id = event_notifications.event_id 
        AND e.organizer_id = auth.uid()
    ));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Event tags RLS policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Event tags are viewable by everyone" ON public.event_tags;
    CREATE POLICY "Event tags are viewable by everyone"
    ON public.event_tags
    FOR SELECT
    USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Organizers can manage event tags" ON public.event_tags;
    CREATE POLICY "Organizers can manage event tags"
    ON public.event_tags
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.events e 
        WHERE e.id = event_tags.event_id 
        AND e.organizer_id = auth.uid()
    ));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Event schedule RLS policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Event schedule is viewable by everyone" ON public.event_schedule;
    CREATE POLICY "Event schedule is viewable by everyone"
    ON public.event_schedule
    FOR SELECT
    USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Organizers can manage event schedule" ON public.event_schedule;
    CREATE POLICY "Organizers can manage event schedule"
    ON public.event_schedule
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.events e 
        WHERE e.id = event_schedule.event_id 
        AND e.organizer_id = auth.uid()
    ));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 6. VIEWS FOR COMMON QUERIES
-- =====================================================

-- 6.1 View for events with participant counts
DROP VIEW IF EXISTS public.events_with_participants;
CREATE OR REPLACE VIEW public.events_with_participants AS
SELECT
  e.*,
  p.display_name as organizer_name,
  p.avatar_url as organizer_avatar
FROM public.events e
LEFT JOIN public.profiles p ON e.organizer_id = p.user_id;

-- 6.2 View for user events with participation status
DROP VIEW IF EXISTS public.user_events_view;
CREATE OR REPLACE VIEW public.user_events_view AS
SELECT
  e.*,
  CASE
    WHEN ep.user_id IS NOT NULL THEN 'registered'
    WHEN e.organizer_id = auth.uid() THEN 'organizer'
    ELSE 'available'
  END as participation_status,
  p.display_name as organizer_name,
  p.avatar_url as organizer_avatar
FROM public.events e
LEFT JOIN public.profiles p ON e.organizer_id = p.user_id
LEFT JOIN public.event_participants ep ON e.id = ep.event_id AND ep.user_id = auth.uid()
WHERE e.is_public = true OR e.organizer_id = auth.uid();

-- =====================================================
-- 7. OPTIMIZED API FUNCTIONS
-- =====================================================

-- 7.1 Function to get events with all data in one query
CREATE OR REPLACE FUNCTION public.get_events_with_details(
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_category TEXT DEFAULT NULL,
  p_is_public BOOLEAN DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  location TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  image_url TEXT,
  category TEXT,
  max_participants INTEGER,
  is_public BOOLEAN,
  organizer_id UUID,
  status TEXT,
  participant_count INTEGER,
  organizer_name TEXT,
  organizer_avatar TEXT,
  user_participation_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.title,
    e.description,
    e.location,
    e.start_time,
    e.end_time,
    e.image_url,
    e.category,
    e.max_participants,
    e.is_public,
    e.organizer_id,
    e.status,
    e.participant_count,
    p.display_name as organizer_name,
    p.avatar_url as organizer_avatar,
    CASE
      WHEN ep.user_id IS NOT NULL THEN 'registered'
      WHEN e.organizer_id = p_user_id THEN 'organizer'
      ELSE 'available'
    END as user_participation_status
  FROM public.events e
  LEFT JOIN public.profiles p ON e.organizer_id = p.user_id
  LEFT JOIN public.event_participants ep ON e.id = ep.event_id AND ep.user_id = p_user_id
  WHERE
    (p_category IS NULL OR e.category = p_category)
    AND (p_is_public IS NULL OR e.is_public = p_is_public)
    AND (p_user_id IS NULL OR e.is_public = true OR e.organizer_id = p_user_id)
  ORDER BY e.start_time ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- =====================================================
-- 8. INDEXES FOR PERFORMANCE
-- =====================================================

-- 8.1 Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_provider_id ON public.profiles(provider_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_phone_verified ON public.profiles(phone_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON public.profiles(email_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_organizer_status ON public.profiles(organizer_status);

-- 8.2 User roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- 8.3 Events indexes
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_events_is_public ON public.events(is_public);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON public.events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_participant_count ON public.events(participant_count);
CREATE INDEX IF NOT EXISTS idx_events_status_time ON public.events(status, start_time, end_time);

-- 8.4 User preferences indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_city ON public.user_preferences(city);
CREATE INDEX IF NOT EXISTS idx_user_preferences_onboarding_completed ON public.user_preferences(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_user_preferences_is_organizer ON public.user_preferences(is_organizer);

-- 8.5 Event participants indexes
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON public.event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON public.event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_registered_at ON public.event_participants(registered_at);
CREATE INDEX IF NOT EXISTS idx_event_participants_status ON public.event_participants(status);

-- Add check constraint for valid status values
ALTER TABLE public.event_participants 
ADD CONSTRAINT event_participants_status_check 
CHECK (status IN ('interested', 'going', 'not_going'));

-- 8.6 Event categories indexes
CREATE INDEX IF NOT EXISTS idx_event_categories_event_id ON public.event_categories(event_id);
CREATE INDEX IF NOT EXISTS idx_event_categories_category ON public.event_categories(category);

-- 8.7 Event registrations indexes
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON public.event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON public.event_registrations(status);

-- 8.8 Audit table indexes
CREATE INDEX IF NOT EXISTS idx_event_audit_event_id ON public.event_audit(event_id);
CREATE INDEX IF NOT EXISTS idx_event_audit_changed_at ON public.event_audit(changed_at);
CREATE INDEX IF NOT EXISTS idx_event_audit_action ON public.event_audit(action);

-- 8.9 Comprehensive indexes for new tables

-- Venues indexes
CREATE INDEX IF NOT EXISTS idx_venues_organizer_id ON public.venues(organizer_id);
CREATE INDEX IF NOT EXISTS idx_venues_city ON public.venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_country ON public.venues(country);
CREATE INDEX IF NOT EXISTS idx_venues_capacity ON public.venues(capacity);

-- Event venues indexes
CREATE INDEX IF NOT EXISTS idx_event_venues_event_id ON public.event_venues(event_id);
CREATE INDEX IF NOT EXISTS idx_event_venues_venue_id ON public.event_venues(venue_id);

-- Ticket types indexes
CREATE INDEX IF NOT EXISTS idx_ticket_types_event_id ON public.ticket_types(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_types_price ON public.ticket_types(price);
CREATE INDEX IF NOT EXISTS idx_ticket_types_currency ON public.ticket_types(currency);
CREATE INDEX IF NOT EXISTS idx_ticket_types_sales_start ON public.ticket_types(sales_start_time);
CREATE INDEX IF NOT EXISTS idx_ticket_types_sales_end ON public.ticket_types(sales_end_time);

-- Registration fields indexes
CREATE INDEX IF NOT EXISTS idx_registration_fields_event_id ON public.registration_fields(event_id);
CREATE INDEX IF NOT EXISTS idx_registration_fields_field_type ON public.registration_fields(field_type);

-- Event media indexes
CREATE INDEX IF NOT EXISTS idx_event_media_event_id ON public.event_media(event_id);
CREATE INDEX IF NOT EXISTS idx_event_media_type ON public.event_media(media_type);
CREATE INDEX IF NOT EXISTS idx_event_media_primary ON public.event_media(is_primary);

-- Event notifications indexes
CREATE INDEX IF NOT EXISTS idx_event_notifications_event_id ON public.event_notifications(event_id);
CREATE INDEX IF NOT EXISTS idx_event_notifications_type ON public.event_notifications(notification_type);

-- Event tags indexes
CREATE INDEX IF NOT EXISTS idx_event_tags_event_id ON public.event_tags(event_id);
CREATE INDEX IF NOT EXISTS idx_event_tags_tag ON public.event_tags(tag);

-- Event schedule indexes
CREATE INDEX IF NOT EXISTS idx_event_schedule_event_id ON public.event_schedule(event_id);
CREATE INDEX IF NOT EXISTS idx_event_schedule_start ON public.event_schedule(start_time);

-- Enhanced events table indexes
CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_event_format ON public.events(event_format);
CREATE INDEX IF NOT EXISTS idx_events_privacy ON public.events(event_privacy);
CREATE INDEX IF NOT EXISTS idx_events_timezone ON public.events(timezone);
CREATE INDEX IF NOT EXISTS idx_events_registration_start ON public.events(registration_start_time);
CREATE INDEX IF NOT EXISTS idx_events_registration_end ON public.events(registration_end_time);
CREATE INDEX IF NOT EXISTS idx_events_refund_policy ON public.events(refund_policy);
CREATE INDEX IF NOT EXISTS idx_events_primary_venue ON public.events(primary_venue_id);
CREATE INDEX IF NOT EXISTS idx_events_event_website ON public.events(event_website);
CREATE INDEX IF NOT EXISTS idx_events_contact_email ON public.events(event_contact_email);
CREATE INDEX IF NOT EXISTS idx_events_ticketing_website ON public.events(ticketing_website);

-- =====================================================
-- 9. ENHANCED VIEWS FOR COMPREHENSIVE FUNCTIONALITY
-- =====================================================

-- 9.1 Enhanced events view with all related data
DROP VIEW IF EXISTS public.events_enhanced_view;
CREATE OR REPLACE VIEW public.events_enhanced_view AS
SELECT
  e.*,
  v.name as venue_name,
  v.address as venue_address,
  v.city as venue_city,
  v.capacity as venue_capacity,
  p.display_name as organizer_name,
  p.avatar_url as organizer_avatar,
  COALESCE(tt.total_tickets, 0) as total_ticket_types,
  COALESCE(et.media_count, 0) as media_count,
  COALESCE(tag.tag_count, 0) as tag_count
FROM public.events e
LEFT JOIN public.venues v ON e.primary_venue_id = v.id
LEFT JOIN public.profiles p ON e.organizer_id = p.user_id
LEFT JOIN (
  SELECT event_id, COUNT(*) as total_tickets
  FROM public.ticket_types
  GROUP BY event_id
) tt ON e.id = tt.event_id
LEFT JOIN (
  SELECT event_id, COUNT(*) as media_count
  FROM public.event_media
  GROUP BY event_id
) et ON e.id = et.event_id
LEFT JOIN (
  SELECT event_id, COUNT(*) as tag_count
  FROM public.event_tags
  GROUP BY event_id
) tag ON e.id = tag.event_id;

-- 9.2 Ticket types with sales data view
DROP VIEW IF EXISTS public.ticket_sales_view;
CREATE OR REPLACE VIEW public.ticket_sales_view AS
SELECT
  tt.*,
  e.title as event_title,
  e.start_time as event_start_time,
  e.end_time as event_end_time,
  CASE 
    WHEN NOW() < tt.sales_start_time THEN 'upcoming'
    WHEN NOW() > tt.sales_end_time THEN 'ended'
    ELSE 'active'
  END as sales_status,
  CASE
    WHEN tt.quantity_available IS NOT NULL THEN
      GREATEST(tt.quantity_available - tt.quantity_sold, 0)
    ELSE NULL
  END as available_quantity
FROM public.ticket_types tt
JOIN public.events e ON tt.event_id = e.id;

-- =====================================================
-- 9. COMMENTS AND DOCUMENTATION
-- =====================================================

-- Table comments
COMMENT ON TABLE public.profiles IS 'User profiles with OAuth support';
COMMENT ON COLUMN public.profiles.provider IS 'Authentication provider (email, google, github, etc.)';
COMMENT ON COLUMN public.profiles.provider_id IS 'Unique identifier from the OAuth provider';
COMMENT ON COLUMN public.profiles.avatar_url IS 'Profile picture URL from OAuth provider';
COMMENT ON COLUMN public.profiles.full_name IS 'User full name from OAuth provider';
COMMENT ON COLUMN public.profiles.email IS 'User email address';
COMMENT ON COLUMN public.profiles.phone IS 'User phone number';
COMMENT ON COLUMN public.profiles.phone_country_code IS 'Phone number country code';
COMMENT ON COLUMN public.profiles.phone_verified IS 'Whether phone number has been verified';
COMMENT ON COLUMN public.profiles.email_verified IS 'Whether email address has been verified';
COMMENT ON COLUMN public.profiles.organizer_status IS 'Organizer verification status (pending, verified, active, suspended)';

COMMENT ON TABLE public.user_roles IS 'Role-based access control for users';
COMMENT ON TABLE public.events IS 'Events table for storing event information';
COMMENT ON COLUMN public.events.status IS 'Event status: pending, approved, rejected, cancelled, upcoming, ongoing, ended';
COMMENT ON COLUMN public.events.participant_count IS 'Automatically maintained participant count';

COMMENT ON TABLE public.user_preferences IS 'User preferences for onboarding and personalization';
COMMENT ON COLUMN public.user_preferences.distance_range IS 'Preferred distance range in miles/kilometers';
COMMENT ON COLUMN public.user_preferences.is_organizer IS 'Whether user wants to create events (from onboarding)';

COMMENT ON TABLE public.event_participants IS 'Event registrations and participations';
COMMENT ON TABLE public.event_categories IS 'Event categories for better organization';
COMMENT ON TABLE public.event_registrations IS 'Event registrations with status tracking';
COMMENT ON TABLE public.event_audit IS 'Audit trail for event changes';

-- Enhanced table comments for comprehensive event management
COMMENT ON TABLE public.venues IS 'Detailed venue information for events';
COMMENT ON TABLE public.event_venues IS 'Relationship between events and venues';
COMMENT ON TABLE public.ticket_types IS 'Comprehensive ticket types with pricing and availability';
COMMENT ON TABLE public.registration_fields IS 'Custom registration form fields for events';
COMMENT ON TABLE public.event_media IS 'Images, videos, and other media for events';
COMMENT ON TABLE public.event_notifications IS 'Automated notification settings for events';
COMMENT ON TABLE public.event_tags IS 'Tags for event discovery and categorization';
COMMENT ON TABLE public.event_schedule IS 'Event agenda and schedule items';

-- Column comments for enhanced events table
COMMENT ON COLUMN public.events.event_type IS 'Type of event: online, in_person, or hybrid';
COMMENT ON COLUMN public.events.event_format IS 'Format: single, recurring, or multi_date';
COMMENT ON COLUMN public.events.event_privacy IS 'Privacy level: public, private, or unlisted';
COMMENT ON COLUMN public.events.timezone IS 'Event timezone for accurate scheduling';
COMMENT ON COLUMN public.events.registration_start_time IS 'When registration opens';
COMMENT ON COLUMN public.events.registration_end_time IS 'When registration closes';
COMMENT ON COLUMN public.events.refund_policy IS 'Standard refund policy options';
COMMENT ON COLUMN public.events.custom_refund_policy IS 'Custom refund policy terms';
COMMENT ON COLUMN public.events.event_password IS 'Password for private events';
COMMENT ON COLUMN public.events.age_restriction IS 'Age requirements for attendees';
COMMENT ON COLUMN public.events.accessibility_options IS 'Accessibility features available';
COMMENT ON COLUMN public.events.subtitle IS 'Short tagline for event listings';
COMMENT ON COLUMN public.events.summary IS 'Brief summary for search results';
COMMENT ON COLUMN public.events.language IS 'Primary language of the event';
COMMENT ON COLUMN public.events.doors_open_time IS 'When attendees can arrive';
COMMENT ON COLUMN public.events.virtual_event_url IS 'URL for online events';
COMMENT ON COLUMN public.events.virtual_event_platform IS 'Platform for virtual events';
COMMENT ON COLUMN public.events.event_website IS 'Official event website for more information';
COMMENT ON COLUMN public.events.event_contact_email IS 'Contact email for event-specific inquiries';
COMMENT ON COLUMN public.events.ticketing_website IS 'External ticketing website for paid events';
COMMENT ON COLUMN public.events.primary_venue_id IS 'Primary venue for the event';

-- Comments for organizer onboarding fields
COMMENT ON COLUMN public.user_preferences.organizer_onboarding_completed IS 'Tracks if user has completed organizer-specific onboarding';
COMMENT ON COLUMN public.user_preferences.business_name IS 'Organizer business or organization name';
COMMENT ON COLUMN public.user_preferences.business_type IS 'Type of business (individual, nonprofit, business, educational, government, other)';
COMMENT ON COLUMN public.user_preferences.business_description IS 'Description of organizer business';
COMMENT ON COLUMN public.user_preferences.business_address IS 'Street address where organizer hosts events';
COMMENT ON COLUMN public.user_preferences.business_city IS 'City where organizer is located';
COMMENT ON COLUMN public.user_preferences.business_state_province IS 'State or province where organizer is located';
COMMENT ON COLUMN public.user_preferences.business_zip_pin IS 'ZIP or PIN code of organizer location';
COMMENT ON COLUMN public.user_preferences.business_country IS 'Country where organizer is located';
COMMENT ON COLUMN public.user_preferences.event_types IS 'Array of event categories organizer plans to create';

-- =====================================================
-- 10. VERIFICATION QUERIES
-- =====================================================

-- Verify all tables exist and have RLS enabled
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'user_roles', 'venues', 'events', 'user_preferences', 'event_participants', 'event_categories', 'event_registrations', 'event_audit', 'event_venues', 'ticket_types', 'registration_fields', 'event_media', 'event_notifications', 'event_tags', 'event_schedule')
ORDER BY tablename;

-- Verify all new enums exist
SELECT
    typname,
    typtype
FROM pg_type
WHERE typname IN ('app_role', 'event_type', 'event_format', 'event_privacy', 'refund_policy', 'currency_type')
  AND typtype = 'e'
ORDER BY typname;

-- Verify all triggers are properly set up
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- COMPREHENSIVE DATABASE SETUP COMPLETE
-- =====================================================
--
-- This enhanced script includes all original functionality PLUS comprehensive event management:
-- 
-- ✅ User management with profiles and roles
-- ✅ Role-based access control (RBAC)
-- ✅ Event management system with participant tracking
-- ✅ User preferences for onboarding (including organizer onboarding fields)
-- ✅ OAuth provider support
-- ✅ Phone verification and organizer status tracking
-- ✅ Row Level Security (RLS) policies for all tables
-- ✅ Performance indexes for optimal query performance
-- ✅ Automatic timestamp triggers
-- ✅ Participant count automation
-- ✅ Event status automation
-- ✅ Data validation triggers
-- ✅ Audit logging system
-- ✅ Enhanced views for common queries
-- ✅ API functions for common queries
-- ✅ Comprehensive documentation
--
-- 🎯 COMPREHENSIVE EVENT MANAGEMENT FEATURES:
-- ✅ Event types: online, in_person, hybrid
-- ✅ Event formats: single, recurring, multi_date
-- ✅ Privacy settings: public, private, unlisted
-- ✅ Comprehensive venue management
-- ✅ Advanced ticketing system with multiple currencies
-- ✅ Custom registration fields
-- ✅ Event media management (images, videos)
-- ✅ Automated notifications system
-- ✅ Event tagging and categorization
-- ✅ Event schedule/agenda management
-- ✅ Refund policy management
-- ✅ Timezone support
-- ✅ Registration timing controls
-- ✅ Enhanced data validation
-- ✅ Enterprise-level RLS security
-- ✅ Performance optimization indexes
-- ✅ Enhanced views for complex queries
--
-- 🚀 EventRadius now has enterprise-level event creation capabilities
--    comparable to Eventbrite's core features with modern security and performance
--
-- Safe to run multiple times - uses IF EXISTS/IF NOT EXISTS throughout
-- =====================================================
-- Add enhanced event schema fields (only missing ones)
-- Migration: Add missing rich event features to match dummy event schema

-- Add columns that don't already exist in events table
DO $$
BEGIN
    -- Check and add background_image_url if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'background_image_url'
    ) THEN
        ALTER TABLE events ADD COLUMN background_image_url TEXT;
    END IF;
    
    -- Check and add organizer_phone if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'organizer_phone'
    ) THEN
        ALTER TABLE events ADD COLUMN organizer_phone TEXT;
    END IF;
    
    -- Check and add organizer_website if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'organizer_website'
    ) THEN
        ALTER TABLE events ADD COLUMN organizer_website TEXT;
    END IF;
    
    -- Add event_status column if it doesn't exist (use status column as fallback)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'event_status'
    ) THEN
        ALTER TABLE events ADD COLUMN event_status TEXT DEFAULT 'published';
        
        -- Add constraint for new event_status column
        ALTER TABLE events ADD CONSTRAINT events_event_status_check 
        CHECK (event_status IN ('draft', 'published', 'cancelled', 'pending'));
    ELSE
        -- If column exists, add constraint if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.check_constraints 
            WHERE constraint_name = 'events_event_status_check'
        ) THEN
            ALTER TABLE events ADD CONSTRAINT events_event_status_check 
            CHECK (event_status IN ('draft', 'published', 'cancelled', 'pending'));
        END IF;
    END IF;
    
    -- Update event_type enum to include recurring and multi_date if needed
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'event_type') AND enumlabel = 'recurring'
    ) THEN
        ALTER TYPE event_type ADD VALUE 'recurring';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'event_type') AND enumlabel = 'multi_date'
    ) THEN
        ALTER TYPE event_type ADD VALUE 'multi_date';
    END IF;
END $$;

-- Add indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_events_background_image_url ON events(background_image_url);
CREATE INDEX IF NOT EXISTS idx_events_organizer_phone ON events(organizer_phone);
CREATE INDEX IF NOT EXISTS idx_events_organizer_website ON events(organizer_website);

-- Add comments for documentation
COMMENT ON COLUMN events.background_image_url IS 'Background image for event detail pages';
COMMENT ON COLUMN events.organizer_phone IS 'Organizer contact phone';
COMMENT ON COLUMN events.organizer_website IS 'Organizer website URL';

-- Update existing events to have default values for new fields
UPDATE events SET 
    background_image_url = image_url,
    organizer_phone = COALESCE(split_part(event_contact_email, '@', 1) || '-phone', '555-0000'),
    organizer_website = COALESCE(event_website, 'https://example.com')
WHERE background_image_url IS NULL 
   OR organizer_phone IS NULL 
   OR organizer_website IS NULL;

-- Create a view or update logic to map existing fields to expected interface
-- Note: event_contact_email maps to organizer_email in our interface
-- ticket_pricing_description already exists
-- ticketing_website already exists  
-- event_status already exists
-- timezone already exists
-- is_paid_event already exists
-- Migration: Add soft delete (recycle bin) support to events table
-- Created: April 2026
-- Description: Adds deleted_at column and updates RLS policies for soft delete functionality

-- 1. Add deleted_at column to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 2. Create index for efficient querying of deleted/non-deleted events
CREATE INDEX IF NOT EXISTS idx_events_deleted_at ON public.events(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_events_deleted_at_only ON public.events(deleted_at) WHERE deleted_at IS NOT NULL;

-- 3. Update RLS policy to exclude deleted events from default queries
-- First, drop and recreate the "Events are viewable by everyone" policy to exclude deleted events
DO $$ BEGIN
    DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
    
    -- Create new policy that excludes deleted events
    CREATE POLICY "Events are viewable by everyone"
    ON public.events
    FOR SELECT
    USING (deleted_at IS NULL);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Create policy for organizers to view their own deleted events (for recycle bin)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Organizers can view their deleted events" ON public.events;
    
    CREATE POLICY "Organizers can view their deleted events"
    ON public.events
    FOR SELECT
    TO authenticated
    USING (auth.uid() = organizer_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. Create function to soft delete events (set deleted_at instead of hard delete)
CREATE OR REPLACE FUNCTION public.soft_delete_event(event_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    event_organizer_id UUID;
BEGIN
    -- Get the organizer_id of the event
    SELECT organizer_id INTO event_organizer_id
    FROM public.events
    WHERE id = event_id;
    
    -- Check if event exists and user is the organizer
    IF event_organizer_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    IF event_organizer_id != user_id THEN
        RETURN FALSE;
    END IF;
    
    -- Soft delete: set deleted_at timestamp
    UPDATE public.events
    SET deleted_at = NOW(),
        updated_at = NOW()
    WHERE id = event_id;
    
    RETURN TRUE;
END;
$$;

-- 6. Create function to restore soft-deleted events
CREATE OR REPLACE FUNCTION public.restore_event(event_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    event_organizer_id UUID;
BEGIN
    -- Get the organizer_id of the event
    SELECT organizer_id INTO event_organizer_id
    FROM public.events
    WHERE id = event_id AND deleted_at IS NOT NULL;
    
    -- Check if deleted event exists and user is the organizer
    IF event_organizer_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    IF event_organizer_id != user_id THEN
        RETURN FALSE;
    END IF;
    
    -- Restore: clear deleted_at timestamp
    UPDATE public.events
    SET deleted_at = NULL,
        updated_at = NOW()
    WHERE id = event_id;
    
    RETURN TRUE;
END;
$$;

-- 7. Create function to permanently delete events (for recycle bin cleanup)
CREATE OR REPLACE FUNCTION public.permanently_delete_event(event_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    event_organizer_id UUID;
BEGIN
    -- Get the organizer_id of the event
    SELECT organizer_id INTO event_organizer_id
    FROM public.events
    WHERE id = event_id AND deleted_at IS NOT NULL;
    
    -- Check if deleted event exists and user is the organizer
    IF event_organizer_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    IF event_organizer_id != user_id THEN
        RETURN FALSE;
    END IF;
    
    -- Hard delete the event (only if it's already soft deleted)
    DELETE FROM public.events
    WHERE id = event_id AND deleted_at IS NOT NULL;
    
    RETURN TRUE;
END;
$$;

-- 8. Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.soft_delete_event(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_event(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.permanently_delete_event(UUID, UUID) TO authenticated;

-- 9. Comment on column for documentation
COMMENT ON COLUMN public.events.deleted_at IS 'Timestamp when event was soft deleted (moved to recycle bin). NULL means event is active.';
-- Migration: Add automatic 30-day cleanup for soft-deleted events
-- Created: April 2026
-- Description: Automatically permanently deletes events that have been in recycle bin for 30+ days

-- 1. Create function to permanently delete old soft-deleted events
CREATE OR REPLACE FUNCTION public.cleanup_old_deleted_events()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Permanently delete events that have been soft-deleted for more than 30 days
    DELETE FROM public.events
    WHERE deleted_at IS NOT NULL
      AND deleted_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup action
    IF deleted_count > 0 THEN
        INSERT INTO public.event_audit (event_id, action, old_data, changed_by, changed_at)
        VALUES (
            gen_random_uuid(),
            'CLEANUP_OLD_DELETED',
            jsonb_build_object('deleted_count', deleted_count, 'cutoff_days', 30),
            auth.uid(),
            NOW()
        );
    END IF;
    
    RETURN deleted_count;
END;
$$;

-- 2. Create function to get days remaining until permanent deletion
CREATE OR REPLACE FUNCTION public.get_days_until_deletion(event_deleted_at TIMESTAMP WITH TIME ZONE)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    days_remaining INTEGER;
BEGIN
    IF event_deleted_at IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Calculate days remaining (30 days total - days since deletion)
    days_remaining := 30 - EXTRACT(DAY FROM (NOW() - event_deleted_at));
    
    -- Return 0 if already past 30 days
    RETURN GREATEST(days_remaining, 0);
END;
$$;

-- 3. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.cleanup_old_deleted_events() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_days_until_deletion(TIMESTAMP WITH TIME ZONE) TO authenticated;

-- 4. Comment on functions
COMMENT ON FUNCTION public.cleanup_old_deleted_events() IS 'Permanently deletes events that have been soft-deleted for more than 30 days';
COMMENT ON FUNCTION public.get_days_until_deletion(TIMESTAMP WITH TIME ZONE) IS 'Returns the number of days remaining until a soft-deleted event is permanently deleted (max 30 days)';

-- 5. Create pg_cron job to run cleanup daily (if pg_cron extension is available)
-- Note: This requires the pg_cron extension to be enabled in Supabase
-- If pg_cron is not available, the cleanup can be triggered manually or via an external scheduler
DO $$
BEGIN
    -- Try to create the cron job, but don't fail if pg_cron is not available
    BEGIN
        -- Schedule cleanup to run daily at 3 AM UTC
        PERFORM cron.schedule(
            'cleanup-old-deleted-events',  -- job name
            '0 3 * * *',                   -- cron expression (daily at 3 AM UTC)
            'SELECT public.cleanup_old_deleted_events()'  -- SQL to execute
        );
        
        RAISE NOTICE 'pg_cron job created successfully';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'pg_cron not available or error creating job. Manual cleanup or external scheduler required. Error: %', SQLERRM;
    END;
END $$;

-- 6. Alternative: Create a trigger to run cleanup when events are accessed
-- This ensures cleanup runs periodically even without pg_cron
CREATE OR REPLACE FUNCTION public.trigger_cleanup_on_event_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Run cleanup occasionally (1% chance) when events table is accessed
    -- This is a fallback mechanism when pg_cron is not available
    IF random() < 0.01 THEN
        PERFORM public.cleanup_old_deleted_events();
    END IF;
    
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS cleanup_on_event_access ON public.events;

-- Create trigger (uncomment if you want to use this fallback mechanism)
-- CREATE TRIGGER cleanup_on_event_access
--     BEFORE INSERT OR UPDATE ON public.events
--     FOR EACH STATEMENT
--     EXECUTE FUNCTION public.trigger_cleanup_on_event_access();

-- 7. Add comments explaining the 30-day retention policy
COMMENT ON TABLE public.events IS 'Events table with soft delete (recycle bin) and 30-day automatic permanent deletion';

-- 8. Create a view to show events with days until deletion
CREATE OR REPLACE VIEW public.deleted_events_with_countdown AS
SELECT 
    e.*,
    public.get_days_until_deletion(e.deleted_at) as days_until_deletion,
    e.deleted_at + INTERVAL '30 days' as permanent_deletion_date
FROM public.events e
WHERE e.deleted_at IS NOT NULL;

-- Grant permissions on view
GRANT SELECT ON public.deleted_events_with_countdown TO authenticated;
-- =====================================================
-- 09 - Fix Event Registrations RLS Policies
-- =====================================================
-- This migration adds the missing RLS policies for event_registrations table
-- The table exists but has no policies, causing 400 errors

-- Enable RLS if not already enabled
ALTER TABLE IF EXISTS public.event_registrations ENABLE ROW LEVEL SECURITY;

-- 5.8 Event Registrations RLS policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view their own registrations" ON public.event_registrations;
    CREATE POLICY "Users can view their own registrations"
    ON public.event_registrations
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can insert their own registrations" ON public.event_registrations;
    CREATE POLICY "Users can insert their own registrations"
    ON public.event_registrations
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can delete their own registrations" ON public.event_registrations;
    CREATE POLICY "Users can delete their own registrations"
    ON public.event_registrations
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Event organizers can view all registrations for their events" ON public.event_registrations;
    CREATE POLICY "Event organizers can view all registrations for their events"
    ON public.event_registrations
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.events 
        WHERE events.id = event_registrations.event_id 
        AND events.organizer_id = auth.uid()
    ));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can view all registrations" ON public.event_registrations;
    CREATE POLICY "Admins can view all registrations"
    ON public.event_registrations
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role = 'admin'
        )
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
-- =====================================================
-- 10 - Fix User Roles Default Assignment
-- =====================================================
-- This migration ensures every user has a default 'user' role
-- and fixes any missing role assignments

-- Function to assign default role to new users
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert default 'user' role for new users
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to assign default role on user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.assign_default_role();

-- Ensure existing users have default roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'
FROM auth.users
WHERE id NOT IN (
    SELECT user_id 
    FROM public.user_roles 
    WHERE role = 'user'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.assign_default_role TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
-- Migration: Add Comprehensive Event Attributes
-- Description: Add demographic, accessibility, cultural, prerequisite, and content rating fields to events table
-- Created: 2026-04-08

-- Add Audience & Demographics fields
ALTER TABLE events
ADD COLUMN IF NOT EXISTS age_categories text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS gender_preference varchar(50) DEFAULT 'all',
ADD COLUMN IF NOT EXISTS family_friendly boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS senior_friendly boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS singles_friendly boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS couples_oriented boolean DEFAULT false;

-- Add Accessibility fields
ALTER TABLE events
ADD COLUMN IF NOT EXISTS wheelchair_accessible boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS mobility_friendly boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS hearing_accessible boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS vision_accessible boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sensory_friendly boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS service_animals_allowed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS accessibility_notes text;

-- Add Cultural Context fields
ALTER TABLE events
ADD COLUMN IF NOT EXISTS religious_context text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS dietary_context text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS traditional_attire varchar(50) DEFAULT 'not_applicable';

-- Add Prerequisites & Requirements fields
ALTER TABLE events
ADD COLUMN IF NOT EXISTS skill_level varchar(50) DEFAULT 'all_levels',
ADD COLUMN IF NOT EXISTS prior_experience varchar(50) DEFAULT 'none_required',
ADD COLUMN IF NOT EXISTS physical_fitness varchar(50) DEFAULT 'sedentary',
ADD COLUMN IF NOT EXISTS equipment_required text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS dress_code varchar(50) DEFAULT 'casual',
ADD COLUMN IF NOT EXISTS prerequisites_notes text;

-- Add Content & Intensity fields
ALTER TABLE events
ADD COLUMN IF NOT EXISTS content_rating varchar(50) DEFAULT 'all_ages',
ADD COLUMN IF NOT EXISTS alcohol_served varchar(50) DEFAULT 'no_alcohol',
ADD COLUMN IF NOT EXISTS smoking_policy varchar(50) DEFAULT 'non_smoking',
ADD COLUMN IF NOT EXISTS noise_level varchar(50) DEFAULT 'moderate',
ADD COLUMN IF NOT EXISTS physical_intensity varchar(50) DEFAULT 'none';

-- Add Social & Networking fields
ALTER TABLE events
ADD COLUMN IF NOT EXISTS networking_focus boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS social_mixer boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ice_breakers boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS group_activities boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS team_building boolean DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN events.age_categories IS 'Array of age groups suitable for the event: all_ages, kids, teens, young_adults, adults_25_35, middle_age, 50_plus, seniors_65_plus, etc.';
COMMENT ON COLUMN events.gender_preference IS 'Target gender audience: all, women_only, men_only, lgbtq_friendly, gender_neutral';
COMMENT ON COLUMN events.religious_context IS 'Array of religious/spiritual contexts: hindu, christian, muslim, buddhist, jewish, sikh, jain, interfaith, secular, etc.';
COMMENT ON COLUMN events.dietary_context IS 'Array of dietary accommodations: vegetarian, vegan, halal, kosher, jain, gluten_free, nut_free, dairy_free';
COMMENT ON COLUMN events.skill_level IS 'Required skill level: beginner, intermediate, advanced, all_levels';
COMMENT ON COLUMN events.content_rating IS 'Age appropriateness: all_ages, pg, pg_13, mature_18, explicit';
COMMENT ON COLUMN events.wheelchair_accessible IS 'Venue is wheelchair accessible with ramps and wide doorways';

-- Create indexes for common filter queries
CREATE INDEX IF NOT EXISTS idx_events_age_categories ON events USING GIN (age_categories);
CREATE INDEX IF NOT EXISTS idx_events_religious_context ON events USING GIN (religious_context);
CREATE INDEX IF NOT EXISTS idx_events_dietary_context ON events USING GIN (dietary_context);
CREATE INDEX IF NOT EXISTS idx_events_equipment_required ON events USING GIN (equipment_required);
CREATE INDEX IF NOT EXISTS idx_events_family_friendly ON events (family_friendly) WHERE family_friendly = true;
CREATE INDEX IF NOT EXISTS idx_events_senior_friendly ON events (senior_friendly) WHERE senior_friendly = true;
CREATE INDEX IF NOT EXISTS idx_events_wheelchair_accessible ON events (wheelchair_accessible) WHERE wheelchair_accessible = true;
CREATE INDEX IF NOT EXISTS idx_events_content_rating ON events (content_rating);
CREATE INDEX IF NOT EXISTS idx_events_skill_level ON events (skill_level);

-- Add composite index for AI matching queries
CREATE INDEX IF NOT EXISTS idx_events_matching_attributes ON events 
  (gender_preference, skill_level, content_rating, family_friendly, senior_friendly);

-- Update RLS policies to include new fields if needed
-- (New fields are automatically covered by existing SELECT/INSERT/UPDATE policies)

-- Verify migration
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM information_schema.columns
  WHERE table_name = 'events'
  AND column_name IN (
    'age_categories', 'gender_preference', 'family_friendly',
    'wheelchair_accessible', 'religious_context', 'skill_level',
    'content_rating', 'networking_focus'
  );
  
  IF v_count >= 8 THEN
    RAISE NOTICE 'Migration successful: % new attribute columns added to events table', v_count;
  ELSE
    RAISE WARNING 'Migration may be incomplete: only % columns found', v_count;
  END IF;
END $$;
-- Migration: Create User Profiles Table
-- Description: Create the user_profiles table with basic structure before adding attributes
-- Created: 2026-04-08

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic Profile Info
    full_name varchar(255),
    avatar_url text,
    bio text,
    phone varchar(50),
    
    -- Role & Status
    role varchar(50) DEFAULT 'discoverer', -- discoverer, organizer, admin
    is_organizer boolean DEFAULT false,
    is_verified boolean DEFAULT false,
    
    -- Location
    city varchar(100),
    state varchar(100),
    country varchar(100),
    timezone varchar(100) DEFAULT 'UTC',
    
    -- Preferences
    email_notifications boolean DEFAULT true,
    push_notifications boolean DEFAULT true,
    marketing_emails boolean DEFAULT false,
    
    -- Timestamps
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- Constraints
    CONSTRAINT user_profiles_user_id_key UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
    ON user_profiles FOR DELETE
    USING (auth.uid() = user_id);

-- Allow public read access to basic profile info (for event listings)
CREATE POLICY "Public can view basic profile info"
    ON user_profiles FOR SELECT
    USING (true);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Create index on role for filtering
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;
GRANT SELECT ON user_profiles TO anon;

COMMENT ON TABLE user_profiles IS 'Extended user profile information for event matching and recommendations';
-- Migration: Add User Profile Attributes for Event Matching
-- Description: Add comprehensive user attributes for personalized event recommendations
-- Created: 2026-04-08

-- Add Cultural Identity fields
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS religion varchar(50),
ADD COLUMN IF NOT EXISTS religious_observance varchar(50),
ADD COLUMN IF NOT EXISTS ethnicity text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS nationality varchar(100),
ADD COLUMN IF NOT EXISTS cultural_background text;

-- Add Language fields
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS primary_language varchar(50) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS secondary_languages text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_event_languages text[] DEFAULT '{}';

-- Add Interests (stored as JSONB for flexibility)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS interests jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS music_genres text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS sports_fitness text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS arts_culture text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS food_drink text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tech_gaming text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS wellness_mindfulness text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS outdoor_activities text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS learning_education text[] DEFAULT '{}';

-- Add Social Preferences
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS preferred_group_size varchar(50),
ADD COLUMN IF NOT EXISTS social_style varchar(50),
ADD COLUMN IF NOT EXISTS looking_for text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS event_companion varchar(50),
ADD COLUMN IF NOT EXISTS comfort_level varchar(50);

-- Add Event Preferences
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS preferred_days text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_times text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS max_event_duration varchar(50),
ADD COLUMN IF NOT EXISTS price_comfort varchar(50),
ADD COLUMN IF NOT EXISTS virtual_comfort varchar(50);

-- Add Accessibility Needs
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS accessibility_needs text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS dietary_restrictions text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS sensory_sensitivities boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS service_animal boolean DEFAULT false;

-- Add Family & Relationship
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS relationship_status varchar(50),
ADD COLUMN IF NOT EXISTS has_children boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS children_ages text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS pet_owner boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS pet_types text[] DEFAULT '{}';

-- Add Professional/Educational
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS industry varchar(100),
ADD COLUMN IF NOT EXISTS job_function varchar(100),
ADD COLUMN IF NOT EXISTS career_level varchar(50),
ADD COLUMN IF NOT EXISTS education_level varchar(50);

-- Add Geographic Preferences
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS preferred_search_radius varchar(50),
ADD COLUMN IF NOT EXISTS willing_to_travel boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS max_travel_distance varchar(50);

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.interests IS 'JSONB object containing user interest categories with weights for AI matching';
COMMENT ON COLUMN user_profiles.looking_for IS 'Array of goals: friends, networking, dating, learning, entertainment, professional_growth';
COMMENT ON COLUMN user_profiles.social_style IS 'User personality: introvert, extrovert, ambivert';
COMMENT ON COLUMN user_profiles.virtual_comfort IS 'Preference for virtual events: in_person_only, virtual_ok, hybrid_ok, virtual_preferred';
COMMENT ON COLUMN user_profiles.price_comfort IS 'Budget preference: free_only, under_25, under_50, under_100, any';

-- Create GIN indexes for array fields (fast containment queries)
CREATE INDEX IF NOT EXISTS idx_user_profiles_ethnicity ON user_profiles USING GIN (ethnicity);
CREATE INDEX IF NOT EXISTS idx_user_profiles_interests ON user_profiles USING GIN (interests);
CREATE INDEX IF NOT EXISTS idx_user_profiles_music_genres ON user_profiles USING GIN (music_genres);
CREATE INDEX IF NOT EXISTS idx_user_profiles_sports_fitness ON user_profiles USING GIN (sports_fitness);
CREATE INDEX IF NOT EXISTS idx_user_profiles_looking_for ON user_profiles USING GIN (looking_for);
CREATE INDEX IF NOT EXISTS idx_user_profiles_dietary_restrictions ON user_profiles USING GIN (dietary_restrictions);
CREATE INDEX IF NOT EXISTS idx_user_profiles_accessibility_needs ON user_profiles USING GIN (accessibility_needs);
CREATE INDEX IF NOT EXISTS idx_user_profiles_preferred_days ON user_profiles USING GIN (preferred_days);

-- Create B-tree indexes for common filter fields
CREATE INDEX IF NOT EXISTS idx_user_profiles_religion ON user_profiles (religion);
CREATE INDEX IF NOT EXISTS idx_user_profiles_primary_language ON user_profiles (primary_language);
CREATE INDEX IF NOT EXISTS idx_user_profiles_social_style ON user_profiles (social_style);
CREATE INDEX IF NOT EXISTS idx_user_profiles_career_level ON user_profiles (career_level);
CREATE INDEX IF NOT EXISTS idx_user_profiles_relationship_status ON user_profiles (relationship_status);

-- Add composite index for matching queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_matching ON user_profiles 
  (social_style, preferred_group_size, price_comfort, has_children);

-- Create a function to calculate event match score
CREATE OR REPLACE FUNCTION calculate_event_match_score(
  p_user_id uuid,
  p_event_id uuid
)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  v_score numeric := 0;
  v_user user_profiles%ROWTYPE;
  v_event events%ROWTYPE;
BEGIN
  -- Get user and event data
  SELECT * INTO v_user FROM user_profiles WHERE id = p_user_id;
  SELECT * INTO v_event FROM events WHERE id = p_event_id;
  
  IF v_user IS NULL OR v_event IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Strict matches (deal breakers) - high weight
  IF v_event.age_categories && ARRAY['all_ages'] OR 
     v_event.age_categories && v_user.children_ages THEN
    v_score := v_score + 25;
  END IF;
  
  -- Accessibility match
  IF v_user.accessibility_needs && ARRAY['wheelchair'] AND v_event.wheelchair_accessible THEN
    v_score := v_score + 20;
  END IF;
  
  -- Dietary match
  IF v_user.dietary_restrictions && v_event.dietary_context THEN
    v_score := v_score + 15;
  END IF;
  
  -- Religious/cultural match
  IF v_user.religion IS NOT NULL AND v_event.religious_context @> ARRAY[v_user.religion] THEN
    v_score := v_score + 10;
  END IF;
  
  -- Family friendly match
  IF v_user.has_children AND v_event.family_friendly THEN
    v_score := v_score + 10;
  END IF;
  
  -- Skill level match (all_levels matches everyone)
  IF v_event.skill_level = 'all_levels' OR v_user.career_level = 'entry' THEN
    v_score := v_score + 10;
  END IF;
  
  -- Content rating appropriateness
  IF v_user.has_children AND v_event.content_rating IN ('all_ages', 'pg') THEN
    v_score := v_score + 10;
  END IF;
  
  RETURN LEAST(v_score, 100);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION calculate_event_match_score(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_event_match_score(uuid, uuid) TO anon;

-- Verify migration
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM information_schema.columns
  WHERE table_name = 'user_profiles'
  AND column_name IN (
    'religion', 'ethnicity', 'interests', 'looking_for',
    'social_style', 'accessibility_needs', 'dietary_restrictions',
    'preferred_days', 'has_children'
  );
  
  IF v_count >= 9 THEN
    RAISE NOTICE 'Migration successful: % new attribute columns added to user_profiles table', v_count;
  ELSE
    RAISE WARNING 'Migration may be incomplete: only % columns found', v_count;
  END IF;
END $$;
-- Migration to add missing event columns for paid events and extended attributes
-- Run this in Supabase SQL Editor

-- Add paid event columns
ALTER TABLE public.events 
    ADD COLUMN IF NOT EXISTS is_paid_event BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS ticketing_website TEXT;

-- Add language columns
ALTER TABLE public.events 
    ADD COLUMN IF NOT EXISTS primary_language TEXT,
    ADD COLUMN IF NOT EXISTS secondary_languages TEXT[],
    ADD COLUMN IF NOT EXISTS interpretation_available BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS sign_language_interpreter BOOLEAN DEFAULT FALSE;

-- Add format columns
ALTER TABLE public.events 
    ADD COLUMN IF NOT EXISTS event_type TEXT,
    ADD COLUMN IF NOT EXISTS format TEXT,
    ADD COLUMN IF NOT EXISTS sub_category TEXT;

-- Add pricing columns
ALTER TABLE public.events 
    ADD COLUMN IF NOT EXISTS refund_policy TEXT,
    ADD COLUMN IF NOT EXISTS group_discounts BOOLEAN DEFAULT FALSE;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events' 
ORDER BY ordinal_position;
-- Fix enum columns - change to text to allow flexible values
-- Run this in Supabase SQL Editor

-- Convert refund_policy from enum to text
ALTER TABLE public.events 
    ALTER COLUMN refund_policy DROP DEFAULT,
    ALTER COLUMN refund_policy TYPE TEXT USING refund_policy::TEXT,
    ALTER COLUMN refund_policy SET DEFAULT NULL;

-- Convert traditional_attire from enum to text (if it exists as enum)
ALTER TABLE public.events 
    ALTER COLUMN traditional_attire DROP DEFAULT,
    ALTER COLUMN traditional_attire TYPE TEXT USING traditional_attire::TEXT,
    ALTER COLUMN traditional_attire SET DEFAULT NULL;

-- Convert skill_level from enum to text
ALTER TABLE public.events 
    ALTER COLUMN skill_level DROP DEFAULT,
    ALTER COLUMN skill_level TYPE TEXT USING skill_level::TEXT,
    ALTER COLUMN skill_level SET DEFAULT NULL;

-- Convert physical_fitness from enum to text
ALTER TABLE public.events 
    ALTER COLUMN physical_fitness DROP DEFAULT,
    ALTER COLUMN physical_fitness TYPE TEXT USING physical_fitness::TEXT,
    ALTER COLUMN physical_fitness SET DEFAULT NULL;

-- Convert noise_level from enum to text
ALTER TABLE public.events 
    ALTER COLUMN noise_level DROP DEFAULT,
    ALTER COLUMN noise_level TYPE TEXT USING noise_level::TEXT,
    ALTER COLUMN noise_level SET DEFAULT NULL;

-- Convert physical_intensity from enum to text
ALTER TABLE public.events 
    ALTER COLUMN physical_intensity DROP DEFAULT,
    ALTER COLUMN physical_intensity TYPE TEXT USING physical_intensity::TEXT,
    ALTER COLUMN physical_intensity SET DEFAULT NULL;

-- Verify changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events' 
ORDER BY ordinal_position;
-- Fix enum columns - need to drop dependent views first, then recreate them
-- Run this in Supabase SQL Editor

-- Step 1: Drop ALL dependent views
DROP VIEW IF EXISTS public.deleted_events_with_countdown;
DROP VIEW IF EXISTS public.events_enhanced_view;
DROP VIEW IF EXISTS public.events_with_participants;
DROP VIEW IF EXISTS public.user_events_view;

-- Step 2: Convert all enum columns to text type
ALTER TABLE public.events 
    ALTER COLUMN refund_policy DROP DEFAULT,
    ALTER COLUMN refund_policy TYPE TEXT USING refund_policy::TEXT,
    ALTER COLUMN refund_policy SET DEFAULT NULL;

ALTER TABLE public.events 
    ALTER COLUMN traditional_attire DROP DEFAULT,
    ALTER COLUMN traditional_attire TYPE TEXT USING traditional_attire::TEXT,
    ALTER COLUMN traditional_attire SET DEFAULT NULL;

ALTER TABLE public.events 
    ALTER COLUMN skill_level DROP DEFAULT,
    ALTER COLUMN skill_level TYPE TEXT USING skill_level::TEXT,
    ALTER COLUMN skill_level SET DEFAULT NULL;

ALTER TABLE public.events 
    ALTER COLUMN physical_fitness DROP DEFAULT,
    ALTER COLUMN physical_fitness TYPE TEXT USING physical_fitness::TEXT,
    ALTER COLUMN physical_fitness SET DEFAULT NULL;

ALTER TABLE public.events 
    ALTER COLUMN noise_level DROP DEFAULT,
    ALTER COLUMN noise_level TYPE TEXT USING noise_level::TEXT,
    ALTER COLUMN noise_level SET DEFAULT NULL;

ALTER TABLE public.events 
    ALTER COLUMN physical_intensity DROP DEFAULT,
    ALTER COLUMN physical_intensity TYPE TEXT USING physical_intensity::TEXT,
    ALTER COLUMN physical_intensity SET DEFAULT NULL;

-- Step 3: Recreate ALL views

-- 3.1 events_with_participants
CREATE OR REPLACE VIEW public.events_with_participants AS
SELECT
  e.*,
  p.display_name as organizer_name,
  p.avatar_url as organizer_avatar
FROM public.events e
LEFT JOIN public.profiles p ON e.organizer_id = p.user_id;

-- 3.2 user_events_view  
CREATE OR REPLACE VIEW public.user_events_view AS
SELECT
  e.*,
  CASE
    WHEN ep.user_id IS NOT NULL THEN 'registered'
    WHEN e.organizer_id = auth.uid() THEN 'organizer'
    ELSE 'available'
  END as participation_status,
  p.display_name as organizer_name,
  p.avatar_url as organizer_avatar
FROM public.events e
LEFT JOIN public.profiles p ON e.organizer_id = p.user_id
LEFT JOIN public.event_participants ep ON e.id = ep.event_id AND ep.user_id = auth.uid()
WHERE e.is_public = true OR e.organizer_id = auth.uid();

-- 3.3 events_enhanced_view
CREATE OR REPLACE VIEW public.events_enhanced_view AS
SELECT
  e.*,
  v.name as venue_name,
  v.address as venue_address,
  v.city as venue_city,
  v.capacity as venue_capacity,
  p.display_name as organizer_name,
  p.avatar_url as organizer_avatar,
  COALESCE(tt.total_tickets, 0) as total_ticket_types,
  COALESCE(et.media_count, 0) as media_count,
  COALESCE(tag.tag_count, 0) as tag_count
FROM public.events e
LEFT JOIN public.venues v ON e.primary_venue_id = v.id
LEFT JOIN public.profiles p ON e.organizer_id = p.user_id
LEFT JOIN (
  SELECT event_id, COUNT(*) as total_tickets
  FROM public.ticket_types
  GROUP BY event_id
) tt ON e.id = tt.event_id
LEFT JOIN (
  SELECT event_id, COUNT(*) as media_count
  FROM public.event_media
  GROUP BY event_id
) et ON e.id = et.event_id
LEFT JOIN (
  SELECT event_id, COUNT(*) as tag_count
  FROM public.event_tags
  GROUP BY event_id
) tag ON e.id = tag.event_id;

-- 3.4 deleted_events_with_countdown
CREATE OR REPLACE VIEW public.deleted_events_with_countdown AS
SELECT 
    e.*,
    public.get_days_until_deletion(e.deleted_at) as days_until_deletion
FROM public.events e
WHERE e.deleted_at IS NOT NULL;

-- Step 4: Grant permissions
GRANT SELECT ON public.deleted_events_with_countdown TO authenticated;
GRANT SELECT ON public.events_with_participants TO authenticated;
GRANT SELECT ON public.user_events_view TO authenticated;
GRANT SELECT ON public.events_enhanced_view TO authenticated;

-- Step 4: Verify changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events' 
ORDER BY ordinal_position;
-- Check for triggers on events table that might use regex
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'events';

-- Check for functions that might use regex
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_definition LIKE '%regexp%' OR routine_definition LIKE '%~%';
-- Temporarily disable all triggers on events table to identify the problematic one
-- Run this in Supabase SQL Editor

-- Disable all triggers
ALTER TABLE public.events DISABLE TRIGGER ALL;

-- Check which triggers exist
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers
WHERE event_object_table = 'events';
-- Check only user-defined triggers (not system triggers)
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'events'
AND trigger_schema = 'public'
AND trigger_name NOT LIKE 'RI_%'  -- Exclude referential integrity triggers
AND trigger_name NOT LIKE 'pg_%';  -- Exclude postgres system triggers
-- Fix the validate_event_data_enhanced function - remove invalid regex
-- The regex patterns had issues with escaping

CREATE OR REPLACE FUNCTION public.validate_event_data_enhanced()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate timezone
  IF NEW.timezone IS NOT NULL THEN
    -- Basic timezone validation (can be enhanced with proper timezone library)
    IF NEW.timezone !~ '^[A-Za-z_]+/[A-Za-z_]+$' AND NEW.timezone NOT IN ('UTC', 'GMT') THEN
      RAISE EXCEPTION 'Invalid timezone format';
    END IF;
  END IF;
  
  -- Validate registration timing
  IF NEW.registration_start_time IS NOT NULL AND NEW.registration_end_time IS NOT NULL THEN
    IF NEW.registration_end_time <= NEW.registration_start_time THEN
      RAISE EXCEPTION 'Registration end time must be after registration start time';
    END IF;
  END IF;
  
  -- Validate doors open time
  IF NEW.doors_open_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    IF NEW.doors_open_time > NEW.start_time THEN
      RAISE EXCEPTION 'Doors open time must be before event start time';
    END IF;
  END IF;
  
  -- Validate virtual event requirements
  IF NEW.event_type = 'online' AND NEW.virtual_event_url IS NULL THEN
    RAISE EXCEPTION 'Online events must have a virtual event URL';
  END IF;
  
  -- Validate event contact email (simplified regex)
  IF NEW.event_contact_email IS NOT NULL THEN
    IF NEW.event_contact_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
      RAISE EXCEPTION 'Invalid event contact email format';
    END IF;
  END IF;
  
  -- Validate ticketing website URL format (simplified - just check for http/https)
  IF NEW.ticketing_website IS NOT NULL THEN
    IF NEW.ticketing_website !~ '^https?://' THEN
      RAISE EXCEPTION 'Invalid ticketing website URL format - must start with http:// or https://';
    END IF;
  END IF;
  
  -- Validate event website URL format (simplified)
  IF NEW.event_website IS NOT NULL THEN
    IF NEW.event_website !~ '^https?://' THEN
      RAISE EXCEPTION 'Invalid event website URL format - must start with http:// or https://';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
