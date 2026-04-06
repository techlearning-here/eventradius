import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { EventWizard, type EventFormData } from '@/components/CreateEvent/EventWizard';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { useEventActions, type EventCreate } from '@/hooks/useEvents';

const CreateEvent = () => {
  const { user } = useAuthWithBackend();
  const { createEvent } = useEventActions();

  const handleSaveDraft = async (data: EventFormData) => {
    try {
      // Convert wizard data to API format (simplified for basic wizard)
      const eventData: EventCreate = {
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
        status: 'draft',
        // Basic fields only
        subtitle: data.subtitle,
        summary: data.summary,
        language: data.language,
        event_type: data.event_type,
        event_format: data.event_format,
        event_privacy: data.event_privacy,
        timezone: data.timezone,
        virtual_event_url: data.virtual_event_url,
        virtual_event_platform: data.virtual_event_platform,
        event_contact_email: data.event_contact_email,
        event_contact_phone: data.event_contact_phone,
        ticketing_website: data.ticketing_website,
        venue_address: data.venue_address,
        // Structured venue fields
        venue_street: data.venue_street,
        venue_city: data.venue_city,
        venue_state: data.venue_state,
        venue_zip_code: data.venue_zip_code,
        venue_country: data.venue_country,
        venue_building_name: data.venue_building_name,
      };

      const result = await createEvent(eventData);
      if (!result) {
        throw new Error('Failed to save draft');
      }
      
      console.log('Draft saved successfully');
    } catch (error) {
      console.error('Failed to save draft:', error);
      throw error;
    }
  };

  const handlePublish = async (data: EventFormData) => {
    try {
      // Convert wizard data to API format (simplified for basic wizard)
      const eventData: EventCreate = {
        title: data.title,
        description: data.description,
        location: data.location,
        start_time: data.start_time ? data.start_time.toISOString() : undefined,
        end_time: data.end_time ? data.end_time.toISOString() : undefined,
        category: data.category,
        max_participants: data.max_participants,
        is_public: data.is_public,
        image_url: data.image_url,
        status: 'published',
        // Basic fields only
        subtitle: data.subtitle,
        summary: data.summary,
        language: data.language,
        event_type: data.event_type,
        event_format: data.event_format,
        event_privacy: data.event_privacy,
        timezone: data.timezone,
        virtual_event_url: data.virtual_event_url,
        virtual_event_platform: data.virtual_event_platform,
        event_contact_email: data.event_contact_email,
        event_contact_phone: data.event_contact_phone,
        ticketing_website: data.ticketing_website,
        venue_address: data.venue_address,
        // Structured venue fields
        venue_street: data.venue_street,
        venue_city: data.venue_city,
        venue_state: data.venue_state,
        venue_zip_code: data.venue_zip_code,
        venue_country: data.venue_country,
        venue_building_name: data.venue_building_name,
      };

      const result = await createEvent(eventData);
      if (!result) {
        throw new Error('Failed to publish event');
      }
      
      alert('Event created and published successfully!');
      window.location.href = '/my-events';
    } catch (error) {
      console.error('Failed to publish event:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <SEOHead 
        title="Create Event - EventRadius"
        description="Create your next event with EventRadius"
      />
      <EventWizard 
        onSave={handleSaveDraft}
        onPublish={handlePublish}
      />
    </div>
  );
};

export default CreateEvent;
