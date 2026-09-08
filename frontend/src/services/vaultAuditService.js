import api from './api';

const vaultAuditService = {
  getLogs: async (credentialId = null) => {
    const params = credentialId ? { credential_id: credentialId } : {};
    const response = await api.get('/vault/audit/logs', { params });
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/vault/audit/stats');
    return response.data;
  }
};

export default vaultAuditService;