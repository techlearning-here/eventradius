import { Plus } from 'lucide-react';
import { EventWizard, type EventFormData } from '@/components/EventWizard/EventWizard';

interface EventWizardOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (data: EventFormData) => Promise<void>;
  onPublish: (data: EventFormData) => Promise<void>;
}

export const EventWizardOverlay = ({ isVisible, onClose, onSave, onPublish }: EventWizardOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className="mb-8 border-b-4 border-white pb-8 bg-sky-50 rounded-lg">
      <div className="flex justify-between items-center mb-6 bg-blue-500 px-4 py-3 rounded">
        <h2 className="text-2xl font-bold text-white">Create Event</h2>
        <button
          onClick={onClose}
          className="p-2 bg-white hover:bg-gray-100 rounded-lg"
        >
          <Plus className="w-4 h-4 rotate-45 text-black" />
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
