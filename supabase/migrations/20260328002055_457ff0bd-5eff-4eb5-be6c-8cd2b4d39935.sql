
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
