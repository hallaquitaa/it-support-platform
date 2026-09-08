import express from 'express';
import {
  getCredentials,
  getCredentialById,
  createCredential,
  revealCredential,
  revealMultiple,
  updateCredential,
  deleteCredential,
  getVaultStats,
  toggleFavorite,
  getFavorites,
  getMostUsed,
  incrementUsage
} from '../controllers/vaultController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Aplicar autenticación a TODAS las rutas
router.use(authMiddleware);

// Rutas específicas (sin parámetros) PRIMERO
router.get('/stats', getVaultStats);
router.get('/favorites', getFavorites);
router.get('/most-used', getMostUsed);
router.get('/', getCredentials);
router.post('/:id/favorite', toggleFavorite);
router.post('/:id/usage', incrementUsage);
router.post('/', createCredential);
router.post('/reveal/:id', revealCredential);
router.post('/reveal-multiple', revealMultiple); // NUEVA RUTA SEGURA
router.put('/:id', updateCredential);
router.delete('/:id', deleteCredential);
router.get('/:id', getCredentialById);

export default router;