import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/integrations/backend/api';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { ThumbsUp, Check, X, UserCheck, Clock, AlertCircle, ListOrdered, Send, LogOut, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';
import { RequestApprovalModal } from './RequestApprovalModal';
import type { Event, MyApprovalStatusResponse } from '@/integrations/backend/types';

type ParticipationStatus = 'interested' | 'going' | 'not_going';

interface Props {
  event: Event;
  onAuthRequired?: () => void;
}

export const EventParticipation = ({ event, onAuthRequired }: Props) => {
  const { user } = useAuthWithBackend();
  const [currentStatus, setCurrentStatus] = useState<ParticipationStatus | null>(null);
  const [counts, setCounts] = useState({ interested: 0, going: 0 });
  const [loading, setLoading] = useState(false);

  // Approval flow state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<MyApprovalStatusResponse | null>(null);
  const [isCheckingApproval, setIsCheckingApproval] = useState(false);
  
  // Cancellation state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const eventId = event.id;

  // Check if this is a demo event
  const isDemoEvent = eventId && eventId.startsWith('demo-');
  const requiresApproval = event.require_approval;

  const fetchParticipants = useCallback(async () => {
    if (!user) return; // Skip API call if not logged in
    try {
      const response = await apiClient.getEventParticipants(eventId);
      setCounts({
        interested: response.counts.interested,
        going: response.counts.going,
      });
      setCurrentStatus(response.my_status);
    } catch (error) {
      console.error('Error fetching participant data:', error);
    }
  }, [eventId, user]);

  const checkApprovalStatus = useCallback(async () => {
    if (isDemoEvent || !requiresApproval) return;

    setIsCheckingApproval(true);
    try {
      // For logged-in users, check by user_id; for guests, we would need email
      const status = await apiClient.getMyApprovalStatus(eventId);
      setApprovalStatus(status);
    } catch (error) {
      console.error('Error checking approval status:', error);
    } finally {
      setIsCheckingApproval(false);
    }
  }, [eventId, requiresApproval, isDemoEvent]);

  useEffect(() => {
    if (isDemoEvent) {
      // Use mock data for demo events
      setCounts({
        interested: Math.floor(Math.random() * 10) + 5,
        going: Math.floor(Math.random() * 20) + 10
      });
      setCurrentStatus(null);
    } else {
      fetchParticipants();
      checkApprovalStatus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, user?.id, isDemoEvent]);

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
  if (requiresApproval) {
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
              
              {/* Cancel Participation Button */}
              <button
                onClick={() => {
                  console.log('Cancel Participation button clicked');
                  setShowCancelModal(true);
                }}
                disabled={loading || isSubmittingCancel}
                className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                Cancel Participation
              </button>
              
              {/* Cancellation Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold">Cancel Participation</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to cancel your participation? This will immediately free up your spot for others.
              </p>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-4">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  <strong>Note:</strong> If there's a waitlist, the next person will automatically get your spot.
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Reason (optional)</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Tell the organizer why you need to cancel..."
                  className="w-full px-3 py-2 border rounded-lg text-sm min-h-[80px] resize-none"
                  disabled={isSubmittingCancel}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    console.log('User chose to keep their spot');
                    setShowCancelModal(false);
                    setCancelReason('');
                  }}
                  disabled={isSubmittingCancel}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors disabled:opacity-50"
                >
                  No, Keep My Spot
                </button>
                <button
                  onClick={async () => {
                    console.log('User confirmed cancellation');
                    console.log('Event ID:', eventId);
                    console.log('Cancel reason:', cancelReason);
                    setIsSubmittingCancel(true);
                    try {
                      console.log('Calling apiClient.cancelParticipation...');
                      const result = await apiClient.cancelParticipation(eventId, cancelReason || undefined);
                      console.log('Cancellation result:', result);
                      toast.success('You have successfully cancelled your participation.');
                      setShowCancelModal(false);
                      setCancelReason('');
                      checkApprovalStatus();
                    } catch (error) {
                      console.error('Error cancelling participation:', error);
                      toast.error('Failed to cancel participation');
                    } finally {
                      setIsSubmittingCancel(false);
                    }
                  }}
                  disabled={isSubmittingCancel}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
                >
                  {isSubmittingCancel ? 'Cancelling...' : 'Cancel Participation'}
                </button>
              </div>
            </div>
          </div>
        )}
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

  // Standard participation UI for non-approval events
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

export const EventParticipationCounts = ({ eventId }: { eventId: string }) => {
  const { user } = useAuthWithBackend();
  const [counts, setCounts] = useState({ interested: 0, going: 0 });

  // Check if this is a demo event
  const isDemoEvent = eventId && eventId.startsWith('demo-');

  useEffect(() => {
    if (isDemoEvent) {
      // Use mock data for demo events
      setCounts({
        interested: Math.floor(Math.random() * 10) + 5,
        going: Math.floor(Math.random() * 20) + 10
      });
    } else if (user) {
      // Only fetch if user is logged in
      const fetch = async () => {
        try {
          const response = await apiClient.getEventParticipants(eventId);
          setCounts({
            interested: response.counts.interested,
            going: response.counts.going,
          });
        } catch (error) {
          console.error('Error fetching participant counts:', error);
        }
      };
      fetch();
    }
  }, [eventId, isDemoEvent, user]);

  if (counts.interested === 0 && counts.going === 0) return null;

  return (
    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
      {counts.interested > 0 && <span>👍 {counts.interested}</span>}
      {counts.going > 0 && <span>✅ {counts.going}</span>}
    </div>
  );
};
