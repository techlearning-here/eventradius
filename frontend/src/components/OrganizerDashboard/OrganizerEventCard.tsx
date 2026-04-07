import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, MapPin, Eye, Edit, Trash2, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { EventDetailOverlay } from '@/components/EventDetailPage';
import { EventParticipationCounts } from '@/components/EventParticipation';
import { CATEGORIES } from '@/data/cities';
import { type Event } from '@/integrations/backend/api';
import { cn } from '@/lib/utils';

interface OrganizerEventCardProps {
  event: Event;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  onPreview?: (event: Event) => void;
  variant?: 'default' | 'compact';
}

export const OrganizerEventCard: React.FC<OrganizerEventCardProps> = ({
  event,
  onEdit,
  onDelete,
  onPreview,
  variant = 'default'
}) => {
  const navigate = useNavigate();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const catLabel = CATEGORIES.find(c => c.id === event.category)?.label || event.category;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open overlay if clicking on action buttons
    if ((e.target as HTMLElement).closest('.event-actions') || (e.target as HTMLElement).closest('.event-menu')) {
      return;
    }
    setIsOverlayOpen(true);
    onPreview?.(event);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit?.(event);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    
    const confirmMessage = `Delete "${event.title}"? This will permanently remove the event and all associated data. This action cannot be undone.`;
    
    if (confirm(confirmMessage)) {
      onDelete?.(event.id);
    }
  };

  const handlePreview = (e: React.ReactEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    setIsOverlayOpen(true);
    onPreview?.(event);
  };

  const getStatusColor = (status?: string) => {
    // Simplified status colors - actual Event type doesn't have event_status
    return 'bg-muted text-muted-foreground border-border';
  };

  const isCompact = variant === 'compact';

  return (
    <>
      <div 
        className={cn(
          "relative group border border-border rounded-lg overflow-hidden bg-card hover:shadow-lg hover:bg-accent/50 transition-all duration-300 ease-in-out",
          isCompact ? "hover:shadow-md" : "hover:shadow-xl hover:-translate-y-1"
        )}
      >
        {/* Status Badge - Hidden since Event type doesn't have event_status */}

        {/* Action Menu - Top Right */}
        <div className="absolute top-3 right-3 z-20 event-menu">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 rounded-md bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background hover:border-border transition-all"
            >
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-8 bg-background border border-border rounded-lg shadow-lg z-30 min-w-[140px]">
                <div className="py-1">
                  <button
                    onClick={handlePreview}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  
                  {onEdit && (
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                  
                  {onDelete && (
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clickable Card Content */}
        <div 
          className={cn(
            "cursor-pointer",
            isCompact ? "h-full" : ""
          )}
          onClick={handleCardClick}
        >
          {/* Event Image */}
          {event.image_url ? (
            <div className={cn(
              "relative w-full overflow-hidden border-b border-border",
              isCompact ? "h-32" : "h-48"
            )}>
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
            <div className={cn(
              "relative w-full overflow-hidden border-b border-border bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center",
              isCompact ? "h-32" : "h-48"
            )}>
              <CalendarIcon className={cn(
                "text-primary/50",
                isCompact ? "w-8 h-8" : "w-12 h-12"
              )} />
            </div>
          )}
          
          {/* Event Details */}
          <div className={cn(
            "space-y-2 bg-background",
            isCompact ? "p-3" : "p-4 space-y-3"
          )}>
            {/* Category & Pricing */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-medium text-muted-foreground">{catLabel}</span>
                {!event.is_paid_event && (
                  <span className="text-[10px] font-semibold text-green-500">FREE</span>
                )}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {event.max_participants ? `${event.max_participants} max` : 'Open'}
              </div>
            </div>
            
            {/* Title */}
            <h3 className={cn(
              "font-medium text-foreground line-clamp-2 leading-tight transition-colors duration-300 group-hover:text-primary",
              isCompact ? "text-sm" : "text-lg"
            )}>
              {event.title}
            </h3>
            
            {/* Date & Time */}
            {event.start_time && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className={cn(
                  "flex-shrink-0",
                  isCompact ? "w-3 h-3" : "w-4 h-4"
                )} />
                <span className={cn(isCompact && "text-xs")}>
                  {format(new Date(event.start_time), isCompact ? 'MMM d' : 'MMM d, yyyy')}
                  {!isCompact && (
                    <>
                      <span className="mx-1">at</span>
                      <span>{format(new Date(event.start_time), 'h:mm a')}</span>
                    </>
                  )}
                </span>
              </div>
            )}
            
            {/* Location */}
            <p className={cn(
              "text-muted-foreground flex items-center gap-1 transition-colors duration-300 group-hover:text-foreground",
              isCompact ? "text-xs" : "text-sm"
            )}>
              <MapPin className={cn(
                "flex-shrink-0 transition-colors duration-300 group-hover:text-primary",
                isCompact ? "w-3 h-3" : "w-3 h-3"
              )} /> 
              {event.location || 'Online'}
            </p>
            
            {/* Participants Count */}
            {!isCompact && (
              <div className="pt-3 border-t border-border bg-muted/20 rounded-b-lg -mx-4 px-4 pb-0">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <EventParticipationCounts eventId={event.id} />
                  </div>
                  <div className="text-[10px] text-muted-foreground font-medium">
                    {event.current_participants || 0} going
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Detail Overlay */}
      <EventDetailOverlay 
        eventId={event.id} 
        isOpen={isOverlayOpen} 
        onClose={() => setIsOverlayOpen(false)} 
      />
    </>
  );
};

export default OrganizerEventCard;
