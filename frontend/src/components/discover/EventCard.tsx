import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, MapPin, Users, Clock, Star, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { EventDetailOverlay } from '@/components/EventDetailPage';
import { EventParticipationCounts } from '@/components/EventParticipation';
import { CATEGORIES } from '@/data/cities';
import { type Event } from '@/integrations/backend/api';

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const navigate = useNavigate();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const catLabel = CATEGORIES.find(c => c.id === event.category)?.label || event.category;

  const handleEventClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOverlayOpen(true);
  };

  return (
    <div className="group cursor-pointer" onClick={handleEventClick}>
      <EventDetailOverlay eventId={event.id} isOpen={isOverlayOpen} onClose={() => setIsOverlayOpen(false)} />
      
      {/* Main Card Content */}
      <div className="relative bg-background border border-border rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 ease-out group-hover:-translate-y-2">
        {/* Event Image */}
        <div className="relative h-56 overflow-hidden">
          {event.image_url ? (
            <>
              <img 
                src={event.image_url} 
                alt=""
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                onError={(e) => {
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.classList.add('bg-gradient-to-br', 'from-primary/30', 'via-primary/20', 'to-primary/40');
                    e.currentTarget.style.display = 'none';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/20 to-primary/40 flex items-center justify-center">
              <CalendarIcon className="w-16 h-16 text-primary/60" />
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background/90 backdrop-blur-md border border-border/50 rounded-full text-xs font-medium text-foreground shadow-lg">
              <span className="text-sm">{CATEGORIES.find(c => c.id === event.category)?.emoji || '📅'}</span>
              {catLabel}
            </span>
          </div>
          
          {/* Free Badge */}
          {!event.is_paid_event && (
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-700 to-emerald-600 border border-emerald-500 rounded-full text-xs font-semibold text-white shadow-lg">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                FREE
              </span>
            </div>
          )}
        </div>
        
        {/* Event Details */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <h3 className="text-xl font-bold text-foreground line-clamp-2 leading-tight transition-colors duration-300 group-hover:text-primary mb-2">
              {event.title}
            </h3>
          </div>
          
          {/* Date and Time */}
          {event.start_time && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg">
                <CalendarIcon className="w-4 h-4 text-primary" />
                <span className="font-medium">{format(new Date(event.start_time), 'MMM d')}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium">{format(new Date(event.start_time), 'h:mm a')}</span>
              </div>
            </div>
          )}
          
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-foreground/80 transition-colors duration-300 group-hover:text-foreground">
            <MapPin className="w-4 h-4 text-primary transition-colors duration-300 group-hover:text-primary/80" />
            <span className="font-medium">{event.location || 'Online Event'}</span>
          </div>
          
          {/* Participants */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="font-medium">{event.current_participants || 0} going</span>
              </div>
              {event.max_participants && (
                <span className="text-xs text-muted-foreground">
                  / {event.max_participants} max
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <EventParticipationCounts eventId={event.id} />
            </div>
          </div>
          
          {/* Hover Action Button */}
          <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-primary/25">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
