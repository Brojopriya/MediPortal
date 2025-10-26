import express from 'express';
import { startSession, getSessionById, updateSession, endSession } from '../controllers/telemedicineController.js';
import { protect } from '../../middleware/authMiddleware.js';  

const router = express.Router();

// Telemedicine routes
router.post('/session', protect, startSession);
router.get('/session/:id', protect, getSessionById);
router.put('/session/:id', protect, updateSession);
router.delete('/session/:id', protect, endSession);

export default router;
