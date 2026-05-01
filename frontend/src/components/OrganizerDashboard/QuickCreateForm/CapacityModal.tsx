import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CapacityTempState } from './types';

interface CapacityModalProps {
  isOpen: boolean;
  tempState: CapacityTempState;
  onToggleLimit: () => void;
  onMaxParticipantsChange: (value: number) => void;
  onToggleWaitlist: () => void;
  onConfirm: () => void;
}

export const CapacityModal = ({
  isOpen,
  tempState,
  onToggleLimit,
  onMaxParticipantsChange,
  onToggleWaitlist,
  onConfirm,
}: CapacityModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
            <Upload className="w-6 h-6 text-gray-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Max Capacity</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Close registration when reaching the capacity. Only approved guests count towards it.
            </p>
          </div>
        </div>

        {/* Limit Event Capacity Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Limit Event Capacity</span>
          <button
            type="button"
            onClick={onToggleLimit}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              tempState.enableLimit ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                tempState.enableLimit ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Max Capacity Input */}
        {tempState.enableLimit && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Capacity</Label>
            <Input
              type="number"
              min={1}
              value={tempState.maxParticipants}
              onChange={(e) => onMaxParticipantsChange(parseInt(e.target.value) || 1)}
              className="w-full"
            />
          </div>
        )}

        {/* Waitlist Toggle */}
        {tempState.enableLimit && (
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Over-Capacity Waitlist</span>
            <button
              type="button"
              onClick={onToggleWaitlist}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                tempState.enableWaitlist ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  tempState.enableWaitlist ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}

        {/* Confirm Button */}
        <Button
          onClick={onConfirm}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-xl"
        >
          Confirm
        </Button>
      </div>
    </div>
  );
};
