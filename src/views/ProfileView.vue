<script setup>
import { ref, computed, onMounted } from 'vue';
import usersService from '../services/users.service';

const loading = ref(true);
const savingField = ref(false);

const profileMessage = ref('');
const passwordMessage = ref('');

const editingName = ref(false);
const nameValue = ref('');

const phoneValue = ref('');
const phoneDirty = ref(false);

const emailValue = ref('');
const emailDirty = ref(false);

const profile = ref({
  name: '',
  email: '',
  phone: '',
  role: '',
  createdAt: '',
});

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const showPassword = ref({
  currentPassword: false,
  newPassword: false,
  confirmPassword: false,
});

function toggleShowPassword(field) {
  showPassword.value[field] = !showPassword.value[field];
}

const initials = computed(() => {
  if (!profile.value.name) return '';
  return profile.value.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
});

async function loadProfile() {
  loading.value = true;

  try {
    const response = await usersService.getProfile();
    profile.value = response.data;
    phoneValue.value = profile.value.phone || '';
    emailValue.value = profile.value.email || '';
  } finally {
    loading.value = false;
  }
}

function startEditName() {
  editingName.value = true;
  nameValue.value = profile.value.name || '';
}

function cancelEditName() {
  editingName.value = false;
  nameValue.value = '';
}

function onPhoneInput() {
  phoneDirty.value = phoneValue.value !== profile.value.phone;
}

function onEmailInput() {
  emailDirty.value = emailValue.value !== profile.value.email;
}

async function saveField(field, value) {
  if (!value.trim()) return;

  savingField.value = true;

  try {
    await usersService.updateProfile({ [field]: value });

    profile.value[field] = value;
    profileMessage.value = 'Perfil actualizado correctamente';

    if (field === 'name') editingName.value = false;
    if (field === 'phone') phoneDirty.value = false;
    if (field === 'email') emailDirty.value = false;

    setTimeout(() => {
      profileMessage.value = '';
    }, 3000);
  } catch (error) {
    profileMessage.value = 'No se pudo actualizar el perfil';
  } finally {
    savingField.value = false;
  }
}

async function changePassword() {
  passwordMessage.value = '';

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordMessage.value = 'Las contraseñas no coinciden';
    return;
  }

  try {
    await usersService.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    });

    passwordMessage.value = 'Contraseña actualizada correctamente';

    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    setTimeout(() => {
      passwordMessage.value = '';
    }, 3000);
  } catch (error) {
    passwordMessage.value =
      error.response?.data?.message || 'No se pudo cambiar la contraseña';
  }
}

function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('es-AR');
}

onMounted(loadProfile);
</script>

