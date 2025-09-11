import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { getMe, logout } from '../controllers/authController';

const router = express.Router();

// In a real Supabase implementation, Google OAuth would be handled by Supabase Auth
// For this example, we'll keep the same API structure but use Supabase for data storage

router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
