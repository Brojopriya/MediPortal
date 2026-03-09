import express from 'express';
import { getPatientDashboardSummary, getPublicStats } from '../controllers/statsController.js';
import { authorizeRoles, protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Public route used by homepage cards.
router.get('/', getPublicStats);
router.get('/patient-summary', protect, authorizeRoles('PATIENT'), getPatientDashboardSummary);

export default router;
