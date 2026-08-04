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

     if (authStore.isAdmin) {
      router.push({ name: 'admin-home' });
    } else if (route.query.redirect) {
      router.push(route.query.redirect);
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
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
              >

                <path
                  v-if="!showPassword.currentPassword"
                  d="M12 5c5.2 0 8.5 5 9.5 7-1.5 2-4.3 7-9.5 7s-8-5-9.5-7C4 10 6.8 5 12 5Zm0 2C8.8 7 6.6 9.8 4.8 12 6.6 14.2 8.8 17 12 17s5.4-2.8 7.2-5C17.4 9.8 15.2 7 12 7Zm0 2.3A2.7 2.7 0 1 1 12 14.7a2.7 2.7 0 0 1 0-5.4Z"
                />

                <path
                  v-else
                  d="m4.2 3.8-1.4 1.4 3 3C4.2 9.5 2.9 11 2.5 12c1.5 2 4.7 6.5 9.5 6.5 1.6 0 3-.4 4.2-1l2 2 1.4-1.4L4.2 3.8ZM12 16.5c-3.1 0-5.4-2.5-7.2-4.5.6-.7 1.3-1.5 2.1-2.2l1.5 1.5a3.8 3.8 0 0 0 5.3 5.3l1 1c-.8.3-1.7.5-2.7.5Zm.2-7.9a3.8 3.8 0 0 1 3.2 3.2l-1.6-1.6a1.9 1.9 0 0 0-1.6-1.6V8.6Z"
                />

              </svg>
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

.password-box {
  display: flex;
  align-items: center;
  width: 100%;
  height: 42px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  padding: 0 8px 0 12px;
  box-sizing: border-box;
}

/* Input dentro del campo */
.password-box input {
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--color-ink);
  box-sizing: border-box;
}

/* Evita que el input vuelva a mostrar un borde al hacer click */
.password-box input:focus {
  border: none;
  outline: none;
  box-shadow: none;
}

/* Botón del ojo */
.password-toggle {
  width: 30px;
  height: 30px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex: 0 0 30px;

  padding: 0;

  border: none;

  background: transparent;

  color: rgb(133, 133, 133);

  cursor: pointer;
}

.password-toggle svg {
  width: 18px;
  height: 18px;
}

.password-toggle:hover {
  color: rgb(77, 76, 76);

  background: transparent;
}
</style>
