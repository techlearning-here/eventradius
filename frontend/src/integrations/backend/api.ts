import { supabase } from '@/integrations/supabase/client';
import { dummyEvents, isDummyEvent } from '@/components/EventDetail/data/dummyEvents';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://eventradius-api.onrender.com';

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

// API client class
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Get auth token from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Event endpoints
  async getEvents(params: {
    limit?: number;
    offset?: number;
    category?: string;
    is_public?: boolean;
  } = {}): Promise<Event[]> {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());
    if (params.category) searchParams.append('category', params.category);
    if (params.is_public !== undefined) searchParams.append('is_public', params.is_public.toString());

    const query = searchParams.toString();
    return this.request<Event[]>(`/api/events/${query ? `?${query}` : ''}`);
  }

  async getEvent(eventId: string): Promise<Event> {
    // Check if it's a dummy event first
    if (isDummyEvent(eventId)) {
      const dummyEvent = dummyEvents[eventId];
      if (dummyEvent) {
        return dummyEvent as Event;
      }
    }
    return this.request<Event>(`/api/events/${eventId}`);
  }

  async createEvent(event: EventCreate): Promise<Event> {
    const body = JSON.stringify(event);
    console.log('=== API CLIENT DEBUG ===');
    console.log('createEvent URL: /api/events');
    console.log('Request body:', body);
    console.log('Parsed body:', JSON.parse(body));
    console.log('========================');
    return this.request<Event>('/api/events', {
      method: 'POST',
      body: body,
    });
  }

  async updateEvent(eventId: string, event: EventUpdate): Promise<Event> {
    return this.request<Event>(`/api/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  }

  async deleteEvent(eventId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  async restoreEvent(eventId: string): Promise<Event> {
    return this.request<Event>(`/api/events/${eventId}/restore`, {
      method: 'POST',
    });
  }

  async getDeletedEvents(): Promise<Event[]> {
    return this.request<Event[]>('/api/events/deleted');
  }

  async seedDummyEvents(): Promise<{ message: string; events: { id: string; title: string }[] }> {
    return this.request<{ message: string; events: { id: string; title: string }[] }>('/api/events/seed-dummy-events', {
      method: 'POST',
    });
  }

  async getDeletedEvent(eventId: string): Promise<Event> {
    return this.request<Event>(`/api/events/deleted/${eventId}`);
  }

  async participateEvent(eventId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/events/${eventId}/participate`, {
      method: 'POST',
    });
  }

  async leaveEvent(eventId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/events/${eventId}/participate`, {
      method: 'DELETE',
    });
  }

  async checkIsRegistered(eventId: string): Promise<boolean> {
    const response = await this.request<{ is_registered: boolean }>(`/api/events/${eventId}/is-registered`);
    return response.is_registered;
  }

  async getEventParticipants(eventId: string): Promise<{
    event_id: string;
    counts: { interested: number; going: number; not_going: number };
    total: number;
    my_status: 'interested' | 'going' | 'not_going' | null;
    is_registered: boolean;
  }> {
    return this.request(`/api/events/${eventId}/participants`);
  }

  // Bulk participant counts - reduces API calls from N to 1 for event listings
  async getBulkEventParticipants(eventIds: string[]): Promise<{
    [eventId: string]: {
      event_id: string;
      counts: { interested: number; going: number; not_going: number };
      total: number;
      my_status: 'interested' | 'going' | 'not_going' | null;
      is_registered: boolean;
    };
  }> {
    if (eventIds.length === 0) return {};
    return this.request('/api/events/participants/bulk', {
      method: 'POST',
      body: JSON.stringify(eventIds),
    });
  }

  // User endpoints
  async getCurrentUserProfile(): Promise<UserProfile> {
    return this.request<UserProfile>('/api/users/me');
  }

  async updateUserProfile(profile: UserUpdate): Promise<UserProfile> {
    return this.request<UserProfile>('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    return this.request<UserProfile>(`/api/users/${userId}`);
  }

  // Combined user data endpoint - reduces API calls from 3 to 1
  async getCurrentUserCombined(): Promise<{
    user_id: string;
    email: string;
    profile: UserProfile;
    roles: string[];
    preferences: UserPreferences;
  }> {
    return this.request('/api/users/me/combined');
  }

  async getUserEvents(): Promise<{
    created: Event[];
    participating: Event[];
  }> {
    return this.request<{
      created: Event[];
      participating: Event[];
    }>('/api/users/me/events');
  }

  // User roles endpoints
  async getUserRoles(): Promise<{ roles: string[] }> {
    return this.request<{ roles: string[] }>('/api/users/me/roles');
  }

  async addUserRole(role: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/users/me/roles', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  }

  // User preferences endpoints
  async getUserPreferences(): Promise<UserPreferences> {
    return this.request<UserPreferences>('/api/users/me/preferences');
  }

  async updateUserPreferences(preferences: UserPreferences): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/users/me/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Event endpoints
  async sendEventMessage(eventId: string, message: string): Promise<EventMessage> {
    return this.request<EventMessage>(`/api/events/${eventId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message_text: message }),
    });
  }

  async getEventMessages(eventId: string): Promise<EventMessage[]> {
    return this.request<EventMessage[]>(`/api/events/${eventId}/messages`);
  }

  // Admin endpoints
  async getAllProfiles(): Promise<UserProfile[]> {
    return this.request<UserProfile[]>('/api/users/admin/profiles');
  }

  async getAllUserRoles(): Promise<UserRole[]> {
    return this.request<UserRole[]>('/api/users/admin/roles');
  }

  async adminUpdateEventStatus(eventId: string, status: string, adminRemark?: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/users/admin/events/${eventId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, admin_remark: adminRemark }),
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; database?: string }> {
    return this.request<{ status: string; database?: string }>('/health');
  }

  async updatePhoneNumber(phoneData: {
    phone?: string;
    phone_country_code?: string;
  }): Promise<{
    message: string;
    phone?: string;
    phone_country_code?: string;
    phone_verified: boolean;
  }> {
    return this.request('/api/users/me/phone', {
      method: 'PUT',
      body: JSON.stringify(phoneData),
    });
  }

  async getOrganizerStatus(): Promise<{
    is_organizer: boolean;
    requires_phone: boolean;
    requires_verification: boolean;
    has_phone: boolean;
    phone_verified: boolean;
    email_verified: boolean;
    organizer_status: 'pending' | 'verified' | 'active' | 'suspended' | null;
    is_active: boolean;
    phone?: string;
    phone_country_code?: string;
  }> {
    return this.request('/api/users/me/organizer-status');
  }

  // Verification endpoints
  async sendEmailVerification(email: string): Promise<{
    message: string;
    expires_at: string;
    token?: string; // Only for testing
  }> {
    return this.request('/api/verification/email/send', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async sendPhoneVerification(phoneData: {
    phone: string;
    phone_country_code: string;
  }): Promise<{
    message: string;
    expires_at: string;
    token?: string; // Only for testing
  }> {
    return this.request('/api/verification/phone/send', {
      method: 'POST',
      body: JSON.stringify(phoneData),
    });
  }

  async verifyToken(token: string, type: 'email' | 'phone'): Promise<{
    message: string;
    activation_message?: string;
  }> {
    return this.request('/api/verification/verify', {
      method: 'POST',
      body: JSON.stringify({ token, type }),
    });
  }

  async getVerificationStatus(): Promise<{
    email_verified: boolean;
    phone_verified: boolean;
    organizer_status: 'pending' | 'verified' | 'active' | 'suspended';
    is_active_organizer: boolean;
    email_verification_sent: boolean;
    phone_verification_sent: boolean;
  }> {
    return this.request('/api/verification/status');
  }

  // Organizer-specific endpoints
  async getOrganizerVerificationStatus(): Promise<{
    is_organizer: boolean;
    email_verified: boolean;
    phone_verified: boolean;
    phone_provided: boolean;
    email_verification_sent: boolean;
    phone_verification_sent: boolean;
    email_verification_expires_at?: string;
    phone_verification_expires_at?: string;
    organizer_status?: 'pending' | 'verified' | 'active' | 'suspended';
    is_active: boolean;
    can_create_events: boolean;
    missing_requirements: string[];
    next_actions: string[];
  }> {
    return this.request('/api/organizers/verification-status');
  }

  async checkOrganizerActivation(): Promise<{
    is_organizer: boolean;
    is_active: boolean;
    can_create_events: boolean;
    organizer_status?: 'pending' | 'verified' | 'active' | 'suspended';
    quick_status: 'not_organizer' | 'active' | 'needs_setup' | 'needs_email_verification' | 'needs_phone' | 'needs_phone_verification' | 'pending_activation' | 'unknown';
  }> {
    return this.request('/api/organizers/activation-check');
  }

  async requestOrganizerActivation(): Promise<{
    message: string;
    status: 'activated' | 'already_active';
    organizer_status: 'pending' | 'verified' | 'active' | 'suspended';
  }> {
    return this.request('/api/organizers/request-activation', {
      method: 'POST',
    });
  }

  // OAuth endpoints
  async createOrUpdateOAuthProfile(profile: {
    provider: string;
    provider_id: string;
    full_name?: string;
    avatar_url?: string;
  }): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/auth/oauth/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  async getOAuthProfile(): Promise<{
    id: string;
    user_id: string;
    provider: string;
    provider_id: string;
    full_name?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
  }> {
    return this.request('/api/auth/oauth/profile');
  }

  async linkOAuthAccount(profile: {
    provider: string;
    provider_id: string;
    full_name?: string;
    avatar_url?: string;
  }): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/auth/oauth/link', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  async unlinkOAuthAccount(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/auth/oauth/unlink', {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Also export the class for cases where it's needed
export { ApiClient };
