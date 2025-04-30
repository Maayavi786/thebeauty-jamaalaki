import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_BASE_URL, USE_FIREBASE } from "./config";
// Import Firebase utilities for direct API interactions
import { auth, mockServices } from "./firebase";
import { collection, getDocs, getDoc, doc, query, where, addDoc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { COLLECTIONS } from "./firestore/schema";

// Determine if we should use mock data for local testing
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

interface ApiError extends Error {
  status?: number;
  code?: string;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const error: ApiError = new Error();
    error.status = res.status;
    
    try {
      const data = await res.json();
      error.message = data.message || res.statusText;
      error.code = data.code;
    } catch {
      error.message = res.statusText;
    }
    
    throw error;
  }
}

function normalizeEndpoint(endpoint: string): string {
  // Ensure endpoint starts with a single slash
  let normalized = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Don't add /api if it already starts with /api
  if (normalized.startsWith('/api/')) {
    return normalized;
  }
  
  // Handle the special case where endpoint is just '/api'
  if (normalized === '/api') {
    normalized = '/';
  }
  
  // Add /api prefix
  return '/api' + normalized;
}

export const apiRequest = async (method: string, endpoint: string, data?: any, headers?: Record<string, string>) => {
  // If using Firebase, handle API requests directly with Firebase SDK
  if (USE_FIREBASE) {
    return handleFirebaseRequest(method, endpoint, data);
  }
  
  // Legacy Express API handling
  const normalizedEndpoint = normalizeEndpoint(endpoint);
  let url = `${API_BASE_URL}${normalizedEndpoint}`;
  
  if (import.meta.env.DEV) {
    console.log('apiRequest URL:', url, 'endpoint:', endpoint, 'normalizedEndpoint:', normalizedEndpoint, 'API_BASE_URL:', API_BASE_URL);
    console.log(`API Request: ${method} ${url}`);
  }
  
  // For get requests with data, convert to query params
  if (method.toUpperCase() === 'GET' && data) {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, String(value));
      }
    });
    
    const paramsString = params.toString();
    if (paramsString) {
      url += `?${paramsString}`;
    }
  }
  
  const options: RequestInit = {
    method: method.toUpperCase(),
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    credentials: 'include', // Send cookies with the request
  };
  
  // Add body for non-GET requests
  if (method.toUpperCase() !== 'GET' && data) {
    options.body = JSON.stringify(data);
  }
  
  if (import.meta.env.DEV) {
    console.log(`Sending ${method} request to ${url}`);
  }
  
  try {
    const res = await fetch(url, options);
    await throwIfResNotOk(res);
    
    // For 204 No Content responses, return nothing
    if (res.status === 204) {
      return null;
    }
    
    return await res.json();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.log(`API Request failed: ${method} ${url}`, error);
    }
    throw error;
  }
};

// Handle Firebase requests directly using the Firebase SDK
async function handleFirebaseRequest(method: string, endpoint: string, data?: any) {
  const DEBUG = import.meta.env.DEV || import.meta.env.VITE_FIREBASE_DEBUG === 'true';
  
  if (DEBUG) {
    console.log(`[Firebase] Request: ${method} ${endpoint}`, data || '');
  }
  
  // Use mock implementation if USE_MOCK is true
  if (USE_MOCK && mockServices) {
    return handleMockFirebaseRequest(method, endpoint, data);
  }
  
  try {
    // Parse the endpoint to determine the collection/document path
    const path = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const segments = path.split('/');
    
    // Extract collection and optional document ID
    let collectionName: string = "";
    let documentId: string = "";
    
    // Map API endpoints to Firestore collections
    if (path.startsWith('api/')) {
      // Remove 'api/' prefix for parsing
      const apiPath = path.slice(4);
      const apiSegments = apiPath.split('/');
      
      // Handle different API endpoints
      if (apiSegments[0] === 'salons') {
        collectionName = COLLECTIONS.SALONS;
        if (apiSegments.length > 1) documentId = apiSegments[1];
        // We can handle subcollections later if needed
      } else if (apiSegments[0] === 'services') {
        collectionName = COLLECTIONS.SERVICES;
        if (apiSegments.length > 1) documentId = apiSegments[1];
      } else if (apiSegments[0] === 'bookings') {
        collectionName = COLLECTIONS.BOOKINGS;
        if (apiSegments.length > 1) documentId = apiSegments[1];
      } else if (apiSegments[0] === 'reviews') {
        collectionName = COLLECTIONS.REVIEWS;
        if (apiSegments.length > 1) documentId = apiSegments[1];
      } else if (apiSegments[0] === 'auth' && apiSegments[1] === 'session') {
        // Special case for auth session
        return handleAuthSession();
      }
    } else {
      // Direct collection access (without api/ prefix)
      collectionName = segments[0];
      if (segments.length > 1) documentId = segments[1];
      // We can handle subcollections later if needed
    }
    
    // Handle different HTTP methods
    switch (method.toUpperCase()) {
      case 'GET':
        // Fetching a specific document
        if (documentId) {
          const docRef = doc(db, collectionName, documentId);
          const docSnapshot = await getDoc(docRef);
          
          if (!docSnapshot.exists()) {
            throw { status: 404, message: 'Document not found' };
          }
          
          return { id: docSnapshot.id, ...docSnapshot.data() };
        }
        
        // Collection query with potential filters
        let queryRef = collection(db, collectionName);
        let queryConstraints: any[] = [];
        
        // Add query constraints based on data
        if (data) {
          Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              queryConstraints.push(where(key, '==', value));
            }
          });
        }
        
        // Execute query
        const querySnapshot = await getDocs(query(queryRef, ...queryConstraints));
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
      case 'POST':
        // Creating a new document
        const addResult = await addDoc(collection(db, collectionName), {
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        return { id: addResult.id, ...data };
        
      case 'PUT':
      case 'PATCH':
        // Updating an existing document
        if (!documentId) {
          throw { status: 400, message: 'Document ID is required for updates' };
        }
        
        const updateData = {
          ...data,
          updatedAt: new Date().toISOString()
        };
        
        await updateDoc(doc(db, collectionName, documentId), updateData);
        return { id: documentId, ...updateData };
        
      case 'DELETE':
        // Deleting a document
        if (!documentId) {
          throw { status: 400, message: 'Document ID is required for deletion' };
        }
        
        await deleteDoc(doc(db, collectionName, documentId));
        return { success: true };
        
      default:
        throw { status: 405, message: `Method ${method} not supported` };
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Firebase request error:', error);
    }
    throw error;
  }
}

