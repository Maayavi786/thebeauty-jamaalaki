import 'dotenv/config';
import express from "express";
import type { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.mjs";
import session from "express-session";
import passport from "passport";
import { env } from "./config.js";
import cors from "cors";
import { initializeDatabase } from './initDb.js';
import { DatabaseStorage } from './storage.db.js';
import pgSession from 'connect-pg-simple';

const app = express();

// Enable CORS with credentials
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ["https://thebeauty.netlify.app"], // Production frontend domain(s)
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add persistent session store for serverless (Postgres)
app.use(session({
  store: new (pgSession(session))({
    conString: process.env.DATABASE_URL,
    tableName: 'user_sessions',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'development_secret_key_change_in_production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // Always use secure cookies
    sameSite: 'none', // Use 'none' for cross-site cookies in production
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true, // Prevent client-side JavaScript access
  },
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Initialize storage
const storage = new DatabaseStorage();

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson: Record<string, any>, ...args: any[]) {
    capturedJsonResponse = bodyJson;
    // FIX: Only pass a single argument to res.json
    return originalResJson.call(res, bodyJson);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Add this before your other routes
app.get('/api/env-test', (req: Request, res: Response) => {
  // Return only non-sensitive information
  res.json({
    status: 'success',
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VITE_API_URL: process.env.VITE_API_URL,
      VITE_WS_URL: process.env.VITE_WS_URL,
      PORT: process.env.PORT,
      // We'll check if these exist but not show their values
      DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ Missing',
      SESSION_SECRET: process.env.SESSION_SECRET ? '✅ Set' : '❌ Missing',
      JWT_SECRET: process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'
    }
  });
});

async function main() {
  try {
    await initializeDatabase();
    
    // Set up Vite middleware first in development
    const server = await createServer(app);
    if (app.get("env") === "development") {
      await setupVite(app, server);
    }

    // Then register API routes
    await registerRoutes(app, storage);

    // Error handling middleware
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // Finally, serve static files in production
    if (app.get("env") !== "development") {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to initialize application:", err);
  }
}

main();
