import express from 'express';
import {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getDoctorDashboardSummary,
  getDoctorPatients,
  getMyDoctorProfile,
  updateMyDoctorProfile,
} from '../controllers/doctorController.js';
import { authorizeRoles, protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

// CRUD operations for doctors
router.get('/me', protect, authorizeRoles('DOCTOR'), getMyDoctorProfile);
router.put('/me', protect, authorizeRoles('DOCTOR'), updateMyDoctorProfile);
router.get('/profile', protect, authorizeRoles('DOCTOR'), getMyDoctorProfile);
router.put('/profile', protect, authorizeRoles('DOCTOR'), updateMyDoctorProfile);
router.get('/dashboard-summary', protect, authorizeRoles('DOCTOR'), getDoctorDashboardSummary);
router.get('/my-patients', protect, authorizeRoles('DOCTOR'), getDoctorPatients);
router.post('/', protect, createDoctor);
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.put('/:id', protect, updateDoctor);
router.delete('/:id', protect, deleteDoctor);

export default router;
