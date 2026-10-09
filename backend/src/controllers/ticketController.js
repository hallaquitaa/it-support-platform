import Ticket from '../models/Ticket.js';

/**
 * Obtener todos los tickets
 */
export async function getTickets(req, res) {
  try {
    const {
      status,
      priority,
      category,
      branch_id,
      assigned_to,
      search,
      include_deleted,
      trash
    } = req.query;

    const tickets = await Ticket.getAll({
      user_id: req.user.id,
      status,
      priority,
      category,
      branch_id,
      assigned_to,
      search,
      include_deleted: include_deleted === 'true',
      trash: trash === 'true'
    });

    res.json(tickets);
  } catch (error) {
    console.error('Error obteniendo tickets:', error);

    res.status(500).json({
      message: 'Error al obtener los tickets',
      error: error.message
    });
  }
}

/**
 * Obtener un ticket por ID
 */
export async function getTicketById(req, res) {
  try {
    const { id } = req.params;

    const ticket = await Ticket.getById(
      id,
      req.user.id
    );

    if (!ticket) {
      return res.status(404).json({
        message: 'Ticket no encontrado'
      });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Error obteniendo ticket:', error);

    res.status(500).json({
      message: 'Error al obtener el ticket',
      error: error.message
    });
  }
}

/**
 * Crear un ticket
 */
export async function createTicket(req, res) {
  try {
    const {
      title,
      description,
      status,
      priority,
      category,
      branch_id,
      assigned_to
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: 'El título del ticket es obligatorio'
      });
    }

    const ticket = await Ticket.create({
      title: title.trim(),
      description,
      status,
      priority,
      category,
      branch_id,
      assigned_to,
      created_by: req.user.id
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creando ticket:', error);

    res.status(500).json({
      message: 'Error al crear el ticket',
      error: error.message
    });
  }
}

/**
 * Actualizar un ticket
 */
export async function updateTicket(req, res) {
  try {
    const { id } = req.params;

    const ticket = await Ticket.update(
      id,
      req.body,
      req.user.id
    );

    if (!ticket) {
      return res.status(404).json({
        message: 'Ticket no encontrado o no tienes permiso para modificarlo'
      });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Error actualizando ticket:', error);

    res.status(500).json({
      message: 'Error al actualizar el ticket',
      error: error.message
    });
  }
}

/**
 * Cambiar estado de un ticket
 */
export async function updateTicketStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      'open',
      'in_progress',
      'resolved',
      'closed'
    ];

    if (!status) {
      return res.status(400).json({
        message: 'El estado es obligatorio'
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Estado de ticket no válido',
        allowedStatuses
      });
    }

    const ticket = await Ticket.updateStatus(
      id,
      status,
      req.user.id
    );

    if (!ticket) {
      return res.status(404).json({
        message: 'Ticket no encontrado o no tienes permiso para modificarlo'
      });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Error actualizando estado del ticket:', error);

    res.status(500).json({
      message: 'Error al actualizar el estado del ticket',
      error: error.message
    });
  }
}

/**
 * Mover ticket a la papelera
 */
export async function deleteTicket(req, res) {
  try {
    const { id } = req.params;

    const deleted = await Ticket.delete(
      id,
      req.user.id
    );

    if (!deleted) {
      return res.status(404).json({
        message: 'Ticket no encontrado o no tienes permiso para eliminarlo'
      });
    }

    res.json({
      message: 'Ticket movido a la papelera'
    });
  } catch (error) {
    console.error('Error eliminando ticket:', error);

    res.status(500).json({
      message: 'Error al mover el ticket a la papelera',
      error: error.message
    });
  }
}

/**
 * Obtener papelera de tickets
 */
export async function getTicketTrash(req, res) {
  try {
    const tickets = await Ticket.getTrash(
      req.user.id
    );

    res.json(tickets);
  } catch (error) {
    console.error('Error obteniendo papelera de tickets:', error);

    res.status(500).json({
      message: 'Error al obtener la papelera de tickets',
      error: error.message
    });
  }
}

/**
 * Restaurar ticket desde la papelera
 */
export async function restoreTicket(req, res) {
  try {
    const { id } = req.params;

    const ticket = await Ticket.restore(
      id,
      req.user.id
    );

    if (!ticket) {
      return res.status(404).json({
        message: 'Ticket no encontrado en la papelera o no tienes permiso para restaurarlo'
      });
    }

    res.json({
      message: 'Ticket restaurado correctamente',
      ticket
    });
  } catch (error) {
    console.error('Error restaurando ticket:', error);

    res.status(500).json({
      message: 'Error al restaurar el ticket',
      error: error.message
    });
  }
}

/**
 * Eliminar ticket permanentemente
 */
export async function permanentlyDeleteTicket(req, res) {
  try {
    const { id } = req.params;

    const deleted = await Ticket.permanentDelete(
      id,
      req.user.id
    );

    if (!deleted) {
      return res.status(404).json({
        message: 'Ticket no encontrado o no tienes permiso para eliminarlo'
      });
    }

    res.json({
      message: 'Ticket eliminado permanentemente'
    });
  } catch (error) {
    console.error('Error eliminando permanentemente el ticket:', error);

    res.status(500).json({
      message: 'Error al eliminar permanentemente el ticket',
      error: error.message
    });
  }
}

/**
 * Estadísticas de tickets
 */
export async function getTicketStats(req, res) {
  try {
    const stats = await Ticket.getStats(
      req.user.id
    );

    res.json(stats);
  } catch (error) {
    console.error('Error obteniendo estadísticas de tickets:', error);

    res.status(500).json({
      message: 'Error al obtener las estadísticas de tickets',
      error: error.message
    });
  }
}