import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Showing, ShowingStatus } from '../entities/Showing';
import { Property } from '../entities/Property';
import { User } from '../entities/User';
import logger from '../config/logger';
import whatsappService from '../services/whatsapp';
import mapsService from '../services/maps';

const router = Router();

// Create showing
router.post('/', async (req: Request, res: Response) => {
  try {
    const { property_id, user_id, scheduled_at, notes } = req.body;

    if (!property_id || !user_id || !scheduled_at) {
      return res.status(400).json({
        error: 'Missing required fields: property_id, user_id, scheduled_at',
      });
    }

    const showingRepository = AppDataSource.getRepository(Showing);
    const propertyRepository = AppDataSource.getRepository(Property);
    const userRepository = AppDataSource.getRepository(User);

    // Verify property exists
    const property = await propertyRepository.findOne({ where: { id: property_id } });
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Verify user exists
    const user = await userRepository.findOne({ where: { id: user_id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create showing
    const showing = showingRepository.create({
      property_id,
      user_id,
      scheduled_at: new Date(scheduled_at),
      notes,
      status: ShowingStatus.SCHEDULED,
    });

    await showingRepository.save(showing);

    logger.info('Showing created', {
      showingId: showing.id,
      propertyId: property_id,
      userId: user_id,
    });

    // Send WhatsApp confirmation
    try {
      const scheduledDate = new Date(scheduled_at);
      const formattedDate = scheduledDate.toLocaleString('en-NG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const confirmationMessage = `✅ Your property viewing has been scheduled!\n\n🏠 Property: ${property.title}\n📅 Date & Time: ${formattedDate}\n📍 Location: ${property.address}, ${property.neighborhood}\n\nYou will receive a reminder 24 hours and 1 hour before the showing.`;

      await whatsappService.sendTextMessage(user.phone_number, confirmationMessage);

      // Send location
      await whatsappService.sendLocationMessage(
        user.phone_number,
        parseFloat(property.latitude.toString()),
        parseFloat(property.longitude.toString()),
        property.title,
        `${property.address}, ${property.neighborhood}`
      );
    } catch (error: any) {
      logger.warn('Failed to send WhatsApp confirmation', {
        error: error.message,
        showingId: showing.id,
      });
    }

    // Return showing with relations
    const createdShowing = await showingRepository.findOne({
      where: { id: showing.id },
      relations: ['property', 'user'],
    });

    res.status(201).json(createdShowing);
  } catch (error: any) {
    logger.error('Failed to create showing', { error: error.message });
    res.status(500).json({ error: 'Failed to create showing' });
  }
});

// Get showings for a user
router.get('/user/:user_id', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const { status } = req.query;

    const showingRepository = AppDataSource.getRepository(Showing);

    const queryBuilder = showingRepository
      .createQueryBuilder('showing')
      .leftJoinAndSelect('showing.property', 'property')
      .leftJoinAndSelect('property.media', 'media')
      .where('showing.user_id = :user_id', { user_id });

    if (status) {
      queryBuilder.andWhere('showing.status = :status', { status });
    }

    queryBuilder.orderBy('showing.scheduled_at', 'ASC');

    const showings = await queryBuilder.getMany();

    logger.info('Retrieved user showings', { userId: user_id, count: showings.length });

    res.json(showings);
  } catch (error: any) {
    logger.error('Failed to get user showings', {
      error: error.message,
      userId: req.params.user_id,
    });
    res.status(500).json({ error: 'Failed to get user showings' });
  }
});

// Get showings for a property
router.get('/property/:property_id', async (req: Request, res: Response) => {
  try {
    const { property_id } = req.params;

    const showingRepository = AppDataSource.getRepository(Showing);

    const showings = await showingRepository.find({
      where: { property_id },
      relations: ['user'],
      order: { scheduled_at: 'ASC' },
    });

    logger.info('Retrieved property showings', {
      propertyId: property_id,
      count: showings.length,
    });

    res.json(showings);
  } catch (error: any) {
    logger.error('Failed to get property showings', {
      error: error.message,
      propertyId: req.params.property_id,
    });
    res.status(500).json({ error: 'Failed to get property showings' });
  }
});

// Update showing status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;

    if (!Object.values(ShowingStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const showingRepository = AppDataSource.getRepository(Showing);
    const showing = await showingRepository.findOne({
      where: { id },
      relations: ['property', 'user'],
    });

    if (!showing) {
      return res.status(404).json({ error: 'Showing not found' });
    }

    showing.status = status;
    if (feedback) {
      showing.feedback = feedback;
    }

    await showingRepository.save(showing);

    logger.info('Showing status updated', { showingId: id, status });

    // Send WhatsApp notification
    try {
      let message = '';
      switch (status) {
        case ShowingStatus.CONFIRMED:
          message = `✅ Your showing for ${showing.property.title} has been confirmed!`;
          break;
        case ShowingStatus.CANCELLED:
          message = `❌ Your showing for ${showing.property.title} has been cancelled.`;
          break;
        case ShowingStatus.COMPLETED:
          message = `✅ Thank you for viewing ${showing.property.title}! We'd love to hear your feedback.`;
          break;
      }

      if (message) {
        await whatsappService.sendTextMessage(showing.user.phone_number, message);
      }
    } catch (error: any) {
      logger.warn('Failed to send status update notification', {
        error: error.message,
        showingId: id,
      });
    }

    res.json(showing);
  } catch (error: any) {
    logger.error('Failed to update showing status', {
      error: error.message,
      showingId: req.params.id,
    });
    res.status(500).json({ error: 'Failed to update showing status' });
  }
});

// Get showing by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const showingRepository = AppDataSource.getRepository(Showing);
    const showing = await showingRepository.findOne({
      where: { id },
      relations: ['property', 'user', 'property.media'],
    });

    if (!showing) {
      return res.status(404).json({ error: 'Showing not found' });
    }

    logger.info('Retrieved showing', { showingId: id });

    res.json(showing);
  } catch (error: any) {
    logger.error('Failed to get showing', {
      error: error.message,
      showingId: req.params.id,
    });
    res.status(500).json({ error: 'Failed to get showing' });
  }
});

// Reschedule showing
router.patch('/:id/reschedule', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { scheduled_at, notes } = req.body;

    if (!scheduled_at) {
      return res.status(400).json({ error: 'Missing required field: scheduled_at' });
    }

    const showingRepository = AppDataSource.getRepository(Showing);
    const showing = await showingRepository.findOne({
      where: { id },
      relations: ['property', 'user'],
    });

    if (!showing) {
      return res.status(404).json({ error: 'Showing not found' });
    }

    showing.scheduled_at = new Date(scheduled_at);
    if (notes) {
      showing.notes = notes;
    }
    showing.reminder_sent_at = null; // Reset reminder

    await showingRepository.save(showing);

    logger.info('Showing rescheduled', { showingId: id, newDate: scheduled_at });

    // Send WhatsApp notification
    try {
      const formattedDate = new Date(scheduled_at).toLocaleString('en-NG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const message = `🔄 Your showing for ${showing.property.title} has been rescheduled to:\n\n📅 ${formattedDate}\n📍 ${showing.property.address}, ${showing.property.neighborhood}`;

      await whatsappService.sendTextMessage(showing.user.phone_number, message);
    } catch (error: any) {
      logger.warn('Failed to send reschedule notification', {
        error: error.message,
        showingId: id,
      });
    }

    res.json(showing);
  } catch (error: any) {
    logger.error('Failed to reschedule showing', {
      error: error.message,
      showingId: req.params.id,
    });
    res.status(500).json({ error: 'Failed to reschedule showing' });
  }
});

export default router;
