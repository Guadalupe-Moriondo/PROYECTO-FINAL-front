<script setup>
import { ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import usersService from '../services/users.service';
import { useAuthStore } from '../stores/auth';
import Hero3 from '../assets/Hero 3.jpg'

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
  <div class="register-page">

    <!-- Panel izquierdo -->
    <div class="register-panel">

      <div class="auth-card">

        <h1>Crear cuenta</h1>

        <form @submit.prevent="submit">

          <div class="field">
            <label for="name">Nombre</label>

            <input
              id="name"
              v-model="name"
              type="text"
              required
            />
          </div>

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

            <input
              id="password"
              v-model="password"
              type="password"
              required
              minlength="6"
              autocomplete="new-password"
            />
          </div>

          <div class="field">
            <label for="phone">
              Teléfono (opcional)
            </label>

            <input
              id="phone"
              v-model="phone"
              type="tel"
            />
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
            {{ submitting
              ? 'Creando cuenta...'
              : 'Crear cuenta'
            }}
          </button>

        </form>

        <p class="auth-card-footer">
          ¿Ya tenés cuenta?
          <RouterLink to="/login">
            Ingresá
          </RouterLink>
        </p>

      </div>

    </div>


    <!-- Panel derecho -->
    <div class="register-image">

      <img
        :src="Hero3"
        alt="Maquinaria agrícola"
      />

    </div>

  </div>
</template>

<style scoped>

.register-page {
  width: 100%;
  min-height: 100vh;

  display: grid;
  grid-template-columns: 1fr 1fr;

  background: var(--color-bg);
}


/* ==============================
   PANEL DEL FORMULARIO
============================== */

.register-panel {
  min-height: 100vh;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: var(--space-5);
}

.auth-card {
  width: 100%;
  max-width: 420px;
}

.auth-card h1 {
  margin-bottom: 32px;
  font-size: 2.4rem;
}


/* ==============================
   CAMPOS
============================== */

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;

  margin-bottom: 18px;
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

.field input:focus {
  outline: 2px solid var(--color-rust);
  outline-offset: 1px;
}


/* ==============================
   BOTÓN
============================== */

.button-full {
  width: 100%;
  margin-top: 8px;
}


/* ==============================
   LINK LOGIN
============================== */

.auth-card-footer {
  text-align: center;

  margin-top: 24px;

  font-size: 0.9rem;

  color: var(--color-ink-soft);
}





/* ==============================
   ERROR
============================== */

.error-message {
  background: #ffe8e8;
  color: #c0392b;

  border: 1px solid #f3bcbc;

  padding: 0.9rem 1rem;

  border-radius: 12px;

  margin-bottom: 16px;
}


/* ==============================
   IMAGEN
============================== */

.register-image {
  width: 100%;
  height: 100vh;

  overflow: hidden;
}

.register-image img {
  width: 100%;
  height: 100%;

  display: block;

  object-fit: cover;
  object-position: center;
}


/* ==============================
   RESPONSIVE
============================== */

@media (max-width: 760px) {

  .register-page {
    grid-template-columns: 1fr;
  }

  .register-image {
    display: none;
  }

  .register-panel {
    min-height: 100vh;

    padding: var(--space-4);
  }

  .auth-card {
    max-width: 420px;
  }

}

</style>