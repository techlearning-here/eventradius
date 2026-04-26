import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '@/integrations/backend/api';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { ThumbsUp, Check, X, UserCheck, Clock, AlertCircle, ListOrdered, Send } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';
import { RequestApprovalModal } from './events/RequestApprovalModal';
import type { Event, MyApprovalStatusResponse } from '@/integrations/backend/types';

// Module-level cache to persist across React StrictMode remounts
const globalRequestPromises = new Map<string, Promise<unknown>>();

type ParticipationStatus = 'interested' | 'going' | 'not_going';

interface Props {
  eventId: string;
  onAuthRequired?: () => void;
  preLoadedData?: { counts: { interested: number; going: number }; my_status: ParticipationStatus | null } | null;
  event?: Event; // Required for approval flow
}

export const EventParticipation = ({ eventId, onAuthRequired, preLoadedData, event }: Props) => {
  const { user } = useAuthWithBackend();
  const [currentStatus, setCurrentStatus] = useState<ParticipationStatus | null>(preLoadedData?.my_status ?? null);
  const [counts, setCounts] = useState(preLoadedData?.counts ?? { interested: 0, going: 0 });
  const [loading, setLoading] = useState(!preLoadedData);

  // Approval flow state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<MyApprovalStatusResponse | null>(null);
  const [isCheckingApproval, setIsCheckingApproval] = useState(false);

  // Check if this is a demo event
  const isDemoEvent = eventId && eventId.startsWith('demo-');
  const requiresApproval = event?.require_approval;

  const fetchParticipants = useCallback(async () => {
    console.log('[EventParticipation] fetchParticipants called', { eventId, hasPreloadedData: !!preLoadedData });
    if (preLoadedData) {
      console.log('[EventParticipation] Skipping fetch - pre-loaded data available');
      return; // Skip if pre-loaded data available
    }
    
    const cacheKey = `fetchParticipants-${eventId}-${user?.id || 'anon'}`;
    
    if (globalRequestPromises.has(cacheKey)) {
      const response = await globalRequestPromises.get(cacheKey) as { counts: { interested: number; going: number }; my_status: ParticipationStatus | null };
      setCurrentStatus(response.my_status);
      setCounts({
        interested: response.counts.interested,
        going: response.counts.going,
      });
      return;
    }
    
    const promise = apiClient.getEventParticipants(eventId);
    globalRequestPromises.set(cacheKey, promise);
    
    try {
      const response = await promise;
      setCounts({
        interested: response.counts.interested,
        going: response.counts.going,
      });
      if (user) {
        setCurrentStatus(response.my_status);
      }
    } catch (error) {
      console.error('Error fetching participant data:', error);
    } finally {
      setTimeout(() => globalRequestPromises.delete(cacheKey), 1000);
    }
  }, [eventId, user, preLoadedData]);

  const checkApprovalStatus = useCallback(async () => {
    if (isDemoEvent || !requiresApproval || !event) return;

    setIsCheckingApproval(true);
    try {
      const status = await apiClient.getMyApprovalStatus(eventId);
      setApprovalStatus(status);
    } catch (error) {
      console.error('Error checking approval status:', error);
    } finally {
      setIsCheckingApproval(false);
    }
  }, [eventId, requiresApproval, isDemoEvent, event]);

  useEffect(() => {
    console.log('[EventParticipation] useEffect triggered', { eventId, hasPreloadedData: !!preLoadedData, isDemoEvent });
    if (preLoadedData) {
      console.log('[EventParticipation] useEffect - skipping due to preLoadedData');
      return; // Skip fetch if pre-loaded data available
    }
    
    if (isDemoEvent) {
      // Use mock data for demo events
      setCounts({
        interested: Math.floor(Math.random() * 10) + 5,
        going: Math.floor(Math.random() * 20) + 10
      });
      setCurrentStatus(null); // Demo events start with no participation
    } else {
      fetchParticipants();
      checkApprovalStatus();
    }
  }, [eventId, user?.id, isDemoEvent, fetchParticipants, preLoadedData, checkApprovalStatus]);

  const handleClick = async (status: ParticipationStatus) => {
    if (isDemoEvent) {
      // Mock participation for demo events
      if (currentStatus === status) {
        setCurrentStatus(null);
        setCounts(prev => ({
          ...prev,
          [status]: Math.max(0, prev[status] - 1)
        }));
      } else {
        setCurrentStatus(status);
        setCounts(prev => ({
          interested: currentStatus ? prev.interested - 1 : prev.interested,
          going: currentStatus ? prev.going - 1 : prev.going,
          [status]: prev[status] + 1
        }));
      }
      return;
    }

    if (!user) {
      onAuthRequired?.();
      return;
    }
    setLoading(true);
    try {
      if (currentStatus === status) {
        // Remove participation
        await apiClient.leaveEvent(eventId);
        setCurrentStatus(null);
      } else if (currentStatus !== null) {
        // User is switching status - backend doesn't track status levels
        // Just update local state without API call
        setCurrentStatus(status);
      } else {
        // Add participation
        await apiClient.participateEvent(eventId);
        setCurrentStatus(status);
      }
      await fetchParticipants();
    } catch (error) {
      console.error('Error updating participation:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSuccess = () => {
    checkApprovalStatus();
  };

  const buttons: { status: ParticipationStatus; label: string; icon: typeof ThumbsUp }[] = [
    { status: 'interested', label: 'Interested', icon: ThumbsUp },
    { status: 'going', label: 'Going', icon: Check },
    { status: 'not_going', label: 'Not Going', icon: X },
  ];

  // If event requires approval, show approval flow UI
  if (requiresApproval && event) {
    // Show approval status if user has requested
    if (approvalStatus?.has_requested) {
      const statusConfig = {
        pending: {
          icon: Clock,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-200 dark:border-amber-800',
          title: 'Request Pending',
          message: 'Your request to join is being reviewed by the organizer.',
        },
        approved: {
          icon: UserCheck,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          title: 'Request Approved!',
          message: 'You are approved to attend this event.',
        },
        rejected: {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          title: 'Request Declined',
          message: approvalStatus.rejection_reason || 'Unfortunately, your request was not approved.',
        },
        waitlisted: {
          icon: ListOrdered,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          title: `Waitlisted #${approvalStatus.waitlist_position || ''}`,
          message: 'You are on the waitlist. You\'ll be notified if a spot opens up.',
        },
      };

      const config = statusConfig[approvalStatus.approval_status || 'pending'];
      const Icon = config.icon;

      return (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${config.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold ${config.color}`}>{config.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{config.message}</p>
              </div>
            </div>
          </div>

          {/* Only show participation buttons if approved */}
          {approvalStatus.approval_status === 'approved' && (
            <>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>👍 Interested: {counts.interested}</span>
                <span>✅ Going: {counts.going}</span>
              </div>
              <div className="flex gap-2">
                {buttons.map(({ status, label, icon: Icon }) => (
                  <button
                    key={status}
                    onClick={() => handleClick(status)}
                    disabled={loading}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium uppercase tracking-wider border transition-colors disabled:opacity-50 ${
                      currentStatus === status
                        ? 'bg-foreground text-background border-foreground'
                        : 'border-border hover:border-foreground'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      );
    }

    // Show Request Approval button if not yet requested
    return (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-blue-600">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300">Approval Required</h4>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                This event requires organizer approval to join. Submit your request with your details.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          disabled={isCheckingApproval}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium rounded-lg transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {isCheckingApproval ? 'Checking...' : 'Request to Join'}
        </button>

        {showRequestModal && (
          <RequestApprovalModal
            event={event}
            isOpen={showRequestModal}
            onClose={() => setShowRequestModal(false)}
            onSuccess={handleRequestSuccess}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>👍 Interested: {counts.interested}</span>
        <span>✅ Going: {counts.going}</span>
      </div>
      <div className="flex gap-2">
        {buttons.map(({ status, label, icon: Icon }) => (
          <button
            key={status}
            onClick={() => handleClick(status)}
            disabled={loading}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium uppercase tracking-wider border transition-colors disabled:opacity-50 ${
              currentStatus === status
                ? 'bg-foreground text-background border-foreground'
                : 'border-border hover:border-foreground'
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export const EventParticipationCounts = ({ 
  eventId, 
  preLoadedCounts 
}: { 
  eventId: string;
  preLoadedCounts?: { interested: number; going: number } | null;
}) => {
  const [counts, setCounts] = useState(preLoadedCounts ?? { interested: 0, going: 0 });

  // Check if this is a demo event
  const isDemoEvent = eventId && eventId.startsWith('demo-');

  const fetchCounts = useCallback(async () => {
    // Skip if pre-loaded data available
    if (preLoadedCounts) {
      return;
    }
    try {
      const response = await apiClient.getEventParticipants(eventId);
      setCounts({
        interested: response.counts.interested,
        going: response.counts.going,
      });
    } catch (error) {
      console.error('Error fetching participant counts:', error);
    }
  }, [eventId, preLoadedCounts]);

  useEffect(() => {
    // Update counts if preLoadedCounts changes
    if (preLoadedCounts) {
      setCounts(preLoadedCounts);
      return;
    }
    
    if (isDemoEvent) {
      // Use mock data for demo events
      setCounts({
        interested: Math.floor(Math.random() * 10) + 5,
        going: Math.floor(Math.random() * 20) + 10
      });
    } else {
      // Delay individual fetch to allow parent bulk fetch to complete first
      // This prevents N individual API calls when bulk data is loading
      const timeout = setTimeout(() => {
        // Double-check preLoadedCounts hasn't arrived during delay
        if (!preLoadedCounts) {
          fetchCounts();
        }
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [fetchCounts, isDemoEvent, preLoadedCounts]);

  if (counts.interested === 0 && counts.going === 0) return null;

  return (
    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
      {counts.interested > 0 && <span>👍 {counts.interested}</span>}
      {counts.going > 0 && <span>✅ {counts.going}</span>}
    </div>
  );
};
