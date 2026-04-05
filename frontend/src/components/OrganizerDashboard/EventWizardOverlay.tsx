import { Plus } from 'lucide-react';
import { EventWizard, type EventFormData } from '@/components/CreateEvent/EventWizard';

interface EventWizardOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (data: EventFormData) => Promise<void>;
  onPublish: (data: EventFormData) => Promise<void>;
}

export const EventWizardOverlay = ({ isVisible, onClose, onSave, onPublish }: EventWizardOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className="mb-8 border-b-4 border-white pb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Create Event</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-lg"
        >
          <Plus className="w-4 h-4 rotate-45" />
        </button>
      </div>
      <div className="w-full">
        <EventWizard
          onSave={onSave}
          onPublish={onPublish}
        />
      </div>
    </div>
  );
};
