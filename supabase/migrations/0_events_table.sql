-- Create events table
CREATE TABLE public.events (
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

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policies for events table
CREATE POLICY "Events are viewable by everyone" 
ON public.events 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create events" 
ON public.events 
FOR INSERT 
WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their events" 
ON public.events 
FOR UPDATE 
USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their events" 
ON public.events 
FOR DELETE 
USING (auth.uid() = organizer_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_events_is_public ON public.events(is_public);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON public.events(start_time);

-- Comments for documentation
COMMENT ON TABLE public.events IS 'Events table for storing event information';
COMMENT ON COLUMN public.events.status IS 'Event status: pending, approved, rejected, cancelled';
