import { Plus } from 'lucide-react';
import { EventWizard, type EventFormData } from '@/components/EventWizard/EventWizard';

interface OrgEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  city?: string;
  category: string;
  status: 'preview' | 'cancelled' | 'approved' | 'pending' | 'rejected' | 'deactivated';
  admin_remark?: string;
}

interface EventWizardOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (data: EventFormData) => Promise<void>;
  onPublish: (data: EventFormData) => Promise<void>;
  onEdit?: (data: EventFormData) => Promise<void>;
  onPublishEdit?: (data: EventFormData) => Promise<void>;
  editingEvent?: OrgEvent | null;
  initialData?: Partial<EventFormData> | null;
}

export const EventWizardOverlay = ({ 
  isVisible, 
  onClose, 
  onSave, 
  onPublish,
  onEdit,
  onPublishEdit,
  editingEvent,
  initialData 
}: EventWizardOverlayProps) => {
  if (!isVisible) return null;

  const isEditMode = !!editingEvent;

  return (
    <div className="mb-8 border-b-4 border-white pb-8 bg-sky-50 rounded-lg">
      <div className="flex justify-between items-center mb-6 bg-blue-500 px-4 py-3 rounded">
        <h2 className="text-2xl font-bold text-white">
          {isEditMode ? 'Edit Event' : 'Create Event'}
        </h2>
        <button
          onClick={onClose}
          className="p-2 bg-white hover:bg-gray-100 rounded-lg"
        >
          <Plus className="w-4 h-4 rotate-45 text-black" />
        </button>
      </div>
      <div className="w-full">
        <EventWizard
          initialData={isEditMode ? initialData : undefined}
          onSave={isEditMode ? onEdit : onSave}
          onPublish={isEditMode ? onPublishEdit : onPublish}
        />
      </div>
    </div>
  );
};
