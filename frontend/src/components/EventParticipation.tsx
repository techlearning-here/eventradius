import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '@/integrations/backend/api';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { ThumbsUp, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';

// Module-level cache to persist across React StrictMode remounts
const globalRequestPromises = new Map<string, Promise<unknown>>();

type ParticipationStatus = 'interested' | 'going' | 'not_going';

interface Props {
  eventId: string;
  onAuthRequired?: () => void;
  preLoadedData?: { counts: { interested: number; going: number }; my_status: ParticipationStatus | null } | null;
}

export const EventParticipation = ({ eventId, onAuthRequired, preLoadedData }: Props) => {
  const { user } = useAuthWithBackend();
  const [currentStatus, setCurrentStatus] = useState<ParticipationStatus | null>(preLoadedData?.my_status ?? null);
  const [counts, setCounts] = useState(preLoadedData?.counts ?? { interested: 0, going: 0 });
  const [loading, setLoading] = useState(!preLoadedData);

  // Check if this is a demo event
  const isDemoEvent = eventId && eventId.startsWith('demo-');

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
    }
  }, [eventId, user?.id, isDemoEvent, fetchParticipants, preLoadedData]);

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
      } else {
        // Add or update participation
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

  const buttons: { status: ParticipationStatus; label: string; icon: typeof ThumbsUp }[] = [
    { status: 'interested', label: 'Interested', icon: ThumbsUp },
    { status: 'going', label: 'Going', icon: Check },
    { status: 'not_going', label: 'Not Going', icon: X },
  ];

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
