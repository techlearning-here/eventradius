import React from 'react';
import { Monitor, Globe, Lock } from 'lucide-react';
import { Event } from '../types';

interface VirtualEventSectionProps {
  event: Event;
}

export const VirtualEventSection: React.FC<VirtualEventSectionProps> = ({ event }) => {
  if (!event.virtual_event_url && !event.virtual_event_platform && !event.event_password) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <div className="w-1 h-6 bg-primary rounded-full"></div>
        Virtual Event Details
      </h2>
      <div className="bg-gradient-to-br from-card to-background border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Monitor className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-3">Join Online</h3>
            {event.virtual_event_platform && (
              <p className="text-sm text-muted-foreground mb-3">
                Platform: <span className="font-medium text-foreground">{event.virtual_event_platform}</span>
              </p>
            )}
            {event.virtual_event_url && (
              <a
                href={event.virtual_event_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors"
              >
                <Globe className="w-4 h-4" />
                Join Virtual Event
              </a>
            )}
            {event.event_password && (
              <div className="mt-3 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <Lock className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-800">
                  Password: <span className="font-mono font-medium">{event.event_password}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VirtualEventSection;
