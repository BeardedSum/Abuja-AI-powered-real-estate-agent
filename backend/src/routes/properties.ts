import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Property, PropertyType, PropertyStatus } from '../entities/Property';
import { PropertyMedia } from '../entities/PropertyMedia';
import { Between, In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import logger from '../config/logger';
import mapsService from '../services/maps';

const router = Router();

// Search properties
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      property_type,
      min_price,
      max_price,
      bedrooms,
      bathrooms,
      neighborhood,
      status,
      limit = '20',
      offset = '0',
    } = req.query;

    const propertyRepository = AppDataSource.getRepository(Property);

    const queryBuilder = propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.media', 'media')
      .where('1=1');

    // Filter by property type
    if (property_type) {
      queryBuilder.andWhere('property.property_type = :property_type', { property_type });
    }

    // Filter by price range
    if (min_price && max_price) {
      queryBuilder.andWhere('property.price BETWEEN :min_price AND :max_price', {
        min_price: parseFloat(min_price as string),
        max_price: parseFloat(max_price as string),
      });
    } else if (min_price) {
      queryBuilder.andWhere('property.price >= :min_price', {
        min_price: parseFloat(min_price as string),
      });
    } else if (max_price) {
      queryBuilder.andWhere('property.price <= :max_price', {
        max_price: parseFloat(max_price as string),
      });
    }

    // Filter by bedrooms
    if (bedrooms) {
      queryBuilder.andWhere('property.bedrooms >= :bedrooms', {
        bedrooms: parseInt(bedrooms as string),
      });
    }

    // Filter by bathrooms
    if (bathrooms) {
      queryBuilder.andWhere('property.bathrooms >= :bathrooms', {
        bathrooms: parseInt(bathrooms as string),
      });
    }

    // Filter by neighborhood
    if (neighborhood) {
      queryBuilder.andWhere('LOWER(property.neighborhood) LIKE LOWER(:neighborhood)', {
        neighborhood: `%${neighborhood}%`,
      });
    }

    // Filter by status
    queryBuilder.andWhere('property.status = :status', {
      status: status || PropertyStatus.AVAILABLE,
    });

    // Pagination
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);
    queryBuilder.skip(offsetNum).take(limitNum);

    // Order by created date
    queryBuilder.orderBy('property.created_at', 'DESC');

    const [properties, total] = await queryBuilder.getManyAndCount();

    logger.info('Property search completed', {
      filters: { property_type, min_price, max_price, bedrooms, neighborhood },
      resultsCount: properties.length,
      total,
    });

    res.json({
      properties,
      total,
      limit: limitNum,
      offset: offsetNum,
    });
  } catch (error: any) {
    logger.error('Failed to search properties', { error: error.message });
    res.status(500).json({ error: 'Failed to search properties' });
  }
});

// Get property by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const propertyRepository = AppDataSource.getRepository(Property);
    const property = await propertyRepository.findOne({
      where: { id },
      relations: ['media'],
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Get neighborhood amenities
    try {
      const amenities = await mapsService.getNeighborhoodAmenities({
        lat: parseFloat(property.latitude.toString()),
        lng: parseFloat(property.longitude.toString()),
      });

      logger.info('Retrieved property with amenities', { propertyId: id });

      res.json({
        ...property,
        amenities,
      });
    } catch (error) {
      logger.warn('Failed to get amenities for property', { propertyId: id });
      // Return property without amenities
      res.json(property);
    }
  } catch (error: any) {
    logger.error('Failed to get property', { error: error.message, propertyId: req.params.id });
    res.status(500).json({ error: 'Failed to get property' });
  }
});

// Create property (admin endpoint)
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      price,
      neighborhood,
      address,
      bedrooms,
      bathrooms,
      size_sqm,
      property_type,
      features,
      documents,
      media,
      agent_contact,
    } = req.body;

    // Geocode the address
    let latitude = req.body.latitude;
    let longitude = req.body.longitude;

    if (!latitude || !longitude) {
      try {
        const fullAddress = `${address}, ${neighborhood}, Abuja, Nigeria`;
        const geocodeResult = await mapsService.geocode(fullAddress);
        latitude = geocodeResult.geometry.location.lat;
        longitude = geocodeResult.geometry.location.lng;
      } catch (error) {
        logger.warn('Failed to geocode address, using default Abuja coordinates');
        latitude = 9.0765;
        longitude = 7.3986;
      }
    }

    const propertyRepository = AppDataSource.getRepository(Property);
    const property = propertyRepository.create({
      title,
      description,
      price,
      neighborhood,
      address,
      latitude,
      longitude,
      bedrooms,
      bathrooms,
      size_sqm,
      property_type,
      features: features || [],
      documents: documents || {},
      agent_contact,
      status: PropertyStatus.AVAILABLE,
    });

    await propertyRepository.save(property);

    // Create media entries
    if (media && media.length > 0) {
      const propertyMediaRepository = AppDataSource.getRepository(PropertyMedia);
      for (let i = 0; i < media.length; i++) {
        const mediaItem = media[i];
        const propertyMedia = propertyMediaRepository.create({
          property_id: property.id,
          media_type: mediaItem.media_type,
          url: mediaItem.url,
          order: i,
          caption: mediaItem.caption,
        });
        await propertyMediaRepository.save(propertyMedia);
      }
    }

    logger.info('Property created', { propertyId: property.id });

    // Fetch the complete property with media
    const createdProperty = await propertyRepository.findOne({
      where: { id: property.id },
      relations: ['media'],
    });

    res.status(201).json(createdProperty);
  } catch (error: any) {
    logger.error('Failed to create property', { error: error.message });
    res.status(500).json({ error: 'Failed to create property' });
  }
});

// Update property status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(PropertyStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const propertyRepository = AppDataSource.getRepository(Property);
    const property = await propertyRepository.findOne({ where: { id } });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    property.status = status;
    await propertyRepository.save(property);

    logger.info('Property status updated', { propertyId: id, status });

    res.json(property);
  } catch (error: any) {
    logger.error('Failed to update property status', {
      error: error.message,
      propertyId: req.params.id,
    });
    res.status(500).json({ error: 'Failed to update property status' });
  }
});

// Get nearby properties
router.get('/:id/nearby', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { radius = '2000', limit = '5' } = req.query;

    const propertyRepository = AppDataSource.getRepository(Property);
    const property = await propertyRepository.findOne({ where: { id } });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Calculate distance using Haversine formula in SQL
    const radiusInKm = parseInt(radius as string) / 1000;
    const nearbyProperties = await propertyRepository
      .createQueryBuilder('property')
      .where('property.id != :id', { id })
      .andWhere('property.status = :status', { status: PropertyStatus.AVAILABLE })
      .andWhere(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(property.latitude)) * cos(radians(property.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(property.latitude)))) <= :radius`,
        {
          lat: parseFloat(property.latitude.toString()),
          lng: parseFloat(property.longitude.toString()),
          radius: radiusInKm,
        }
      )
      .leftJoinAndSelect('property.media', 'media')
      .take(parseInt(limit as string))
      .getMany();

    logger.info('Retrieved nearby properties', {
      propertyId: id,
      nearbyCount: nearbyProperties.length,
    });

    res.json(nearbyProperties);
  } catch (error: any) {
    logger.error('Failed to get nearby properties', {
      error: error.message,
      propertyId: req.params.id,
    });
    res.status(500).json({ error: 'Failed to get nearby properties' });
  }
});

export default router;
