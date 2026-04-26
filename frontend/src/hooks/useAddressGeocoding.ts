import { useState, useCallback, useRef } from 'react';

interface GeocodedAddress {
  latitude: number;
  longitude: number;
  accuracy: string;
  formatted_address: string;
}

interface UseAddressGeocodingOptions {
  debounceMs?: number;
}

const NOMINATIM_API_BASE = 'https://nominatim.openstreetmap.org/search';

/**
 * React hook for geocoding street addresses using Nominatim (OpenStreetMap) directly from frontend.
 * 
 * FREE - No API key required! Calls OpenStreetMap directly with CORS support.
 * 
 * Features:
 * - Rate limited (1 req/sec) to respect Nominatim policy
 * - Debounced to prevent excessive API calls
 * - Returns coordinates, accuracy, and formatted address
 * - No backend calls needed
 * 
 * @example
 * const { geocodeAddress, loading, result, error } = useAddressGeocoding();
 * 
 * // Geocode an address:
 * await geocodeAddress({
 *   street: "123 Main St",
 *   city: "Boston",
 *   state: "MA",
 *   zipCode: "02101"
 * });
 * 
 * // result will be: { latitude, longitude, accuracy, formatted_address }
 */
export function useAddressGeocoding(options: UseAddressGeocodingOptions = {}) {
  const { debounceMs = 300 } = options;
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeocodedAddress | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Track timing for rate limiting (1 req/sec per Nominatim policy)
  const lastRequestTime = useRef<number>(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const geocodeAddress = useCallback(async ({
    street,
    city,
    state,
    zipCode,
    country = 'US',
    address, // Full address string as fallback
  }: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    address?: string; // Full address string (e.g., "123 Main St, Boston, MA")
  }): Promise<GeocodedAddress | null> => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Use address as fallback, or require at least street or city
    const query = address || (street && city ? `${street}, ${city}` : street || city);
    
    if (!query) {
      setError('Address is required for geocoding');
      return null;
    }
    
    return new Promise((resolve) => {
      debounceRef.current = setTimeout(async () => {
        // Rate limiting: ensure at least 1 second between requests
        const now = Date.now();
        const elapsed = now - lastRequestTime.current;
        if (elapsed < 1000) {
          await new Promise(r => setTimeout(r, 1000 - elapsed));
        }
        lastRequestTime.current = Date.now();
        
        setLoading(true);
        setError(null);
        
        try {
          // Build query string from available components (if individual parts provided)
          let finalQuery = query;
          if (!finalQuery && (street || city || state || zipCode)) {
            const parts = [street, city, state, zipCode].filter(Boolean);
            finalQuery = parts.join(', ');
          }
          
          if (!finalQuery) {
            setError('No address to geocode');
            setResult(null);
            resolve(null);
            return;
          }
          
          const params = new URLSearchParams({
            q: finalQuery,
            format: 'json',
            limit: '1',
            addressdetails: '1',
            'accept-language': 'en',
          });
          
          console.log('[useAddressGeocoding] Geocoding:', finalQuery);
          
          const response = await fetch(`${NOMINATIM_API_BASE}?${params}`, {
            headers: {
              'User-Agent': 'EventRadius/1.0 (event-discovery-app)',
            },
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          const data = await response.json();
          
          if (!data || data.length === 0) {
            console.warn('[useAddressGeocoding] No results for:', query);
            setError('Address not found');
            setResult(null);
            resolve(null);
            return;
          }
          
          const item = data[0];
          
          // Determine accuracy based on place type
          const placeType = item.type || '';
          let accuracy: string;
          
          if (placeType === 'house' || placeType === 'building') {
            accuracy = 'rooftop';
          } else if (placeType === 'street') {
            accuracy = 'interpolated';
          } else if (placeType === 'suburb' || placeType === 'neighbourhood') {
            accuracy = 'approximate';
          } else {
            accuracy = 'center';
          }
          
          const geocoded: GeocodedAddress = {
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            accuracy,
            formatted_address: item.display_name || query,
          };
          
          console.log('[useAddressGeocoding] Result:', geocoded);
          
          setResult(geocoded);
          setError(null);
          resolve(geocoded);
        } catch (err) {
          console.error('[useAddressGeocoding] Error:', err);
          setError('Geocoding failed');
          setResult(null);
          resolve(null);
        } finally {
          setLoading(false);
        }
      }, debounceMs);
    });
  }, [debounceMs]);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  return {
    geocodeAddress,
    loading,
    result,
    error,
    clearResult,
  };
}
