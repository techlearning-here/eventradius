import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Info, Users, MessageSquare } from 'lucide-react';
import { apiClient } from '@/integrations/backend/api';
import { Navbar } from './Navbar';
import { EventCountdown } from './EventCountdown';
import { EventMeta } from './EventMeta';
import { EventHeader } from './EventHeader';
import { EventDescription } from './EventDescription';
import { EventLocation } from './EventLocation';
import { EventRegistration } from './EventRegistration';
import { EventParticipation } from './EventParticipation';
import { EventChat } from './EventChat';
import { AuthSheet } from './AuthSheet';
import { SEOHead } from './SEOHead';

interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start_time?: string;
  end_time?: string;
  image_url?: string;
  category?: string;
  max_participants?: number;
  is_public: boolean;
  organizer_id: string;
  created_at: string;
  updated_at: string;
  current_participants?: number;
  timezone?: string;
  organizer_email?: string;
  organizer_phone?: string;
  organizer_website?: string;
  // Legacy fields for compatibility
  creator?: string;
  date?: string;
  time?: string;
  address?: string;
  background_image_url?: string;
  target_date?: string;
  event_type?: string;
  event_status?: string;
  created_by?: string;
}

export const EventDetailOverlay: React.FC<{ eventId: string; isOpen: boolean; onClose: () => void }> = ({ eventId, isOpen, onClose }) => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dummy event for testing - use this if eventId is 'demo'
  const dummyEvent: Event = {
    id: 'demo-event-123',
    title: 'Summer Music Festival 2026',
    description: 'Join us for an unforgettable evening of live music featuring world-renowned artists, food trucks, and amazing vibes! This outdoor festival brings together the best local and international talent for a night of celebration under the stars. Experience multiple stages, artisan vendors, and create memories that will last a lifetime. Perfect for music lovers, families, and anyone looking to experience the magic of live entertainment.\n\nFeatured Artists:\n- The Midnight Stars (Headliner)\n- Electric Dreams Band\n- Jazz Fusion Collective\n- Local DJ Showcase\n\nActivities:\n- Live performances on 3 stages\n- Food truck festival with 20+ vendors\n- Artisan marketplace\n- Kids zone with activities\n- VIP lounge access\n\nAmenities:\n- Full bar service\n- Restroom facilities\n- Parking available\n- ADA accessible\n- Security on-site',
    location: 'Golden Gate Park, Music Concourse Area, San Francisco, CA 94122',
    start_time: '2026-07-15T18:00:00Z',
    end_time: '2026-07-16T02:00:00Z',
    image_url: 'https://images.unsplash.com/photo-1459749411171-048525a5c9d2?w=800&h=400&fit=crop',
    background_image_url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&h=600&fit=crop',
    category: 'music',
    max_participants: 5000,
    is_public: true,
    organizer_id: 'organizer-123',
    created_at: '2026-04-01T10:00:00Z',
    updated_at: '2026-04-07T08:00:00Z',
    current_participants: 1247,
    timezone: 'America/Los_Angeles',
    organizer_email: 'contact@summermusicfest.com',
    organizer_phone: '+1 (415) 555-0123',
    organizer_website: 'https://summermusicfest.com',
    // Legacy fields for compatibility
    creator: 'Summer Music Festival Team',
    date: 'July 15, 2026',
    time: '6:00 PM - 2:00 AM',
    address: 'Golden Gate Park, Music Concourse Area, San Francisco, CA 94122',
    target_date: '2026-07-15T18:00:00Z',
    event_type: 'in_person',
    event_status: 'published'
  };

  const fetchEvent = useCallback(async () => {
    try {
      let data;
      
      // Use dummy event if eventId is 'demo'
      if (eventId === 'demo') {
        data = dummyEvent;
      } else {
        data = eventId
          ? await apiClient.getEvent(eventId)
          : await apiClient.getEvents({ limit: 1 }).then(events => events[0]);
      }

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
  }, [eventId]);

  const checkRegistration = useCallback(async () => {
    if (!eventId) return;
    try {
      // Use backend API to check registration
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
      window.open(`https://maps.google.com/maps?q=${encodeURIComponent(event.address)}`, '_blank');
    }
  };

  // Show chat for events that have/had preview type or have messages
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
          className="absolute top-6 right-6 z-50 text-muted-foreground hover:text-foreground transition-all duration-200 p-3 rounded-2xl hover:bg-background/80 backdrop-blur-sm border border-transparent hover:border-border/50 group bg-background/50"
          title="Close event details"
        >
          <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Hero Section with Background */}
        <div className="relative h-80 md:h-96 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{ 
              backgroundImage: event.background_image_url 
                ? `url("${event.background_image_url}")` 
                : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          ></div>
          
          {/* Hero Content Container - Transparent */}
          <div className="absolute inset-0 z-20 flex items-end">
            <div className="w-full">
              <div className="p-8">
                <div className="max-w-3xl">
                  {/* Event Type Badge */}
                  {event.event_type && (
                    <span className="inline-block px-4 py-2 bg-white/95 backdrop-blur-sm text-primary text-sm font-semibold rounded-full mb-4 border border-white/30 shadow-lg">
                      {event.event_type === 'in_person' ? 'In Person Event' : event.event_type}
                    </span>
                  )}
                  
                  {event.is_public && (
                    <span className="px-4 py-2 bg-white/30 backdrop-blur-sm text-white text-sm font-semibold rounded-full border border-white/50 shadow-lg ml-4">
                      Public Event
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Event Title Section */}
        <div className="bg-background border-b border-border">
          <div className="p-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {event.title}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground text-lg">
              <span className="font-medium">By {event.creator || event.organizer_email}</span>
            </div>
          </div>
        </div>

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
          ) : (
            <>
              {/* Quick Info Bar */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
                  <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-sm font-semibold text-foreground mb-1">Date</div>
                  <div className="text-lg text-muted-foreground">
                    {event.date || new Date(event.start_time || event.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
                  <MapPin className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-sm font-semibold text-foreground mb-1">Location</div>
                  <div className="text-lg text-muted-foreground">
                    {event.location || event.address}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
                  <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-sm font-semibold text-foreground mb-1">Attendees</div>
                  <div className="text-lg text-muted-foreground">
                    {event.current_participants || 0} / {event.max_participants || 'Unlimited'}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
                  <Info className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-sm font-semibold text-foreground mb-1">Category</div>
                  <div className="text-lg text-muted-foreground capitalize">
                    {event.category || 'Event'}
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* About Section */}
                  <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-primary rounded-full"></div>
                      About This Event
                    </h2>
                    <div className="prose prose-lg max-w-none">
                      {event.description?.split('\n').map((paragraph, index) => (
                        <p key={index} className="text-muted-foreground leading-relaxed mb-4 text-base">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>

                  {/* Location Section */}
                  <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-primary rounded-full"></div>
                      Location & Venue
                    </h2>
                    <div className="bg-gradient-to-br from-card to-background border border-border rounded-2xl p-6 shadow-sm">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">Event Location</h3>
                          <p className="text-muted-foreground mb-4">{event.location || event.address}</p>
                          <button
                            onClick={handleGetDirections}
                            className="text-primary hover:text-primary/80 font-medium text-sm border-b border-primary/30 hover:border-primary/80 transition-colors"
                          >
                            Get Directions
                          </button>
                        </div>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-border">
                        <iframe
                          src={`https://www.google.com/maps?q=${encodeURIComponent(event.location || event.address)}&output=embed`}
                          className="w-full h-[300px] border-0"
                          loading="lazy"
                          title="Event location map"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Organizer Section */}
                  <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-primary rounded-full"></div>
                      Event Organizer
                    </h2>
                    <div className="bg-gradient-to-br from-card to-background border border-border rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center">
                          <Users className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground">{event.creator || 'Event Organizer'}</h3>
                          <p className="text-muted-foreground">Event Host</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {event.organizer_email && (
                          <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <a href={`mailto:${event.organizer_email}`} className="text-primary hover:text-primary/80 font-medium text-sm">
                              {event.organizer_email}
                            </a>
                          </div>
                        )}
                        {event.organizer_phone && (
                          <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </div>
                            <a href={`tel:${event.organizer_phone}`} className="text-primary hover:text-primary/80 font-medium text-sm">
                              {event.organizer_phone}
                            </a>
                          </div>
                        )}
                        {event.organizer_website && (
                          <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                              </svg>
                            </div>
                            <a href={event.organizer_website} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 font-medium text-sm">
                              {new URL(event.organizer_website).hostname.replace('www.', '')}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                </div>

                {/* Right Column - Registration & Actions */}
                <div className="space-y-6">
                  {/* Registration Card */}
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-foreground mb-4">Register Now</h3>
                    <EventParticipation eventId={event.id} />
                    {event.max_participants && (
                      <div className="mt-4 p-3 bg-background/50 rounded-xl border border-border/50">
                        <div className="flex justify-between items-center text-muted-foreground text-sm mb-2">
                          <span>Spots Available</span>
                          <span className="font-semibold text-foreground">{event.max_participants - (event.current_participants || 0)}</span>
                        </div>
                        <div className="w-full bg-border rounded-full h-2">
                          <div 
                            className="bg-primary rounded-full h-2 transition-all duration-300"
                            style={{ width: `${((event.current_participants || 0) / event.max_participants) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button className="w-full flex items-center gap-3 p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
                        </svg>
                        <span className="font-medium">Share Event</span>
                      </button>
                      <button className="w-full flex items-center gap-3 p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        <span className="font-medium">Save Event</span>
                      </button>
                    </div>
                  </div>

                  {/* Event Stats */}
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Event Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Capacity</span>
                        <span className="font-semibold text-foreground">{event.max_participants || 'Unlimited'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Registered</span>
                        <span className="font-semibold text-foreground">{event.current_participants || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Event Type</span>
                        <span className="font-semibold text-foreground">{event.is_public ? 'Public' : 'Private'}</span>
                      </div>
                    </div>
                  </div>
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
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export const EventDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    try {
      const data = id
        ? await apiClient.getEvent(id)
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
  }, [id]);

  const checkRegistration = useCallback(async () => {
    if (!id) return;
    try {
      // Use backend API to check registration
      const registrations = await apiClient.getUserEvents();
      const isEventRegistered = registrations.participating.some(event => event.id === id);
      setIsRegistered(isEventRegistered);
    } catch (error) {
      console.error('Error checking registration:', error);
      setIsRegistered(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
    checkRegistration();
  }, [id, fetchEvent, checkRegistration]);

  const handleGetDirections = () => {
    if (event) {
      window.open(`https://maps.google.com/maps?q=${encodeURIComponent(event.address)}`, '_blank');
    }
  };

  // Show chat for events that have/had preview type or have messages
  const showChat = event && (event.event_type === 'preview' || event.event_status === 'collecting_interest');

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-foreground text-2xl">Loading...</div>
    </div>;
  }

  if (notFound || !event) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background px-4">
        <SEOHead title="Event Not Found" description="The event you're looking for doesn't exist or has been removed." />
        <Navbar />
        <div className="text-center mt-20">
          <h1 className="text-4xl font-medium mb-4">Event Not Found</h1>
          <p className="text-lg text-muted-foreground mb-8">The event you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/discover')}
            className="px-6 py-3 bg-foreground text-background border border-foreground hover:opacity-90 transition-colors uppercase text-sm font-medium">
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  return <>
    <SEOHead
      title={event.title}
      description={event.description.substring(0, 160)}
      image={event.background_image_url}
      keywords={`event, ${event.title}, ${event.address}, community event`}
    />
    <Navbar />

    <main className="flex h-screen justify-center items-start w-full relative bg-background mx-auto my-0 max-lg:flex-col max-lg:h-auto max-lg:flex-col max-lg:h-auto">
      <div className="flex flex-col justify-end items-start fixed h-screen w-[calc(100%-540px)] pl-[49px] pr-[590px] pt-[calc(100vh-97px)] pb-12 left-0 top-0 overflow-hidden max-lg:relative max-lg:w-full max-lg:h-[400px] max-lg:bg-cover max-lg:bg-center max-lg:pt-80 max-lg:pb-6 max-lg:px-4 max-lg:right-0 max-sm:h-[300px] max-sm:pt-60 max-sm:pb-6 max-sm:px-4" role="img" aria-label="Event background image">
        <div className="absolute inset-0 animate-[zoom-in_1.2s_ease-out_forwards]" style={{
          backgroundImage: event.background_image_url 
            ? `url("${event.background_image_url}")` 
            : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
          backgroundSize: event.background_image_url ? 'cover' : 'auto',
          backgroundPosition: 'center'
        }}></div>
        <div className="relative z-10 animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
          <EventCountdown targetDate={new Date(event.target_date)} />
        </div>
      </div>

      <aside className="flex w-[540px] flex-col justify-start items-start fixed h-screen box-border right-0 top-0 bg-background overflow-y-auto max-lg:relative max-lg:w-full max-lg:h-auto max-lg:right-auto max-lg:top-0 max-lg:overflow-y-visible">
        <div className="flex w-full flex-col items-start gap-10 relative p-10 pb-24 max-lg:w-full max-lg:px-4 max-lg:py-6 max-lg:pb-6 max-lg:gap-8 opacity-0 animate-fade-in [animation-delay:200ms]">
          {/* Event type badge */}
          {event.event_type === 'preview' && (
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 bg-blue-500/20 text-blue-600 border border-blue-500/30">
              Preview Event · {event.event_status === 'collecting_interest' ? 'Collecting Interest' : event.event_status}
            </span>
          )}

          <div className="flex flex-col items-start gap-4 self-stretch relative">
            <EventMeta 
              date={event.date} 
              time={event.time} 
              timezone={event.timezone} 
              contact={{
                email: event.organizer_email,
                phone: event.organizer_phone,
                website: event.organizer_website
              }} 
            />
            <EventHeader title={event.title} creator={event.creator} />
          </div>

          <EventDescription description={event.description} />
          <EventLocation address={event.address} onGetDirections={handleGetDirections} />

          {/* Participation */}
          <EventParticipation eventId={event.id} onAuthRequired={() => setIsAuthOpen(true)} />

          {/* Chat for preview events */}
          {showChat && (
            <EventChat eventId={event.id} eventCreatorId={event.created_by} eventStatus={event.event_status} />
          )}
        </div>

        <div className="fixed bottom-0 right-0 w-[540px] bg-background py-6 border-t border-border max-lg:relative max-lg:w-full max-lg:py-6 max-lg:border-t-0">
          <div className="px-10 max-lg:px-4">
            <EventRegistration
              eventId={event.id}
              onRegister={checkRegistration}
              isRegistered={isRegistered}
              onAuthRequired={() => setIsAuthOpen(true)}
              targetDate={new Date(event.target_date)}
              className="opacity-0 animate-fade-in [animation-delay:400ms]"
            />
          </div>
        </div>
      </aside>
    </main>
    <AuthSheet isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
  </>;
};
