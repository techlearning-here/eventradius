import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, MapPin, Users, Clock, ArrowRight, Share2, Navigation } from 'lucide-react';
import { format } from 'date-fns';
import { EventDetailOverlay } from '@/components/events/details/EventDetailPage';
import { ShareEventModal } from '@/components/share/ShareEventModal';
import { CATEGORIES } from '@/data/cities';
import { formatDistance } from '@/hooks/useGeolocation';
import { type Event } from '@/components/events/details/types';

// Event from API may have additional/looser typing than strict Event type
type EventFromApi = Event & Record<string, unknown> & {
  distance_km?: number;
};

interface EventCardProps {
  event: EventFromApi;
  onPreview?: (event: Event) => void;
  participantCounts?: { interested: number; going: number };
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPreview, participantCounts }) => {
  const navigate = useNavigate();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const catLabel = CATEGORIES.find(c => c.id === event.category)?.label || event.category;

  const handleEventClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPreview) {
      onPreview(event);
    } else {
      setIsOverlayOpen(true);
    }
  };

  const handleCloseOverlay = () => {
    setIsOverlayOpen(false);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareModalOpen(true);
  };

  return (
    <div className="group cursor-pointer" onClick={handleEventClick}>
      {!onPreview && isOverlayOpen && (
        <EventDetailOverlay
          eventId={event.id}
          isOpen={true}
          onClose={handleCloseOverlay}
          eventData={event}
        />
      )}

      <ShareEventModal
        event={event}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
      
      {/* Main Card Content */}
      <div className="relative bg-background border border-border rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 ease-out group-hover:-translate-y-2">
        {/* Event Image */}
        <div className="relative h-44 overflow-hidden">
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
          
          
          {/* Free/Paid Badge */}
          {!event.is_paid_event ? (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-emerald-700 to-emerald-600 border border-emerald-500 rounded-full text-xs font-semibold text-white shadow-md">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                FREE
              </span>
            </div>
          ) : (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-600 to-amber-500 border border-amber-400 rounded-full text-xs font-semibold text-white shadow-md">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                PAID
              </span>
            </div>
          )}
        </div>
        
        {/* Event Details */}
        <div className="p-4 space-y-3">
          {/* Category & Date Row */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
              <span>{CATEGORIES.find(c => c.id === event.category)?.emoji || '📅'}</span>
              {catLabel}
            </span>
            {event.start_time && (
              <span className="text-xs text-muted-foreground font-medium">
                {format(new Date(event.start_time), 'MMM d')}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-foreground line-clamp-2 leading-tight transition-colors duration-300 group-hover:text-primary">
            {event.title}
          </h3>
          
          {/* Time */}
          {event.start_time && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-3.5 h-3.5 text-primary/70" />
              <span className="font-medium">{format(new Date(event.start_time), 'h:mm a')}</span>
            </div>
          )}
          
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-secondary">
              <MapPin className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-medium truncate">{event.location || 'Online Event'}</span>
          </div>
          
          {/* Distance from user (when available) */}
          {event.distance_km !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-50">
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className="font-medium text-blue-600">
                {formatDistance(event.distance_km)} away
              </span>
            </div>
          )}
          
          {/* Participants with Progress */}
          <div className="pt-3 border-t border-border/60">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-secondary">
                  <Users className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {event.current_participants || 0} <span className="text-muted-foreground font-normal">going</span>
                </span>
              </div>
              {event.max_participants && event.max_participants > 0 && (
                <span className="text-xs text-muted-foreground">
                  {Math.round(((event.current_participants || 0) / event.max_participants) * 100)}% full
                </span>
              )}
            </div>
            {event.max_participants && event.max_participants > 0 && (
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(((event.current_participants || 0) / event.max_participants) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>
          
          {/* Action Bar - Share & View */}
          <div className="flex items-center justify-between pt-3 border-t border-border/60">
            <button
              onClick={handleShareClick}
              className="flex items-center justify-center w-9 h-9 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors"
              title="Share event"
            >
              <Share2 className="w-4 h-4" />
            </button>
            
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md shadow-primary/25">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
