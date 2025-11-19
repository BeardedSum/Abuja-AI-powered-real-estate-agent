import { Client, PlaceInputType } from '@googlemaps/google-maps-services-js';
import logger from '../config/logger';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

export class MapsService {
  private client: Client;
  private apiKey: string;

  constructor() {
    this.client = new Client({});
    this.apiKey = GOOGLE_MAPS_API_KEY;
  }

  async searchPlaces(query: string, location?: { lat: number; lng: number }) {
    try {
      const response = await this.client.textSearch({
        params: {
          query,
          key: this.apiKey,
          location: location ? `${location.lat},${location.lng}` : '9.0765,7.3986', // Abuja coordinates
          radius: 5000, // 5km radius
        },
      });

      logger.info('Google Maps place search completed', { query, resultsCount: response.data.results.length });
      return response.data.results;
    } catch (error: any) {
      logger.error('Failed to search places', {
        error: error.message,
        query,
      });
      throw error;
    }
  }

  async getNearbyPlaces(
    location: { lat: number; lng: number },
    type: string,
    radius: number = 2000
  ) {
    try {
      const response = await this.client.placesNearby({
        params: {
          location: `${location.lat},${location.lng}`,
          radius,
          type,
          key: this.apiKey,
        },
      });

      logger.info('Google Maps nearby places search completed', {
        location,
        type,
        resultsCount: response.data.results.length,
      });
      return response.data.results;
    } catch (error: any) {
      logger.error('Failed to get nearby places', {
        error: error.message,
        location,
        type,
      });
      throw error;
    }
  }

  async getPlaceDetails(placeId: string) {
    try {
      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          key: this.apiKey,
          fields: [
            'name',
            'formatted_address',
            'geometry',
            'rating',
            'user_ratings_total',
            'types',
            'photos',
          ],
        },
      });

      logger.info('Google Maps place details retrieved', { placeId });
      return response.data.result;
    } catch (error: any) {
      logger.error('Failed to get place details', {
        error: error.message,
        placeId,
      });
      throw error;
    }
  }

  async geocode(address: string) {
    try {
      const response = await this.client.geocode({
        params: {
          address,
          key: this.apiKey,
        },
      });

      if (response.data.results.length === 0) {
        throw new Error('No results found for address');
      }

      logger.info('Geocoding completed', { address });
      return response.data.results[0];
    } catch (error: any) {
      logger.error('Failed to geocode address', {
        error: error.message,
        address,
      });
      throw error;
    }
  }

  async reverseGeocode(lat: number, lng: number) {
    try {
      const response = await this.client.reverseGeocode({
        params: {
          latlng: `${lat},${lng}`,
          key: this.apiKey,
        },
      });

      if (response.data.results.length === 0) {
        throw new Error('No results found for coordinates');
      }

      logger.info('Reverse geocoding completed', { lat, lng });
      return response.data.results[0];
    } catch (error: any) {
      logger.error('Failed to reverse geocode', {
        error: error.message,
        lat,
        lng,
      });
      throw error;
    }
  }

  async getDirections(origin: string, destination: string, mode: string = 'driving') {
    try {
      const response = await this.client.directions({
        params: {
          origin,
          destination,
          mode: mode as any,
          key: this.apiKey,
        },
      });

      logger.info('Directions retrieved', { origin, destination, mode });
      return response.data.routes[0];
    } catch (error: any) {
      logger.error('Failed to get directions', {
        error: error.message,
        origin,
        destination,
      });
      throw error;
    }
  }

  // Helper: Get neighborhood amenities summary
  async getNeighborhoodAmenities(location: { lat: number; lng: number }) {
    try {
      const [schools, hospitals, markets, restaurants] = await Promise.all([
        this.getNearbyPlaces(location, 'school', 3000),
        this.getNearbyPlaces(location, 'hospital', 5000),
        this.getNearbyPlaces(location, 'supermarket', 2000),
        this.getNearbyPlaces(location, 'restaurant', 1000),
      ]);

      return {
        schools: schools.slice(0, 5),
        hospitals: hospitals.slice(0, 3),
        markets: markets.slice(0, 5),
        restaurants: restaurants.slice(0, 5),
      };
    } catch (error: any) {
      logger.error('Failed to get neighborhood amenities', {
        error: error.message,
        location,
      });
      throw error;
    }
  }
}

export default new MapsService();
