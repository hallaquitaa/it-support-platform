import express from 'express';
import { exportCredentialsToExcel } from '../controllers/exportController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/vault/excel', exportCredentialsToExcel);

export default router;