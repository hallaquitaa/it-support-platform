
import express from 'express';

import {
  getRemoteAccess,
  getRemoteAccessById,
  createRemoteAccess,
  updateRemoteAccess,
  deleteRemoteAccess
} from '../controllers/remoteAccessController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación.
router.use(authMiddleware);

// Listar y buscar conexiones.
router.get('/', getRemoteAccess);

// Consultar una conexión específica.
router.get('/:id', getRemoteAccessById);

// Crear una conexión.
router.post('/', createRemoteAccess);

// Actualizar una conexión.
router.put('/:id', updateRemoteAccess);

// Eliminar una conexión.
router.delete('/:id', deleteRemoteAccess);

export default router;