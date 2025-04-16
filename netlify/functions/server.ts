import { Handler, HandlerEvent, HandlerContext, HandlerResponse } from '@netlify/functions';
import express from 'express';
import serverless from 'serverless-http';
import { neon } from '@neondatabase/serverless';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import { comparePasswords } from '../utils/passwordUtils';
import { hashPassword } from '../utils/passwordUtils';
import memorystore from 'memorystore';
import * as Sentry from "@sentry/node";
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcrypt';

// Define session types
declare module 'express-session' {
  interface SessionData {
    user?: User;
  }
}

// Ensure DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const app = express();

// Create MemoryStore
const MemoryStore = memorystore(session);

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 1.0,
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests, please try again later"
  }
});

// Apply rate limiting to all routes
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['https://thebeauty.netlify.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400 // 24 hours
}));

app.use(express.json());

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Add middleware to ensure session cookie is set and handle CORS properly
app.use((req, res, next) => {
  // Set CORS headers
  const origin = req.headers.origin;
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? ['https://thebeauty.netlify.app'] 
    : ['http://localhost:5173'];

  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');
    res.header('Access-Control-Expose-Headers', 'Set-Cookie');
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Define user type
interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: Date;
  password?: string;
}

// Create a typed database connection
const sql = neon(process.env.DATABASE_URL);

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const result = await sql`
      SELECT * FROM users 
      WHERE username = ${username}
    `;
    const user = result[0] as User;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password || '');
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Remove password from user object before storing in session
    const { password: _, ...userWithoutPassword } = user;
    
    req.session.user = userWithoutPassword;
    await req.session.save();

    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login'
    });
  }
});

// Session check route
app.get('/api/auth/session', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({
        success: false,
        message: 'No active session'
      });
    }

    // Verify user still exists in database
    const result = await sql`
      SELECT * FROM users 
      WHERE id = ${req.session.user.id}
    `;
    const user = result[0] as User;

    if (!user) {
      req.session.destroy(() => {});
      return res.json({
        success: false,
        message: 'User not found'
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Session check error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while checking session'
    });
  }
});

// Logout route
app.post('/api/auth/logout', async (req, res) => {
  try {
    req.session.destroy(() => {});
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during logout'
    });
  }
});

