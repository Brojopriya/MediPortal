import express from 'express';
import {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient
} from '../controllers/patientController.js';
import { protect } from '../../middleware/authMiddleware.js';  

const router = express.Router();

// CRUD operations for patients
router.post('/', protect, createPatient);
router.get('/', protect, getAllPatients);
router.get('/:id', protect, getPatientById);
router.put('/:id', protect, updatePatient);
router.delete('/:id', protect, deletePatient);

export default router;
