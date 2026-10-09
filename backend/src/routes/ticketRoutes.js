import express from 'express';
import {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  updateTicketStatus,
  deleteTicket,
  getTicketTrash,
  restoreTicket,
  permanentlyDeleteTicket,
  getTicketStats
} from '../controllers/ticketController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas las rutas de tickets requieren autenticación
router.use(authMiddleware);

// Estadísticas
router.get('/stats', getTicketStats);

// Papelera
router.get('/trash', getTicketTrash);

// Listar tickets
router.get('/', getTickets);

// Obtener ticket por ID
router.get('/:id', getTicketById);

// Crear ticket
router.post('/', createTicket);

// Actualizar ticket
router.put('/:id', updateTicket);

// Actualizar estado
router.put('/:id/status', updateTicketStatus);

// Mover a papelera
router.delete('/:id', deleteTicket);

// Restaurar desde papelera
router.put('/:id/restore', restoreTicket);

// Eliminar permanentemente
router.delete('/:id/permanent', permanentlyDeleteTicket);

export default router;