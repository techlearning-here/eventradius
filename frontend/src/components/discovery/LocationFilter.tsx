import React from 'react';
import { MapPin, Crosshair, Settings2, Navigation } from 'lucide-react';
import { useGeolocation, formatDistance } from '@/hooks/useGeolocation';

interface LocationFilterProps {
  radius: number;
  onRadiusChange: (radius: number) => void;
  onLocationChange: (lat: number, lng: number) => void;
  userLatitude?: number | null;
  userLongitude?: number | null;
  className?: string;
}

const RADIUS_OPTIONS = [
  { value: 5, label: '5 km', description: 'Walking distance' },
  { value: 10, label: '10 km', description: 'Nearby' },
  { value: 25, label: '25 km', description: 'City area' },
  { value: 50, label: '50 km', description: 'Metro area' },
  { value: 100, label: '100 km', description: 'Day trip' },
];

/**
 * Location filter component for event discovery.
 * 
 * Uses browser geolocation (no Mapbox API calls from frontend).
 * Sends raw GPS coordinates to backend for radius-based event search.
 * 
 * UX Note: Displays "near your location" instead of city names to avoid
 * reverse geocoding API calls (cost optimization).
 */
export function LocationFilter({
  radius,
  onRadiusChange,
  onLocationChange,
  userLatitude,
  userLongitude,
  className = '',
}: LocationFilterProps) {
  const {
    latitude,
    longitude,
    accuracy,
    loading,
    error,
    permission,
    requestLocation,
    hasLocation,
  } = useGeolocation({
    onLocationUpdate: onLocationChange,
  });

  // Use provided location if available, otherwise use hook state
  const effectiveLat = userLatitude ?? latitude;
  const effectiveLng = userLongitude ?? longitude;
  const hasEffectiveLocation = effectiveLat !== null && effectiveLng !== null;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Location
        </h3>
        <button
          onClick={requestLocation}
          disabled={loading}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
        >
          <Crosshair className="w-4 h-4" />
          {loading ? 'Detecting...' : hasEffectiveLocation ? 'Update' : 'Detect'}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Location status */}
      {hasEffectiveLocation ? (
        <div className="flex items-start gap-3 bg-green-50 p-3 rounded-md">
          <Navigation className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800">
              Showing events near your location
            </p>
            {accuracy && (
              <p className="text-xs text-green-600 mt-1">
                Accuracy: {formatDistance(accuracy / 1000)}
              </p>
            )}
          </div>
        </div>
      ) : permission === 'denied' ? (
        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
          Location access denied. Enable in browser settings to see nearby events.
        </div>
      ) : (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
          Enable location to discover events near you.
        </div>
      )}

      {/* Radius selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-gray-500" />
          Search radius
        </label>
        <div className="grid grid-cols-3 gap-2">
          {RADIUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onRadiusChange(option.value)}
              disabled={!hasEffectiveLocation && option.value !== radius}
              className={`p-2 text-sm rounded-lg border transition-all ${
                radius === option.value
                  ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                  : hasEffectiveLocation
                  ? 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                  : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* CTA button when no location */}
      {!hasEffectiveLocation && permission !== 'denied' && (
        <button
          onClick={requestLocation}
          disabled={loading}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Getting location...
            </>
          ) : (
            <>
              <Crosshair className="w-4 h-4" />
              Enable location for nearby events
            </>
          )}
        </button>
      )}
    </div>
  );
}
