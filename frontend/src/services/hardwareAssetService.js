import api from './api';

const hardwareAssetService = {
  getOverview: async () => (await api.get('/hardware-assets/overview')).data,
  getDetails: async (hardwareId) => (await api.get(`/hardware-assets/${hardwareId}`)).data,
  saveDetails: async (hardwareId, data) => (await api.put(`/hardware-assets/${hardwareId}/details`, data)).data,
  addEvent: async (hardwareId, data) => (await api.post(`/hardware-assets/${hardwareId}/events`, data)).data,
  addComponent: async (hardwareId, data) => (await api.post(`/hardware-assets/${hardwareId}/components`, data)).data,
  updateComponent: async (hardwareId, componentId, data) => (await api.patch(`/hardware-assets/${hardwareId}/components/${componentId}`, data)).data,
  addLoan: async (hardwareId, data) => (await api.post(`/hardware-assets/${hardwareId}/loans`, data)).data,
  returnLoan: async (hardwareId, loanId) => (await api.post(`/hardware-assets/${hardwareId}/loans/${loanId}/return`)).data,
  addTransfer: async (hardwareId, data) => (await api.post(`/hardware-assets/${hardwareId}/transfers`, data)).data,
  addAudit: async (hardwareId, data) => (await api.post(`/hardware-assets/${hardwareId}/audits`, data)).data,
  getDuplicates: async () => (await api.get('/hardware-assets/duplicates')).data,
};

export default hardwareAssetService;