<template>
  <div class="container profile-view">

    <!-- ================= HEADER ================= -->
    <div class="profile-page-header">

      <div>
        <h1>
          Mi perfil
        </h1>
      </div>

    </div>


    <p
      v-if="loading"
      class="loading-state"
    >
      Cargando perfil...
    </p>


    <div
      v-else
      class="profile-layout"
    >

      <!-- ================= INFORMACIÓN ================= -->
      <section class="profile-card">

        <div class="profile-card-header">

          <div class="avatar">
            {{ initials }}
          </div>

          <div class="profile-header-info">

            <template v-if="!editingName">

              <div class="name-row">

                <h2 class="profile-name">
                  {{ profile.name }}
                </h2>

                <button
                  type="button"
                  class="icon-button edit-button"
                  @click="startEditName"
                  title="Editar nombre"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                  </svg>

                </button>

              </div>

            </template>


            <template v-else>

              <div class="name-edit-row">

                <input
                  v-model="nameValue"
                  type="text"
                  placeholder="Tu nombre"
                />

                <button
                  type="button"
                  class="icon-button success"
                  @click="saveField('name', nameValue)"
                  title="Guardar"
                >

                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="m9.2 16.6-4-4L3.8 14l5.4 5.4L21 7.6 19.6 6.2 9.2 16.6Z"
                    />
                  </svg>

                </button>


                <button
                  type="button"
                  class="icon-button danger"
                  @click="cancelEditName"
                  title="Cancelar"
                >

                  <svg viewBox="0 0 24 24" fill="currentColor">
                      <path
                         d="m7.4 5.9-1.5 1.5 4.6 4.6-4.6 4.6 1.5 1.5 4.6-4.6 4.6 4.6 1.5-1.5-4.6-4.6 4.6-4.6-1.5-1.5-4.6 4.6-4.6-4.6Z"
                      />
                    </svg>

                </button>

              </div>

            </template>


            <div class="profile-meta">

              <span class="role-badge">
                {{ profile.role }}
              </span>

              <span>
                Miembro desde {{ formatDate(profile.createdAt) }}
              </span>

            </div>

          </div>

        </div>


        <div class="profile-divider"></div>


        <!-- ================= EMAIL ================= -->
        <div class="profile-field">

          <label>
            Email
          </label>

          <div class="field-box editable">

            <div class="field-icon">

              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M2 5.5A1.5 1.5 0 0 1 3.5 4h17A1.5 1.5 0 0 1 22 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 18.5v-13Zm2.2.5 7.4 5.7a.6.6 0 0 0 .8 0L19.8 6H4.2ZM4 7.8V18h16V7.8l-7.4 5.7a2.1 2.1 0 0 1-2.6 0L4 7.8Z"
                />
              </svg>

            </div>


            <input
              v-model="emailValue"
              type="email"
              @input="onEmailInput"
            />


            <button
              type="button"
              :disabled="!emailDirty || savingField"
              @click="saveField('email', emailValue)"
            >
              Guardar
            </button>

          </div>

        </div>


        <!-- ================= TELÉFONO ================= -->
        <div class="profile-field">

          <label>
            Teléfono
          </label>

          <div class="field-box editable">

            <div class="field-icon">

              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M6.6 2.5h2.2c.5 0 .9.3 1 .8l1 3.7c.1.4 0 .8-.3 1.1L9 9.6a15 15 0 0 0 5.4 5.4l1.5-1.5c.3-.3.7-.4 1.1-.3l3.7 1c.5.1.8.5.8 1v2.2c0 .6-.4 1.1-1 1.1C11.9 18.5 5.5 12.1 5.5 4c0-.6.5-1 1.1-1Z"
                />
              </svg>

            </div>


            <input
              v-model="phoneValue"
              type="text"
              placeholder="Ingresá tu teléfono"
              @input="onPhoneInput"
            />


            <button
              type="button"
              :disabled="!phoneDirty || savingField"
              @click="saveField('phone', phoneValue)"
            >
              Guardar
            </button>

          </div>

        </div>


        <p
          v-if="profileMessage"
          class="success-message"
        >

          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19Zm4.2 7.2-5.1 5.1-3-3 1.4-1.4 1.6 1.6 3.7-3.7 1.4 1.4Z"
            />
          </svg>

          {{ profileMessage }}

        </p>

      </section>


      <!-- ================= SEGURIDAD ================= -->
      <section class="profile-card security-card">

        <div class="security-header">

          <div class="security-icon">

            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M12 2.5 20 5v6.2c0 5.1-3.2 8.7-8 10.3-4.8-1.6-8-5.2-8-10.3V5l8-2.5Zm0 2.1L6 6.5v4.7c0 3.9 2.3 6.7 6 8.1 3.7-1.4 6-4.2 6-8.1V6.5l-6-1.9Zm-1.1 10.2-2.5-2.5 1.4-1.4 1.1 1.1 3.3-3.3 1.4 1.4-4.7 4.7Z"
              />
            </svg>

          </div>

          <div>
            <h2>
              Seguridad
            </h2>

            <p>
              Actualizá tu contraseña para mantener tu cuenta segura.
            </p>

          </div>

        </div>


        <!-- Contraseña actual -->
        <div class="form-group">

          <label>
            Contraseña actual
          </label>

          <div class="password-box">

            <input
              v-model="passwordForm.currentPassword"
              :type="
                showPassword.currentPassword
                  ? 'text'
                  : 'password'
              "
              placeholder="Ingresá tu contraseña actual"
            />


            <button
              type="button"
              class="password-toggle"
              @click="
                toggleShowPassword(
                  'currentPassword'
                )
              "
              :aria-label="
                showPassword.currentPassword
                  ? 'Ocultar contraseña'
                  : 'Mostrar contraseña'
              "
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


        <!-- Nueva -->
        <div class="form-group">

          <label>
            Nueva contraseña
          </label>

          <div class="password-box">

            <input
              v-model="passwordForm.newPassword"
              :type="
                showPassword.newPassword
                  ? 'text'
                  : 'password'
              "
              placeholder="Mínimo 6 caracteres"
            />

            <button
              type="button"
              class="password-toggle"
              @click="
                toggleShowPassword(
                  'newPassword'
                )
              "
              :aria-label="
                showPassword.newPassword
                  ? 'Ocultar contraseña'
                  : 'Mostrar contraseña'
              "
            >

              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M12 5c5.2 0 8.5 5 9.5 7-1.5 2-4.3 7-9.5 7s-8-5-9.5-7C4 10 6.8 5 12 5Zm0 2C8.8 7 6.6 9.8 4.8 12 6.6 14.2 8.8 17 12 17s5.4-2.8 7.2-5C17.4 9.8 15.2 7 12 7Zm0 2.3A2.7 2.7 0 1 1 12 14.7a2.7 2.7 0 0 1 0-5.4Z"
                />
              </svg>

            </button>

          </div>

        </div>


        <!-- Confirmar -->
        <div class="form-group">

          <label>
            Confirmar contraseña
          </label>

          <div class="password-box">

            <input
              v-model="passwordForm.confirmPassword"
              :type="
                showPassword.confirmPassword
                  ? 'text'
                  : 'password'
              "
              placeholder="Repetí la nueva contraseña"
            />

            <button
              type="button"
              class="password-toggle"
              @click="
                toggleShowPassword(
                  'confirmPassword'
                )
              "
              :aria-label="
                showPassword.confirmPassword
                  ? 'Ocultar contraseña'
                  : 'Mostrar contraseña'
              "
            >

              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M12 5c5.2 0 8.5 5 9.5 7-1.5 2-4.3 7-9.5 7s-8-5-9.5-7C4 10 6.8 5 12 5Zm0 2C8.8 7 6.6 9.8 4.8 12 6.6 14.2 8.8 17 12 17s5.4-2.8 7.2-5C17.4 9.8 15.2 7 12 7Zm0 2.3A2.7 2.7 0 1 1 12 14.7a2.7 2.7 0 0 1 0-5.4Z"
                />
              </svg>

            </button>

          </div>

        </div>


        <button
          type="button"
          class="change-password-button"
          @click="changePassword"
        >

          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M7 10V8a5 5 0 1 1 10 0v2h1a2 2 0 0 1 2 2v7H4v-7a2 2 0 0 1 2-2h1Zm2 0h6V8a3 3 0 0 0-6 0v2Zm-3 2v5h12v-5H6Z"
            />
          </svg>

          Cambiar contraseña

        </button>


        <p
          v-if="passwordMessage"
          class="success-message"
        >

          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19Zm4.2 7.2-5.1 5.1-3-3 1.4-1.4 1.6 1.6 3.7-3.7 1.4 1.4Z"
            />
          </svg>

          {{ passwordMessage }}

        </p>

      </section>

    </div>

  </div>
