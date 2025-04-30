// Firestore collection schema definitions

// User document schema
export interface UserData {
  uid: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'customer' | 'salon_owner';
  preferredLanguage: 'en' | 'ar';
  photoURL?: string;
  createdAt: string;
  updatedAt?: string;
}

// Salon document schema
export interface SalonData {
  id: string;
  owner_id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  address: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  phone: string;
  email: string;
  image_url: string;
  gallery_images?: string[];
  rating: number;
  is_featured: boolean;
  ladies_only: boolean;
  private_rooms: boolean;
  business_hours: {
    monday: { open: string; close: string };
    tuesday: { open: string; close: string };
    wednesday: { open: string; close: string };
    thursday: { open: string; close: string };
    friday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
  };
  createdAt: string;
  updatedAt: string;
}

// Service document schema
export interface ServiceData {
  id: string;
  salon_id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  duration: number; // in minutes
  price: number;
  category: string;
  image_url?: string;
  is_featured: boolean;
  is_available: boolean;
  createdAt: string;
  updatedAt: string;
}

// Booking document schema
export interface BookingData {
  id: string;
  user_id: string;
  salon_id: string;
  service_id: string;
  date: string; // ISO date string
  time: string; // 24-hour format, e.g., "14:30"
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  payment_status?: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

// Review document schema
export interface ReviewData {
  id: string;
  user_id: string;
  salon_id: string;
  service_id?: string;
  booking_id?: string;
  rating: number; // 1-5
  comment?: string;
  response?: {
    text: string;
    date: string;
  };
  is_verified: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Promotion document schema
export interface PromotionData {
  id: string;
  salon_id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  discount_percentage: number;
  valid_from: string; // ISO date string
  valid_until: string; // ISO date string
  image_url?: string;
  is_active: boolean;
  service_ids?: string[]; // If empty, applies to all services
  createdAt: string;
  updatedAt: string;
}

// Collection names (for consistent reference)
export const COLLECTIONS = {
  USERS: 'users',
  SALONS: 'salons',
  SERVICES: 'services',
  BOOKINGS: 'bookings',
  REVIEWS: 'reviews',
  PROMOTIONS: 'promotions',
};
