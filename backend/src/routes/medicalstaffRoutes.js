// src/routes/medicalstaffRoutes.js
import express from 'express';
import { getMyStaffProfile, updateMyStaffProfile } from '../controllers/medicalstaffController.js';
import { protect, authorizeRoles } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me',     protect, authorizeRoles('STAFF'), getMyStaffProfile);
router.put('/me',     protect, authorizeRoles('STAFF'), updateMyStaffProfile);
router.get('/profile',protect, authorizeRoles('STAFF'), getMyStaffProfile);
router.put('/update', protect, authorizeRoles('STAFF'), updateMyStaffProfile);

// Stats endpoint used by MedicalStaffDashboard frontend
router.get('/stats',  protect, authorizeRoles('STAFF'), async (req, res) => {
  res.json({ success: true, message: 'Staff stats', data: {} });
});

export default router;
