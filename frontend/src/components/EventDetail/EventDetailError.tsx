import React from 'react';

interface EventDetailErrorProps {
  error: string;
  onClose: () => void;
}

export const EventDetailError: React.FC<EventDetailErrorProps> = ({ error, onClose }) => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">⚠️</div>
      <h1 className="text-4xl font-medium mb-4">Oops!</h1>
      <p className="text-lg text-muted-foreground mb-8">{error}</p>
      <button 
        onClick={onClose} 
        className="px-6 py-3 bg-foreground text-background border border-foreground hover:opacity-90 transition-colors uppercase text-sm font-medium rounded-lg"
      >
        Close
      </button>
    </div>
  );
};

export default EventDetailError;
