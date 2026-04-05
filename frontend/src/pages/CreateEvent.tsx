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
      // Convert wizard data to API format
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
        // Add new fields
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
      
      console.log('Draft saved successfully');
    } catch (error) {
      console.error('Failed to save draft:', error);
      throw error;
    }
  };

  const handlePublish = async (data: EventFormData) => {
    try {
      // Convert wizard data to API format
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
        // Add new fields
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
