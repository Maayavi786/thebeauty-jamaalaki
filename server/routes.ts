import type { Express, Request, Response } from "express";
import { IStorage } from "./storage";
import { 
  insertUserSchema, insertSalonSchema, insertServiceSchema, 
  insertBookingSchema, insertReviewSchema, loginSchema, User 
} from "../shared/schema";
import { ZodError } from "zod";
import { hashPassword, comparePasswords } from "./auth";
import { Session } from "express-session";
import { Router } from 'express';
import { neon } from '@neondatabase/serverless';

// Extend the Session type to include user
declare module "express-session" {
  interface SessionData {
    user?: Omit<User, 'password'>;
  }
}

const router = Router();
const sql = neon(process.env.DATABASE_URL!);

// Test endpoint
router.get('/api/test-db', async (req, res) => {
  try {
    const result = await sql`SELECT 1 as test`;
    res.json({ 
      success: true, 
      message: 'Database connection successful',
      data: result 
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export async function registerRoutes(app: Express, storage: IStorage): Promise<void> {
  // Helper function to handle validation errors
  const validateRequest = (schema: any, data: any) => {
    try {
      return { data: schema.parse(data), error: null };
    } catch (error) {
      if (error instanceof ZodError) {
        return { data: null, error: error.format() };
      }
      return { data: null, error: "Invalid request data" };
    }
  };

  // User routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    console.log("Registration request received:", req.body);
    
    // Validate the request data
    const { data, error } = validateRequest(insertUserSchema, req.body);
    if (error) {
      console.log("Registration validation error:", error);
      return res.status(400).json({ message: "Validation error", errors: error });
    }

    try {
      // Check if username or email already exists
      console.log("Checking for existing username:", data.username);
      const existingUsername = await storage.getUserByUsername(data.username);
      if (existingUsername) {
        console.log("Username already exists:", data.username);
        return res.status(400).json({ message: "Username already exists" });
      }

      console.log("Checking for existing email:", data.email);
      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        console.log("Email already exists:", data.email);
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash the password before storing it
      console.log("Hashing password...");
      const hashedPassword = await hashPassword(data.password);
      
      // Ensure all required fields are present according to the schema
      // Note: The database uses snake_case (full_name) while our code uses camelCase (fullName)
      // We need to adapt our data to match the expected database column names
      const userData = { 
        username: data.username,
        password: hashedPassword,
        email: data.email,
        // Map to the database column name for full_name
        full_name: data.fullName || "", 
        phone: data.phone,
        role: data.role || "customer",
        preferred_language: data.preferredLanguage || "en",
        loyalty_points: 0
      };
      
      console.log("Creating new user with data:", { ...userData, password: "[REDACTED]" });
      const user = await storage.createUser(userData);
      
      if (!user) {
        console.error("User creation failed: No user returned from storage");
        return res.status(500).json({ message: "Failed to create user account" });
      }
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      
      console.log("User created successfully:", { id: user.id, username: user.username });
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error creating user:", errorMessage, error);
      res.status(500).json({ 
        message: "Error creating user", 
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined 
      });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { data, error } = validateRequest(loginSchema, req.body);
    if (error) {
      return res.status(400).json({ message: "Validation error", errors: error });
    }

    try {
      const user = await storage.getUserByUsername(data.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Compare the provided password with the stored hash
      const passwordMatch = await comparePasswords(data.password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      
      // Set up session
      req.session.user = userWithoutPassword;
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ message: "Error setting up session" });
        }
        
        res.status(200).json({
          message: "Login successful",
          user: userWithoutPassword,
        });
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Session endpoint
  app.get("/api/auth/session", async (req: Request, res: Response) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ 
          success: false, 
          message: "No active session" 
        });
      }

      res.json({ 
        success: true, 
        user: req.session.user 
      });
    } catch (error) {
      console.error("Error checking session:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error checking session" 
      });
    }
  });

  // Add logout endpoint
  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Error logging out" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Add route to get all users (admin only)
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      // Don't return passwords in response
      const usersWithoutPasswords = users.map(({ password, ...rest }) => rest);
      res.status(200).json(usersWithoutPasswords);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Only allow updating certain fields
      const allowedUpdates = ["fullName", "phone", "preferredLanguage"];
      const updates: Record<string, any> = {};
      for (const field of allowedUpdates) {
        if (field in req.body) {
          updates[field] = req.body[field];
        }
      }

      const updatedUser = await storage.updateUser(userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't return password in response
      const { password, ...userWithoutPassword } = updatedUser;
      res.status(200).json(userWithoutPassword);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Salon routes
  app.get("/api/salons", async (req: Request, res: Response) => {
    try {
      // Only apply filters that were actually provided in the query
      const appliedFilters: any = {};
      
      if (req.query.isLadiesOnly !== undefined) {
        appliedFilters.isLadiesOnly = req.query.isLadiesOnly === 'true';
      }
      if (req.query.hasPrivateRooms !== undefined) {
        appliedFilters.hasPrivateRooms = req.query.hasPrivateRooms === 'true';
      }
      if (req.query.isHijabFriendly !== undefined) {
        appliedFilters.isHijabFriendly = req.query.isHijabFriendly === 'true';
      }
      if (req.query.city) {
        appliedFilters.city = req.query.city as string;
      }

      const salons = await storage.getSalons(Object.keys(appliedFilters).length > 0 ? appliedFilters : undefined);
      res.json(salons);
    } catch (error) {
      console.error("Error fetching salons:", error);
      res.status(500).json({ message: "Error fetching salons" });
    }
  });

  app.get("/api/salons/:id", async (req: Request, res: Response) => {
    try {
      const salon = await storage.getSalon(parseInt(req.params.id));
      if (!salon) {
        return res.status(404).json({ message: "Salon not found" });
      }
      // Fetch services and reviews for the salon
      const [services, reviews] = await Promise.all([
        storage.getServicesBySalon(salon.id),
        storage.getReviewsBySalon(salon.id),
      ]);
      res.status(200).json({
        ...salon,
        services,
        reviews,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/salons", async (req: Request, res: Response) => {
    const { data, error } = validateRequest(insertSalonSchema, req.body);
    if (error) {
      return res.status(400).json({ message: "Validation error", errors: error });
    }

    try {
      const salon = await storage.createSalon(data);
      res.status(201).json(salon);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/salons/owner/:ownerId", async (req: Request, res: Response) => {
    try {
      const salons = await storage.getSalonsByOwner(parseInt(req.params.ownerId));
      res.status(200).json(salons);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Service routes
  app.get("/api/services", async (req: Request, res: Response) => {
    try {
      // Get all services from all salons
      const salons = await storage.getSalons();
      const allServices = [];
      
      for (const salon of salons) {
        const salonServices = await storage.getServicesBySalon(salon.id);
        allServices.push(...salonServices);
      }
      
      res.status(200).json(allServices);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/services/salon/:salonId", async (req: Request, res: Response) => {
    try {
      const services = await storage.getServicesBySalon(parseInt(req.params.salonId));
      res.status(200).json(services);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/services/:id", async (req: Request, res: Response) => {
    try {
      const service = await storage.getService(parseInt(req.params.id));
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.status(200).json(service);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/services", async (req: Request, res: Response) => {
    const { data, error } = validateRequest(insertServiceSchema, req.body);
    if (error) {
      return res.status(400).json({ message: "Validation error", errors: error });
    }

    try {
      const service = await storage.createService(data);
      res.status(201).json(service);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Booking routes
  app.get("/api/bookings/user/:userId", async (req: Request, res: Response) => {
    try {
      const bookings = await storage.getBookingsByUser(parseInt(req.params.userId));
      res.status(200).json(bookings);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/bookings/salon/:salonId", async (req: Request, res: Response) => {
    try {
      const bookings = await storage.getBookingsBySalon(parseInt(req.params.salonId));
      res.status(200).json(bookings);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/bookings", async (req: Request, res: Response) => {
    const { userId, salonId, serviceIds, datetime, notes } = req.body;
    
    if (!userId || !salonId || !serviceIds || !datetime || !Array.isArray(serviceIds)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {
      // Create bookings for each service
      const bookings = [];
      for (const serviceId of serviceIds) {
        const bookingData = {
          userId,
          salonId,
          serviceId,
          datetime,
          notes,
          status: 'pending' as const
        };
        
        const { data, error } = validateRequest(insertBookingSchema, bookingData);
        if (error) {
          return res.status(400).json({ message: "Validation error", errors: error });
        }
        
        const booking = await storage.createBooking(data);
        bookings.push(booking);
      }
      
      res.status(201).json(bookings);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/bookings/:id/status", async (req: Request, res: Response) => {
    const { status } = req.body;
    if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    try {
      const booking = await storage.updateBookingStatus(parseInt(req.params.id), status);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.status(200).json(booking);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Review routes
  app.get("/api/reviews", async (req: Request, res: Response) => {
    try {
      const salonId = req.query.salonId ? parseInt(req.query.salonId as string) : undefined;
      const reviews = salonId ? await storage.getReviewsBySalon(salonId) : await storage.getAllReviews();
      console.log('API /api/reviews?salonId=', salonId, 'Result:', reviews);
      res.status(200).json({ success: true, data: reviews });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/reviews", async (req: Request, res: Response) => {
    const { data, error } = validateRequest(insertReviewSchema, req.body);
    if (error) {
      return res.status(400).json({ message: "Validation error", errors: error });
    }

    try {
      const review = await storage.createReview(data);
      res.status(201).json(review);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // DEBUG: Dump all reviews for manual verification
  app.get("/api/debug/reviews", async (req: Request, res: Response) => {
    try {
      const allReviews = await storage.getAllReviews();
      res.status(200).json({ success: true, data: allReviews });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

}

export default router;
