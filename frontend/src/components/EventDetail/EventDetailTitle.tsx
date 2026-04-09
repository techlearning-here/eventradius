import React from 'react';
import { Ticket, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventDetailTitleProps {
  title: string;
  creator?: string;
  organizer_email?: string;
  is_paid_event?: boolean;
}

export const EventDetailTitle: React.FC<EventDetailTitleProps> = ({ 
  title, 
  creator, 
  organizer_email,
  is_paid_event
}) => {
  const displayCreator = creator || organizer_email || 'Event Organizer';
  
  return (
    <div className="bg-background border-b border-border sticky top-0 z-10">
      <div className="p-8">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          {title}
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground text-lg font-medium">By {displayCreator}</span>
          {/* FREE/PAID Badge - Moved below title */}
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-xs shadow-md",
            is_paid_event 
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white" 
              : "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
          )}>
            {is_paid_event ? (
              <><Tag className="w-3 h-3" /> PAID</>
            ) : (
              <><Ticket className="w-3 h-3" /> FREE</>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailTitle;
