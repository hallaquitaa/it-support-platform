import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
  restoreTask,
  getTaskTrash,
  permanentlyDeleteTask,
  getTaskHistory,
  getTaskStats,
} from '../controllers/taskController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getTasks);
router.get('/stats', getTaskStats);
router.get('/history', getTaskHistory);
router.get('/trash', getTaskTrash);

router.get('/:id', getTaskById);

router.post('/', createTask);

router.put('/:id', updateTask);
router.put('/:id/complete', completeTask);
router.put('/:id/restore', restoreTask);

router.delete('/:id', deleteTask);
router.delete('/:id/permanent', permanentlyDeleteTask);

export default router;