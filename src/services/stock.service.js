import api from './api';

export default {
  registerMovement(dto) {
    return api.post('/stock/movements', dto);
  },

  historyByProduct(productId) {
    return api.get(`/stock/movements/${productId}`);
  },

  history(page, limit) {
    return api.get('/stock/movements', {
      params: { page, limit }
    });
  },
  
  alerts(page = 1, limit = 10) {
    return api.get('/stock/alerts', { params: { page, limit } });
  },
};
