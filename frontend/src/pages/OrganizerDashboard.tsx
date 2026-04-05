import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/integrations/backend/api';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { Navbar } from '@/components/Navbar';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { SEOHead } from '@/components/SEOHead';
import { toast } from 'sonner';
import { EventWizard, type EventFormData } from '@/components/CreateEvent/EventWizard';
import { useEventActions } from '@/hooks/useEvents';
import { Sidebar } from '@/components/OrganizerDashboard/Sidebar';
import { SectionHeader } from '@/components/OrganizerDashboard/SectionHeader';
import { EventsList } from '@/components/OrganizerDashboard/EventsList';
import { EventWizardOverlay } from '@/components/OrganizerDashboard/EventWizardOverlay';

interface OrgEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  city?: string;
  category: string;
  status: 'preview' | 'cancelled' | 'approved' | 'pending' | 'rejected' | 'deactivated';
  admin_remark?: string;
}

const OrganizerDashboard = () => {
  const { user, role, loading: authLoading } = useAuthWithBackend();
  const navigate = useNavigate();
  const { createEvent } = useEventActions();
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [activeSection, setActiveSection] = useState('events');
  const [sidebarIconized, setSidebarIconized] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getEvents();
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
      setShowCreateWizard(false);
      // Restore sidebar state when wizard closes
      setSidebarIconized(false);
      fetchEvents();
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error('Failed to save draft');
      throw error;
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
    // Auto-collapse sidebar when wizard opens
    setSidebarIconized(true);
  };

  const handleWizardClose = () => {
    setShowCreateWizard(false);
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

  const handleConvertToStandard = async (event: OrgEvent) => {
    if (!confirm('Confirm & convert this Preview Event to a Standard Event? All participants and messages will be kept.')) return;
    try {
      await apiClient.updateEvent(event.id, {
        status: 'approved'
      });
      toast.success('Event converted to standard');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to convert event');
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
            />

            {/* Events List */}
            {activeSection === 'events' && (
              <EventsList
                events={events}
                onDelete={handleDelete}
                onConvertToStandard={handleConvertToStandard}
              />
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
