/**
 * Test cases for API client
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient } from '@/integrations/backend/api';

// Mock fetch for testing
global.fetch = vi.fn();

describe('API Client Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage
    localStorage.clear();
  });

  describe('Authentication', () => {
    it('should add Authorization header when token exists', async () => {
      const mockResponse = { data: 'test' };
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Mock localStorage to have a token
      const mockToken = 'test-jwt-token';
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(() => mockToken),
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
        },
        writable: true,
      });

      // Mock supabase auth session
      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: {
          auth: {
            getSession: vi.fn().mockResolvedValue({
              data: { session: { access_token: mockToken } }
            })
          }
        }
      }));

      const result = await apiClient.getCurrentUserProfile();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/me'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should handle missing token gracefully', async () => {
      const mockResponse = { detail: 'Not authenticated' };
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => mockResponse,
      });

      // Mock localStorage to have no token
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(() => null),
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
        },
        writable: true,
      });

      // Mock supabase auth session with no token
      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: {
          auth: {
            getSession: vi.fn().mockResolvedValue({
              data: { session: null }
            })
          }
        }
      }));

      await expect(apiClient.getCurrentUserProfile()).rejects.toThrow('Not authenticated');
    });
  });

  describe('User Preferences', () => {
    it('should get user preferences successfully', async () => {
      const mockPreferences = {
        id: 'pref-id',
        user_id: 'user-id',
        onboarding_completed: false,
        is_organizer: false,
        distance_range: 25
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPreferences,
      });

      const result = await apiClient.getUserPreferences();

      expect(result).toEqual(mockPreferences);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/me/preferences'),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should update user preferences successfully', async () => {
      const updateData = {
        onboarding_completed: true,
        is_organizer: true,
        distance_range: 50
      };

      const mockResponse = { message: 'Preferences updated successfully' };
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.updateUserPreferences(updateData);

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/me/preferences'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData)
        })
      );
    });

    it('should handle preferences API errors', async () => {
      const mockError = { detail: 'Failed to fetch preferences' };
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => mockError,
      });

      await expect(apiClient.getUserPreferences()).rejects.toThrow('Failed to fetch preferences');
    });
  });

  describe('Events API', () => {
    it('should get events list', async () => {
      const mockEvents = [
        {
          id: 'event-1',
          title: 'Test Event 1',
          description: 'Description 1',
          location: 'Location 1',
          is_public: true,
          organizer_id: 'user-1'
        },
        {
          id: 'event-2',
          title: 'Test Event 2',
          description: 'Description 2',
          location: 'Location 2',
          is_public: true,
          organizer_id: 'user-2'
        }
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEvents,
      });

      const result = await apiClient.getEvents();

      expect(result).toEqual(mockEvents);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/events'),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should get single event', async () => {
      const mockEvent = {
        id: 'event-1',
        title: 'Test Event',
        description: 'Description',
        location: 'Location',
        is_public: true,
        organizer_id: 'user-1'
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEvent,
      });

      const result = await apiClient.getEvent('event-1');

      expect(result).toEqual(mockEvent);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/events/event-1'),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should send event message', async () => {
      const mockMessage = {
        id: 'msg-1',
        event_id: 'event-1',
        sender_user_id: 'user-1',
        message_text: 'Hello, world!',
        created_at: '2024-01-01T00:00:00Z'
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMessage,
      });

      const result = await apiClient.sendEventMessage('event-1', 'Hello, world!');

      expect(result).toEqual(mockMessage);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/events/event-1/messages'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ message_text: 'Hello, world!' })
        })
      );
    });

    it('should get event messages', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          event_id: 'event-1',
          sender_user_id: 'user-1',
          message_text: 'Hello',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'msg-2',
          event_id: 'event-1',
          sender_user_id: 'user-2',
          message_text: 'Hi there',
          created_at: '2024-01-01T00:01:00Z'
        }
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMessages,
      });

      const result = await apiClient.getEventMessages('event-1');

      expect(result).toEqual(mockMessages);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/events/event-1/messages'),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
  });

  describe('Admin API', () => {
    it('should get all profiles', async () => {
      const mockProfiles = [
        {
          user_id: 'user-1',
          email: 'user1@example.com',
          full_name: 'User One',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          user_id: 'user-2',
          email: 'user2@example.com',
          full_name: 'User Two',
          created_at: '2024-01-02T00:00:00Z'
        }
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfiles,
      });

      const result = await apiClient.getAllProfiles();

      expect(result).toEqual(mockProfiles);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/admin/profiles'),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should get all user roles', async () => {
      const mockRoles = [
        { user_id: 'user-1', role: 'user' },
        { user_id: 'user-2', role: 'organizer' },
        { user_id: 'user-3', role: 'admin' }
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoles,
      });

      const result = await apiClient.getAllUserRoles();

      expect(result).toEqual(mockRoles);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/admin/roles'),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should update event status', async () => {
      const mockResponse = { message: 'Event status updated successfully' };
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.adminUpdateEventStatus('event-1', 'approved', 'Looks good!');

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/admin/events/event-1/status'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ status: 'approved', admin_remark: 'Looks good!' })
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient.getCurrentUserProfile()).rejects.toThrow('Failed to fetch user profile: Network error');
    });

    it('should handle JSON parsing errors', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(apiClient.getCurrentUserProfile()).rejects.toThrow('Failed to fetch user profile: Invalid JSON');
    });

    it('should handle HTTP error status codes', async () => {
      const mockError = { detail: 'Internal server error' };
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => mockError,
      });

      await expect(apiClient.getCurrentUserProfile()).rejects.toThrow('Internal server error');
    });
  });
});
