import axios from 'axios';

// Single axios instance for the whole app. Every service
// (products.service.js, orders.service.js, etc.) imports this same
// instance instead of creating its own, so we don't repeat the
// baseURL config or the interceptor in every file.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// REQUEST interceptor: runs automatically BEFORE any request goes
// out to the backend. This is where we add the
// "Authorization: Bearer <token>" header without having to remember
// to do it by hand on every call in the project.
//
// We read the token directly from localStorage (instead of importing
// the Pinia store here) because this file runs outside a component's
// lifecycle, and this is the simplest and most reliable way to access
// the value at any point in time.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE interceptor: if the backend responds 401 (expired or
// invalid token), we clear the saved session and send the user to
// login. This avoids the app being stuck showing protected screens
// with a token that no longer works.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
