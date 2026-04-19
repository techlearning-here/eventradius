import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  ClipboardCheck,
  Calendar,
  Users,
  Clock,
  ArrowRight,
  Loader2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  ListOrdered,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/integrations/backend/client';
import { EventApprovalManager } from './EventApprovalManager';
import type { Event } from '@/integrations/backend/types';

interface ApprovalStats {
  total: number;
  pending: number;
  approved: number;
  waitlisted: number;
  rejected: number;
  cancellation_requested: number;
}

export const ApprovalRequestsDashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<Record<string, ApprovalStats>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch user's events and approval stats in parallel
      const [userEventsResponse, approvalStats] = await Promise.all([
        apiClient.getUserEvents(),
        apiClient.getMyEventsApprovalStats(),
      ]);

      console.log('Approval stats from API:', approvalStats);
      console.log('Event IDs in stats:', Object.keys(approvalStats || {}));

      // Filter events that have require_approval set to true
      const approvalEvents = (userEventsResponse.created || []).filter(
        (event) => event.require_approval
      );

      console.log('My approval events:', approvalEvents.map(e => ({ id: e.id, title: e.title })));

      setEvents(approvalEvents);
      setStats(approvalStats);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = events.filter(
    (event) =>
      !searchQuery ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If an event is selected, show its approval manager
  if (selectedEvent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedEvent(null)}
            className="flex items-center gap-2"
          >
            ← Back to Events
          </Button>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {selectedEvent.title}
          </h2>
        </div>
        <EventApprovalManager
          eventId={selectedEvent.id}
          eventTitle={selectedEvent.title}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-rose-600" />
            Approval Requests
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage approval requests for your events
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchEvents}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                <ClipboardCheck className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {events.length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Events Requiring Approval
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search events by title or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Events List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery
              ? 'No events match your search'
              : 'No events require approval. Toggle "Require Approval" in Quick Create or Event Wizard.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <Card
              key={event.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedEvent(event)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {event.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className="text-rose-600 border-rose-200"
                      >
                        Approval Required
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(event.start_time).toLocaleDateString()}
                      </span>
                      {event.enable_waitlist && (
                        <Badge
                          variant="secondary"
                          className="text-xs"
                        >
                          Waitlist Enabled
                        </Badge>
                      )}
                    </div>
                    {/* Approval Stats */}
                    {(() => {
                      const eventStats = stats[event.id];
                      if (!eventStats || eventStats.total === 0) {
                        return (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="grid grid-cols-6 gap-2 text-center">
                              <div className="bg-gray-50 rounded px-2 py-1.5">
                                <div className="text-lg font-bold text-gray-900">0</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wide">Total</div>
                              </div>
                              <div className="bg-amber-50 rounded px-2 py-1.5">
                                <div className="text-lg font-bold text-amber-700">0</div>
                                <div className="text-[10px] text-amber-600 uppercase tracking-wide">Pending</div>
                              </div>
                              <div className="bg-green-50 rounded px-2 py-1.5">
                                <div className="text-lg font-bold text-green-700">0</div>
                                <div className="text-[10px] text-green-600 uppercase tracking-wide">Approved</div>
                              </div>
                              <div className="bg-blue-50 rounded px-2 py-1.5">
                                <div className="text-lg font-bold text-blue-700">0</div>
                                <div className="text-[10px] text-blue-600 uppercase tracking-wide">Waitlisted</div>
                              </div>
                              <div className="bg-red-50 rounded px-2 py-1.5">
                                <div className="text-lg font-bold text-red-700">0</div>
                                <div className="text-[10px] text-red-600 uppercase tracking-wide">Declined</div>
                              </div>
                              <div className="bg-purple-50 rounded px-2 py-1.5">
                                <div className="text-lg font-bold text-purple-700">0</div>
                                <div className="text-[10px] text-purple-600 uppercase tracking-wide">Cancel</div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="grid grid-cols-6 gap-2 text-center">
                            <div className="bg-gray-50 rounded px-2 py-1.5">
                              <div className="text-lg font-bold text-gray-900">{eventStats.total}</div>
                              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Total</div>
                            </div>
                            <div className="bg-amber-50 rounded px-2 py-1.5">
                              <div className="text-lg font-bold text-amber-700">{eventStats.pending}</div>
                              <div className="text-[10px] text-amber-600 uppercase tracking-wide">Pending</div>
                            </div>
                            <div className="bg-green-50 rounded px-2 py-1.5">
                              <div className="text-lg font-bold text-green-700">{eventStats.approved}</div>
                              <div className="text-[10px] text-green-600 uppercase tracking-wide">Approved</div>
                            </div>
                            <div className="bg-blue-50 rounded px-2 py-1.5">
                              <div className="text-lg font-bold text-blue-700">{eventStats.waitlisted}</div>
                              <div className="text-[10px] text-blue-600 uppercase tracking-wide">Waitlisted</div>
                            </div>
                            <div className="bg-red-50 rounded px-2 py-1.5">
                              <div className="text-lg font-bold text-red-700">{eventStats.rejected}</div>
                              <div className="text-[10px] text-red-600 uppercase tracking-wide">Declined</div>
                            </div>
                            <div className="bg-purple-50 rounded px-2 py-1.5">
                              <div className="text-lg font-bold text-purple-700">{eventStats.cancellation_requested || 0}</div>
                              <div className="text-[10px] text-purple-600 uppercase tracking-wide">Cancel</div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApprovalRequestsDashboard;
