import React from 'react';

interface EventDetailLoadingProps {
  message?: string;
}

export const EventDetailLoading: React.FC<EventDetailLoadingProps> = ({ 
  message = 'Loading event details...' 
}) => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-foreground text-xl font-medium">{message}</div>
      </div>
    </div>
  );
};

export default EventDetailLoading;
