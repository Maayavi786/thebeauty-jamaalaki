/**
 * Firebase Emulator Configuration
 * Configures the Firebase SDK to use local emulators for development
 */

import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectStorageEmulator } from 'firebase/storage';
import { connectFunctionsEmulator } from 'firebase/functions';

// Debug flag for logging
const DEBUG = import.meta.env.DEV || import.meta.env.VITE_FIREBASE_DEBUG === 'true';

/**
 * Configure Firebase to use local emulators
 * This function is called when VITE_USE_FIREBASE_EMULATORS is set to true
 */
export const connectToEmulators = (
  auth: any, 
  firestore: any, 
  storage: any, 
  functions: any
) => {
  if (DEBUG) {
    console.log('[Firebase] Connecting to local emulators...');
  }

  // Connect to Auth Emulator
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: !DEBUG });
    if (DEBUG) console.log('[Firebase] Connected to Auth Emulator');
  } catch (error) {
    console.error('[Firebase] Failed to connect to Auth Emulator:', error);
  }

  // Connect to Firestore Emulator
  try {
    connectFirestoreEmulator(firestore, 'localhost', 8080);
    if (DEBUG) console.log('[Firebase] Connected to Firestore Emulator');
  } catch (error) {
    console.error('[Firebase] Failed to connect to Firestore Emulator:', error);
  }

  // Connect to Storage Emulator
  try {
    connectStorageEmulator(storage, 'localhost', 9199);
    if (DEBUG) console.log('[Firebase] Connected to Storage Emulator');
  } catch (error) {
    console.error('[Firebase] Failed to connect to Storage Emulator:', error);
  }

  // Connect to Functions Emulator
  try {
    connectFunctionsEmulator(functions, 'localhost', 5001);
    if (DEBUG) console.log('[Firebase] Connected to Functions Emulator');
  } catch (error) {
    console.error('[Firebase] Failed to connect to Functions Emulator:', error);
  }

  if (DEBUG) {
    console.log('[Firebase] All emulator connections established');
  }
};

/**
 * Check if the Firebase emulators are enabled
 * @returns boolean indicating if emulators should be used
 */
export const useEmulators = (): boolean => {
  return import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';
};
