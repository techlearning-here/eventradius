import { BasicInfo } from './BasicInfo';
import { EventTypeSection } from './EventTypeSection';
import { ImageUpload } from './ImageUpload';
import { BackgroundImageUpload } from './BackgroundImageUpload';
import { ContactInfo } from './ContactInfo';
import { ReviewSection } from './ReviewSection';
import { CoverImageSelector } from './CoverImageSelector';
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
            description={formData.description}
            isPaidEvent={formData.is_paid_event}
            ticketingUrl={formData.ticketing_website}
            ticketPricingDescription={formData.ticket_pricing_description}
            language={formData.language || ''}
            eventStatus={formData.event_status}
            onEventNameChange={(title) => updateFormData({ title })}
            onDescriptionChange={(description) => updateFormData({ description })}
            onIsPaidEventChange={(is_paid_event) => updateFormData({ is_paid_event })}
            onTicketingUrlChange={(ticketing_website) => updateFormData({ ticketing_website })}
            onTicketPricingDescriptionChange={(ticket_pricing_description) => updateFormData({ ticket_pricing_description })}
            onLanguageChange={(language) => updateFormData({ language })}
            onEventStatusChange={(event_status) => updateFormData({ event_status })}
          />
          {/* Event Image Section */}
          <div className="mt-12 pt-8 border-t-2 border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                5
              </div>
              <h3 className="text-lg font-semibold">Event Image</h3>
              <span className="text-gray-500 text-sm font-normal">(Optional)</span>
            </div>
            <p className="text-gray-600 mb-6 ml-10">
              Choose a cover image that represents your event. Select from our gallery or upload your own.
            </p>
            <div className="ml-0 md:ml-10">
              <CoverImageSelector
                selectedImageUrl={formData.image_url || null}
                onImageSelect={(url) => updateFormData({ image_url: url, image_file: null })}
                onImageUpload={(file) => updateFormData({ image_file: file, image_url: null })}
                eventCategory={formData.category || 'general'}
                eventType={formData.event_type}
              />
            </div>
          </div>
          <div className="flex justify-center">
            <BackgroundImageUpload
              imagePreview={formData.background_image_url}
              onImageUpload={(file) => updateFormData({ background_image_file: file })}
            />
          </div>
        </div>
      );

    case 'contact':
      return (
        <ContactInfo
          contactPhone={formData.organizer_phone || ''}
          contactEmail={formData.organizer_email || ''}
          contactWebsite={formData.organizer_website || ''}
          onContactPhoneChange={(organizer_phone) => updateFormData({ organizer_phone })}
          onContactEmailChange={(organizer_email) => updateFormData({ organizer_email })}
          onContactWebsiteChange={(organizer_website) => updateFormData({ organizer_website })}
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
