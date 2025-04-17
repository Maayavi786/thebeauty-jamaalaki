// Add backend endpoints for forgot/reset password
import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL || '';
const sql = neon(databaseUrl);

const router = express.Router();

// In-memory store for tokens (replace with DB/Redis in production)
const resetTokens = new Map();

// Request reset
router.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });
  const [user] = await sql`SELECT * FROM users WHERE email = ${email}`;
  if (!user) return res.json({ success: true }); // Don't reveal if user exists
  const token = crypto.randomBytes(32).toString('hex');
  resetTokens.set(token, { userId: user.id, expires: Date.now() + 3600 * 1000 });
  // Send email (mock)
  console.log(`[DEV] Password reset link: http://localhost:5173/reset-password?token=${token}`);
  res.json({ success: true });
});

// Reset password
router.post('/api/auth/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ success: false, message: 'Token and password required' });
  const data = resetTokens.get(token);
  if (!data || data.expires < Date.now()) return res.status(400).json({ success: false, message: 'Invalid or expired token' });
  const hash = await bcrypt.hash(password, 10);
  await sql`UPDATE users SET password = ${hash} WHERE id = ${data.userId}`;
  resetTokens.delete(token);
  res.json({ success: true });
});

export default router;
