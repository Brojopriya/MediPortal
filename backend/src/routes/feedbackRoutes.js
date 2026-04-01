import express from 'express';
import { authorizeRoles, protect } from '../../middleware/authMiddleware.js';
import { createFeedback, getAllFeedback, getMyFeedback, getPublicFeedback } from '../controllers/feedbackController.js';

const router = express.Router();

router.get('/public', getPublicFeedback);
router.post('/', protect, authorizeRoles('PATIENT'), createFeedback);
router.get('/my', protect, authorizeRoles('PATIENT'), getMyFeedback);
router.get('/admin', protect, authorizeRoles('ADMIN'), getAllFeedback);

export default router;
