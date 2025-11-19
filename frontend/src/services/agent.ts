import axios from 'axios';
import type { AgentResponse } from '../types';

const AGENT_BASE_URL = import.meta.env.VITE_AGENT_URL || 'http://localhost:8000';

const agentApi = axios.create({
  baseURL: AGENT_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface AgentQueryRequest {
  user_id: string;
  session_id?: string;
  message: string;
  message_type?: 'text' | 'image' | 'voice' | 'location';
  metadata?: Record<string, any>;
}

export const agentService = {
  /**
   * Send a message to the AI agent orchestrator
   */
  query: async (request: AgentQueryRequest): Promise<AgentResponse> => {
    const { data } = await agentApi.post<AgentResponse>('/agent/query', request);
    return data;
  },

  /**
   * Execute a specific tool directly
   */
  executeTool: async (toolName: string, parameters: Record<string, any>) => {
    const { data } = await agentApi.post('/tool/execute', {
      tool_name: toolName,
      parameters,
    });
    return data;
  },

  /**
   * Clear a user's session
   */
  clearSession: async (sessionId: string) => {
    await agentApi.delete(`/session/${sessionId}`);
  },

  /**
   * Get session information
   */
  getSession: async (sessionId: string) => {
    const { data } = await agentApi.get(`/session/${sessionId}`);
    return data;
  },

  /**
   * Health check for agent service
   */
  healthCheck: async () => {
    const { data } = await agentApi.get('/health');
    return data;
  },
};

export default agentService;
