"""
Nominatim Geocoding Service (OpenStreetMap)
Free geocoding and autocomplete - no API key required for low volume
Policy: https://operations.osmfoundation.org/policies/nominatim/
- Max 1 request per second
- Must provide User-Agent
- Free for reasonable usage (educational/non-commercial)
"""

import asyncio
import logging
from typing import List, Dict, Optional
import httpx

logger = logging.getLogger(__name__)

NOMINATIM_API_BASE = "https://nominatim.openstreetmap.org"


class NominatimGeocodingService:
    """
    Free geocoding service using OpenStreetMap's Nominatim.
    Provides city autocomplete and geocoding without API keys.
    
    Rate limit: 1 request per second
    """
    
    def __init__(self):
        # Nominatim requires a User-Agent identifying the application
        self.client = httpx.AsyncClient(
            timeout=10.0,
            headers={
                "User-Agent": "EventRadius/1.0 (event-discovery-app)"
            }
        )
        self._last_request_time = 0
    
    async def _rate_limit(self):
        """Ensure 1 second between requests (Nominatim policy)"""
        import time
        elapsed = time.time() - self._last_request_time
        if elapsed < 1.0:
            await asyncio.sleep(1.0 - elapsed)
        self._last_request_time = time.time()
    
    async def autocomplete_cities(self, query: str, limit: int = 5) -> List[Dict]:
        """
        Search for cities using Nominatim.
        
        Args:
            query: Partial city name (e.g., "San Fra", "New Yo")
            limit: Maximum number of suggestions
            
        Returns:
            List of city suggestions with name, state, country, lat, lng
        """
        if not query or len(query) < 2:
            return []
        
        await self._rate_limit()
        
        try:
            # Use search endpoint with city filter
            params = {
                "q": query,
                "format": "json",
                "limit": limit,
                "featuretype": "city",  # Only cities
                "accept-language": "en",
                "addressdetails": 1,  # Include address components
            }
            
            logger.info(f"Nominatim search: {query}")
            
            response = await self.client.get(
                f"{NOMINATIM_API_BASE}/search",
                params=params
            )
            response.raise_for_status()
            
            data = response.json()
            results = []
            seen = set()
            
            for item in data:
                address = item.get("address", {})
                
                # Extract city name - try different fields
                city = (
                    address.get("city") or 
                    address.get("town") or 
                    address.get("village") or 
                    address.get("municipality") or
                    item.get("display_name", "").split(",")[0].strip()
                )
                
                state = address.get("state", "")
                country = address.get("country", "")
                
                if not city:
                    continue
                
                # Deduplicate
                key = f"{city.lower()}|{state.lower()}|{country.lower()}"
                if key in seen:
                    continue
                seen.add(key)
                
                # Build display name
                parts = [city]
                if state and state != city:
                    parts.append(state)
                if country:
                    parts.append(country)
                full_name = ", ".join(parts)
                
                results.append({
                    "name": city,
                    "state": state,
                    "country": country,
                    "lat": float(item.get("lat", 0)),
                    "lng": float(item.get("lon", 0)),
                    "full_name": full_name
                })
            
            logger.info(f"Nominatim found {len(results)} cities for '{query}'")
            return results[:limit]
            
        except httpx.TimeoutException:
            logger.warning(f"Nominatim timeout for query: {query}")
            return []
        except Exception as e:
            logger.error(f"Nominatim autocomplete error: {e}")
            return []
    
    async def geocode_city(self, city_name: str) -> Optional[Dict]:
        """
        Geocode a specific city name to coordinates.
        
        Args:
            city_name: Full city name (e.g., "San Francisco, CA")
            
        Returns:
            City data with coordinates or None if not found
        """
        try:
            results = await self.autocomplete_cities(city_name, limit=1)
            return results[0] if results else None
        except Exception as e:
            logger.error(f"Nominatim geocode error: {e}")
            return None
    
    async def close(self):
        """Close HTTP client."""
        await self.client.aclose()


# Singleton instance
nominatim_service = NominatimGeocodingService()


# Convenience functions
async def autocomplete_cities(query: str, limit: int = 5) -> List[Dict]:
    """Autocomplete cities using Nominatim."""
    return await nominatim_service.autocomplete_cities(query, limit)


async def geocode_city(city_name: str) -> Optional[Dict]:
    """Geocode a city name using Nominatim."""
    return await nominatim_service.geocode_city(city_name)
