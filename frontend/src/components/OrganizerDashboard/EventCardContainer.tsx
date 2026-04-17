import React, { useState, useRef, useEffect } from 'react';
import { Eye, Edit3, Trash2, Calendar, Zap, PenLine, ChevronDown, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Event } from '@/integrations/backend/api';

interface EventCardContainerProps {
  children: React.ReactNode;
  onPreview?: (event?: Event) => void;
  onEdit?: () => void;
  onQuickEdit?: () => void;
  onDetailedEdit?: () => void;
  onDelete?: () => void;
  className?: string;
  isQuickCreated?: boolean;
}

export const EventCardContainer: React.FC<EventCardContainerProps> = ({
  children,
  onPreview,
  onEdit,
  onQuickEdit,
  onDetailedEdit,
  onDelete,
  className,
  isQuickCreated
}) => {
  const [showEditMenu, setShowEditMenu] = useState(false);
  const editMenuRef = useRef<HTMLDivElement>(null);

  // Close edit menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editMenuRef.current && !editMenuRef.current.contains(event.target as Node)) {
        setShowEditMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickEdit && onDetailedEdit) {
      setShowEditMenu(!showEditMenu);
    } else if (onEdit) {
      onEdit();
    }
  };

  const hasEditOptions = onQuickEdit || onDetailedEdit || onEdit;

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
          
          {hasEditOptions && (
            <div className="relative" ref={editMenuRef}>
              <button
                onClick={handleEditClick}
                className={cn(
                  "p-1.5 rounded-md transition-colors flex items-center gap-0.5",
                  isQuickCreated 
                    ? "text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                    : "text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10"
                )}
                title="Edit Options"
              >
                <div className="relative">
                  <PenLine className="w-4 h-4" />
                  {isQuickCreated && (
                    <Zap className="w-2 h-2 absolute -top-0.5 -right-0.5 fill-amber-500" />
                  )}
                </div>
                {(onQuickEdit && onDetailedEdit) && (
                  <ChevronDown className={cn("w-3 h-3 transition-transform", showEditMenu && "rotate-180")} />
                )}
              </button>

              {/* Edit Options Dropdown */}
              {showEditMenu && onQuickEdit && onDetailedEdit && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-popover border border-border rounded-lg shadow-lg z-50 py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickEdit();
                      setShowEditMenu(false);
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center gap-2"
                  >
                    <PenLine className="w-4 h-4 text-amber-500" />
                    <span>Quick Edit</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDetailedEdit();
                      setShowEditMenu(false);
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center gap-2"
                  >
                    <ListTodo className="w-4 h-4 text-blue-500" />
                    <span>Detailed Edit</span>
                  </button>
                </div>
              )}
            </div>
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
