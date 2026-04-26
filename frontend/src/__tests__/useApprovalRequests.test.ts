import { renderHook, waitFor, act } from '@testing-library/react';
import { useApprovalRequests, StatusFilter, ApprovalStats } from '../hooks/useApprovalRequests';
import { apiClient } from '@/integrations/backend/client';
import type { ApprovalRequestResponse } from '@/integrations/backend/types';

// Mock the dependencies
jest.mock('@/integrations/backend/client', () => ({
  apiClient: {
    getApprovalRequests: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

import { toast } from 'sonner';

const mockGetApprovalRequests = apiClient.getApprovalRequests as jest.Mock;

describe('useApprovalRequests', () => {
  const mockRequests: ApprovalRequestResponse[] = [
    {
      id: 'req-1',
      event_id: 'event-123',
      user_id: 'user-1',
      approval_status: 'pending',
      requester_name: 'John Doe',
      requester_email: 'john@example.com',
      is_waitlisted: false,
      registered_at: '2024-01-15T10:00:00Z',
    },
    {
      id: 'req-2',
      event_id: 'event-123',
      user_id: 'user-2',
      approval_status: 'approved',
      requester_name: 'Jane Smith',
      requester_email: 'jane@example.com',
      is_waitlisted: false,
      registered_at: '2024-01-14T10:00:00Z',
      approved_at: '2024-01-14T12:00:00Z',
    },
    {
      id: 'req-3',
      event_id: 'event-123',
      user_id: 'user-3',
      approval_status: 'rejected',
      requester_name: 'Bob Wilson',
      requester_email: 'bob@example.com',
      is_waitlisted: false,
      registered_at: '2024-01-13T10:00:00Z',
    },
    {
      id: 'req-4',
      event_id: 'event-123',
      user_id: 'user-4',
      approval_status: 'waitlisted',
      requester_name: 'Alice Brown',
      requester_email: 'alice@example.com',
      is_waitlisted: true,
      waitlist_position: 1,
      registered_at: '2024-01-12T10:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Load', () => {
    test('should start with loading state', () => {
      mockGetApprovalRequests.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useApprovalRequests('event-123', 'all'));

      expect(result.current.loading).toBe(true);
      expect(result.current.requests).toEqual([]);
    });

    test('should fetch requests on mount', async () => {
      mockGetApprovalRequests.mockResolvedValueOnce(mockRequests);

      renderHook(() => useApprovalRequests('event-123', 'all'));

      await waitFor(() => {
        expect(mockGetApprovalRequests).toHaveBeenCalledWith('event-123', undefined);
      });
    });

    test('should update requests after fetch', async () => {
      mockGetApprovalRequests.mockResolvedValueOnce(mockRequests);

      const { result } = renderHook(() => useApprovalRequests('event-123', 'all'));

      await waitFor(() => {
        expect(result.current.requests).toEqual(mockRequests);
      });
    });

    test('should set loading to false after fetch', async () => {
      mockGetApprovalRequests.mockResolvedValueOnce(mockRequests);

      const { result } = renderHook(() => useApprovalRequests('event-123', 'all'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Status Filtering', () => {
    test('should pass filter parameter when statusFilter is not "all"', async () => {
      mockGetApprovalRequests.mockResolvedValueOnce(mockRequests.filter(r => r.approval_status === 'pending'));

      renderHook(() => useApprovalRequests('event-123', 'pending'));

      await waitFor(() => {
        expect(mockGetApprovalRequests).toHaveBeenCalledWith('event-123', 'pending');
      });
    });

    test('should not pass filter parameter when statusFilter is "all"', async () => {
      mockGetApprovalRequests.mockResolvedValueOnce(mockRequests);

      renderHook(() => useApprovalRequests('event-123', 'all'));

      await waitFor(() => {
        expect(mockGetApprovalRequests).toHaveBeenCalledWith('event-123', undefined);
      });
    });

    test.each(['pending', 'approved', 'rejected', 'waitlisted'] as StatusFilter[]) (
      'should pass %s filter to API',
      async (filter) => {
        mockGetApprovalRequests.mockResolvedValueOnce([]);

        renderHook(() => useApprovalRequests('event-123', filter));

        await waitFor(() => {
          expect(mockGetApprovalRequests).toHaveBeenCalledWith('event-123', filter);
        });
      }
    );
  });

  describe('Error Handling', () => {
    test('should show error toast on fetch failure', async () => {
      mockGetApprovalRequests.mockRejectedValueOnce(new Error('Network error'));

      renderHook(() => useApprovalRequests('event-123', 'all'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to load approval requests');
      });
    });

    test('should set loading to false on error', async () => {
      mockGetApprovalRequests.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useApprovalRequests('event-123', 'all'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    test('should keep empty requests on error', async () => {
      mockGetApprovalRequests.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useApprovalRequests('event-123', 'all'));

      await waitFor(() => {
        expect(result.current.requests).toEqual([]);
      });
    });
  });

  describe('Statistics Calculation', () => {
    test('should calculate correct stats', async () => {
      mockGetApprovalRequests.mockResolvedValueOnce(mockRequests);

      const { result } = renderHook(() => useApprovalRequests('event-123', 'all'));

      await waitFor(() => {
        expect(result.current.stats).toEqual({
          total: 4,
          pending: 1,
          approved: 1,
          rejected: 1,
          waitlisted: 1,
        });
      });
    });

    test('should calculate stats for empty requests', async () => {
      mockGetApprovalRequests.mockResolvedValueOnce([]);

      const { result } = renderHook(() => useApprovalRequests('event-123', 'all'));

      await waitFor(() => {
        expect(result.current.stats).toEqual({
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          waitlisted: 0,
        });
      });
    });

    test('should recalculate stats when requests change', async () => {
      mockGetApprovalRequests.mockResolvedValueOnce([mockRequests[0]]);

      const { result } = renderHook(
        ({ eventId, filter }) => useApprovalRequests(eventId, filter),
        {
          initialProps: { eventId: 'event-123', filter: 'all' as StatusFilter },
        }
      );

      await waitFor(() => {
        expect(result.current.stats.total).toBe(1);
      });

      // Use setRequests to update the requests directly
      act(() => {
        result.current.setRequests(mockRequests);
      });

      await waitFor(() => {
        expect(result.current.stats.total).toBe(4);
      });
    });
  });

  describe('Manual Refresh', () => {
    test('should provide fetchRequests function', async () => {
      mockGetApprovalRequests.mockResolvedValueOnce(mockRequests);

      const { result } = renderHook(() => useApprovalRequests('event-123', 'all'));

      await waitFor(() => {
        expect(result.current.fetchRequests).toBeDefined();
        expect(typeof result.current.fetchRequests).toBe('function');
      });
    });

    test('should refetch when fetchRequests is called', async () => {
      // Setup initial mock
      mockGetApprovalRequests.mockResolvedValueOnce(mockRequests);

      const { result } = renderHook(() => useApprovalRequests('event-123', 'all'));

      await waitFor(() => {
        expect(mockGetApprovalRequests).toHaveBeenCalledTimes(1);
        expect(result.current.requests.length).toBe(4);
      });

      // Setup mock for the manual refresh with a new request
      const updatedRequests = [...mockRequests, {
        id: 'req-5',
        event_id: 'event-123',
        user_id: 'user-5',
        approval_status: 'pending' as const,
        requester_name: 'New User',
        requester_email: 'new@example.com',
        is_waitlisted: false,
        registered_at: '2024-01-16T10:00:00Z',
      }];

      mockGetApprovalRequests.mockResolvedValueOnce(updatedRequests);

      act(() => {
        result.current.fetchRequests();
      });

      await waitFor(() => {
        expect(mockGetApprovalRequests).toHaveBeenCalledTimes(2);
        expect(result.current.requests.length).toBe(5);
        expect(result.current.requests[4].requester_name).toBe('New User');
      });
    });
  });

  describe('setRequests', () => {
    test('should provide setRequests function', async () => {
      mockGetApprovalRequests.mockResolvedValueOnce(mockRequests);

      const { result } = renderHook(() => useApprovalRequests('event-123', 'all'));

      await waitFor(() => {
        expect(result.current.setRequests).toBeDefined();
        expect(typeof result.current.setRequests).toBe('function');
      });
    });

    test('should update requests when setRequests is called', async () => {
      mockGetApprovalRequests.mockResolvedValueOnce(mockRequests);

      const { result } = renderHook(() => useApprovalRequests('event-123', 'all'));

      await waitFor(() => {
        expect(result.current.requests.length).toBe(4);
      });

      const newRequests = [mockRequests[0]];

      act(() => {
        result.current.setRequests(newRequests);
      });

      expect(result.current.requests).toEqual(newRequests);
    });

    test('should recalculate stats after setRequests', async () => {
      mockGetApprovalRequests.mockResolvedValueOnce(mockRequests);

      const { result } = renderHook(() => useApprovalRequests('event-123', 'all'));

      await waitFor(() => {
        expect(result.current.stats.total).toBe(4);
      });

      // Update to only approved requests
      const approvedOnly = mockRequests.filter(r => r.approval_status === 'approved');

      act(() => {
        result.current.setRequests(approvedOnly);
      });

      expect(result.current.stats).toEqual({
        total: 1,
        pending: 0,
        approved: 1,
        rejected: 0,
        waitlisted: 0,
      });
    });
  });

  describe('Event ID Changes', () => {
    test('should refetch when eventId changes', async () => {
      mockGetApprovalRequests.mockResolvedValueOnce(mockRequests);

      const { rerender } = renderHook(
        ({ eventId }) => useApprovalRequests(eventId, 'all'),
        {
          initialProps: { eventId: 'event-123' },
        }
      );

      await waitFor(() => {
        expect(mockGetApprovalRequests).toHaveBeenCalledWith('event-123', undefined);
      });

      mockGetApprovalRequests.mockResolvedValueOnce([]);

      rerender({ eventId: 'event-456' });

      await waitFor(() => {
        expect(mockGetApprovalRequests).toHaveBeenCalledWith('event-456', undefined);
        expect(mockGetApprovalRequests).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Filter Changes', () => {
    test('should refetch when statusFilter changes', async () => {
      mockGetApprovalRequests.mockResolvedValueOnce(mockRequests);

      const { rerender } = renderHook(
        ({ filter }) => useApprovalRequests('event-123', filter),
        {
          initialProps: { filter: 'all' as StatusFilter },
        }
      );

      await waitFor(() => {
        expect(mockGetApprovalRequests).toHaveBeenCalledWith('event-123', undefined);
      });

      mockGetApprovalRequests.mockResolvedValueOnce([]);

      rerender({ filter: 'pending' });

      await waitFor(() => {
        expect(mockGetApprovalRequests).toHaveBeenCalledWith('event-123', 'pending');
        expect(mockGetApprovalRequests).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Stats Interface', () => {
    test('should return correct ApprovalStats interface', async () => {
      mockGetApprovalRequests.mockResolvedValueOnce(mockRequests);

      const { result } = renderHook(() => useApprovalRequests('event-123', 'all'));

      await waitFor(() => {
        const stats: ApprovalStats = result.current.stats;
        expect(stats).toHaveProperty('total');
        expect(stats).toHaveProperty('pending');
        expect(stats).toHaveProperty('approved');
        expect(stats).toHaveProperty('rejected');
        expect(stats).toHaveProperty('waitlisted');
        expect(typeof stats.total).toBe('number');
        expect(typeof stats.pending).toBe('number');
        expect(typeof stats.approved).toBe('number');
        expect(typeof stats.rejected).toBe('number');
        expect(typeof stats.waitlisted).toBe('number');
      });
    });
  });
});
