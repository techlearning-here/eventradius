import { supabase } from '@/integrations/supabase/client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://eventradius-api.onrender.com';

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
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
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
    return this.request<Event[]>(`/api/events${query ? `?${query}` : ''}`);
  }

  async getEvent(eventId: string): Promise<Event> {
    return this.request<Event>(`/api/events/${eventId}`);
  }

  async createEvent(event: EventCreate): Promise<Event> {
    return this.request<Event>('/api/events', {
      method: 'POST',
      body: JSON.stringify(event),
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
      body: JSON.stringify(role),
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

  // Admin endpoints
  async getAllUsers(): Promise<UserWithRoles[]> {
    return this.request<UserWithRoles[]>('/api/users/admin/users');
  }

  async updateEventStatus(eventId: string, status: string, adminRemark?: string): Promise<{ message: string }> {
    const body = adminRemark ? { status, admin_remark: adminRemark } : { status };
    return this.request<{ message: string }>(`/api/events/${eventId}/status`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; database?: string }> {
    return this.request<{ status: string; database?: string }>('/health');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
