-- Migration: Add event contact phone columns to events table
-- This adds phone number fields that were missing from the original schema

-- Add event_contact_phone column
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS event_contact_phone TEXT;

-- Add event_contact_phone_country_code column  
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS event_contact_phone_country_code TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.events.event_contact_phone IS 'Contact phone number for event-specific inquiries';
COMMENT ON COLUMN public.events.event_contact_phone_country_code IS 'Country code for event contact phone (e.g., +1, +44)';
