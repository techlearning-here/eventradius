import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '@/integrations/backend/api';

interface ParticipantData {
  event_id: string;
  counts: { interested: number; going: number; not_going: number };
  total: number;
  my_status: 'interested' | 'going' | 'not_going' | null;
  is_registered: boolean;
}

// Module-level cache and request deduplication
const globalCache = new Map<string, { data: ParticipantData; timestamp: number }>();
const globalPromises = new Map<string, Promise<ParticipantData>>();
const CACHE_TTL = 30000;

export const useBulkEventParticipants = (eventIds: string[]) => {
  const [participants, setParticipants] = useState<Map<string, ParticipantData>>(new Map());

  // Fetch a single event's participants with deduplication
  const fetchSingleEvent = useCallback(async (eventId: string): Promise<ParticipantData> => {
    const cacheKey = `participants-${eventId}`;
    
    // Check cache
    const cached = globalCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    
    // Check for in-flight request
    if (globalPromises.has(cacheKey)) {
      return globalPromises.get(cacheKey)!;
    }
    
    // Create new request
    const promise = (async () => {
      try {
        const data = await apiClient.getEventParticipants(eventId);
        globalCache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
      } finally {
        globalPromises.delete(cacheKey);
      }
    })();
    
    globalPromises.set(cacheKey, promise);
    return promise;
  }, []);

  useEffect(() => {
    if (eventIds.length === 0) return;
    
    // Find events that need fetching (not in cache)
    const idsToFetch: string[] = [];
    
    eventIds.forEach(id => {
      const cacheKey = `participants-${id}`;
      const cached = globalCache.get(cacheKey);
      if (!cached || Date.now() - cached.timestamp >= CACHE_TTL) {
        idsToFetch.push(id);
      }
    });
    
    // Update state with cached data first (functional update, no deps needed)
    setParticipants(() => {
      const newData = new Map<string, ParticipantData>();
      eventIds.forEach(id => {
        const cacheKey = `participants-${id}`;
        const cached = globalCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          newData.set(id, cached.data);
        }
      });
      return newData;
    });
    
    // Fetch missing data - limit concurrent requests to avoid overwhelming
    if (idsToFetch.length > 0) {
      const fetchAll = async () => {
        // Process in batches of 5 to avoid too many concurrent requests
        const batchSize = 5;
        for (let i = 0; i < idsToFetch.length; i += batchSize) {
          const batch = idsToFetch.slice(i, i + batchSize);
          await Promise.all(
            batch.map(async (id) => {
              try {
                const data = await fetchSingleEvent(id);
                setParticipants(prev => {
                  const updated = new Map(prev);
                  updated.set(id, data);
                  return updated;
                });
              } catch (err) {
                console.error(`Failed to fetch participants for ${id}:`, err);
              }
            })
          );
          // Small delay between batches
          if (i + batchSize < idsToFetch.length) {
            await new Promise(r => setTimeout(r, 100));
          }
        }
      };
      
      // Debounce the fetch
      const timeout = setTimeout(fetchAll, 100);
      return () => clearTimeout(timeout);
    }
  }, [eventIds, fetchSingleEvent]);

  const getParticipantData = useCallback((eventId: string): ParticipantData | undefined => {
    // First check state, then fall back to global cache
    const fromState = participants.get(eventId);
    if (fromState) return fromState;
    
    const cached = globalCache.get(`participants-${eventId}`);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    return undefined;
  }, [participants]);

  return { participants, loading: false, getParticipantData };
};
