// src/routes/medicalstaffRoutes.js
import express from 'express';
import {
  getMyStaffProfile,
  getStaffDashboardStats,
  updateMyStaffProfile,
} from '../controllers/medicalstaffController.js';
import { protect, authorizeRoles } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me',     protect, authorizeRoles('STAFF'), getMyStaffProfile);
router.put('/me',     protect, authorizeRoles('STAFF'), updateMyStaffProfile);
router.get('/profile',protect, authorizeRoles('STAFF'), getMyStaffProfile);
router.put('/update', protect, authorizeRoles('STAFF'), updateMyStaffProfile);

router.get('/stats',  protect, authorizeRoles('STAFF'), getStaffDashboardStats);

export default router;
