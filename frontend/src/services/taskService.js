import api from './api';

const UI_TO_BACKEND_PRIORITY = {
  mandatory: 'high',
  high: 'high',
  critical: 'high',
  standard: 'medium',
  medium: 'medium',
  not_urgent: 'low',
  low: 'low',
};

const BACKEND_TO_UI_PRIORITY = {
  high: 'high',
  medium: 'medium',
  low: 'low',
};

const prepareTaskForBackend = (data = {}) => {
  const prepared = { ...data };

  if (prepared.priority) {
    prepared.priority =
      UI_TO_BACKEND_PRIORITY[prepared.priority] ||
      prepared.priority;
  }

  if (typeof prepared.completed === 'boolean') {
    prepared.status = prepared.completed
      ? 'resolved'
      : 'pending';

    delete prepared.completed;
  }

  if (
    prepared.hour !== undefined &&
    prepared.due_time === undefined
  ) {
    prepared.due_time = prepared.hour;
  }

  delete prepared.hour;

  return prepared;
};

const normalizeTaskFromBackend = (task) => {
  if (!task) return task;

  return {
    ...task,
    priority:
      BACKEND_TO_UI_PRIORITY[task.priority] ||
      task.priority ||
      'medium',
    completed:
      task.status === 'resolved' ||
      task.status === 'completed',
    hour:
      task.due_time ||
      task.hour ||
      '',
    completed_at:
      task.completed_at || null,
    started_at:
      task.started_at || null,
    parent_task_id:
      task.parent_task_id || null,
    task_type:
      task.task_type || 'administrative',
    deleted_at:
      task.deleted_at || null,
  };
};

const normalizeList = (data) => {
  return Array.isArray(data)
    ? data.map(normalizeTaskFromBackend)
    : [];
};

const taskService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/tasks', {
        params,
      });

      return normalizeList(response.data);
    } catch (error) {
      console.error('Error obteniendo tareas:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/tasks/${id}`);

      return normalizeTaskFromBackend(response.data);
    } catch (error) {
      console.error(
        `Error obteniendo tarea ${id}:`,
        error
      );
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/tasks/stats');

      return response.data;
    } catch (error) {
      console.error(
        'Error obteniendo estadísticas:',
        error
      );
      throw error;
    }
  },

  getHistory: async () => {
    try {
      const response = await api.get('/tasks/history');

      return normalizeList(response.data);
    } catch (error) {
      console.error(
        'Error obteniendo historial:',
        error
      );
      throw error;
    }
  },

  getTrash: async () => {
    try {
      const response = await api.get('/tasks/trash');

      return normalizeList(response.data);
    } catch (error) {
      console.error(
        'Error obteniendo papelera:',
        error
      );
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post(
        '/tasks',
        prepareTaskForBackend(data)
      );

      return normalizeTaskFromBackend(response.data);
    } catch (error) {
      console.error(
        'Error creando tarea:',
        error
      );
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(
        `/tasks/${id}`,
        prepareTaskForBackend(data)
      );

      return normalizeTaskFromBackend(response.data);
    } catch (error) {
      console.error(
        `Error actualizando tarea ${id}:`,
        error
      );
      throw error;
    }
  },

  complete: async (id) => {
    try {
      const response = await api.put(
        `/tasks/${id}/complete`
      );

      return normalizeTaskFromBackend(response.data);
    } catch (error) {
      console.error(
        `Error completando tarea ${id}:`,
        error
      );
      throw error;
    }
  },

  restore: async (id) => {
    try {
      const response = await api.put(
        `/tasks/${id}/restore`
      );

      return normalizeTaskFromBackend(response.data);
    } catch (error) {
      console.error(
        `Error restaurando tarea ${id}:`,
        error
      );
      throw error;
    }
  },

  start: async (id) => {
    try {
      const response = await api.put(
        `/tasks/${id}`,
        {
          status: 'in_progress',
        }
      );

      return normalizeTaskFromBackend(response.data);
    } catch (error) {
      console.error(
        `Error iniciando tarea ${id}:`,
        error
      );
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(
        `/tasks/${id}`
      );

      return response.data;
    } catch (error) {
      console.error(
        `Error eliminando tarea ${id}:`,
        error
      );
      throw error;
    }
  },

  permanentDelete: async (id) => {
    try {
      const response = await api.delete(
        `/tasks/${id}/permanent`
      );

      return response.data;
    } catch (error) {
      console.error(
        `Error eliminando permanentemente ${id}:`,
        error
      );
      throw error;
    }
  },
};

export default taskService;