// Salon routes
app.get("/api/salons", async (req, res) => {
  try {
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

    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

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

// Search endpoint
app.get("/api/search", async (req, res) => {
  try {
    const {
      q: searchTerm,
      serviceType,
      ladiesOnly,
      privateRoom,
      hijabFriendly,
      sortBy = 'rating',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build search query
    let query = sql`
      SELECT 
        s.*,
        u.username as owner_name,
        (SELECT COUNT(*) FROM reviews r WHERE r.salon_id = s.id) as review_count,
        (SELECT AVG(rating) FROM reviews r WHERE r.salon_id = s.id) as average_rating,
        (SELECT COUNT(*) FROM services sv WHERE sv.salon_id = s.id) as service_count
      FROM salons s
      LEFT JOIN users u ON s.owner_id = u.id
      WHERE 1=1
    `;

    // Add search term condition
    if (searchTerm) {
      query = sql`${query} AND (
        s.name_en ILIKE ${`%${searchTerm}%`} OR
        s.name_ar ILIKE ${`%${searchTerm}%`} OR
        s.description_en ILIKE ${`%${searchTerm}%`} OR
        s.description_ar ILIKE ${`%${searchTerm}%`}
      )`;
    }

    // Add filter conditions
    if (serviceType && serviceType !== 'all') {
      query = sql`${query} AND EXISTS (
        SELECT 1 FROM services sv 
        WHERE sv.salon_id = s.id 
        AND sv.category = ${serviceType}
      )`;
    }

    if (ladiesOnly === 'true') {
      query = sql`${query} AND s.ladies_only = true`;
    }

    if (privateRoom === 'true') {
      query = sql`${query} AND s.private_rooms = true`;
    }

    if (hijabFriendly === 'true') {
      query = sql`${query} AND s.hijab_friendly = true`;
    }

    // Add sorting
    const sortField = sortBy === 'rating' ? 'average_rating' : 'created_at';
    query = sql`${query} ORDER BY ${sql(sortField)} ${sql(sortOrder === 'desc' ? 'DESC' : 'ASC')}`;

    // Add pagination
    const offset = (Number(page) - 1) * Number(limit);
    query = sql`${query} LIMIT ${limit} OFFSET ${offset}`;

    // Execute query
    const results = await query;

    // Get total count for pagination
    const countQuery = sql`
      SELECT COUNT(*) as total
      FROM salons s
      WHERE 1=1
      ${searchTerm ? sql`AND (
        s.name_en ILIKE ${`%${searchTerm}%`} OR
        s.name_ar ILIKE ${`%${searchTerm}%`} OR
        s.description_en ILIKE ${`%${searchTerm}%`} OR
        s.description_ar ILIKE ${`%${searchTerm}%`}
      )` : sql``}
      ${ladiesOnly === 'true' ? sql`AND s.ladies_only = true` : sql``}
      ${privateRoom === 'true' ? sql`AND s.private_rooms = true` : sql``}
      ${hijabFriendly === 'true' ? sql`AND s.hijab_friendly = true` : sql``}
    `;

    const [{ total }] = await countQuery;

    // Log search for analytics
    if (searchTerm) {
      await sql`
        INSERT INTO search_logs (term, filters, results_count)
        VALUES (${searchTerm}, ${JSON.stringify(req.query)}, ${results.length})
      `;
    }

    res.json({
      success: true,
      data: results,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to perform search",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Search suggestions endpoint
app.get("/api/search/suggestions", async (req, res) => {
  try {
    const { q: searchTerm } = req.query;
    
    if (!searchTerm || typeof searchTerm !== 'string') {
      return res.json([]);
    }

    // Search in salons
    const salonResults = await sql`
      SELECT id, name_en as name, 'salon' as type
      FROM salons
      WHERE name_en ILIKE ${`%${searchTerm}%`} OR name_ar ILIKE ${`%${searchTerm}%`}
      LIMIT 5
    `;

    // Search in services
    const serviceResults = await sql`
      SELECT id, name_en as name, 'service' as type
      FROM services
      WHERE name_en ILIKE ${`%${searchTerm}%`} OR name_ar ILIKE ${`%${searchTerm}%`}
      LIMIT 5
    `;

    // Combine and sort results
    const results = [...salonResults, ...serviceResults]
      .sort((a, b) => {
        // Prioritize exact matches
        const aExact = a.name.toLowerCase() === searchTerm.toLowerCase();
        const bExact = b.name.toLowerCase() === searchTerm.toLowerCase();
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        // Then prioritize salons over services
        if (a.type === 'salon' && b.type === 'service') return -1;
        if (a.type === 'service' && b.type === 'salon') return 1;
        
        return 0;
      })
      .slice(0, 10); // Limit total results

    res.json(results);
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch suggestions",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Error handling middleware
interface ErrorResponse {
  success: boolean;
  message: string;
  error?: string;
  code?: string;
}

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Log error to Sentry
  Sentry.captureException(err);
  
  console.error('Server error:', err);
  
  const errorResponse: ErrorResponse = {
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? "An unexpected error occurred" 
      : err.message
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.error = err.message;
    errorResponse.code = err.name;
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    res.status(400).json({
      ...errorResponse,
      message: "Validation error",
      error: err.message
    });
  } else if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      ...errorResponse,
      message: "Unauthorized",
      error: err.message
    });
  } else {
    res.status(500).json(errorResponse);
  }
});

const serverlessHandler = serverless(app);

// Export the handler function
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> => {
  try {
    const result = await serverlessHandler(event, context);
    if (typeof result === 'object' && result !== null) {
      return {
        statusCode: (result as any).statusCode || 200,
        body: (result as any).body,
        headers: (result as any).headers
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Internal server error'
      })
    };
  }
}; 
