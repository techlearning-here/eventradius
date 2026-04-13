import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/integrations/backend/api';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { Navbar } from '@/components/Navbar';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { SEOHead } from '@/components/SEOHead';
import { toast } from 'sonner';
import { EventWizard, type EventFormData } from '@/components/EventWizard/EventWizard';
import { useEventActions } from '@/hooks/useEvents';
import { Sidebar } from '@/components/OrganizerDashboard/Sidebar';
import { SectionHeader } from '@/components/OrganizerDashboard/SectionHeader';
import { EventsList } from '@/components/OrganizerDashboard/EventsList';
import { OrganizerEventsGrid } from '@/components/OrganizerDashboard/OrganizerEventsGrid';
import { EventWizardOverlay } from '@/components/OrganizerDashboard/EventWizardOverlay';
import { EventDetailOverlay } from '@/components/events/details/EventDetailPage';
import { EventDetailInline } from '@/components/EventDetailInline';
import { type Event, type RefundPolicy, type EventCreate } from '@/integrations/backend/api';
import { Trash2, LayoutGrid, List } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const OrganizerDashboard = () => {
  const { user, role, loading: authLoading } = useAuthWithBackend();
  const navigate = useNavigate();
  const { createEvent, updateEvent } = useEventActions();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingEventInitialData, setEditingEventInitialData] = useState<Partial<EventFormData> | null>(null);
  const [activeSection, setActiveSection] = useState('events');
  const [sidebarIconized, setSidebarIconized] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Track which event is being previewed
  const [previewEventId, setPreviewEventId] = useState<string | null>(null);
  const [previewEvent, setPreviewEvent] = useState<Event | null>(null);

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  // State for recycle bin
  const [deletedEvents, setDeletedEvents] = useState<Event[]>([]);
  const [loadingDeleted, setLoadingDeleted] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [eventToRestore, setEventToRestore] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Helper to calculate days remaining until permanent deletion
  const getDaysRemaining = (deletedAt: string | undefined): number => {
    if (!deletedAt) return 30;
    const deleted = new Date(deletedAt);
    const now = new Date();
    const diffTime = now.getTime() - deleted.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(30 - diffDays, 0);
  };

  // Track last preview time to prevent duplicates
  const lastPreviewTime = useRef<number>(0);

  // Bulk participant counts for all events - reduces API calls from N to 1
  const [participantCounts, setParticipantCounts] = useState<Map<string, { interested: number; going: number }>>(new Map());

  // Fetch all participant counts in bulk when events load
  useEffect(() => {
    if (events.length === 0) return;

    const fetchBulkParticipants = async () => {
      try {
        const eventIds = events.map(e => e.id);
        console.log('[OrganizerDashboard] Fetching bulk participants for', eventIds.length, 'events');
        const response = await apiClient.getBulkEventParticipants(eventIds);
        console.log('[OrganizerDashboard] Bulk participants response:', Object.keys(response).length, 'events');

        const countsMap = new Map<string, { interested: number; going: number }>();
        Object.entries(response).forEach(([eventId, data]) => {
          countsMap.set(eventId, {
            interested: data.counts.interested,
            going: data.counts.going
          });
        });

        setParticipantCounts(countsMap);
      } catch (err) {
        console.error('Failed to fetch bulk participants:', err);
      }
    };

    // Small delay to batch rapid updates, but faster than component-level delays
    const timeout = setTimeout(fetchBulkParticipants, 50);
    return () => clearTimeout(timeout);
  }, [events]);

  const handlePreviewEvent = (event: Event) => {
    const now = Date.now();
    // Debounce: prevent multiple previews within 500ms
    if (now - lastPreviewTime.current < 500) {
      return;
    }
    lastPreviewTime.current = now;
    setPreviewEventId(event.id);
    setPreviewEvent(event); // Store full event object
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Use getUserEvents to fetch only the current user's created events
      const response = await apiClient.getUserEvents();
      setEvents(response.created || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const handleSaveDraft = async (data: EventFormData) => {
    try {
      const eventData = {
        title: data.title,
        description: data.description,
        location: data.location,
        start_time: data.start_time ? data.start_time.toISOString() : undefined,
        end_time: data.end_time ? data.end_time.toISOString() : undefined,
        category: data.category,
        max_participants: data.max_participants,
        is_public: data.is_public,
        tags: data.tags,
        image_url: data.image_url,
        status: 'draft' as const,
        subtitle: data.subtitle,
        summary: data.summary,
        language: data.language,
        event_type: data.event_type,
        event_format: data.event_format,
        event_privacy: data.event_privacy,
        timezone: data.timezone,
        doors_open_time: data.doors_open_time ? data.doors_open_time.toISOString() : undefined,
        registration_start_time: data.registration_start_time ? data.registration_start_time.toISOString() : undefined,
        registration_end_time: data.registration_end_time ? data.registration_end_time.toISOString() : undefined,
        virtual_event_url: data.virtual_event_url || null,
        virtual_event_platform: data.virtual_event_platform,
        // Venue fields
        venue_street: data.venue_street,
        venue_city: data.venue_city,
        venue_state: data.venue_state,
        venue_zip_code: data.venue_zip_code,
        venue_country: data.venue_country,
        venue_building_name: data.venue_building_name,
        event_password: data.event_password,
        age_restriction: data.age_restriction,
        accessibility_options: data.accessibility_options,
        event_website: data.event_website || null,
        event_contact_email: data.event_contact_email || null,
        ticketing_website: data.ticketing_website || null,
        refund_policy: data.refund_policy,
        custom_refund_policy: data.custom_refund_policy,
        ticket_pricing_description: data.ticket_pricing_description,
        // Audience & Demographics
        age_categories: data.age_categories,
        gender_preference: data.gender_preference,
        family_friendly: data.family_friendly,
        senior_friendly: data.senior_friendly,
        singles_friendly: data.singles_friendly,
        couples_oriented: data.couples_oriented,
        // Accessibility
        wheelchair_accessible: data.wheelchair_accessible,
        mobility_friendly: data.mobility_friendly,
        hearing_accessible: data.hearing_accessible,
        vision_accessible: data.vision_accessible,
        sensory_friendly: data.sensory_friendly,
        service_animals_allowed: data.service_animals_allowed,
        accessibility_notes: data.accessibility_notes,
        // Cultural Context
        religious_context: data.religious_context,
        dietary_context: data.dietary_context,
        traditional_attire: data.traditional_attire,
        // Prerequisites
        skill_level: data.skill_level,
        prior_experience: data.prior_experience,
        physical_fitness: data.physical_fitness,
        equipment_required: data.equipment_required,
        dress_code: data.dress_code,
        prerequisites_notes: data.prerequisites_notes,
        // Content & Intensity
        content_rating: data.content_rating,
        alcohol_served: data.alcohol_served,
        smoking_policy: data.smoking_policy,
        noise_level: data.noise_level,
        physical_intensity: data.physical_intensity,
        // Social Features
        networking_focus: data.networking_focus,
        social_mixer: data.social_mixer,
        ice_breakers: data.ice_breakers,
        group_activities: data.group_activities,
        team_building: data.team_building,
        // Language
        primary_language: data.primary_language,
        secondary_languages: data.secondary_languages,
        interpretation_available: data.interpretation_available,
        sign_language_interpreter: data.sign_language_interpreter,
        // Pricing
        group_discounts: data.group_discounts,
        // Additional fields
        is_paid_event: data.is_paid_event,
        sub_category: data.sub_category,
        format: data.format,
      };

      const result = await createEvent(eventData);
      if (!result) {
        throw new Error('Failed to save draft');
      }
      
      toast.success('Draft saved successfully');
      fetchEvents();
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error('Failed to save draft');
      throw error;
    }
  };

  const handleEditEvent = async (data: EventFormData) => {
    if (!editingEvent) return;
    
    try {
      // Only use fields supported by EventUpdate interface
      const eventData = {
        title: data.title,
        description: data.description,
        location: data.location,
        start_time: data.start_time ? data.start_time.toISOString() : undefined,
        end_time: data.end_time ? data.end_time.toISOString() : undefined,
        image_url: data.image_url,
        category: data.category,
        max_participants: data.max_participants,
        is_public: data.is_public,
      };

      const result = await updateEvent(editingEvent.id, eventData);
      if (!result) {
        throw new Error('Failed to update event');
      }
      
      toast.success('Event updated successfully!');
      setShowCreateWizard(false);
      setEditingEvent(null);
      // Restore sidebar state when wizard closes
      setSidebarIconized(false);
      fetchEvents();
    } catch (error) {
      console.error('Failed to update event:', error);
      toast.error('Failed to update event');
    }
  };

  const handlePublish = async (data: EventFormData) => {
    try {
      const eventData = {
        title: data.title,
        description: data.description,
        location: data.location,
        start_time: data.start_time ? data.start_time.toISOString() : undefined,
        end_time: data.end_time ? data.end_time.toISOString() : undefined,
        category: data.category,
        max_participants: data.max_participants,
        is_public: data.is_public,
        tags: data.tags,
        image_url: data.image_url,
        status: 'published' as const,
        subtitle: data.subtitle,
        summary: data.summary,
        language: data.language,
        event_type: data.event_type,
        event_format: data.event_format,
        event_privacy: data.event_privacy,
        timezone: data.timezone,
        doors_open_time: data.doors_open_time ? data.doors_open_time.toISOString() : undefined,
        registration_start_time: data.registration_start_time ? data.registration_start_time.toISOString() : undefined,
        registration_end_time: data.registration_end_time ? data.registration_end_time.toISOString() : undefined,
        virtual_event_url: data.virtual_event_url || null,
        virtual_event_platform: data.virtual_event_platform,
        // Venue fields
        venue_street: data.venue_street,
        venue_city: data.venue_city,
        venue_state: data.venue_state,
        venue_zip_code: data.venue_zip_code,
        venue_country: data.venue_country,
        venue_building_name: data.venue_building_name,
        event_password: data.event_password,
        age_restriction: data.age_restriction,
        accessibility_options: data.accessibility_options,
        event_website: data.event_website || null,
        event_contact_email: data.event_contact_email || null,
        ticketing_website: data.ticketing_website || null,
        refund_policy: data.refund_policy,
        custom_refund_policy: data.custom_refund_policy,
        ticket_pricing_description: data.ticket_pricing_description,
        // Audience & Demographics
        age_categories: data.age_categories,
        gender_preference: data.gender_preference,
        family_friendly: data.family_friendly,
        senior_friendly: data.senior_friendly,
        singles_friendly: data.singles_friendly,
        couples_oriented: data.couples_oriented,
        // Accessibility
        wheelchair_accessible: data.wheelchair_accessible,
        mobility_friendly: data.mobility_friendly,
        hearing_accessible: data.hearing_accessible,
        vision_accessible: data.vision_accessible,
        sensory_friendly: data.sensory_friendly,
        service_animals_allowed: data.service_animals_allowed,
        accessibility_notes: data.accessibility_notes,
        // Cultural Context
        religious_context: data.religious_context,
        dietary_context: data.dietary_context,
        traditional_attire: data.traditional_attire,
        // Prerequisites
        skill_level: data.skill_level,
        prior_experience: data.prior_experience,
        physical_fitness: data.physical_fitness,
        equipment_required: data.equipment_required,
        dress_code: data.dress_code,
        prerequisites_notes: data.prerequisites_notes,
        // Content & Intensity
        content_rating: data.content_rating,
        alcohol_served: data.alcohol_served,
        smoking_policy: data.smoking_policy,
        noise_level: data.noise_level,
        physical_intensity: data.physical_intensity,
        // Social Features
        networking_focus: data.networking_focus,
        social_mixer: data.social_mixer,
        ice_breakers: data.ice_breakers,
        group_activities: data.group_activities,
        team_building: data.team_building,
        // Language
        primary_language: data.primary_language,
        secondary_languages: data.secondary_languages,
        interpretation_available: data.interpretation_available,
        sign_language_interpreter: data.sign_language_interpreter,
        // Pricing
        group_discounts: data.group_discounts,
        // Additional fields
        is_paid_event: data.is_paid_event,
        sub_category: data.sub_category,
        format: data.format,
      };

      console.log('=== ORGANIZER DASHBOARD DEBUG ===');
      console.log('EventData to be sent to API:', eventData);
      console.log('Key attributes:', JSON.stringify({
        age_categories: eventData.age_categories,
        gender_preference: eventData.gender_preference,
        family_friendly: eventData.family_friendly,
        wheelchair_accessible: eventData.wheelchair_accessible,
        religious_context: eventData.religious_context,
        skill_level: eventData.skill_level,
        dietary_context: eventData.dietary_context,
        networking_focus: eventData.networking_focus,
      }, null, 2));
      console.log('==================================');

      console.log('=== CALLING CREATE EVENT ===');
      const result = await createEvent(eventData);
      console.log('=== CREATE EVENT RESULT ===', result);
      if (!result) {
        throw new Error('Event creation returned null');
      }
      
      toast.success('Event created and published successfully!');
      setShowCreateWizard(false);
      setEditingEvent(null);
      // Restore sidebar state when wizard closes
      setSidebarIconized(false);
      fetchEvents();
    } catch (error) {
      console.error('Failed to publish event:', error);
      toast.error(`Error: ${error.message}`);
    }
  };

  const handlePublishEdit = async (data: EventFormData) => {
    if (!editingEvent) return;
    
    try {
      const eventData = {
        title: data.title,
        description: data.description,
        location: data.location,
        start_time: data.start_time ? data.start_time.toISOString() : undefined,
        end_time: data.end_time ? data.end_time.toISOString() : undefined,
        image_url: data.image_url,
        category: data.category,
        max_participants: data.max_participants,
        is_public: data.is_public,
        // Audience & Demographics
        age_categories: data.age_categories,
        gender_preference: data.gender_preference,
        family_friendly: data.family_friendly,
        senior_friendly: data.senior_friendly,
        singles_friendly: data.singles_friendly,
        couples_oriented: data.couples_oriented,
        // Accessibility
        wheelchair_accessible: data.wheelchair_accessible,
        mobility_friendly: data.mobility_friendly,
        hearing_accessible: data.hearing_accessible,
        vision_accessible: data.vision_accessible,
        sensory_friendly: data.sensory_friendly,
        service_animals_allowed: data.service_animals_allowed,
        accessibility_notes: data.accessibility_notes,
        // Cultural Context
        religious_context: data.religious_context,
        dietary_context: data.dietary_context,
        traditional_attire: data.traditional_attire,
        // Prerequisites
        skill_level: data.skill_level,
        prior_experience: data.prior_experience,
        physical_fitness: data.physical_fitness,
        equipment_required: data.equipment_required,
        dress_code: data.dress_code,
        prerequisites_notes: data.prerequisites_notes,
        // Content & Intensity
        content_rating: data.content_rating,
        alcohol_served: data.alcohol_served,
        smoking_policy: data.smoking_policy,
        noise_level: data.noise_level,
        physical_intensity: data.physical_intensity,
        // Social Features
        networking_focus: data.networking_focus,
        social_mixer: data.social_mixer,
        ice_breakers: data.ice_breakers,
        group_activities: data.group_activities,
        team_building: data.team_building,
        // Language
        primary_language: data.primary_language,
        secondary_languages: data.secondary_languages,
        interpretation_available: data.interpretation_available,
        sign_language_interpreter: data.sign_language_interpreter,
        // Pricing
        refund_policy: data.refund_policy,
        custom_refund_policy: data.custom_refund_policy,
        ticket_pricing_description: data.ticket_pricing_description,
        group_discounts: data.group_discounts,
        // Additional fields
        is_paid_event: data.is_paid_event,
        sub_category: data.sub_category,
        format: data.format,
      };

      const result = await updateEvent(editingEvent.id, eventData);
      if (!result) {
        throw new Error('Failed to publish event');
      }
      
      toast.success('Event updated and published successfully!');
      setShowCreateWizard(false);
      setEditingEvent(null);
      // Restore sidebar state when wizard closes
      setSidebarIconized(false);
      fetchEvents();
    } catch (error) {
      console.error('Failed to publish event:', error);
      toast.error(`Error: ${error.message}`);
    }
  };

  // Handle creating a single round-trip test event with ALL new fields
  const handleTestOneRoundTrip = async () => {
    const roundTripTestEvent: EventCreate = {
      // Core fields
      title: `Round Trip Test - ${new Date().toLocaleString()}`,
      subtitle: 'Testing ALL new Event Wizard fields',
      summary: 'This single event tests the complete round-trip: Frontend → API → Database → API → Frontend',
      description: 'Comprehensive test of ALL Event Wizard fields including subtitle, summary, tags, timezone, venue details, virtual event info, timing fields, age_restriction, custom_refund_policy, and more.',
      category: 'technology',
      location: 'Tech Hub Conference Center, 456 Innovation Drive, San Francisco, CA 94102, USA',
      start_time: new Date(Date.now() + 7 * 86400000).toISOString(),
      end_time: new Date(Date.now() + 7 * 86400000 + 10800000).toISOString(),
      timezone: 'America/Los_Angeles',
      max_participants: 50,
      is_public: true,
      is_paid_event: true,
      ticketing_website: 'https://tickets.example.com/round-trip-test',
      ticket_pricing_description: '$50 per person, includes lunch and materials',
      image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop',
      status: 'published',
      // Event Wizard - Basic Info
      tags: ['round-trip', 'test', 'all-fields', 'integration'],
      language: 'en',
      event_type: 'hybrid',
      event_format: 'single',
      event_privacy: 'public',
      // Event Wizard - Venue Details
      venue_building_name: 'Tech Hub Conference Center',
      venue_street: '456 Innovation Drive',
      venue_city: 'San Francisco',
      venue_state: 'CA',
      venue_zip_code: '94102',
      venue_country: 'USA',
      // Event Wizard - Virtual Event
      virtual_event_url: 'https://zoom.us/j/round-trip-test-123',
      virtual_event_platform: 'Zoom',
      event_password: 'RoundTrip2026!',
      // Event Wizard - Timing & Registration
      doors_open_time: new Date(Date.now() + 7 * 86400000 - 30 * 60000).toISOString(),
      registration_start_time: new Date(Date.now()).toISOString(),
      registration_end_time: new Date(Date.now() + 6 * 86400000).toISOString(),
      // Event Wizard - Contact Info
      event_contact_email: 'test@roundtrip.example.com',
      event_contact_phone: '4155559999',
      event_contact_phone_country_code: '+1',
      // Event Wizard - Additional
      age_restriction: 'all_ages',
      accessibility_options: 'Wheelchair accessible, ASL interpreter available, service animals welcome',
      custom_refund_policy: 'Full refund up to 48 hours before event. 50% refund up to 24 hours. No refunds after that.',
      event_website: 'https://example.com/round-trip-test',
      // Audience & Demographics
      age_categories: ['adults', 'young_adults'],
      gender_preference: 'all',
      family_friendly: false,
      senior_friendly: true,
      singles_friendly: true,
      couples_oriented: false,
      // Accessibility
      wheelchair_accessible: true,
      mobility_friendly: true,
      hearing_accessible: true,
      vision_accessible: true,
      sensory_friendly: false,
      service_animals_allowed: true,
      accessibility_notes: 'Fully accessible venue with ramps, elevators, accessible restrooms, and designated seating areas.',
      // Cultural Context
      religious_context: ['secular', 'interfaith'],
      dietary_context: ['vegetarian', 'vegan', 'gluten_free', 'halal', 'kosher'],
      traditional_attire: 'not_applicable',
      // Prerequisites
      skill_level: 'all_levels',
      prior_experience: 'none_required',
      physical_fitness: 'sedentary',
      equipment_required: ['laptop', 'notebook', 'pen'],
      dress_code: 'business_casual',
      prerequisites_notes: 'Bring a laptop for hands-on exercises. All other materials provided.',
      // Content & Intensity
      content_rating: 'all_ages',
      alcohol_served: 'no_alcohol',
      smoking_policy: 'non_smoking',
      noise_level: 'moderate',
      physical_intensity: 'none',
      // Social Features
      networking_focus: true,
      social_mixer: true,
      ice_breakers: true,
      group_activities: true,
      team_building: false,
      // Language
      primary_language: 'english',
      secondary_languages: ['spanish', 'chinese_mandarin'],
      interpretation_available: true,
      sign_language_interpreter: true,
      // Type & Format
      format: 'interactive_workshop',
      sub_category: 'tech_demo',
      // Pricing
      refund_policy: 'refund_up_to_24_hours',
      group_discounts: true,
    };

    try {
      console.log('🧪 Creating 1 round-trip test event with ALL new fields...');
      const result = await createEvent(roundTripTestEvent);
      
      if (result) {
        console.log('✅ Round-trip test event created:', result);
        toast.success('✅ Round-trip test event created! Click it to view all fields.');
        
        // Automatically open the event details for the created event
        if (result.id) {
          handlePreviewEvent(result.id);
        }
        
        fetchEvents(); // Refresh the list
      } else {
        toast.error('Failed to create round-trip test event');
      }
    } catch (error) {
      console.error('❌ Failed to create round-trip test event:', error);
      toast.error(`Error: ${error.message}`);
    }
  };

  // Handle seeding dummy events for testing using existing createEvent API
  const handleSeedDummyEvents = async () => {
    const dummyEvents: EventCreate[] = [
      // === COMPREHENSIVE TEST EVENT WITH ALL NEW FIELDS ===
      {
        title: 'Complete Test Event - All Fields',
        subtitle: 'Testing all new Event Wizard fields',
        summary: 'This event tests all the newly added fields from the Event Wizard including subtitle, summary, tags, timezone, venue details, virtual event info, timing, and more.',
        description: 'Join us for a comprehensive demonstration of all Event Wizard features! This event includes every field available in the wizard to ensure complete data flow from creation to display.',
        category: 'education',
        location: 'Tech Hub Conference Center, 456 Innovation Drive, San Francisco, CA 94102, USA',
        start_time: new Date(Date.now() + 7 * 86400000).toISOString(),
        end_time: new Date(Date.now() + 7 * 86400000 + 10800000).toISOString(),
        timezone: 'America/Los_Angeles',
        max_participants: 50,
        is_public: true,
        is_paid_event: true,
        ticketing_website: 'https://tickets.example.com/complete-test-event',
        ticket_pricing_description: '$50 per person, includes lunch and materials',
        image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop',
        // Event Wizard - Basic Info
        tags: ['test', 'demo', 'all-fields', 'wizard', 'comprehensive'],
        language: 'en',
        event_type: 'hybrid',
        event_format: 'single',
        event_privacy: 'public',
        status: 'published',
        // Event Wizard - Venue Details
        venue_building_name: 'Tech Hub Conference Center',
        venue_street: '456 Innovation Drive',
        venue_city: 'San Francisco',
        venue_state: 'CA',
        venue_zip_code: '94102',
        venue_country: 'USA',
        // Event Wizard - Virtual Event
        virtual_event_url: 'https://zoom.us/j/complete-test-123',
        virtual_event_platform: 'Zoom',
        event_password: 'TestEvent2026!',
        // Event Wizard - Timing & Registration
        doors_open_time: new Date(Date.now() + 7 * 86400000 - 30 * 60000).toISOString(), // 30 min before
        registration_start_time: new Date(Date.now()).toISOString(), // Now
        registration_end_time: new Date(Date.now() + 6 * 86400000).toISOString(), // 1 day before
        // Event Wizard - Contact Info
        event_contact_email: 'test@example.com',
        event_contact_phone: '4155551234',
        event_contact_phone_country_code: '+1',
        // Event Wizard - Additional
        age_restriction: 'all_ages',
        accessibility_options: 'Wheelchair accessible, ASL interpreter available',
        custom_refund_policy: 'Full refund up to 48 hours before event. 50% refund up to 24 hours.',
        event_website: 'https://example.com/complete-test-event',
        // Audience & Demographics
        age_categories: ['adults', 'young_adults'],
        gender_preference: 'all',
        family_friendly: false,
        senior_friendly: true,
        singles_friendly: true,
        couples_oriented: false,
        // Accessibility
        wheelchair_accessible: true,
        mobility_friendly: true,
        hearing_accessible: true,
        vision_accessible: true,
        sensory_friendly: false,
        service_animals_allowed: true,
        accessibility_notes: 'Fully accessible venue with ramps, elevators, accessible restrooms, and designated seating areas.',
        // Cultural Context
        religious_context: ['secular', 'interfaith'],
        dietary_context: ['vegetarian', 'vegan', 'gluten_free', 'halal', 'kosher'],
        traditional_attire: 'not_applicable',
        // Prerequisites
        skill_level: 'all_levels',
        prior_experience: 'none_required',
        physical_fitness: 'sedentary',
        equipment_required: ['laptop', 'notebook'],
        dress_code: 'business_casual',
        prerequisites_notes: 'Bring a laptop for hands-on exercises. All other materials provided.',
        // Content & Intensity
        content_rating: 'all_ages',
        alcohol_served: 'no_alcohol',
        smoking_policy: 'non_smoking',
        noise_level: 'moderate',
        physical_intensity: 'none',
        // Social Features
        networking_focus: true,
        social_mixer: true,
        ice_breakers: true,
        group_activities: true,
        team_building: false,
        // Language
        primary_language: 'english',
        secondary_languages: ['spanish', 'chinese_mandarin'],
        interpretation_available: true,
        sign_language_interpreter: true,
        // Type & Format
        format: 'interactive_workshop',
        sub_category: 'tech_demo',
        // Pricing
        refund_policy: 'refund_up_to_24_hours',
        group_discounts: true,
      },
      // === SOCIAL (Free & Paid) ===
      { title: 'Seniors Tea & Conversation', description: 'Relaxing afternoon tea with stimulating conversation.', category: 'social', location: 'Golden Years Center, 45 Park Ave', start_time: new Date(Date.now() + 5 * 86400000).toISOString(), end_time: new Date(Date.now() + 5 * 86400000 + 7200000).toISOString(), max_participants: 25, is_public: true, is_paid_event: true, ticketing_website: 'https://eventbrite.com/seniors-tea-123', image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop', age_categories: ['seniors', 'adults'], gender_preference: 'all', family_friendly: false, senior_friendly: true, singles_friendly: true, couples_oriented: false, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: true, accessibility_notes: 'Wheelchair accessible venue with ramps and accessible restrooms.', religious_context: [], dietary_context: ['vegetarian', 'vegan'], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: [], dress_code: 'smart_casual', prerequisites_notes: 'No prior experience needed.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'quiet', physical_intensity: 'none', networking_focus: true, social_mixer: true, ice_breakers: true, group_activities: true, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'social_meetup', sub_category: 'tea_social', refund_policy: 'refund_up_to_24_hours', group_discounts: false },
      { title: 'Free Community Potluck', description: 'Bring a dish to share. Everyone welcome!', category: 'social', location: 'Community Hall, 123 Main St', start_time: new Date(Date.now() + 6 * 86400000).toISOString(), end_time: new Date(Date.now() + 6 * 86400000 + 10800000).toISOString(), max_participants: 40, is_public: true, is_paid_event: false, image_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=400&fit=crop', age_categories: ['kids', 'teens', 'adults', 'seniors'], gender_preference: 'all', family_friendly: true, senior_friendly: true, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: true, accessibility_notes: 'Fully accessible venue.', religious_context: [], dietary_context: ['vegetarian', 'vegan', 'gluten_free', 'halal', 'kosher'], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: [], dress_code: 'casual', prerequisites_notes: 'Bring a dish to share!', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'moderate', physical_intensity: 'none', networking_focus: true, social_mixer: true, ice_breakers: false, group_activities: true, team_building: false, primary_language: 'english', secondary_languages: ['spanish'], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'social_meetup', sub_category: 'potluck', refund_policy: 'no_refunds', group_discounts: false },
      { title: 'Singles Mingle Night', description: 'Speed dating event for singles aged 25-40.', category: 'social', location: 'The Lounge Bar', start_time: new Date(Date.now() + 8 * 86400000).toISOString(), end_time: new Date(Date.now() + 8 * 86400000 + 9000000).toISOString(), max_participants: 30, is_public: true, is_paid_event: true, ticketing_website: 'https://singles-events.com/mingle-night-456', image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop', age_categories: ['adults'], gender_preference: 'all', family_friendly: false, senior_friendly: false, singles_friendly: true, couples_oriented: false, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: false, accessibility_notes: 'Accessible venue.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: [], dress_code: 'smart_casual', prerequisites_notes: 'Singles only event.', content_rating: 'adult_supervised', alcohol_served: 'alcohol_served', smoking_policy: 'non_smoking', noise_level: 'moderate', physical_intensity: 'none', networking_focus: true, social_mixer: true, ice_breakers: true, group_activities: true, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'social_meetup', sub_category: 'speed_dating', refund_policy: 'no_refunds', group_discounts: false },
      { title: 'Couples Game Night', description: 'Board games and fun for couples. Free entry!', category: 'social', location: 'Game Cafe Downtown', start_time: new Date(Date.now() + 3 * 86400000).toISOString(), end_time: new Date(Date.now() + 3 * 86400000 + 10800000).toISOString(), max_participants: 20, is_public: true, is_paid_event: false, image_url: 'https://images.unsplash.com/photo-1564399580075-548fe4334853?w=800&h=400&fit=crop', age_categories: ['adults'], gender_preference: 'all', family_friendly: false, senior_friendly: false, singles_friendly: false, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: true, accessibility_notes: 'Accessible game cafe.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: [], dress_code: 'casual', prerequisites_notes: 'Bring your competitive spirit!', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'moderate', physical_intensity: 'none', networking_focus: false, social_mixer: true, ice_breakers: true, group_activities: true, team_building: true, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'interactive_workshop', sub_category: 'board_games', refund_policy: 'no_refunds', group_discounts: false },
      // === NETWORKING (Free & Paid) ===
      { title: 'Tech Networking Happy Hour', description: 'Connect with tech professionals.', category: 'networking', location: 'Craft Brewery, Downtown', start_time: new Date(Date.now() + 7 * 86400000).toISOString(), end_time: new Date(Date.now() + 7 * 86400000 + 10800000).toISOString(), max_participants: 60, is_public: true, is_paid_event: true, ticketing_website: 'https://techmeetup.com/happy-hour-789', image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop', age_categories: ['adults'], gender_preference: 'all', family_friendly: false, senior_friendly: false, singles_friendly: true, couples_oriented: false, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: true, accessibility_notes: 'Accessible brewery with ramps.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: [], dress_code: 'business_casual', prerequisites_notes: 'Bring business cards.', content_rating: 'adult_supervised', alcohol_served: 'alcohol_served', smoking_policy: 'non_smoking', noise_level: 'loud', physical_intensity: 'none', networking_focus: true, social_mixer: true, ice_breakers: true, group_activities: false, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'networking_event', sub_category: 'tech_networking', refund_policy: 'no_refunds', group_discounts: false },
      { title: 'Free Startup Pitch Practice', description: 'Practice your startup pitch. Get feedback.', category: 'networking', location: 'Innovation Hub', start_time: new Date(Date.now() + 4 * 86400000).toISOString(), end_time: new Date(Date.now() + 4 * 86400000 + 7200000).toISOString(), max_participants: 25, is_public: true, is_paid_event: false, image_url: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&h=400&fit=crop', age_categories: ['adults'], gender_preference: 'all', family_friendly: false, senior_friendly: false, singles_friendly: true, couples_oriented: false, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: true, accessibility_notes: 'Modern accessible innovation hub.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'intermediate', prior_experience: 'some_experience', physical_fitness: 'sedentary', equipment_required: ['laptop'], dress_code: 'business_casual', prerequisites_notes: 'Bring laptop and pitch deck.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'moderate', physical_intensity: 'none', networking_focus: true, social_mixer: false, ice_breakers: true, group_activities: true, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'interactive_workshop', sub_category: 'pitch_practice', refund_policy: 'no_refunds', group_discounts: false },
      { title: 'Women in Business Lunch', description: 'Exclusive networking lunch for women professionals.', category: 'networking', location: 'The Grand Hotel', start_time: new Date(Date.now() + 9 * 86400000).toISOString(), end_time: new Date(Date.now() + 9 * 86400000 + 7200000).toISOString(), max_participants: 20, is_public: false, is_paid_event: true, ticketing_website: 'https://womenbiz.com/lunch-networking-101', image_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=400&fit=crop', age_categories: ['adults'], gender_preference: 'women_only', family_friendly: false, senior_friendly: false, singles_friendly: true, couples_oriented: false, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: true, accessibility_notes: 'Luxury accessible hotel venue.', religious_context: [], dietary_context: ['vegetarian', 'vegan', 'gluten_free'], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: [], dress_code: 'business_formal', prerequisites_notes: 'Women professionals only.', content_rating: 'all_ages', alcohol_served: 'alcohol_served', smoking_policy: 'non_smoking', noise_level: 'quiet', physical_intensity: 'none', networking_focus: true, social_mixer: true, ice_breakers: true, group_activities: false, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'networking_event', sub_category: 'women_networking', refund_policy: 'refund_up_to_24_hours', group_discounts: false },
      { title: 'Free Freelancers Meetup', description: 'Connect with other independent workers.', category: 'networking', location: 'Co-working Space', start_time: new Date(Date.now() + 2 * 86400000).toISOString(), end_time: new Date(Date.now() + 2 * 86400000 + 7200000).toISOString(), max_participants: 35, is_public: true, is_paid_event: false, image_url: 'https://images.unsplash.com/photo-1564399580075-548fe4334853?w=800&h=400&fit=crop', age_categories: ['adults'], gender_preference: 'all', family_friendly: false, senior_friendly: false, singles_friendly: true, couples_oriented: false, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: true, accessibility_notes: 'Modern accessible co-working space.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: ['laptop'], dress_code: 'business_casual', prerequisites_notes: 'Bring your laptop and business cards.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'moderate', physical_intensity: 'none', networking_focus: true, social_mixer: true, ice_breakers: true, group_activities: false, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'networking_event', sub_category: 'business_networking', refund_policy: 'no_refunds', group_discounts: false },
      // === SPORTS (Free & Paid) ===
      { title: 'Beach Volleyball Tournament', description: 'Tournament for all skill levels. Teams of 4.', category: 'sports', location: 'Ocean Beach, SF', start_time: new Date(Date.now() + 3 * 86400000).toISOString(), end_time: new Date(Date.now() + 3 * 86400000 + 14400000).toISOString(), max_participants: 32, is_public: true, is_paid_event: true, ticketing_website: 'https://sports-league.com/volleyball-tourney-202', image_url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=400&fit=crop', age_categories: ['teens', 'adults'], gender_preference: 'all', family_friendly: true, senior_friendly: false, singles_friendly: true, couples_oriented: true, wheelchair_accessible: false, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: true, accessibility_notes: 'Beach access requires mobility on sand. Restrooms nearby.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'high', equipment_required: [], dress_code: 'athletic', prerequisites_notes: 'Teams of 4. All skill levels welcome.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'loud', physical_intensity: 'high', networking_focus: false, social_mixer: true, ice_breakers: false, group_activities: true, team_building: true, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'sports_competition', sub_category: 'volleyball', refund_policy: 'no_refunds', group_discounts: true },
      { title: 'Free Morning Running Club', description: 'Weekly morning run. All paces welcome!', category: 'sports', location: 'Memorial Park', start_time: new Date(Date.now() + 2 * 86400000).toISOString(), end_time: new Date(Date.now() + 2 * 86400000 + 3600000).toISOString(), max_participants: 50, is_public: true, is_paid_event: false, image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop', age_categories: ['teens', 'adults', 'seniors'], gender_preference: 'all', family_friendly: true, senior_friendly: true, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: true, accessibility_notes: 'Paved paths suitable for all mobility levels.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'moderate', equipment_required: ['running_shoes'], dress_code: 'athletic', prerequisites_notes: 'All paces welcome! Bring water.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'quiet', physical_intensity: 'moderate', networking_focus: true, social_mixer: true, ice_breakers: false, group_activities: true, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'sports_activity', sub_category: 'running', refund_policy: 'no_refunds', group_discounts: false },
      { title: 'Rock Climbing Workshop', description: 'Learn rock climbing basics. Equipment included.', category: 'sports', location: 'Peak Fitness Gym', start_time: new Date(Date.now() + 11 * 86400000).toISOString(), end_time: new Date(Date.now() + 11 * 86400000 + 10800000).toISOString(), max_participants: 12, is_public: true, is_paid_event: true, ticketing_website: 'https://peakfitness.com/climbing-workshop-303', image_url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=400&fit=crop', age_categories: ['teens', 'adults'], gender_preference: 'all', family_friendly: true, senior_friendly: false, singles_friendly: true, couples_oriented: true, wheelchair_accessible: false, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: false, accessibility_notes: 'Indoor climbing gym. Good mobility required.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'beginner', prior_experience: 'none_required', physical_fitness: 'high', equipment_required: [], dress_code: 'athletic', prerequisites_notes: 'All equipment provided. Wear comfortable athletic clothes.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'moderate', physical_intensity: 'high', networking_focus: false, social_mixer: true, ice_breakers: true, group_activities: true, team_building: true, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'instructional_workshop', sub_category: 'rock_climbing', refund_policy: 'refund_up_to_24_hours', group_discounts: true },
      { title: 'Free Basketball Pickup Games', description: 'Casual basketball every Saturday.', category: 'sports', location: 'Rec Center Gym', start_time: new Date(Date.now() + 3 * 86400000).toISOString(), end_time: new Date(Date.now() + 3 * 86400000 + 7200000).toISOString(), max_participants: 20, is_public: true, is_paid_event: false, image_url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=400&fit=crop', age_categories: ['teens', 'adults'], gender_preference: 'all', family_friendly: true, senior_friendly: false, singles_friendly: true, couples_oriented: true, wheelchair_accessible: false, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: false, accessibility_notes: 'Indoor gym accessible.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'moderate', equipment_required: ['basketball_shoes'], dress_code: 'athletic', prerequisites_notes: 'Casual games. All skill levels welcome.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'loud', physical_intensity: 'high', networking_focus: false, social_mixer: true, ice_breakers: false, group_activities: true, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'sports_activity', sub_category: 'basketball', refund_policy: 'no_refunds', group_discounts: false },
      // === FOOD (Free & Paid) ===
      { title: 'Italian Cooking Masterclass', description: 'Hands-on pasta making with Chef Maria.', category: 'food', location: 'Culinary Institute', start_time: new Date(Date.now() + 10 * 86400000).toISOString(), end_time: new Date(Date.now() + 10 * 86400000 + 10800000).toISOString(), max_participants: 16, is_public: true, is_paid_event: true, ticketing_website: 'https://culinaryinstitute.com/italian-class-404', image_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=400&fit=crop', age_categories: ['adults'], gender_preference: 'all', family_friendly: false, senior_friendly: false, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: false, accessibility_notes: 'Accessible professional kitchen.', religious_context: [], dietary_context: ['vegetarian'], traditional_attire: 'not_applicable', skill_level: 'beginner', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: [], dress_code: 'casual', prerequisites_notes: 'All ingredients and tools provided. Aprons provided.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'moderate', physical_intensity: 'none', networking_focus: false, social_mixer: true, ice_breakers: true, group_activities: true, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'instructional_workshop', sub_category: 'cooking_class', refund_policy: 'refund_up_to_24_hours', group_discounts: true },
      { title: 'Free Food Truck Festival', description: '20+ food trucks, live music, family fun!', category: 'food', location: 'City Center Plaza', start_time: new Date(Date.now() + 12 * 86400000).toISOString(), end_time: new Date(Date.now() + 12 * 86400000 + 18000000).toISOString(), max_participants: 500, is_public: true, is_paid_event: false, image_url: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&h=400&fit=crop', age_categories: ['kids', 'teens', 'adults', 'seniors'], gender_preference: 'all', family_friendly: true, senior_friendly: true, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: true, accessibility_notes: 'Outdoor plaza with accessible pathways.', religious_context: [], dietary_context: ['vegetarian', 'vegan', 'gluten_free', 'halal', 'kosher'], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: [], dress_code: 'casual', prerequisites_notes: 'Free entry. Food available for purchase.', content_rating: 'all_ages', alcohol_served: 'alcohol_served', smoking_policy: 'outdoor_smoking', noise_level: 'loud', physical_intensity: 'none', networking_focus: false, social_mixer: true, ice_breakers: false, group_activities: true, team_building: false, primary_language: 'english', secondary_languages: ['spanish'], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'festival', sub_category: 'food_festival', refund_policy: 'no_refunds', group_discounts: false },
      { title: 'Sushi Making Workshop', description: 'Master sushi rolling with a pro chef.', category: 'food', location: 'Asian Cultural Center', start_time: new Date(Date.now() + 14 * 86400000).toISOString(), end_time: new Date(Date.now() + 14 * 86400000 + 9000000).toISOString(), max_participants: 15, is_public: true, is_paid_event: true, ticketing_website: 'https://asianculture.com/sushi-workshop-505', image_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=400&fit=crop', age_categories: ['adults'], gender_preference: 'all', family_friendly: false, senior_friendly: false, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: false, accessibility_notes: 'Accessible cultural center kitchen.', religious_context: [], dietary_context: ['pescatarian'], traditional_attire: 'not_applicable', skill_level: 'beginner', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: [], dress_code: 'casual', prerequisites_notes: 'Fresh fish and vegetarian options available. All tools provided.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'moderate', physical_intensity: 'none', networking_focus: false, social_mixer: true, ice_breakers: true, group_activities: true, team_building: false, primary_language: 'english', secondary_languages: ['japanese'], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'instructional_workshop', sub_category: 'cooking_class', refund_policy: 'refund_up_to_24_hours', group_discounts: true },
      { title: 'Free Harvest Party', description: 'Fresh produce tastings and farm lunch.', category: 'food', location: 'Urban Gardens', start_time: new Date(Date.now() + 13 * 86400000).toISOString(), end_time: new Date(Date.now() + 13 * 86400000 + 14400000).toISOString(), max_participants: 80, is_public: true, is_paid_event: false, image_url: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&h=400&fit=crop', age_categories: ['kids', 'teens', 'adults', 'seniors'], gender_preference: 'all', family_friendly: true, senior_friendly: true, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: true, accessibility_notes: 'Urban farm with accessible pathways.', religious_context: [], dietary_context: ['vegetarian', 'vegan', 'organic'], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: [], dress_code: 'casual', prerequisites_notes: 'Free farm tour and tastings. Lunch included.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'moderate', physical_intensity: 'low', networking_focus: false, social_mixer: true, ice_breakers: false, group_activities: true, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'social_meetup', sub_category: 'farm_tour', refund_policy: 'no_refunds', group_discounts: false },
      // === WELLNESS (Free & Paid) ===
      { title: 'Free Community Yoga', description: 'Yoga for all levels. Bring your mat!', category: 'wellness', location: 'Central Park', start_time: new Date(Date.now() + 2 * 86400000).toISOString(), end_time: new Date(Date.now() + 2 * 86400000 + 5400000).toISOString(), max_participants: 50, is_public: true, is_paid_event: false, image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop', age_categories: ['teens', 'adults', 'seniors'], gender_preference: 'all', family_friendly: true, senior_friendly: true, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: true, accessibility_notes: 'Outdoor park with accessible pathways.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'low', equipment_required: ['yoga_mat'], dress_code: 'athletic', prerequisites_notes: 'Bring your own yoga mat. All levels welcome.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'quiet', physical_intensity: 'low', networking_focus: false, social_mixer: true, ice_breakers: false, group_activities: true, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'instructional_workshop', sub_category: 'yoga', refund_policy: 'no_refunds', group_discounts: false },
      { title: 'Wellness Retreat Day', description: 'Meditation, spa, healthy meals. Full day!', category: 'wellness', location: 'Serenity Spa Resort', start_time: new Date(Date.now() + 15 * 86400000).toISOString(), end_time: new Date(Date.now() + 15 * 86400000 + 28800000).toISOString(), max_participants: 30, is_public: true, is_paid_event: true, ticketing_website: 'https://serenityspa.com/retreat-day-606', image_url: 'https://images.unsplash.com/photo-1564399580075-548fe4334853?w=800&h=400&fit=crop', age_categories: ['adults', 'seniors'], gender_preference: 'all', family_friendly: false, senior_friendly: true, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: true, service_animals_allowed: true, accessibility_notes: 'Luxury spa with full accessibility features.', religious_context: [], dietary_context: ['vegetarian', 'vegan', 'gluten_free', 'organic'], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: [], dress_code: 'casual', prerequisites_notes: 'All meals and spa treatments included. Come relax!', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'quiet', physical_intensity: 'none', networking_focus: false, social_mixer: true, ice_breakers: false, group_activities: true, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'retreat', sub_category: 'wellness_retreat', refund_policy: 'refund_up_to_7_days', group_discounts: true },
      { title: 'Free Mindfulness Session', description: 'Guided meditation for stress relief.', category: 'wellness', location: 'Public Library', start_time: new Date(Date.now() + 4 * 86400000).toISOString(), end_time: new Date(Date.now() + 4 * 86400000 + 3600000).toISOString(), max_participants: 25, is_public: true, is_paid_event: false, image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e4f8db7?w=800&h=400&fit=crop', age_categories: ['adults', 'seniors'], gender_preference: 'all', family_friendly: false, senior_friendly: true, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: true, service_animals_allowed: true, accessibility_notes: 'Quiet library meeting room. Sensory-friendly environment.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: [], dress_code: 'casual', prerequisites_notes: 'Free session. Chairs provided. No experience needed.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'quiet', physical_intensity: 'none', networking_focus: false, social_mixer: false, ice_breakers: false, group_activities: false, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'guided_session', sub_category: 'meditation', refund_policy: 'no_refunds', group_discounts: false },
      { title: 'Pilates Beginners Course', description: '4-week intro Pilates. Small groups.', category: 'wellness', location: 'FitLife Studio', start_time: new Date(Date.now() + 7 * 86400000).toISOString(), end_time: new Date(Date.now() + 7 * 86400000 + 3600000).toISOString(), max_participants: 10, is_public: true, is_paid_event: true, ticketing_website: 'https://fitlifestudio.com/pilates-course-707', image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop', age_categories: ['adults'], gender_preference: 'all', family_friendly: false, senior_friendly: false, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: false, accessibility_notes: 'Modern fitness studio with accessible facilities.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'beginner', prior_experience: 'none_required', physical_fitness: 'low', equipment_required: [], dress_code: 'athletic', prerequisites_notes: '4-week course. All equipment provided. Beginners only.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'moderate', physical_intensity: 'low', networking_focus: false, social_mixer: true, ice_breakers: false, group_activities: true, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'instructional_workshop', sub_category: 'pilates', refund_policy: 'refund_up_to_24_hours', group_discounts: true },
      // === ENTERTAINMENT (Free & Paid) ===
      { title: 'Outdoor Movie Night', description: 'Free screening of The Lion King!', category: 'entertainment', location: 'Riverside Park', start_time: new Date(Date.now() + 4 * 86400000).toISOString(), end_time: new Date(Date.now() + 4 * 86400000 + 9000000).toISOString(), max_participants: 100, is_public: true, is_paid_event: false, image_url: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&h=400&fit=crop', age_categories: ['kids', 'teens', 'adults', 'seniors'], gender_preference: 'all', family_friendly: true, senior_friendly: true, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: true, accessibility_notes: 'Outdoor park with accessible viewing areas.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: [], dress_code: 'casual', prerequisites_notes: 'Free movie! Bring blankets and chairs. Family-friendly.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'moderate', physical_intensity: 'none', networking_focus: false, social_mixer: true, ice_breakers: false, group_activities: true, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'screening', sub_category: 'movie_night', refund_policy: 'no_refunds', group_discounts: false },
      { title: 'Jazz & Comedy Night', description: 'Live jazz and stand-up comedy.', category: 'entertainment', location: 'The Jazz Club', start_time: new Date(Date.now() + 9 * 86400000).toISOString(), end_time: new Date(Date.now() + 9 * 86400000 + 10800000).toISOString(), max_participants: 80, is_public: true, is_paid_event: true, ticketing_website: 'https://jazzclub.com/comedy-night-808', image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop', age_categories: ['adults'], gender_preference: 'all', family_friendly: false, senior_friendly: false, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: false, accessibility_notes: 'Jazz club with accessible seating.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: [], dress_code: 'smart_casual', prerequisites_notes: 'Live music and comedy. 18+ event.', content_rating: 'adult_supervised', alcohol_served: 'alcohol_served', smoking_policy: 'outdoor_smoking', noise_level: 'loud', physical_intensity: 'none', networking_focus: false, social_mixer: true, ice_breakers: false, group_activities: false, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'performance', sub_category: 'live_entertainment', refund_policy: 'no_refunds', group_discounts: false },
      { title: 'Free Shakespeare in Park', description: 'Professional Romeo and Juliet.', category: 'entertainment', location: 'Botanical Gardens', start_time: new Date(Date.now() + 16 * 86400000).toISOString(), end_time: new Date(Date.now() + 16 * 86400000 + 9000000).toISOString(), max_participants: 200, is_public: true, is_paid_event: false, image_url: 'https://images.unsplash.com/photo-1564399580075-548fe4334853?w=800&h=400&fit=crop', age_categories: ['teens', 'adults', 'seniors'], gender_preference: 'all', family_friendly: true, senior_friendly: true, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: true, accessibility_notes: 'Outdoor amphitheater with accessible seating.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: [], dress_code: 'casual', prerequisites_notes: 'Free professional theater. Bring lawn chairs or blankets.', content_rating: 'teen_plus', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'moderate', physical_intensity: 'none', networking_focus: false, social_mixer: true, ice_breakers: false, group_activities: true, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'performance', sub_category: 'theater', refund_policy: 'no_refunds', group_discounts: false },
      { title: 'Karaoke Championship', description: 'Prizes for best singers!', category: 'entertainment', location: 'Starlight Lounge', start_time: new Date(Date.now() + 10 * 86400000).toISOString(), end_time: new Date(Date.now() + 10 * 86400000 + 14400000).toISOString(), max_participants: 40, is_public: true, is_paid_event: true, ticketing_website: 'https://starlightlounge.com/karaoke-champ-909', image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop', age_categories: ['adults'], gender_preference: 'all', family_friendly: false, senior_friendly: false, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: false, accessibility_notes: 'Lounge with accessible stage area.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: [], dress_code: 'casual', prerequisites_notes: 'Competition with prizes. All skill levels welcome!', content_rating: 'adult_supervised', alcohol_served: 'alcohol_served', smoking_policy: 'outdoor_smoking', noise_level: 'loud', physical_intensity: 'none', networking_focus: false, social_mixer: true, ice_breakers: true, group_activities: true, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'competition', sub_category: 'karaoke', refund_policy: 'no_refunds', group_discounts: false },
      // === ARTS (Free & Paid) ===
      { title: 'Watercolor Workshop', description: 'Learn watercolor techniques. All supplies included.', category: 'arts', location: 'Creative Arts Studio', start_time: new Date(Date.now() + 6 * 86400000).toISOString(), end_time: new Date(Date.now() + 6 * 86400000 + 10800000).toISOString(), max_participants: 15, is_public: true, is_paid_event: true, ticketing_website: 'https://creativearts.com/watercolor-class-111', image_url: 'https://images.unsplash.com/photo-1564399580075-548fe4334853?w=800&h=400&fit=crop', age_categories: ['adults', 'seniors'], gender_preference: 'all', family_friendly: false, senior_friendly: true, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: false, accessibility_notes: 'Accessible art studio with good lighting.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'beginner', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: [], dress_code: 'casual', prerequisites_notes: 'All art supplies included. No experience needed.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'quiet', physical_intensity: 'none', networking_focus: false, social_mixer: true, ice_breakers: true, group_activities: true, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'instructional_workshop', sub_category: 'painting', refund_policy: 'refund_up_to_24_hours', group_discounts: true },
      { title: 'Free Gallery Opening', description: 'Meet artists, enjoy refreshments.', category: 'arts', location: 'Downtown Art Gallery', start_time: new Date(Date.now() + 5 * 86400000).toISOString(), end_time: new Date(Date.now() + 5 * 86400000 + 7200000).toISOString(), max_participants: 60, is_public: true, is_paid_event: false, image_url: 'https://images.unsplash.com/photo-1564399580075-548fe4334853?w=800&h=400&fit=crop', age_categories: ['teens', 'adults', 'seniors'], gender_preference: 'all', family_friendly: true, senior_friendly: true, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: true, accessibility_notes: 'Modern gallery with full accessibility.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: [], dress_code: 'smart_casual', prerequisites_notes: 'Free entry. Wine and cheese provided.', content_rating: 'all_ages', alcohol_served: 'alcohol_served', smoking_policy: 'non_smoking', noise_level: 'moderate', physical_intensity: 'none', networking_focus: true, social_mixer: true, ice_breakers: false, group_activities: false, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'social_meetup', sub_category: 'art_exhibition', refund_policy: 'no_refunds', group_discounts: false },
      { title: 'Pottery Making Class', description: 'Create ceramics. Wheel and hand-building.', category: 'arts', location: 'Clay Works Studio', start_time: new Date(Date.now() + 13 * 86400000).toISOString(), end_time: new Date(Date.now() + 13 * 86400000 + 9000000).toISOString(), max_participants: 12, is_public: true, is_paid_event: true, ticketing_website: 'https://clayworks.com/pottery-class-222', image_url: 'https://images.unsplash.com/photo-1564399580075-548fe4334853?w=800&h=400&fit=crop', age_categories: ['teens', 'adults'], gender_preference: 'all', family_friendly: true, senior_friendly: true, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: false, accessibility_notes: 'Pottery studio with accessible wheel stations.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'beginner', prior_experience: 'none_required', physical_fitness: 'low', equipment_required: [], dress_code: 'casual', prerequisites_notes: 'Clay and tools provided. Wear clothes that can get dirty.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'moderate', physical_intensity: 'low', networking_focus: false, social_mixer: true, ice_breakers: true, group_activities: true, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'instructional_workshop', sub_category: 'pottery', refund_policy: 'refund_up_to_24_hours', group_discounts: true },
      { title: 'Free Photography Walk', description: 'Learn street photography. Historic district.', category: 'arts', location: 'Clock Tower Meeting', start_time: new Date(Date.now() + 8 * 86400000).toISOString(), end_time: new Date(Date.now() + 8 * 86400000 + 7200000).toISOString(), max_participants: 20, is_public: true, is_paid_event: false, image_url: 'https://images.unsplash.com/photo-1564399580075-548fe4334853?w=800&h=400&fit=crop', age_categories: ['teens', 'adults', 'seniors'], gender_preference: 'all', family_friendly: true, senior_friendly: true, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: true, accessibility_notes: 'Outdoor walk on paved accessible streets.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'low', equipment_required: ['camera'], dress_code: 'casual', prerequisites_notes: 'Bring any camera or smartphone. Walking tour.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'moderate', physical_intensity: 'low', networking_focus: false, social_mixer: true, ice_breakers: true, group_activities: true, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'guided_session', sub_category: 'photography', refund_policy: 'no_refunds', group_discounts: false },
      // === MUSIC (Free & Paid) ===
      { title: 'Free Acoustic Open Mic', description: 'Share your music or enjoy locals.', category: 'music', location: 'Coffee House', start_time: new Date(Date.now() + 7 * 86400000).toISOString(), end_time: new Date(Date.now() + 7 * 86400000 + 10800000).toISOString(), max_participants: 35, is_public: true, is_paid_event: false, image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop', age_categories: ['teens', 'adults', 'seniors'], gender_preference: 'all', family_friendly: true, senior_friendly: true, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: true, accessibility_notes: 'Cozy coffee house with accessible entrance.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: ['musical_instrument'], dress_code: 'casual', prerequisites_notes: 'Bring your instrument or just come to listen. Sign up at door.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'moderate', physical_intensity: 'none', networking_focus: false, social_mixer: true, ice_breakers: false, group_activities: true, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'performance', sub_category: 'open_mic', refund_policy: 'no_refunds', group_discounts: false },
      { title: 'Symphony Orchestra Concert', description: 'Classical masterpieces. Premium seats.', category: 'music', location: 'Concert Hall', start_time: new Date(Date.now() + 18 * 86400000).toISOString(), end_time: new Date(Date.now() + 18 * 86400000 + 9000000).toISOString(), max_participants: 250, is_public: true, is_paid_event: true, ticketing_website: 'https://concerthall.com/symphony-tickets-333', image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop', age_categories: ['kids', 'teens', 'adults', 'seniors'], gender_preference: 'all', family_friendly: true, senior_friendly: true, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: true, service_animals_allowed: true, accessibility_notes: 'World-class concert hall with assistive listening devices.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: [], dress_code: 'formal', prerequisites_notes: 'Evening of classical music. Premium seating available.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'quiet', physical_intensity: 'none', networking_focus: false, social_mixer: false, ice_breakers: false, group_activities: false, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'performance', sub_category: 'classical_music', refund_policy: 'no_refunds', group_discounts: true },
      { title: 'Free Summer Concert', description: 'Local bands, food vendors. Dancing!', category: 'music', location: 'Town Square', start_time: new Date(Date.now() + 11 * 86400000).toISOString(), end_time: new Date(Date.now() + 11 * 86400000 + 14400000).toISOString(), max_participants: 300, is_public: true, is_paid_event: false, image_url: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&h=400&fit=crop', age_categories: ['kids', 'teens', 'adults', 'seniors'], gender_preference: 'all', family_friendly: true, senior_friendly: true, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: true, accessibility_notes: 'Outdoor venue with accessible viewing areas.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'moderate', equipment_required: [], dress_code: 'casual', prerequisites_notes: 'Free outdoor concert. Food vendors on site. Bring lawn chairs.', content_rating: 'all_ages', alcohol_served: 'alcohol_served', smoking_policy: 'outdoor_smoking', noise_level: 'loud', physical_intensity: 'moderate', networking_focus: false, social_mixer: true, ice_breakers: false, group_activities: true, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'festival', sub_category: 'live_music', refund_policy: 'no_refunds', group_discounts: false },
      { title: 'Guitar Lessons Adults', description: 'Small group lessons for beginners.', category: 'music', location: 'Music Academy', start_time: new Date(Date.now() + 9 * 86400000).toISOString(), end_time: new Date(Date.now() + 9 * 86400000 + 3600000).toISOString(), max_participants: 8, is_public: true, is_paid_event: true, ticketing_website: 'https://musicacademy.com/guitar-lessons-444', image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop', age_categories: ['adults'], gender_preference: 'all', family_friendly: false, senior_friendly: false, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: false, accessibility_notes: 'Music academy with accessible classrooms.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'beginner', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: [], dress_code: 'casual', prerequisites_notes: 'Guitars provided or bring your own. Beginners welcome.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'moderate', physical_intensity: 'none', networking_focus: false, social_mixer: true, ice_breakers: true, group_activities: true, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'instructional_workshop', sub_category: 'music_lessons', refund_policy: 'refund_up_to_24_hours', group_discounts: true },
      // === EDUCATION (Free & Paid) ===
      { title: 'Python Programming Intro', description: 'Learn coding basics. Laptop required.', category: 'education', location: 'Tech Learning Center', start_time: new Date(Date.now() + 12 * 86400000).toISOString(), end_time: new Date(Date.now() + 12 * 86400000 + 10800000).toISOString(), max_participants: 20, is_public: true, is_paid_event: true, ticketing_website: 'https://techlearning.com/python-intro-555', image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e4f8db7?w=800&h=400&fit=crop', age_categories: ['adults'], gender_preference: 'all', family_friendly: false, senior_friendly: false, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: false, accessibility_notes: 'Tech learning center with accessible workstations.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'beginner', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: ['laptop'], dress_code: 'casual', prerequisites_notes: 'Bring your own laptop. No prior programming experience needed.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'moderate', physical_intensity: 'none', networking_focus: true, social_mixer: true, ice_breakers: true, group_activities: true, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'instructional_workshop', sub_category: 'coding_class', refund_policy: 'refund_up_to_24_hours', group_discounts: true },
      { title: 'Free Climate Science Talk', description: 'Latest climate research. Open to all.', category: 'education', location: 'University Hall A', start_time: new Date(Date.now() + 10 * 86400000).toISOString(), end_time: new Date(Date.now() + 10 * 86400000 + 5400000).toISOString(), max_participants: 150, is_public: true, is_paid_event: false, image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e4f8db7?w=800&h=400&fit=crop', age_categories: ['teens', 'adults', 'seniors'], gender_preference: 'all', family_friendly: true, senior_friendly: true, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: true, accessibility_notes: 'University lecture hall with full accessibility.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: [], dress_code: 'casual', prerequisites_notes: 'Free public lecture. Q&A session included.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'quiet', physical_intensity: 'none', networking_focus: false, social_mixer: false, ice_breakers: false, group_activities: false, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'lecture', sub_category: 'science_talk', refund_policy: 'no_refunds', group_discounts: false },
      { title: 'Financial Planning Workshop', description: 'Investment and retirement strategies.', category: 'education', location: 'Business Center', start_time: new Date(Date.now() + 14 * 86400000).toISOString(), end_time: new Date(Date.now() + 14 * 86400000 + 7200000).toISOString(), max_participants: 25, is_public: true, is_paid_event: true, ticketing_website: 'https://businesscenter.com/finance-workshop-666', image_url: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&h=400&fit=crop', age_categories: ['adults', 'seniors'], gender_preference: 'all', family_friendly: false, senior_friendly: true, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: true, accessibility_notes: 'Business center with accessible meeting rooms.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: [], dress_code: 'business_casual', prerequisites_notes: 'Learn investment basics. Materials provided.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'quiet', physical_intensity: 'none', networking_focus: true, social_mixer: true, ice_breakers: true, group_activities: false, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'instructional_workshop', sub_category: 'finance_workshop', refund_policy: 'refund_up_to_24_hours', group_discounts: true },
      { title: 'Free Language Exchange', description: 'Practice Spanish, French, Mandarin.', category: 'education', location: 'Cultural Center', start_time: new Date(Date.now() + 6 * 86400000).toISOString(), end_time: new Date(Date.now() + 6 * 86400000 + 7200000).toISOString(), max_participants: 40, is_public: true, is_paid_event: false, image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e4f8db7?w=800&h=400&fit=crop', age_categories: ['teens', 'adults', 'seniors'], gender_preference: 'all', family_friendly: true, senior_friendly: true, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: true, accessibility_notes: 'Cultural center with accessible meeting rooms.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: [], dress_code: 'casual', prerequisites_notes: 'All language levels welcome. Conversational practice.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'moderate', physical_intensity: 'none', networking_focus: true, social_mixer: true, ice_breakers: true, group_activities: true, team_building: false, primary_language: 'english', secondary_languages: ['spanish', 'french', 'chinese'], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'language_exchange', sub_category: 'conversation_practice', refund_policy: 'no_refunds', group_discounts: false },
      // === TECHNOLOGY (Free & Paid) ===
      { title: 'AI & ML Workshop', description: 'Hands-on machine learning. Bring laptop.', category: 'technology', location: 'Innovation Hub', start_time: new Date(Date.now() + 17 * 86400000).toISOString(), end_time: new Date(Date.now() + 17 * 86400000 + 21600000).toISOString(), max_participants: 30, is_public: true, is_paid_event: true, ticketing_website: 'https://innovationhub.com/ai-workshop-777', image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e4f8db7?w=800&h=400&fit=crop', age_categories: ['adults'], gender_preference: 'all', family_friendly: false, senior_friendly: false, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: false, accessibility_notes: 'Tech hub with accessible workstations.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'intermediate', prior_experience: 'some_experience', physical_fitness: 'sedentary', equipment_required: ['laptop'], dress_code: 'casual', prerequisites_notes: 'Python knowledge required. Full-day intensive workshop.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'moderate', physical_intensity: 'none', networking_focus: true, social_mixer: true, ice_breakers: true, group_activities: true, team_building: true, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'instructional_workshop', sub_category: 'tech_workshop', refund_policy: 'refund_up_to_7_days', group_discounts: true },
      { title: 'Free Web Dev Meetup', description: 'Latest frameworks. Pizza provided!', category: 'technology', location: 'Startup Hub', start_time: new Date(Date.now() + 5 * 86400000).toISOString(), end_time: new Date(Date.now() + 5 * 86400000 + 9000000).toISOString(), max_participants: 45, is_public: true, is_paid_event: false, image_url: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&h=400&fit=crop', age_categories: ['adults'], gender_preference: 'all', family_friendly: false, senior_friendly: false, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: true, accessibility_notes: 'Startup hub with accessible facilities and parking.', religious_context: [], dietary_context: ['vegetarian'], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: [], dress_code: 'casual', prerequisites_notes: 'Free meetup. Pizza and drinks provided. Networking encouraged.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'moderate', physical_intensity: 'none', networking_focus: true, social_mixer: true, ice_breakers: true, group_activities: true, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'tech_meetup', sub_category: 'web_development', refund_policy: 'no_refunds', group_discounts: false },
      { title: 'Drone Photography Course', description: 'Learn aerial photography. Flight practice.', category: 'technology', location: 'Adventure Center', start_time: new Date(Date.now() + 20 * 86400000).toISOString(), end_time: new Date(Date.now() + 20 * 86400000 + 18000000).toISOString(), max_participants: 15, is_public: true, is_paid_event: true, ticketing_website: 'https://adventurecenter.com/drone-course-888', image_url: 'https://images.unsplash.com/photo-1564399580075-548fe4334853?w=800&h=400&fit=crop', age_categories: ['adults'], gender_preference: 'all', family_friendly: false, senior_friendly: false, singles_friendly: true, couples_oriented: true, wheelchair_accessible: false, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: false, accessibility_notes: 'Outdoor field location. Must walk to flying area.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'beginner', prior_experience: 'none_required', physical_fitness: 'low', equipment_required: [], dress_code: 'casual', prerequisites_notes: 'Full-day course. Drones provided. Weather dependent.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'outdoor_smoking', noise_level: 'moderate', physical_intensity: 'low', networking_focus: false, social_mixer: true, ice_breakers: true, group_activities: true, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'instructional_workshop', sub_category: 'drone_training', refund_policy: 'refund_up_to_7_days', group_discounts: false },
      { title: 'Free Coding for Kids', description: 'Ages 8-12. Create your first game!', category: 'technology', location: 'Library Computer Lab', start_time: new Date(Date.now() + 8 * 86400000).toISOString(), end_time: new Date(Date.now() + 8 * 86400000 + 7200000).toISOString(), max_participants: 16, is_public: true, is_paid_event: false, image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e4f8db7?w=800&h=400&fit=crop', age_categories: ['kids'], gender_preference: 'all', family_friendly: true, senior_friendly: false, singles_friendly: false, couples_oriented: false, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: true, service_animals_allowed: false, accessibility_notes: 'Library computer lab with accessible stations.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'beginner', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: [], dress_code: 'casual', prerequisites_notes: 'Ages 8-12 only. No experience needed. Create your own game!', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'moderate', physical_intensity: 'none', networking_focus: false, social_mixer: true, ice_breakers: true, group_activities: true, team_building: true, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'instructional_workshop', sub_category: 'kids_coding', refund_policy: 'no_refunds', group_discounts: false },
      // === OUTDOOR (Free & Paid) ===
      { title: 'Guided Nature Hike', description: '5-mile scenic hike. Learn flora/fauna.', category: 'outdoor', location: 'Mountain Park', start_time: new Date(Date.now() + 4 * 86400000).toISOString(), end_time: new Date(Date.now() + 4 * 86400000 + 14400000).toISOString(), max_participants: 20, is_public: true, is_paid_event: true, ticketing_website: 'https://mountainpark.com/nature-hike-999', image_url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=400&fit=crop', age_categories: ['teens', 'adults'], gender_preference: 'all', family_friendly: true, senior_friendly: false, singles_friendly: true, couples_oriented: true, wheelchair_accessible: false, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: true, accessibility_notes: 'Mountain trails. Good physical fitness required.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'intermediate', prior_experience: 'some_experience', physical_fitness: 'high', equipment_required: ['hiking_boots', 'water_bottle'], dress_code: 'outdoor', prerequisites_notes: '5-mile hike with elevation gain. Proper footwear required.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'outdoor_smoking', noise_level: 'quiet', physical_intensity: 'high', networking_focus: false, social_mixer: true, ice_breakers: true, group_activities: true, team_building: true, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'guided_tour', sub_category: 'nature_hike', refund_policy: 'refund_up_to_24_hours', group_discounts: true },
      { title: 'Free Beach Cleanup', description: 'Community cleanup. Gloves provided. Pizza!', category: 'outdoor', location: 'Sunset Beach', start_time: new Date(Date.now() + 7 * 86400000).toISOString(), end_time: new Date(Date.now() + 7 * 86400000 + 10800000).toISOString(), max_participants: 100, is_public: true, is_paid_event: false, image_url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=400&fit=crop', age_categories: ['kids', 'teens', 'adults', 'seniors'], gender_preference: 'all', family_friendly: true, senior_friendly: true, singles_friendly: true, couples_oriented: true, wheelchair_accessible: false, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: true, accessibility_notes: 'Beach access. Some walking on sand required.', religious_context: [], dietary_context: ['vegetarian'], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'low', equipment_required: [], dress_code: 'casual', prerequisites_notes: 'All supplies provided. Pizza party after cleanup!', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'moderate', physical_intensity: 'low', networking_focus: false, social_mixer: true, ice_breakers: true, group_activities: true, team_building: true, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'volunteer_event', sub_category: 'environmental', refund_policy: 'no_refunds', group_discounts: false },
      { title: 'Weekend Camping Trip', description: 'National park camping. Meals included.', category: 'outdoor', location: 'National Forest', start_time: new Date(Date.now() + 19 * 86400000).toISOString(), end_time: new Date(Date.now() + 21 * 86400000).toISOString(), max_participants: 25, is_public: true, is_paid_event: true, ticketing_website: 'https://nationalforest.com/camping-trip-000', image_url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=400&fit=crop', age_categories: ['teens', 'adults'], gender_preference: 'all', family_friendly: true, senior_friendly: false, singles_friendly: true, couples_oriented: true, wheelchair_accessible: false, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: true, accessibility_notes: 'Campsite accessible by vehicle. Some hiking trails nearby.', religious_context: [], dietary_context: ['vegetarian', 'vegan'], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'moderate', equipment_required: ['sleeping_bag'], dress_code: 'outdoor', prerequisites_notes: '2-day camping trip. Tents and meals provided. Bring sleeping bag.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'outdoor_smoking', noise_level: 'quiet', physical_intensity: 'moderate', networking_focus: false, social_mixer: true, ice_breakers: true, group_activities: true, team_building: true, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'retreat', sub_category: 'camping', refund_policy: 'refund_up_to_7_days', group_discounts: true },
      { title: 'Free Park Stargazing', description: 'Telescope viewing. Astronomy talk.', category: 'outdoor', location: 'Observatory Park', start_time: new Date(Date.now() + 9 * 86400000).toISOString(), end_time: new Date(Date.now() + 9 * 86400000 + 7200000).toISOString(), max_participants: 50, is_public: true, is_paid_event: false, image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop', age_categories: ['kids', 'teens', 'adults', 'seniors'], gender_preference: 'all', family_friendly: true, senior_friendly: true, singles_friendly: true, couples_oriented: true, wheelchair_accessible: true, mobility_friendly: true, hearing_accessible: true, vision_accessible: true, sensory_friendly: false, service_animals_allowed: true, accessibility_notes: 'Observatory park with accessible viewing areas.', religious_context: [], dietary_context: [], traditional_attire: 'not_applicable', skill_level: 'all_levels', prior_experience: 'none_required', physical_fitness: 'sedentary', equipment_required: [], dress_code: 'warm_clothes', prerequisites_notes: 'Free stargazing event. Bring warm clothes. Telescopes provided.', content_rating: 'all_ages', alcohol_served: 'no_alcohol', smoking_policy: 'non_smoking', noise_level: 'quiet', physical_intensity: 'none', networking_focus: false, social_mixer: true, ice_breakers: false, group_activities: true, team_building: false, primary_language: 'english', secondary_languages: [], interpretation_available: false, sign_language_interpreter: false, event_type: 'in_person', format: 'guided_session', sub_category: 'astronomy', refund_policy: 'no_refunds', group_discounts: false },
    ];

    try {
      const createdEvents: Event[] = [];
      
      for (const eventData of dummyEvents) {
        const result = await createEvent(eventData);
        if (result) {
          createdEvents.push(result);
        }
      }
      
      toast.success(`Created ${createdEvents.length} dummy events successfully!`);
      fetchEvents(); // Refresh the event list
    } catch (error) {
      console.error('❌ Failed to seed dummy events:', error);
      toast.error(`Error: ${error.message}`);
    }
  };

  // Handle wizard visibility changes
  const handleWizardOpen = () => {
    setShowCreateWizard(true);
    setEditingEvent(null);
    // Auto-collapse sidebar when wizard opens
    setSidebarIconized(true);
  };

  const fetchFullEventDetails = async (eventId: string) => {
    try {
      const fullEvent = await apiClient.getEvent(eventId);
      return fullEvent;
    } catch (error) {
      console.error('Failed to fetch full event details:', error);
      toast.error('Failed to load event details');
      return null;
    }
  };

  const handleWizardEdit = async (event: Event) => {
    // Fetch full event details before opening wizard
    const fullEventDetails = await fetchFullEventDetails(event.id);
    if (!fullEventDetails) return;

    // Map full event data to EventFormData format
    const initialData: Partial<EventFormData> = {
      title: fullEventDetails.title || '',
      description: fullEventDetails.description || '',
      location: fullEventDetails.location || '',
      category: fullEventDetails.category || '',
      max_participants: fullEventDetails.max_participants,
      is_public: fullEventDetails.is_public,
      image_url: fullEventDetails.image_url || '',
      // Map dates from ISO strings to Date objects
      start_time: fullEventDetails.start_time ? new Date(fullEventDetails.start_time) : null,
      end_time: fullEventDetails.end_time ? new Date(fullEventDetails.end_time) : null,
      // Language
      language: fullEventDetails.language || 'en',
      // Type & Format fields
      event_type: fullEventDetails.event_type || 'in_person',
      event_format: fullEventDetails.event_format || 'single',
      event_privacy: fullEventDetails.event_privacy || 'public',
      is_paid_event: fullEventDetails.is_paid_event || false,
      timezone: fullEventDetails.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      venue_city: fullEventDetails.venue_city || '',
      venue_state: fullEventDetails.venue_state || '',
      venue_zip_code: fullEventDetails.venue_zip_code || '',
      venue_country: fullEventDetails.venue_country || '',
      subtitle: fullEventDetails.subtitle || '',
      summary: fullEventDetails.summary || '',
      doors_open_time: fullEventDetails.doors_open_time ? new Date(fullEventDetails.doors_open_time) : null,
      registration_start_time: fullEventDetails.registration_start_time ? new Date(fullEventDetails.registration_start_time) : null,
      registration_end_time: fullEventDetails.registration_end_time ? new Date(fullEventDetails.registration_end_time) : null,
      virtual_event_url: fullEventDetails.virtual_event_url || '',
      virtual_event_platform: fullEventDetails.virtual_event_platform || '',
      event_password: fullEventDetails.event_password || '',
      age_restriction: fullEventDetails.age_restriction || '',
      accessibility_options: fullEventDetails.accessibility_options || '',
      event_website: fullEventDetails.event_website || '',
      event_contact_email: fullEventDetails.event_contact_email || '',
      ticketing_website: fullEventDetails.ticketing_website || '',
      refund_policy: fullEventDetails.refund_policy || 'no_refunds',
      custom_refund_policy: fullEventDetails.custom_refund_policy || '',
      ticket_pricing_description: fullEventDetails.ticket_pricing_description || '',
      tags: fullEventDetails.tags || [],
      image_file: null,
      status: fullEventDetails.status || 'draft',

      // New event attributes
      age_categories: fullEventDetails.age_categories || [],
      gender_preference: fullEventDetails.gender_preference || 'all',
      family_friendly: fullEventDetails.family_friendly || false,
      senior_friendly: fullEventDetails.senior_friendly || false,
      singles_friendly: fullEventDetails.singles_friendly || false,
      couples_oriented: fullEventDetails.couples_oriented || false,
      wheelchair_accessible: fullEventDetails.wheelchair_accessible || false,
      mobility_friendly: fullEventDetails.mobility_friendly || false,
      hearing_accessible: fullEventDetails.hearing_accessible || false,
      vision_accessible: fullEventDetails.vision_accessible || false,
      sensory_friendly: fullEventDetails.sensory_friendly || false,
      service_animals_allowed: fullEventDetails.service_animals_allowed || false,
      accessibility_notes: fullEventDetails.accessibility_notes || '',
      religious_context: fullEventDetails.religious_context || [],
      dietary_context: fullEventDetails.dietary_context || [],
      traditional_attire: (fullEventDetails.traditional_attire || 'not_applicable') as 'not_applicable' | 'encouraged' | 'required' | 'optional',
      skill_level: fullEventDetails.skill_level || 'all_levels',
      prior_experience: fullEventDetails.prior_experience || 'none_required',
      physical_fitness: fullEventDetails.physical_fitness || 'sedentary',
      equipment_required: fullEventDetails.equipment_required || [],
      dress_code: fullEventDetails.dress_code || 'casual',
      prerequisites_notes: fullEventDetails.prerequisites_notes || '',
      content_rating: fullEventDetails.content_rating || 'all_ages',
      alcohol_served: fullEventDetails.alcohol_served || 'no_alcohol',
      smoking_policy: fullEventDetails.smoking_policy || 'non_smoking',
      noise_level: (fullEventDetails.noise_level || 'moderate') as 'quiet' | 'moderate' | 'loud' | 'very_loud',
      physical_intensity: (fullEventDetails.physical_intensity || 'none') as 'none' | 'low' | 'medium' | 'high' | 'extreme',
      networking_focus: fullEventDetails.networking_focus || false,
      social_mixer: fullEventDetails.social_mixer || false,
      ice_breakers: fullEventDetails.ice_breakers || false,
      group_activities: fullEventDetails.group_activities || false,
      team_building: fullEventDetails.team_building || false,
    };

    setEditingEventInitialData(initialData);
    setEditingEvent({ ...event, ...fullEventDetails });
    setShowCreateWizard(true);
    // Auto-collapse sidebar when wizard opens
    setSidebarIconized(true);
  };

  const handleWizardClose = () => {
    setShowCreateWizard(false);
    setEditingEvent(null);
    setEditingEventInitialData(null);
    // Restore sidebar when wizard closes
    setSidebarIconized(false);
  };

  const handleDelete = (id: string) => {
    setEventToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      await apiClient.deleteEvent(eventToDelete);
      toast.success('Event moved to recycle bin');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to delete event');
    } finally {
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  // Recycle bin functions
  const fetchDeletedEvents = async () => {
    try {
      setLoadingDeleted(true);
      const events = await apiClient.getDeletedEvents();
      setDeletedEvents(events);
    } catch (error) {
      console.error('Failed to fetch deleted events:', error);
      toast.error('Failed to load recycle bin');
    } finally {
      setLoadingDeleted(false);
    }
  };

  const handleRestore = (id: string) => {
    setEventToRestore(id);
    setRestoreDialogOpen(true);
  };

  const confirmRestore = async () => {
    if (!eventToRestore) return;
    try {
      await apiClient.restoreEvent(eventToRestore);
      toast.success('Event restored successfully');
      fetchDeletedEvents();
      fetchEvents();
    } catch (error) {
      toast.error('Failed to restore event');
    } finally {
      setRestoreDialogOpen(false);
      setEventToRestore(null);
    }
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Event Publisher - Manage Events" description="Create, edit, and manage your events" />
      <Navbar />
      <RoleSwitcher />
      <div className="flex">
        {/* Left Sidebar */}
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          shouldCollapse={showCreateWizard || !!previewEventId}
          onCollapsedChange={setSidebarCollapsed}
        />

        {/* Main Content Area */}
        <div className={`flex-1 w-full transition-all duration-300 relative ${(showCreateWizard || !!previewEventId || sidebarCollapsed) ? 'ml-20' : 'ml-60'}`}>
          <div className="w-full pt-28 pb-16 px-4 md:px-8">
            {/* Section Header */}
            <SectionHeader
              activeSection={activeSection}
              onCreateEvent={handleWizardOpen}
            />

            {/* EventWizard Overlay */}
            <EventWizardOverlay
              isVisible={showCreateWizard}
              onClose={handleWizardClose}
              onSave={handleSaveDraft}
              onPublish={handlePublish}
              onEdit={handleEditEvent}
              onPublishEdit={handlePublishEdit}
              editingEvent={editingEvent}
              initialData={editingEventInitialData}
            />

            {/* Events Display with View Toggle */}
            {activeSection === 'events' && (
              <>
                {/* View Mode Toggle */}
                <div className="flex items-center justify-end gap-2 mb-4">
                  <span className="text-sm text-muted-foreground">View:</span>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground'
                    }`}
                    title="Grid view"
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground'
                    }`}
                    title="List view"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                {/* Test 1 Round Trip Button - Quick Test */}
                <button
                  onClick={handleTestOneRoundTrip}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 text-sm font-medium shadow-md flex items-center gap-2"
                  title="Creates 1 event with ALL new fields and opens it immediately"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Test 1 Round Trip
                </button>

                {/* Seed Dummy Events Button - Test Feature */}
                <button
                  onClick={handleSeedDummyEvents}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 text-sm font-medium shadow-md flex items-center gap-2"
                  title="Creates 45 test events (includes 1 with all new fields)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Test Events (45)
                </button>

                {viewMode === 'grid' ? (
                  <>
                    <OrganizerEventsGrid
                      events={events}
                      onDelete={handleDelete}
                      onEdit={handleWizardEdit}
                      onPreview={handlePreviewEvent}
                      viewMode="grid"
                      isLoading={loading}
                      participantCounts={participantCounts}
                    />
                  </>
                ) : (
                  <EventsList
                    events={events}
                    onDelete={handleDelete}
                    onEdit={handleWizardEdit}
                    onView={handlePreviewEvent}
                  />
                )}
              </>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Move to Recycle Bin</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to move this event to the recycle bin? You can restore it later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setEventToDelete(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                    Move to Bin
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Restore Confirmation Dialog */}
            <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Restore Event</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to restore this event? It will be moved back to your active events.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setEventToRestore(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmRestore} className="bg-green-600 hover:bg-green-700">
                    Restore
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Recycle Bin Section */}
            {activeSection === 'recycle-bin' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">Recycle Bin</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Events are permanently deleted after 30 days
                    </p>
                  </div>
                  <button
                    onClick={fetchDeletedEvents}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
                
                {loadingDeleted ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                ) : deletedEvents.length === 0 ? (
                  <div className="text-center py-12 bg-muted rounded-lg">
                    <Trash2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No events in recycle bin</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {deletedEvents.map((event) => {
                      const daysRemaining = getDaysRemaining(event.deleted_at);
                      return (
                        <div
                          key={event.id}
                          className="relative flex flex-col gap-2 p-4 bg-background border border-border rounded-lg"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm mb-1">{event.title}</h3>
                              <p className="text-xs text-muted-foreground">
                                Deleted {event.deleted_at ? new Date(event.deleted_at).toLocaleDateString() : 'unknown'}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`text-xs font-medium px-2 py-1 rounded ${
                                daysRemaining <= 5 
                                  ? 'bg-red-100 text-red-700' 
                                  : daysRemaining <= 10 
                                    ? 'bg-yellow-100 text-yellow-700' 
                                    : 'bg-muted text-muted-foreground'
                              }`}>
                                {daysRemaining} days left
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-end gap-2 mt-2">
                            <button
                              onClick={() => handlePreviewEvent(event)}
                              className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
                            >
                              Preview
                            </button>
                            <button
                              onClick={() => handleRestore(event.id)}
                              className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                            >
                              Restore
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Event Preview Overlay */}
            {previewEventId && (
              <>
                <EventDetailOverlay
                  eventId={previewEventId}
                  isOpen={!!previewEventId}
                  onClose={() => {
                    setPreviewEventId(null);
                    setPreviewEvent(null);
                  }}
                  isDeleted={activeSection === 'recycle-bin'}
                  eventData={previewEvent}
                  participantData={(() => {
                    const counts = participantCounts.get(previewEventId);
                    return counts ? {
                      is_registered: false,
                      counts: counts
                    } : null;
                  })()}
                />
              </>
            )}

            {/* Placeholder for other sections */}
            {activeSection !== 'events' && activeSection !== 'recycle-bin' && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">This section is under development.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
