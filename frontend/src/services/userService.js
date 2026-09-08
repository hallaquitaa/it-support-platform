import api from './api';

const userService = {
  getAll: async () => {
    // Por ahora devolvemos datos mock
    return [{ id: 1, full_name: 'Administrador', username: 'admin' }];
  }
};

export default userService;