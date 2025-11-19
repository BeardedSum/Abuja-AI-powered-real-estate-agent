import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

// Simple API key authentication (for admin/internal endpoints)
// In production, use JWT or OAuth2
export const requireApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    logger.warn('Unauthorized API access attempt', {
      ip: req.ip,
      path: req.path,
    });
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

// User authentication middleware (placeholder for future JWT implementation)
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement JWT verification
  // For now, we trust user_id from request body (insecure - for development only)
  next();
};

// Role-based access control
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // TODO: Implement role checking from JWT token
    // const userRole = req.user?.role;
    // if (!allowedRoles.includes(userRole)) {
    //   return res.status(403).json({ error: 'Forbidden' });
    // }
    next();
  };
};
