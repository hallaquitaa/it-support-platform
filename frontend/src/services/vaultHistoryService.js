import api from './api';

const vaultHistoryService = {
  getHistory: async (credentialId) => {
    const response = await api.get(`/vault/history/${credentialId}`);
    return response.data;
  },
  
  restore: async (historyId) => {
    const response = await api.post(`/vault/history/${historyId}/restore`);
    return response.data;
  }
};

export default vaultHistoryService;