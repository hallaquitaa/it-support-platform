import api from './api';

const adminService = {
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  createUser: async (data) => {
    const response = await api.post('/admin/users', data);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await api.patch(`/admin/users/${id}`, data);
    return response.data;
  },

  resetPassword: async (id, password) => {
    const response = await api.patch(`/admin/users/${id}/password`, { password });
    return response.data;
  },

  getActivity: async (limit = 20) => {
    const response = await api.get('/admin/activity', { params: { limit } });
    return response.data;
  },
};

export default adminService;
