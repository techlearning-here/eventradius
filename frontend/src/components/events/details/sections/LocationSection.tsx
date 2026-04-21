import React from 'react';
import { MapPin } from 'lucide-react';
import { Event } from '../types';

interface LocationSectionProps {
  event: Event;
  onGetDirections: () => void;
}

export const LocationSection: React.FC<LocationSectionProps> = ({ event, onGetDirections }) => {
  const hasVenueDetails = event.venue_building_name || event.venue_street || event.venue_city || 
                          event.venue_state || event.venue_zip_code || event.venue_country;

  // Build formatted address from venue details
  const formattedVenueAddress = hasVenueDetails ? [
    event.venue_building_name,
    event.venue_street,
    [event.venue_city, event.venue_state, event.venue_zip_code].filter(Boolean).join(', '),
    event.venue_country
  ].filter(Boolean).join('\n') : null;

  // Use location/address only if it's different from venue details
  const simpleLocation = event.location || event.address;
  const isLocationRedundant = formattedVenueAddress && simpleLocation && 
    simpleLocation.includes(event.venue_street || '') && 
    simpleLocation.includes(event.venue_city || '');

  if (!event.location && !event.address && !hasVenueDetails) {
    return null;
  }

  // Determine which address to use for map
  const mapAddress = formattedVenueAddress || simpleLocation || '';

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
          <div className="flex-1">
            {hasVenueDetails ? (
              // Show structured venue details
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {event.venue_building_name || 'Venue Location'}
                </h3>
                <div className="text-muted-foreground whitespace-pre-line">
                  {formattedVenueAddress}
                </div>
              </div>
            ) : (
              // Show simple location only when no venue details
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground mb-2">Location</h3>
                <p className="text-muted-foreground">{simpleLocation}</p>
              </div>
            )}
            
            {/* Show additional location note only if it's different from venue */}
            {simpleLocation && !isLocationRedundant && !hasVenueDetails && (
              <p className="text-sm text-muted-foreground/80 mb-4">
                {simpleLocation}
              </p>
            )}
            
            <button
              onClick={onGetDirections}
              className="text-primary hover:text-primary/80 font-medium text-sm border-b border-primary/30 hover:border-primary/80 transition-colors"
            >
              Get Directions
            </button>
            
            {/* DEBUG: Coordinates Display */}
            {(event.latitude || event.longitude) && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs font-semibold text-amber-700 mb-1">📍 Debug Coordinates</p>
                <div className="text-xs text-amber-600 font-mono space-y-0.5">
                  <p>Lat: {event.latitude?.toFixed(6)}</p>
                  <p>Lng: {event.longitude?.toFixed(6)}</p>
                  <p>Accuracy: {event.geolocation_accuracy || 'N/A'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-border">
          <iframe
            src={`https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&output=embed`}
            className="w-full h-[300px] border-0"
            loading="lazy"
            title="Event location map"
          />
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
