import express from 'express';
import {
  createNurse,
  getAllNurses,
  getNurseById,
  updateNurse,
  deleteNurse,
  getMyNurseProfile,
  updateMyNurseProfile,
  getNurseDashboardSummary,
  getMyNursePatients,
  getNurseSchedule,
  getNurseOperationsContext,
} from '../controllers/nurseController.js';
import { protect, authorizeRoles } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Logged-in nurse's own profile
router.get('/me',      protect, authorizeRoles('NURSE'), getMyNurseProfile);
router.put('/me',      protect, authorizeRoles('NURSE'), updateMyNurseProfile);
router.get('/profile', protect, authorizeRoles('NURSE'), getMyNurseProfile);
router.put('/profile', protect, authorizeRoles('NURSE'), updateMyNurseProfile);
router.get('/dashboard-summary', protect, authorizeRoles('NURSE'), getNurseDashboardSummary);
router.get('/my-patients', protect, authorizeRoles('NURSE'), getMyNursePatients);
router.get('/schedule', protect, authorizeRoles('NURSE'), getNurseSchedule);
router.get('/operations-context', protect, authorizeRoles('NURSE'), getNurseOperationsContext);

// CRUD (admin use)
router.post('/', protect, createNurse);
router.get('/', getAllNurses);
router.get('/:id', getNurseById);
router.put('/:id', protect, updateNurse);
router.delete('/:id', protect, deleteNurse);

export default router;
