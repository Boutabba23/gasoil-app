// src/routes/conversionRoutes.ts
import express from 'express';
import { convertCmToLitres, getConversionHistory } from '../controllers/conversionController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// POST /api/data/convert - Convert cm to litres and record
router.post('/convert', protect, convertCmToLitres);

// GET /api/data/history - Get user's conversion history
router.get('/history', protect, getConversionHistory);

export default router;