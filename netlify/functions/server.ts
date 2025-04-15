import { Handler } from '@netlify/functions';
import express from 'express';
import serverless from 'serverless-http';
import { neon } from '@neondatabase/serverless';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import * as Sentry from "@sentry/node";
import { comparePasswords } from '../utils/passwordUtils';
import { hashPassword } from '../utils/passwordUtils';
import memorystore from 'memorystore';

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
  ],
  tracesSampleRate: 1.0,
});

const app = express();

// Sentry request handler must be the first middleware
app.use(Sentry.Handlers.requestHandler());

// Create MemoryStore
const MemoryStore = memorystore(session);

// CORS configuration
app.use(cors({
  origin: ['https://thebeauty.netlify.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400 // 24 hours
}));

app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret-key',
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    domain: '.netlify.app',
    path: '/',
    partitioned: true
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Add middleware to ensure session cookie is set and handle CORS properly
app.use((req, res, next) => {
  // Set CORS headers
  const origin = req.headers.origin;
  if (origin && ['https://thebeauty.netlify.app', 'http://localhost:5173'].includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');
    res.header('Access-Control-Expose-Headers', 'Set-Cookie');
  }

  // Ensure session cookie is set
  if (req.session && !req.session.cookie) {
    req.session.cookie = {
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      domain: '.netlify.app',
      path: '/',
      partitioned: true
    };
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Authentication routes
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log('Login attempt - Body:', req.body);
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Missing credentials",
        errors: {
          username: !username ? "Username is required" : undefined,
          password: !password ? "Password is required" : undefined
        }
      });
    }

    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set');
      return res.status(500).json({ 
        success: false,
        message: "Server configuration error",
        error: "Database connection not configured"
      });
    }

    const sql = neon(process.env.DATABASE_URL);
    
    // Get user from database with password hash
    const result = await sql`
      SELECT id, username, email, role, password, created_at 
      FROM users 
      WHERE username = ${username}
    `;
    
    if (!result || result.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials"
      });
    }

    const user = result[0];
    
    // Verify password
    const passwordMatch = await comparePasswords(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials"
      });
    }
    
    // Remove password from user object before storing in session
    const { password: _, ...userWithoutPassword } = user;
    
    // Store user in session
    req.session.user = userWithoutPassword;
    
    // Save session
    req.session.save((err) => {
      if (err) {
        console.error('Error saving session:', err);
        return res.status(500).json({ 
          success: false,
          message: "Error setting up session"
        });
      }

      console.log('Login successful - Session:', req.session);
      
      // Set session cookie explicitly
      res.cookie('jamaalaki.sid', req.sessionID, {
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        domain: '.netlify.app',
        path: '/',
        partitioned: true
      });
      
      res.status(200).json({
        success: true,
        message: "Login successful",
        user: userWithoutPassword
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Registration route
app.post("/api/auth/register", async (req, res) => {
  try {
    console.log('Registration attempt - Body:', req.body);
    const { username, password, email, fullName, phone, role, preferredLanguage } = req.body;
    
    // Validate required fields
    if (!username || !password || !email || !fullName) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields",
        errors: {
          username: !username ? "Username is required" : undefined,
          password: !password ? "Password is required" : undefined,
          email: !email ? "Email is required" : undefined,
          fullName: !fullName ? "Full name is required" : undefined
        }
      });
    }

    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set');
      return res.status(500).json({ 
        success: false,
        message: "Server configuration error",
        error: "Database connection not configured"
      });
    }

    const sql = neon(process.env.DATABASE_URL);
    
    // Check if username or email already exists
    console.log('Checking for existing user:', { username, email });
    const existingUser = await sql`
      SELECT * FROM users 
      WHERE username = ${username} OR email = ${email}
    `;
    
    if (existingUser && existingUser.length > 0) {
      const errors: Record<string, string> = {};
      if (existingUser.some(u => u.username === username)) {
        errors.username = "Username already exists";
      }
      if (existingUser.some(u => u.email === email)) {
        errors.email = "Email already exists";
      }
      
      return res.status(400).json({ 
        success: false,
        message: "User already exists",
        errors
      });
    }
    
    // Hash the password
    console.log('Hashing password for user:', username);
    const hashedPassword = await hashPassword(password);
    
    // Insert new user
    console.log('Creating new user:', { username, email });
    const newUser = await sql`
      INSERT INTO users (
        username, password, email, full_name, phone, role, preferred_language
      ) VALUES (
        ${username}, ${hashedPassword}, ${email}, ${fullName}, 
        ${phone || null}, ${role || 'customer'}, ${preferredLanguage || 'en'}
      ) RETURNING id, username, email, full_name, phone, role, preferred_language
    `;
    
    if (!newUser || newUser.length === 0) {
      throw new Error("Failed to create user");
    }
    
    // Set up session
    console.log('Setting up session for new user:', newUser[0]);
    req.session.user = newUser[0];
    
    // Save session and handle response
    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err);
        return res.status(500).json({ 
          success: false,
          message: "Session error",
          error: "Failed to create session"
        });
      }
      
      // Set session cookie explicitly
      res.cookie('jamaalaki.sid', req.sessionID, {
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        domain: '.netlify.app',
        path: '/'
      });
      
      console.log('Registration successful for user:', newUser[0]);
      res.status(201).json({
        success: true,
        message: "Registration successful",
        user: newUser[0]
      });
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err instanceof Error ? err.message : "Unknown error occurred"
    });
  }
});

