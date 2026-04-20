import { useState, useEffect, useCallback, useRef } from 'react';

interface CitySuggestion {
  name: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  full_name: string;
}

interface UseNominatimAutocompleteOptions {
  debounceMs?: number;
  minLength?: number;
  limit?: number;
}

const NOMINATIM_API_BASE = 'https://nominatim.openstreetmap.org/search';

/**
 * React hook for city autocomplete using Nominatim (OpenStreetMap) directly from frontend.
 * 
 * FREE - No API key required! Calls OpenStreetMap directly with CORS support.
 * 
 * Features:
 * - Debounced search (300ms default)
 * - Rate limited (1 req/sec) to respect Nominatim policy
 * - Graceful fallback to empty results on errors
 * - No backend calls needed
 * 
 * @example
 * const { suggestions, loading, searchCity, clearSuggestions } = useNominatimAutocomplete();
 * 
 * // In input onChange:
 * searchCity(event.target.value);
 * 
 * // Display suggestions:
 * {suggestions.map(city => <div key={city.full_name}>{city.full_name}</div>)}
 */
export function useNominatimAutocomplete(options: UseNominatimAutocompleteOptions = {}) {
  const { debounceMs = 300, minLength = 2, limit = 5 } = options;
  
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  
  // Track timing for rate limiting (1 req/sec per Nominatim policy)
  const lastRequestTime = useRef<number>(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchCity = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery);
    
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Clear suggestions if query is too short
    if (!searchQuery || searchQuery.length < minLength) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    
    // Debounce the API call
    debounceRef.current = setTimeout(async () => {
      // Rate limiting: ensure at least 1 second between requests
      const now = Date.now();
      const elapsed = now - lastRequestTime.current;
      if (elapsed < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000 - elapsed));
      }
      lastRequestTime.current = Date.now();
      
      setLoading(true);
      
      try {
        const params = new URLSearchParams({
          q: searchQuery,
          format: 'json',
          limit: limit.toString(),
          featuretype: 'city',
          'accept-language': 'en',
          addressdetails: '1',
        });
        
        const response = await fetch(`${NOMINATIM_API_BASE}?${params}`, {
          headers: {
            'User-Agent': 'EventRadius/1.0 (event-discovery-app)',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        // Parse results
        const results: CitySuggestion[] = [];
        const seen = new Set<string>();
        
        for (const item of data) {
          const address = item.address || {};
          
          const city = (
            address.city || 
            address.town || 
            address.village || 
            address.municipality ||
            item.display_name?.split(',')[0].trim()
          );
          
          const state = address.state || '';
          const country = address.country || '';
          
          if (!city) continue;
          
          // Deduplicate
          const key = `${city.toLowerCase()}|${state.toLowerCase()}|${country.toLowerCase()}`;
          if (seen.has(key)) continue;
          seen.add(key);
          
          // Build full name
          const parts = [city];
          if (state && state !== city) parts.push(state);
          if (country) parts.push(country);
          
          results.push({
            name: city,
            state,
            country,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            full_name: parts.join(', '),
          });
        }
        
        setSuggestions(results);
      } catch (err) {
        console.warn('Nominatim autocomplete failed:', err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);
  }, [debounceMs, minLength, limit]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setQuery('');
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    suggestions,
    loading,
    query,
    searchCity,
    clearSuggestions,
  };
}
