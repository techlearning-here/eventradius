import { Users, Shield, Clock, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { type EventFormData } from './EventWizard';

interface EventAdvancedInfoProps {
  formData: EventFormData;
}

export const EventAdvancedInfo = ({ formData }: EventAdvancedInfoProps) => {
  const getPrivacyLabel = (privacy: string) => {
    const labels = {
      'public': 'Public',
      'private': 'Private',
      'unlisted': 'Unlisted',
    };
    return labels[privacy as keyof typeof labels] || privacy;
  };

  return (
    <div className="space-y-4">
      {/* Registration Settings */}
      <div>
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Registration Settings
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Privacy:</span>
            <Badge variant="outline">{getPrivacyLabel(formData.event_privacy)}</Badge>
          </div>
          {formData.registration_start_time && (
            <div className="flex justify-between">
              <span>Registration Opens:</span>
              <span>{formData.registration_start_time.toLocaleDateString()}</span>
            </div>
          )}
          {formData.registration_end_time && (
            <div className="flex justify-between">
              <span>Registration Closes:</span>
              <span>{formData.registration_end_time.toLocaleDateString()}</span>
            </div>
          )}
          {formData.age_restriction && (
            <div className="flex justify-between">
              <span>Age Restriction:</span>
              <span>{formData.age_restriction}</span>
            </div>
          )}
        </div>
      </div>

      {/* Ticketing */}
      {formData.ticket_types && formData.ticket_types.length > 0 && (
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Ticketing
          </h4>
          <div className="space-y-2">
            {formData.ticket_types.map((ticket, index) => (
              <div key={index} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                <span>{ticket.name}</span>
                <span className="font-medium">${ticket.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Policies */}
      <div>
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Policies
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Refund Policy:</span>
            <span className="capitalize">{formData.refund_policy.replace('_', ' ')}</span>
          </div>
          {formData.event_contact_email && (
            <div className="flex justify-between">
              <span>Contact Email:</span>
              <span>{formData.event_contact_email}</span>
            </div>
          )}
          {formData.event_website && (
            <div className="flex justify-between">
              <span>Event Website:</span>
              <a href={formData.event_website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Visit Website
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
