import { auth } from '@/lib/firebase';

/**
 * Utility functions for calling Netlify Functions that replace Firebase Cloud Functions
 */

/**
 * Get an ID token from the current user
 * @returns Firebase ID token or null if not authenticated
 */
const getIdToken = async (): Promise<string | null> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return null;
  }

  try {
    return await currentUser.getIdToken();
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
};

/**
 * Call a Netlify Function with Firebase Auth
 * @param functionName The Netlify function name
 * @param action The action to perform
 * @param data Additional data to send
 * @returns Response from the function
 */
export const callAuthFunction = async (
  functionName: string,
  action: string,
  data: any = {}
): Promise<any> => {
  const idToken = await getIdToken();
  
  if (!idToken) {
    throw new Error('User not authenticated');
  }

  try {
    const response = await fetch(`/.netlify/functions/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        idToken,
        data
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error calling Netlify function');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error calling ${functionName}:`, error);
    throw error;
  }
};

/**
 * Set user role (custom claims) via Netlify function
 * @param uid User ID
 * @param role User role
 */
export const setUserRole = async (uid: string, role: 'customer' | 'salon_owner'): Promise<void> => {
  await callAuthFunction('firebaseAuth', 'setUserRole', { uid, role });
};

/**
 * Update a user's profile via Netlify function
 * @param profileData User profile data
 */
export const updateUserProfile = async (profileData: {
  fullName?: string;
  photoURL?: string;
}): Promise<void> => {
  await callAuthFunction('firebaseAuth', 'updateUserProfile', profileData);
};

/**
 * Send a welcome email to a new user
 * @param userId User ID
 */
export const sendWelcomeEmail = async (userId: string): Promise<void> => {
  await callAuthFunction('firebaseEmail', 'sendWelcomeEmail', { userId });
};

/**
 * Send a booking confirmation email
 * @param bookingId Booking ID
 */
export const sendBookingConfirmation = async (bookingId: string): Promise<void> => {
  await callAuthFunction('firebaseEmail', 'sendBookingConfirmation', { bookingId });
};

/**
 * Update a booking's status
 * @param bookingId Booking ID
 * @param newStatus New booking status
 */
export const updateBookingStatus = async (
  bookingId: string,
  newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled'
): Promise<void> => {
  await callAuthFunction('firebaseBookings', 'updateBookingStatus', { bookingId, newStatus });
};

/**
 * Update a salon's rating based on reviews
 * @param salonId Salon ID
 */
export const updateSalonRating = async (salonId: string): Promise<number> => {
  const result = await callAuthFunction('firebaseBookings', 'updateSalonRating', { salonId });
  return result.rating;
};