// Session endpoint
app.get("/api/auth/session", async (req, res) => {
  try {
    console.log('Session check - Session ID:', req.sessionID);
    console.log('Session check - Session:', req.session);
    
    if (!req.session.user) {
      console.log('No user in session');
      return res.status(401).json({ 
        success: false, 
        message: "No active session" 
      });
    }

    // Refresh session
    req.session.touch();
    
    res.json({ 
      success: true, 
      user: req.session.user 
    });
  } catch (error) {
    console.error("Error checking session:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error checking session",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Logout endpoint
app.post("/api/auth/logout", async (req, res) => {
  try {
    console.log('Logout attempt - Session ID:', req.sessionID);
    
    if (!req.session) {
      console.log('No session to destroy');
      return res.status(200).json({ 
        success: true,
        message: "Already logged out" 
      });
    }
    
    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ 
          success: false,
          message: "Error logging out",
          error: "Failed to destroy session"
        });
      }
      
      // Clear session cookie
      res.clearCookie('jamaalaki.sid', {
        domain: '.netlify.app',
        path: '/'
      });
      
      console.log('Session destroyed successfully');
      res.status(200).json({ 
        success: true,
        message: "Logged out successfully" 
      });
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err instanceof Error ? err.message : "Unknown error"
    });
  }
});

