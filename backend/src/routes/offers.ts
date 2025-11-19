import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Offer, OfferStatus } from '../entities/Offer';
import { Property } from '../entities/Property';
import { User } from '../entities/User';
import logger from '../config/logger';
import whatsappService from '../services/whatsapp';

const router = Router();

// Create offer
router.post('/', async (req: Request, res: Response) => {
  try {
    const { property_id, user_id, amount, terms, financing } = req.body;

    if (!property_id || !user_id || !amount) {
      return res.status(400).json({
        error: 'Missing required fields: property_id, user_id, amount',
      });
    }

    const offerRepository = AppDataSource.getRepository(Offer);
    const propertyRepository = AppDataSource.getRepository(Property);
    const userRepository = AppDataSource.getRepository(User);

    // Verify property exists and is available
    const property = await propertyRepository.findOne({ where: { id: property_id } });
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Verify user exists
    const user = await userRepository.findOne({ where: { id: user_id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create offer with 7-day expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const offer = offerRepository.create({
      property_id,
      user_id,
      amount,
      terms,
      financing: financing || {},
      status: OfferStatus.PENDING,
      expires_at: expiresAt,
    });

    await offerRepository.save(offer);

    logger.info('Offer created', {
      offerId: offer.id,
      propertyId: property_id,
      userId: user_id,
      amount,
    });

    // Send WhatsApp confirmation to buyer
    try {
      const offerPercentage = ((parseFloat(amount) / parseFloat(property.price.toString())) * 100).toFixed(1);

      const confirmationMessage = `✅ Your offer has been submitted!\n\n🏠 Property: ${property.title}\n💰 Offer Amount: ₦${parseFloat(amount).toLocaleString()}\n📊 ${offerPercentage}% of asking price (₦${parseFloat(property.price.toString()).toLocaleString()})\n⏰ Expires: ${expiresAt.toLocaleDateString('en-NG')}\n\nWe'll notify you once the seller responds. This typically takes 24-48 hours.`;

      await whatsappService.sendTextMessage(user.phone_number, confirmationMessage);
    } catch (error: any) {
      logger.warn('Failed to send offer confirmation', {
        error: error.message,
        offerId: offer.id,
      });
    }

    // Return offer with relations
    const createdOffer = await offerRepository.findOne({
      where: { id: offer.id },
      relations: ['property', 'user'],
    });

    res.status(201).json(createdOffer);
  } catch (error: any) {
    logger.error('Failed to create offer', { error: error.message });
    res.status(500).json({ error: 'Failed to create offer' });
  }
});

// Get offers for a user
router.get('/user/:user_id', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const { status } = req.query;

    const offerRepository = AppDataSource.getRepository(Offer);

    const queryBuilder = offerRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.property', 'property')
      .leftJoinAndSelect('property.media', 'media')
      .where('offer.user_id = :user_id', { user_id });

    if (status) {
      queryBuilder.andWhere('offer.status = :status', { status });
    }

    queryBuilder.orderBy('offer.created_at', 'DESC');

    const offers = await queryBuilder.getMany();

    logger.info('Retrieved user offers', { userId: user_id, count: offers.length });

    res.json(offers);
  } catch (error: any) {
    logger.error('Failed to get user offers', {
      error: error.message,
      userId: req.params.user_id,
    });
    res.status(500).json({ error: 'Failed to get user offers' });
  }
});

// Get offers for a property
router.get('/property/:property_id', async (req: Request, res: Response) => {
  try {
    const { property_id } = req.params;

    const offerRepository = AppDataSource.getRepository(Offer);

    const offers = await offerRepository.find({
      where: { property_id },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });

    logger.info('Retrieved property offers', {
      propertyId: property_id,
      count: offers.length,
    });

    res.json(offers);
  } catch (error: any) {
    logger.error('Failed to get property offers', {
      error: error.message,
      propertyId: req.params.property_id,
    });
    res.status(500).json({ error: 'Failed to get property offers' });
  }
});

// Update offer status (accept, reject, counter)
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, response_notes, counter_amount } = req.body;

    if (!Object.values(OfferStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const offerRepository = AppDataSource.getRepository(Offer);
    const offer = await offerRepository.findOne({
      where: { id },
      relations: ['property', 'user'],
    });

    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    offer.status = status;
    if (response_notes) {
      offer.response_notes = response_notes;
    }
    if (counter_amount) {
      offer.counter_amount = counter_amount;
    }

    await offerRepository.save(offer);

    logger.info('Offer status updated', { offerId: id, status });

    // Send WhatsApp notification to buyer
    try {
      let message = '';
      switch (status) {
        case OfferStatus.ACCEPTED:
          message = `🎉 Congratulations! Your offer of ₦${parseFloat(offer.amount.toString()).toLocaleString()} for ${offer.property.title} has been ACCEPTED!\n\nNext steps:\n1. We'll contact you to finalize paperwork\n2. Prepare payment as per agreed terms\n3. Schedule property handover\n\nA representative will contact you within 24 hours.`;
          break;
        case OfferStatus.REJECTED:
          message = `❌ Unfortunately, your offer of ₦${parseFloat(offer.amount.toString()).toLocaleString()} for ${offer.property.title} was not accepted.\n\n${response_notes || 'The seller has decided to go with another offer or keep the property listed.'}\n\nWould you like to view similar properties?`;
          break;
        case OfferStatus.COUNTERED:
          message = `🔄 The seller has countered your offer!\n\n🏠 Property: ${offer.property.title}\n💰 Your Offer: ₦${parseFloat(offer.amount.toString()).toLocaleString()}\n💰 Counter Offer: ₦${parseFloat(counter_amount).toLocaleString()}\n\n${response_notes || ''}\n\nWould you like to accept the counter offer?`;
          break;
      }

      if (message) {
        await whatsappService.sendTextMessage(offer.user.phone_number, message);
      }
    } catch (error: any) {
      logger.warn('Failed to send offer status notification', {
        error: error.message,
        offerId: id,
      });
    }

    res.json(offer);
  } catch (error: any) {
    logger.error('Failed to update offer status', {
      error: error.message,
      offerId: req.params.id,
    });
    res.status(500).json({ error: 'Failed to update offer status' });
  }
});

