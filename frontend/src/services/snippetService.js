import api from './api';

const snippetService = {
  getAll: async () => (await api.get('/snippets')).data,
  getCategories: async () => (await api.get('/snippets/categories')).data,
  createCategory: async (data) => (await api.post('/snippets/categories', data)).data,
  updateCategory: async (id, data) => (await api.put(`/snippets/categories/${id}`, data)).data,
  deleteCategory: async (id) => (await api.delete(`/snippets/categories/${id}`)).data,
  create: async (data) => (await api.post('/snippets', data)).data,
  update: async (id, data) => (await api.put(`/snippets/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/snippets/${id}`)).data,
};
export default snippetService;
