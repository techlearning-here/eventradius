// Backend API Types
// All type definitions extracted from the main API module

// Refund policy enum matching database
export type RefundPolicy = 'no_refunds' | 'refund_up_to_7_days' | 'refund_up_to_24_hours' | 'refund_up_to_1_hour' | 'custom';

// Types for API responses
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
  created_at: string;
  updated_at: string;
  current_participants?: number;
  is_paid_event?: boolean;
  deleted_at?: string;
  // Quick Create fields
  ticket_price?: number;
  require_approval?: boolean;
  enable_waitlist?: boolean;
  approval_instructions?: string;
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
  event_type?: string;
  format?: string;
  sub_category?: string;
  // New Event Attributes - Pricing
  refund_policy?: RefundPolicy;
  group_discounts?: boolean;
  // Geocoded coordinates
  latitude?: number;
  longitude?: number;
  geolocation_accuracy?: string;
}

export interface EventCreate {
  title: string;
  description?: string;
  location?: string;
  start_time?: string;
  end_time?: string;
  image_url?: string;
  category?: string;
  max_participants?: number;
  is_public?: boolean;
  is_paid_event?: boolean;
  ticketing_website?: string;
  status?: 'draft' | 'published';
  // Event Wizard - Basic Info
  subtitle?: string;
  summary?: string;
  tags?: string[];
  language?: string;
  timezone?: string;
  event_format?: string;
  event_privacy?: string;
  // Event Wizard - Virtual Event
  virtual_event_url?: string;
  virtual_event_platform?: string;
  event_password?: string;
  // Event Wizard - Contact Info
  event_contact_email?: string;
  event_contact_phone?: string;
  event_contact_phone_country_code?: string;
  // Event Wizard - Venue
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
  // Event Wizard - Pricing & Additional
  ticket_pricing_description?: string;
  custom_refund_policy?: string;
  age_restriction?: string;
  accessibility_options?: string;
  event_website?: string;
  // New Event Attributes
  age_categories?: string[];
  gender_preference?: string;
  family_friendly?: boolean;
  senior_friendly?: boolean;
  singles_friendly?: boolean;
  couples_oriented?: boolean;
  wheelchair_accessible?: boolean;
  mobility_friendly?: boolean;
  hearing_accessible?: boolean;
  vision_accessible?: boolean;
  sensory_friendly?: boolean;
  service_animals_allowed?: boolean;
  accessibility_notes?: string;
  religious_context?: string[];
  dietary_context?: string[];
  traditional_attire?: string;
  skill_level?: string;
  prior_experience?: string;
  physical_fitness?: string;
  equipment_required?: string[];
  dress_code?: string;
  prerequisites_notes?: string;
  content_rating?: string;
  alcohol_served?: string;
  smoking_policy?: string;
  noise_level?: string;
  physical_intensity?: string;
  networking_focus?: boolean;
  social_mixer?: boolean;
  ice_breakers?: boolean;
  group_activities?: boolean;
  team_building?: boolean;
  primary_language?: string;
  secondary_languages?: string[];
  interpretation_available?: boolean;
  sign_language_interpreter?: boolean;
  event_type?: string;
  format?: string;
  sub_category?: string;
  refund_policy?: RefundPolicy;
  group_discounts?: boolean;
  // Geocoded coordinates
  latitude?: number;
  longitude?: number;
  geolocation_accuracy?: string;
}

