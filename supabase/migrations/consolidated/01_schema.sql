-- =====================================================
-- EVENTRADIUS DATABASE SETUP - PART 1: SCHEMA (Types & Tables)
-- =====================================================
-- This file contains:
--   1. Custom ENUM types
--   2. View drops (to avoid dependency conflicts)
--   3. All CREATE TABLE statements with consolidated columns
--
-- Merged from:
--   - 01_eventradius_complete_setup.sql (base schema)
--   - 02_add_quick_create_fields.sql
--   - 07_add_approval_fields.sql
--   - 08_add_cancellation_request.sql
--   - 09_add_event_geolocation.sql
--   - add_event_contact_phone.sql
--   - add_event_wizard_fields.sql
--
-- BENEFITS: Eliminates ALTER TABLE by including all columns in CREATE TABLE
--
-- Run order: 01_schema.sql → 02_functions.sql → 03_indexes_rls_views.sql
--
-- Safe to run multiple times (uses IF EXISTS/IF NOT EXISTS)
-- =====================================================
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
-- 1.5 DROP EXISTING VIEWS (for clean migration)
-- =====================================================
-- Drop views first to avoid column dependency conflicts
DROP VIEW IF EXISTS public.events_with_participants CASCADE;
DROP VIEW IF EXISTS public.user_events_view CASCADE;
DROP VIEW IF EXISTS public.events_enhanced_view CASCADE;
DROP VIEW IF EXISTS public.deleted_events_with_countdown CASCADE;

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
  event_contact_phone TEXT,
  event_contact_phone_country_code TEXT,
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
  event_status TEXT DEFAULT 'published',
  
  -- Quick Create fields (from 02_add_quick_create_fields.sql)
  ticket_price DECIMAL(10,2) DEFAULT 0,
  require_approval BOOLEAN NOT NULL DEFAULT FALSE,
  enable_waitlist BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Approval fields (from 07_add_approval_fields.sql)
  approval_request_fields JSONB DEFAULT '{
    "name": {"required": true, "label": "Full Name"},
    "email": {"required": true, "label": "Email Address"},
    "phone": {"required": false, "label": "Phone Number"},
    "bio": {"required": false, "label": "Short Bio"},
    "reason": {"required": false, "label": "Why do you want to attend?"},
    "social_links": {"required": false, "label": "Social/Website Links"}
  }',
  approval_instructions TEXT,
  
  -- Geolocation fields (from 09_add_event_geolocation.sql)
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  geolocation_accuracy VARCHAR(20),
  geocoded_at TIMESTAMP WITH TIME ZONE,
  
  -- Soft delete support
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 2.4 User preferences table for onboarding data
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  age_range TEXT,
  has_kids TEXT CHECK (has_kids IN ('yes', 'no', 'prefer_not_to_say')),
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
-- Includes columns from 07_add_approval_fields.sql and 08_add_cancellation_request.sql
CREATE TABLE IF NOT EXISTS public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'going',
  
  -- Approval flow fields (from 07_add_approval_fields.sql)
  approval_status TEXT NOT NULL DEFAULT 'approved',
  requester_name TEXT,
  requester_email TEXT,
  requester_phone TEXT,
  requester_bio TEXT,
  requester_social_links JSONB DEFAULT '{}',
  requester_reason TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  is_waitlisted BOOLEAN NOT NULL DEFAULT FALSE,
  waitlist_position INTEGER,
  
  -- Cancellation request fields (from 08_add_cancellation_request.sql)
  cancellation_requested_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  cancellation_processed_at TIMESTAMP WITH TIME ZONE,
  cancellation_processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
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
