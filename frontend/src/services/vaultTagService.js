import api from './api';

const vaultTagService = {
  getAll: async () => {
    const response = await api.get('/vault/tags');
    return response.data;
  },
  
  create: async (name, color) => {
    const response = await api.post('/vault/tags', { name, color });
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/vault/tags/${id}`);
    return response.data;
  }
};

export default vaultTagService;