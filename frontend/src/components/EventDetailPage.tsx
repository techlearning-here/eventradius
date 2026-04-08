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
  const [organizerProfile, setOrganizerProfile] = useState<{ business_name?: string; full_name?: string } | null>(null);
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
        
        // Fetch organizer profile to get business name
        if (data.organizer_id) {
          try {
            const profile = await apiClient.getUserPreferences();
            setOrganizerProfile(profile as { business_name?: string; full_name?: string });
          } catch (profileErr) {
            console.error('Error fetching organizer profile:', profileErr);
            setOrganizerProfile(null);
          }
        }
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
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95vw] h-[98vh] md:w-[90vw] md:h-[95vh] lg:w-[85vw] lg:h-[92vh] xl:w-[80vw] xl:h-[90vh] 2xl:w-[75vw] 2xl:h-[88vh] bg-background rounded-2xl shadow-2xl relative flex flex-col"
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
                creator={organizerProfile?.business_name || event.creator}
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
                  {/* Organizer Contact Section */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      Organizer Contact
                    </h3>
                    
                    <div className="space-y-3">
                      {/* Business Name */}
                      {organizerProfile?.business_name && (
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-100">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-medium tracking-wider">Business</p>
                            <p className="font-semibold text-gray-900">{organizerProfile.business_name}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Phone Number */}
                      {event.event_contact_phone && (
                        <a 
                          href={`tel:${event.event_contact_phone_country_code || ''}${event.event_contact_phone}`}
                          className="flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-100 hover:bg-blue-50 transition-colors"
                        >
                          <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-medium tracking-wider">Phone</p>
                            <p className="font-semibold text-gray-900">
                              {event.event_contact_phone_country_code || ''} {event.event_contact_phone}
                            </p>
                          </div>
                        </a>
                      )}
                      
                      {/* Email */}
                      {event.event_contact_email && (
                        <a 
                          href={`mailto:${event.event_contact_email}`}
                          className="flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-100 hover:bg-blue-50 transition-colors"
                        >
                          <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-medium tracking-wider">Email</p>
                            <p className="font-semibold text-gray-900 text-sm truncate max-w-[200px]">{event.event_contact_email}</p>
                          </div>
                        </a>
                      )}
                    </div>
                  </div>

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
