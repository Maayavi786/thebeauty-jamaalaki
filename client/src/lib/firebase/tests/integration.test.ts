/**
 * Integration tests for the Firebase implementation
 * These tests verify that our mock Firebase data works with the application
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { auth, db, mockServices } from '@/lib/firebase';
import { handleMockFirebaseRequest } from '@/lib/queryClient';

// Collection constants
const COLLECTIONS = {
  USERS: 'users',
  SALONS: 'salons',
  SERVICES: 'services',
  BOOKINGS: 'bookings',
  REVIEWS: 'reviews'
};

describe('Firebase Integration Tests', () => {
  describe('Mock Data Access', () => {
    it('should fetch salons from mock data', async () => {
      const result = await handleMockFirebaseRequest('GET', '/api/salons');
      expect(result).toBeDefined();
      expect(Array.isArray(result.salons)).toBe(true);
      expect(result.salons.length).toBeGreaterThan(0);
      expect(result.salons[0]).toHaveProperty('name_en');
    });

    it('should fetch services from mock data', async () => {
      const result = await handleMockFirebaseRequest('GET', '/api/services');
      expect(result).toBeDefined();
      expect(Array.isArray(result.services)).toBe(true);
      expect(result.services.length).toBeGreaterThan(0);
      expect(result.services[0]).toHaveProperty('name_en');
      expect(result.services[0]).toHaveProperty('price');
    });
    
    it('should fetch a single salon by ID', async () => {
      const result = await handleMockFirebaseRequest('GET', '/api/salons/salon1');
      expect(result).toBeDefined();
      expect(result.salon).toBeDefined();
      expect(result.salon.id).toBe('salon1');
    });
    
    it('should handle auth session', async () => {
      const result = await handleMockFirebaseRequest('GET', '/api/auth/session');
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('customer@example.com');
    });
  });
  
  describe('Mock Firebase CRUD Operations', () => {
    it('should create a new booking', async () => {
      const newBooking = {
        user_id: 'user1',
        salon_id: 'salon1',
        service_id: 'service1',
        date: '2025-05-15',
        time: '14:00',
        status: 'pending',
        payment_status: 'pending'
      };
      
      const result = await handleMockFirebaseRequest('POST', '/api/bookings', newBooking);
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });
    
    it('should update a booking', async () => {
      const updateData = {
        status: 'confirmed'
      };
      
      const result = await handleMockFirebaseRequest('PATCH', '/api/bookings/booking1', updateData);
      expect(result).toBe(true);
    });
    
    it('should handle filtering salon services', async () => {
      const result = await handleMockFirebaseRequest('GET', '/api/salons/salon1/services');
      expect(result).toBeDefined();
      expect(Array.isArray(result.services)).toBe(true);
      expect(result.services.length).toBeGreaterThan(0);
      expect(result.services.every(service => service.salon_id === 'salon1')).toBe(true);
    });
  });
});
