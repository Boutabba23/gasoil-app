import express from 'express';
// 👇 Import controller functions from your controller file
import { 
    convertCmToLitres, 
    getConversionHistory, 
    deleteConversionEntry 
} from '../controllers/conversionController'; // Correct path to controller
import { protect } from '../middleware/authMiddleware'; // Your protect middleware

const router = express.Router();

// Define routes using the imported controller functions
router.post('/convert', protect, convertCmToLitres);
router.get('/history', protect, getConversionHistory);
router.delete('/history/:id', protect, deleteConversionEntry);

export default router; // <<< THIS FILE EXPORTS THE ROUTER AS DEFAULT