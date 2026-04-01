-- Add is_public column to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true;

-- Update existing events to be public by default
UPDATE public.events SET is_public = true WHERE is_public IS NULL;