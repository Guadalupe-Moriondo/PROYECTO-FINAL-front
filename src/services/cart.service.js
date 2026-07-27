import api from './api';

export default {
  view() {
    return api.get('/cart');
  },
  addItem(productId, quantity) {
    return api.post('/cart/items', { productId, quantity });
  },
  updateQuantity(itemId, quantity) {
    return api.put(`/cart/items/${itemId}`, { quantity });
  },
  removeItem(itemId) {
    return api.delete(`/cart/items/${itemId}`);
  },
};
