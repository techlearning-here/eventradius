"""
Geocoding service for converting addresses to coordinates.
Uses Mapbox Geocoding API for high-accuracy results.
"""

import logging
from typing import Optional, Tuple
from datetime import datetime

import httpx
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class GeocodedLocation(BaseModel):
    """Represents a geocoded location result."""

    latitude: float
    longitude: float
    accuracy: str  # 'rooftop', 'interpolated', 'approximate', 'center'
    formatted_address: str
    place_id: Optional[str] = None
    place_type: Optional[str] = None


class GeocodingService:
    """
    Service for geocoding addresses using Mapbox API.

    Features:
    - Convert structured addresses to lat/lng coordinates
    - Convert freeform address strings to coordinates
    - Rate limiting awareness (600 req/min on free tier)
    - Error handling with fallback strategies

    Cost Optimization:
    - Only geocode on event creation/update (not on read)
    - Skip reverse geocoding (no city name lookups from GPS)
    - Expected usage: ~1,000 requests/month (within free tier)
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the geocoding service.

        Args:
            api_key: Mapbox API key. If not provided, will try to load from env.
        """
        if api_key is None:
            import os

            api_key = os.getenv("MAPBOX_API_KEY")

        if not api_key:
            logger.warning("No Mapbox API key provided - geocoding will fail")

        self.api_key = api_key
        self.base_url = "https://api.mapbox.com/geocoding/v5/mapbox.places"
        self.timeout = 10.0

    async def geocode_address(
        self,
        street: str,
        city: str,
        state: str,
        zip_code: str,
        country: str = "US",
    ) -> Optional[GeocodedLocation]:
        """
        Convert structured address to coordinates.

        Args:
            street: Street address
            city: City name
            state: State/province
            zip_code: Postal code
            country: Country code (default: US)

        Returns:
            GeocodedLocation with lat/lng and accuracy, or None if failed
        """
        # Construct full address query
        address_parts = [p for p in [street, city, state, zip_code, country] if p]
        query = ", ".join(address_parts)

        return await self._geocode_query(query)

    async def geocode_freeform(self, address_text: str) -> Optional[GeocodedLocation]:
        """
        Geocode a freeform address string.

        Args:
            address_text: Full address as a single string

        Returns:
            GeocodedLocation with lat/lng and accuracy, or None if failed
        """
        return await self._geocode_query(address_text)

    async def _geocode_query(self, query: str) -> Optional[GeocodedLocation]:
        """
        Internal method to geocode a query string.

        Args:
            query: Address query string

        Returns:
            GeocodedLocation or None
        """
        if not self.api_key:
            logger.error("Cannot geocode: No Mapbox API key configured")
            return None

        if not query or not query.strip():
            logger.warning("Cannot geocode: Empty query")
            return None

        # URL encode the query
        import urllib.parse

        encoded_query = urllib.parse.quote(query)

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/{encoded_query}.json",
                    params={
                        "access_token": self.api_key,
                        "limit": 1,
                        "types": "address,poi,place",
                    },
                    timeout=self.timeout,
                )
                response.raise_for_status()
                data = response.json()

                if not data.get("features"):
                    logger.warning(f"No geocoding results for address: {query}")
                    return None

                feature = data["features"][0]
                coords = feature["center"]  # [longitude, latitude]

                # Map accuracy from Mapbox to our schema
                accuracy_map = {
                    "rooftop": "exact",
                    "interpolated": "approximate",
                    "approximate": "approximate",
                    "center": "center",
                }

                place_type = feature.get("place_type", ["unknown"])[0]

                return GeocodedLocation(
                    latitude=coords[1],
                    longitude=coords[0],
                    accuracy=accuracy_map.get(feature.get("accuracy"), "approximate"),
                    formatted_address=feature.get("place_name", query),
                    place_id=feature.get("id"),
                    place_type=place_type,
                )

        except httpx.TimeoutException:
            logger.error(f"Geocoding timeout for query: {query}")
            return None
        except httpx.HTTPStatusError as e:
            logger.error(f"Geocoding HTTP error {e.response.status_code}: {e}")
            return None
        except Exception as e:
            logger.error(f"Geocoding failed for '{query}': {e}")
            return None

    async def geocode_batch(
        self, addresses: list[str]
    ) -> list[Optional[GeocodedLocation]]:
        """
        Geocode multiple addresses in batch.
        Note: This makes individual API calls - batch them with delays to respect rate limits.

        Args:
            addresses: List of address strings

        Returns:
            List of GeocodedLocation results (None for failed items)
        """
        import asyncio

        results = []
        for address in addresses:
            result = await self.geocode_freeform(address)
            results.append(result)
            # Rate limiting: 600 req/min = 1 req per 100ms minimum
            await asyncio.sleep(0.1)
        return results


# Singleton instance for app-wide use
_geocoding_service: Optional[GeocodingService] = None


def get_geocoding_service() -> GeocodingService:
    """Get or create the singleton geocoding service instance."""
    global _geocoding_service
    if _geocoding_service is None:
        _geocoding_service = GeocodingService()
    return _geocoding_service


def reset_geocoding_service():
    """Reset the singleton (useful for testing)."""
    global _geocoding_service
    _geocoding_service = None


# Convenience function for quick geocoding
async def geocode_event_address(
    street: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    zip_code: Optional[str] = None,
    country: str = "US",
) -> Optional[GeocodedLocation]:
    """
    Quick geocode function for event addresses.

    Returns:
        GeocodedLocation or None if geocoding fails or no API key
    """
    service = get_geocoding_service()
    return await service.geocode_address(street or "", city or "", state or "", zip_code or "", country)
