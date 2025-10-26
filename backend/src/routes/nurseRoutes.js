import express from 'express';
import {
  createNurse,
  getAllNurses,
  getNurseById,
  updateNurse,
  deleteNurse
} from '../controllers/nurseController.js';
import { protect } from '../../middleware/authMiddleware.js';  

const router = express.Router();

// CRUD operations for nurses
router.post('/', protect, createNurse);
router.get('/', getAllNurses);
router.get('/:id', getNurseById);
router.put('/:id', protect, updateNurse);
router.delete('/:id', protect, deleteNurse);

export default router;