// Get offer by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const offerRepository = AppDataSource.getRepository(Offer);
    const offer = await offerRepository.findOne({
      where: { id },
      relations: ['property', 'user', 'property.media'],
    });

    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    logger.info('Retrieved offer', { offerId: id });

    res.json(offer);
  } catch (error: any) {
    logger.error('Failed to get offer', {
      error: error.message,
      offerId: req.params.id,
    });
    res.status(500).json({ error: 'Failed to get offer' });
  }
});

// Withdraw offer
router.patch('/:id/withdraw', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const offerRepository = AppDataSource.getRepository(Offer);
    const offer = await offerRepository.findOne({
      where: { id },
      relations: ['property', 'user'],
    });

    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    if (offer.status !== OfferStatus.PENDING && offer.status !== OfferStatus.COUNTERED) {
      return res.status(400).json({
        error: 'Can only withdraw pending or countered offers',
      });
    }

    offer.status = OfferStatus.WITHDRAWN;
    await offerRepository.save(offer);

    logger.info('Offer withdrawn', { offerId: id });

    // Send confirmation
    try {
      const message = `✅ Your offer of ₦${parseFloat(offer.amount.toString()).toLocaleString()} for ${offer.property.title} has been withdrawn.`;
      await whatsappService.sendTextMessage(offer.user.phone_number, message);
    } catch (error: any) {
      logger.warn('Failed to send withdrawal confirmation', {
        error: error.message,
        offerId: id,
      });
    }

    res.json(offer);
  } catch (error: any) {
    logger.error('Failed to withdraw offer', {
      error: error.message,
      offerId: req.params.id,
    });
    res.status(500).json({ error: 'Failed to withdraw offer' });
  }
});

export default router;
