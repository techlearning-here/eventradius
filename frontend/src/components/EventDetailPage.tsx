import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { apiClient } from '@/integrations/backend/api';
import { EventRegistration } from './EventRegistration';
import { EventParticipation } from './EventParticipation';
import { EventChat } from './EventChat';
import { AuthSheet } from './AuthSheet';
import { ShareEventModal } from './share/ShareEventModal';
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
  EventDetailAttributes,
  getDummyEvent,
  isDummyEvent,
  type Event 
} from './EventDetail';

interface EventDetailOverlayProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
  isDeleted?: boolean;
  eventData?: Event | null; // Pre-loaded event data to skip fetch
  organizerProfileData?: { business_name?: string; full_name?: string } | null; // Pre-loaded organizer profile
  participantData?: { is_registered: boolean; counts: { interested: number; going: number } } | null; // Pre-loaded participant data
}

export const EventDetailOverlay: React.FC<EventDetailOverlayProps> = React.memo(({ eventId, isOpen, onClose, isDeleted = false, eventData, organizerProfileData, participantData }) => {
  // Guard against duplicate fetches from React StrictMode
  const hasFetchedRef = useRef<string | null>(null);
  
  const [isRegistered, setIsRegistered] = useState(participantData?.is_registered ?? false);
  const [event, setEvent] = useState<Event | null>(eventData || null);
  const [organizerProfile, setOrganizerProfile] = useState<{ business_name?: string; full_name?: string } | null>(organizerProfileData || null);
  const [loading, setLoading] = useState(!eventData); // Skip loading if we have pre-loaded data
  const [error, setError] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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
        
        // Fetch organizer profile to get business name (in parallel)
        // Skip if we already have pre-loaded organizer profile data
        if (data.organizer_id && !organizerProfileData) {
          apiClient.getUserProfile(data.organizer_id)
            .then(profile => setOrganizerProfile(profile as { business_name?: string; full_name?: string }))
            .catch(() => setOrganizerProfile(null));
        }
      } else {
        setEvent(null);
        setError('Event not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event');
    } finally {
      setLoading(false);
    }
  }, [eventId, organizerProfileData]);

  const checkRegistration = useCallback(async () => {
    console.log('[EventDetail] checkRegistration called', { eventId, hasParticipantData: !!participantData });
    if (!eventId || participantData) {
      console.log('[EventDetail] Skipping registration check - pre-loaded data available');
      return; // Skip if pre-loaded data available
    }
    try {
      // Use combined endpoint to get registration status + participant counts
      const response = await apiClient.getEventParticipants(eventId);
      setIsRegistered(response.is_registered);
    } catch {
      setIsRegistered(false);
    }
  }, [eventId, participantData]);

  useEffect(() => {
    if (isOpen && eventId && hasFetchedRef.current !== eventId) {
      // Only fetch event if we don't have pre-loaded data
      if (!eventData) {
        // Mark as fetched to prevent duplicate calls from StrictMode
        hasFetchedRef.current = eventId;
        fetchEvent();
      } else {
        // Still mark as fetched even when using pre-loaded data
        hasFetchedRef.current = eventId;
      }
      
      // Check registration in background (non-blocking)
      checkRegistration();
    }
  }, [eventId, isOpen, fetchEvent, checkRegistration, eventData]);

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
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[98vw] h-[98vh] md:w-[96vw] md:h-[96vh] lg:w-[94vw] lg:h-[94vh] xl:w-[92vw] xl:h-[92vh] 2xl:w-[90vw] 2xl:h-[90vh] bg-background rounded-2xl shadow-2xl relative flex flex-col ring-2 ring-primary/30 border-[3px] border-primary/50 m-1 overflow-hidden"
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
                is_paid_event={event.is_paid_event}
                ticket_price={event.ticket_price}
              />
            </div>

            {/* Line separator after Event Details title */}
            <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent flex-shrink-0"></div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 rounded-b-2xl">
              <div className="h-full">
                <EventDetailHeader 
                  category={event?.category} 
                  onClose={onClose}
                  onShare={() => setIsShareModalOpen(true)}
                />
                <EventDetailHero
                  image_url={event?.image_url}
                  background_image_url={event?.background_image_url}
                  event_type={event?.event_type}
                  is_public={event?.is_public}
                  loading={loading}
                  onShare={() => setIsShareModalOpen(true)}
                />
                  <div className="px-2 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 lg:py-10 xl:px-12 xl:py-12 w-full max-w-7xl">
                    <EventQuickInfo event={event} />

                    <div className="space-y-8 w-full max-w-4xl">
                  <EventDetailAbout description={event.description} />
                  <EventDetailAttributes event={event} />
                    </div>

                    {/* Full width sections below vertical bar */}
                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-10 w-full">
                    <EventDetailLocation 
                      location={event.location}
                      address={event.address}
                      latitude={event.latitude}
                      longitude={event.longitude}
                      geolocation_accuracy={event.geolocation_accuracy}
                      onGetDirections={handleGetDirections}
                    />
                    <div className="space-y-4">
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
                                <p className="font-semibold text-gray-900 text-sm truncate max-w-[300px]">{event.event_contact_email}</p>
                              </div>
                            </a>
                          )}
                        </div>
                        
                        {/* Ticketing info for paid events */}
                        {event.is_paid_event && (
                          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-semibold text-amber-700 text-sm">Tickets Not Sold Here</p>
                                {event.ticketing_website ? (
                                  <div className="space-y-2">
                                    <p className="text-sm font-semibold text-amber-700">
                                      🎟️ Get your tickets now - limited seats available!
                                    </p>
                                    <a 
                                      href={event.ticketing_website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-lg transition-colors"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                      Buy Tickets at {new URL(event.ticketing_website).hostname.replace('www.', '')}
                                    </a>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <p className="text-sm font-semibold text-amber-700">
                                      🎟️ Get your tickets now - limited seats available!
                                    </p>
                                    {event.organizer_email && (
                                      <a 
                                        href={`mailto:${event.organizer_email}?subject=Ticket Request: ${encodeURIComponent(event.title)}`}
                                        className="inline-flex items-center gap-2 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-lg transition-colors"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Request Tickets
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Visual Separator */}
                      <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent my-6"></div>
                      
                      {/* Your Participation */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                          Your Participation
                        </h3>
                        <EventParticipation
                          eventId={event.id}
                          event={event}
                          onAuthRequired={handleAuthRequired}
                          preLoadedData={participantData ? {
                            counts: participantData.counts,
                            my_status: null
                          } : null}
                        />
                      </div>
                      
                      {/* Visual Separator */}
                      <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent my-6"></div>
                      
                      {/* REGISTER Button */}
                      <div>
                        <EventRegistration
                          eventId={event.id}
                          onRegister={handleRegister}
                          isRegistered={isRegistered}
                          onAuthRequired={handleAuthRequired}
                        />
                      </div>
                    </div>
                  </div>

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
              </div>
            </div>
          </>
        ) : null}

        <AuthSheet isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        
        {event && (
          <ShareEventModal
            event={event}
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
          />
        )}
      </div>
    </div>,
    document.body
  );
});

export default EventDetailOverlay;
