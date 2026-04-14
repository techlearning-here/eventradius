import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, MessageSquare } from 'lucide-react';
import { apiClient } from '@/integrations/backend/api';
import { useAuth } from '@/hooks/useAuth';
import { dummyEvents, isDummyEvent } from '@/components/EventDetail/data/dummyEvents';
import { Navbar } from '../../layout/Navbar';
import { SEOHead } from '../../layout/SEOHead';
import { AuthSheet } from '../../auth/AuthSheet';
import { EventChat } from '../EventChat';

// Import modular section components
import {
  EventHeader,
  QuickInfoBar,
  AboutSection,
  LocationSection,
  VirtualEventSection,
  TimingRegistrationSection,
  OrganizerSection,
  RegistrationCard,
  EventStats,
  QuickActions
} from './sections';

// Import types
import { Event, OrganizerProfile } from './types';

// Import EventDetailAttributes for the attributes grid
import { EventDetailAttributes } from '../../EventDetail/EventDetailAttributes';

// Re-export types for backward compatibility
export type { Event, OrganizerProfile } from './types';

// Helper function to format snake_case to readable text
const formatLabel = (text: string | null | undefined) => {
  if (!text) return '';
  return text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

interface EventDetailOverlayProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
  isDeleted?: boolean;
  eventData?: Event | null;
  participantData?: {
    is_registered: boolean;
    counts: { interested: number; going: number };
  } | null;
}