export interface EventUpdate {
  title?: string;
  description?: string;
  location?: string;
  start_time?: string;
  end_time?: string;
  image_url?: string;
  category?: string;
  max_participants?: number;
  is_public?: boolean;
  is_paid_event?: boolean;
  ticketing_website?: string;
  // Event Wizard fields
  subtitle?: string;
  summary?: string;
  language?: string;
  timezone?: string;
  virtual_event_url?: string;
  virtual_event_platform?: string;
  event_contact_email?: string;
  event_contact_phone?: string;
  event_contact_phone_country_code?: string;
  venue_street?: string;
  venue_city?: string;
  venue_state?: string;
  venue_zip_code?: string;
  venue_country?: string;
  venue_building_name?: string;
  ticket_pricing_description?: string;
  custom_refund_policy?: string;
  // New Event Attributes
  age_categories?: string[];
  gender_preference?: string;
  family_friendly?: boolean;
  senior_friendly?: boolean;
  singles_friendly?: boolean;
  couples_oriented?: boolean;
  wheelchair_accessible?: boolean;
  mobility_friendly?: boolean;
  hearing_accessible?: boolean;
  vision_accessible?: boolean;
  sensory_friendly?: boolean;
  service_animals_allowed?: boolean;
  accessibility_notes?: string;
  religious_context?: string[];
  dietary_context?: string[];
  traditional_attire?: string;
  skill_level?: string;
  prior_experience?: string;
  physical_fitness?: string;
  equipment_required?: string[];
  dress_code?: string;
  prerequisites_notes?: string;
  content_rating?: string;
  alcohol_served?: string;
  smoking_policy?: string;
  noise_level?: string;
  physical_intensity?: string;
  networking_focus?: boolean;
  social_mixer?: boolean;
  ice_breakers?: boolean;
  group_activities?: boolean;
  team_building?: boolean;
  primary_language?: string;
  secondary_languages?: string[];
  interpretation_available?: boolean;
  sign_language_interpreter?: boolean;
  event_type?: string;
  format?: string;
  sub_category?: string;
  refund_policy?: RefundPolicy;
  group_discounts?: boolean;
  // Geocoded coordinates
  latitude?: number;
  longitude?: number;
  geolocation_accuracy?: string;
}

export interface UserProfile {
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  phone_country_code?: string;
  phone_verified?: boolean;
  email_verified?: boolean;
  organizer_status?: 'pending' | 'verified' | 'active' | 'suspended';
  created_at: string;
}

export interface EventMessage {
  id: string;
  event_id: string;
  sender_user_id: string;
  message_text: string;
  created_at: string;
}

export interface UserRole {
  user_id: string;
  role: string;
  created_at?: string;
}

export interface UserUpdate {
  full_name?: string;
  avatar_url?: string;
  bio?: string;
}

export interface UserPreferences {
  [key: string]: unknown;
}

export interface UserWithRoles extends UserProfile {
  roles: string[];
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

// Approval Flow Types
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'waitlisted';

export interface ApprovalRequestSubmit {
  requester_name: string;
  requester_email: string;
  requester_phone?: string;
  requester_bio?: string;
  requester_reason?: string;
  requester_social_links?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
    instagram?: string;
  };
}

export interface ApprovalRequestResponse {
  id: string;
  event_id: string;
  user_id?: string;
  approval_status: ApprovalStatus;
  requester_name?: string;
  requester_email?: string;
  requester_phone?: string;
  requester_bio?: string;
  requester_reason?: string;
  requester_social_links?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
    instagram?: string;
  };
  is_waitlisted: boolean;
  waitlist_position?: number;
  registered_at: string;
  approved_at?: string;
  rejection_reason?: string;
}

export interface ApprovalActionRequest {
  action: 'approve' | 'reject' | 'waitlist';
  rejection_reason?: string;
}

export interface MyApprovalStatusResponse {
  has_requested: boolean;
  approval_status?: ApprovalStatus;
  is_waitlisted: boolean;
  waitlist_position?: number;
  rejection_reason?: string;
  requested_at?: string;
}

export interface ApprovalRequestField {
  required: boolean;
  label: string;
}

export interface ApprovalRequestFields {
  name: ApprovalRequestField;
  email: ApprovalRequestField;
  phone: ApprovalRequestField;
  bio: ApprovalRequestField;
  reason: ApprovalRequestField;
  social_links: ApprovalRequestField;
}

// =====================================================
// Dynamic Pricing Types
// =====================================================

