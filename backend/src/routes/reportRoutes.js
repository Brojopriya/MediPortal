import express from 'express';
import {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport
} from '../controllers/reportController.js';
import { protect } from '../../middleware/authMiddleware.js';  

const router = express.Router();

// Medical report routes
router.post('/', protect, createReport);
router.get('/', protect, getAllReports);
router.get('/:id', protect, getReportById);
router.put('/:id', protect, updateReport);
router.delete('/:id', protect, deleteReport);

export default router;
