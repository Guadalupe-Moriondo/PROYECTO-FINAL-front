import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import authService from '../services/auth.service';

// defineStore('auth', ...) registers this store under the name "auth".
// We use the Composition API (the same syntax as in your components,
// with ref/computed) instead of Pinia's older "options" format.
export const useAuthStore = defineStore('auth', () => {
  // ---- STATE ----
  const token = ref(null);
  const user = ref(null);

  // ---- GETTERS (computed) ----
  // Instead of repeating "user.value?.role === 'admin'" in every
  // component, we ask ONCE here and the rest of the app just reads
  // authStore.isAdmin.
  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  // ---- ACTIONS ----

  // Called ONCE when the app starts (see main.js), to "rehydrate" the
  // store by reading whatever was saved in localStorage from a
  // previous session. The store itself only lives in memory: if the
  // user reloads the page (F5), JS memory resets, which is why we
  // need localStorage as a persistent backup.
  function restoreSession() {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      token.value = savedToken;
      user.value = JSON.parse(savedUser);
    }
  }

  async function login(email, password) {
    const response = await authService.login(email, password);
    // The backend returns { access_token, user: {...} }
    token.value = response.data.access_token;
    user.value = response.data.user;

    // Save to localStorage so it survives an F5
    localStorage.setItem('token', token.value);
    localStorage.setItem('user', JSON.stringify(user.value));
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return { token, user, isLoggedIn, isAdmin, restoreSession, login, logout };
});
