import axios from 'axios';
import logger from '../config/logger';
import redisClient from '../config/redis';
import { v4 as uuidv4 } from 'uuid';

const ADK_AGENT_URL = process.env.ADK_AGENT_URL || 'http://localhost:8000';

export interface AgentQueryRequest {
  user_id: string;
  session_id?: string;
  message: string;
  message_type?: 'text' | 'image' | 'voice' | 'location';
  metadata?: Record<string, any>;
}

export interface AgentQueryResponse {
  response: string;
  session_id: string;
  agent_name?: string;
  requires_confirmation?: boolean;
  suggested_actions?: Array<{
    type: string;
    data: any;
  }>;
  metadata?: Record<string, any>;
}

export class ADKBridgeService {
  private agentUrl: string;

  constructor() {
    this.agentUrl = ADK_AGENT_URL;
  }

  async queryAgent(request: AgentQueryRequest): Promise<AgentQueryResponse> {
    try {
      // Get or create session ID
      const sessionId = request.session_id || await this.getOrCreateSession(request.user_id);

      logger.info('Querying ADK agent', {
        userId: request.user_id,
        sessionId,
        messageType: request.message_type,
      });

      const response = await axios.post<AgentQueryResponse>(
        `${this.agentUrl}/agent/query`,
        {
          user_id: request.user_id,
          session_id: sessionId,
          message: request.message,
          message_type: request.message_type || 'text',
          metadata: request.metadata,
        },
        {
          timeout: 30000, // 30 second timeout
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Cache the session
      await this.cacheSession(sessionId, request.user_id);

      logger.info('ADK agent query successful', {
        userId: request.user_id,
        sessionId,
        agentName: response.data.agent_name,
      });

      return response.data;
    } catch (error: any) {
      logger.error('Failed to query ADK agent', {
        error: error.response?.data || error.message,
        userId: request.user_id,
      });
      throw error;
    }
  }

  async getOrCreateSession(userId: string): Promise<string> {
    try {
      // Check if user has an active session in Redis
      const cachedSessionId = await redisClient.get(`user:${userId}:session`);

      if (cachedSessionId) {
        logger.info('Retrieved cached session', { userId, sessionId: cachedSessionId });
        return cachedSessionId;
      }

      // Create new session
      const newSessionId = uuidv4();
      await this.cacheSession(newSessionId, userId);

      logger.info('Created new session', { userId, sessionId: newSessionId });
      return newSessionId;
    } catch (error: any) {
      logger.error('Failed to get or create session', {
        error: error.message,
        userId,
      });
      // Return a new session ID even if Redis fails
      return uuidv4();
    }
  }

  async cacheSession(sessionId: string, userId: string): Promise<void> {
    try {
      // Cache session for 24 hours
      await redisClient.setEx(`user:${userId}:session`, 86400, sessionId);
    } catch (error: any) {
      logger.error('Failed to cache session', {
        error: error.message,
        userId,
        sessionId,
      });
      // Don't throw - caching failure shouldn't break the flow
    }
  }

  async clearSession(userId: string): Promise<void> {
    try {
      await redisClient.del(`user:${userId}:session`);
      logger.info('Cleared user session', { userId });
    } catch (error: any) {
      logger.error('Failed to clear session', {
        error: error.message,
        userId,
      });
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.agentUrl}/health`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      logger.error('ADK agent health check failed', { error });
      return false;
    }
  }
}

export default new ADKBridgeService();
