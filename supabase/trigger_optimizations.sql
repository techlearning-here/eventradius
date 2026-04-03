-- =====================================================
-- DATABASE TRIGGER OPTIMIZATIONS
-- =====================================================
-- This script adds database triggers to reduce backend code
-- and improve performance by moving logic to the database layer.

-- =====================================================
-- 1. EVENT PARTICIPANTS TABLE (Missing - Need to Create)
-- =====================================================

-- Create event_participants table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id) -- Prevent duplicate registrations
);

-- Enable RLS on event_participants
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for event_participants
CREATE POLICY IF NOT EXISTS "Users can view their own participations"
ON public.event_participants
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own participations"
ON public.event_participants
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own participations"
ON public.event_participants
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Event organizers can view all participants"
ON public.event_participants
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_id AND e.organizer_id = auth.uid()
  )
);

-- =====================================================
-- 2. PARTICIPANT COUNT AUTOMATION
-- =====================================================

-- Add participant_count column to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS participant_count INTEGER DEFAULT 0;

-- Function to update participant count
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

-- Triggers for automatic participant count updates
CREATE TRIGGER increment_participant_count
  AFTER INSERT ON public.event_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_participant_count();

CREATE TRIGGER decrement_participant_count
  AFTER DELETE ON public.event_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_participant_count();

-- =====================================================
-- 3. EVENT STATUS AUTOMATION
-- =====================================================

-- Function to automatically update event status based on time
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

-- Trigger for automatic status updates
CREATE TRIGGER update_event_status_trigger
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_event_status();

-- Also trigger on insert
CREATE TRIGGER update_event_status_insert
  BEFORE INSERT ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_event_status();

-- =====================================================
-- 4. EVENT VALIDATION TRIGGERS
-- =====================================================

-- Function to validate event data
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

-- Triggers for data validation
CREATE TRIGGER validate_event_insert
  BEFORE INSERT ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_event_data();

CREATE TRIGGER validate_event_update
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_event_data();

-- =====================================================
-- 5. AUDIT TRIGGERS
-- =====================================================

-- Create audit table
CREATE TABLE IF NOT EXISTS public.event_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  old_data JSONB,
  new_data JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit table
ALTER TABLE public.event_audit ENABLE ROW LEVEL SECURITY;

-- Function to log event changes
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

-- Audit triggers
CREATE TRIGGER audit_event_insert
  AFTER INSERT ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.log_event_changes();

CREATE TRIGGER audit_event_update
  AFTER UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.log_event_changes();

CREATE TRIGGER audit_event_delete
  AFTER DELETE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.log_event_changes();

-- =====================================================
-- 6. ENHANCED USER TRIGGERS
-- =====================================================

-- Update handle_new_user to also create default preferences
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
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Determine role
  _role := COALESCE(NULLIF(new.raw_user_meta_data->>'role', '')::app_role, 'user'::app_role);
  
  -- Assign role
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (new.id, _role) 
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Create preferences for regular users
  IF _role = 'user' THEN
    INSERT INTO public.user_preferences (user_id) 
    VALUES (new.id) 
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  -- Log user creation
  INSERT INTO public.event_audit (event_id, action, new_data, changed_by)
  VALUES (new.id, 'USER_CREATED', row_to_json(new), new.id)
  ON CONFLICT DO NOTHING;
  
  RETURN new;
END;
$$;

-- =====================================================
-- 7. VIEWS FOR COMMON QUERIES
-- =====================================================

-- Create view for events with participant counts
CREATE OR REPLACE VIEW public.events_with_participants AS
SELECT 
  e.*,
  ep.participant_count,
  p.display_name as organizer_name,
  p.avatar_url as organizer_avatar
FROM public.events e
LEFT JOIN public.profiles p ON e.organizer_id = p.user_id
LEFT JOIN (
  SELECT 
    event_id, 
    COUNT(*) as participant_count
  FROM public.event_participants
  GROUP BY event_id
) ep ON e.id = ep.event_id;

-- Create view for user events with participation status
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
-- 8. INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for event_participants
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON public.event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON public.event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_registered_at ON public.event_participants(registered_at);

-- Indexes for audit table
CREATE INDEX IF NOT EXISTS idx_event_audit_event_id ON public.event_audit(event_id);
CREATE INDEX IF NOT EXISTS idx_event_audit_changed_at ON public.event_audit(changed_at);
CREATE INDEX IF NOT EXISTS idx_event_audit_action ON public.event_audit(action);

-- Indexes for views
CREATE INDEX IF NOT EXISTS idx_events_participant_count ON public.events(participant_count);
CREATE INDEX IF NOT EXISTS idx_events_status_time ON public.events(status, start_time, end_time);

-- =====================================================
-- 9. OPTIMIZED API FUNCTIONS
-- =====================================================

-- Function to get events with all data in one query
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
-- SUMMARY OF OPTIMIZATIONS
-- =====================================================
-- 
-- ✅ AUTOMATED PARTICIPANT COUNTING
-- ✅ AUTOMATIC EVENT STATUS UPDATES
-- ✅ DATA VALIDATION IN DATABASE
-- ✅ AUDIT LOGGING
-- ✅ OPTIMIZED VIEWS FOR COMMON QUERIES
-- ✅ ENHANCED USER ONBOARDING
-- ✅ PERFORMANCE INDEXES
-- ✅ REDUCED BACKEND CODE COMPLEXITY
-- 
-- BACKEND CODE REDUCTION:
-- - Participant counting logic removed
-- - Event status updates automated
-- - Data validation moved to database
-- - Audit logging automated
-- - Complex queries simplified with views
-- =====================================================
