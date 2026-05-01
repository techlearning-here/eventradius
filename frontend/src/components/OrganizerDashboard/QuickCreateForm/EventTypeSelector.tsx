import { MapPin, Video } from 'lucide-react';
import { Label } from '@/components/ui/label';
import type { QuickCreateData } from './types';

interface EventTypeSelectorProps {
  value: QuickCreateData['event_type'];
  onChange: (type: QuickCreateData['event_type']) => void;
}

export const EventTypeSelector = ({ value, onChange }: EventTypeSelectorProps) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">Event Type</Label>
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange('in_person')}
        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
          value === 'in_person'
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
            : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
        }`}
      >
        <MapPin className="w-4 h-4" />
        <span className="font-medium">In-Person</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('online')}
        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
          value === 'online'
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
        }`}
      >
        <Video className="w-4 h-4" />
        <span className="font-medium">Online</span>
      </button>
    </div>
  </div>
);
