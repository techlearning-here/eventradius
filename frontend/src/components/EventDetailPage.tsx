import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { apiClient } from '@/integrations/backend/api';
import { EventRegistration } from './EventRegistration';
import { EventParticipation } from './EventParticipation';
import { EventChat } from './EventChat';
import { AuthSheet } from './AuthSheet';
import { 
  EventDetailCloseButton,
  EventDetailHeader,
  EventDetailHero,
  EventDetailTitle,
  EventQuickInfo,
  EventDetailAbout,
  EventDetailLocation,
  EventDetailLoading,
  EventDetailError,
  getDummyEvent,
  isDummyEvent,
  type Event 
} from './EventDetail';

interface EventDetailOverlayProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const EventDetailOverlay: React.FC<EventDetailOverlayProps> = ({ eventId, isOpen, onClose }) => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const fetchEvent = useCallback(async () => {
    try {
      let data;
      
      if (isDummyEvent(eventId)) {
        data = getDummyEvent(eventId);
      } else {
        data = eventId
          ? await apiClient.getEvent(eventId)
          : await apiClient.getEvents({ limit: 1 }).then(events => events[0]);
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
  }, [eventId]);

  const checkRegistration = useCallback(async () => {
    if (!eventId) return;
    try {
      const registrations = await apiClient.getUserEvents();
      const isEventRegistered = registrations.participating.some(event => event.id === eventId);
      setIsRegistered(isEventRegistered);
    } catch (error) {
      console.error('Error checking registration:', error);
      setIsRegistered(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (isOpen) {
      fetchEvent();
      checkRegistration();
    }
  }, [eventId, isOpen, fetchEvent, checkRegistration]);

  const handleGetDirections = () => {
    if (event) {
      window.open(`https://maps.google.com/maps?q=${encodeURIComponent(event.address || event.location || '')}`, '_blank');
    }
  };

  const handleAuthRequired = () => {
    setIsAuthOpen(true);
  };

  const handleRegister = () => {
    setIsRegistered(true);
  };

  const showChat = event && (event.event_type === 'preview' || event.event_status === 'collecting_interest');

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-background to-card border border-border/50 rounded-3xl shadow-2xl w-full max-w-8xl max-h-[98vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <EventDetailCloseButton onClose={onClose} />

        <EventDetailHeader 
          category={event?.category} 
          onClose={onClose} 
        />

        <EventDetailHero 
          background_image_url={event?.background_image_url}
          event_type={event?.event_type}
          is_public={event?.is_public}
          loading={loading}
        />

        {loading ? (
          <EventDetailLoading />
        ) : error ? (
          <EventDetailError error={error} onClose={onClose} />
        ) : event ? (
          <>
            <EventDetailTitle 
              title={event.title}
              creator={event.creator}
              organizer_email={event.organizer_email}
            />

            <div className="p-8">
              <EventQuickInfo event={event} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <EventDetailAbout description={event.description} />
                  <EventDetailLocation 
                    location={event.location}
                    address={event.address}
                    onGetDirections={handleGetDirections}
                  />
                  
                  {showChat && event.id && event.created_by && (
                    <section>
                      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <div className="w-1 h-6 bg-primary rounded-full"></div>
                        Event Chat
                      </h2>
                      <EventChat 
                        eventId={event.id} 
                        eventCreatorId={event.created_by}
                        eventStatus={event.event_status}
                      />
                    </section>
                  )}
                </div>

                <div className="space-y-6">
                  <EventParticipation 
                    eventId={event.id} 
                    onAuthRequired={handleAuthRequired}
                  />
                  
                  <div className="border-t border-border pt-6">
                    <EventRegistration
                      eventId={event.id}
                      onRegister={handleRegister}
                      isRegistered={isRegistered}
                      onAuthRequired={handleAuthRequired}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}

        <AuthSheet isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    </div>,
    document.body
  );
};

export default EventDetailOverlay;