// Mock implementation of Firebase requests
async function handleMockFirebaseRequest(method: string, endpoint: string, data?: any) {
  // Enable debug logs within mock handler
  const DEBUG = import.meta.env.DEV || import.meta.env.VITE_FIREBASE_DEBUG === 'true';
  if (DEBUG) {
    console.log(`[MockFirebase] Request: ${method} ${endpoint}`, data || '');
  }
  
  try {
    // Handle auth session endpoint specifically
    if (endpoint.includes('/auth/session')) {
      return handleMockAuthSession();
    }
    
    // Parse the endpoint to determine the collection/document path
    const path = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const segments = path.split('/');
    
    // Extract collection and optional document ID and subcollection
    let collectionName = '';
    let documentId = '';
    
    // Map API endpoints to Firestore collections
    if (path.startsWith('api/')) {
      // Remove 'api/' prefix for parsing
      const apiPath = path.slice(4);
      const apiSegments = apiPath.split('/');
      
      // Handle different API endpoints
      if (apiSegments[0] === 'salons') {
        collectionName = 'salons';
        if (apiSegments.length > 1) documentId = apiSegments[1];
      } else if (apiSegments[0] === 'services') {
        collectionName = 'services';
        if (apiSegments.length > 1) documentId = apiSegments[1];
      } else if (apiSegments[0] === 'bookings') {
        collectionName = 'bookings';
        if (apiSegments.length > 1) documentId = apiSegments[1];
      } else if (apiSegments[0] === 'reviews') {
        collectionName = 'reviews';
        if (apiSegments.length > 1) documentId = apiSegments[1];
      } else if (apiSegments[0] === 'users') {
        collectionName = 'users';
        if (apiSegments.length > 1) documentId = apiSegments[1];
      }
    } else {
      // Direct collection access (without api/ prefix)
      collectionName = segments[0];
      if (segments.length > 1) documentId = segments[1];
    }
    
    // Get mockData object based on collection name
    const getCollection = () => {
      switch (collectionName) {
        case 'salons':
        case COLLECTIONS.SALONS:
          return mockServices?.mockFirestore.getDocs({ path: 'salons' });
        case 'services':
        case COLLECTIONS.SERVICES:
          return mockServices?.mockFirestore.getDocs({ path: 'services' });
        case 'bookings':
        case COLLECTIONS.BOOKINGS:
          return mockServices?.mockFirestore.getDocs({ path: 'bookings' });
        case 'reviews':
        case COLLECTIONS.REVIEWS:
          return mockServices?.mockFirestore.getDocs({ path: 'reviews' });
        case 'users':
        case COLLECTIONS.USERS:
          return mockServices?.mockFirestore.getDocs({ path: 'users' });
        default:
          return { docs: [] };
      }
    };
    
    // Handle different HTTP methods
    switch (method.toUpperCase()) {
      case 'GET':
        // Fetching a specific document
        if (documentId) {
          const docPath = `${collectionName}/${documentId}`;
          const docRef = { path: docPath };
          const docSnapshot = await mockServices?.mockFirestore.getDoc(docRef);
          
          if (!docSnapshot?.exists()) {
            throw { status: 404, message: 'Document not found' };
          }
          
          return { id: documentId, ...docSnapshot.data() };
        }
        
        // Collection query
        const querySnapshot = await getCollection();
        return querySnapshot?.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) || [];
        
      case 'POST':
        // Creating a new document
        // Mock document creation
        const newDoc = {
          id: `mock-${Date.now()}`,
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        return { id: newDoc.id, ...data };
        
      case 'PUT':
      case 'PATCH':
        // Updating an existing document
        if (!documentId) {
          throw { status: 400, message: 'Document ID is required for updates' };
        }
        
        const updateData = {
          ...data,
          updatedAt: new Date().toISOString()
        };
        
        return { id: documentId, ...updateData };
        
      case 'DELETE':
        // Deleting a document
        if (!documentId) {
          throw { status: 400, message: 'Document ID is required for deletion' };
        }
        
        return { success: true };
        
      default:
        throw { status: 405, message: `Method ${method} not supported` };
    }
  } catch (error) {
    console.error('[MockFirebase] Request error:', error);
    throw error;
  }
}

