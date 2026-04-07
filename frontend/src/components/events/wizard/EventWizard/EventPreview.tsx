import { X } from 'lucide-react';
import { EventDetailsDisplay } from '../../details/EventDetailsDisplay';
import { type EventFormData } from './EventWizard';

interface EventPreviewProps {
  formData: EventFormData;
  onClose: () => void;
  onEdit?: (stepId: string) => void;
}

// Transform EventFormData to Event interface format
const transformFormData = (formData: EventFormData) => {
  return {
    id: 'preview',
    title: formData.title,
    description: formData.description,
    location: formData.location || formData.venue_address,
    start_time: formData.start_time,
    end_time: formData.end_time,
    image_url: formData.image_url,
    category: formData.category,
    max_participants: formData.max_participants,
    is_public: formData.is_public,
    organizer_id: 'preview',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_paid_event: formData.is_paid_event,
    ticket_pricing_description: formData.ticket_pricing_description,
    ticketing_website: formData.ticketing_website,
    timezone: formData.timezone,
    organizer_email: formData.organizer_email,
    organizer_phone: formData.organizer_phone,
    organizer_website: formData.organizer_website,
    creator: 'Preview Event',
    date: formData.single_event_date,
    time: formData.single_event_start_time,
    address: formData.location || formData.venue_address,
    background_image_url: formData.background_image_url,
    target_date: formData.single_event_date,
    event_type: formData.event_type,
    event_status: formData.event_status,
    created_by: 'preview'
  };
};

export const EventPreview = ({ formData, onClose, onEdit }: EventPreviewProps) => {
  const transformedEvent = transformFormData(formData);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Event Preview</h2>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit('info')}
                className="text-sm px-3 py-1 border border-border rounded-md hover:bg-muted transition-colors"
              >
                Edit Event
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <EventDetailsDisplay 
            event={transformedEvent}
            showRegistration={false}
            showChat={false}
            showCountdown={true}
            containerClassName="h-auto"
          />
        </div>
      </div>
    </div>
  );
};
