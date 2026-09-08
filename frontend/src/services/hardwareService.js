import api from './api';

const hardwareService = {
  getAll: async (params = {}) => {
    const response = await api.get('/hardware', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/hardware/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/hardware/stats');
    return response.data;
  },

  getTypes: async () => {
    const response = await api.get('/hardware/types');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/hardware', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/hardware/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/hardware/${id}`);
    return response.data;
  }
};

export default hardwareService;