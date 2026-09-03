<script setup>
import { ref } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';
import localLogo from '../assets/local.jpg';

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
    error.value =
      e.response?.data?.message || 'Credenciales inválidas';
  } finally {
    submitting.value = false;
  }
}
</script>


<template>
  <div class="login-wrapper">

    <RouterLink
      :to="{ name: 'home' }"
      class="auth-logo"
      aria-label="Ir al inicio"
    >
      <span class="logo-mark">
        <svg xmlns="http://w3.org" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </span>
    </RouterLink>

    <div class="login-page">
      <div class="login-panel">

        <div class="auth-card">

          <h1>Ingresar</h1>

          <form @submit.prevent="submit">

            <div class="field field--auth">
              <label for="email">Email</label>

              <input
                id="email"
                v-model="email"
                type="email"
                required
                autocomplete="email"
              />
            </div>

            <div class="field field--auth">
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
                  :aria-label="
                    showPassword
                      ? 'Ocultar contraseña'
                      : 'Mostrar contraseña'
                  "
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      v-if="!showPassword"
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

            <p
              v-if="error"
              class="error-message"
            >
              {{ error }}
            </p>

            <button
              type="submit"
              class="button button-primary button-full"
              :disabled="submitting"
            >
              {{ submitting ? 'Ingresando...' : 'Ingresar' }}
            </button>
          </form>

          <p class="auth-card-footer">
            ¿No tenés cuenta?
            <RouterLink to="/register">
              Registrate
            </RouterLink>
          </p>

        </div>
      </div>

      <div class="login-image">

        <img
          :src="localLogo"
          alt="Maquinaria agrícola"
        />

      </div>

    </div>
  </div>
</template>


<style scoped>

.login-wrapper {
  position: relative;
  min-height: 100vh;
}

.login-page {
  width: 100%;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--color-bg);
}

.login-panel {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
}

.button-full {
  width: 100%;
  margin-top: 8px;
}

.login-image {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.login-image img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center;
}

@media (max-width: 900px) {

  .login-page {
    grid-template-columns: 1fr;
  }

  .login-image {
    display: none;
  }

  .login-panel {
    min-height: 100vh;
    padding: var(--space-4);
  }

  .auth-card {
    padding: 28px 22px;
  }

  .auth-logo {
    top: 18px;
    left: 20px;
  }

  .auth-logo .logo-mark {
    font-size: 1.5rem;
  }

 
}
</style>