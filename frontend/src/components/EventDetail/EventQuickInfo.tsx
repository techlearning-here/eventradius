import React from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Event } from './types';

interface EventQuickInfoProps {
  event: Event;
}

export const EventQuickInfo: React.FC<EventQuickInfoProps> = ({ event }) => {
  const eventDate = event.date || (event.start_time ? new Date(event.start_time).toLocaleDateString() : 'Date TBD');
  const location = event.location || event.address || 'Location TBD';
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
        <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
        <div className="text-sm font-semibold text-foreground mb-1">Date</div>
        <div className="text-lg text-muted-foreground">{eventDate}</div>
      </div>
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
        <MapPin className="w-6 h-6 text-primary mx-auto mb-2" />
        <div className="text-sm font-semibold text-foreground mb-1">Location</div>
        <div className="text-lg text-muted-foreground">{location}</div>
      </div>
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
        <Users className="w-6 h-6 text-primary mx-auto mb-2" />
        <div className="text-sm font-semibold text-foreground mb-1">Attendees & Category</div>
        <div className="text-lg text-muted-foreground">
          {event.current_participants || 0} / {event.max_participants || 'Unlimited'}
        </div>
        <div className="text-sm text-muted-foreground capitalize">
          {event.category || 'Event'} &bull; {event.is_public ? 'Public' : 'Private'}
        </div>
      </div>
    </div>
  );
};

export default EventQuickInfo;
