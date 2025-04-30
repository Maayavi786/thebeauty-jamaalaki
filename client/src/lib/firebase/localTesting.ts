/**
 * Local testing utilities for Firebase integration
 * This provides mock implementations of Firebase functionality for local testing
 */

import * as mockData from './mockData';

// Mock user authentication
export const mockCurrentUser = {
  uid: 'user1',
  email: 'customer@example.com',
  displayName: 'Test Customer',
  photoURL: 'https://via.placeholder.com/150',
  emailVerified: true,
  getIdToken: async () => 'mock-id-token-for-testing-purposes-only'
};

// Flag to use mock data (controlled by environment)
export const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Debug logging utility
const DEBUG = import.meta.env.DEV || import.meta.env.VITE_FIREBASE_DEBUG === 'true';
export const logDebug = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[MockFirebase] ${message}`, data || '');
  }
};

// Mock Firestore functions
export const mockFirestore = {
  // Get a document from a collection
  getDoc: async (docRef: { path: string }) => {
    logDebug(`Mock getDoc: ${docRef.path}`);
    const pathParts = docRef.path.split('/');
    const collectionName = pathParts[0];
    const docId = pathParts[1];
    
    switch (collectionName) {
      case 'users':
        const user = mockData.getMockUser(docId);
        return {
          exists: () => !!user,
          data: () => user,
          id: docId
        };
      case 'salons':
        const salon = mockData.getMockSalon(docId);
        return {
          exists: () => !!salon,
          data: () => salon,
          id: docId
        };
      case 'services':
        const service = mockData.getMockService(docId);
        return {
          exists: () => !!service,
          data: () => service,
          id: docId
        };
      case 'bookings':
        const booking = mockData.getMockBooking(docId);
        return {
          exists: () => !!booking,
          data: () => booking,
          id: docId
        };
      default:
        return {
          exists: () => false,
          data: () => null,
          id: docId
        };
    }
  },
  
  // Get documents from a collection (with optional query)
  getDocs: async (queryRef: { path: string, filters?: {field: string, value: any}[] }) => {
    logDebug(`Mock getDocs: ${queryRef.path}`, queryRef.filters);
    const collectionName = queryRef.path;
    let results: any[] = [];
    
    switch (collectionName) {
      case 'users':
        results = mockData.mockUsers;
        break;
      case 'salons':
        results = mockData.mockSalons;
        break;
      case 'services':
        results = mockData.mockServices;
        break;
      case 'bookings':
        results = mockData.mockBookings;
        break;
      case 'reviews':
        results = mockData.mockReviews;
        break;
      default:
        results = [];
    }
    
    // Apply filters if provided
    if (queryRef.filters && queryRef.filters.length > 0) {
      queryRef.filters.forEach(filter => {
        results = results.filter(item => item[filter.field] === filter.value);
      });
    }
    
    return {
      docs: results.map(doc => ({
        exists: () => true,
        data: () => doc,
        id: doc.id
      })),
      empty: results.length === 0
    };
  },
  
  // Add a document to a collection
  addDoc: async (collectionRef: { path: string }, data: any) => {
    logDebug(`Mock addDoc to ${collectionRef.path}`, data);
    const collectionName = collectionRef.path;
    const newId = `mock-${collectionName}-${Date.now()}`;
    const newDoc = {
      id: newId,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // In a real app, this would add to the database
    // For mock purposes, we're just returning the new document
    return {
      id: newId,
      path: `${collectionName}/${newId}`
    };
  },
  
  // Update a document in a collection
  updateDoc: async (docRef: { path: string }, data: any) => {
    logDebug(`Mock updateDoc: ${docRef.path}`, data);
    // In a real app, this would update the database
    // For mock purposes, we're just logging it
    return true;
  },
  
  // Delete a document from a collection
  deleteDoc: async (docRef: { path: string }) => {
    logDebug(`Mock deleteDoc: ${docRef.path}`);
    // In a real app, this would delete from the database
    // For mock purposes, we're just logging it
    return true;
  },
  
  // Set a document in a collection
  setDoc: async (docRef: { path: string }, data: any) => {
    logDebug(`Mock setDoc: ${docRef.path}`, data);
    // In a real app, this would set the document in the database
    // For mock purposes, we're just logging it
    return true;
  }
};

// Mock authentication functions
export const mockAuth = {
  // Get the current user
  currentUser: mockCurrentUser,
  
  // Sign in with email and password
  signInWithEmailAndPassword: async (email: string, password: string) => {
    logDebug(`Mock sign in with: ${email}`);
    if (email.includes('error')) {
      throw new Error('Mock authentication error');
    }
    return { user: mockCurrentUser };
  },
  
  // Create user with email and password
  createUserWithEmailAndPassword: async (email: string, password: string) => {
    logDebug(`Mock create user with: ${email}`);
    if (email.includes('error')) {
      throw new Error('Mock user creation error');
    }
    return { user: mockCurrentUser };
  },
  
  // Sign out
  signOut: async () => {
    logDebug('Mock sign out');
    return true;
  },
  
  // Send password reset email
  sendPasswordResetEmail: async (email: string) => {
    logDebug(`Mock password reset for: ${email}`);
    return true;
  },
  
  // Update user profile
  updateProfile: async (user: any, profileData: any) => {
    logDebug(`Mock update profile for user: ${user.uid}`, profileData);
    return true;
  },
  
  // Send email verification
  sendEmailVerification: async (user: any) => {
    logDebug(`Mock email verification for user: ${user.uid}`);
    return true;
  },
  
  // Update email
  updateEmail: async (user: any, email: string) => {
    logDebug(`Mock update email for user: ${user.uid} to ${email}`);
    return true;
  },
  
  // Update password
  updatePassword: async (user: any, password: string) => {
    logDebug(`Mock update password for user: ${user.uid}`);
    return true;
  },
  
  // Mock onAuthStateChanged
  onAuthStateChanged: (callback: (user: any) => void) => {
    // Call the callback immediately with the mock user
    setTimeout(() => {
      callback(mockCurrentUser);
    }, 100);
    
    // Return an unsubscribe function
    return () => {
      logDebug('Mock unsubscribe from auth state changes');
    };
  },
  
  // Sign in with popup (for Google auth)
  signInWithPopup: async (provider: any) => {
    logDebug(`Mock sign in with popup: ${provider.providerId}`);
    return { user: mockCurrentUser };
  }
};

// Helper to create mock document references
export const mockDoc = (db: any, collection: string, id: string) => {
  return {
    path: `${collection}/${id}`,
    id: id,
    collection: collection
  };
};

// Helper to create mock collection references
export const mockCollection = (db: any, collection: string) => {
  return {
    path: collection
  };
};

// Helper to create mock queries
export const mockQuery = (collectionRef: any, ...queryConstraints: any[]) => {
  const filters = queryConstraints.map(constraint => {
    if (constraint.type === 'where') {
      return {
        field: constraint.field,
        value: constraint.value
      };
    }
    return null;
  }).filter(Boolean);
  
  return {
    path: collectionRef.path,
    filters: filters
  };
};

// Helper to create mock where clause
export const mockWhere = (field: string, operator: string, value: any) => {
  return {
    type: 'where',
    field: field,
    operator: operator,
    value: value
  };
};
