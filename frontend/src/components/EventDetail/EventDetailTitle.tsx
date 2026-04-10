import React from 'react';
import { Ticket, Tag, User, Calendar, Sparkles } from 'lucide-react';
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
    <div className="bg-background border-b border-border/60">
      <div className="px-6 py-6 md:px-8 md:py-8">
        {/* Title with gradient text effect */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
          {title}
        </h1>
        
        {/* Creator & Badge Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Creator Avatar & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Organized by</p>
              <p className="text-sm font-semibold text-foreground">{displayCreator}</p>
            </div>
          </div>
          
          <div className="h-8 w-px bg-border/60 hidden sm:block" />
          
          {/* Price Badge */}
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm shadow-sm transition-all duration-200 hover:shadow-md",
            is_paid_event 
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white" 
              : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
          )}>
            {is_paid_event ? (
              <><Tag className="w-4 h-4" /> <span>Paid Event</span></>
            ) : (
              <><Ticket className="w-4 h-4" /> <span>Free Entry</span></>
            )}
          </div>
          
          {/* Featured Tag */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Featured</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailTitle;
