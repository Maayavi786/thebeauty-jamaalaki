/**
 * Utility for testing and verifying mock data implementation
 * This provides functions to test various aspects of the mock Firebase setup
 */

import { auth, db, mockServices } from '../../firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import * as mockData from '../mockData';

// Collection constants
const COLLECTIONS = {
  USERS: 'users',
  SALONS: 'salons',
  SERVICES: 'services',
  BOOKINGS: 'bookings',
  REVIEWS: 'reviews'
};

/**
 * Test mock authentication
 * @returns Results of authentication tests
 */
export async function testMockAuth() {
  const results = {
    success: true,
    currentUser: false,
    signIn: false,
    signOut: false,
    errors: [] as string[]
  };

  try {
    // Check if auth is defined
    if (!auth) {
      results.success = false;
      results.errors.push('Auth is not defined');
      return results;
    }

    // Check current user
    if (auth.currentUser && auth.currentUser.uid === 'user1') {
      results.currentUser = true;
    } else {
      results.errors.push('Current user not available or incorrect');
    }

    // Test sign in
    try {
      const signInResult = await auth.signInWithEmailAndPassword('test@example.com', 'password');
      if (signInResult && signInResult.user) {
        results.signIn = true;
      } else {
        results.errors.push('Sign in did not return expected user object');
      }
    } catch (error) {
      results.errors.push(`Sign in failed: ${error}`);
    }

    // Test sign out
    try {
      await auth.signOut();
      results.signOut = true;
    } catch (error) {
      results.errors.push(`Sign out failed: ${error}`);
    }

    results.success = results.currentUser && results.signIn && results.signOut;
  } catch (error) {
    results.success = false;
    results.errors.push(`Unexpected error: ${error}`);
  }

  return results;
}

/**
 * Test mock Firestore
 * @returns Results of Firestore tests
 */
export async function testMockFirestore() {
  const results = {
    success: true,
    salons: false,
    services: false,
    bookings: false,
    reviews: false,
    users: false,
    errors: [] as string[]
  };

  try {
    // Check if mockServices is defined
    if (!mockServices || !mockServices.mockFirestore) {
      results.success = false;
      results.errors.push('Mock Firestore is not defined');
      return results;
    }

    // Test salons collection
    try {
      const salonsSnapshot = await mockServices.mockFirestore.getDocs({ path: COLLECTIONS.SALONS });
      if (salonsSnapshot && salonsSnapshot.docs && salonsSnapshot.docs.length > 0) {
        const salon = salonsSnapshot.docs[0].data();
        if (salon.name_en && salon.address) {
          results.salons = true;
        } else {
          results.errors.push('Salon data structure is incorrect');
        }
      } else {
        results.errors.push('No salon data found');
      }
    } catch (error) {
      results.errors.push(`Salon fetch failed: ${error}`);
    }

    // Test services collection
    try {
      const servicesSnapshot = await mockServices.mockFirestore.getDocs({ path: COLLECTIONS.SERVICES });
      if (servicesSnapshot && servicesSnapshot.docs && servicesSnapshot.docs.length > 0) {
        const service = servicesSnapshot.docs[0].data();
        if (service.name_en && service.price !== undefined) {
          results.services = true;
        } else {
          results.errors.push('Service data structure is incorrect');
        }
      } else {
        results.errors.push('No service data found');
      }
    } catch (error) {
      results.errors.push(`Service fetch failed: ${error}`);
    }

    // Test bookings collection
    try {
      const bookingsSnapshot = await mockServices.mockFirestore.getDocs({ path: COLLECTIONS.BOOKINGS });
      if (bookingsSnapshot && bookingsSnapshot.docs && bookingsSnapshot.docs.length > 0) {
        const booking = bookingsSnapshot.docs[0].data();
        if (booking.user_id && booking.salon_id && booking.service_id) {
          results.bookings = true;
        } else {
          results.errors.push('Booking data structure is incorrect');
        }
      } else {
        results.errors.push('No booking data found');
      }
    } catch (error) {
      results.errors.push(`Booking fetch failed: ${error}`);
    }

    // Test reviews collection
    try {
      const reviewsSnapshot = await mockServices.mockFirestore.getDocs({ path: COLLECTIONS.REVIEWS });
      if (reviewsSnapshot && reviewsSnapshot.docs && reviewsSnapshot.docs.length > 0) {
        const review = reviewsSnapshot.docs[0].data();
        if (review.user_id && review.salon_id && review.rating !== undefined) {
          results.reviews = true;
        } else {
          results.errors.push('Review data structure is incorrect');
        }
      } else {
        results.errors.push('No review data found');
      }
    } catch (error) {
      results.errors.push(`Review fetch failed: ${error}`);
    }

    // Test users collection
    try {
      const usersSnapshot = await mockServices.mockFirestore.getDocs({ path: COLLECTIONS.USERS });
      if (usersSnapshot && usersSnapshot.docs && usersSnapshot.docs.length > 0) {
        const user = usersSnapshot.docs[0].data();
        if (user.email && user.fullName) {
          results.users = true;
        } else {
          results.errors.push('User data structure is incorrect');
        }
      } else {
        results.errors.push('No user data found');
      }
    } catch (error) {
      results.errors.push(`User fetch failed: ${error}`);
    }

    results.success = results.salons && results.services && results.bookings && results.reviews && results.users;
  } catch (error) {
    results.success = false;
    results.errors.push(`Unexpected error: ${error}`);
  }

  return results;
}

