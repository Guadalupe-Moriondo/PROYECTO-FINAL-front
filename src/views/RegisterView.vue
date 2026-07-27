<script setup>
import { ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import usersService from '../services/users.service';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const name = ref('');
const email = ref('');
const password = ref('');
const phone = ref('');
const error = ref('');
const submitting = ref(false);

async function submit() {
  error.value = '';
  submitting.value = true;
  try {
    await usersService.register({
      name: name.value,
      email: email.value,
      password: password.value,
      phone: phone.value || undefined,
    });
    // After registering, we log them in right away so they don't
    // have to re-type the email and password
    await authStore.login(email.value, password.value);
    router.push({ name: 'catalog' });
  } catch (e) {
    error.value = e.response?.data?.message || 'No se pudo completar el registro';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="container auth-view">
    <div class="auth-card">
      <h1>Crear cuenta</h1>
      <form @submit.prevent="submit">
        <div class="field">
          <label for="name">Nombre</label>
          <input id="name" v-model="name" type="text" required />
        </div>
        <div class="field">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" required autocomplete="email" />
        </div>
        <div class="field">
          <label for="password">Contraseña</label>
          <input id="password" v-model="password" type="password" required minlength="6" autocomplete="new-password" />
        </div>
        <div class="field">
          <label for="phone">Teléfono (opcional)</label>
          <input id="phone" v-model="phone" type="tel" />
        </div>
        <p v-if="error" class="error-message">{{ error }}</p>
        <button type="submit" class="button button-primary button-full" :disabled="submitting">
          {{ submitting ? 'Creando cuenta...' : 'Crear cuenta' }}
        </button>
      </form>
      <p class="auth-card-footer">
        ¿Ya tenés cuenta? <RouterLink to="/login">Ingresá</RouterLink>
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
</style>
