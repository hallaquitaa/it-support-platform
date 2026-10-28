import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getHardwareAssetOverview,
  getHardwareAssetDetails,
  updateHardwareAssetDetails,
  createHardwareAssetEvent,
  createHardwareComponent,
  updateHardwareComponent,
  createHardwareLoan,
  returnHardwareLoan,
  createHardwareTransfer,
  createHardwareAudit,
  getHardwareDuplicates
} from '../controllers/hardwareAssetController.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/overview', getHardwareAssetOverview);
router.get('/duplicates', getHardwareDuplicates);
router.get('/:hardwareId', getHardwareAssetDetails);
router.put('/:hardwareId/details', updateHardwareAssetDetails);
router.post('/:hardwareId/events', createHardwareAssetEvent);
router.post('/:hardwareId/components', createHardwareComponent);
router.patch('/:hardwareId/components/:componentId', updateHardwareComponent);
router.post('/:hardwareId/loans', createHardwareLoan);
router.post('/:hardwareId/loans/:loanId/return', returnHardwareLoan);
router.post('/:hardwareId/transfers', createHardwareTransfer);
router.post('/:hardwareId/audits', createHardwareAudit);

export default router;
