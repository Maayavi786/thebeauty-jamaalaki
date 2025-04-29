import type { Express, Request, Response } from "express";
import { IStorage } from "./storage";
import { 
  insertUserSchema, insertSalonSchema, insertServiceSchema, 
  insertBookingSchema, insertReviewSchema, loginSchema, User 
} from "../shared/schema";
import { validateRequest } from "./validate";
import { Router } from "express";
import { compare, hash } from "bcryptjs";
import { config } from "../shared/config";
import { neon } from '@neondatabase/serverless';

declare module "express-session" {
  interface SessionData {
    user?: Omit<User, 'password'>
  }
}

const router = Router();
const sql = neon(process.env.DATABASE_URL!);

// Setup routes
export default async function registerRoutes(app: Express, storage: IStorage) {
  // Get API version
  app.get("/api/version", (req: Request, res: Response) => {
    res.json({
      version: config.version,
      buildDate: config.buildDate
    });
  });

  // Get current system info
  app.get("/api/system", async (req: Request, res: Response) => {
    const uptime = process.uptime();
    const memory = process.memoryUsage();
    res.json({
      uptime,
      memory
    });
  });

  // Auth endpoints
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const { data, error } = validateRequest(insertUserSchema, req.body);
    if (error) {
      return res.status(400).json({ message: "Validation error", errors: error });
    }

    try {
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await hash(data.password, 10);
      const userData = {
        ...data,
        password: hashedPassword
      };

      // Create user
      const user = await storage.createUser(userData);
      
      // If the user is a salon_owner, create a default salon for them
      if (userData.role === 'salon_owner') {
        console.log(`Creating default salon for new salon owner (${userData.username})`);
        try {
          const defaultSalon = {
            owner_id: user.id,
            name_en: `${userData.firstName}'s Salon`,
            name_ar: `صالون ${userData.firstName}`,
            description_en: 'My salon description',
            description_ar: 'وصف صالوني',
            address: 'Your address here',
            phone: userData.phone || '',
            email: userData.email,
            image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop',
            rating: 4.5,
            is_featured: true,
            business_hours: JSON.stringify({
              monday: { open: '09:00', close: '18:00' },
              tuesday: { open: '09:00', close: '18:00' },
              wednesday: { open: '09:00', close: '18:00' },
              thursday: { open: '09:00', close: '18:00' },
              friday: { open: '09:00', close: '18:00' },
              saturday: { open: '10:00', close: '16:00' },
              sunday: { open: '10:00', close: '16:00' },
            })
          };
          
          await storage.createSalon(defaultSalon);
          console.log(`Default salon created for user ID ${user.id}`);
        } catch (salonErr) {
          console.error('Error creating default salon:', salonErr);
          // Continue with the user creation even if salon creation fails
        }
      }

      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({
        user: userWithoutPassword,
        message: "User registered successfully"
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
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

      const isMatch = await compare(data.password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Don't return password in response or session
      const { password, ...userWithoutPassword } = user;
      
      // Store user in session
      req.session.user = userWithoutPassword;
      
      // Log session info for debugging
      console.log('User login successful. Session info:', {
        id: req.sessionID,
        cookie: req.session.cookie,
        userId: userWithoutPassword.id,
        role: userWithoutPassword.role,
        sessionId: req.sessionID
      });
      
      res.status(200).json({
        message: "Login successful",
        user: userWithoutPassword,
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

  // Salon routes
  app.get("/api/salons", async (req: Request, res: Response) => {
    try {
      const salons = await storage.getSalons();
      res.status(200).json(salons);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/salons/:id", async (req: Request, res: Response) => {
    try {
      const salon = await storage.getSalon(parseInt(req.params.id));
      if (!salon) {
        return res.status(404).json({ message: "Salon not found" });
      }
      res.status(200).json(salon);
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

  // Get salons by owner ID (with parameter)
  app.get("/api/salons/owner/:ownerId", async (req: Request, res: Response) => {
    try {
      const ownerId = parseInt(req.params.ownerId);
      const result = await sql`SELECT * FROM salons WHERE owner_id = ${ownerId}`;
      res.json(result);
    } catch (error) {
      console.error("Error getting salons by owner ID:", error);
      res.status(500).json({ message: "Error getting salons" });
    }
  });

  // Get salons for the logged-in owner (from session)
  app.get("/api/salons/owner", async (req: Request, res: Response) => {
    try {
      // Check if user is logged in
      if (!req.session.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const ownerId = req.session.user.id;
      console.log('Fetching salons for owner ID (from session):', ownerId);
      
      if (!ownerId || isNaN(ownerId)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid owner ID", 
          error: "Owner ID is missing or invalid" 
        });
      }
      
      // Get salons for this owner
      const salons = await sql`SELECT * FROM salons WHERE owner_id = ${ownerId}`;
      console.log('Found salons:', salons);
      
      // If no salon is found, return a temporary salon object
      // This is just for debugging/testing
      if (!salons || salons.length === 0) {
        console.log('No salons found, returning dummy salon');
        return res.json({
          id: 0,
          owner_id: ownerId,
          name_en: 'Your Salon (Not Found)',
          name_ar: 'صالونك (غير موجود)',
          description_en: 'Please use the Map Salon feature to connect a salon to your account',
          description_ar: 'يرجى استخدام ميزة ربط الصالون لربط صالون بحسابك',
          address: 'N/A',
          phone: 'N/A',
          email: req.session.user.email || 'N/A',
          image_url: 'https://via.placeholder.com/500?text=Salon+Not+Found',
          rating: 0,
          is_featured: false,
          business_hours: '{}'  
        });
      }
      
      // Return the first salon for this owner (most owners only have one salon)
      res.json(salons[0]);
    } catch (error) {
      console.error("Error getting salons for logged-in owner:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch salon details", 
        error: error.message || "Unknown error" 
      });
    }
  });

  // Salon Analytics
  app.get("/api/salons/analytics", async (req: Request, res: Response) => {
    try {
      // Check if user is logged in
      if (!req.session.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const ownerId = req.session.user.id;
      if (!ownerId || isNaN(ownerId)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid owner ID", 
          error: "Owner ID is missing or invalid" 
        });
      }
      
      // Get date range from query parameters or use defaults
      const startDate = req.query.startDate as string || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = req.query.endDate as string || new Date().toISOString().split('T')[0];
      
      // Get salon for this owner
      const salons = await sql`SELECT id FROM salons WHERE owner_id = ${ownerId}`;
      
      if (!salons || salons.length === 0) {
        return res.json({
          bookings: 0,
          revenue: 0,
          clients: 0,
          popularServices: [],
          revenueByDay: []
        });
      }
      
      const salonId = salons[0].id;
      
      // Return mock analytics data for now
      res.json({
        bookings: 24,
        revenue: 2400,
        clients: 18,
        popularServices: [
          { name: 'Haircut', count: 10 },
          { name: 'Manicure', count: 8 },
          { name: 'Facial', count: 6 }
        ],
        revenueByDay: [
          { date: '2025-04-22', amount: 300 },
          { date: '2025-04-23', amount: 250 },
          { date: '2025-04-24', amount: 400 },
          { date: '2025-04-25', amount: 350 },
          { date: '2025-04-26', amount: 500 },
          { date: '2025-04-27', amount: 300 },
          { date: '2025-04-28', amount: 300 }
        ]
      });
    } catch (error) {
      console.error("Error getting salon analytics:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch salon details", 
        error: error.message || "Unknown error" 
      });
    }
  });

  // Service routes
  app.get("/api/services", async (req: Request, res: Response) => {
    try {
      // Get all services from all salons
      const services = await sql`SELECT * FROM services`;
      res.status(200).json(services);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get services by salon ID (with parameter)
  app.get("/api/services/salon/:salonId", async (req: Request, res: Response) => {
    try {
      const salonId = parseInt(req.params.salonId);
      const services = await sql`SELECT * FROM services WHERE salon_id = ${salonId}`;
      res.json(services);
    } catch (error) {
      console.error("Error getting services by salon ID:", error);
      res.status(500).json({ message: "Error getting services" });
    }
  });

  // Get services for the logged-in owner's salon (from session)
  app.get("/api/services/salon", async (req: Request, res: Response) => {
    try {
      // Check if user is logged in
      if (!req.session.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const ownerId = req.session.user.id;
      console.log('Fetching services for owner ID (from session):', ownerId);
      
      if (!ownerId || isNaN(ownerId)) {
        return res.status(400).json({ message: "Invalid owner ID" });
      }
      
      // Get salons for this owner
      const salons = await sql`SELECT * FROM salons WHERE owner_id = ${ownerId}`;
      
      // If no salons found, return empty list
      if (!salons || salons.length === 0) {
        console.log('No salons found for this owner, returning empty services list');
        return res.json([]);
      }
      
      // Use the first salon
      const salonId = salons[0].id;
      console.log('Using salon ID:', salonId);
      
      // Get services for this salon
      const services = await sql`SELECT * FROM services WHERE salon_id = ${salonId}`;
      console.log('Found services:', services?.length || 0);
      
      // If no services, return empty array instead of null
      res.json(services || []);
    } catch (error) {
      console.error("Error getting services for logged-in owner's salon:", error);
      res.status(500).json({ message: "Error getting services data" });
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

  // Recent bookings for the logged-in owner's salon
  app.get("/api/bookings/salon/recent", async (req: Request, res: Response) => {
    try {
      // Check if user is logged in
      if (!req.session.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const ownerId = req.session.user.id;
      console.log('Fetching recent bookings for owner ID:', ownerId);
      
      if (!ownerId || isNaN(ownerId)) {
        return res.status(400).json({ message: "Invalid owner ID" });
      }
      
      // Get salon for this owner
      const salons = await sql`SELECT id FROM salons WHERE owner_id = ${ownerId}`;
      
      if (!salons || salons.length === 0) {
        return res.json([]);
      }
      
      const salonId = salons[0].id;
      
      // Get recent bookings for this salon
      // In a real app, you'd fetch from your database
      // For now, return mock data
      res.json([
        {
          id: 101,
          user_id: 201,
          service_id: 301,
          salon_id: salonId,
          booking_date: new Date().toISOString(),
          status: 'confirmed',
          user_name: 'Sarah Johnson',
          service_name: 'Haircut',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 102,
          user_id: 202,
          service_id: 302,
          salon_id: salonId,
          booking_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          user_name: 'Michael Brown',
          service_name: 'Massage',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 103,
          user_id: 203,
          service_id: 303,
          salon_id: salonId,
          booking_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'confirmed',
          user_name: 'Emily Davis',
          service_name: 'Manicure',
          created_at: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error("Error getting recent bookings:", error);
      res.status(500).json({ message: "Error getting recent bookings" });
    }
  });

  app.get("/api/bookings/:id", async (req: Request, res: Response) => {
    try {
      const booking = await storage.getBooking(parseInt(req.params.id));
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.status(200).json(booking);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/bookings", async (req: Request, res: Response) => {
    const { data, error } = validateRequest(insertBookingSchema, req.body);
    if (error) {
      return res.status(400).json({ message: "Validation error", errors: error });
    }

    try {
      const booking = await storage.createBooking(data);
      res.status(201).json(booking);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Review routes
  app.get("/api/reviews/user/:userId", async (req: Request, res: Response) => {
    try {
      const reviews = await storage.getReviewsByUser(parseInt(req.params.userId));
      res.status(200).json(reviews);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/reviews/salon/:salonId", async (req: Request, res: Response) => {
    try {
      const reviews = await storage.getReviewsBySalon(parseInt(req.params.salonId));
      res.status(200).json(reviews);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/reviews/:id", async (req: Request, res: Response) => {
    try {
      const review = await storage.getReview(parseInt(req.params.id));
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.status(200).json(review);
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

  return router;
}
