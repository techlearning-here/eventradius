import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Info, Users, MessageSquare,
  Accessibility, Globe, GraduationCap, AlertCircle, 
  Utensils, Volume2, Wine, Cigarette, Dumbbell,
  Briefcase, PartyPopper, Heart, Baby, Sparkles,
  Languages, LayoutGrid, DollarSign, CheckCircle2,
  Tag
} from 'lucide-react';
import { apiClient } from '@/integrations/backend/api';
import { dummyEvents, isDummyEvent } from '@/components/EventDetail/data/dummyEvents';
import { Navbar } from '../../layout/Navbar';
import { SEOHead } from '../../layout/SEOHead';

// Import all the individual event detail components
import { EventMeta } from '../EventMeta';
import { EventHeader } from '../EventHeader';
import { EventDescription } from '../EventDescription';
import { EventLocation } from '../EventLocation';
import { EventParticipation } from '../EventParticipation';
import { EventRegistration } from '../EventRegistration';
import { EventChat } from '../EventChat';
import { EventCountdown } from '../EventCountdown';
import { AuthSheet } from '../../auth/AuthSheet';

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
  is_paid_event?: boolean;
  ticket_pricing_description?: string;
  ticketing_website?: string;
  timezone?: string;
  organizer_email?: string;
  organizer_phone?: string;
  organizer_website?: string;
  // Event contact info from ContactInfo step
  event_contact_email?: string;
  event_contact_phone?: string;
  event_contact_phone_country_code?: string;
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
  // New Event Attributes - Audience & Demographics
  age_categories?: string[];
  gender_preference?: string;
  family_friendly?: boolean;
  senior_friendly?: boolean;
  singles_friendly?: boolean;
  couples_oriented?: boolean;
  // New Event Attributes - Accessibility
  wheelchair_accessible?: boolean;
  mobility_friendly?: boolean;
  hearing_accessible?: boolean;
  vision_accessible?: boolean;
  sensory_friendly?: boolean;
  service_animals_allowed?: boolean;
  accessibility_notes?: string;
  // New Event Attributes - Cultural Context
  religious_context?: string[];
  dietary_context?: string[];
  traditional_attire?: string;
  // New Event Attributes - Prerequisites
  skill_level?: string;
  prior_experience?: string;
  physical_fitness?: string;
  equipment_required?: string[];
  dress_code?: string;
  prerequisites_notes?: string;
  // New Event Attributes - Content & Intensity
  content_rating?: string;
  alcohol_served?: string;
  smoking_policy?: string;
  noise_level?: string;
  physical_intensity?: string;
  // New Event Attributes - Social Features
  networking_focus?: boolean;
  social_mixer?: boolean;
  ice_breakers?: boolean;
  group_activities?: boolean;
  team_building?: boolean;
  // New Event Attributes - Language
  primary_language?: string;
  secondary_languages?: string[];
  interpretation_available?: boolean;
  sign_language_interpreter?: boolean;
  // New Event Attributes - Type & Format
  format?: string;
  sub_category?: string;
  // New Event Attributes - Pricing
  refund_policy?: string;
  group_discounts?: boolean;
}

