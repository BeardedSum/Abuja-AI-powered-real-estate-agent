/**
 * Analytics Service
 *
 * Track and analyze platform metrics for business intelligence.
 *
 * FUTURE IMPLEMENTATION:
 * - Google Analytics 4 integration
 * - Mixpanel for user behavior tracking
 * - Custom dashboard with KPIs
 * - Real-time analytics
 * - A/B testing framework
 *
 * KEY METRICS TO TRACK:
 * - User acquisition (daily/weekly/monthly)
 * - Property views and searches
 * - Showing conversion rates
 * - Offer acceptance rates
 * - Revenue and transaction fees
 * - Agent performance
 * - User engagement (messages, sessions)
 * - WhatsApp vs Web usage
 */

import logger from '../config/logger';
import redisClient from '../config/redis';
import { AppDataSource } from '../config/database';

export interface AnalyticsEvent {
  event_type: string;
  user_id?: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

export class AnalyticsService {
  /**
   * Track an analytics event
   *
   * @param event Event data
   */
  async trackEvent(event: AnalyticsEvent) {
    try {
      // Log to console/file for now
      logger.info('Analytics Event', {
        type: event.event_type,
        user: event.user_id,
        properties: event.properties,
      });

      // TODO: Send to analytics platform (Google Analytics, Mixpanel, etc.)
      // Example: mixpanel.track(event.event_type, event.properties);

      // Store in Redis for real-time metrics
      const key = `analytics:${event.event_type}:${new Date().toISOString().split('T')[0]}`;
      await redisClient.incr(key);
      await redisClient.expire(key, 86400 * 30); // Keep for 30 days
    } catch (error: any) {
      logger.error('Analytics tracking failed', { error: error.message });
    }
  }

  /**
   * Get platform statistics
   *
   * @returns Platform stats
   */
  async getPlatformStats() {
    try {
      const stats = await AppDataSource.query(`
        SELECT
          (SELECT COUNT(*) FROM properties WHERE status = 'available') as available_properties,
          (SELECT COUNT(*) FROM properties WHERE status = 'sold') as sold_properties,
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM showings WHERE status IN ('scheduled', 'confirmed')) as upcoming_showings,
          (SELECT COUNT(*) FROM offers WHERE status = 'pending') as pending_offers,
          (SELECT COUNT(*) FROM offers WHERE status = 'accepted') as accepted_offers,
          (SELECT AVG(price) FROM properties WHERE status = 'available') as avg_property_price
      `);

      return stats[0];
    } catch (error: any) {
      logger.error('Failed to get platform stats', { error: error.message });
      throw error;
    }
  }

  /**
   * Get user engagement metrics
   *
   * @param period Period in days (default 7)
   * @returns Engagement metrics
   */
  async getUserEngagement(period: number = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);

      const engagement = await AppDataSource.query(
        `
        SELECT
          DATE(created_at) as date,
          COUNT(DISTINCT user_id) as active_users,
          COUNT(*) as total_messages
        FROM conversations
        WHERE created_at >= $1
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `,
        [startDate]
      );

      return engagement;
    } catch (error: any) {
      logger.error('Failed to get engagement metrics', { error: error.message });
      throw error;
    }
  }

  /**
   * Get revenue metrics
   *
   * @returns Revenue data
   */
  async getRevenueMetrics() {
    try {
      // Calculate potential revenue from accepted offers
      // Assuming 0.75% transaction fee
      const revenue = await AppDataSource.query(`
        SELECT
          COUNT(*) as total_deals,
          SUM(amount) as total_deal_value,
          SUM(amount * 0.0075) as estimated_revenue,
          AVG(amount) as average_deal_size
        FROM offers
        WHERE status = 'accepted'
      `);

      return revenue[0];
    } catch (error: any) {
      logger.error('Failed to get revenue metrics', { error: error.message });
      throw error;
    }
  }

  /**
   * Get conversion funnel data
   *
   * @returns Funnel metrics
   */
  async getConversionFunnel() {
    try {
      const funnel = await AppDataSource.query(`
        SELECT
          (SELECT COUNT(DISTINCT user_id) FROM conversations) as users_engaged,
          (SELECT COUNT(DISTINCT user_id) FROM showings) as users_with_showings,
          (SELECT COUNT(DISTINCT user_id) FROM offers) as users_with_offers,
          (SELECT COUNT(DISTINCT user_id) FROM offers WHERE status = 'accepted') as users_with_accepted_offers
      `);

      const data = funnel[0];
      return {
        engaged: data.users_engaged,
        showings: data.users_with_showings,
        offers: data.users_with_offers,
        closed: data.users_with_accepted_offers,
        conversion_rates: {
          engaged_to_showing: (data.users_with_showings / data.users_engaged) * 100,
          showing_to_offer: (data.users_with_offers / data.users_with_showings) * 100,
          offer_to_close: (data.users_with_accepted_offers / data.users_with_offers) * 100,
        },
      };
    } catch (error: any) {
      logger.error('Failed to get conversion funnel', { error: error.message });
      throw error;
    }
  }

  /**
   * Get popular neighborhoods
   *
   * @param limit Number of results
   * @returns Popular neighborhoods data
   */
  async getPopularNeighborhoods(limit: number = 10) {
    try {
      const neighborhoods = await AppDataSource.query(
        `
        SELECT
          p.neighborhood,
          COUNT(DISTINCT s.id) as total_showings,
          COUNT(DISTINCT o.id) as total_offers,
          AVG(p.price) as avg_price,
          COUNT(DISTINCT p.id) as total_properties
        FROM properties p
        LEFT JOIN showings s ON p.id = s.property_id
        LEFT JOIN offers o ON p.id = o.property_id
        WHERE p.status = 'available'
        GROUP BY p.neighborhood
        ORDER BY total_showings DESC, total_offers DESC
        LIMIT $1
      `,
        [limit]
      );

      return neighborhoods;
    } catch (error: any) {
      logger.error('Failed to get popular neighborhoods', { error: error.message });
      throw error;
    }
  }
}

export default new AnalyticsService();

// Event types to track
export const ANALYTICS_EVENTS = {
  PROPERTY_VIEWED: 'property_viewed',
  PROPERTY_SEARCHED: 'property_searched',
  SHOWING_SCHEDULED: 'showing_scheduled',
  SHOWING_COMPLETED: 'showing_completed',
  OFFER_CREATED: 'offer_created',
  OFFER_ACCEPTED: 'offer_accepted',
  OFFER_REJECTED: 'offer_rejected',
  USER_REGISTERED: 'user_registered',
  AGENT_MESSAGE_SENT: 'agent_message_sent',
  WHATSAPP_MESSAGE_RECEIVED: 'whatsapp_message_received',
  WEB_SESSION_STARTED: 'web_session_started',
};
