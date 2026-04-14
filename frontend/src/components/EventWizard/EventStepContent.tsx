import { BasicInfo } from './BasicInfo';
import { EventTypeSection } from './EventTypeSection';
import { ImageUpload } from './ImageUpload';
import { ContactInfo } from './ContactInfo';
import { ReviewSection } from './ReviewSection';
import { EventFormData } from './EventWizard';

import { WIZARD_SECTIONS } from './wizardConfig';

interface EventStepContentProps {
  currentSubStepId: string;
  formData: EventFormData;
  updateFormData: (updates: Partial<EventFormData>) => void;
  goToSubStep: (sectionIndex: number, subStepIndex: number) => void;
}

export const EventStepContent = ({ currentSubStepId, formData, updateFormData, goToSubStep }: EventStepContentProps) => {
  switch (currentSubStepId) {
    case 'info':
      return (
        <div className="space-y-8">
          <BasicInfo
            eventName={formData.title}
            subtitle={formData.subtitle || ''}
            summary={formData.summary || ''}
            description={formData.description}
            isPaidEvent={formData.is_paid_event}
            ticketingUrl={formData.ticketing_website}
            language={formData.language || ''}
            category={formData.category || ''}
            tags={formData.tags || []}
            onEventNameChange={(title) => updateFormData({ title })}
            onSubtitleChange={(subtitle) => updateFormData({ subtitle })}
            onSummaryChange={(summary) => updateFormData({ summary })}
            onDescriptionChange={(description) => updateFormData({ description })}
            onIsPaidEventChange={(is_paid_event) => updateFormData({ is_paid_event })}
            onTicketingUrlChange={(ticketing_website) => updateFormData({ ticketing_website })}
            onLanguageChange={(language) => updateFormData({ language })}
            onCategoryChange={(category) => updateFormData({ category })}
            onTagsChange={(tags) => updateFormData({ tags })}
          />
          <div className="flex justify-center">
            <ImageUpload
              imagePreview={formData.image_url}
              onImageUpload={(file) => updateFormData({ image_file: file })}
            />
          </div>
        </div>
      );

    case 'contact':
      return (
        <ContactInfo
          contactPhone={formData.event_contact_phone || ''}
          contactEmail={formData.event_contact_email || ''}
          onContactPhoneChange={(phone) => updateFormData({ event_contact_phone: phone })}
          onContactEmailChange={(email) => updateFormData({ event_contact_email: email })}
        />
      );

    case 'type':
      return (
        <EventTypeSection
          eventType={formData.event_type}
          eventFormat={formData.event_format}
          venueAddress={formData.venue_address}
          virtualEventUrl={formData.virtual_event_url}
          virtualEventPlatform={formData.virtual_event_platform}
          virtualEventDetails={formData.virtual_event_details}
          startTime={formData.start_time}
          endTime={formData.end_time}
          timezone={formData.timezone}
          singleEventDate={formData.single_event_date}
          singleEventStartTime={formData.single_event_start_time}
          singleEventEndTime={formData.single_event_end_time}
          recurringEventDay={formData.recurring_event_day}
          recurringEventStartTime={formData.recurring_event_start_time}
          recurringEventEndTime={formData.recurring_event_end_time}
          recurringFrequency={formData.recurring_frequency}
          recurringEndDate={formData.recurring_end_date}
          recurringHasEndDate={formData.recurring_has_end_date}
          recurringDailyType={formData.recurring_daily_type}
          recurringExcludedDays={formData.recurring_excluded_days}
          multiDateEvents={formData.multi_date_events}
          onEventTypeChange={(event_type) => updateFormData({ event_type })}
          onEventFormatChange={(event_format) => updateFormData({ event_format })}
          onVenueAddressChange={(venue_address) => updateFormData({ venue_address })}
          timezone={formData.timezone || ''}
          onTimezoneChange={(timezone) => updateFormData({ timezone })}
          onVirtualEventUrlChange={(virtual_event_url) => updateFormData({ virtual_event_url })}
          onVirtualEventPlatformChange={(virtual_event_platform) => updateFormData({ virtual_event_platform })}
          onVirtualEventDetailsChange={(virtual_event_details) => updateFormData({ virtual_event_details })}
          onStartTimeChange={(start_time) => updateFormData({ start_time })}
          onEndTimeChange={(end_time) => updateFormData({ end_time })}
          onSingleEventDateChange={(single_event_date) => updateFormData({ single_event_date })}
          onSingleEventStartTimeChange={(single_event_start_time) => updateFormData({ single_event_start_time })}
          onSingleEventEndTimeChange={(single_event_end_time) => updateFormData({ single_event_end_time })}
          onRecurringEventDayChange={(recurring_event_day) => updateFormData({ recurring_event_day })}
          onRecurringEventStartTimeChange={(recurring_event_start_time) => updateFormData({ recurring_event_start_time })}
          onRecurringEventEndTimeChange={(recurring_event_end_time) => updateFormData({ recurring_event_end_time })}
          onRecurringFrequencyChange={(recurring_frequency) => updateFormData({ recurring_frequency })}
          onRecurringEndDateChange={(recurring_end_date) => updateFormData({ recurring_end_date })}
          onRecurringHasEndDateChange={(recurring_has_end_date) => updateFormData({ recurring_has_end_date })}
          onRecurringDailyTypeChange={(recurring_daily_type) => updateFormData({ recurring_daily_type })}
          onRecurringExcludedDaysChange={(recurring_excluded_days) => updateFormData({ recurring_excluded_days })}
          onMultiDateEventsChange={(multi_date_events) => updateFormData({ multi_date_events })}
          // Timing & Registration fields - convert Date to ISO string for inputs
          doorsOpenTime={formData.doors_open_time ? new Date(formData.doors_open_time).toISOString().slice(0, 16) : ''}
          registrationStartTime={formData.registration_start_time ? new Date(formData.registration_start_time).toISOString().slice(0, 16) : ''}
          registrationEndTime={formData.registration_end_time ? new Date(formData.registration_end_time).toISOString().slice(0, 16) : ''}
          onDoorsOpenTimeChange={(doors_open_time) => updateFormData({ doors_open_time: doors_open_time ? new Date(doors_open_time) : null })}
          onRegistrationStartTimeChange={(registration_start_time) => updateFormData({ registration_start_time: registration_start_time ? new Date(registration_start_time) : null })}
          onRegistrationEndTimeChange={(registration_end_time) => updateFormData({ registration_end_time: registration_end_time ? new Date(registration_end_time) : null })}
        />
      );

    case 'review':
      return (
        <ReviewSection
          formData={formData}
          onEdit={(stepId) => {
            // Find the section and sub-step for the given stepId
            WIZARD_SECTIONS.forEach((section, sectionIndex) => {
              const subStepIndex = section.subSteps.findIndex(subStep => subStep.id === stepId);
              if (subStepIndex !== -1) {
                goToSubStep(sectionIndex, subStepIndex);
              }
            });
          }}
        />
      );

    default:
      return <div>Step not found</div>;
  }
};
