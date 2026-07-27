import api from './api';

export default {
  registerMovement(dto) {
    // dto: { productId, type: 'entry' | 'exit', quantity, reason? }
    return api.post('/stock/movements', dto);
  },
  historyByProduct(productId) {
    return api.get(`/stock/movements/${productId}`);
  },
  alerts() {
    return api.get('/stock/alerts');
  },
};
