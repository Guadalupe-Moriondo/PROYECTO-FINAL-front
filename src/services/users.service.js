import api from './api';

export default {
  register(data) {
    // data: { name, email, password, phone? }
    return api.post('/users', data);
  },
  getById(id) {
    return api.get(`/users/${id}`);
  },
  updateRole(id, role) {
    // role: 'admin' | 'customer'
    return api.put(`/users/${id}/role`, { role });
  },
};
