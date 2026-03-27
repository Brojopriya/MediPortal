import express from 'express';
import {
	getAssignableStaff,
	getReviewQueue,
	getSessions,
	reviewRequest,
	startSession,
	submitRequest,
	getSessionById,
	updateSession,
	endSession,
} from '../controllers/telemedicineController.js';
import { authorizeRoles, protect } from '../../middleware/authMiddleware.js';  

const router = express.Router();

// Telemedicine routes
router.post('/request', protect, authorizeRoles('PATIENT'), submitRequest);
router.get('/review-queue', protect, authorizeRoles('STAFF'), getReviewQueue);
router.put('/review/:id', protect, authorizeRoles('STAFF'), reviewRequest);
router.get('/assignable-staff', protect, authorizeRoles('DOCTOR'), getAssignableStaff);
router.get('/session', protect, getSessions);
router.post('/session', protect, startSession);
router.get('/session/:id', protect, getSessionById);
router.put('/session/:id', protect, updateSession);
router.delete('/session/:id', protect, endSession);

export default router;
