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
  getProfile() {
    return api.get('/users/profile');
  },

  updateProfile(data) {
    return api.patch('/users/profile', data);
  },
  changePassword(data) {
  return api.patch('/users/change-password', data);
  }
};
