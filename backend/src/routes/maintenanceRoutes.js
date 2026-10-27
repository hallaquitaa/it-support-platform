import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getMaintenance, createMaintenance, updateMaintenance, deleteMaintenance,
  getMaintenanceLogs, createMaintenanceLog
} from '../controllers/maintenanceController.js';

const router = express.Router();
router.use(authMiddleware);
router.get('/', getMaintenance);
router.get('/logs', getMaintenanceLogs);
router.post('/logs', createMaintenanceLog);
router.post('/', createMaintenance);
router.put('/:id', updateMaintenance);
router.delete('/:id', deleteMaintenance);
export default router;
