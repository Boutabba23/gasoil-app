import express from 'express';
import {
    convertCmToLitres,
    getConversionHistory,
    deleteConversionEntry,
    bulkDeleteConversionEntries
} from '../controllers/conversionControllerSimple';
import { protect, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Define routes using the imported controller functions
router.post('/convert', protect, convertCmToLitres);
router.get('/history', protect, getConversionHistory);
router.delete('/history/:id', protect, requireAdmin, deleteConversionEntry);
router.post('/history/bulk-delete', protect, requireAdmin, bulkDeleteConversionEntries);

export default router;
