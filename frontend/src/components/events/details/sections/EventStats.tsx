import React from 'react';
import { Event } from '../types';

interface EventStatsProps {
  event: Event;
}

export const EventStats: React.FC<EventStatsProps> = ({ event }) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-4">Event Stats</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Total Capacity</span>
          <span className="font-semibold text-foreground">{event.max_participants || 'Unlimited'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Registered</span>
          <span className="font-semibold text-foreground">{event.current_participants || 0}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Event Type</span>
          <span className="font-semibold text-foreground">{event.is_public ? 'Public' : 'Private'}</span>
        </div>
      </div>
    </div>
  );
};

export default EventStats;
