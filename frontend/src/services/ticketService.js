import api from './api';

const normalizeTicketFromBackend = (ticket) => {
  if (!ticket) return null;

  return {
    ...ticket,

    id: Number(ticket.id),

    title: ticket.title || '',
    description: ticket.description || '',

    status: ticket.status || 'open',
    priority: ticket.priority || 'medium',

    category: ticket.category || '',

    branch_id: ticket.branch_id ?? null,
    assigned_to: ticket.assigned_to ?? null,
    created_by: ticket.created_by ?? null,

    branch_name: ticket.branch_name || '',
    assigned_name: ticket.assigned_name || '',
    created_by_name: ticket.created_by_name || '',

    created_at: ticket.created_at || null,
    updated_at: ticket.updated_at || null,
    resolved_at: ticket.resolved_at || null,
    deleted_at: ticket.deleted_at || null,

    deleted: Boolean(ticket.deleted_at),
  };
};

const normalizeTicketList = (data) => {
  if (Array.isArray(data)) {
    return data.map(normalizeTicketFromBackend);
  }

  if (Array.isArray(data?.tickets)) {
    return data.tickets.map(normalizeTicketFromBackend);
  }

  return [];
};

const ticketService = {
  // Obtener todos los tickets
  async getAll(filters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ''
      ) {
        params.append(key, value);
      }
    });

    const query = params.toString();

    const response = await api.get(
      `/tickets${query ? `?${query}` : ''}`
    );

    return normalizeTicketList(response.data);
  },

  // Obtener un ticket por ID
  async getById(id, includeDeleted = false) {
    const response = await api.get(
      `/tickets/${id}${includeDeleted ? '?include_deleted=true' : ''}`
    );

    return normalizeTicketFromBackend(response.data);
  },

  // Obtener estadísticas
  async getStats() {
    const response = await api.get('/tickets/stats');

    return response.data;
  },

  // Obtener papelera
  async getTrash() {
    const response = await api.get('/tickets/trash');

    return normalizeTicketList(response.data);
  },

  // Crear ticket
  async create(ticketData) {
    const payload = {
      title: ticketData.title,
      description: ticketData.description || null,
      status: ticketData.status || 'open',
      priority: ticketData.priority || 'medium',
      category: ticketData.category || null,
      branch_id: ticketData.branch_id ?? null,
      assigned_to: ticketData.assigned_to ?? null,
    };

    const response = await api.post('/tickets', payload);

    return normalizeTicketFromBackend(response.data);
  },

  // Actualizar ticket
  async update(id, ticketData) {
    const payload = {
      title: ticketData.title,
      description: ticketData.description || null,
      status: ticketData.status,
      priority: ticketData.priority,
      category: ticketData.category || null,
      branch_id: ticketData.branch_id ?? null,
      assigned_to: ticketData.assigned_to ?? null,
    };

    const response = await api.put(
      `/tickets/${id}`,
      payload
    );

    return normalizeTicketFromBackend(response.data);
  },

  // Cambiar estado
  async updateStatus(id, status) {
    const response = await api.put(
      `/tickets/${id}/status`,
      { status }
    );

    return normalizeTicketFromBackend(response.data);
  },

  // Mover a papelera
  async delete(id) {
    const response = await api.delete(
      `/tickets/${id}`
    );

    return normalizeTicketFromBackend(response.data);
  },

  // Restaurar ticket desde papelera
  async restore(id) {
    const response = await api.put(
      `/tickets/${id}/restore`
    );

    return normalizeTicketFromBackend(response.data);
  },

  // Eliminar permanentemente
  async permanentDelete(id) {
    const response = await api.delete(
      `/tickets/${id}/permanent`
    );

    return response.data;
  },
};

export default ticketService;