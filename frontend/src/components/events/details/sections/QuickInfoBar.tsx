import React, { useEffect } from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Event } from '../types';

interface QuickInfoBarProps {
  event: Event;
}

export const QuickInfoBar: React.FC<QuickInfoBarProps> = ({ event }) => {
  // Debug log for quick info fields
  useEffect(() => {
    console.log('[QuickInfoBar] Debug - Quick info fields:', {
      date: event.date,
      start_time: event.start_time,
      timezone: event.timezone,
      location: event.location,
      address: event.address,
      current_participants: event.current_participants,
      max_participants: event.max_participants,
      category: event.category,
      is_public: event.is_public,
    });
  }, [event.date, event.start_time, event.timezone, event.location, event.address, 
      event.current_participants, event.max_participants, event.category, event.is_public]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
        <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
        <div className="text-sm font-semibold text-foreground mb-1">Date</div>
        <div className="text-lg text-muted-foreground">
          {event.date || new Date(event.start_time || event.created_at).toLocaleDateString()}
        </div>
        {event.timezone && (
          <div className="text-xs text-muted-foreground mt-1">{event.timezone}</div>
        )}
      </div>
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
        <MapPin className="w-6 h-6 text-primary mx-auto mb-2" />
        <div className="text-sm font-semibold text-foreground mb-1">Location</div>
        <div className="text-lg text-muted-foreground">
          {event.location || event.address}
        </div>
      </div>
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
        <Users className="w-6 h-6 text-primary mx-auto mb-2" />
        <div className="text-sm font-semibold text-foreground mb-1">Attendees & Category</div>
        <div className="text-lg text-muted-foreground">
          {event.current_participants || 0} / {event.max_participants || 'Unlimited'}
        </div>
        <div className="text-sm text-muted-foreground capitalize">
          {event.category || 'Event'} • {event.is_public ? 'Public' : 'Private'}
        </div>
      </div>
    </div>
  );
};

export default QuickInfoBar;
