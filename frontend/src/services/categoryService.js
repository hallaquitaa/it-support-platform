import api from './api';

const categoryService = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  
  getByType: async (type) => {
    const response = await api.get(`/categories?type=${type}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/categories', data);
    return response.data;
  }
};

export default categoryService;