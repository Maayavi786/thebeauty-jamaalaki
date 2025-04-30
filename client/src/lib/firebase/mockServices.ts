/**
 * Mock Firebase services implementation for local testing
 */

import { mockSalons, mockServices as mockServicesData } from './mockData';
import { getMockAllBookings, getMockBooking, getMockUserBookings } from './mockBookings';

// Create document snapshots with Firestore-like structure
const createDocSnapshotFromData = (data: any) => ({
  id: data.id,
  exists: () => true,
  data: () => ({ ...data })
});

// Mock Firestore collection/document get operations with proper Firestore-like structure
export const mockServices = {
  mockFirestore: {
    // Get a collection of documents - returns a Firestore-like response
    getDocs: ({ path }: { path: string }) => {
      let data = [];
      switch (path) {
        case 'salons':
          data = mockSalons;
          break;
        case 'services':
          data = mockServicesData;
          break;
        case 'bookings':
          data = getMockAllBookings();
          break;
        default:
          data = [];
      }
      
      // Return with structure matching Firestore's getDocs result
      return {
        docs: data.map(item => createDocSnapshotFromData(item)),
        size: data.length,
        empty: data.length === 0
      };
    },
    
    // Get a single document by ID - returns a Firestore-like document snapshot
    getDoc: ({ path }: { path: string }) => {
      const [collection, docId] = path.split('/');
      let foundItem = null;
      
      switch (collection) {
        case 'salons':
          foundItem = mockSalons.find(salon => salon.id === docId);
          break;
        case 'services':
          foundItem = mockServicesData.find(service => service.id === docId);
          break;
        case 'bookings':
          foundItem = getMockBooking(docId);
          break;
      }
      
      if (!foundItem) {
        return {
          exists: () => false,
          data: () => null
        };
      }
      
      return createDocSnapshotFromData(foundItem);
    },
    
    // Query documents with filters - returns a Firestore-like query snapshot
    query: ({ path, filters = [] }: { path: string; filters?: any[] }) => {
      let data = [];
      
      switch (path) {
        case 'salons':
          data = [...mockSalons];
          break;
        case 'services':
          data = [...mockServicesData];
          break;
        case 'bookings':
          data = getMockAllBookings();
          break;
        default:
          data = [];
      }
      
      // Apply simple filtering
      if (filters && filters.length > 0) {
        filters.forEach(filter => {
          if (filter.field && filter.value) {
            data = data.filter(item => item[filter.field] === filter.value);
          }
        });
      }
      
      return {
        docs: data.map(item => createDocSnapshotFromData(item)),
        size: data.length,
        empty: data.length === 0
      };
    }
  }
};
