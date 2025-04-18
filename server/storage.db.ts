import { eq, and, or, isNull } from 'drizzle-orm';
import { db, users, salons, services, bookings, reviews } from './db.js';
import { IStorage } from './storage.js';
import { 
  User, InsertUser,
  Salon, InsertSalon,
  Service, InsertService,
  Booking, InsertBooking,
  Review, InsertReview
} from '../shared/schema.js';

// --- Drizzle ORM: Fix Table Type Errors ---
// Ensure correct import and usage of Drizzle ORM tables
// If using drizzle-orm v0.30+, tables must be imported and used directly from the schema object, and must have the [IsDrizzleTable] property
// Example: import { salons } from '@shared/schema';
// Make sure all db.select().from(...) and db.insert(...).values(...).returning() use the correct table objects from schema
// If you see errors about [IsDrizzleTable], ensure all packages are on the same version and imports are consistent
// Example fix:
//   import { salons } from '@shared/schema';
//   await db.select().from(salons)
// If you are using a custom type or wrapper, ensure it is not interfering with Drizzle's table typing

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  // Salon operations
  async getSalon(id: number): Promise<Salon | undefined> {
    const [salon] = await db.select().from(salons).where(eq(salons.id, id));
    return salon;
  }

  async getSalons(filters?: Partial<{
    isLadiesOnly: boolean;
    hasPrivateRooms: boolean;
    isHijabFriendly: boolean;
    city: string;
  }>): Promise<Salon[]> {
    console.log('Getting salons with filters:', filters);
    
    // Create conditions array
    const conditions: any[] = [];
    
    if (filters) {
      if (filters.isLadiesOnly !== undefined) {
        conditions.push(eq(salons.isLadiesOnly, filters.isLadiesOnly));
      }
      if (filters.hasPrivateRooms !== undefined) {
        conditions.push(eq(salons.hasPrivateRooms, filters.hasPrivateRooms));
      }
      if (filters.isHijabFriendly !== undefined) {
        conditions.push(eq(salons.isHijabFriendly, filters.isHijabFriendly));
      }
      if (filters.city !== undefined) {
        conditions.push(eq(salons.city, filters.city));
      }
    }
    
    console.log('SQL conditions:', conditions);
    
    // If we have conditions, use them in the query
    if (conditions.length > 0) {
      const result = await db.select().from(salons).where(and(...conditions));
      console.log('Filtered salons:', result);
      return result;
    }
    
    // Otherwise, get all salons
    const result = await db.select().from(salons);
    console.log('All salons:', result);
    return result;
  }

  async getSalonsWithoutImages(): Promise<Salon[]> {
    console.log('Getting salons without images');
    const result = await db.select().from(salons).where(
      or(
        isNull(salons.imageUrl),
        eq(salons.imageUrl, '')
      )
    );
    console.log('Salons without images:', result);
    return result;
  }

  async createSalon(salonData: InsertSalon): Promise<Salon> {
    const [salon] = await db.insert(salons).values(salonData).returning();
    return salon;
  }

  async updateSalon(id: number, salonData: Partial<Salon>): Promise<Salon | undefined> {
    const [updatedSalon] = await db
      .update(salons)
      .set(salonData)
      .where(eq(salons.id, id))
      .returning();
    return updatedSalon;
  }

  async getSalonsByOwner(ownerId: number): Promise<Salon[]> {
    return await db.select().from(salons).where(eq(salons.ownerId, ownerId));
  }
  
  // Service operations
  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async getServicesBySalon(salonId: number): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.salonId, salonId));
  }

  async createService(serviceData: InsertService): Promise<Service> {
    const [service] = await db.insert(services).values(serviceData).returning();
    return service;
  }

  async updateService(id: number, serviceData: Partial<Service>): Promise<Service | undefined> {
    const [updatedService] = await db
      .update(services)
      .set(serviceData)
      .where(eq(services.id, id))
      .returning();
    return updatedService;
  }

  async deleteService(id: number): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id));
    return true; // In PostgreSQL with Drizzle ORM, it doesn't return count
  }
  
  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.userId, userId));
  }

  async getBookingsBySalon(salonId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.salonId, salonId));
  }

  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(bookingData).returning();
    return booking;
  }

  async updateBookingStatus(id: number, status: Booking['status']): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }
  
  // Review operations
  async getReviewsByUser(userId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.userId, userId));
  }

  async getReviewsBySalon(salonId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.salonId, salonId));
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(reviewData).returning();
    return review;
  }

  async getAllReviews(): Promise<Review[]> {
    return await db.select().from(reviews);
  }
}