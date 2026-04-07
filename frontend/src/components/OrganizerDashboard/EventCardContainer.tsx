import React from 'react';
import { Eye, Edit, Trash2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventCardContainerProps {
  children: React.ReactNode;
  onPreview?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const EventCardContainer: React.FC<EventCardContainerProps> = ({
  children,
  onPreview,
  onEdit,
  onDelete,
  className
}) => {
  return (
    <div className={cn(
      "relative group border border-border rounded-xl overflow-hidden bg-card",
      "hover:shadow-lg hover:border-primary/20 transition-all duration-300",
      className
    )}>
      {/* Header with Action Icons */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Event</span>
        </div>
        
        <div className="flex items-center gap-1">
          {onPreview && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreview();
              }}
              className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title="Preview Event"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 rounded-md text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
              title="Edit Event"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Delete Event"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
};

export default EventCardContainer;
