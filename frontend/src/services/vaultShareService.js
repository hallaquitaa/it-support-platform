import api from './api';

const vaultShareService = {
  getShares: async (credentialId = null) => {
    const params = credentialId ? { credential_id: credentialId } : {};
    const response = await api.get('/vault/shares', { params });
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/vault/shares', data);
    return response.data;
  },
  
  revoke: async (id) => {
    const response = await api.delete(`/vault/shares/${id}`);
    return response.data;
  }
};

export default vaultShareService;