</template>

<style scoped>

/* =========================================================
   GENERAL
========================================================= */

.profile-view {
  padding: 55px 0 80px;

  min-height: 100vh;
}


/* =========================================================
   HEADER
========================================================= */

.profile-page-header {
  margin-bottom: 32px;
}

.profile-eyebrow {
  margin: 0 0 7px;

  color: var(--color-rust);

  font-family: var(--font-mono);

  font-size: 0.72rem;
  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: 0.14em;
}

.profile-page-header h1 {
  margin: 0;

  color: var(--color-ink);

  font-size: clamp(2.1rem, 4vw, 2.8rem);

  line-height: 1.05;
}

.profile-description {
  max-width: 650px;

  margin: 10px 0 0;

  color: var(--color-ink-soft);

  font-size: 0.95rem;

  line-height: 1.6;
}


/* =========================================================
   LAYOUT
========================================================= */

.profile-layout {
  display: grid;

  grid-template-columns:
    minmax(0, 1.15fr)
    minmax(360px, 0.85fr);

  gap: 25px;

  align-items: start;
}


/* =========================================================
   CARDS
========================================================= */

.profile-card {
  background: var(--color-surface);

  border: 1px solid var(--color-line);

  border-radius: 20px;

  padding: 28px;

  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.04);
}


