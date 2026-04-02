import { useState, useEffect, useCallback } from 'react';
import { apiClient, type Event } from '@/integrations/backend/api';

export const useUserEvents = () => {
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [participatingEvents, setParticipatingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userEventsData = await apiClient.getUserEvents();
      setCreatedEvents(userEventsData.created);
      setParticipatingEvents(userEventsData.participating);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserEvents();
  }, [fetchUserEvents]);

  return {
    createdEvents,
    participatingEvents,
    loading,
    error,
    refetch: fetchUserEvents,
  };
};
