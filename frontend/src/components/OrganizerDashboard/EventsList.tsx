import { MapPin, Trash2, MoreVertical, Edit, Eye } from 'lucide-react';
import { CATEGORIES } from '@/data/cities';
import { useState } from 'react';
import { type Event } from '@/integrations/backend/api';
import { format } from 'date-fns';

interface EventsListProps {
  events: Event[];
  onDelete?: (id: string) => void;
  onEdit?: (event: Event) => void;
  onView?: (event: Event) => void;
}

export const EventsList = ({ events, onDelete, onEdit, onView }: EventsListProps) => {
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const event = events.find(e => e.id === id);
    const confirmMessage = `Delete "${event?.title}"? This will permanently remove the event and all associated data. This action cannot be undone.`;
    
    if (!confirm(confirmMessage)) return;
    setShowMenu(null);
    onDelete?.(id);
  };

  const canDelete = () => {
    return true;
  };

  const getStatusBadge = () => {
    return { className: 'bg-muted text-muted-foreground', label: 'Event' };
  };

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const eventDate = event.start_time 
          ? format(new Date(event.start_time), 'MMM d, yyyy')
          : 'Date TBD';
        const eventTime = event.start_time 
          ? format(new Date(event.start_time), 'h:mm a')
          : 'Time TBD';
        const city = event.location;
        
        return (
          <div key={event.id} className="relative flex flex-col gap-2 p-4 bg-background border border-border rounded-lg hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 bg-muted text-muted-foreground">
                  Event
                </span>
                <span className="text-[10px] text-muted-foreground uppercase">
                  {CATEGORIES.find(c => c.id === event.category)?.label || event.category || 'General'}
                </span>
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setShowMenu(showMenu === event.id ? null : event.id)}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
                
                {showMenu === event.id && (
                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                    <div className="py-1">
                      {onView && (
                        <button
                          onClick={() => { onView(event); setShowMenu(null); }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </button>
                      )}
                      
                      {onEdit && (
                        <button
                          onClick={() => { onEdit(event); setShowMenu(null); }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                      )}
                      
                      {canDelete() && (
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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

            <div>
              <h3 className="font-semibold text-sm mb-1 line-clamp-2">{event.title}</h3>
              <p className="text-xs text-muted-foreground">{eventDate} &middot; {eventTime}</p>
              {city && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {city}
                </p>
              )}
            </div>

            {/* Delete button removed - use menu */}
          </div>
        );
      })}
    </div>
  );
};
