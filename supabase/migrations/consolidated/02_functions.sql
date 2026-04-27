-- =====================================================
-- EVENTRADIUS DATABASE SETUP - PART 2: FUNCTIONS & STORED PROCEDURES
-- =====================================================
-- This file contains:
--   1. Utility functions (timestamp updates, validation)
--   2. Geolocation functions (distance calculation, radius search)
--   3. Approval workflow functions
--   4. Cancellation request functions
--
-- Run order: 01_schema.sql → 02_functions.sql → 03_indexes_rls_views.sql
--
-- Safe to run multiple times (uses CREATE OR REPLACE)
-- =====================================================

-- =====================================================
-- FUNCTIONS AND STORED PROCEDURES
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
  
  -- Validate event contact email (simple LIKE patterns - contains @ and at least one .)
  IF NEW.event_contact_email IS NOT NULL THEN
    IF NEW.event_contact_email NOT LIKE '%@%.%' THEN
      RAISE EXCEPTION 'Invalid event contact email format';
    END IF;
  END IF;
  
  -- Validate ticketing website URL format (simple check for http/https prefix and at least one dot)
  IF NEW.ticketing_website IS NOT NULL THEN
    IF NOT (NEW.ticketing_website ~ '^https?://' AND NEW.ticketing_website ~ '\.' ) THEN
      RAISE EXCEPTION 'Invalid ticketing website URL format';
    END IF;
  END IF;
  
  -- Validate event website URL format (simple check for http/https prefix and at least one dot)
  IF NEW.event_website IS NOT NULL THEN
    IF NOT (NEW.event_website ~ '^https?://' AND NEW.event_website ~ '\.' ) THEN
      RAISE EXCEPTION 'Invalid event website URL format';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 3.10 Geolocation distance calculation function (from 09_add_event_geolocation.sql)
CREATE OR REPLACE FUNCTION public.calculate_distance_km(
    lat1 DECIMAL(10, 8),
    lon1 DECIMAL(11, 8),
    lat2 DECIMAL(10, 8),
    lon2 DECIMAL(11, 8)
)
RETURNS DECIMAL(10, 2)
LANGUAGE SQL
IMMUTABLE
PARALLEL SAFE
AS $$
    SELECT (
        6371 * acos(
            LEAST(1.0, GREATEST(-1.0,
                cos(radians(lat1)) * 
                cos(radians(lat2)) * 
                cos(radians(lon2) - radians(lon1)) + 
                sin(radians(lat1)) * 
                sin(radians(lat2))
            ))
        )
    )::DECIMAL(10, 2);
$$;
COMMENT ON FUNCTION public.calculate_distance_km IS 'Calculate distance between two lat/lng points using Haversine formula (returns km)';

-- 3.11 Radius search function (from 09_add_event_geolocation.sql)
CREATE OR REPLACE FUNCTION public.events_within_radius(
    user_lat DECIMAL(10, 8),
    user_lng DECIMAL(11, 8),
    radius_km INTEGER,
    event_type_filter TEXT[] DEFAULT ARRAY['in_person', 'hybrid']
)
RETURNS TABLE (
    event_id UUID,
    title TEXT,
    distance_km DECIMAL(10, 2),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8)
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        e.id as event_id,
        e.title,
        public.calculate_distance_km(user_lat, user_lng, e.latitude, e.longitude) as distance_km,
        e.latitude,
        e.longitude
    FROM public.events e
    WHERE e.event_type::text = ANY(event_type_filter)
        AND e.latitude IS NOT NULL 
        AND e.longitude IS NOT NULL
        AND e.is_public = true
        AND public.calculate_distance_km(user_lat, user_lng, e.latitude, e.longitude) <= radius_km
    ORDER BY distance_km;
$$;
COMMENT ON FUNCTION public.events_within_radius IS 'Find events within a specific radius of user location';

