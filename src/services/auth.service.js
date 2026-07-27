import api from './api';

// Each service groups the calls related to ONE API resource.
// Components never call "api" directly: they always go through these
// services, so if a backend URL ever changes, it's fixed in one place.
export default {
  login(email, password) {
    return api.post('/auth/login', { email, password });
  },
};
