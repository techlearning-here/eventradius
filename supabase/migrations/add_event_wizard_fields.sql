-- Migration: Add all missing EventWizard fields to events table
-- This adds fields that were in the frontend EventFormData but missing from the database

-- Basic metadata fields
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS doors_open_time TIMESTAMP WITH TIME ZONE;

-- Registration fields
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_start_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_end_time TIMESTAMP WITH TIME ZONE;

-- Event metadata
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_format TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_privacy TEXT DEFAULT 'public';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS virtual_event_platform TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_password TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS age_restriction TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS accessibility_options TEXT;

-- Policy and pricing
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS custom_refund_policy TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS ticket_pricing_description TEXT;

-- Website and tags
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_website TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add comments for documentation
COMMENT ON COLUMN public.events.subtitle IS 'Short subtitle for the event';
COMMENT ON COLUMN public.events.summary IS 'Brief summary of the event';
COMMENT ON COLUMN public.events.timezone IS 'Timezone for the event (e.g., America/New_York)';
COMMENT ON COLUMN public.events.doors_open_time IS 'When doors open for the event';
COMMENT ON COLUMN public.events.registration_start_time IS 'When registration opens for the event';
COMMENT ON COLUMN public.events.registration_end_time IS 'When registration closes for the event';
COMMENT ON COLUMN public.events.event_format IS 'Format: single, recurring, multi_date';
COMMENT ON COLUMN public.events.event_privacy IS 'Privacy: public, private, unlisted';
COMMENT ON COLUMN public.events.virtual_event_platform IS 'Platform for virtual events (Zoom, Teams, etc.)';
COMMENT ON COLUMN public.events.event_password IS 'Password for private events';
COMMENT ON COLUMN public.events.age_restriction IS 'Age restriction details';
COMMENT ON COLUMN public.events.accessibility_options IS 'Accessibility options available';
COMMENT ON COLUMN public.events.custom_refund_policy IS 'Custom refund policy text';
COMMENT ON COLUMN public.events.ticket_pricing_description IS 'Description of ticket pricing tiers';
COMMENT ON COLUMN public.events.event_website IS 'External website for the event';
COMMENT ON COLUMN public.events.tags IS 'Array of tags for the event';
