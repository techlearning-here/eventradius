/**
 * Backend API client for Event Radius.
 * This client replaces direct Supabase calls with backend API calls.
 */
import { supabase } from '@/integrations/supabase/client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://eventradius-api.onrender.com';

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

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

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
}

class BackendClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = BACKEND_URL;
  }

  private async getAuthHeader(): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.access_token) {
      return {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      };
    }

    return {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeader();
      const url = `${this.baseUrl}${endpoint}`;

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          error: `HTTP ${response.status}: ${errorText || response.statusText}`,
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; database: string }>> {
    return this.request('/health');
  }

  // Events
  async getEvents(params?: {
    limit?: number;
    offset?: number;
    category?: string;
    is_public?: boolean;
  }): Promise<ApiResponse<Event[]>> {
    const queryParams = new URLSearchParams();

    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());
    if (params?.category) queryParams.set('category', params.category);
    if (params?.is_public !== undefined) queryParams.set('is_public', params.is_public.toString());

    const queryString = queryParams.toString();
    const endpoint = `/api/events${queryString ? `?${queryString}` : ''}`;

    return this.request<Event[]>(endpoint);
  }

  async getEvent(id: string): Promise<ApiResponse<Event>> {
    return this.request<Event>(`/api/events/${id}`);
  }

  async createEvent(event: Omit<Event, 'id' | 'organizer_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Event>> {
    return this.request<Event>('/api/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async updateEvent(id: string, event: Partial<Event>): Promise<ApiResponse<Event>> {
    return this.request<Event>(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  }

  async deleteEvent(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/api/events/${id}`, {
      method: 'DELETE',
    });
  }

  async participateEvent(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/api/events/${id}/participate`, {
      method: 'POST',
    });
  }

  async leaveEvent(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/api/events/${id}/participate`, {
      method: 'DELETE',
    });
  }

  // Users
  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>('/api/users/me');
  }

  async updateCurrentUser(profile: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  async getUserProfile(id: string): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>(`/api/users/${id}`);
  }

  async getUserEvents(): Promise<ApiResponse<{
    created: Event[];
    participating: Event[];
  }>> {
    return this.request<{
      created: Event[];
      participating: Event[];
    }>('/api/users/me/events');
  }

  // Auth helpers
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }
}

export const backendClient = new BackendClient();
