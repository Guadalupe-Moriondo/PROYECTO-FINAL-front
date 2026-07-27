import api from './api';

export default {
  createFromCart(paymentMethod) {
    return api.post('/orders', { paymentMethod });
  },
  myOrders(page = 1, limit = 10) {
    return api.get('/orders/mine', { params: { page, limit } });
  },
  listAll(page = 1, limit = 10) {
    return api.get('/orders', { params: { page, limit } });
  },
  getById(id) {
    return api.get(`/orders/${id}`);
  },
  updateStatus(id, status) {
    return api.put(`/orders/${id}/status`, { status });
  },
  statistics() {
  return api.get('/orders/statistics');
  },
  getHistory(page = 1, limit = 10, month = '', year = '') {
    return api.get('/orders/history', {
      params: { page, limit, month: month || undefined, year: year || undefined },
    });
  },
};
