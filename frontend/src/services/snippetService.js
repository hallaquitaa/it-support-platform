import api from './api';

const snippetService = {
  getAll: async () => (await api.get('/snippets')).data,
  getCategories: async () => (await api.get('/snippets/categories')).data,
  create: async (data) => (await api.post('/snippets', data)).data,
  update: async (id, data) => (await api.put(`/snippets/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/snippets/${id}`)).data,
};
export default snippetService;
