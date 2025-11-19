import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { agentService, type AgentQueryRequest } from '../services/agent';
import type { AgentMessage, AgentResponse } from '../types';

export function useAgents(userId: string) {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>();

  const queryMutation = useMutation({
    mutationFn: (request: AgentQueryRequest) => agentService.query(request),
    onSuccess: (response: AgentResponse) => {
      // Update session ID
      if (response.session_id) {
        setSessionId(response.session_id);
      }

      // Add agent response to messages
      setMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          content: response.response,
          timestamp: new Date().toISOString(),
        },
      ]);
    },
  });

  const sendMessage = useCallback(
    async (message: string, metadata?: Record<string, any>) => {
      // Add user message to messages
      setMessages((prev) => [
        ...prev,
        {
          role: 'user',
          content: message,
          timestamp: new Date().toISOString(),
        },
      ]);

      // Query the agent
      const response = await queryMutation.mutateAsync({
        user_id: userId,
        session_id: sessionId,
        message,
        metadata,
      });

      return response;
    },
    [userId, sessionId, queryMutation]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    if (sessionId) {
      agentService.clearSession(sessionId);
      setSessionId(undefined);
    }
  }, [sessionId]);

  return {
    messages,
    sendMessage,
    clearMessages,
    loading: queryMutation.isPending,
    error: queryMutation.error,
    sessionId,
  };
}

export function useExecuteTool() {
  return useMutation({
    mutationFn: ({ toolName, parameters }: { toolName: string; parameters: Record<string, any> }) =>
      agentService.executeTool(toolName, parameters),
  });
}
