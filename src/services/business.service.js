import api from './api';

export default {
  get() {
    return api.get('/business');
  },
  update(dto) {
    return api.put('/business', dto);
  },
};
