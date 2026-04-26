"""
Photon by Komoot Geocoding Service
Free, open-source geocoding and autocomplete service
API: https://photon.komoot.io
No API key required for reasonable usage
"""

import asyncio
import logging
from typing import List, Dict, Optional
import httpx

logger = logging.getLogger(__name__)

PHOTON_API_BASE = "https://photon.komoot.io/api"


class PhotonGeocodingService:
    """
    Free geocoding service using Photon by Komoot.
    Provides city autocomplete and geocoding without API keys.
    """
    
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=10.0)
    
    async def autocomplete_cities(self, query: str, limit: int = 5) -> List[Dict]:
        """
        Autocomplete city names as user types.
        
        Args:
            query: Partial city name (e.g., "San Fra", "New Yo")
            limit: Maximum number of suggestions (default 5)
            
        Returns:
            List of city suggestions with name, state, country, lat, lng
            
        Example:
            Input: "Bost"
            Output: [
                {"name": "Boston", "state": "Massachusetts", "country": "United States", 
                 "lat": 42.3601, "lng": -71.0589, "full_name": "Boston, Massachusetts, United States"}
            ]
        """
        if not query or len(query) < 2:
            return []
        
        try:
            params = {
                "q": query,
                "limit": limit,
                "layer": "city",  # Only cities
                "lang": "en"
            }
            
            logger.info(f"Photon autocomplete: {query}")
            
            response = await self.client.get(PHOTON_API_BASE, params=params)
            response.raise_for_status()
            
            data = response.json()
            features = data.get("features", [])
            
            results = []
            seen = set()  # Deduplicate
            
            for feature in features:
                props = feature.get("properties", {})
                geom = feature.get("geometry", {})
                coords = geom.get("coordinates", [0, 0])
                
                # Extract location data
                name = props.get("name", "")
                city = props.get("city", name)
                state = props.get("state", "")
                country = props.get("country", "")
                
                if not city:
                    continue
                
                # Create unique key for deduplication
                key = f"{city.lower()}|{state.lower()}|{country.lower()}"
                if key in seen:
                    continue
                seen.add(key)
                
                # Photon returns [lng, lat]
                lng, lat = coords[0], coords[1]
                
                # Build full display name
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
                    "lat": lat,
                    "lng": lng,
                    "full_name": full_name
                })
            
            logger.info(f"Photon found {len(results)} cities for '{query}'")
            return results
            
        except httpx.TimeoutException:
            logger.warning(f"Photon timeout for query: {query}")
            return []
        except Exception as e:
            logger.error(f"Photon autocomplete error: {e}")
            return []
    
    async def geocode_city(self, city_name: str) -> Optional[Dict]:
        """
        Geocode a specific city name to coordinates.
        Used when user selects from autocomplete or enters full city name.
        
        Args:
            city_name: Full city name (e.g., "San Francisco, CA")
            
        Returns:
            City data with coordinates or None if not found
        """
        try:
            results = await self.autocomplete_cities(city_name, limit=1)
            return results[0] if results else None
        except Exception as e:
            logger.error(f"Photon geocode error: {e}")
            return None
    
    async def close(self):
        """Close HTTP client."""
        await self.client.aclose()


# Singleton instance
photon_service = PhotonGeocodingService()


# Convenience functions
async def autocomplete_cities(query: str, limit: int = 5) -> List[Dict]:
    """Autocomplete cities using Photon."""
    return await photon_service.autocomplete_cities(query, limit)


async def geocode_city(city_name: str) -> Optional[Dict]:
    """Geocode a city name using Photon."""
    return await photon_service.geocode_city(city_name)