export interface PricingRule {
  id: string;
  event_id: string;
  organizer_id: string;
  max_capacity: number;
  base_price: number;
  min_price: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface PricingRuleCreate {
  event_id: string;
  max_capacity: number;
  base_price: number;
  min_price: number;
  is_active?: boolean;
}

export interface PricingRuleUpdate {
  max_capacity?: number;
  base_price?: number;
  min_price?: number;
  is_active?: boolean;
}

export interface InventorySnapshot {
  id: string;
  event_id: string;
  tickets_sold: number;
  tickets_remaining: number;
  occupancy_percent: number;
  reported_by?: string;
  reported_at: string;
}

export interface InventoryUpdateRequest {
  event_id: string;
  tickets_sold: number;
}

export type RecommendationStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type RecommendationType = 'ai' | 'rule_based';

export interface DiscountRecommendation {
  id: string;
  event_id: string;
  occupancy_percent: number;
  hours_remaining: number;
  recommended_discount_percent: number;
  recommended_price: number;
  status: RecommendationStatus;
  recommendation_type: RecommendationType;
  rule_id?: string;
  rule_name?: string;
  created_at: string;
  decided_at?: string;
  decided_by?: string;
  promo_code?: PromoCode;
}

export interface DiscountRule {
  id: string;
  organizer_id: string;
  event_id?: string;
  rule_name: string;
  rule_description?: string;
  occupancy_threshold: number;
  time_threshold: number;
  time_unit: 'hours' | 'days';
  discount_percent: number;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface DiscountRuleCreate {
  rule_name: string;
  rule_description?: string;
  occupancy_threshold: number;
  time_threshold: number;
  time_unit: 'hours' | 'days';
  discount_percent: number;
  is_active?: boolean;
  priority?: number;
  event_id?: string;
}

export interface DiscountRuleUpdate {
  rule_name?: string;
  rule_description?: string;
  occupancy_threshold?: number;
  time_threshold?: number;
  time_unit?: 'hours' | 'days';
  discount_percent?: number;
  is_active?: boolean;
  priority?: number;
  event_id?: string;
}

export interface EvaluateRuleRequest {
  event_id: string;
  occupancy_percent: number;
  hours_before_event: number;
}

export interface EvaluateRuleResponse {
  rule_matched: boolean;
  rule_id?: string;
  rule_name?: string;
  discount_percent?: number;
  priority?: number;
  message: string;
}

export interface PromoCode {
  id: string;
  event_id: string;
  recommendation_id?: string;
  code: string;
  discount_percent: number;
  discount_amount?: number;
  max_uses: number;
  times_claimed: number;
  times_used: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  commission_percent: number;
  estimated_commission?: number;
  created_at: string;
}

export interface PromoCodeClaim {
  id: string;
  promo_code_id: string;
  user_id?: string;
  claimed_at: string;
  ip_address?: string;
  user_agent?: string;
  marked_as_used: boolean;
  marked_used_at?: string;
}

export interface ApproveRecommendationRequest {
  max_uses: number;
}

export interface RejectRecommendationRequest {
  reason?: string;
}

export interface Deal {
  event_id: string;
  event_title: string;
  event_image_url?: string;
  event_start_time?: string;
  event_location?: string;
  promo_code_id: string;
  code: string;
  discount_percent: number;
  discount_amount?: number;
  original_price: number;
  discounted_price: number;
  seats_remaining: number;
  valid_until: string;
  latitude?: number;
  longitude?: number;
  category?: string;
}

export interface ClaimDealResponse {
  code: string;
  discount_percent: number;
  discount_amount?: number;
  original_price: number;
  discounted_price: number;
  valid_until: string;
  external_ticketing_url?: string;
  event_title: string;
  event_location?: string;
  event_start_time?: string;
}

export interface PromoCodeStats {
  active_deals: number;
  total_claims: number;
  total_used: number;
  estimated_commission: string;
}