export const EventDetailOverlay: React.FC<{ eventId: string; isOpen: boolean; onClose: () => void }> = ({ eventId, isOpen, onClose }) => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [organizerProfile, setOrganizerProfile] = useState<{ business_name?: string; full_name?: string; phone?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
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
        // Fetch organizer profile to get business name
        if (data.organizer_id) {
          apiClient.getUserProfile(data.organizer_id)
            .then(profile => setOrganizerProfile(profile as { business_name?: string; full_name?: string; phone?: string; email?: string }))
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

  // Helper function to format snake_case to readable text
  const formatLabel = (text: string | null | undefined) => {
    if (!text) return '';
    return text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Section component for consistent styling
  const Section = ({ icon: Icon, title, children, color = "bg-primary" }: { 
    icon: React.ElementType; 
    title: string; 
    children: React.ReactNode;
    color?: string;
  }) => (
    <div className="bg-card rounded-xl p-5 border border-border/50 hover:border-border/80 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className={`${color} p-2.5 rounded-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );

  // Info item component
  const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
      <span className="text-sm text-muted-foreground sm:w-32 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );

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
          className="absolute top-6 right-6 z-50 text-[#FA76FF] hover:text-[#ff94ff] transition-all duration-200 p-3 rounded-2xl hover:bg-background/80 backdrop-blur-sm border border-transparent hover:border-[#FA76FF]/50 group bg-background/50"
          title="Close event details"
        >
          <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title Bar */}
        <div className="bg-gradient-to-r from-background via-background/95 to-background border-b border-border/50 backdrop-blur-sm px-8 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={onClose}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-background/50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Back to Events</span>
              </button>
              <div className="h-4 w-px bg-border"></div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Category:</span>
                <span className="text-sm font-medium text-foreground capitalize px-2 py-1 bg-primary/10 text-primary rounded-md">{event?.category}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background/50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background/50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Hero Section with Background */}
        <div className="relative h-80 md:h-96 overflow-hidden">
          {/* Loading State for Hero Image */}
          {loading && (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/20 animate-pulse z-10">
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-lg">Loading...</div>
              </div>
            </div>
          )}
          
          <div 
            className="absolute inset-0 bg-cover bg-center scale-105 transition-all duration-700"
            style={{ 
              backgroundImage: event?.background_image_url 
                ? `url("${event.background_image_url}")` 
                : `url("https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&h=600&fit=crop")`,
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
                  {event?.event_type && (
                    <span className="inline-block px-4 py-2 bg-white/95 backdrop-blur-sm text-primary text-sm font-semibold rounded-full mb-4 border border-white/30 shadow-lg">
                      {event.event_type === 'in_person' ? 'In Person Event' : event.event_type}
                    </span>
                  )}
                  
                  {event?.is_public && (
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
              {event?.title}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground text-lg">
              <span className="font-medium">By {organizerProfile?.business_name || organizerProfile?.full_name || event?.creator || event?.organizer_email || 'Event Organizer'}</span>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
                  <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-sm font-semibold text-foreground mb-1">Date</div>
                  <div className="text-lg text-muted-foreground">
                    {event?.date || new Date(event?.start_time || event?.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
                  <MapPin className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-sm font-semibold text-foreground mb-1">Location</div>
                  <div className="text-lg text-muted-foreground">
                    {event?.location || event?.address}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
                  <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-sm font-semibold text-foreground mb-1">Attendees & Category</div>
                  <div className="text-lg text-muted-foreground">
                    {event?.current_participants || 0} / {event?.max_participants || 'Unlimited'}
                  </div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {event?.category || 'Event'} • {event?.is_public ? 'Public' : 'Private'}
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
                  {console.log('[EventDetail] Contact fields:', { 
                    event_contact_phone: event.event_contact_phone, 
                    event_contact_email: event.event_contact_email,
                    event_contact_phone_country_code: event.event_contact_phone_country_code,
                    organizer_email: event.organizer_email,
                    organizer_website: event.organizer_website
                  })}
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
                          <h3 className="text-xl font-bold text-foreground">{organizerProfile?.business_name || organizerProfile?.full_name || event.creator || 'Event Organizer'}</h3>
                          <p className="text-muted-foreground">Event Host</p>
                          {organizerProfile?.email && (
                            <a href={`mailto:${organizerProfile.email}`} className="text-sm text-primary hover:underline mt-1 block">
                              {organizerProfile.email}
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Event Contact Phone from ContactInfo step */}
                        {event.event_contact_phone && (
                          <a 
                            href={`tel:${event.event_contact_phone_country_code || ''}${event.event_contact_phone}`}
                            className="flex items-center gap-3 p-3 bg-background/50 rounded-xl hover:bg-blue-50 transition-colors"
                          >
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Event Phone</p>
                              <p className="font-semibold text-gray-900">
                                {event.event_contact_phone_country_code || ''} {event.event_contact_phone}
                              </p>
                            </div>
                          </a>
                        )}
                        
                        {/* Event Contact Email from ContactInfo step */}
                        {event.event_contact_email && (
                          <a 
                            href={`mailto:${event.event_contact_email}`}
                            className="flex items-center gap-3 p-3 bg-background/50 rounded-xl hover:bg-blue-50 transition-colors"
                          >
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Event Email</p>
                              <p className="font-semibold text-gray-900 text-sm truncate max-w-[180px]">{event.event_contact_email}</p>
                            </div>
                          </a>
                        )}
                        
                        {/* Organizer Email (fallback) */}
                        {!event.event_contact_email && event.organizer_email && (
                          <a 
                            href={`mailto:${event.organizer_email}`}
                            className="flex items-center gap-3 p-3 bg-background/50 rounded-xl hover:bg-blue-50 transition-colors"
                          >
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Organizer Email</p>
                              <p className="font-semibold text-gray-900 text-sm truncate max-w-[180px]">{event.organizer_email}</p>
                            </div>
                          </a>
                        )}
                        
                        {/* Organizer Website */}
                        {event.organizer_website && (
                          <a 
                            href={event.organizer_website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-background/50 rounded-xl hover:bg-blue-50 transition-colors"
                          >
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Website</p>
                              <p className="font-semibold text-gray-900 text-sm">{new URL(event.organizer_website).hostname.replace('www.', '')}</p>
                            </div>
                          </a>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Event Attributes Grid */}
                  <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-primary rounded-full"></div>
                      Event Details
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Audience & Demographics */}
                      <Section icon={Users} title="Audience & Demographics" color="bg-blue-500">
                        {event.age_categories && event.age_categories.length > 0 && (
                          <div>
                            <span className="text-sm text-muted-foreground block mb-2">Age Groups</span>
                            <div className="flex flex-wrap gap-1.5">
                              {event.age_categories.map((age, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                  {formatLabel(age)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {event.gender_preference && event.gender_preference !== 'all' && (
                          <InfoItem label="Gender" value={formatLabel(event.gender_preference)} />
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {event.family_friendly && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Baby className="w-3 h-3" /> Family Friendly
                            </span>
                          )}
                          {event.senior_friendly && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Heart className="w-3 h-3" /> Senior Friendly
                            </span>
                          )}
                          {event.singles_friendly && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <Users className="w-3 h-3" /> Singles Welcome
                            </span>
                          )}
                          {event.couples_oriented && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                              <Heart className="w-3 h-3" /> Couples
                            </span>
                          )}
                        </div>
                      </Section>

                      {/* Accessibility */}
                      <Section icon={Accessibility} title="Accessibility" color="bg-teal-500">
                        <div className="flex flex-wrap gap-2">
                          {event.wheelchair_accessible && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Accessibility className="w-3 h-3" /> Wheelchair
                            </span>
                          )}
                          {event.mobility_friendly && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Accessibility className="w-3 h-3" /> Mobility
                            </span>
                          )}
                          {event.hearing_accessible && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Volume2 className="w-3 h-3" /> Hearing
                            </span>
                          )}
                          {event.vision_accessible && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <CheckCircle2 className="w-3 h-3" /> Vision
                            </span>
                          )}
                          {event.sensory_friendly && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                              <Sparkles className="w-3 h-3" /> Sensory
                            </span>
                          )}
                          {event.service_animals_allowed && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <Heart className="w-3 h-3" /> Service Animals
                            </span>
                          )}
                        </div>
                        {event.accessibility_notes && (
                          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm text-muted-foreground">Notes:</span>
                            <p className="text-sm mt-1">{event.accessibility_notes}</p>
                          </div>
                        )}
                      </Section>

                      {/* Cultural Context */}
                      <Section icon={Globe} title="Cultural Context" color="bg-indigo-500">
                        {event.religious_context && event.religious_context.length > 0 && (
                          <div>
                            <span className="text-sm text-muted-foreground block mb-2">Religious Context</span>
                            <div className="flex flex-wrap gap-1.5">
                              {event.religious_context.map((religion, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border border-border capitalize">
                                  {religion}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {event.dietary_context && event.dietary_context.length > 0 && (
                          <div>
                            <span className="text-sm text-muted-foreground block mb-2">Dietary Options</span>
                            <div className="flex flex-wrap gap-1.5">
                              {event.dietary_context.map((diet, index) => (
                                <span key={index} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                  <Utensils className="w-3 h-3" />
                                  {formatLabel(diet)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {event.traditional_attire && event.traditional_attire !== 'not_applicable' && (
                          <InfoItem label="Attire" value={formatLabel(event.traditional_attire)} />
                        )}
                      </Section>

                      {/* Prerequisites */}
                      <Section icon={GraduationCap} title="Prerequisites" color="bg-orange-500">
                        {event.skill_level && (
                          <InfoItem label="Skill Level" value={formatLabel(event.skill_level)} />
                        )}
                        {event.prior_experience && (
                          <InfoItem label="Experience" value={formatLabel(event.prior_experience)} />
                        )}
                        {event.physical_fitness && (
                          <InfoItem label="Fitness Level" value={formatLabel(event.physical_fitness)} />
                        )}
                        {event.dress_code && event.dress_code !== 'casual' && (
                          <InfoItem label="Dress Code" value={formatLabel(event.dress_code)} />
                        )}
                        {event.equipment_required && event.equipment_required.length > 0 && (
                          <div>
                            <span className="text-sm text-muted-foreground block mb-2">Equipment Needed</span>
                            <div className="flex flex-wrap gap-1.5">
                              {event.equipment_required.map((eq, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border border-border">
                                  {formatLabel(eq)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {event.prerequisites_notes && (
                          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm text-muted-foreground">Notes:</span>
                            <p className="text-sm mt-1">{event.prerequisites_notes}</p>
                          </div>
                        )}
                      </Section>

                      {/* Content & Intensity */}
                      <Section icon={AlertCircle} title="Content & Intensity" color="bg-red-500">
                        {event.content_rating && (
                          <InfoItem label="Content Rating" value={formatLabel(event.content_rating)} />
                        )}
                        {event.alcohol_served && (
                          <InfoItem label="Alcohol" value={formatLabel(event.alcohol_served)} />
                        )}
                        {event.smoking_policy && (
                          <InfoItem label="Smoking" value={formatLabel(event.smoking_policy)} />
                        )}
                        {event.noise_level && (
                          <InfoItem label="Noise Level" value={formatLabel(event.noise_level)} />
                        )}
                        {event.physical_intensity && (
                          <InfoItem label="Intensity" value={formatLabel(event.physical_intensity)} />
                        )}
                      </Section>

                      {/* Social Features */}
                      <Section icon={PartyPopper} title="Social Features" color="bg-pink-500">
                        <div className="flex flex-wrap gap-2">
                          {event.networking_focus && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Briefcase className="w-3 h-3" /> Networking
                            </span>
                          )}
                          {event.social_mixer && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <PartyPopper className="w-3 h-3" /> Social Mixer
                            </span>
                          )}
                          {event.ice_breakers && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Sparkles className="w-3 h-3" /> Ice Breakers
                            </span>
                          )}
                          {event.group_activities && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <Users className="w-3 h-3" /> Group Activities
                            </span>
                          )}
                          {event.team_building && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                              <Heart className="w-3 h-3" /> Team Building
                            </span>
                          )}
                        </div>
                      </Section>

                      {/* Language */}
                      <Section icon={Languages} title="Language" color="bg-cyan-500">
                        {event.primary_language && (
                          <InfoItem label="Primary" value={formatLabel(event.primary_language)} />
                        )}
                        {event.secondary_languages && event.secondary_languages.length > 0 && (
                          <div>
                            <span className="text-sm text-muted-foreground block mb-2">Also Available</span>
                            <div className="flex flex-wrap gap-1.5">
                              {event.secondary_languages.map((lang, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                  {formatLabel(lang)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {event.interpretation_available && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle2 className="w-3 h-3" /> Interpretation Available
                            </span>
                          )}
                          {event.sign_language_interpreter && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Accessibility className="w-3 h-3" /> Sign Language
                            </span>
                          )}
                        </div>
                      </Section>

                      {/* Type & Format */}
                      <Section icon={LayoutGrid} title="Type & Format" color="bg-violet-500">
                        {event.event_type && (
                          <InfoItem label="Event Type" value={formatLabel(event.event_type)} />
                        )}
                        {event.format && (
                          <InfoItem label="Format" value={formatLabel(event.format)} />
                        )}
                        {event.sub_category && (
                          <InfoItem label="Category" value={formatLabel(event.sub_category)} />
                        )}
                      </Section>

                      {/* Pricing */}
                      <Section icon={DollarSign} title="Pricing" color="bg-emerald-500">
                        {event.refund_policy && (
                          <InfoItem label="Refund Policy" value={formatLabel(event.refund_policy)} />
                        )}
                        {event.group_discounts && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Users className="w-3 h-3" /> Group Discounts Available
                          </span>
                        )}
                      </Section>
                    </div>
                  </section>
                </div>

                {/* Right Column - Registration & Actions */}
                <div className="space-y-6">
                  {/* Registration Card */}
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-foreground mb-4">
                      {event.is_paid_event ? 'Purchase Tickets' : 'Register for Free'}
                    </h3>
                    
                    {/* Free Event Highlight */}
                    {!event.is_paid_event && (
                      <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-semibold text-green-600">Free Event</div>
                            <div className="text-sm text-muted-foreground">No registration fee required</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Paid Event Ticketing */}
                    {event.is_paid_event && (
                      <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-semibold text-amber-600">Paid Event</div>
                            <div className="text-sm text-muted-foreground">Tickets available for purchase</div>
                          </div>
                        </div>
                        {event.ticket_pricing_description && (
                          <p className="text-sm text-muted-foreground mb-3">{event.ticket_pricing_description}</p>
                        )}
                      </div>
                    )}
                    
                    <EventParticipation eventId={event.id} />
                    
                    {/* External Ticketing Links for Paid Events */}
                    {event.is_paid_event && (
                      <div className="mt-4 space-y-2">
                        <button className="w-full flex items-center justify-center gap-2 p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-colors font-medium">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Purchase Tickets
                        </button>
                        {event.ticketing_website && (
                          <a 
                            href={event.ticketing_website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 p-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl transition-colors font-medium"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Visit Ticketing Site
                          </a>
                        )}
                      </div>
                    )}
                    
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
  }, [eventId || urlId, fetchEvent, checkRegistration]);

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
          <button onClick={() => navigate('/organizer')}
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
      description={event.description?.substring(0, 160)}
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
