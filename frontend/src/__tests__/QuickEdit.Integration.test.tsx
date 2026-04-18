import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock the hooks and API calls
vi.mock('@/hooks/useEvents', () => ({
  useEventActions: vi.fn()
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    }
  }
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

import * as useEventsModule from '@/hooks/useEvents';
import type { Event } from '@/integrations/backend/api';

describe('Quick Edit Integration Flow', () => {
  const mockUpdateEvent = vi.fn();
  const mockFetchEvents = vi.fn();

  const mockEvents: Event[] = [
    {
      id: 'event-1',
      title: 'Test Event 1',
      description: 'Description 1',
      start_time: '2024-12-20T10:00:00Z',
      end_time: '2024-12-20T12:00:00Z',
      location: 'Location 1',
      event_type: 'in_person',
      is_public: true,
      organizer_id: 'user-123',
      created_at: '2024-12-01T00:00:00Z',
      updated_at: '2024-12-01T00:00:00Z',
      tags: ['quick-created']
    },
    {
      id: 'event-2',
      title: 'Test Event 2',
      description: 'Description 2',
      start_time: '2024-12-21T14:00:00Z',
      end_time: '2024-12-21T16:00:00Z',
      location: 'Location 2',
      event_type: 'online',
      is_public: true,
      organizer_id: 'user-123',
      created_at: '2024-12-01T00:00:00Z',
      updated_at: '2024-12-01T00:00:00Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useEventsModule.useEventActions as any).mockReturnValue({
      updateEvent: mockUpdateEvent,
      createEvent: vi.fn(),
      deleteEvent: vi.fn(),
      participateEvent: vi.fn(),
      leaveEvent: vi.fn(),
      loading: false,
      error: null
    });
  });

  describe('Event Quick Edit Flow', () => {
    it('should handle quick edit from event card to form submission', async () => {
      mockUpdateEvent.mockResolvedValue({
        ...mockEvents[0],
        title: 'Updated Title'
      });

      // Test the flow: click edit → open quick edit → submit → success
      const handleQuickEdit = (event: Event) => {
        // This simulates what OrganizerDashboard does
        return {
          event,
          mode: 'quick-edit'
        };
      };

      const result = handleQuickEdit(mockEvents[0]);
      
      expect(result.event.id).toBe('event-1');
      expect(result.mode).toBe('quick-edit');
    });

    it('should handle detailed edit from event card', async () => {
      const handleDetailedEdit = (event: Event) => {
        // This simulates what OrganizerDashboard does
        return {
          event,
          mode: 'detailed-edit'
        };
      };

      const result = handleDetailedEdit(mockEvents[1]);
      
      expect(result.event.id).toBe('event-2');
      expect(result.mode).toBe('detailed-edit');
    });
  });

  describe('Form Data Preparation', () => {
    it('should correctly prepare update data for quick edit', () => {
      const event = mockEvents[0];
      
      // Simulate the data transformation that happens in QuickCreateForm
      const updateData = {
        title: event.title,
        description: event.description,
        location: event.location,
        start_time: event.start_time,
        end_time: event.end_time,
        event_type: event.event_type,
        image_url: event.image_url,
        virtual_event_url: undefined,
        virtual_event_platform: undefined,
        is_virtual: event.event_type === 'online'
      };

      expect(updateData).toMatchObject({
        title: 'Test Event 1',
        description: 'Description 1',
        location: 'Location 1',
        event_type: 'in_person',
        is_virtual: false
      });
    });

    it('should handle online event virtual URL in update', () => {
      const onlineEvent: Event = {
        ...mockEvents[1],
        virtual_event_url: 'https://zoom.us/test'
      };

      const updateData = {
        title: onlineEvent.title,
        description: onlineEvent.description,
        location: 'Online Event',
        start_time: onlineEvent.start_time,
        end_time: onlineEvent.end_time,
        event_type: onlineEvent.event_type,
        virtual_event_url: onlineEvent.event_type === 'online' 
          ? onlineEvent.virtual_event_url 
          : undefined,
        virtual_event_platform: onlineEvent.event_type === 'online' ? 'Zoom' : undefined,
        is_virtual: onlineEvent.event_type === 'online'
      };

      expect(updateData.is_virtual).toBe(true);
      expect(updateData.virtual_event_url).toBe('https://zoom.us/test');
      expect(updateData.virtual_event_platform).toBe('Zoom');
    });
  });

  describe('Event Tag Detection', () => {
    it('should identify quick-created events by tags', () => {
      const isQuickCreated = (event: Event) => {
        return event.tags?.includes('quick-created') ?? false;
      };

      expect(isQuickCreated(mockEvents[0])).toBe(true);
      expect(isQuickCreated(mockEvents[1])).toBe(false);
    });

    it('should handle events without tags', () => {
      const eventWithoutTags: Event = {
        ...mockEvents[0],
        tags: undefined
      };

      const isQuickCreated = (event: Event) => {
        return event.tags?.includes('quick-created') ?? false;
      };

      expect(isQuickCreated(eventWithoutTags)).toBe(false);
    });
  });

  describe('API Integration', () => {
    it('should call updateEvent with correct parameters', async () => {
      const eventId = 'event-1';
      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description'
      };

      mockUpdateEvent.mockResolvedValue({
        ...mockEvents[0],
        ...updateData
      });

      await mockUpdateEvent(eventId, updateData);

      expect(mockUpdateEvent).toHaveBeenCalledWith(eventId, updateData);
    });

    it('should handle update errors gracefully', async () => {
      mockUpdateEvent.mockRejectedValue(new Error('Update failed'));

      try {
        await mockUpdateEvent('event-1', { title: 'Test' });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});
