import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertiesApi } from '../services/api';
import type { PropertyFilters, Property } from '../types';

export function useProperties(filters: PropertyFilters = {}) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => propertiesApi.search(filters),
  });
}

export function useProperty(id: string | undefined) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => propertiesApi.getById(id!),
    enabled: !!id,
  });
}

export function useNearbyProperties(propertyId: string | undefined, radius?: number) {
  return useQuery({
    queryKey: ['properties', 'nearby', propertyId, radius],
    queryFn: () => propertiesApi.getNearby(propertyId!, radius),
    enabled: !!propertyId,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (property: Partial<Property>) => propertiesApi.create(property),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useUpdatePropertyStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      propertiesApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}
