import React from 'react';
import { Calendar, MapPin, Users, Clock, Tag } from 'lucide-react';
import { Event } from './types';
import { format } from 'date-fns';

interface EventQuickInfoProps {
  event: Event;
}

export const EventQuickInfo: React.FC<EventQuickInfoProps> = ({ event }) => {
  const eventDate = event.date || (event.start_time ? format(new Date(event.start_time), 'EEEE, MMMM d, yyyy') : 'Date TBD');
  const eventTime = event.start_time ? format(new Date(event.start_time), 'h:mm a') : '';
  const location = event.location || event.address || 'Location TBD';
  const capacityPercent = event.max_participants 
    ? Math.round(((event.current_participants || 0) / event.max_participants) * 100) 
    : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Date Card */}
      <div className="group relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/10 rounded-2xl p-5 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</p>
              <p className="text-lg font-bold text-foreground">{eventDate}</p>
            </div>
          </div>
          {eventTime && (
            <div className="flex items-center gap-2 ml-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-primary/60" />
              <span>{eventTime}</span>
            </div>
          )}
        </div>
      </div>

      {/* Location Card */}
      <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500/5 via-blue-500/3 to-transparent border border-blue-500/10 rounded-2xl p-5 hover:shadow-lg hover:border-blue-500/20 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</p>
              <p className="text-lg font-bold text-foreground truncate max-w-[200px]">{location}</p>
            </div>
          </div>
          <p className="ml-14 text-sm text-muted-foreground">Click for directions</p>
        </div>
      </div>

      {/* Attendees Card */}
      <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500/5 via-emerald-500/3 to-transparent border border-emerald-500/10 rounded-2xl p-5 hover:shadow-lg hover:border-emerald-500/20 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Attendees</p>
              <p className="text-lg font-bold text-foreground">
                {event.current_participants || 0} <span className="text-muted-foreground font-normal text-base">/ {event.max_participants || '∞'}</span>
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          {event.max_participants && (
            <div className="ml-14">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">{capacityPercent}% capacity filled</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventQuickInfo;
