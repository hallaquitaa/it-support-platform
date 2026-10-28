import api from './api';

const maintenanceService = {
  getAll: async () => (await api.get('/maintenance')).data,
  getLogs: async () => (await api.get('/maintenance/logs')).data,
  create: async (data) => (await api.post('/maintenance', data)).data,
  update: async (id, data) => (await api.put(`/maintenance/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/maintenance/${id}`)).data,
  createLog: async (data) => (await api.post('/maintenance/logs', data)).data,
};
export default maintenanceService;