-- 3.12 Optimized radius search using PostGIS-like bounding box (from 09_add_event_geolocation.sql)
CREATE OR REPLACE FUNCTION public.events_within_radius_fast(
    user_lat DECIMAL(10, 8),
    user_lng DECIMAL(11, 8),
    radius_km INTEGER,
    event_type_filter TEXT[] DEFAULT ARRAY['in_person', 'hybrid']
)
RETURNS TABLE (
    event_id UUID,
    title TEXT,
    distance_km DECIMAL(10, 2),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    start_time TIMESTAMP WITH TIME ZONE,
    category TEXT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        e.id as event_id,
        e.title,
        public.calculate_distance_km(user_lat, user_lng, e.latitude, e.longitude) as distance_km,
        e.latitude,
        e.longitude,
        e.start_time,
        e.category
    FROM public.events e
    WHERE e.event_type::text = ANY(event_type_filter)
        AND e.latitude BETWEEN (user_lat - (radius_km / 111.0)) AND (user_lat + (radius_km / 111.0))
        AND e.longitude BETWEEN (user_lng - (radius_km / (111.0 * cos(radians(user_lat))))) AND (user_lng + (radius_km / (111.0 * cos(radians(user_lat)))))
        AND e.latitude IS NOT NULL 
        AND e.longitude IS NOT NULL
        AND e.is_public = true
        AND e.status IN ('published', 'upcoming')
    ORDER BY distance_km
    LIMIT 100;
$$;
COMMENT ON FUNCTION public.events_within_radius_fast IS 'Optimized radius search using bounding box approximation for faster results';

-- 3.13 Nearby events with full details (from 09_add_event_geolocation.sql)
CREATE OR REPLACE FUNCTION public.get_nearby_events_with_details(
    user_lat DECIMAL(10, 8),
    user_lng DECIMAL(11, 8),
    radius_km INTEGER,
    p_category TEXT DEFAULT NULL,
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
    event_id UUID,
    title TEXT,
    subtitle TEXT,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    location TEXT,
    distance_km DECIMAL(10, 2),
    category TEXT,
    is_public BOOLEAN,
    organizer_id UUID,
    organizer_name TEXT,
    event_type public.event_type,
    event_format public.event_format,
    max_participants INTEGER,
    participant_count INTEGER
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        e.id as event_id,
        e.title,
        e.subtitle,
        e.description,
        e.start_time,
        e.end_time,
        e.location,
        public.calculate_distance_km(user_lat, user_lng, e.latitude, e.longitude) as distance_km,
        e.category,
        e.is_public,
        e.organizer_id,
        p.display_name as organizer_name,
        e.event_type,
        e.event_format,
        e.max_participants,
        e.participant_count
    FROM public.events e
    LEFT JOIN public.profiles p ON e.organizer_id = p.user_id
    WHERE e.latitude IS NOT NULL 
        AND e.longitude IS NOT NULL
        AND e.is_public = true
        AND e.status IN ('published', 'upcoming')
        AND public.calculate_distance_km(user_lat, user_lng, e.latitude, e.longitude) <= radius_km
        AND (p_category IS NULL OR e.category = p_category)
        AND (p_start_date IS NULL OR e.start_time >= p_start_date)
        AND (p_end_date IS NULL OR e.end_time <= p_end_date)
    ORDER BY distance_km
    LIMIT 50;
$$;
COMMENT ON FUNCTION public.get_nearby_events_with_details IS 'Get nearby events with full details and optional filters';

-- 3.14 Stored procedure: Submit approval request (from 07_add_approval_fields.sql)
-- Drop old function versions without p_user_id parameter to avoid ambiguity
DROP FUNCTION IF EXISTS public.submit_approval_request(
    UUID, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT
);

CREATE OR REPLACE FUNCTION public.submit_approval_request(
    p_event_id UUID,
    p_requester_name TEXT,
    p_requester_email TEXT,
    p_requester_phone TEXT DEFAULT NULL,
    p_requester_bio TEXT DEFAULT NULL,
    p_requester_social_links JSONB DEFAULT NULL,
    p_requester_reason TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_participant_id UUID;
    v_event_require_approval BOOLEAN;
    v_participant_count INTEGER;
    v_max_participants INTEGER;
    v_is_full BOOLEAN;
    v_result JSONB;
    v_user_id UUID;
BEGIN
    -- Get event details
    SELECT require_approval, max_participants, participant_count
    INTO v_event_require_approval, v_max_participants, v_participant_count
    FROM public.events
    WHERE id = p_event_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Event not found');
    END IF;

    -- Check if event requires approval
    IF NOT v_event_require_approval THEN
        RETURN jsonb_build_object('success', false, 'error', 'This event does not require approval');
    END IF;

    -- Check if event is full
    v_is_full := v_max_participants IS NOT NULL AND v_participant_count >= v_max_participants;

    -- Determine user_id: prefer p_user_id if provided, otherwise use auth.uid()
    v_user_id := COALESCE(p_user_id, auth.uid());

    -- Insert participant with pending approval status
    BEGIN
        INSERT INTO public.event_participants (
            event_id,
            user_id,
            status,
            approval_status,
            requester_name,
            requester_email,
            requester_phone,
            requester_bio,
            requester_social_links,
            requester_reason,
            is_waitlisted,
            waitlist_position
        ) VALUES (
            p_event_id,
            v_user_id,
            'interested',
            CASE WHEN v_is_full THEN 'waitlisted' ELSE 'pending' END,
            p_requester_name,
            p_requester_email,
            p_requester_phone,
            p_requester_bio,
            COALESCE(p_requester_social_links, '{}'),
            p_requester_reason,
            v_is_full,
            CASE WHEN v_is_full THEN v_participant_count + 1 ELSE NULL END
        )
        RETURNING id INTO v_participant_id;

        v_result := jsonb_build_object(
            'success', true,
            'participant_id', v_participant_id,
            'event_id', p_event_id,
            'user_id', v_user_id,
            'approval_status', CASE WHEN v_is_full THEN 'waitlisted' ELSE 'pending' END,
            'is_waitlisted', v_is_full,
            'requester_name', p_requester_name,
            'requester_email', p_requester_email,
            'requester_phone', p_requester_phone,
            'requester_bio', p_requester_bio,
            'requester_reason', p_requester_reason,
            'requester_social_links', COALESCE(p_requester_social_links, '{}'),
            'registered_at', NOW(),
            'waitlist_position', CASE WHEN v_is_full THEN v_participant_count + 1 ELSE NULL END,
            'message', CASE WHEN v_is_full THEN 'Added to waitlist' ELSE 'Approval request submitted' END
        );
    EXCEPTION
        WHEN unique_violation THEN
            v_result := jsonb_build_object('success', false, 'error', 'You have already submitted a request for this event');
    END;

    RETURN v_result;
END;
$$;
COMMENT ON FUNCTION public.submit_approval_request IS 'Submit an approval request for events requiring organizer approval';

-- 3.15 Stored procedure: Process cancellation action (from 08_add_cancellation_request.sql)
CREATE OR REPLACE FUNCTION public.process_cancellation_action(
    p_participant_id UUID,
    p_organizer_id UUID,
    p_action TEXT, -- 'approve' or 'reject'
    p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_participant RECORD;
    v_event_organizer UUID;
    v_result JSONB;
BEGIN
    -- Verify action is valid
    IF p_action NOT IN ('approve', 'reject') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid action. Must be approve or reject');
    END IF;
    
    -- Get participant details
    SELECT ep.*, e.organizer_id as event_organizer_id
    INTO v_participant
    FROM public.event_participants ep
    JOIN public.events e ON ep.event_id = e.id
    WHERE ep.id = p_participant_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Participant not found');
    END IF;
    
    -- Verify the user is the event organizer
    IF v_participant.event_organizer_id != p_organizer_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Only event organizer can process cancellation requests');
    END IF;
    
    -- Verify participant has a pending cancellation request
    IF v_participant.approval_status != 'cancellation_requested' THEN
        RETURN jsonb_build_object('success', false, 'error', 'No pending cancellation request for this participant');
    END IF;
    
    IF p_action = 'approve' THEN
        -- Approve cancellation - actually remove the participant
        DELETE FROM public.event_participants
        WHERE id = p_participant_id;
        
        v_result := jsonb_build_object(
            'success', true,
            'action', 'approved',
            'message', 'Cancellation approved and participant removed',
            'participant_id', p_participant_id
        );
    ELSE
        -- Reject cancellation - restore to approved status
        UPDATE public.event_participants
        SET 
            approval_status = 'approved',
            cancellation_requested_at = NULL,
            cancellation_reason = NULL,
            cancellation_processed_at = NOW(),
            cancellation_processed_by = p_organizer_id
        WHERE id = p_participant_id;
        
        v_result := jsonb_build_object(
            'success', true,
            'action', 'rejected',
            'message', 'Cancellation rejected, participant restored to approved status',
            'reason', p_reason,
            'participant_id', p_participant_id
        );
    END IF;
    
    RETURN v_result;
END;
$$;
COMMENT ON FUNCTION public.process_cancellation_action IS 'Process cancellation requests - approve or reject by event organizer';

-- 3.16 Stored procedure: Cancel approved participation (from 08_add_cancellation_request.sql)
CREATE OR REPLACE FUNCTION public.cancel_approved_participation(
    p_participant_id UUID,
    p_user_id UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_participant RECORD;
    v_event_require_approval BOOLEAN;
    v_result JSONB;
BEGIN
    -- Get participant details
    SELECT ep.*, e.require_approval
    INTO v_participant
    FROM public.event_participants ep
    JOIN public.events e ON ep.event_id = e.id
    WHERE ep.id = p_participant_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Participant not found');
    END IF;
    
    -- Verify the user owns this participation
    IF v_participant.user_id != p_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'You can only cancel your own participation');
    END IF;
    
    -- Check if already pending cancellation
    IF v_participant.approval_status = 'cancellation_requested' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cancellation already requested');
    END IF;
    
    -- If event doesn't require approval, just delete the participation
    IF NOT v_participant.require_approval THEN
        DELETE FROM public.event_participants
        WHERE id = p_participant_id;
        
        v_result := jsonb_build_object(
            'success', true,
            'action', 'deleted',
            'message', 'Participation cancelled successfully',
            'participant_id', p_participant_id
        );
    ELSE
        -- For events requiring approval, set cancellation requested status
        UPDATE public.event_participants
        SET 
            approval_status = 'cancellation_requested',
            cancellation_requested_at = NOW(),
            cancellation_reason = p_reason
        WHERE id = p_participant_id;
        
        v_result := jsonb_build_object(
            'success', true,
            'action', 'cancellation_requested',
            'message', 'Cancellation request submitted for organizer approval',
            'participant_id', p_participant_id,
            'requires_approval', true
        );
    END IF;
    
    RETURN v_result;
END;
$$;
COMMENT ON FUNCTION public.cancel_approved_participation IS 'Request cancellation of approved participation (triggers approval flow if required)';

