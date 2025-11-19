"""Google Maps tool for ADK agents."""

import os
from typing import Dict, Any, List
import googlemaps
from google.genai.types import Tool, FunctionDeclaration

# Initialize Google Maps client
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")
gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY) if GOOGLE_MAPS_API_KEY else None


def search_nearby_places(
    latitude: float,
    longitude: float,
    place_type: str,
    radius: int = 2000
) -> Dict[str, Any]:
    """
    Search for nearby places using Google Maps Places API.

    Args:
        latitude: Latitude of the location
        longitude: Longitude of the location
        place_type: Type of place (school, hospital, supermarket, restaurant, etc.)
        radius: Search radius in meters (default 2000m = 2km)

    Returns:
        Dictionary with nearby places information
    """
    if not gmaps:
        return {
            "success": False,
            "error": "Google Maps API not configured"
        }

    try:
        # Search for nearby places
        result = gmaps.places_nearby(
            location=(latitude, longitude),
            radius=radius,
            type=place_type
        )

        places = []
        for place in result.get('results', [])[:10]:  # Limit to 10 results
            places.append({
                'name': place.get('name'),
                'address': place.get('vicinity'),
                'rating': place.get('rating'),
                'user_ratings_total': place.get('user_ratings_total'),
                'types': place.get('types', [])
            })

        return {
            "success": True,
            "places": places,
            "count": len(places),
            "message": f"Found {len(places)} {place_type}(s) within {radius}m"
        }

    except Exception as e:
        return {
            "success": False,
            "places": [],
            "count": 0,
            "error": str(e)
        }


def get_neighborhood_info(
    latitude: float,
    longitude: float
) -> Dict[str, Any]:
    """
    Get comprehensive neighborhood information including nearby amenities.

    Args:
        latitude: Latitude of the location
        longitude: Longitude of the location

    Returns:
        Dictionary with neighborhood amenities summary
    """
    if not gmaps:
        return {
            "success": False,
            "error": "Google Maps API not configured"
        }

    try:
        # Get reverse geocode for address
        reverse_result = gmaps.reverse_geocode((latitude, longitude))
        address_info = reverse_result[0] if reverse_result else {}

        # Search for different types of amenities
        amenities = {}

        # Schools (within 3km)
        schools = search_nearby_places(latitude, longitude, 'school', radius=3000)
        amenities['schools'] = schools.get('places', [])[:5]

        # Hospitals (within 5km)
        hospitals = search_nearby_places(latitude, longitude, 'hospital', radius=5000)
        amenities['hospitals'] = hospitals.get('places', [])[:3]

        # Supermarkets (within 2km)
        markets = search_nearby_places(latitude, longitude, 'supermarket', radius=2000)
        amenities['supermarkets'] = markets.get('places', [])[:5]

        # Restaurants (within 1km)
        restaurants = search_nearby_places(latitude, longitude, 'restaurant', radius=1000)
        amenities['restaurants'] = restaurants.get('places', [])[:5]

        # Banks (within 2km)
        banks = search_nearby_places(latitude, longitude, 'bank', radius=2000)
        amenities['banks'] = banks.get('places', [])[:3]

        return {
            "success": True,
            "address": address_info.get('formatted_address', ''),
            "amenities": amenities,
            "message": "Neighborhood information retrieved successfully"
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# Define tools for ADK
search_places_declaration = FunctionDeclaration(
    name="search_nearby_places",
    description="""Search for nearby places around a property location using Google Maps.

    Use this to find:
    - Schools and educational institutions
    - Hospitals and medical facilities
    - Supermarkets and shopping centers
    - Restaurants and dining options
    - Banks and ATMs
    - Parks and recreational facilities

    This helps buyers understand the neighborhood and available amenities.""",
    parameters={
        "type": "object",
        "properties": {
            "latitude": {
                "type": "number",
                "description": "Latitude of the property location"
            },
            "longitude": {
                "type": "number",
                "description": "Longitude of the property location"
            },
            "place_type": {
                "type": "string",
                "description": "Type of place to search for",
                "enum": [
                    "school", "hospital", "supermarket", "restaurant",
                    "bank", "atm", "park", "gym", "pharmacy", "gas_station",
                    "shopping_mall", "church", "mosque"
                ]
            },
            "radius": {
                "type": "integer",
                "description": "Search radius in meters (default 2000)",
                "default": 2000
            }
        },
        "required": ["latitude", "longitude", "place_type"]
    }
)

neighborhood_info_declaration = FunctionDeclaration(
    name="get_neighborhood_info",
    description="""Get comprehensive neighborhood information for a property location.

    This retrieves a summary of all nearby amenities including:
    - Top 5 schools within 3km
    - Top 3 hospitals within 5km
    - Top 5 supermarkets within 2km
    - Top 5 restaurants within 1km
    - Top 3 banks within 2km

    Use this to provide buyers with a complete neighborhood overview.""",
    parameters={
        "type": "object",
        "properties": {
            "latitude": {
                "type": "number",
                "description": "Latitude of the property location"
            },
            "longitude": {
                "type": "number",
                "description": "Longitude of the property location"
            }
        },
        "required": ["latitude", "longitude"]
    }
)

# Create Tool objects
google_maps_tool = Tool(
    function_declarations=[search_places_declaration, neighborhood_info_declaration]
)
