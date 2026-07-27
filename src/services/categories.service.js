import api from './api';

export default {
  list() {
    return api.get('/categories');
  },
  getById(id) {
    return api.get(`/categories/${id}`);
  },
  create(dto) {
    return api.post('/categories', dto);
  },
  update(id, dto) {
    return api.put(`/categories/${id}`, dto);
  },
  remove(id) {
    return api.delete(`/categories/${id}`);
  },
};
