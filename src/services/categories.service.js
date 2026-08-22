import api from './api';

export default {
  list(page = 1, limit = 100) {
    return api.get('/categories', {
      params: { page, limit }
    });
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
