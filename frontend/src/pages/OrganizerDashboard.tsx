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
import { EventDetailOverlay } from '@/components/EventDetailPage';
import { EventDetailInline } from '@/components/EventDetailInline';
import { type Event } from '@/integrations/backend/api';
import { Trash2 } from 'lucide-react';
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

  const handlePreviewEvent = (event: Event) => {
    setPreviewEventId(event.id);
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
      // Language
      language: fullEventDetails.language || 'en',
      // Type & Format fields
      event_type: fullEventDetails.event_type || 'in_person',
      event_format: fullEventDetails.event_format || 'single',
      event_privacy: fullEventDetails.event_privacy || 'public',
      is_paid_event: fullEventDetails.is_paid_event || false,
      timezone: fullEventDetails.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      venue_address: fullEventDetails.venue_address || fullEventDetails.location || '',
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
      traditional_attire: fullEventDetails.traditional_attire || 'not_applicable',
      skill_level: fullEventDetails.skill_level || 'all_levels',
      prior_experience: fullEventDetails.prior_experience || 'none_required',
      physical_fitness: fullEventDetails.physical_fitness || 'sedentary',
      equipment_required: fullEventDetails.equipment_required || [],
      dress_code: fullEventDetails.dress_code || 'casual',
      prerequisites_notes: fullEventDetails.prerequisites_notes || '',
      content_rating: fullEventDetails.content_rating || 'all_ages',
      alcohol_served: fullEventDetails.alcohol_served || 'no_alcohol',
      smoking_policy: fullEventDetails.smoking_policy || 'non_smoking',
      noise_level: fullEventDetails.noise_level || 'moderate',
      physical_intensity: fullEventDetails.physical_intensity || 'none',
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
              <EventDetailOverlay
                eventId={previewEventId}
                isOpen={!!previewEventId}
                onClose={() => setPreviewEventId(null)}
                isDeleted={activeSection === 'recycle-bin'}
              />
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
