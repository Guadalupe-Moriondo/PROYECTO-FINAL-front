<script setup>
import { ref } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';
import Hero1 from '../assets/Hero 1.jpg'

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
  <div class="login-page">

    <div class="login-panel">

      <div class="auth-card">

        <h1>Ingresar</h1>

        <form @submit.prevent="submit">

          <div class="field">
            <label for="email">Email</label>

            <input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
            />
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
              >
                Mostrar
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
        :src="Hero1"
        alt="Maquinaria agrícola"
      />
    </div>

  </div>
</template>

<style scoped>

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

.auth-card {
  width: 100%;
  max-width: 420px;
}

.auth-card h1 {
  margin-bottom: 32px;
  font-size: 2.4rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 20px;
}

.field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-ink-soft);
}

.field input {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--color-line);
  border-radius: 12px;
  background: var(--color-surface);
  color: var(--color-ink);
}

.password-box {
  display: flex;
  align-items: center;
  width: 100%;
  height: 44px;
  border: 1px solid var(--color-line);
  border-radius: 12px;
  padding: 0 8px 0 14px;
}

.password-box input {
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
}

.password-toggle {
  border: none;
  background: transparent;
  cursor: pointer;
}

.button-full {
  width: 100%;
  margin-top: 8px;
}

.auth-card-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 0.9rem;
  color: var(--color-ink-soft);
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

@media (max-width: 760px) {

  .login-page {
    grid-template-columns: 1fr;
  }

  .login-image {
    display: none;
  }

  .login-panel {
    min-height: 100vh;
  }

}

</style>