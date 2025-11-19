import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import logger from '../config/logger';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      logger.warn('Validation failed', { errors, path: req.path });

      return res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
    }

    req.body = value;
    next();
  };
};

// Common validation schemas
export const propertySchema = Joi.object({
  title: Joi.string().required().min(10).max(200),
  description: Joi.string().required().min(50).max(2000),
  price: Joi.number().required().positive(),
  neighborhood: Joi.string().required(),
  address: Joi.string().required(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
  bedrooms: Joi.number().integer().min(0).optional(),
  bathrooms: Joi.number().integer().min(0).optional(),
  size_sqm: Joi.number().positive().optional(),
  property_type: Joi.string()
    .valid('house', 'flat', 'duplex', 'land', 'commercial')
    .required(),
  features: Joi.array().items(Joi.string()).optional(),
  documents: Joi.object().optional(),
  agent_contact: Joi.string().optional(),
  media: Joi.array()
    .items(
      Joi.object({
        media_type: Joi.string().valid('image', 'video', 'floor_plan', 'virtual_tour').required(),
        url: Joi.string().uri().required(),
        caption: Joi.string().optional(),
      })
    )
    .optional(),
});

export const showingSchema = Joi.object({
  property_id: Joi.string().uuid().required(),
  user_id: Joi.string().uuid().required(),
  scheduled_at: Joi.date().iso().greater('now').required(),
  notes: Joi.string().max(500).optional(),
});

export const offerSchema = Joi.object({
  property_id: Joi.string().uuid().required(),
  user_id: Joi.string().uuid().required(),
  amount: Joi.number().required().positive(),
  terms: Joi.string().max(1000).optional(),
  financing: Joi.object({
    cash: Joi.boolean().optional(),
    mortgage_pre_approved: Joi.boolean().optional(),
    down_payment_percentage: Joi.number().min(0).max(100).optional(),
  }).optional(),
});

export const updateStatusSchema = Joi.object({
  status: Joi.string().required(),
  response_notes: Joi.string().max(1000).optional(),
  counter_amount: Joi.number().positive().optional(),
  feedback: Joi.object().optional(),
});
