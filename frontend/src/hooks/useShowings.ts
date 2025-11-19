import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showingsApi } from '../services/api';
import type { Showing } from '../types';

export function useUserShowings(userId: string, status?: string) {
  return useQuery({
    queryKey: ['showings', 'user', userId, status],
    queryFn: () => showingsApi.getByUser(userId, status),
    enabled: !!userId,
  });
}

export function usePropertyShowings(propertyId: string) {
  return useQuery({
    queryKey: ['showings', 'property', propertyId],
    queryFn: () => showingsApi.getByProperty(propertyId),
    enabled: !!propertyId,
  });
}

export function useShowing(id: string | undefined) {
  return useQuery({
    queryKey: ['showing', id],
    queryFn: () => showingsApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateShowing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (showing: {
      property_id: string;
      user_id: string;
      scheduled_at: string;
      notes?: string;
    }) => showingsApi.create(showing),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['showings', 'user', variables.user_id] });
      queryClient.invalidateQueries({ queryKey: ['showings', 'property', variables.property_id] });
    },
  });
}

export function useUpdateShowingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, feedback }: { id: string; status: string; feedback?: any }) =>
      showingsApi.updateStatus(id, status, feedback),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['showing', data.id] });
      queryClient.invalidateQueries({ queryKey: ['showings'] });
    },
  });
}

export function useRescheduleShowing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, scheduled_at, notes }: { id: string; scheduled_at: string; notes?: string }) =>
      showingsApi.reschedule(id, scheduled_at, notes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['showing', data.id] });
      queryClient.invalidateQueries({ queryKey: ['showings'] });
    },
  });
}
