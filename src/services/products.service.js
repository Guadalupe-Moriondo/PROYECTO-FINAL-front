import api from './api';

export default {
  list(page = 1, limit = 12) {
    return api.get('/products', { params: { page, limit } });
  },
  search(filters) {
    // filters: { name, brand, categoryId, minPrice, maxPrice, available, page, limit }
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
    // multipart/form-data: that's why we use FormData instead of JSON
    const formData = new FormData();
    formData.append('image', file);
    return api.post(`/products/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  lowStock() {
    return api.get('/products/admin/low-stock');
  },
};
