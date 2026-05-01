import { supabase } from '@/integrations/supabase/client';
import { dummyEvents, isDummyEvent } from '@/components/EventDetail/data/dummyEvents';
import type {
  Event,
  EventCreate,
  EventUpdate,
  UserProfile,
  UserUpdate,
  UserPreferences,
  UserRole,
  EventMessage,
  RefundPolicy,
  ApprovalRequestSubmit,
  ApprovalRequestResponse,
  ApprovalActionRequest,
  MyApprovalStatusResponse,
} from './types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://eventradius-api.onrender.com';

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

  // Update event location coordinates (frontend geocodes via Nominatim)
  async updateEventLocation(
    eventId: string,
    lat: number,
    lng: number,
    accuracy: string = 'rooftop'
  ): Promise<{ message: string; updated: boolean; coordinates: { latitude: number; longitude: number }; accuracy: string }> {
    return this.request(`/api/events/${eventId}/location`, {
      method: 'PUT',
      body: JSON.stringify({ lat, lng, accuracy }),
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
    return this.request<Event[]>('/api/events/deleted/me');
  }

  async seedDummyEvents(): Promise<{ message: string; events: { id: string; title: string }[] }> {
    return this.request<{ message: string; events: { id: string; title: string }[] }>('/api/events/seed-dummy-events', {
      method: 'POST',
    });
  }

  // Geolocation: Get nearby events within radius
  async getNearbyEvents(
    lat: number,
    lng: number,
    radius: number = 25
  ): Promise<Array<Event & { distance_km: number }>> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString(),
    });
    return this.request(`/api/events/discover/nearby?${params}`);
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

  // Geocode city name to coordinates (used during onboarding for custom cities)
  async geocodeCity(city: string): Promise<{
    name: string;
    lat: number;
    lng: number;
    country: string;
  }> {
    const params = new URLSearchParams({ city });
    return this.request(`/api/users/geocode/city?${params}`);
  }

  // Autocomplete city names as user types (Photon - free, no API key)
  async autocompleteCities(query: string, limit: number = 5): Promise<{
    cities: Array<{
      name: string;
      state: string;
      country: string;
      lat: number;
      lng: number;
      full_name: string;
    }>;
    query: string;
    count: number;
  }> {
    const params = new URLSearchParams({ query, limit: limit.toString() });
    return this.request(`/api/users/autocomplete/cities?${params}`);
  }

  // Geolocation endpoint - updates user location (frontend sends GPS coordinates, no Mapbox calls)
  async updateUserLocation(
    lat: number,
    lng: number,
    city?: string,
    distanceRange?: number
  ): Promise<{
    message: string;
    location: { lat: number; lng: number; city?: string };
    distance_range: number;
    data: UserPreferences;
  }> {
    return this.request('/api/users/me/location', {
      method: 'PUT',
      body: JSON.stringify({
        lat,
        lng,
        city,
        distance_range: distanceRange,
      }),
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

  // Approval Flow Endpoints
  async submitApprovalRequest(
    eventId: string,
    request: ApprovalRequestSubmit
  ): Promise<ApprovalRequestResponse> {
    return this.request<ApprovalRequestResponse>(`/api/events/${eventId}/request-approval`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getMyApprovalStatus(
    eventId: string,
    email?: string
  ): Promise<MyApprovalStatusResponse> {
    const params = email ? `?email=${encodeURIComponent(email)}` : '';
    return this.request<MyApprovalStatusResponse>(`/api/events/${eventId}/my-approval-status${params}`);
  }

  async getApprovalRequests(
    eventId: string,
    statusFilter?: 'pending' | 'approved' | 'rejected' | 'waitlisted' | 'cancellation_requested'
  ): Promise<ApprovalRequestResponse[]> {
    const params = statusFilter ? `?status_filter=${statusFilter}` : '';
    return this.request<ApprovalRequestResponse[]>(`/api/events/${eventId}/approval-requests${params}`);
  }

  async processApprovalAction(
    eventId: string,
    participantId: string,
    action: ApprovalActionRequest
  ): Promise<ApprovalRequestResponse> {
    return this.request<ApprovalRequestResponse>(`/api/events/${eventId}/approval/${participantId}/action`, {
      method: 'POST',
      body: JSON.stringify(action),
    });
  }

  async promoteFromWaitlist(eventId: string): Promise<ApprovalRequestResponse> {
    return this.request<ApprovalRequestResponse>(`/api/events/${eventId}/promote-from-waitlist`, {
      method: 'POST',
    });
  }

  // Debug: Delete all approval requests for an event
  async deleteAllApprovalRequests(eventId: string): Promise<{ deleted_count: number; event_id: string }> {
    return this.request<{ deleted_count: number; event_id: string }>(`/api/events/${eventId}/approval-requests`, {
      method: 'DELETE',
    });
  }

  // Get approval stats for all my events
  async getMyEventsApprovalStats(): Promise<Record<string, {
    total: number;
    pending: number;
    approved: number;
    waitlisted: number;
    rejected: number;
    cancellation_requested: number;
  }>> {
    return this.request('/api/events/my-events/approval-stats');
  }

  // Cancel approved event participation (immediate, no approval required)
  async cancelParticipation(eventId: string, reason?: string): Promise<{
    success: boolean;
    participant_id: string;
    removed: boolean;
    promoted_from_waitlist: boolean;
    promoted_participant_id?: string;
    message: string;
  }> {
    return this.request(`/api/events/${eventId}/cancel-participation`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // =====================================================
  // Dynamic Pricing API
  // =====================================================

  // Pricing Rules
  async createPricingRule(rule: {
    event_id: string;
    max_capacity: number;
    base_price: number;
    min_price: number;
    is_active?: boolean;
  }): Promise<{
    id: string;
    event_id: string;
    organizer_id: string;
    max_capacity: number;
    base_price: number;
    min_price: number;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
  }> {
    return this.request('/api/pricing/rules', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
  }

  async getPricingRule(eventId: string): Promise<{
    id: string;
    event_id: string;
    organizer_id: string;
    max_capacity: number;
    base_price: number;
    min_price: number;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
  }> {
    return this.request(`/api/pricing/rules/${eventId}`);
  }

  async updatePricingRule(eventId: string, updates: {
    max_capacity?: number;
    base_price?: number;
    min_price?: number;
    is_active?: boolean;
  }): Promise<{
    id: string;
    event_id: string;
    organizer_id: string;
    max_capacity: number;
    base_price: number;
    min_price: number;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
  }> {
    return this.request(`/api/pricing/rules/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deletePricingRule(eventId: string): Promise<void> {
    return this.request(`/api/pricing/rules/${eventId}`, {
      method: 'DELETE',
    });
  }

  async listOrganizerPricingRules(): Promise<Array<{
    id: string;
    event_id: string;
    organizer_id: string;
    max_capacity: number;
    base_price: number;
    min_price: number;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
  }>> {
    return this.request('/api/pricing/rules/organizer/list');
  }

  // Discount Rules
  async listDiscountRules(eventId?: string, isActive?: boolean): Promise<Array<{
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
  }>> {
    const params = new URLSearchParams();
    if (eventId) params.append('event_id', eventId);
    if (isActive !== undefined) params.append('is_active', isActive.toString());
    const query = params.toString();
    return this.request(`/api/pricing/discount-rules${query ? `?${query}` : ''}`);
  }

  async createDiscountRule(rule: {
    rule_name: string;
    rule_description?: string;
    occupancy_threshold: number;
    time_threshold: number;
    time_unit: 'hours' | 'days';
    discount_percent: number;
    is_active?: boolean;
    priority?: number;
    event_id?: string;
  }): Promise<{
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
  }> {
    return this.request('/api/pricing/discount-rules', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
  }

  async updateDiscountRule(
    ruleId: string,
    rule: Partial<{
      rule_name: string;
      rule_description?: string;
      occupancy_threshold: number;
      time_threshold: number;
      time_unit: 'hours' | 'days';
      discount_percent: number;
      is_active: boolean;
      priority: number;
      event_id?: string;
    }>
  ): Promise<{
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
  }> {
    return this.request(`/api/pricing/discount-rules/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify(rule),
    });
  }

  async deleteDiscountRule(ruleId: string): Promise<void> {
    return this.request(`/api/pricing/discount-rules/${ruleId}`, {
      method: 'DELETE',
    });
  }

  async evaluateDiscountRules(eventId: string, occupancyPercent: number, hoursBeforeEvent: number): Promise<{
    rule_matched: boolean;
    rule_id?: string;
    rule_name?: string;
    discount_percent?: number;
    priority?: number;
    message: string;
  }> {
    return this.request('/api/pricing/discount-rules/evaluate', {
      method: 'POST',
      body: JSON.stringify({
        event_id: eventId,
        occupancy_percent: occupancyPercent,
        hours_before_event: hoursBeforeEvent,
      }),
    });
  }

  // Inventory
  async updateInventory(eventId: string, ticketsSold: number): Promise<{
    id: string;
    event_id: string;
    tickets_sold: number;
    tickets_remaining: number;
    occupancy_percent: number;
    reported_by?: string;
    reported_at: string;
  }> {
    return this.request('/api/pricing/inventory', {
      method: 'POST',
      body: JSON.stringify({ event_id: eventId, tickets_sold: ticketsSold }),
    });
  }

  async getInventoryHistory(eventId: string): Promise<{
    snapshots: Array<{
      id: string;
      event_id: string;
      tickets_sold: number;
      tickets_remaining: number;
      occupancy_percent: number;
      reported_by?: string;
      reported_at: string;
    }>;
    latest_occupancy?: number;
    latest_remaining?: number;
  }> {
    return this.request(`/api/pricing/inventory/${eventId}/history`);
  }

  // Recommendations
  async listRecommendations(status?: 'pending' | 'approved' | 'rejected' | 'expired', recommendationType?: 'ai' | 'rule_based'): Promise<Array<{
    id: string;
    event_id: string;
    occupancy_percent: number;
    hours_remaining: number;
    recommended_discount_percent: number;
    recommended_price: number;
    status: string;
    recommendation_type: 'ai' | 'rule_based';
    rule_id?: string;
    rule_name?: string;
    created_at: string;
    decided_at?: string;
    decided_by?: string;
    promo_code?: {
      id: string;
      code: string;
      discount_percent: number;
      max_uses: number;
      times_claimed: number;
    };
  }>> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (recommendationType) params.append('recommendation_type', recommendationType);
    const query = params.toString();
    return this.request(`/api/pricing/recommendations${query ? `?${query}` : ''}`);
  }

  async generateRuleBasedRecommendation(eventId: string): Promise<{
    id: string;
    event_id: string;
    occupancy_percent: number;
    hours_remaining: number;
    recommended_discount_percent: number;
    recommended_price: number;
    status: string;
    recommendation_type: 'rule_based';
    rule_id?: string;
    rule_name?: string;
    created_at: string;
    decided_at?: string;
    decided_by?: string;
  }> {
    return this.request('/api/pricing/recommendations/generate/rule-based', {
      method: 'POST',
      body: JSON.stringify({ event_id: eventId }),
    });
  }

  async approveRecommendation(recommendationId: string, maxUses: number): Promise<{
    id: string;
    event_id: string;
    occupancy_percent: number;
    hours_remaining: number;
    recommended_discount_percent: number;
    recommended_price: number;
    status: string;
    created_at: string;
    decided_at?: string;
    decided_by?: string;
    promo_code?: {
      id: string;
      code: string;
      discount_percent: number;
      max_uses: number;
      times_claimed: number;
    };
  }> {
    return this.request(`/api/pricing/recommendations/${recommendationId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ max_uses: maxUses }),
    });
  }

  async rejectRecommendation(recommendationId: string, reason?: string): Promise<{
    id: string;
    event_id: string;
    occupancy_percent: number;
    hours_remaining: number;
    recommended_discount_percent: number;
    recommended_price: number;
    status: string;
    created_at: string;
    decided_at?: string;
    decided_by?: string;
  }> {
    return this.request(`/api/pricing/recommendations/${recommendationId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Promo Codes (Organizer)
  async listPromoCodes(eventId?: string, isActive?: boolean): Promise<Array<{
    id: string;
    event_id: string;
    code: string;
    discount_percent: number;
    discount_amount?: number;
    max_uses: number;
    times_claimed: number;
    times_used: number;
    valid_from: string;
    valid_until: string;
    is_active: boolean;
    estimated_commission?: number;
  }>> {
    const params = new URLSearchParams();
    if (eventId) params.append('event_id', eventId);
    if (isActive !== undefined) params.append('is_active', isActive.toString());
    const query = params.toString();
    return this.request(`/api/promo-codes${query ? `?${query}` : ''}`);
  }

  async deactivatePromoCode(promoCodeId: string): Promise<{
    id: string;
    event_id: string;
    code: string;
    is_active: boolean;
  }> {
    return this.request(`/api/promo-codes/${promoCodeId}/deactivate`, {
      method: 'POST',
    });
  }

  async regeneratePromoCode(promoCodeId: string): Promise<{
    id: string;
    event_id: string;
    code: string;
    discount_percent: number;
    max_uses: number;
    valid_until: string;
    is_active: boolean;
  }> {
    return this.request(`/api/promo-codes/${promoCodeId}/regenerate`, {
      method: 'POST',
    });
  }

  async getPromoCodeClaims(promoCodeId: string): Promise<Array<{
    id: string;
    user_id?: string;
    claimed_at: string;
    ip_address?: string;
    marked_as_used: boolean;
    marked_used_at?: string;
  }>> {
    return this.request(`/api/promo-codes/${promoCodeId}/claims`);
  }

  async getPromoCodeStats(): Promise<{
    active_deals: number;
    total_claims: number;
    total_used: number;
    estimated_commission: string;
  }> {
    return this.request('/api/promo-codes/stats/summary');
  }

  // Deals (Public)
  async getEventDeal(eventId: string): Promise<{
    has_active_deal: boolean;
    discount_percent?: number;
    discount_amount?: number;
    original_price?: number;
    discounted_price?: number;
    seats_remaining?: number;
    valid_until?: string;
    code?: string;
  }> {
    return this.request(`/api/deals/event/${eventId}`);
  }

  async listDeals(params?: {
    lat?: number;
    lng?: number;
    radius?: number;
    category?: string;
    limit?: number;
  }): Promise<Array<{
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
  }>> {
    const searchParams = new URLSearchParams();
    if (params?.lat !== undefined) searchParams.append('lat', params.lat.toString());
    if (params?.lng !== undefined) searchParams.append('lng', params.lng.toString());
    if (params?.radius) searchParams.append('radius', params.radius.toString());
    if (params?.category) searchParams.append('category', params.category);
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const query = searchParams.toString();
    return this.request(`/api/deals${query ? `?${query}` : ''}`);
  }

  async claimDeal(eventId: string): Promise<{
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
  }> {
    return this.request(`/api/deals/${eventId}/claim`, {
      method: 'POST',
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Also export the class for testing/custom instances
export { ApiClient };

