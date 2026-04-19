import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/integrations/backend/client';
import type { ApprovalRequestResponse, ApprovalStatus } from '@/integrations/backend/types';

export type StatusFilter = 'all' | ApprovalStatus;

export interface ApprovalStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  waitlisted: number;
}

export function useApprovalRequests(eventId: string, statusFilter: StatusFilter) {
  const [requests, setRequests] = useState<ApprovalRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const filter = statusFilter === 'all' ? undefined : statusFilter;
      const data = await apiClient.getApprovalRequests(eventId, filter);
      setRequests(data);
    } catch (error) {
      console.error('Error fetching approval requests:', error);
      toast.error('Failed to load approval requests');
    } finally {
      setLoading(false);
    }
  }, [eventId, statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const stats: ApprovalStats = {
    total: requests.length,
    pending: requests.filter(r => r.approval_status === 'pending').length,
    approved: requests.filter(r => r.approval_status === 'approved').length,
    rejected: requests.filter(r => r.approval_status === 'rejected').length,
    waitlisted: requests.filter(r => r.approval_status === 'waitlisted').length,
  };

  return { requests, loading, stats, fetchRequests, setRequests };
}
