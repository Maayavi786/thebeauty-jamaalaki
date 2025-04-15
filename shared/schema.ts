import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['customer', 'salon_owner', 'admin']);
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'confirmed', 'cancelled', 'completed']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  role: userRoleEnum("role").notNull().default('customer'),
  loyaltyPoints: integer("loyalty_points").notNull().default(0),
  preferredLanguage: text("preferred_language").notNull().default('en'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Salons table
export const salons = pgTable("salons", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  rating: integer("rating"),
  imageUrl: text("image_url"),
  isVerified: boolean("is_verified").notNull().default(false),
  isLadiesOnly: boolean("is_ladies_only").notNull().default(true),
  hasPrivateRooms: boolean("has_private_rooms").notNull().default(false),
  isHijabFriendly: boolean("is_hijab_friendly").notNull().default(false),
  priceRange: text("price_range"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Services table
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  salonId: integer("salon_id").notNull().references(() => salons.id),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  duration: integer("duration").notNull(), // in minutes
  price: integer("price").notNull(), // in SAR
  category: text("category").notNull(),
  imageUrl: text("image_url"),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  salonId: integer("salon_id").notNull().references(() => salons.id),
  serviceId: integer("service_id").notNull().references(() => services.id),
  datetime: timestamp("datetime").notNull(),
  status: bookingStatusEnum("status").notNull().default('pending'),
  notes: text("notes"),
  pointsEarned: integer("points_earned"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  salonId: integer("salon_id").notNull().references(() => salons.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Create insert schemas
export const insertUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  email: z.string().email(),
  fullName: z.string().min(2).max(100),
  phone: z.string().optional(),
  role: z.enum(['customer', 'salon_owner', 'admin']).default('customer'),
  preferredLanguage: z.enum(['en', 'ar']).default('en')
});

export const insertSalonSchema = z.object({
  ownerId: z.number(),
  nameEn: z.string().min(2),
  nameAr: z.string().min(2),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  address: z.string().min(5),
  city: z.string().min(2),
  phone: z.string().min(5),
  email: z.string().email().optional(),
  imageUrl: z.string().url().optional(),
  isLadiesOnly: z.boolean().default(true),
  hasPrivateRooms: z.boolean().default(false),
  isHijabFriendly: z.boolean().default(false),
  priceRange: z.string().optional(),
});

export const insertServiceSchema = z.object({
  salonId: z.number(),
  nameEn: z.string().min(2),
  nameAr: z.string().min(2),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  duration: z.number().min(1),
  price: z.number().min(0),
  category: z.string().min(2),
  imageUrl: z.string().url().optional(),
});

export const insertBookingSchema = z.object({
  userId: z.number(),
  salonId: z.number(),
  serviceId: z.number(),
  datetime: z.string().transform((str: string) => new Date(str)),
  notes: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).default('pending'),
});

export const insertReviewSchema = z.object({
  userId: z.number(),
  salonId: z.number(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Salon = typeof salons.$inferSelect;
export type InsertSalon = z.infer<typeof insertSalonSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
});

export type LoginCredentials = z.infer<typeof loginSchema>;
