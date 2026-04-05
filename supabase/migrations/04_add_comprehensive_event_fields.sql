-- =====================================================
-- 04 - COMPREHENSIVE EVENT FIELDS MIGRATION
-- =====================================================
-- This migration adds Priority 1 & 2 fields to make EventRadius
-- competitive with Eventbrite's event creation capabilities
-- 
-- Priority 1: Essential Fields (Must Have)
-- Priority 2: Important Fields (Should Have)
-- =====================================================

-- =====================================================
-- 1. NEW ENUMS AND TYPES
-- =====================================================

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
-- 2. ENHANCE EVENTS TABLE WITH PRIORITY 1 FIELDS
-- =====================================================

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS event_type public.event_type DEFAULT 'in_person',
ADD COLUMN IF NOT EXISTS event_format public.event_format DEFAULT 'single',
ADD COLUMN IF NOT EXISTS event_privacy public.event_privacy DEFAULT 'public',
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS registration_start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS registration_end_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS refund_policy public.refund_policy DEFAULT 'no_refunds',
ADD COLUMN IF NOT EXISTS custom_refund_policy TEXT,
ADD COLUMN IF NOT EXISTS event_password TEXT,
ADD COLUMN IF NOT EXISTS age_restriction TEXT,
ADD COLUMN IF NOT EXISTS accessibility_options TEXT,
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS doors_open_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS virtual_event_url TEXT,
ADD COLUMN IF NOT EXISTS virtual_event_platform TEXT,
ADD COLUMN IF NOT EXISTS event_website TEXT,
ADD COLUMN IF NOT EXISTS event_contact_email TEXT,
ADD COLUMN IF NOT EXISTS ticketing_website TEXT;

-- =====================================================
-- 3. NEW TABLES FOR COMPLEX DATA STRUCTURES
-- =====================================================

-- 3.1 Venues table for detailed location information
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

-- 3.2 Event venues relationship table
CREATE TABLE IF NOT EXISTS public.event_venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, venue_id)
);

-- 3.3 Ticket types table for comprehensive ticketing
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

-- 3.4 Custom registration fields table
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

-- 3.5 Event media table for images and videos
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

-- 3.6 Event notifications table
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

-- 3.7 Event tags for better discovery
CREATE TABLE IF NOT EXISTS public.event_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, tag)
);

-- 3.8 Event schedule/agenda table
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
-- 4. UPDATE EVENTS TABLE WITH VENUE RELATIONSHIP
-- =====================================================

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS primary_venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL;

-- =====================================================
-- 5. TRIGGERS AND FUNCTIONS
-- =====================================================

-- 5.1 Function to update timestamps for new tables
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 5.2 Function to validate ticket data
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

-- 5.3 Function to validate event data with new fields
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
-- 6. CREATE TRIGGERS FOR NEW TABLES
-- =====================================================

-- 6.1 Timestamp triggers for new tables
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

-- 6.2 Validation triggers
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

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS) FOR NEW TABLES
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_schedule ENABLE ROW LEVEL SECURITY;

-- 7.1 Venues RLS policies
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

-- 7.2 Event venues RLS policies
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

-- 7.3 Ticket types RLS policies
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

-- 7.4 Registration fields RLS policies
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

-- 7.5 Event media RLS policies
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

-- 7.6 Event notifications RLS policies
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

-- 7.7 Event tags RLS policies
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

-- 7.8 Event schedule RLS policies
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
-- 8. INDEXES FOR PERFORMANCE
-- =====================================================

-- 8.1 Venues indexes
CREATE INDEX IF NOT EXISTS idx_venues_organizer_id ON public.venues(organizer_id);
CREATE INDEX IF NOT EXISTS idx_venues_city ON public.venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_country ON public.venues(country);
CREATE INDEX IF NOT EXISTS idx_venues_capacity ON public.venues(capacity);

-- 8.2 Event venues indexes
CREATE INDEX IF NOT EXISTS idx_event_venues_event_id ON public.event_venues(event_id);
CREATE INDEX IF NOT EXISTS idx_event_venues_venue_id ON public.event_venues(venue_id);

-- 8.3 Ticket types indexes
CREATE INDEX IF NOT EXISTS idx_ticket_types_event_id ON public.ticket_types(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_types_price ON public.ticket_types(price);
CREATE INDEX IF NOT EXISTS idx_ticket_types_currency ON public.ticket_types(currency);
CREATE INDEX IF NOT EXISTS idx_ticket_types_sales_start ON public.ticket_types(sales_start_time);
CREATE INDEX IF NOT EXISTS idx_ticket_types_sales_end ON public.ticket_types(sales_end_time);

-- 8.4 Registration fields indexes
CREATE INDEX IF NOT EXISTS idx_registration_fields_event_id ON public.registration_fields(event_id);
CREATE INDEX IF NOT EXISTS idx_registration_fields_field_type ON public.registration_fields(field_type);

-- 8.5 Event media indexes
CREATE INDEX IF NOT EXISTS idx_event_media_event_id ON public.event_media(event_id);
CREATE INDEX IF NOT EXISTS idx_event_media_type ON public.event_media(media_type);
CREATE INDEX IF NOT EXISTS idx_event_media_primary ON public.event_media(is_primary);

-- 8.6 Event notifications indexes
CREATE INDEX IF NOT EXISTS idx_event_notifications_event_id ON public.event_notifications(event_id);
CREATE INDEX IF NOT EXISTS idx_event_notifications_type ON public.event_notifications(notification_type);

-- 8.7 Event tags indexes
CREATE INDEX IF NOT EXISTS idx_event_tags_event_id ON public.event_tags(event_id);
CREATE INDEX IF NOT EXISTS idx_event_tags_tag ON public.event_tags(tag);

-- 8.8 Event schedule indexes
CREATE INDEX IF NOT EXISTS idx_event_schedule_event_id ON public.event_schedule(event_id);
CREATE INDEX IF NOT EXISTS idx_event_schedule_start ON public.event_schedule(start_time);

-- 8.9 Enhanced events table indexes
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
-- 9. VIEWS FOR ENHANCED FUNCTIONALITY
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
-- 10. COMMENTS AND DOCUMENTATION
-- =====================================================

-- Table comments
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

-- =====================================================
-- 11. VERIFICATION QUERIES
-- =====================================================

-- Verify all new tables exist and have RLS enabled
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('venues', 'event_venues', 'ticket_types', 'registration_fields', 'event_media', 'event_notifications', 'event_tags', 'event_schedule')
ORDER BY tablename;

-- Verify all new enums exist
SELECT
    typname,
    typtype
FROM pg_type
WHERE typname IN ('event_type', 'event_format', 'event_privacy', 'refund_policy', 'currency_type')
  AND typtype = 'e'
ORDER BY typname;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
--
-- This migration adds comprehensive event management capabilities:
-- ✅ Priority 1: Event type, timezone, registration dates, refund policy, privacy settings
-- ✅ Priority 2: Venues, ticket types, custom registration fields, media management
-- ✅ Enhanced security with RLS policies
-- ✅ Performance optimization with indexes
-- ✅ Data validation with triggers
-- ✅ Enhanced views for common queries
-- ✅ Comprehensive documentation
--
-- EventRadius now has enterprise-level event creation capabilities
-- comparable to Eventbrite's core features
-- =====================================================
