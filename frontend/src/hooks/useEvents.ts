import { useState, useEffect, useCallback } from 'react';
import { apiClient, type Event, type EventCreate, type EventUpdate } from '@/integrations/backend/api';

export const useEvents = (params: {
  limit?: number;
  offset?: number;
  category?: string;
  is_public?: boolean;
} = {}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedEvents = await apiClient.getEvents(params);
      setEvents(fetchedEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
};

export const useEvent = (eventId: string) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
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
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return { event, loading, error, refetch: fetchEvent };
};

export const useEventActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEvent = useCallback(async (eventData: EventCreate): Promise<Event | null> => {
    try {
      setLoading(true);
      setError(null);
      const newEvent = await apiClient.createEvent(eventData);
      return newEvent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
      setError(errorMessage);
      return null;
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
