import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import authService from '../services/auth.service';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(null);
  const user = ref(null);
  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const isOwner = computed(() => user.value?.owner === true);
 
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

    token.value = response.data.access_token;
    user.value = response.data.user;

    localStorage.setItem('token', token.value);
    localStorage.setItem('user', JSON.stringify(user.value));
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return { token, user, isLoggedIn, isAdmin, isOwner, restoreSession, login, logout };
});
