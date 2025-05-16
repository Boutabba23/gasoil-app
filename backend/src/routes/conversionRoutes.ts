import express from 'express';
// 👇 Ensure deleteConversionEntry is imported
import { convertCmToLitres, getConversionHistory, deleteConversionEntry } from '../controllers/conversionController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// POST /api/data/convert
router.post('/convert', protect, convertCmToLitres);

// GET /api/data/history
router.get('/history', protect, getConversionHistory);

// 👇 NEW: DELETE /api/data/history/:id
router.delete('/history/:id', protect, deleteConversionEntry);

export default router;