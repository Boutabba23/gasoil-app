import express from 'express';
import passport from '../config/passport';
import { googleCallback, getMe, logout } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get(
  '/google',
  (req, res, next) => {
    const authOptions: passport.AuthenticateOptions = {
      scope: ['profile', 'email'],
      session: false, 
    };
    if (req.query.prompt) {
      authOptions.prompt = req.query.prompt as string;
    } else {
      authOptions.prompt = 'select_account';
    }
    passport.authenticate('google', authOptions)(req, res, next);
  }
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=google_auth_failed`,
    session: false,
  }),
  googleCallback
);

router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router; // <<< ENSURE THIS LINE IS EXACTLY LIKE THIS