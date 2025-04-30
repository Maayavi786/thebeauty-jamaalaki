/**
 * Mock bookings data for the beauty salon application
 */

export const mockBookings = [
  {
    id: 'booking1',
    userId: 'user1',
    salonId: 'salon1',
    serviceId: 'service1',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    time: '10:00 AM',
    status: 'confirmed',
    totalPrice: 250,
    notes: 'Please arrive 15 minutes early',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updatedAt: new Date().toISOString()
  },
  {
    id: 'booking2',
    userId: 'user1',
    salonId: 'salon2',
    serviceId: 'service7',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    time: '2:30 PM',
    status: 'pending',
    totalPrice: 180,
    notes: '',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updatedAt: new Date().toISOString()
  },
  {
    id: 'booking3',
    userId: 'user1',
    salonId: 'salon3',
    serviceId: 'service10',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    time: '3:00 PM',
    status: 'completed',
    totalPrice: 320,
    notes: 'Very satisfied with the service',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
  },
  {
    id: 'booking4',
    userId: 'user3',
    salonId: 'salon1',
    serviceId: 'service3',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // tomorrow
    time: '11:00 AM',
    status: 'confirmed',
    totalPrice: 300,
    notes: '',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date().toISOString()
  },
  {
    id: 'booking5',
    userId: 'user3',
    salonId: 'salon4',
    serviceId: 'service15',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    time: '4:00 PM',
    status: 'confirmed',
    totalPrice: 150,
    notes: 'First time customer',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updatedAt: new Date().toISOString()
  }
];

/**
 * Get all bookings from the mock data
 */
export function getMockAllBookings() {
  return mockBookings;
}

/**
 * Get bookings for a specific user
 * @param userId The user ID to get bookings for
 */
export function getMockUserBookings(userId: string) {
  return mockBookings.filter(booking => booking.userId === userId);
}

// Helper function to handle the path format /api/bookings/user/:userId
export function getMockUserBookingsByPath(path: string) {
  const segments = path.split('/');
  // The userId is typically at the end of the path /bookings/user/user1
  const userId = segments[segments.length - 1];
  return getMockUserBookings(userId);
}

/**
 * Get a specific booking by ID
 * @param bookingId The booking ID to retrieve
 */
export function getMockBooking(bookingId: string) {
  return mockBookings.find(booking => booking.id === bookingId) || null;
}
