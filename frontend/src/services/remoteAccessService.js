import api from './api';

const remoteAccessService = {
  getAll: async (params = {}) => (await api.get('/remote-access', { params })).data,
  getById: async (id) => (await api.get(`/remote-access/${id}`)).data,
  create: async (data) => (await api.post('/remote-access', data)).data,
  update: async (id, data) => (await api.put(`/remote-access/${id}`, data)).data,
  remove: async (id) => (await api.delete(`/remote-access/${id}`)).data,
  toggleFavorite: async (id) => (await api.post(`/remote-access/${id}/favorite`)).data,
  getHistory: async (id) => (await api.get(`/remote-access/${id}/history`)).data,
  recordLaunchRequest: async (id) => (await api.post(`/remote-access/${id}/launch`)).data,
};

export default remoteAccessService;
