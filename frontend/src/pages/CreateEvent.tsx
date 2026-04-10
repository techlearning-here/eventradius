import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { EventWizard, type EventFormData } from '@/components/EventWizard/EventWizard';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { useEventActions, type EventCreate } from '@/hooks/useEvents';

const CreateEvent = () => {
  const { user } = useAuthWithBackend();
  const { createEvent } = useEventActions();

  const handleSaveDraft = async (data: EventFormData) => {
    try {
      // Convert wizard data to API format with all attributes
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
        // Basic fields
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
        group_discounts: data.group_discounts,
        // Additional fields
        is_paid_event: data.is_paid_event,
        ticket_pricing_description: data.ticket_pricing_description,
        sub_category: data.sub_category,
        format: data.format,
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
      // Convert wizard data to API format with all attributes
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
        // Basic fields
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
        group_discounts: data.group_discounts,
        // Additional fields
        is_paid_event: data.is_paid_event,
        ticket_pricing_description: data.ticket_pricing_description,
        sub_category: data.sub_category,
        format: data.format,
      };

      console.log('=== CREATE EVENT DEBUG ===');
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
      console.log('===========================');

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
