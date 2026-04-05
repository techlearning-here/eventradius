import { MapPin, Trash2 } from 'lucide-react';
import { CATEGORIES } from '@/data/cities';

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
  onConvertToStandard?: (event: OrgEvent) => void;
}

export const EventsList = ({ events, onDelete, onConvertToStandard }: EventsListProps) => {
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    onDelete?.(id);
  };

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="relative flex flex-col gap-2 p-4 bg-background border border-border rounded-lg">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 ${
              event.status === 'preview' ? 'bg-blue-500/20 text-blue-600' : 
              event.status === 'cancelled' ? 'bg-destructive/20 text-destructive-foreground' :
              event.status === 'approved' ? 'bg-green-500/20 text-green-600' :
              event.status === 'pending' ? 'bg-yellow-500/20 text-yellow-600' :
              event.status === 'rejected' ? 'bg-red-500/20 text-red-600' :
              'bg-muted text-muted-foreground'
            }`}>
              {event.status}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase">
              {CATEGORIES.find(c => c.id === event.category)?.label || event.category}
            </span>
          </div>
          <h3 className="font-semibold text-sm mb-1 line-clamp-1">{event.title}</h3>
          <p className="text-xs text-muted-foreground">{event.date} · {event.time}</p>
          {event.city && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {event.city}
            </p>
          )}
          {event.admin_remark && (
            <p className="text-xs text-muted-foreground mt-2 italic">Remark: {event.admin_remark}</p>
          )}
          
          {/* Action buttons for preview events */}
          {event.status === 'preview' && onConvertToStandard && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onConvertToStandard(event)}
                className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Convert to Standard
              </button>
              <button
                onClick={() => handleDelete(event.id)}
                className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
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
