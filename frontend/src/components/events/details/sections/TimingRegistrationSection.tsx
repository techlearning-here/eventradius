import React, { useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Event } from '../types';

interface TimingRegistrationSectionProps {
  event: Event;
}

export const TimingRegistrationSection: React.FC<TimingRegistrationSectionProps> = ({ event }) => {
  // Debug log for timing fields
  useEffect(() => {
    console.log('[TimingRegistrationSection] Debug - Timing fields:', {
      timezone: event.timezone,
      doors_open_time: event.doors_open_time,
      registration_start_time: event.registration_start_time,
      registration_end_time: event.registration_end_time,
    });
  }, [event.timezone, event.doors_open_time, event.registration_start_time, event.registration_end_time]);

  if (!event.timezone && !event.doors_open_time && !event.registration_start_time && !event.registration_end_time) {
    console.log('[TimingRegistrationSection] No timing data - returning null');
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <div className="w-1 h-6 bg-primary rounded-full"></div>
        Timing & Registration
      </h2>
      <div className="bg-gradient-to-br from-card to-background border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-3">Important Times</h3>
            {event.timezone && (
              <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-sm font-medium text-blue-700">
                  <span className="text-lg mr-2">🌍</span>
                  Timezone: <span className="font-bold">{event.timezone}</span>
                </span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {event.doors_open_time && (
                <div className="p-3 bg-muted/50 rounded-xl">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Doors Open</span>
                  <p className="font-medium text-foreground">
                    {new Date(event.doors_open_time).toLocaleString()}
                  </p>
                </div>
              )}
              {event.registration_start_time && (
                <div className="p-3 bg-muted/50 rounded-xl">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Registration Opens</span>
                  <p className="font-medium text-foreground">
                    {new Date(event.registration_start_time).toLocaleString()}
                  </p>
                </div>
              )}
              {event.registration_end_time && (
                <div className="p-3 bg-muted/50 rounded-xl">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Registration Closes</span>
                  <p className="font-medium text-foreground">
                    {new Date(event.registration_end_time).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TimingRegistrationSection;
