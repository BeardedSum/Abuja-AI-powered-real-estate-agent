import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offersApi } from '../services/api';
import type { Offer } from '../types';

export function useUserOffers(userId: string, status?: string) {
  return useQuery({
    queryKey: ['offers', 'user', userId, status],
    queryFn: () => offersApi.getByUser(userId, status),
    enabled: !!userId,
  });
}

export function usePropertyOffers(propertyId: string) {
  return useQuery({
    queryKey: ['offers', 'property', propertyId],
    queryFn: () => offersApi.getByProperty(propertyId),
    enabled: !!propertyId,
  });
}

export function useOffer(id: string | undefined) {
  return useQuery({
    queryKey: ['offer', id],
    queryFn: () => offersApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offer: {
      property_id: string;
      user_id: string;
      amount: number;
      terms?: string;
      financing?: any;
    }) => offersApi.create(offer),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['offers', 'user', variables.user_id] });
      queryClient.invalidateQueries({ queryKey: ['offers', 'property', variables.property_id] });
    },
  });
}

export function useUpdateOfferStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      response_notes,
      counter_amount,
    }: {
      id: string;
      status: string;
      response_notes?: string;
      counter_amount?: number;
    }) => offersApi.updateStatus(id, status, response_notes, counter_amount),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['offer', data.id] });
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
}

export function useWithdrawOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => offersApi.withdraw(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['offer', data.id] });
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
}
