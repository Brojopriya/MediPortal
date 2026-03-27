// src/routes/userRoutes.js
import express from 'express';
import {
  registerUser,
  loginUser,
  adminLoginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getPendingApprovals,
  updateUserApprovalStatus,
  getAllUsers,
  adminUpdateUserById,
  adminDeleteUserById,
  getAdminSummary,
  adminCreateUser,
  forgotPassword,
} from '../controllers/userController.js';
import { getPublicSiteContent, updateSiteContent } from '../controllers/siteContentController.js';
import { protect, authorizeRoles } from '../../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Public routes (no authentication required)
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin-login', adminLoginUser);
router.post('/forgot-password', forgotPassword);
router.get('/site-content', getPublicSiteContent);

// ✅ Protected routes (authentication required)
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.delete('/delete', protect, deleteUser);

// Admin-only approval flow for professional accounts
router.get('/approvals/pending', protect, authorizeRoles('ADMIN'), getPendingApprovals);
router.put('/approvals/:id', protect, authorizeRoles('ADMIN'), updateUserApprovalStatus);
router.get('/admin/users', protect, authorizeRoles('ADMIN'), getAllUsers);
router.get('/admin/summary', protect, authorizeRoles('ADMIN'), getAdminSummary);
router.post('/admin/users', protect, authorizeRoles('ADMIN'), adminCreateUser);
router.put('/admin/users/:id', protect, authorizeRoles('ADMIN'), adminUpdateUserById);
router.delete('/admin/users/:id', protect, authorizeRoles('ADMIN'), adminDeleteUserById);
router.put('/site-content', protect, authorizeRoles('ADMIN'), updateSiteContent);

export default router;
