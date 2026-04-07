import React from 'react';

interface EventDetailTitleProps {
  title: string;
  creator?: string;
  organizer_email?: string;
}

export const EventDetailTitle: React.FC<EventDetailTitleProps> = ({ 
  title, 
  creator, 
  organizer_email 
}) => {
  const displayCreator = creator || organizer_email || 'Unknown Organizer';
  
  return (
    <div className="bg-background border-b border-border">
      <div className="p-8">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          {title}
        </h1>
        <div className="flex items-center gap-4 text-muted-foreground text-lg">
          <span className="font-medium">By {displayCreator}</span>
        </div>
      </div>
    </div>
  );
};

export default EventDetailTitle;
