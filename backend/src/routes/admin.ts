import { Router, Request, Response } from 'express';
import { requireApiKey } from '../middleware/auth';
import analyticsService from '../services/analytics';
import paymentService from '../services/payment';
import logger from '../config/logger';
import { AppDataSource } from '../config/database';
import { Property } from '../entities/Property';
import { User } from '../entities/User';
import { Showing } from '../entities/Showing';
import { Offer } from '../entities/Offer';

const router = Router();

// All admin routes require API key
router.use(requireApiKey);

// Dashboard statistics
router.get('/dashboard/stats', async (req: Request, res: Response) => {
  try {
    const [platformStats, engagement, revenue, funnel, neighborhoods] = await Promise.all([
      analyticsService.getPlatformStats(),
      analyticsService.getUserEngagement(7),
      analyticsService.getRevenueMetrics(),
      analyticsService.getConversionFunnel(),
      analyticsService.getPopularNeighborhoods(10),
    ]);

    logger.info('Admin dashboard stats retrieved');

    res.json({
      platform: platformStats,
      engagement,
      revenue,
      conversion_funnel: funnel,
      popular_neighborhoods: neighborhoods,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Failed to get dashboard stats', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve dashboard statistics' });
  }
});

// Get all properties (with pagination)
router.get('/properties', async (req: Request, res: Response) => {
  try {
    const { limit = '50', offset = '0', status } = req.query;

    const propertyRepository = AppDataSource.getRepository(Property);

    const queryBuilder = propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.media', 'media')
      .orderBy('property.created_at', 'DESC')
      .skip(parseInt(offset as string))
      .take(parseInt(limit as string));

    if (status) {
      queryBuilder.where('property.status = :status', { status });
    }

    const [properties, total] = await queryBuilder.getManyAndCount();

    res.json({ properties, total, limit: parseInt(limit as string), offset: parseInt(offset as string) });
  } catch (error: any) {
    logger.error('Failed to get properties', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve properties' });
  }
});

// Get all users (with pagination)
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { limit = '50', offset = '0' } = req.query;

    const userRepository = AppDataSource.getRepository(User);

    const [users, total] = await userRepository.findAndCount({
      order: { created_at: 'DESC' },
      skip: parseInt(offset as string),
      take: parseInt(limit as string),
    });

    res.json({ users, total, limit: parseInt(limit as string), offset: parseInt(offset as string) });
  } catch (error: any) {
    logger.error('Failed to get users', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// Get recent showings
router.get('/showings/recent', async (req: Request, res: Response) => {
  try {
    const { limit = '20' } = req.query;

    const showingRepository = AppDataSource.getRepository(Showing);

    const showings = await showingRepository.find({
      relations: ['property', 'user'],
      order: { created_at: 'DESC' },
      take: parseInt(limit as string),
    });

    res.json(showings);
  } catch (error: any) {
    logger.error('Failed to get recent showings', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve showings' });
  }
});

// Get recent offers
router.get('/offers/recent', async (req: Request, res: Response) => {
  try {
    const { limit = '20' } = req.query;

    const offerRepository = AppDataSource.getRepository(Offer);

    const offers = await offerRepository.find({
      relations: ['property', 'user'],
      order: { created_at: 'DESC' },
      take: parseInt(limit as string),
    });

    res.json(offers);
  } catch (error: any) {
    logger.error('Failed to get recent offers', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve offers' });
  }
});

// Calculate payment plan for a property
router.post('/payment/calculate', async (req: Request, res: Response) => {
  try {
    const { property_price, down_payment_percentage } = req.body;

    if (!property_price || property_price <= 0) {
      return res.status(400).json({ error: 'Valid property price is required' });
    }

    const paymentPlan = paymentService.createPaymentPlan(
      property_price,
      down_payment_percentage || 30
    );

    res.json(paymentPlan);
  } catch (error: any) {
    logger.error('Failed to calculate payment plan', { error: error.message });
    res.status(500).json({ error: 'Failed to calculate payment plan' });
  }
});

// Update property status (admin override)
router.patch('/properties/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const propertyRepository = AppDataSource.getRepository(Property);
    const property = await propertyRepository.findOne({ where: { id } });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    property.status = status;
    await propertyRepository.save(property);

    logger.info('Property status updated by admin', { propertyId: id, status, notes });

    res.json(property);
  } catch (error: any) {
    logger.error('Failed to update property status', { error: error.message });
    res.status(500).json({ error: 'Failed to update property status' });
  }
});

// Export data (CSV)
router.get('/export/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;

    let data: any[];
    let filename: string;

    switch (type) {
      case 'properties':
        data = await AppDataSource.getRepository(Property).find();
        filename = 'properties.csv';
        break;
      case 'users':
        data = await AppDataSource.getRepository(User).find();
        filename = 'users.csv';
        break;
      case 'showings':
        data = await AppDataSource.getRepository(Showing).find({ relations: ['property', 'user'] });
        filename = 'showings.csv';
        break;
      case 'offers':
        data = await AppDataSource.getRepository(Offer).find({ relations: ['property', 'user'] });
        filename = 'offers.csv';
        break;
      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }

    // TODO: Convert to CSV format
    // For now, return JSON
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.json`);
    res.json(data);
  } catch (error: any) {
    logger.error('Failed to export data', { error: error.message, type: req.params.type });
    res.status(500).json({ error: 'Failed to export data' });
  }
});

export default router;
