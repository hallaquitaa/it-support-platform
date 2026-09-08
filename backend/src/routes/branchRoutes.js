import express from 'express';
import { 
  getBranches, 
  getBranchById, 
  createBranch, 
  updateBranch, 
  deleteBranch, 
  getBranchStats 
} from '../controllers/branchController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getBranches);
router.get('/stats', getBranchStats);
router.get('/:id', getBranchById);
router.post('/', createBranch);
router.put('/:id', updateBranch);
router.delete('/:id', deleteBranch);

export default router;