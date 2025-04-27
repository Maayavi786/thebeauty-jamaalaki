// Use environment variable for API base URL, fallback to localhost for development
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const config = {
  api: {
    baseUrl: API_BASE_URL,
    endpoints: {
      salons: '/api/salons',
      services: '/api/services',
      reviews: '/api/reviews',
      bookings: '/api/bookings',
      auth: '/api/auth',
    },
  },
  features: {
    enableReviews: true,
    enableBookings: true,
    enablePrivateRooms: true,
  },
}; 