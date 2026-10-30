import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  resetAdminUserPassword,
  getAdminActivity,
} from '../controllers/adminController.js';

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/users', getAdminUsers);
router.post('/users', createAdminUser);
router.patch('/users/:id', updateAdminUser);
router.patch('/users/:id/password', resetAdminUserPassword);
router.get('/activity', getAdminActivity);

export default router;
