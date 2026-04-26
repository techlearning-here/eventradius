import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Users,
  Loader2,
  Search,
  Filter,
  RefreshCw,
  ArrowUp,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApprovalRequests, type StatusFilter } from '@/hooks/useApprovalRequests';
import { ApprovalStats } from './ApprovalStats';
import { ApprovalRequestCard } from './ApprovalRequestCard';
import { apiClient } from '@/integrations/backend/client';

interface EventApprovalManagerProps {
  eventId: string;
  eventTitle: string;
}

export function EventApprovalManager({ eventId, eventTitle }: EventApprovalManagerProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const { requests, loading, stats, fetchRequests, setRequests } = useApprovalRequests(
    eventId,
    statusFilter
  );

  // Debug mode - only show in development
  const isDebugMode = import.meta.env.VITE_FRONTEND_DEBUGGING === 'true';

  const handleAction = useCallback(
    async (participantId: string, action: 'approve' | 'reject' | 'waitlist') => {
      setProcessingId(participantId);
      try {
        const result = await apiClient.processApprovalAction(eventId, participantId, {
          action,
          rejection_reason: action === 'reject' ? 'Request declined by organizer' : undefined,
        });

        toast.success(
          action === 'approve'
            ? 'Request approved!'
            : action === 'waitlist'
            ? 'Added to waitlist'
            : 'Request declined'
        );

        // Update local state
        setRequests((prev) =>
          prev.map((req) =>
            req.id === participantId
              ? { ...req, approval_status: result.approval_status, is_waitlisted: result.is_waitlisted }
              : req
          )
        );
      } catch (error) {
        console.error('Action failed:', error);
        toast.error('Failed to process request');
      } finally {
        setProcessingId(null);
      }
    },
    [eventId, setRequests]
  );

  const handlePromoteFromWaitlist = useCallback(async () => {
    try {
      await apiClient.promoteFromWaitlist(eventId);
      toast.success('Promoted user from waitlist');
      fetchRequests();
    } catch (error) {
      console.error('Error promoting from waitlist:', error);
      toast.error('Failed to promote from waitlist');
    }
  }, [eventId, fetchRequests]);

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      !searchQuery ||
      req.requester_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requester_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requester_reason?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Approval Requests
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage requests for "{eventTitle}"
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Debug: Delete All Button */}
          {isDebugMode && (
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                if (!confirm('DEBUG: Delete ALL approval requests for this event? This cannot be undone.')) {
                  return;
                }
                setIsDeletingAll(true);
                try {
                  const result = await apiClient.deleteAllApprovalRequests(eventId);
                  toast.success(`Deleted ${result.deleted_count} approval requests`);
                  fetchRequests();
                } catch (error) {
                  console.error('Error deleting all requests:', error);
                  toast.error('Failed to delete approval requests');
                } finally {
                  setIsDeletingAll(false);
                }
              }}
              disabled={isDeletingAll}
              className="flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <Trash2 className="w-4 h-4" />
              Debug: Delete All
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRequests}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <ApprovalStats stats={stats} />

      {/* Promote from Waitlist Button */}
      {stats.waitlisted > 0 && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <ArrowUp className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <span className="font-medium">{stats.waitlisted}</span> user{stats.waitlisted !== 1 ? 's' : ''} on waitlist
            </p>
          </div>
          <Button
            size="sm"
            onClick={handlePromoteFromWaitlist}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Promote Next
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="waitlisted">Waitlisted</option>
            <option value="rejected">Declined</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery ? 'No requests match your search' : 'No approval requests yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <ApprovalRequestCard
              key={request.id}
              request={request}
              isExpanded={expandedRequest === request.id}
              onToggleExpand={() =>
                setExpandedRequest(expandedRequest === request.id ? null : request.id)
              }
              onAction={handleAction}
              processingId={processingId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default EventApprovalManager;
