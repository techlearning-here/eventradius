import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient, type Event, type EventCreate, type EventUpdate } from '@/integrations/backend/api';

export type { EventCreate } from '@/integrations/backend/api';

// Module-level request cache to deduplicate concurrent requests (React StrictMode fix)
const inFlightRequests = new Map<string, Promise<Event[]>>();

const getCacheKey = (params: Record<string, unknown>): string => {
  return JSON.stringify(params);
};

export const useEvents = (params: {
  limit?: number;
  offset?: number;
  category?: string;
  is_public?: boolean;
} = {}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cancel any ongoing request from this hook instance
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    let isMounted = true;
    const cacheKey = getCacheKey(params);

    const fetchEvents = async () => {
      // Check if there's already an in-flight request for these params
      let requestPromise = inFlightRequests.get(cacheKey);
      
      if (!requestPromise) {
        // Create new request and cache it
        requestPromise = apiClient.getEvents(params);
        inFlightRequests.set(cacheKey, requestPromise);
        
        // Clean up cache after request completes (success or error)
        requestPromise.finally(() => {
          inFlightRequests.delete(cacheKey);
        });
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedEvents = await requestPromise;
        if (isMounted && !signal.aborted) {
          setEvents(fetchedEvents);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        if (isMounted && !signal.aborted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch events');
        }
      } finally {
        if (isMounted && !signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchEvents();

    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [JSON.stringify(params)]);

  const refetch = useCallback(async () => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      setLoading(true);
      setError(null);
      const fetchedEvents = await apiClient.getEvents(params);
      if (!signal.aborted) {
        setEvents(fetchedEvents);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was aborted, don't show error
        return;
      }
      if (!signal.aborted) {
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [params]);

  return { events, loading, error, refetch };
};

export const useEvent = (eventId: string) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchEvent = async () => {
      if (!eventId) return;

      try {
        setLoading(true);
        setError(null);
        const fetchedEvent = await apiClient.getEvent(eventId);
        if (isMounted) {
          setEvent(fetchedEvent);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch event');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEvent();

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  const refetch = async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      setError(null);
      const fetchedEvent = await apiClient.getEvent(eventId);
      setEvent(fetchedEvent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch event');
    } finally {
      setLoading(false);
    }
  };

  return { event, loading, error, refetch };
};

export const useEventActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEvent = useCallback(async (eventData: EventCreate): Promise<Event | null> => {
    try {
      setLoading(true);
      setError(null);
      console.log('=== useEvents: Creating event ===', eventData.title);
      const newEvent = await apiClient.createEvent(eventData);
      console.log('=== useEvents: Event created ===', newEvent);
      return newEvent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
      console.error('=== useEvents: createEvent ERROR ===', errorMessage);
      setError(errorMessage);
      throw err; // Re-throw so caller can handle it
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEvent = useCallback(async (eventId: string, eventData: EventUpdate): Promise<Event | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedEvent = await apiClient.updateEvent(eventId, eventData);
      return updatedEvent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update event';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEvent = useCallback(async (eventId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.deleteEvent(eventId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete event';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const participateEvent = useCallback(async (eventId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.participateEvent(eventId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join event';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const leaveEvent = useCallback(async (eventId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.leaveEvent(eventId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to leave event';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createEvent,
    updateEvent,
    deleteEvent,
    participateEvent,
    leaveEvent,
    loading,
    error,
  };
};
