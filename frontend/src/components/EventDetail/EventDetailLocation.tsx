import React from 'react';
import { MapPin, Navigation, ExternalLink, Copy, CheckCircle2 } from 'lucide-react';

interface EventDetailLocationProps {
  location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  geolocation_accuracy?: string;
  onGetDirections: () => void;
}

export const EventDetailLocation: React.FC<EventDetailLocationProps> = ({ 
  location, 
  address,
  latitude,
  longitude,
  geolocation_accuracy,
  onGetDirections 
}) => {
  const [copied, setCopied] = React.useState(false);
  const displayLocation = location || address;
  
  // DEBUG: Log received props
  console.log('[EventDetailLocation] Props received:', {
    location,
    address,
    displayLocation,
    latitude,
    longitude,
    geolocation_accuracy,
    hasLocation: !!displayLocation
  });
  
  if (!displayLocation) {
    console.log('[EventDetailLocation] Returning null - no location data');
    return null;
  }
  
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(displayLocation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <section className="relative">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10">
          <MapPin className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Location & Venue</h2>
          <p className="text-sm text-muted-foreground">Where the event takes place</p>
        </div>
      </div>
      
      {/* Location Card */}
      <div className="bg-gradient-to-br from-card to-card/30 border border-border/60 rounded-2xl overflow-hidden shadow-sm">
        {/* Address Header */}
        <div className="p-5 md:p-6 border-b border-border/50">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex-shrink-0">
              <Navigation className="w-7 h-7 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground mb-1">Event Location</h3>
              <p className="text-muted-foreground text-base leading-relaxed">{displayLocation}</p>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <button
                  onClick={onGetDirections}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Get Directions
                </button>
                <button
                  onClick={handleCopyAddress}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-xl font-medium text-sm hover:bg-muted/80 transition-colors"
                >
                  {copied ? (
                    <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Copied!</>
                  ) : (
                    <><Copy className="w-4 h-4" /> Copy Address</>
                  )}
                </button>
              </div>
              
              {/* DEBUG: Coordinates Display */}
              {(latitude || longitude) && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs font-semibold text-amber-700 mb-1">📍 Debug Coordinates</p>
                  <div className="text-xs text-amber-600 font-mono space-y-0.5">
                    <p>Lat: {latitude?.toFixed(6)}</p>
                    <p>Lng: {longitude?.toFixed(6)}</p>
                    <p>Accuracy: {geolocation_accuracy || 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Map Container */}
        <div className="relative bg-muted/30">
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(displayLocation)}&output=embed`}
              className="w-full h-full border-0"
              loading="lazy"
              title="Event Location Map"
              allowFullScreen
            />
          </div>
          
          {/* Map overlay hint */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-background/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-border/50 text-center">
              <p className="text-sm text-muted-foreground">
                Click on the map to open in Google Maps
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventDetailLocation;
