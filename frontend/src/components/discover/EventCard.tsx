import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, MapPin } from 'lucide-react';
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
    <div className="relative cursor-pointer group group-hover:active:scale-95 transition-transform duration-150" onClick={handleEventClick}>
      <EventDetailOverlay eventId={event.id} isOpen={isOverlayOpen} onClose={() => setIsOverlayOpen(false)} />
      
      {/* Main Card Content */}
      <div className="border border-border rounded-lg overflow-hidden bg-card hover:shadow-lg hover:bg-accent/50 transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:-translate-y-1">
        {/* Event Image */}
        {event.image_url ? (
          <div className="relative h-48 w-full overflow-hidden border-b border-border">
            <img 
              src={event.image_url} 
              alt=""
              className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
              onError={(e) => {
                // Hide broken image and show gradient fallback
                (e.currentTarget.parentElement as HTMLElement).classList.add('bg-gradient-to-br', 'from-primary/20', 'to-primary/40');
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ) : (
          <div className="relative h-48 w-full overflow-hidden border-b border-border bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
            <CalendarIcon className="w-12 h-12 text-primary/50" />
          </div>
        )}
        
        {/* Event Details */}
        <div className="p-4 space-y-3 bg-background border-t border-border">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-medium text-muted-foreground transition-colors duration-300 group-hover:text-foreground">{catLabel}</span>
              {!event.is_paid_event && (
                <span className="text-[10px] font-semibold text-green-400 transition-colors duration-300 group-hover:text-green-300">FREE</span>
              )}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {event.max_participants && `${event.max_participants} max` || 'Open'}
            </div>
          </div>
          
          <h3 className="text-lg font-medium text-foreground line-clamp-2 leading-tight transition-colors duration-300 group-hover:text-primary mb-3">{event.title}</h3>
          
          {event.start_time && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <CalendarIcon className="w-4 h-4" />
              <span>{format(new Date(event.start_time), 'MMM d, yyyy')}</span>
              <span>at</span>
              <span>{format(new Date(event.start_time), 'h:mm a')}</span>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1 text-foreground/80 transition-colors duration-300 group-hover:text-foreground mb-3">
            <MapPin className="w-3 h-3 transition-colors duration-300 group-hover:text-primary" /> {event.location || 'Online'}
          </p>
          
          <div className="pt-3 border-t border-border bg-muted/20 rounded-b-lg">
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-2">
                <EventParticipationCounts eventId={event.id} />
              </div>
              <div className="text-[10px] text-muted-foreground font-medium">
                {event.current_participants || 0} going
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
