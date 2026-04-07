import { MapPin, Trash2, MoreVertical, Edit, Eye } from 'lucide-react';
import { CATEGORIES } from '@/data/cities';
import { useState } from 'react';

interface OrgEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  city?: string;
  category: string;
  status: 'preview' | 'cancelled' | 'approved' | 'pending' | 'rejected' | 'deactivated';
  admin_remark?: string;
}

interface EventsListProps {
  events: OrgEvent[];
  onDelete?: (id: string) => void;
  onEdit?: (event: OrgEvent) => void;
  onView?: (event: OrgEvent) => void;
}

export const EventsList = ({ events, onDelete, onEdit, onView }: EventsListProps) => {
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const event = events.find(e => e.id === id);
    const confirmMessage = event?.status === 'preview' 
      ? `Delete the preview event "${event?.title}"? This action cannot be undone.`
      : `Delete "${event?.title}"? This will permanently remove the event and all associated data. This action cannot be undone.`;
    
    if (!confirm(confirmMessage)) return;
    setShowMenu(null);
    onDelete?.(id);
  };

  const canDelete = (status: string) => {
    // Allow deletion for all statuses except maybe some restrictions
    return true; // Allow deletion for all events
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preview': return 'bg-blue-500/20 text-blue-600';
      case 'cancelled': return 'bg-destructive/20 text-destructive-foreground';
      case 'approved': return 'bg-green-500/20 text-green-600';
      case 'pending': return 'bg-yellow-500/20 text-yellow-600';
      case 'rejected': return 'bg-red-500/20 text-red-600';
      case 'deactivated': return 'bg-gray-500/20 text-gray-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="relative flex flex-col gap-2 p-4 bg-background border border-border rounded-lg hover:shadow-sm transition-shadow">
          {/* Header with status and menu */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 ${getStatusColor(event.status)}`}>
                {event.status}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase">
                {CATEGORIES.find(c => c.id === event.category)?.label || event.category}
              </span>
            </div>
            
            {/* Action menu */}
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
                        onClick={() => {
                          onView(event);
                          setShowMenu(null);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    )}
                    
                    {onEdit && (
                      <button
                        onClick={() => {
                          onEdit(event);
                          setShowMenu(null);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                    
                    {canDelete(event.status) && (
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

          {/* Event details */}
          <div>
            <h3 className="font-semibold text-sm mb-1 line-clamp-2">{event.title}</h3>
            <p className="text-xs text-muted-foreground">{event.date} · {event.time}</p>
            {event.city && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {event.city}
              </p>
            )}
            {event.admin_remark && (
              <p className="text-xs text-muted-foreground mt-2 italic">Remark: {event.admin_remark}</p>
            )}
          </div>

          {/* Quick action buttons for preview events */}
          {event.status === 'preview' && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleDelete(event.id)}
                className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
