import React from 'react';

interface EventDetailCloseButtonProps {
  onClose: () => void;
}

export const EventDetailCloseButton: React.FC<EventDetailCloseButtonProps> = ({ onClose }) => {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }}
      className="absolute top-6 right-6 z-50 text-muted-foreground hover:text-foreground transition-all duration-200 p-3 rounded-2xl hover:bg-background/80 backdrop-blur-sm border border-transparent hover:border-border/50 group bg-background/50"
      title="Close event details"
    >
      <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
};

export default EventDetailCloseButton;
