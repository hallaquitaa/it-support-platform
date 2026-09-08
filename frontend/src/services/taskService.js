import api from './api';

const taskService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/tasks', { params });
      return response.data;
    } catch (error) {
      console.error('Error en getAll:', error);
      return [];
    }
  },
  
  getById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },
  
  getStats: async () => {
    try {
      const response = await api.get('/tasks/stats');
      return response.data;
    } catch (error) {
      return { total: 0, pending: 0, in_progress: 0, resolved: 0, critical_active: 0, overdue: 0 };
    }
  },
  
  create: async (data) => {
    const response = await api.post('/tasks', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  }
};

export default taskService;