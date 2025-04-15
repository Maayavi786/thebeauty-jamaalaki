import { z } from "zod";

export const User = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(["user", "admin"]),
  createdAt: z.string().transform((str) => new Date(str)),
  updatedAt: z.string().transform((str) => new Date(str))
});

export const Salon = z.object({
  id: z.number(),
  nameEn: z.string(),
  nameAr: z.string(),
  descriptionEn: z.string().nullable(),
  descriptionAr: z.string().nullable(),
  address: z.string(),
  phone: z.string(),
  email: z.string().email(),
  rating: z.number().nullable(),
  imageUrl: z.string().nullable(),
  createdAt: z.string().transform((str) => new Date(str)),
  updatedAt: z.string().transform((str) => new Date(str))
});

export const Service = z.object({
  id: z.number(),
  nameEn: z.string(),
  nameAr: z.string(),
  descriptionEn: z.string().nullable(),
  descriptionAr: z.string().nullable(),
  price: z.number(),
  duration: z.number(),
  category: z.string(),
  imageUrl: z.string().nullable(),
  salonId: z.number(),
  createdAt: z.string().transform((str) => new Date(str)),
  updatedAt: z.string().transform((str) => new Date(str))
});

export const Review = z.object({
  id: z.number(),
  rating: z.number(),
  comment: z.string(),
  userId: z.number(),
  salonId: z.number(),
  createdAt: z.string().transform((str) => new Date(str)),
  updatedAt: z.string().transform((str) => new Date(str))
});

export const Booking = z.object({
  id: z.number(),
  userId: z.number(),
  salonId: z.number(),
  serviceId: z.number(),
  datetime: z.string().transform((str) => new Date(str)),
  notes: z.string().optional(),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).default("pending"),
  createdAt: z.string().transform((str) => new Date(str)),
  updatedAt: z.string().transform((str) => new Date(str))
});

export type User = z.infer<typeof User>;
export type Salon = z.infer<typeof Salon>;
export type Service = z.infer<typeof Service>;
export type Review = z.infer<typeof Review>;
export type Booking = z.infer<typeof Booking>; 