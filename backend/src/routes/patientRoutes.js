import express from 'express';
import {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  getMyPatientProfile,
  updateMyPatientProfile,
} from '../controllers/patientController.js';
import { protect, authorizeRoles } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Logged-in patient's own profile
router.get('/me',      protect, authorizeRoles('PATIENT'), getMyPatientProfile);
router.put('/me',      protect, authorizeRoles('PATIENT'), updateMyPatientProfile);
router.get('/profile', protect, authorizeRoles('PATIENT'), getMyPatientProfile);
router.put('/profile', protect, authorizeRoles('PATIENT'), updateMyPatientProfile);

// CRUD (admin use)
router.post('/', protect, createPatient);
router.get('/', protect, getAllPatients);
router.get('/:id', protect, getPatientById);
router.put('/:id', protect, updatePatient);
router.delete('/:id', protect, deletePatient);

export default router;
