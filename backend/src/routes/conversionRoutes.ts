import express from 'express';
// 👇 Import controller functions from your controller file
import { 
    convertCmToLitres, 
    getConversionHistory, 
    deleteConversionEntry,
     bulkDeleteConversionEntries  
} from '../controllers/conversionController'; // Correct path to controller
import { protect } from '../middleware/authMiddleware'; // Your protect middleware

const router = express.Router();

// Define routes using the imported controller functions
router.post('/convert', protect, convertCmToLitres);
router.get('/history', protect, getConversionHistory);
router.delete('/history/:id', protect, deleteConversionEntry);
// 👇 NEW: POST route for bulk delete (using POST because DELETE typically doesn't have a body with IDs)
router.post('/history/bulk-delete', protect, bulkDeleteConversionEntries);

export default router; // <<< THIS FILE EXPORTS THE ROUTER AS DEFAULT