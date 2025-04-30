// Use environment variable or default to production Netlify URL
let envBaseUrl = import.meta.env.VITE_API_BASE_URL;

// For production, use /.netlify/functions instead of /api
// This routes to Netlify Functions instead of the old Express backend
export const API_BASE_URL = envBaseUrl || '';
export const USE_FIREBASE = true; // Flag to use Firebase API instead of Express

// Don't log in production
if (import.meta.env.DEV) {
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('Using Firebase:', USE_FIREBASE);
}

export const config = {
  api: {
    baseUrl: API_BASE_URL,
    endpoints: {
      salons: '/salons',
      services: '/services',
      reviews: '/reviews',
      bookings: '/bookings',
      auth: '/auth',
      promotions: '/promotions', 
      analytics: '/analytics',
    },
  },
  features: {
    enableReviews: true,
    enableBookings: true,
    enablePrivateRooms: true,
  },
}; 