export const EventDetailOverlay: React.FC<EventDetailOverlayProps> = ({ 
  eventId, 
  isOpen, 
  onClose,
  isDeleted = false,
  eventData: preloadedEventData,
  participantData
}) => {
  const { user } = useAuth();
  const [isRegistered, setIsRegistered] = useState(participantData?.is_registered || false);
  const [event, setEvent] = useState<Event | null>(preloadedEventData || null);
  const [organizerProfile, setOrganizerProfile] = useState<OrganizerProfile | null>(null);
  const [loading, setLoading] = useState(!preloadedEventData);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    try {
      let data;
      
      // Use dummy event if eventId matches any demo event IDs
      if (isDummyEvent(eventId)) {
        data = dummyEvents[eventId];
      } else {
        data = eventId
          ? await apiClient.getEvent(eventId)
          : await apiClient.getEvents({ limit: 1 }).then(events => events[0]);
      }

      if (data) {
        setEvent(data);
        setError(null);
        
        // DEBUG: Log all event data including new fields
        console.log('[EventDetailPage] Event data loaded:', {
          // Basic info
          id: data.id,
          title: data.title,
          category: data.category,
          // New Event Wizard fields
          subtitle: data.subtitle,
          summary: data.summary,
          tags: data.tags,
          timezone: data.timezone,
          // Venue fields
          venue_building_name: data.venue_building_name,
          venue_street: data.venue_street,
          venue_city: data.venue_city,
          venue_state: data.venue_state,
          venue_zip_code: data.venue_zip_code,
          venue_country: data.venue_country,
          // Virtual event fields
          virtual_event_url: data.virtual_event_url,
          virtual_event_platform: data.virtual_event_platform,
          event_password: data.event_password ? '*** (hidden)' : undefined,
          // Timing fields
          doors_open_time: data.doors_open_time,
          registration_start_time: data.registration_start_time,
          registration_end_time: data.registration_end_time,
          // Additional fields
          age_restriction: data.age_restriction,
          custom_refund_policy: data.custom_refund_policy,
          ticketing_website: data.ticketing_website,
          ticket_pricing_description: data.ticket_pricing_description,
          // Full data available
          fullEventData: data,
        });
        
        // Fetch organizer profile to get business name
        if (data.organizer_id) {
          apiClient.getUserProfile(data.organizer_id)
            .then(profile => setOrganizerProfile(profile as OrganizerProfile))
            .catch(() => setOrganizerProfile(null));
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
    if (!eventId || !user) return;
    try {
      // Use backend API to check registration
      const registrations = await apiClient.getUserEvents();
      const isEventRegistered = registrations.participating.some(event => event.id === eventId);
      setIsRegistered(isEventRegistered);
    } catch (error) {
      console.error('Error checking registration:', error);
      setIsRegistered(false);
    }
  }, [eventId, user]);

  useEffect(() => {
    if (isOpen) {
      // Skip fetching if we already have preloaded event data
      if (!preloadedEventData) {
        fetchEvent();
      } else {
        // Log preloaded data for debugging
        console.log('[EventDetailPage] Using preloaded event data:', {
          subtitle: preloadedEventData.subtitle,
          summary: preloadedEventData.summary,
          tags: preloadedEventData.tags,
          timezone: preloadedEventData.timezone,
          venue_building_name: preloadedEventData.venue_building_name,
          virtual_event_url: preloadedEventData.virtual_event_url,
          doors_open_time: preloadedEventData.doors_open_time,
        });
      }
      checkRegistration();
    }
  }, [eventId, isOpen, fetchEvent, checkRegistration, preloadedEventData]);

  const handleGetDirections = () => {
    if (event) {
      window.open(`https://maps.google.com/maps?q=${encodeURIComponent(event.address || event.location || '')}`, '_blank');
    }
  };

  // Show chat for events that have/had preview type or have messages
  const showChat = event && (event.event_type === 'preview' || event.event_status === 'collecting_interest');

  if (!isOpen) return null;

  console.log('[EventDetailOverlay] Rendering portal with event:', event?.title);

  return createPortal(
    <div 
      className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-background to-card border border-border/50 rounded-3xl shadow-2xl w-full max-w-8xl max-h-[98vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={(e) => {
            console.log('Close button clicked');
            e.preventDefault();
            e.stopPropagation();
            console.log('Calling onClose function');
            onClose();
            console.log('onClose called');
          }}
          className="absolute top-6 right-6 z-50 text-[#FA76FF] hover:text-[#ff94ff] transition-all duration-200 p-3 rounded-2xl hover:bg-background/80 backdrop-blur-sm border border-transparent hover:border-[#FA76FF]/50 group bg-background/50"
          title="Close event details"
        >
          <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Use modular EventHeader component */}
        {event && (
          <EventHeader 
            event={event} 
            organizerProfile={organizerProfile}
            onClose={onClose}
            formatLabel={formatLabel}
          />
        )}

        {/* Content */}
        <div className="p-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-foreground text-2xl">Loading...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <h1 className="text-4xl font-medium mb-4">Error</h1>
              <p className="text-lg text-muted-foreground mb-8">{error}</p>
              <button onClick={onClose} className="px-6 py-3 bg-foreground text-background border border-foreground hover:opacity-90 transition-colors uppercase text-sm font-medium">
                Close
              </button>
            </div>
          ) : event ? (
            <>
              {/* Quick Info Bar */}
              <QuickInfoBar event={event} />

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* About Section */}
                  <AboutSection event={event} />

                  {/* Location Section */}
                  <LocationSection event={event} onGetDirections={handleGetDirections} />

                  {/* Virtual Event Section */}
                  <VirtualEventSection event={event} />

                  {/* Timing & Registration Section */}
                  <TimingRegistrationSection event={event} />

                  {/* Organizer Section */}
                  <OrganizerSection event={event} organizerProfile={organizerProfile} />

                  {/* Event Attributes Grid - Using the existing component */}
                  <EventDetailAttributes event={event} />
                </div>

                {/* Right Column - Registration & Actions */}
                <div className="space-y-6">
                  {/* Registration Card */}
                  <RegistrationCard event={event} isRegistered={isRegistered} />

                  {/* Quick Actions */}
                  <QuickActions />

                  {/* Event Stats */}
                  <EventStats event={event} />
                </div>
              </div>

              {/* Chat for preview events */}
              {showChat && (
                <div className="mt-8">
                  <div className="bg-gradient-to-br from-card to-background border border-border rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      Event Discussion
                    </h3>
                    <EventChat eventId={event.id} eventCreatorId={event.created_by} eventStatus={event.event_status} />
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
};

export const EventDetailPage: React.FC<{ eventId?: string }> = ({ eventId }) => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    try {
      const data = eventId || urlId
        ? await apiClient.getEvent(eventId || urlId)
        : await apiClient.getEvents({ limit: 1 }).then(events => events[0]);

      if (data) {
        setEvent(data);
        setError(null);
      } else {
        setError('Event not found');
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching event:', error);
      setError('Failed to load event');
    } finally {
      setLoading(false);
    }
  }, [eventId || urlId]);

  const checkRegistration = useCallback(async () => {
    const currentId = eventId || urlId;
    if (!currentId) return;
    try {
      // Use backend API to check registration
      const registrations = await apiClient.getUserEvents();
      const isEventRegistered = registrations.participating.some(event => event.id === currentId);
      setIsRegistered(isEventRegistered);
    } catch (error) {
      console.error('Error checking registration:', error);
      setIsRegistered(false);
    }
  }, [eventId || urlId]);

  useEffect(() => {
    fetchEvent();
    checkRegistration();
  }, [fetchEvent, checkRegistration]);

  const handleGetDirections = () => {
    if (event) {
      window.open(`https://maps.google.com/maps?q=${encodeURIComponent(event.address || event.location || '')}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-2xl text-foreground">Loading event...</div>
        </div>
      </div>
    );
  }

  if (error || notFound || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] px-4">
          <h1 className="text-4xl font-medium mb-4">{error || 'Event Not Found'}</h1>
          <p className="text-lg text-muted-foreground mb-8">The event you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/events')}
            className="px-6 py-3 bg-foreground text-background border border-foreground hover:opacity-90 transition-colors uppercase text-sm font-medium"
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`${event.title} | EventRadius`}
        description={event.description?.slice(0, 160) || 'Join this amazing event on EventRadius'}
      />
      <Navbar />
      
      <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Event Header */}
          <EventHeader 
            event={event} 
            organizerProfile={null}
            onClose={() => navigate('/events')}
            formatLabel={formatLabel}
          />

          {/* Quick Info Bar */}
          <QuickInfoBar event={event} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <AboutSection event={event} />
              <LocationSection event={event} onGetDirections={handleGetDirections} />
              <VirtualEventSection event={event} />
              <TimingRegistrationSection event={event} />
              <OrganizerSection event={event} organizerProfile={null} />
              <EventDetailAttributes event={event} />
            </div>

            {/* Right Column - Registration & Actions */}
            <div className="space-y-6">
              <RegistrationCard event={event} isRegistered={isRegistered} />
              <QuickActions />
              <EventStats event={event} />
            </div>
          </div>
        </div>
      </main>

      <AuthSheet isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

export default EventDetailPage;
