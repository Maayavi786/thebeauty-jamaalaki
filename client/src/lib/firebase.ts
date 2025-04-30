// Firebase configuration
import { initializeApp, FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getMessaging, isSupported } from 'firebase/messaging';

// Import mock implementations for local testing
import { mockAuth, mockFirestore, useMockData, logDebug as mockLog } from './firebase/localTesting';

// Import emulator connection utilities
import { connectToEmulators, useEmulators } from './firebase/emulators';

// Flag for debug logging
const DEBUG = import.meta.env.DEV || import.meta.env.VITE_FIREBASE_DEBUG === 'true';

// Helper for safe logging
const safeLog = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[Firebase] ${message}`, data || '');
  }
};

// Firebase configuration from environment variables
const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Check if Firebase config is valid
const isValidConfig = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.authDomain && 
  firebaseConfig.projectId
);

// For development fallback (remove in production)
if (!isValidConfig) {
  console.warn('Firebase config not found in environment variables. Using development config.');
  // Default development configuration - DO NOT use in production
  Object.assign(firebaseConfig, {
    apiKey: "AIzaSyDevelopmentKeyNotForProduction",
    authDomain: "thebeauty-dev.firebaseapp.com",
    projectId: "thebeauty-dev",
    storageBucket: "thebeauty-dev.appspot.com",
    messagingSenderId: "000000000000",
    appId: "1:000000000000:web:0000000000000000000000",
    measurementId: "G-DEVELOPMENT0"
  });
}

let app;
try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  safeLog('Firebase initialized successfully', { projectId: firebaseConfig.projectId });
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw new Error('Failed to initialize Firebase. Check your configuration.');
}

// Initialize services with error handling
const realAuth = getAuth(app);
const realDb = getFirestore(app);
const realStorage = getStorage(app);
const realFunctions = getFunctions(app);

// Determine if we should use mock implementations for local testing
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Determine if we should use emulators for local development
const USE_EMULATORS = useEmulators();

// Connect to emulators if configured
if (USE_EMULATORS && !USE_MOCK) {
  connectToEmulators(realAuth, realDb, realStorage, realFunctions);
  safeLog('Connected to Firebase emulators');
}

// Export real or mock services based on configuration
export const auth = USE_MOCK ? mockAuth : realAuth;
export const db = realDb; // We'll keep the real db reference but use mock functions in queryClient
export const storage = realStorage;
export const functions = realFunctions;

// Export mock utilities for direct access in components if needed
export const mockServices = USE_MOCK ? { mockFirestore, mockAuth } : null;

// Create a messaging instance if supported by the browser
export const messaging = async () => {
  if (await isSupported()) {
    try {
      return getMessaging(app);
    } catch (error) {
      console.error('Error initializing Firebase messaging:', error);
      return null;
    }
  }
  return null;
};

if (USE_MOCK) {
  mockLog('Using mock Firebase implementation for local testing');
}

// Connect to emulators in development mode
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    safeLog('Connected to Firebase emulators');
  } catch (error) {
    console.warn('Error connecting to Firebase emulators:', error);
  }
}

// Initialize messaging conditionally (browser support check)
export const initializeMessaging = async () => {
  try {
    if (await isSupported()) {
      const messaging = getMessaging(app);
      safeLog('Firebase messaging initialized');
      return messaging;
    }
    safeLog('Firebase messaging not supported in this browser');
    return null;
  } catch (error) {
    console.error('Error initializing Firebase messaging:', error);
    return null;
  }
};

export default app;
