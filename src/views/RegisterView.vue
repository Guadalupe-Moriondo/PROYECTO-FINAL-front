<script setup>
import { ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import usersService from '../services/users.service';
import { useAuthStore } from '../stores/auth';
import localLogo from '../assets/local.jpg';

const router = useRouter();
const authStore = useAuthStore();

const name = ref('');
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const phoneArea = ref('');
const phoneNumber = ref('');
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
      phone: `${phoneArea.value}${phoneNumber.value}`,
    });

    await authStore.login(email.value, password.value);

    router.push({ name: 'catalog' });
  } catch (e) {
    error.value =
      e.response?.data?.message ||
      'No se pudo completar el registro';
  } finally {
    submitting.value = false;
  }
}
</script>


<template>
  <div class="register-wrapper">

    <!-- Logo -->
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


    <!-- Registro -->
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
              <div class="password-box">
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  autocomplete="new-password"
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


            <div class="field">
              <label for="phone">
                Teléfono
              </label>

              <div class="phone-fields">
                <input
                  id="phoneArea"
                  v-model="phoneArea"
                  type="tel"
                  placeholder="Código"
                  maxlength="4"
                  required
                />
                <input
                  id="phoneNumber"
                  v-model="phoneNumber"
                  type="tel"
                  placeholder="Número"
                  maxlength="6"
                  required
                />
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


      <!-- Imagen derecha -->
      <div class="register-image">

        <img
          :src="localLogo"
          alt="Maquinaria agrícola"
        />

      </div>

    </div>

  </div>
</template>


<style scoped>

.register-wrapper {
  position: relative;
  min-height: 100vh;
}


/* ==============================
   LOGO
============================== */

.auth-logo {
  position: absolute;

  top: 24px;
  left: 32px;

  z-index: 10;

  display: flex;
  align-items: center;
  gap: var(--space-2);

  text-decoration: none;

  line-height: 1;
}

.auth-logo .logo-mark {
  font-size: 2rem;
  font-weight:900;
  color: var(--color-rust);
  letter-spacing: 0.02em;
}




/* ==============================
   REGISTER
============================== */

.register-page {
  width: 100%;
  min-height: 100vh;

  display: grid;
  grid-template-columns: 1fr 1fr;

  background: var(--color-bg);
}


/* ==============================
   PANEL IZQUIERDO
============================== */

.register-panel {
  min-height: 100vh;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: var(--space-6);
}


/* ==============================
   TARJETA
============================== */

.auth-card {
  width: 100%;
  max-width: 420px;

  background: #ffffff;
  
  border: 1px solid #e2e2e2;
  border-radius: 20px;

  padding: 40px;

  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.08);
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

.password-box {
  height: 46px;

  display: flex;
  align-items: center;

  gap: 8px;

  padding: 0 11px;

  border: 1px solid var(--color-line);
  border-radius: 11px;

  background: #fff;
}

.password-box input {
  flex: 1;

  min-width: 0;

  height: 100%;

  padding: 0;

  border: none;
  outline: none;

  background: transparent;

  color: var(--color-ink);
}

.password-box input:focus {
  outline: none;
  box-shadow: none;
}

.password-box input::placeholder {
  color: #8a8a8a;
}

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


.phone-fields {
  display: flex;
  gap: 8px;
}

.phone-fields input:first-child {
  flex: 0 0 35%;
}

.phone-fields input:last-child {
  flex: 1;
}

/* ==============================
   BOTÓN
============================== */

.button-full {
  width: 100%;

  margin-top: 8px;
}


/* ==============================
   FOOTER DE LA TARJETA
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

@media (max-width: 900px) {

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