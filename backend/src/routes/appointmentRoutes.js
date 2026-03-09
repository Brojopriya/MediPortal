import express from 'express';
import {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
} from '../controllers/appointmentController.js';
import { authorizeRoles, protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Appointment routes
router.post('/', protect, createAppointment);
router.get('/', protect, getAllAppointments);
router.post('/book', protect, authorizeRoles('PATIENT'), bookAppointment);
router.get('/my', protect, authorizeRoles('PATIENT'), getMyAppointments);
router.get('/doctor', protect, authorizeRoles('DOCTOR'), getDoctorAppointments);
router.get('/:id', protect, getAppointmentById);
router.put('/:id', protect, updateAppointment);
router.delete('/:id', protect, deleteAppointment);

export default router;
