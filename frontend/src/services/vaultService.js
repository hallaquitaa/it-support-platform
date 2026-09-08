import api from './api';

const vaultService = {
  getAll: async (params = {}) => {
    const response = await api.get('/vault', { params });
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/vault/stats');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/vault/${id}`);
    return response.data;
  },
  
  create: async (data, masterPassword) => {
    const response = await api.post('/vault', { ...data, masterPassword });
    return response.data;
  },
  
  reveal: async (id, masterPassword) => {
    const response = await api.post(`/vault/reveal/${id}`, { masterPassword });
    return response.data;
  },
  
  revealMultiple: async (ids, masterPassword) => {
    const response = await api.post('/vault/reveal-multiple', { ids, masterPassword });
    return response.data;
  },
  
  update: async (id, data, masterPassword) => {
    const response = await api.put(`/vault/${id}`, { ...data, masterPassword });
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/vault/${id}`);
    return response.data;
  },
  
  toggleFavorite: async (id) => {
    const response = await api.post(`/vault/${id}/favorite`);
    return response.data;
  },
  
  getFavorites: async () => {
    const response = await api.get('/vault/favorites');
    return response.data;
  },
  
  getMostUsed: async (limit = 5) => {
    const response = await api.get('/vault/most-used', { params: { limit } });
    return response.data;
  },
  
  incrementUsage: async (id) => {
    const response = await api.post(`/vault/${id}/usage`);
    return response.data;
  }
};

export default vaultService;