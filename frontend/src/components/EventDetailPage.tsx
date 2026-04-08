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
  isDeleted?: boolean;
}

export const EventDetailOverlay: React.FC<EventDetailOverlayProps> = ({ eventId, isOpen, onClose, isDeleted = false }) => {
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
      } else if (isDeleted) {
        // Use special endpoint for deleted events
        data = await apiClient.getDeletedEvent(eventId);
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
      className="fixed inset-0 z-[999999999] bg-black/50 backdrop-blur-sm"
      style={{ zIndex: '999999999 !important' }}
      onClick={onClose}
    >
      <div 
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[95vh] md:w-[80vw] md:h-[90vh] lg:w-[70vw] lg:h-[85vh] xl:w-[60vw] xl:h-[80vh] bg-background rounded-2xl shadow-2xl relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <EventDetailCloseButton onClose={onClose} />

        {loading ? (
          <EventDetailLoading />
        ) : error ? (
          <EventDetailError error={error} onClose={onClose} />
        ) : event ? (
          <>
            <div className="flex-shrink-0">
              <EventDetailTitle 
                title={event.title}
                creator={event.creator}
                organizer_email={event.organizer_email}
              />
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
              <div className="h-full">
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
                  <div className="px-2 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 lg:py-10 xl:px-12 xl:py-12 w-full max-w-7xl">
                    <EventQuickInfo event={event} />

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8 lg:gap-10 xl:gap-12 w-full">
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
