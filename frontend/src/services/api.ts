import axios from 'axios';
import type {
  Property,
  Showing,
  Offer,
  PropertyFilters,
  PaginatedResponse,
  ApiResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Properties API
export const propertiesApi = {
  search: async (filters: PropertyFilters) => {
    const { data } = await api.get<{
      properties: Property[];
      total: number;
      limit: number;
      offset: number;
    }>('/properties', { params: filters });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<Property>(`/properties/${id}`);
    return data;
  },

  create: async (property: Partial<Property>) => {
    const { data } = await api.post<Property>('/properties', property);
    return data;
  },

  updateStatus: async (id: string, status: string) => {
    const { data } = await api.patch<Property>(`/properties/${id}/status`, { status });
    return data;
  },

  getNearby: async (id: string, radius?: number, limit?: number) => {
    const { data } = await api.get<Property[]>(`/properties/${id}/nearby`, {
      params: { radius, limit },
    });
    return data;
  },
};

// Showings API
export const showingsApi = {
  create: async (showing: {
    property_id: string;
    user_id: string;
    scheduled_at: string;
    notes?: string;
  }) => {
    const { data } = await api.post<Showing>('/showings', showing);
    return data;
  },

  getByUser: async (userId: string, status?: string) => {
    const { data } = await api.get<Showing[]>(`/showings/user/${userId}`, {
      params: { status },
    });
    return data;
  },

  getByProperty: async (propertyId: string) => {
    const { data } = await api.get<Showing[]>(`/showings/property/${propertyId}`);
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<Showing>(`/showings/${id}`);
    return data;
  },

  updateStatus: async (id: string, status: string, feedback?: any) => {
    const { data } = await api.patch<Showing>(`/showings/${id}/status`, {
      status,
      feedback,
    });
    return data;
  },

  reschedule: async (id: string, scheduled_at: string, notes?: string) => {
    const { data } = await api.patch<Showing>(`/showings/${id}/reschedule`, {
      scheduled_at,
      notes,
    });
    return data;
  },
};

// Offers API
export const offersApi = {
  create: async (offer: {
    property_id: string;
    user_id: string;
    amount: number;
    terms?: string;
    financing?: any;
  }) => {
    const { data } = await api.post<Offer>('/offers', offer);
    return data;
  },

  getByUser: async (userId: string, status?: string) => {
    const { data } = await api.get<Offer[]>(`/offers/user/${userId}`, {
      params: { status },
    });
    return data;
  },

  getByProperty: async (propertyId: string) => {
    const { data } = await api.get<Offer[]>(`/offers/property/${propertyId}`);
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<Offer>(`/offers/${id}`);
    return data;
  },

  updateStatus: async (
    id: string,
    status: string,
    response_notes?: string,
    counter_amount?: number
  ) => {
    const { data } = await api.patch<Offer>(`/offers/${id}/status`, {
      status,
      response_notes,
      counter_amount,
    });
    return data;
  },

  withdraw: async (id: string) => {
    const { data } = await api.patch<Offer>(`/offers/${id}/withdraw`, {});
    return data;
  },
};

export default api;
