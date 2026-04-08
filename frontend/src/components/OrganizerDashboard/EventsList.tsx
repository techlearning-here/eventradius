import { MapPin, Trash2, Edit, Eye, Calendar, Clock, Users } from 'lucide-react';
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'published': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'draft': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      music: 'bg-purple-100 text-purple-700 border-purple-200',
      sports: 'bg-orange-100 text-orange-700 border-orange-200',
      tech: 'bg-blue-100 text-blue-700 border-blue-200',
      business: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      arts: 'bg-pink-100 text-pink-700 border-pink-200',
      food: 'bg-amber-100 text-amber-700 border-amber-200',
      health: 'bg-teal-100 text-teal-700 border-teal-200',
    };
    return colors[category || ''] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-3">
      {events.map((event) => {
        const eventDate = event.start_time 
          ? format(new Date(event.start_time), 'MMM d, yyyy')
          : 'Date TBD';
        const eventTime = event.start_time 
          ? format(new Date(event.start_time), 'h:mm a')
          : 'Time TBD';
        const city = event.location;
        const isHovered = hoveredId === event.id;
        
        return (
          <div 
            key={event.id} 
            className="group relative flex items-center gap-4 p-4 bg-gradient-to-r from-background to-muted/30 border border-border/50 rounded-xl hover:shadow-lg hover:border-primary/20 transition-all duration-300"
            onMouseEnter={() => setHoveredId(event.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Event Image / Category Icon */}
            <div className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
              {event.image_url ? (
                <img 
                  src={event.image_url} 
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className={`w-full h-full ${getCategoryColor(event.category)} flex items-center justify-center border`}>
                  <span className="text-2xl">
                    {CATEGORIES.find(c => c.id === event.category)?.icon || '📅'}
                  </span>
                </div>
              )}
              {/* Status Badge */}
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                event.status === 'published' ? 'bg-emerald-500' : 
                event.status === 'draft' ? 'bg-amber-500' : 'bg-gray-400'
              }`} />
            </div>

            {/* Event Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getStatusColor(event.status)}`}>
                  {event.status || 'Event'}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {eventDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {eventTime}
                </span>
                {city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {city}
                  </span>
                )}
                {event.max_participants && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {event.current_participants || 0}/{event.max_participants}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {onView && (
                <button
                  onClick={() => onView(event)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(event)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(event.id)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
