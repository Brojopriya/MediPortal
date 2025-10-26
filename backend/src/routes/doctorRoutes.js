import express from 'express';
import {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor
} from '../controllers/doctorController.js';
import { protect } from '../../middleware/authMiddleware.js';  

const router = express.Router();

// CRUD operations for doctors
router.post('/', protect, createDoctor);
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.put('/:id', protect, updateDoctor);
router.delete('/:id', protect, deleteDoctor);

export default router;
