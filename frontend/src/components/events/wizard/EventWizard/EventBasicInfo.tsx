import { Calendar, Clock, MapPin, Globe, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { type EventFormData } from './EventWizard';

interface EventBasicInfoProps {
  formData: EventFormData;
}

export const EventBasicInfo = ({ formData }: EventBasicInfoProps) => {
  const getEventTypeLabel = (type: string) => {
    const labels = {
      'online': 'Online Event',
      'in_person': 'In-Person Event',
      'hybrid': 'Hybrid Event',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not set';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'Not set';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
          1
        </div>
        <h3 className="text-lg font-semibold">Event Details</h3>
      </div>
      
      <div>
        <h4 className="text-xl font-bold mb-2">{formData.title}</h4>
        {formData.subtitle && (
          <p className="text-gray-600 mb-2">{formData.subtitle}</p>
        )}
        <p className="text-gray-700">{formData.description}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{getEventTypeLabel(formData.event_type)}</Badge>
        <Badge variant="outline">{formData.event_format}</Badge>
        <Badge variant="outline">{formData.language || 'en'}</Badge>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
          2
        </div>
        <h3 className="text-lg font-semibold">Schedule & Location</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{formatDate(formData.start_time)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm">
            {formatTime(formData.start_time)} - {formatTime(formData.end_time)}
          </span>
        </div>
        {formData.event_type === 'in_person' ? (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{formData.location || 'Not specified'}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{formData.virtual_event_url || 'Not specified'}</span>
          </div>
        )}
        {formData.timezone && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{formData.timezone}</span>
          </div>
        )}
      </div>
    </div>
  );
};
