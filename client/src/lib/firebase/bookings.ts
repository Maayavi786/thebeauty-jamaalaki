import { collection, addDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/firestore/schema';
import { sendBookingConfirmation, updateBookingStatus } from './netlifyFunctions';

/**
 * Create a new booking
 * @param bookingData The booking data
 * @returns The booking ID
 */
export const createBooking = async (bookingData: {
  user_id: string;
  salon_id: string;
  service_id: string;
  date: string;
  time: string;
  notes?: string;
}): Promise<string> => {
  try {
    // Add booking to Firestore
    const bookingRef = await addDoc(collection(db, COLLECTIONS.BOOKINGS), {
      ...bookingData,
      status: 'pending',
      payment_status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Send booking confirmation email via Netlify Function
    try {
      await sendBookingConfirmation(bookingRef.id);
    } catch (error) {
      console.error('Error sending booking confirmation email:', error);
      // Continue despite email error - this isn't critical
    }
    
    return bookingRef.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

/**
 * Update a booking's status
 * @param bookingId The booking ID
 * @param status The new status
 */
export const changeBookingStatus = async (
  bookingId: string,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
): Promise<void> => {
  try {
    // Update booking status in Firestore
    const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
    await updateDoc(bookingRef, {
      status,
      updatedAt: new Date().toISOString()
    });
    
    // Update booking status via Netlify Function
    try {
      await updateBookingStatus(bookingId, status);
    } catch (error) {
      console.error('Error updating booking status via function:', error);
      // Continue despite function error - the local update was successful
    }
  } catch (error) {
    console.error(`Error updating booking status to ${status}:`, error);
    throw error;
  }
};

/**
 * Cancel a booking
 * @param bookingId The booking ID
 */
export const cancelBooking = async (bookingId: string): Promise<void> => {
  await changeBookingStatus(bookingId, 'cancelled');
};
