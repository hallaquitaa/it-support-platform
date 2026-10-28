import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getSnippets, getSnippetCategories, createSnippet, updateSnippet, deleteSnippet,
  createSnippetCategory, updateSnippetCategory, deleteSnippetCategory
} from '../controllers/snippetController.js';

const router = express.Router();
router.use(authMiddleware);
router.get('/', getSnippets);
router.get('/categories', getSnippetCategories);
router.post('/categories', createSnippetCategory);
router.put('/categories/:id', updateSnippetCategory);
router.delete('/categories/:id', deleteSnippetCategory);
router.post('/', createSnippet);
router.put('/:id', updateSnippet);
router.delete('/:id', deleteSnippet);
export default router;
