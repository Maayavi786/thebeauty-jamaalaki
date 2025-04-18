console.log('API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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