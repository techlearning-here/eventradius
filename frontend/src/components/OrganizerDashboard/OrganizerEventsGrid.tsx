import React from 'react';
import { OrganizerEventCard } from './OrganizerEventCard';
import { type Event } from '@/integrations/backend/api';
import { Grid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrganizerEventsGridProps {
  events: Event[];
  onEdit?: (event: Event) => void;
  onQuickEdit?: (event: Event) => void;
  onDetailedEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  onPreview?: (event: Event) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  participantCounts?: Map<string, { interested: number; going: number }>;
}

export const OrganizerEventsGrid: React.FC<OrganizerEventsGridProps> = ({
  events,
  onEdit,
  onQuickEdit,
  onDetailedEdit,
  onDelete,
  onPreview,
  viewMode = 'grid',
  onViewModeChange,
  isLoading,
  emptyState,
  participantCounts
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border border-border rounded-lg overflow-hidden bg-card animate-pulse">
            <div className="h-48 bg-muted" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-6 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        {emptyState || (
          <>
            <div className="text-6xl text-muted-foreground mb-4">📭</div>
            <h3 className="text-xl font-medium text-foreground mb-2">No Events Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first event to get started.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      {onViewModeChange && (
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-muted-foreground mr-2">View:</span>
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === 'grid' 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted text-muted-foreground"
            )}
            title="Grid view"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === 'list' 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted text-muted-foreground"
            )}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Events Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <OrganizerEventCard
              key={event.id}
              event={event}
              onEdit={onEdit}
              onQuickEdit={onQuickEdit}
              onDetailedEdit={onDetailedEdit}
              onDelete={onDelete}
              onPreview={onPreview}
              variant="default"
              participantCounts={participantCounts?.get(event.id)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {events.map((event) => (
            <OrganizerEventCard
              key={event.id}
              event={event}
              onEdit={onEdit}
              onQuickEdit={onQuickEdit}
              onDetailedEdit={onDetailedEdit}
              onDelete={onDelete}
              onPreview={onPreview}
              variant="compact"
              participantCounts={participantCounts?.get(event.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganizerEventsGrid;
