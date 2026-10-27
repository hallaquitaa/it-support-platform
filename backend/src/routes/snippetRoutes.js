import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getSnippets, getSnippetCategories, createSnippet, updateSnippet, deleteSnippet
} from '../controllers/snippetController.js';

const router = express.Router();
router.use(authMiddleware);
router.get('/', getSnippets);
router.get('/categories', getSnippetCategories);
router.post('/', createSnippet);
router.put('/:id', updateSnippet);
router.delete('/:id', deleteSnippet);
export default router;