// Salon routes
app.get("/api/salons", async (req, res) => {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const salons = await sql`
      SELECT s.*, 
             u.username as owner_name,
             (SELECT COUNT(*) FROM reviews r WHERE r.salon_id = s.id) as review_count,
             (SELECT AVG(rating) FROM reviews r WHERE r.salon_id = s.id) as average_rating
      FROM salons s
      LEFT JOIN users u ON s.owner_id = u.id
      ORDER BY s.created_at DESC
    `;
    
    res.json({ success: true, data: salons });
  } catch (error) {
    console.error('Error fetching salons:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch salons",
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

app.get("/api/salons/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sql = neon(process.env.DATABASE_URL);
    
    // Fetch salon details
    const [salon] = await sql`
      SELECT s.*, 
             u.username as owner_name,
             (SELECT COUNT(*) FROM reviews r WHERE r.salon_id = s.id) as review_count,
             (SELECT AVG(rating) FROM reviews r WHERE r.salon_id = s.id) as average_rating
      FROM salons s
      LEFT JOIN users u ON s.owner_id = u.id
      WHERE s.id = ${parseInt(id)}
    `;

    if (!salon) {
      return res.status(404).json({ 
        success: false, 
        message: "Salon not found" 
      });
    }

    // Fetch services for this salon
    const services = await sql`
      SELECT * FROM services 
      WHERE salon_id = ${parseInt(id)}
      ORDER BY price ASC
    `;

    // Fetch reviews for this salon
    const reviews = await sql`
      SELECT r.*, u.username, u.full_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.salon_id = ${parseInt(id)}
      ORDER BY r.created_at DESC
    `;

    res.json({
      success: true,
      data: {
        ...salon,
        services,
        reviews
      }
    });
  } catch (error) {
    console.error('Error fetching salon details:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch salon details",
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Service routes
app.get("/api/services", async (req, res) => {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const services = await sql`
      SELECT 
        s.id,
        s.salon_id as "salonId",
        s.name_en as "nameEn",
        s.name_ar as "nameAr",
        s.description_en as "descriptionEn",
        s.description_ar as "descriptionAr",
        s.duration,
        s.price,
        s.category,
        s.image_url as "imageUrl",
        sl.name_en as "salonName"
      FROM services s
      JOIN salons sl ON s.salon_id = sl.id
      ORDER BY s.price ASC
    `;
    
    res.json({ success: true, data: services });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch services",
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Booking routes
app.post("/api/bookings", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Please login to make a booking" 
      });
    }

    const { salonId, serviceId, datetime, notes } = req.body;
    const userId = req.session.user.id;

    const sql = neon(process.env.DATABASE_URL);
    
    // Create booking
    const [booking] = await sql`
      INSERT INTO bookings (
        user_id, salon_id, service_id, datetime, notes, status
      ) VALUES (
        ${userId}, ${salonId}, ${serviceId}, ${datetime}, ${notes}, 'pending'
      ) RETURNING *
    `;

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create booking",
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Services by salon endpoint
app.get('/api/services/salon/:salonId', async (req, res) => {
  try {
    const { salonId } = req.params;
    const sql = neon(process.env.DATABASE_URL!);
    const services = await sql`SELECT * FROM services WHERE salon_id = ${salonId}`;
    res.json(services);
  } catch (error) {
    console.error('Error fetching salon services:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch salon services',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Reviews endpoint
app.get('/api/reviews', async (req, res) => {
  try {
    const { salonId } = req.query;
    const sql = neon(process.env.DATABASE_URL!);
    
    let reviews;
    if (salonId) {
      reviews = await sql`
        SELECT r.*, u.username, u.full_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.salon_id = ${parseInt(salonId as string)}
        ORDER BY r.created_at DESC
      `;
    } else {
      reviews = await sql`
        SELECT r.*, u.username, u.full_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
      `;
    }
    
    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create review endpoint
app.post('/api/reviews', async (req, res) => {
  try {
    const { salonId, userId, rating, comment } = req.body;
    const sql = neon(process.env.DATABASE_URL!);
    
    const review = await sql`
      INSERT INTO reviews (salon_id, user_id, rating, comment)
      VALUES (${salonId}, ${userId}, ${rating}, ${comment})
      RETURNING *
    `;
    
    res.status(201).json(review[0]);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create review',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Add bookings endpoint
app.get('/api/bookings/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const sql = neon(process.env.DATABASE_URL!);
    
    const bookings = await sql`
      SELECT b.*, s.name as salon_name, sv.name as service_name
      FROM bookings b
      LEFT JOIN salons s ON b.salon_id = s.id
      LEFT JOIN services sv ON b.service_id = sv.id
      WHERE b.user_id = ${userId}
      ORDER BY b.created_at DESC
    `;
    
    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Environment test endpoint
app.get('/api/env-test', (req, res) => {
  res.json({
    status: 'success',
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VITE_API_URL: process.env.VITE_API_URL,
      VITE_WS_URL: process.env.VITE_WS_URL,
      PORT: process.env.PORT,
      DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ Missing',
      SESSION_SECRET: process.env.SESSION_SECRET ? '✅ Set' : '❌ Missing',
      JWT_SECRET: process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'
    }
  });
});

// Comprehensive test endpoint
app.get('/api/test', async (req, res) => {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    // Test database connection
    const dbTest = await sql`SELECT 1`;
    
    // Test main tables
    const [salonsCount, servicesCount, usersCount] = await Promise.all([
      sql`SELECT COUNT(*) FROM salons`,
      sql`SELECT COUNT(*) FROM services`,
      sql`SELECT COUNT(*) FROM users`
    ]);

    res.json({
      status: 'success',
      tests: {
        database: {
          connection: '✅ Connected',
          salons: `${salonsCount[0].count} records`,
          services: `${servicesCount[0].count} records`,
          users: `${usersCount[0].count} records`
        },
        environment: {
          node_env: process.env.NODE_ENV,
          api_url: process.env.VITE_API_URL,
          ws_url: process.env.VITE_WS_URL
        },
        endpoints: {
          auth: {
            register: '/api/auth/register',
            login: '/api/auth/login',
            session: '/api/auth/session',
            logout: '/api/auth/logout'
          },
          salons: {
            list: '/api/salons',
            detail: '/api/salons/:id',
            create: '/api/salons',
            owner: '/api/salons/owner/:ownerId'
          },
          services: {
            list: '/api/services',
            detail: '/api/services/:id',
            create: '/api/services',
            salon: '/api/services/salon/:salonId'
          },
          bookings: {
            user: '/api/bookings/user/:userId',
            salon: '/api/bookings/salon/:salonId',
            create: '/api/bookings'
          },
          reviews: {
            list: '/api/reviews',
            create: '/api/reviews'
          }
        }
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to run tests',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Database connection
const sql = neon(process.env.DATABASE_URL!);

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }
    
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

// Add Sentry error handler before error middleware
app.use(Sentry.Handlers.errorHandler());

// Error handling middleware
app.use((err: Error, req: any, res: any, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: "An unexpected error occurred",
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

const serverlessHandler = serverless(app);

// Export the handler function
export const handler: Handler = async (event, context) => {
  return await serverlessHandler(event, context);
}; 
