// src/routes/authRoutes.ts
import express from 'express';
import passport from 'passport';
import { googleCallback, getMe, logout } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Initiate Google OAuth flow
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false }) // session: false as we use JWT
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed` }),
  googleCallback
);

// Get current authenticated user's info
router.get('/me', protect, getMe);

// Logout (primarily a client-side token clearing action)
router.post('/logout', protect, logout); // POST is conventional, can be GET

export default router;