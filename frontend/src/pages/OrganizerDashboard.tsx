import { useState, useEffect } from 'react';
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
import { type Event } from '@/integrations/backend/api';

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

  const handlePreviewEvent = (event: Event) => {
    setPreviewEventId(event.id);
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getEvents();
      // API returns Event[] directly - use as-is
      setEvents(response || []);
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
        virtual_event_url: data.virtual_event_url,
        virtual_event_platform: data.virtual_event_platform,
        event_password: data.event_password,
        age_restriction: data.age_restriction,
        accessibility_options: data.accessibility_options,
        event_website: data.event_website,
        event_contact_email: data.event_contact_email,
        ticketing_website: data.ticketing_website,
        refund_policy: data.refund_policy,
        custom_refund_policy: data.custom_refund_policy,
        ticket_pricing_description: data.ticket_pricing_description,
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
        virtual_event_url: data.virtual_event_url,
        virtual_event_platform: data.virtual_event_platform,
        event_password: data.event_password,
        age_restriction: data.age_restriction,
        accessibility_options: data.accessibility_options,
        event_website: data.event_website,
        event_contact_email: data.event_contact_email,
        ticketing_website: data.ticketing_website,
        refund_policy: data.refund_policy,
        custom_refund_policy: data.custom_refund_policy,
        ticket_pricing_description: data.ticket_pricing_description,
      };

      const result = await createEvent(eventData);
      if (!result) {
        throw new Error('Failed to publish event');
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
      // Set default values for other fields
      language: 'en',
      event_type: 'in_person',
      event_format: 'single',
      event_privacy: 'public',
      is_paid_event: false,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      venue_address: fullEventDetails.location || '',
      venue_city: '',
      venue_state: '',
      venue_zip_code: '',
      venue_country: '',
      subtitle: '',
      summary: '',
      doors_open_time: null,
      registration_start_time: null,
      registration_end_time: null,
      virtual_event_url: '',
      virtual_event_platform: '',
      event_password: '',
      age_restriction: '',
      accessibility_options: '',
      event_website: '',
      event_contact_email: '',
      ticketing_website: '',
      refund_policy: 'no_refunds',
      custom_refund_policy: '',
      ticket_pricing_description: '',
      tags: [],
      image_file: null,
      status: 'draft',
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

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try {
      await apiClient.deleteEvent(id);
      toast.success('Event deleted');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to delete event');
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
          sidebarIconized={sidebarIconized}
          onToggleSidebar={() => setSidebarIconized(!sidebarIconized)}
        />

        {/* Main Content Area */}
        <div className="flex-1 w-full">
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
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
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
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>

                {/* Events Grid or List */}
                {viewMode === 'grid' ? (
                  <OrganizerEventsGrid
                    events={events}
                    onDelete={handleDelete}
                    onEdit={handleWizardEdit}
                    onPreview={handlePreviewEvent}
                    viewMode="grid"
                    isLoading={loading}
                  />
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

            {/* Placeholder for other sections */}
            {activeSection !== 'events' && (
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
