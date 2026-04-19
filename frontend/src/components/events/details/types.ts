export interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start_time?: string;
  end_time?: string;
  image_url?: string;
  category?: string;
  max_participants?: number;
  is_public: boolean;
  organizer_id: string;
  
  // Quick Create fields
  ticket_price?: number;
  require_approval?: boolean;
  enable_waitlist?: boolean;
  approval_instructions?: string;
  created_at: string;
  updated_at: string;
  current_participants?: number;
  is_paid_event?: boolean;
  ticket_pricing_description?: string;
  ticketing_website?: string;
  timezone?: string;
  organizer_email?: string;
  organizer_phone?: string;
  organizer_website?: string;
  // Event Wizard - Basic Info
  subtitle?: string;
  summary?: string;
  tags?: string[];
  // Event Wizard - Venue Details
  venue_street?: string;
  venue_city?: string;
  venue_state?: string;
  venue_zip_code?: string;
  venue_country?: string;
  venue_building_name?: string;
  // Event Wizard - Timing
  doors_open_time?: string;
  registration_start_time?: string;
  registration_end_time?: string;
  // Event Wizard - Virtual Event
  virtual_event_url?: string;
  virtual_event_platform?: string;
  event_password?: string;
  // Event Wizard - Additional
  age_restriction?: string;
  accessibility_options?: string;
  event_format?: string;
  event_privacy?: string;
  custom_refund_policy?: string;
  // Event contact info from ContactInfo step
  event_contact_email?: string;
  event_contact_phone?: string;
  event_contact_phone_country_code?: string;
  // Legacy fields for compatibility
  creator?: string;
  date?: string;
  time?: string;
  address?: string;
  background_image_url?: string;
  target_date?: string;
  event_type?: string;
  event_status?: string;
  created_by?: string;
  // New Event Attributes - Audience & Demographics
  age_categories?: string[];
  gender_preference?: string;
  family_friendly?: boolean;
  senior_friendly?: boolean;
  singles_friendly?: boolean;
  couples_oriented?: boolean;
  // New Event Attributes - Accessibility
  wheelchair_accessible?: boolean;
  mobility_friendly?: boolean;
  hearing_accessible?: boolean;
  vision_accessible?: boolean;
  sensory_friendly?: boolean;
  service_animals_allowed?: boolean;
  accessibility_notes?: string;
  // New Event Attributes - Cultural Context
  religious_context?: string[];
  dietary_context?: string[];
  traditional_attire?: string;
  // New Event Attributes - Prerequisites
  skill_level?: string;
  prior_experience?: string;
  physical_fitness?: string;
  equipment_required?: string[];
  dress_code?: string;
  prerequisites_notes?: string;
  // New Event Attributes - Content & Intensity
  content_rating?: string;
  alcohol_served?: string;
  smoking_policy?: string;
  noise_level?: string;
  physical_intensity?: string;
  // New Event Attributes - Social Features
  networking_focus?: boolean;
  social_mixer?: boolean;
  ice_breakers?: boolean;
  group_activities?: boolean;
  team_building?: boolean;
  // New Event Attributes - Language
  primary_language?: string;
  secondary_languages?: string[];
  interpretation_available?: boolean;
  sign_language_interpreter?: boolean;
  // New Event Attributes - Type & Format
  format?: string;
  sub_category?: string;
  // New Event Attributes - Pricing
  refund_policy?: 'no_refunds' | 'refund_up_to_7_days' | 'refund_up_to_24_hours' | 'refund_up_to_1_hour' | 'custom';
  group_discounts?: boolean;
}

export interface OrganizerProfile {
  business_name?: string;
  full_name?: string;
  phone?: string;
  email?: string;
}
