// src/routes/authRoutes.ts
import express from 'express';
import passport from 'passport';
import { googleCallback, getMe, logout } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Initial redirect to Google
router.get(
  '/google',
  (req, res, next) => { // Optional: Middleware to dynamically add prompt
    const authOptions: passport.AuthenticateOptions = {
      scope: ['profile', 'email'],
      session: false, // If not using express-session with Passport for this strategy
    };

    // Check if the frontend sent a prompt preference
    // This makes the frontend the primary controller of the prompt.
    if (req.query.prompt) {
      authOptions.prompt = req.query.prompt as string; // 'select_account' or 'consent' etc.
    } else {
      // If frontend doesn't send it, you can default it here (less flexible)
      authOptions.prompt = 'select_account'; 
    }
    
    console.log("Backend /google route: Authenticating with options:", authOptions);
    passport.authenticate('google', authOptions)(req, res, next);
  }
);

// Callback from Google
router.get(
  '/google/callback',
  passport.authenticate('google', {
    // failureRedirect is where Google redirects if IT finds an error with your request,
    // or if the user denies access on Google's consent screen.
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5174'}/login?error=google_auth_failed`,
    session: false, // Crucial if you're managing state with JWTs and not server sessions
  }),
  googleCallback // Your controller to handle user creation/login and JWT generation
);

// Get current authenticated user's info
router.get('/me', protect, getMe);

// Logout (primarily a client-side token clearing action)
router.post('/logout', protect, logout); // POST is conventional, can be GET

export default router;