import express from 'express';
import {
  getHardware,
  getHardwareById,
  createHardware,
  updateHardware,
  deleteHardware,
  getHardwareStats,
  getHardwareTypes
} from '../controllers/hardwareController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getHardware);
router.get('/stats', getHardwareStats);
router.get('/types', getHardwareTypes);
router.get('/:id', getHardwareById);
router.post('/', createHardware);
router.put('/:id', updateHardware);
router.delete('/:id', deleteHardware);

export default router;