import api from './api';

export default {
  list(page = 1, limit = 12) {
    return api.get('/products', { params: { page, limit } });
  },

  search(filters) {
    return api.get('/products/search', { params: filters });
  },

  getById(id) {
    return api.get(`/products/${id}`);
  },

  create(dto) {
    return api.post('/products', dto);
  },

  update(id, dto) {
    return api.put(`/products/${id}`, dto);
  },

  remove(id) {
    return api.delete(`/products/${id}`);
  },
  
  uploadImage(id, file) {
    const formData = new FormData();
    formData.append('image', file);
    return api.post(`/products/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

