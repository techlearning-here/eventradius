import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/integrations/backend/api';
import { getDummyEvent, isDummyEvent } from './EventDetail/data/dummyEvents';
import type { Event } from '@/integrations/backend/api';

interface EventDetailInlineProps {
  eventId: string;
  isDeleted?: boolean;
  onClose: () => void;
}

export const EventDetailInline: React.FC<EventDetailInlineProps> = ({ eventId, isDeleted = false, onClose }) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    try {
      let data;
      
      if (isDummyEvent(eventId)) {
        data = getDummyEvent(eventId);
      } else if (isDeleted) {
        data = await apiClient.getDeletedEvent(eventId);
      } else {
        data = await apiClient.getEvent(eventId);
      }

      if (data) {
        setEvent(data);
        setError(null);
      } else {
        setEvent(null);
        setError('Event not found');
      }
    } catch (err) {
      console.error('Error fetching event:', err);
      setError(err instanceof Error ? err.message : 'Failed to load event');
    } finally {
      setLoading(false);
    }
  }, [eventId, isDeleted]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-medium mb-4">Oops!</h1>
        <p className="text-muted-foreground mb-8">{error || 'Event not found'}</p>
        <button 
          onClick={onClose} 
          className="px-6 py-3 bg-foreground text-background border border-foreground hover:opacity-90 transition-colors uppercase text-sm font-medium rounded-lg"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg">
      {/* Event Hero */}
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        {event.image_url ? (
          <img 
            src={event.image_url} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
            <span className="text-4xl">🎉</span>
          </div>
        )}
      </div>
      
      {/* Event Content */}
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
        
        {event.category && (
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full mb-4">
            {event.category}
          </span>
        )}
        
        <div className="grid gap-4 text-sm text-muted-foreground mb-6">
          {event.start_time && (
            <div className="flex items-center gap-2">
              <span>📅</span>
              <span>{new Date(event.start_time).toLocaleDateString()}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>{event.location}</span>
            </div>
          )}
          {event.max_participants && (
            <div className="flex items-center gap-2">
              <span>👥</span>
              <span>{event.current_participants || 0} / {event.max_participants} participants</span>
            </div>
          )}
        </div>
        
        {event.description && (
          <div className="prose prose-sm max-w-none">
            <h3 className="text-lg font-semibold mb-2">About this event</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};