// Mock implementation of auth session
async function handleMockAuthSession() {
  // Return mock user data
  return {
    user: {
      id: 'user1',
      email: 'customer@example.com',
      name: 'Test Customer',
      role: 'customer',
      preferredLanguage: 'en',
      photoURL: 'https://via.placeholder.com/150',
      createdAt: new Date().toISOString()
    }
  };
}

// Special handler for auth session
async function handleAuthSession() {
  const DEBUG = import.meta.env.DEV || import.meta.env.VITE_FIREBASE_DEBUG === 'true';
  
  try {
    // Get current user with a Promise to ensure we have the latest state
    // This handles the initialization delay better than auth.currentUser
    await new Promise(resolve => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        unsubscribe();
        resolve(user);
      });
    });
    
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      if (DEBUG) console.log('[Firebase] No authenticated user found');
      return { user: null };
    }
    
    if (DEBUG) console.log('[Firebase] Current user:', currentUser.uid);
    
    // Get user document from Firestore
    const userDocRef = doc(db, COLLECTIONS.USERS, currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    // If user document doesn't exist in Firestore but we have an auth user,
    // create a basic user profile
    if (!userDoc.exists()) {
      if (DEBUG) console.log('[Firebase] Creating new user document for:', currentUser.uid);
      
      // Default user data
      const defaultUserData = {
        uid: currentUser.uid,
        email: currentUser.email,
        fullName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
        role: 'customer',
        preferredLanguage: 'en',
        photoURL: currentUser.photoURL,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Create the user document
      try {
        await setDoc(userDocRef, defaultUserData);
        
        // Return the newly created user data
        return {
          user: {
            id: currentUser.uid,
            name: defaultUserData.fullName,
            preferredLanguage: defaultUserData.preferredLanguage,
            photoURL: defaultUserData.photoURL,
            createdAt: defaultUserData.createdAt,
            updatedAt: defaultUserData.updatedAt,
            email: currentUser.email,
            role: defaultUserData.role
          }
        };
      } catch (createError) {
        console.error('[Firebase] Error creating user document:', createError);
        // Still return basic user info even if Firestore creation fails
        return {
          user: {
            id: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName || 'User',
            role: 'customer'
          }
        };
      }
    }
    
    // Normal flow - return existing user data
    const userData = userDoc.data();
    
    return {
      user: {
        id: currentUser.uid,
        name: userData.fullName || currentUser.displayName,
        preferredLanguage: userData.preferredLanguage || 'en',
        photoURL: userData.photoURL || currentUser.photoURL,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        email: currentUser.email,
        role: userData.role || 'customer'
      }
    };
  } catch (error) {
    console.error('[Firebase] Auth session error:', error);
    return { user: null };
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      // Normalize the endpoint path before making the request
      const endpoint = queryKey[0] as string;
      const normalizedEndpoint = normalizeEndpoint(endpoint);
      const url = `${API_BASE_URL}${normalizedEndpoint}`;
      console.log('React Query fetch:', url);
      
      const res = await fetch(url, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      if (error instanceof Error) {
        const apiError = error as ApiError;
        if (apiError.status === 401 && unauthorizedBehavior === "returnNull") {
          return null;
        }
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      retry: (failureCount, error) => {
        const apiError = error as ApiError;
        // Don't retry on 401 or 403
        if (apiError.status === 401 || apiError.status === 403) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: false,
    },
  },
});
