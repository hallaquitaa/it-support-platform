import api from './api';

const exportService = {
  exportToExcel: async (includePasswords = false, masterPassword = null) => {
    try {
      const response = await api.post('/export/vault/excel', { masterPassword }, {
        params: { includePasswords },
        responseType: 'blob'
      });
      
      // Crear link de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = `credenciales_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert('✓ Exportación completada');
    } catch (error) {
      console.error('Error exportando:', error);
      alert('❌ Error al exportar: ' + (error.response?.data?.error || error.message));
    }
  }
};

export default exportService;