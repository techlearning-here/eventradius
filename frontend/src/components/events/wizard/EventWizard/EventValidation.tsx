import { AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventFormData } from './EventWizard';

interface EventValidationProps {
  formData: EventFormData;
  onEdit: (stepId: string) => void;
}

export const EventValidation = ({ formData, onEdit }: EventValidationProps) => {
  const validationChecks = [
    {
      id: 'info',
      label: 'Basic Information',
      isValid: formData.title?.trim() !== '' && formData.description?.trim() !== '',
      editStep: 'info'
    },
    {
      id: 'type',
      label: 'Event Type & Format',
      isValid: formData.event_type && formData.event_format,
      editStep: 'type'
    },
    {
      id: 'datetime',
      label: 'Date & Location',
      isValid: formData.start_time && formData.end_time &&
              (formData.event_type === 'online' ? formData.virtual_event_url?.trim() !== '' : formData.location?.trim() !== ''),
      editStep: 'datetime'
    }
  ];

  const allValid = validationChecks.every(check => check.isValid);

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Event Validation</h4>
      
      <div className="space-y-2">
        {validationChecks.map((check) => (
          <div key={check.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {check.isValid ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              <span className={check.isValid ? 'text-green-700' : 'text-red-700'}>
                {check.label}
              </span>
            </div>
            {!check.isValid && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(check.editStep)}
              >
                Edit
              </Button>
            )}
          </div>
        ))}
      </div>

      {allValid ? (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">Your event is ready to publish!</span>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-700">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Please complete the required fields above</span>
          </div>
        </div>
      )}
    </div>
  );
};
