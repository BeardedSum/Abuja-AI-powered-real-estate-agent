// Property types
export enum PropertyType {
  HOUSE = 'house',
  FLAT = 'flat',
  DUPLEX = 'duplex',
  LAND = 'land',
  COMMERCIAL = 'commercial'
}

export enum PropertyStatus {
  AVAILABLE = 'available',
  PENDING = 'pending',
  SOLD = 'sold',
  WITHDRAWN = 'withdrawn'
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  FLOOR_PLAN = 'floor_plan',
  VIRTUAL_TOUR = 'virtual_tour'
}

export interface PropertyMedia {
  id: string;
  url: string;
  media_type: MediaType;
  caption?: string;
  order: number;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  neighborhood: string;
  address: string;
  latitude: number;
  longitude: number;
  bedrooms?: number;
  bathrooms?: number;
  size_sqm?: number;
  property_type: PropertyType;
  status: PropertyStatus;
  features: string[];
  documents?: Record<string, string>;
  agent_contact?: string;
  media: PropertyMedia[];
  created_at: string;
  updated_at: string;
}

// Showing types
export enum ShowingStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export interface Showing {
  id: string;
  property_id: string;
  property?: Property;
  user_id: string;
  scheduled_at: string;
  status: ShowingStatus;
  notes?: string;
  reminder_sent_at?: string;
  feedback?: {
    rating?: number;
    comments?: string;
    interested?: boolean;
  };
  created_at: string;
  updated_at: string;
}

// Offer types
export enum OfferStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  COUNTERED = 'countered',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired'
}

export interface Offer {
  id: string;
  property_id: string;
  property?: Property;
  user_id: string;
  amount: number;
  terms?: string;
  status: OfferStatus;
  expires_at?: string;
  financing?: {
    cash?: boolean;
    mortgage_pre_approved?: boolean;
    down_payment_percentage?: number;
  };
  response_notes?: string;
  counter_amount?: number;
  created_at: string;
  updated_at: string;
}

// User types
export interface User {
  id: string;
  phone_number: string;
  name?: string;
  email?: string;
  preferences?: {
    property_type?: PropertyType;
    budget_min?: number;
    budget_max?: number;
    bedrooms?: number;
    neighborhoods?: string[];
  };
  created_at: string;
}

// Agent types
export interface AgentMessage {
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
}

export interface AgentResponse {
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

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

// Filter types
export interface PropertyFilters {
  property_type?: PropertyType;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  neighborhood?: string;
  limit?: number;
  offset?: number;
}