/**
 * Test CRUD operations on mock Firestore
 * @returns Results of CRUD tests
 */
export async function testMockCrud() {
  const results = {
    success: true,
    create: false,
    read: false,
    update: false,
    delete: false,
    errors: [] as string[]
  };

  try {
    // Check if mockServices is defined
    if (!mockServices || !mockServices.mockFirestore) {
      results.success = false;
      results.errors.push('Mock Firestore is not defined');
      return results;
    }

    // Test create
    let docId: string | undefined;
    try {
      const newBooking = {
        user_id: 'user1',
        salon_id: 'salon1',
        service_id: 'service1',
        date: '2025-05-30',
        time: '14:30',
        status: 'pending',
        payment_status: 'pending',
        notes: 'Test booking created by CRUD test utility'
      };
      
      const docRef = await mockServices.mockFirestore.addDoc({ path: COLLECTIONS.BOOKINGS }, newBooking);
      if (docRef && docRef.id) {
        docId = docRef.id;
        results.create = true;
      } else {
        results.errors.push('Create operation did not return document ID');
      }
    } catch (error) {
      results.errors.push(`Create operation failed: ${error}`);
    }

    // Test read (if create was successful)
    if (docId) {
      try {
        const docRef = { path: `${COLLECTIONS.BOOKINGS}/${docId}` };
        const docSnapshot = await mockServices.mockFirestore.getDoc(docRef);
        if (docSnapshot && docSnapshot.exists()) {
          const booking = docSnapshot.data();
          if (booking && booking.notes === 'Test booking created by CRUD test utility') {
            results.read = true;
          } else {
            results.errors.push('Read operation returned incorrect document');
          }
        } else {
          results.errors.push('Read operation did not find created document');
        }
      } catch (error) {
        results.errors.push(`Read operation failed: ${error}`);
      }
    }

    // Test update (if read was successful)
    if (results.read && docId) {
      try {
        const docRef = { path: `${COLLECTIONS.BOOKINGS}/${docId}` };
        const updateData = {
          status: 'confirmed',
          notes: 'Test booking updated by CRUD test utility'
        };
        
        const updateResult = await mockServices.mockFirestore.updateDoc(docRef, updateData);
        if (updateResult === true) {
          // Verify update was successful
          const docSnapshot = await mockServices.mockFirestore.getDoc(docRef);
          if (docSnapshot.exists() && docSnapshot.data().status === 'confirmed') {
            results.update = true;
          } else {
            results.errors.push('Update operation did not modify document');
          }
        } else {
          results.errors.push('Update operation failed');
        }
      } catch (error) {
        results.errors.push(`Update operation failed: ${error}`);
      }
    }

    // Test delete (if update was successful)
    if (results.update && docId) {
      try {
        const docRef = { path: `${COLLECTIONS.BOOKINGS}/${docId}` };
        const deleteResult = await mockServices.mockFirestore.deleteDoc(docRef);
        if (deleteResult === true) {
          results.delete = true;
        } else {
          results.errors.push('Delete operation failed');
        }
      } catch (error) {
        results.errors.push(`Delete operation failed: ${error}`);
      }
    }

    results.success = results.create && results.read && results.update && results.delete;
  } catch (error) {
    results.success = false;
    results.errors.push(`Unexpected error: ${error}`);
  }

  return results;
}

/**
 * Run all mock data tests
 * @returns Results of all tests
 */
export async function runAllMockTests() {
  return {
    auth: await testMockAuth(),
    firestore: await testMockFirestore(),
    crud: await testMockCrud()
  };
}
