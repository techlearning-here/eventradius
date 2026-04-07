import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { type EventFormData } from './EventWizard';
import { EventBasicInfo } from './EventBasicInfo';
import { EventAdvancedInfo } from './EventAdvancedInfo';
import { EventValidation } from './EventValidation';

interface ReviewSectionProps {
  formData: EventFormData;
  onEdit: (stepId: string) => void;
  onPublish: () => void;
  isPublishing: boolean;
}

export const ReviewSection = ({ formData, onEdit, onPublish, isPublishing }: ReviewSectionProps) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const isValidForPublish = () => {
    return formData.title?.trim() !== '' && 
           formData.description?.trim() !== '' &&
           formData.start_time && 
           formData.end_time &&
           (formData.event_type === 'online' ? formData.virtual_event_url?.trim() !== '' : formData.location?.trim() !== '');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Event Preview</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h4 className="font-medium mb-4">Basic Information</h4>
              <EventBasicInfo formData={formData} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h4 className="font-medium mb-4">Advanced Settings</h4>
              <EventAdvancedInfo formData={formData} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <EventValidation formData={formData} onEdit={onEdit} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the EventRadius Terms of Service and understand that I'm responsible for this event.
              </label>
            </div>

            <Button
              onClick={onPublish}
              disabled={!isValidForPublish() || !agreedToTerms || isPublishing}
              className="w-full"
              size="lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isPublishing ? 'Publishing...' : 'Publish Event'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
