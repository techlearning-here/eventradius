import { Ticket, UserCheck, Users, Pencil, ExternalLink } from 'lucide-react';
import { Label } from '@/components/ui/label';
import type { QuickCreateData } from './types';

interface EventOptionsProps {
  formData: QuickCreateData;
  onEditPrice: () => void;
  onEditUrl: () => void;
  onToggleApproval: () => void;
  onEditCapacity: () => void;
}

export const EventOptions = ({
  formData,
  onEditPrice,
  onEditUrl,
  onToggleApproval,
  onEditCapacity,
}: EventOptionsProps) => (
  <div className="space-y-3">
    <Label className="text-sm font-medium">Event Options</Label>
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
      {/* Ticket Price */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Ticket className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ticket Price</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formData.ticket_price > 0 ? `$${formData.ticket_price}` : 'Free'}
          </span>
          <button
            type="button"
            onClick={onEditPrice}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <Pencil className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* External Ticket URL - Only for paid events */}
      {formData.ticket_price > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ExternalLink className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ticket Link</span>
          </div>
          <div className="flex items-center gap-2 flex-1 justify-end">
            {formData.ticketing_website ? (
              <a
                href={formData.ticketing_website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 truncate max-w-[150px] hover:underline"
                title={formData.ticketing_website}
              >
                {formData.ticketing_website.replace(/^https?:\/\//, '').substring(0, 25)}...
              </a>
            ) : (
              <span className="text-sm text-gray-400 italic">No link set</span>
            )}
            <button
              type="button"
              onClick={onEditUrl}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <Pencil className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* Require Approval */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCheck className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Require Approval</span>
        </div>
        <button
          type="button"
          onClick={onToggleApproval}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            formData.require_approval ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              formData.require_approval ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Capacity */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Capacity</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formData.enable_capacity_limit ? formData.max_participants : 'Unlimited'}
          </span>
          <button
            type="button"
            onClick={onEditCapacity}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <Pencil className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  </div>
);
