// Force port 5000 to avoid caching issues with environment variables
export const API_BASE_URL = 'http://localhost:5000';
console.log('API_BASE_URL hardcoded to:', API_BASE_URL);

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