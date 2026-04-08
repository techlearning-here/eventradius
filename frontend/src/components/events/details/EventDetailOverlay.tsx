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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-[95vw] h-[95vh] sm:w-[92vw] sm:h-[92vh] md:w-[88vw] md:h-[90vh] lg:w-[85vw] lg:h-[88vh] xl:w-[80vw] xl:h-[85vh] 2xl:w-[75vw] 2xl:h-[82vh] overflow-hidden flex flex-col">
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