/* =========================================================
   PERFIL
========================================================= */

.profile-card-header {
  display: flex;

  align-items: center;

  gap: 17px;

  margin-bottom: 25px;
}

.avatar {
  width: 64px;
  height: 64px;

  flex: 0 0 64px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background:
    rgba(183, 53, 45, 0.10);

  color: var(--color-rust);

  font-size: 1.2rem;

  font-weight: 800;
}

.profile-header-info {
  min-width: 0;
}

.name-row {
  display: flex;

  align-items: center;

  gap: 9px;
}

.profile-name {
  margin: 0;

  color: var(--color-ink);

  font-size: 1.3rem;

  line-height: 1.15;
}

.icon-button  {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background:
    rgba(207, 81, 74, 0.08);
  color: var(--color-rust);
  transition:
    background .2s ease,
    color .2s ease;
}

.edit-button {
  background: #fcdada;
  color: #d33f3f;
}

.edit-button:hover {
  background: #ffc3c3;
}
.profile-meta {
  display: flex;

  align-items: center;

  flex-wrap: wrap;

  gap: 8px;

  margin-top: 7px;

  color: var(--color-ink-soft);

  font-size: 0.76rem;
}

.role-badge {
  padding: 4px 9px;

  border-radius: 999px;

  background:
    rgba(183, 53, 45, 0.08);

  color: var(--color-rust);

  font-weight: 700;

  text-transform: capitalize;
}

.profile-divider {
  height: 1px;

  margin-bottom: 24px;

  background: var(--color-line);
}


/* =========================================================
   EDICIÓN NOMBRE
========================================================= */

.name-edit-row {
  display: flex;

  align-items: center;

  gap: 7px;
}

.name-edit-row input {
  min-width: 0;

  width: 220px;

  height: 38px;

  padding: 0 11px;

  border: 1px solid var(--color-line);

  border-radius: 9px;

  background: #fff;

  color: var(--color-ink);

  outline: none;
}

.name-edit-row input:focus {
  border-color: var(--color-rust);

  box-shadow:
    0 0 0 3px rgba(183, 53, 45, 0.08);
}




/* =========================================================
   CAMPOS
========================================================= */

.profile-field {
  margin-bottom: 20px;
}

.profile-field label {
  display: block;

  margin-bottom: 8px;

  color: var(--color-ink);

  font-size: 0.82rem;

  font-weight: 700;
}

.field-box {
  min-height: 46px;

  display: flex;

  align-items: center;

  gap: 10px;

  padding: 0 12px;

  border: 1px solid var(--color-line);

  border-radius: 11px;

  background: #fff;

  transition:
    border-color .2s ease,
    box-shadow .2s ease;
}

.field-box:focus-within {
  border-color: var(--color-rust);

  box-shadow:
    0 0 0 3px rgba(183, 53, 45, 0.08);
}

.field-icon {
  width: 32px;
  height: 32px;

  flex: 0 0 32px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background:
    rgba(183, 53, 45, 0.08);

  color: var(--color-rust);
}

.field-icon svg {
  width: 16px;
  height: 16px;
}

