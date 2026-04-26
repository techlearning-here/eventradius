import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/integrations/backend/api';

interface CitySuggestion {
  name: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  full_name: string;
}

interface UseCityAutocompleteOptions {
  debounceMs?: number;
  minLength?: number;
  limit?: number;
}

/**
 * React hook for city autocomplete using Photon by Komoot (free, no API key)
 * 
 * Features:
 * - Debounced search as user types
 * - Graceful fallback to empty results on errors
 * - No external API keys required
 * 
 * @example
 * const { suggestions, loading, error, searchCity, clearSuggestions } = useCityAutocomplete();
 * 
 * // In input onChange:
 * searchCity(event.target.value);
 * 
 * // Display suggestions:
 * {suggestions.map(city => <div key={city.full_name}>{city.full_name}</div>)}
 */
export function useCityAutocomplete(options: UseCityAutocompleteOptions = {}) {
  const { debounceMs = 300, minLength = 2, limit = 5 } = options;
  
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  
  // Use ref to track timeout for cleanup
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchCity = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Clear suggestions if query is too short
    if (!searchQuery || searchQuery.length < minLength) {
      setSuggestions([]);
      setLoading(false);
      setError(null);
      return;
    }
    
    // Debounce the API call
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.autocompleteCities(searchQuery, limit);
        setSuggestions(response.cities);
      } catch (err) {
        // Silently fail - don't break the UI
        setSuggestions([]);
        setError(null); // Don't show error to user, just empty results
        console.warn('City autocomplete failed:', err);
      } finally {
        setLoading(false);
      }
    }, debounceMs);
  }, [debounceMs, minLength, limit]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setQuery('');
    setError(null);
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
    error,
    query,
    searchCity,
    clearSuggestions,
  };
}
