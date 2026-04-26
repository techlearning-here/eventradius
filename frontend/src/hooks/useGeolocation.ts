import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  permission: 'granted' | 'denied' | 'prompt' | 'unknown';
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  onLocationUpdate?: (lat: number, lng: number) => void;
}

/**
 * React hook for browser geolocation.
 * 
 * IMPORTANT: This hook uses browser geolocation ONLY (GPS/WiFi/IP-based).
 * No Mapbox API calls from frontend - all geocoding happens on backend.
 * 
 * Cost Optimization:
 * - Frontend: 0 API calls (browser geolocation is free)
 * - Backend: Only geocodes event addresses on creation (~1,000/month)
 * 
 * @example
 * const { latitude, longitude, loading, error, requestLocation } = useGeolocation();
 * 
 * // Get location on button click
 * <button onClick={requestLocation}>Get My Location</button>
 * 
 * // Auto-get location on mount
 * const { latitude, longitude } = useGeolocation({ onLocationUpdate: handleLocation });
 */
export function useGeolocation(options: UseGeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: false,
    error: null,
    permission: 'unknown',
  });

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocation not supported by this browser' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Check permission state first (if supported)
      if ('permissions' in navigator) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          setState(prev => ({ ...prev, permission: result.state as GeolocationState['permission'] }));
          
          if (result.state === 'denied') {
            setState(prev => ({ 
              ...prev, 
              loading: false, 
              error: 'Location permission denied. Please enable in browser settings.' 
            }));
            return;
          }
        } catch {
          // Some browsers don't support querying geolocation permission
          // Continue anyway - getCurrentPosition will handle it
        }
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          // IMPORTANT: No reverse geocoding here!
          // We send raw GPS coordinates to backend.
          // City names would require Mapbox/Google API calls - skipped to save costs.
          
          setState({
            latitude,
            longitude,
            accuracy,
            loading: false,
            error: null,
            permission: 'granted',
          });

          options.onLocationUpdate?.(latitude, longitude);
        },
        (error) => {
          let errorMessage = 'Failed to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please try again.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
          }
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            error: errorMessage,
            permission: 'denied'
          }));
        },
        {
          enableHighAccuracy: options.enableHighAccuracy ?? true,
          timeout: options.timeout ?? 10000,
          maximumAge: options.maximumAge ?? 300000, // 5 minutes cache
        }
      );
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to access geolocation' 
      }));
    }
  }, [options.onLocationUpdate, options.enableHighAccuracy, options.timeout, options.maximumAge]);

  // Auto-request on mount if onLocationUpdate is provided
  useEffect(() => {
    if (options.onLocationUpdate && state.permission === 'unknown' && !state.loading) {
      requestLocation();
    }
  }, []);

  return {
    ...state,
    requestLocation,
    hasLocation: state.latitude !== null && state.longitude !== null,
  };
}

/**
 * Format distance for display.
 * Converts km to human-readable format.
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  if (km < 10) {
    return `${km.toFixed(1)} km`;
  }
  return `${Math.round(km)} km`;
}

/**
 * Calculate rough distance between two points (for client-side estimates).
 * Note: For accurate distances, use backend's Haversine calculation.
 */
export function estimateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  // Simple Euclidean distance (sufficient for rough estimates)
  // 1 degree lat ≈ 111 km
  const latDiff = (lat2 - lat1) * 111;
  const lngDiff = (lng2 - lng1) * 111 * Math.cos(lat1 * Math.PI / 180);
  return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
}