.field-box input {
  flex: 1;

  min-width: 0;

  border: none;

  outline: none;

  background: transparent;

  color: var(--color-ink);

  font-size: 0.88rem;
}

.field-box button {
  padding: 7px 11px;

  border: 1px solid var(--color-rust);

  border-radius: 8px;

  background: transparent;

  color: var(--color-rust);

  font-size: 0.75rem;

  font-weight: 700;

  cursor: pointer;

  transition:
    background .2s ease,
    color .2s ease;
}

.field-box button:hover:not(:disabled) {
  background: var(--color-rust);

  color: #fff;
}

.field-box button:disabled {
  opacity: 0.35;

  cursor: not-allowed;
}


/* =========================================================
   SEGURIDAD
========================================================= */

.security-card {
  position: sticky;

  top: 25px;
}

.security-header {
  display: flex;

  align-items: flex-start;

  gap: 14px;

  margin-bottom: 28px;
}

.security-icon {
  width: 44px;
  height: 44px;

  flex: 0 0 44px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 12px;

  background:
    rgba(183, 53, 45, 0.08);

  color: var(--color-rust);
}

.security-icon svg {
  width: 21px;
  height: 21px;
}

.security-header h2 {
  margin: 0;

  color: var(--color-ink);

  font-size: 1.35rem;
}

.security-header p:last-child {
  margin: 5px 0 0;

  color: var(--color-ink-soft);

  font-size: 0.8rem;

  line-height: 1.5;
}


/* =========================================================
   PASSWORD
========================================================= */

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;

  margin-bottom: 8px;

  color: var(--color-ink);

  font-size: 0.82rem;

  font-weight: 700;
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

  transition:
    border-color .2s ease,
    box-shadow .2s ease;
}

.password-box:focus-within {
  border-color: var(--color-rust);

  box-shadow:
    0 0 0 3px rgba(183, 53, 45, 0.08);
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

  color: var(--color-ink-soft);

  cursor: pointer;
}

.password-toggle svg {
  width: 18px;
  height: 18px;
}

.password-toggle:hover {
  color: var(--color-rust);

  background: transparent;
}


/* =========================================================
   BOTÓN CONTRASEÑA
========================================================= */

.change-password-button {
  width: 100%;

  min-height: 46px;

  display: inline-flex;

  align-items: center;
  justify-content: center;

  gap: 9px;

  margin-top: 5px;

  border: none;

  border-radius: 10px;

  background: var(--color-rust);

  color: #fff;

  font-size: 0.88rem;

  font-weight: 700;

  cursor: pointer;

  transition:
    background .2s ease,
    transform .2s ease;
}

.change-password-button svg {
  width: 17px;
  height: 17px;
}

.change-password-button:hover {
  background: var(--color-rust-dark);

  transform: translateY(-1px);
}


/* =========================================================
   MENSAJES
========================================================= */

.success-message {
  display: flex;

  align-items: center;

  gap: 8px;

  margin: 8px 0 0;

  color: #2d9754;

  font-size: 0.8rem;

  font-weight: 600;
}

.success-message svg {
  width: 16px;
  height: 16px;

  flex: 0 0 16px;
}

.loading-state {
  padding: 60px 0;

  text-align: center;

  color: var(--color-ink-soft);

  font-family: var(--font-mono);

  font-size: 0.85rem;
}


/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 900px) {

  .profile-layout {
    grid-template-columns: 1fr;
  }

  .security-card {
    position: static;
  }

}


@media (max-width: 600px) {

  .profile-view {
    padding: 40px 14px 60px;
  }

  .profile-card {
    padding: 22px;
  }

  .profile-card-header {
    align-items: flex-start;
  }

  .avatar {
    width: 56px;
    height: 56px;

    flex-basis: 56px;
  }

  .profile-name {
    font-size: 1.15rem;
  }

  .name-edit-row input {
    width: 100%;
  }

  .name-edit-row {
    flex-wrap: wrap;
  }

}
</style>