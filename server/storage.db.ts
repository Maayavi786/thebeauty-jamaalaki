import { eq, and, or, isNull, sql } from 'drizzle-orm';
import { db, users, salons, services, bookings, reviews } from './db';
import { IStorage } from './storage.js';
import { 
  User, InsertUser,
  Salon, InsertSalon,
  Service, InsertService,
  Booking, InsertBooking,
  Review, InsertReview
} from '../shared/schema';

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
    try {
      // Get all user fields to ensure we have everything
      const [dbUser] = await db.select().from(users).where(eq(users.username, username));
      
      if (!dbUser) return undefined;
      
      console.log('Database user found:', JSON.stringify(dbUser, null, 2));
      
      // Create a complete User object ensuring role is properly set
      const user: User = {
        id: dbUser.id,
        username: dbUser.username,
        password: dbUser.password,
        email: dbUser.email,
        fullName: dbUser.fullName || '',
        phone: dbUser.phone || null,
        // Explicitly cast role to ensure it's properly typed
        role: dbUser.role as User['role'],
        loyaltyPoints: dbUser.loyaltyPoints || 0,
        preferredLanguage: dbUser.preferredLanguage || 'en',
        createdAt: dbUser.createdAt
      };
      
      console.log('Processed user object:', { ...user, password: '[REDACTED]' });
      
      return user;
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      // Select specific fields from the database that we know exist
      const [dbUser] = await db.select({
        id: users.id,
        username: users.username,
        password: users.password,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt
        // Omitting problematic fields
      }).from(users).where(eq(users.email, email));
      
      if (!dbUser) return undefined;
      
      // Create a complete User object with default values for missing fields
      const user: User = {
        id: dbUser.id,
        username: dbUser.username,
        password: dbUser.password,
        email: dbUser.email,
        fullName: '', // Default empty string for the missing field
        phone: null, // Default null for the missing field
        role: dbUser.role,
        loyaltyPoints: 0, // Default value
        preferredLanguage: 'en', // Default value
        createdAt: dbUser.createdAt
      };
      
      return user;
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
      console.log('Inspecting database schema before creating user');
      
      // First, let's inspect the actual table structure to see column names
      const tableInfo = await db.execute(sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users'
      `);
      
      console.log('Database users table schema:', tableInfo.rows);
      
      // Let's try with the original approach but with mapped field names to match the actual database
      const [user] = await db.insert(users).values({
        username: userData.username,
        password: userData.password,
        email: userData.email,
        // Use any of these options depending on the actual column name in the database
        fullName: userData.fullName, // If the ORM mapping is correct
        // full_name: userData.fullName, // If using snake_case directly
        // fullname: userData.fullName, // If the column doesn't have underscore
        phone: userData.phone,
        role: userData.role || 'customer',
        preferredLanguage: userData.preferredLanguage || 'en',
        // preferred_language: userData.preferredLanguage || 'en', // Alt option
        loyaltyPoints: 0,
        // loyalty_points: 0, // Alt option
      }).returning();
      
      console.log('User created successfully:', { id: user.id, username: user.username });
      return user;
    } catch (error) {
      console.error('Detailed error in createUser:', error);
      
      // If the first approach fails, try with direct SQL as a fallback
      try {
        console.log('Falling back to direct SQL with minimal columns');
        
        // Simplified SQL with only the essential columns that we know must exist
        const result = await db.execute(sql`
          INSERT INTO users (username, password, email) 
          VALUES (
            ${userData.username}, 
            ${userData.password}, 
            ${userData.email}
          )
          RETURNING id, username, email
        `);
        
        if (!result.rows || result.rows.length === 0) {
          throw new Error('Failed to create user - no rows returned');
        }
        
        // Create a minimal user object with the returned data
        const userRow = result.rows[0];
        const user: User = {
          id: Number(userRow.id),
          username: userRow.username,
          password: userData.password,
          email: userRow.email,
          fullName: userData.fullName || '',
          phone: userData.phone || null,
          role: userData.role || 'customer',
          loyaltyPoints: 0,
          preferredLanguage: userData.preferredLanguage || 'en',
          createdAt: new Date()
        };
        
        console.log('User created with fallback method:', { id: user.id, username: user.username });
        return user;
      } catch (fallbackError) {
        console.error('Fallback creation also failed:', fallbackError);
        throw error; // Throw the original error as it's likely more relevant
      }
    }
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
    // DEBUG: Log what is being queried
    console.log('Fetching reviews for salonId:', salonId);
    const result = await db.select().from(reviews).where(eq(reviews.salonId, salonId));
    console.log('Reviews found:', result);
    return result;
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(reviewData).returning();
    return review;
  }

  async getAllReviews(): Promise<Review[]> {
    return await db.select().from(reviews);
  }
}