export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const config = {
  api: {
    baseUrl: API_BASE_URL,
    endpoints: {
      salons: '/salons',
      services: '/services',
      reviews: '/reviews',
      bookings: '/bookings',
      auth: '/auth',
    },
  },
  features: {
    enableReviews: true,
    enableBookings: true,
    enablePrivateRooms: true,
  },
}; 