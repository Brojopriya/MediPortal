import express from 'express';
import {
  createDepartment,
  createDiagnosticTest,
  createHospital,
  createWard,
  deleteHospital,
  getHospitalCatalog,
  getHospitals,
  updateHospital,
} from '../controllers/hospitalController.js';
import { authorizeRoles, protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/catalog', getHospitalCatalog);
router.get('/', protect, authorizeRoles('ADMIN'), getHospitals);
router.post('/', protect, authorizeRoles('ADMIN'), createHospital);
router.post('/departments', protect, authorizeRoles('ADMIN'), createDepartment);
router.post('/wards', protect, authorizeRoles('ADMIN'), createWard);
router.post('/tests', protect, authorizeRoles('ADMIN'), createDiagnosticTest);
router.put('/:id', protect, authorizeRoles('ADMIN'), updateHospital);
router.delete('/:id', protect, authorizeRoles('ADMIN'), deleteHospital);

export default router;
