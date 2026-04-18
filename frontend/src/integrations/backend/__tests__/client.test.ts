import { ApiClient, apiClient } from '../client';
import type { Event, UserProfile } from '../types';

// Mock fetch globally
global.fetch = jest.fn();

// Mock supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}));

// Mock dummyEvents
jest.mock('@/components/EventDetail/data/dummyEvents', () => ({
  dummyEvents: [],
  isDummyEvent: jest.fn(() => false),
}));

describe('ApiClient', () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
  let client: ApiClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new ApiClient('https://test-api.example.com');
  });

  describe('Basic API calls', () => {
    it('should make a GET request', async () => {
      const mockResponse = { data: { id: '1', title: 'Test Event' } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await (client as any).request('/events/1');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.example.com/events/1',
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });

    it('should make a POST request with body', async () => {
      const mockEvent: Partial<Event> = { title: 'New Event' };
      const mockResponse = { data: { id: '123', ...mockEvent } };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await (client as any).request('/events', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.example.com/events',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockEvent),
        })
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' }),
      } as Response);

      await expect((client as any).request('/events/999')).rejects.toThrow();
    });
  });

  describe('Event methods', () => {
    it('should create an event', async () => {
      const newEvent = {
        title: 'Test Event',
        description: 'Test Description',
        location: 'Test Location',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        category: 'Test',
        max_participants: 100,
        is_public: true,
        ticket_price: 0,
        require_approval: false,
        enable_waitlist: false,
      };

      const mockResponse = { data: { id: '123', ...newEvent } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await client.createEvent(newEvent);
      
      expect(result).toEqual(mockResponse.data);
    });

    it('should get an event by ID', async () => {
      const mockEvent: Event = {
        id: '123',
        title: 'Test Event',
        description: 'Test Description',
        location: 'Test Location',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        category: 'Test',
        max_participants: 100,
        is_public: true,
        organizer_id: 'user-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ticket_price: 10,
        require_approval: true,
        enable_waitlist: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockEvent }),
      } as Response);

      const result = await client.getEvent('123');
      
      expect(result).toEqual(mockEvent);
    });

    it('should update an event', async () => {
      const updates = { title: 'Updated Title' };
      const mockResponse = { data: { id: '123', ...updates } };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await client.updateEvent('123', updates);
      
      expect(result).toEqual(mockResponse.data);
    });

    it('should delete an event', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = await client.deleteEvent('123');
      
      expect(result).toBe(true);
    });

    it('should get all events', async () => {
      const mockEvents: Event[] = [
        {
          id: '1',
          title: 'Event 1',
          is_public: true,
          organizer_id: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Event,
        {
          id: '2',
          title: 'Event 2',
          is_public: true,
          organizer_id: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Event,
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockEvents }),
      } as Response);

      const result = await client.getEvents();
      
      expect(result).toEqual(mockEvents);
    });
  });

  describe('User methods', () => {
    it('should get current user profile', async () => {
      const mockUser: UserProfile = {
        user_id: 'user-1',
        email: 'test@example.com',
        full_name: 'Test User',
        created_at: new Date().toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockUser }),
      } as Response);

      const result = await client.getCurrentUserProfile();
      
      expect(result).toEqual(mockUser);
    });

    it('should update user profile', async () => {
      const updates = { full_name: 'Updated Name' };
      const mockResponse = { data: { user_id: 'user-1', ...updates } };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await client.updateUserProfile(updates);
      
      expect(result).toEqual(mockResponse.data);
    });

    it('should get user roles', async () => {
      const mockRoles = [
        { user_id: 'user-1', role: 'organizer' },
        { user_id: 'user-1', role: 'admin' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockRoles }),
      } as Response);

      const result = await client.getUserRoles('user-1');
      
      expect(result).toEqual(mockRoles);
    });

    it('should add user role', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { user_id: 'user-1', role: 'organizer' } }),
      } as Response);

      const result = await client.addUserRole('user-1', 'organizer');
      
      expect(result).toBe(true);
    });

    it('should get current user combined data', async () => {
      const mockCombined = {
        user: { user_id: 'user-1', email: 'test@example.com' },
        roles: ['organizer'],
        preferences: {},
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockCombined }),
      } as Response);

      const result = await client.getCurrentUserCombined();
      
      expect(result).toEqual(mockCombined);
    });
  });

  describe('Type exports', () => {
    it('should export ApiClient class', () => {
      expect(ApiClient).toBeDefined();
      expect(typeof ApiClient).toBe('function');
    });

    it('should export apiClient singleton', () => {
      expect(apiClient).toBeDefined();
      expect(apiClient).toBeInstanceOf(ApiClient);
    });
  });
});
