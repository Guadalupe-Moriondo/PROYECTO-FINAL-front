<script setup>
import { ref } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const error = ref('');
const submitting = ref(false);

async function submit() {
  error.value = '';
  submitting.value = true;

  try {
    await authStore.login(email.value, password.value);
    await cartStore.loadCart();

    if (route.query.redirect) {
      router.push(route.query.redirect);
    } else if (authStore.isAdmin) {
      router.push({ name: 'admin-home' });
    } else {
      router.push({ name: 'home' });
    }

  } catch (e) {
    error.value = e.response?.data?.message || 'Credenciales inválidas';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="container auth-view">
    <div class="auth-card">
      <h1>Ingresar</h1>
      <form @submit.prevent="submit">
        <div class="field">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" required autocomplete="email" />
        </div>
        <div class="field">
          <label for="password">Contraseña</label>
          <div class="password-box">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="current-password"
            />

            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              👁
            </button>
          </div>
        </div>
        <p v-if="error" class="error-message">{{ error }}</p>
        <button type="submit" class="button button-primary button-full" :disabled="submitting">
          {{ submitting ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>
      <p class="auth-card-footer">
        ¿No tenés cuenta? <RouterLink to="/register">Registrate</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-view {
  display: flex;
  justify-content: center;
  padding: var(--space-6) var(--space-4);
}
.auth-card {
  width: 100%;
  max-width: 380px;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  padding: var(--space-5);
}
.button-full { width: 100%; margin-top: var(--space-2); }
.auth-card-footer {
  text-align: center;
  margin-top: var(--space-4);
  font-size: 0.9rem;
  color: var(--color-ink-soft);
}





.password-toggle {
  background: transparent;
  border: none;
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-ink-soft);
  font-size: 16px;
}

.password-toggle:hover {
  background: transparent;
  transform: scale(1.1);
}
</style>
