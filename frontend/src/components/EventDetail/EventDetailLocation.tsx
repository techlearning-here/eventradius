import React from 'react';
import { MapPin } from 'lucide-react';

interface EventDetailLocationProps {
  location?: string;
  address?: string;
  onGetDirections: () => void;
}

export const EventDetailLocation: React.FC<EventDetailLocationProps> = ({ 
  location, 
  address,
  onGetDirections 
}) => {
  const displayLocation = location || address;
  if (!displayLocation) return null;
  
  return (
    <section>
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <div className="w-1 h-6 bg-primary rounded-full"></div>
        Location & Venue
      </h2>
      <div className="bg-gradient-to-br from-card to-background border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <MapPin className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Event Location</h3>
            <p className="text-muted-foreground mb-4">{displayLocation}</p>
            <button
              onClick={onGetDirections}
              className="text-primary hover:text-primary/80 font-medium text-sm border-b border-primary/30 hover:border-primary/80 transition-colors"
            >
              Get Directions
            </button>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-border">
          <iframe
            src={`https://www.google.com/maps?q=${encodeURIComponent(displayLocation)}&output=embed`}
            className="w-full h-[300px] border-0"
            loading="lazy"
            title="Event Location Map"
          />
        </div>
      </div>
    </section>
  );
};

export default EventDetailLocation;
