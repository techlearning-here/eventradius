import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { EventDetailPage } from './EventDetailPage';

interface EventDetailOverlayProps {
  eventId: string;
  onClose: () => void;
}

export const EventDetailOverlay = ({ eventId, onClose }: EventDetailOverlayProps) => {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Event Preview</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <EventDetailPage eventId={eventId} />
        </div>
      </div>
    </div>,
    document.body
  );
};
