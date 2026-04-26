import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient, type Event, type EventCreate, type EventUpdate } from '@/integrations/backend/api';
import { eventCache } from '@/components/events/details/EventDetailPage';

export type { EventCreate } from '@/integrations/backend/api';

// Module-level request cache to deduplicate concurrent requests (React StrictMode fix)
export const inFlightEventRequests = new Map<string, Promise<Event[]>>();

// Global events cache - persists across component unmounts/remounts
export const eventsCache = new Map<string, Event[]>();

// Load cached events from localStorage on module init
const STORAGE_KEY = 'events_cache';
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    Object.entries(parsed).forEach(([key, value]) => {
      eventsCache.set(key, value as Event[]);
    });
    // Also populate individual event cache for EventDetail sharing
    Object.values(parsed).forEach((eventsArray: unknown) => {
      (eventsArray as Event[]).forEach(event => {
        if (event.id) eventCache.set(event.id, event);
      });
    });
  }
} catch {
  // Ignore localStorage errors
}

// Save cache to localStorage
const saveCache = () => {
  try {
    const obj: Record<string, Event[]> = {};
    eventsCache.forEach((value, key) => {
      obj[key] = value;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {
    // Ignore localStorage errors
  }
};

const getCacheKey = (params: Record<string, unknown>): string => {
  return JSON.stringify(params);
};

export const useEvents = (params: {
  limit?: number;
  offset?: number;
  category?: string;
  is_public?: boolean;
  enabled?: boolean;
} = {}) => {
  const { enabled = true, ...fetchParams } = params;
  const cacheKey = getCacheKey(fetchParams);
  const cachedEvents = eventsCache.get(cacheKey);
  
  const [events, setEvents] = useState<Event[]>(cachedEvents || []);
  const [loading, setLoading] = useState(enabled && !cachedEvents);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Synchronous cache check - skip useEffect entirely if we have cached data
  const cachedData = eventsCache.get(cacheKey);
  const hasCachedData = cachedData && cachedData.length > 0;

  useEffect(() => {
    // Skip if disabled or already have cached data
    if (!enabled || hasCachedData) {
      return;
    }

    // Check if there's already an in-flight request for this cache key
    let isMounted = true;

    const inFlight = inFlightEventRequests.get(cacheKey);
    if (inFlight) {
      inFlight.then((fetchedEvents) => {
        if (isMounted) {
          setEvents(fetchedEvents);
          setLoading(false);
        }
      }).catch(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
      return;
    }

    // Cancel any ongoing request from this hook instance
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    const fetchEvents = async () => {
      // Check if there's already an in-flight request for these params
      let fetchPromise = inFlightEventRequests.get(cacheKey);
      
      if (!fetchPromise) {
        // Create new request and cache it
        fetchPromise = apiClient.getEvents(params);
        inFlightEventRequests.set(cacheKey, fetchPromise);
        
        // Clean up cache after request completes (success or error)
        fetchPromise.finally(() => {
          inFlightEventRequests.delete(cacheKey);
        });
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedEvents = await fetchPromise;
        if (isMounted && !signal.aborted) {
          // Store in global cache and localStorage
          eventsCache.set(cacheKey, fetchedEvents);
          saveCache();
          // Also populate individual event cache for EventDetail sharing
          fetchedEvents.forEach(event => {
            if (event.id) eventCache.set(event.id, event);
          });
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
  }, [cacheKey]);

  const refetch = useCallback(async () => {
    // Clear cache to force fresh fetch
    eventsCache.delete(cacheKey);
    // Also clear from localStorage
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore localStorage errors
    }
    
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
        // Update global cache
        eventsCache.set(cacheKey, fetchedEvents);
        saveCache(); // Add saveCache call here
        // Also populate individual event cache for EventDetail sharing
        fetchedEvents.forEach(event => {
          if (event.id) eventCache.set(event.id, event);
        });
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
  }, [cacheKey, params]);

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
      console.log('=== useEvents: Event created ===');
      console.log('Full event:', newEvent);
      console.log('Coordinates:', {
        latitude: newEvent.latitude,
        longitude: newEvent.longitude,
        geolocation_accuracy: newEvent.geolocation_accuracy,
      });
      return newEvent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
      console.error('=== useEvents: createEvent ERROR ===');
      console.error('Error message:', errorMessage);
      console.error('Error object:', err);
      if (err instanceof Error && err.stack) {
        console.error('Stack:', err.stack);
      }
      // Check if error has response data
      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = (err as { response?: { data?: unknown; status?: number } }).response;
        console.error('Error response data:', errorResponse?.data);
        console.error('Error response status:', errorResponse?.status);
      }
      console.error('====================================');
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
