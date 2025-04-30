/**
 * Test setup file for Vitest
 * This configures the test environment for Firebase mock testing
 */

import { vi } from 'vitest';

// Mock environment variables
vi.mock('../lib/config', () => ({
  API_BASE_URL: '',
  USE_FIREBASE: true,
}));

// Set environment variables for mock Firebase
vi.stubEnv('VITE_USE_MOCK_DATA', 'true');
vi.stubEnv('VITE_USE_FIREBASE', 'true');
vi.stubEnv('VITE_USE_FIREBASE_EMULATORS', 'false');

// Mock console methods to reduce noise during tests
console.log = vi.fn();
console.warn = vi.fn();
console.error = vi.fn();
