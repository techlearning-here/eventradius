import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EventFormData {
  title?: string;
  description?: string;
  event_type?: string;
  event_format?: string;
  location?: string;
  virtual_event_url?: string;
  venue_address?: string;
  // Add other fields as needed
}

interface EventPreviewProps {
  formData: EventFormData;
  onClose: () => void;
}

export const EventPreview = ({ formData, onClose }: EventPreviewProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Event Preview</h3>
            <Button
              variant="outline"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
