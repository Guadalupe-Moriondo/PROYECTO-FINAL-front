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
    <h1>Mi perfil</h1>

    <p v-if="loading" class="loading-state">Cargando perfil...</p>

    <div v-else class="profile-layout">
      <section class="profile-card">
        <div class="profile-header">
          <div class="avatar">{{ initials }}</div>

          <div class="profile-header-info">
            <template v-if="!editingName">
              <div class="name-row">
                <p class="profile-name">{{ profile.name }}</p>
                <button
                    type="button"
                    class="icon-button-edit"
                    @click="startEditName"
                    aria-label="Editar nombre"
                    >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                </button>
              </div>
            </template>

            <template v-else>
              <div class="name-edit-row">
                <input v-model="nameValue" type="text" />
                <button
                  type="button"
                  class="icon-button success"
                  @click="saveField('name', nameValue)"
                  aria-label="Guardar nombre"
                >
                  ✓
                </button>
                <button 
                type="button" 
                class="icon-button danger" 
                @click="cancelEditName"
                aria-label="Cancelar edición"
                >
                  ✕
                </button>
              </div>
            </template>
          </div>
        </div>

        <div class="profile-field">
          <label>Email</label>
          <div class="field-box editable">
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

        <div class="profile-field">
          <label>Teléfono</label>
          <div class="field-box editable">
            <input
              v-model="phoneValue"
              type="text"
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

        <p v-if="profileMessage" class="success-message">
          {{ profileMessage }}
        </p>
      </section>

      <section class="profile-card">
        <div class="security-title">
          <h2>Seguridad</h2>
        </div>

        <div class="form-group">
          <label>Contraseña actual</label>
          <div class="password-box">
            <input
              v-model="passwordForm.currentPassword"
              :type="showPassword.currentPassword ? 'text' : 'password'"
              placeholder="Ingresa tu contraseña actual"
            />
            <button
              type="button"
              class="password-toggle"
              @click="toggleShowPassword('currentPassword')"
              :aria-label="showPassword.currentPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              {{ showPassword.currentPassword ? '👁' : '👁' }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>Nueva contraseña</label>
          <div class="password-box">
            <input
              v-model="passwordForm.newPassword"
              :type="showPassword.newPassword ? 'text' : 'password'"
              placeholder="Mínimo 6 caracteres"
            />
            <button
              type="button"
               class="password-toggle"
              @click="toggleShowPassword('newPassword')"
              :aria-label="showPassword.newPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              {{ showPassword.newPassword ? '👁' : '👁' }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>Confirmar contraseña</label>
          <div class="password-box">
            <input
              v-model="passwordForm.confirmPassword"
              :type="showPassword.confirmPassword ? 'text' : 'password'"
              placeholder="Repite la nueva contraseña"
            />
            <button
              type="button"
               class="password-toggle"
              @click="toggleShowPassword('confirmPassword')"
              :aria-label="showPassword.confirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              {{ showPassword.confirmPassword ? '👁' : '👁' }}
            </button>
          </div>
        </div>

        <button type="button" @click="changePassword">
          Cambiar contraseña
        </button>

        <p v-if="passwordMessage" class="success-message">
          {{ passwordMessage }}
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.profile-view {
  padding: var(--space-5) var(--space-4);
}

.profile-layout {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 520px;
}

.profile-card {
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: 16px;
  padding: 24px;
}

.profile-card h2 {
  margin: 0 0 20px;
  font-size: 18px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #073b82;
  color: #5fa8ff;
  font-size: 18px;
  font-weight: 700;
}

.profile-header-info {
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-name {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
}

.icon-button-edit {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--color-line);
  background: var(--color-bg);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all .2s ease;
}

.icon-button:hover {
  transform: scale(1.05);
  background: var(--color-primary);
  color: rgb(0, 0, 0);
}
.icon-button.success {
  color: #16a34a;
}

.icon-button.danger {
  color: var(--color-danger);
}

.icon-button:hover {
  transform: scale(1.05);
}

.name-edit-row {
  display: flex;
  gap: 8px;
}

.name-edit-row input {
  height: 36px;
  border: 1px solid var(--color-line);
  border-radius: 8px;
  padding: 0 10px;
  background: transparent;
  color: var(--color-ink);
}

.profile-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 6px;
  font-size: 13px;
  color: var(--color-ink-soft);
}

.role {
  background: #333;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.profile-field {
  margin-bottom: 18px;
}

.profile-field label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 7px;
  color: var(--color-ink-soft);
}

.field-box {
  height: 42px;
  border: 1px solid var(--color-line);
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 10px;
}

.field-box.readonly {
  background: rgba(255, 255, 255, 0.03);
  color: var(--color-ink-soft);
}

.field-box .lock {
  margin-left: auto;
  opacity: 0.7;
  font-size: 13px;
}

.field-box.editable input {
  background: transparent;
  border: none;
  outline: none;
  flex: 1;
  color: var(--color-ink);
  font-size: 14px;
}

.field-box.editable button {
  height: 30px;
  padding: 0 12px;
  font-size: 13px;
}

button {
  border-radius: 8px;
  padding: 8px 14px;
  border: 1px solid var(--color-line);
  background: transparent;
  color: var(--color-ink);
  font-weight: 600;
  cursor: pointer;
}

button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

button.secondary {
  border-color: transparent;
}

.security-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group input {
  width: 100%;
  height: 42px;
  background: transparent;
  border: 1px solid var(--color-line);
  border-radius: 8px;
  padding: 0 12px;
  color: var(--color-ink);
}

.password-box {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-line);
  border-radius: 8px;
  padding: 0 12px;
  height: 42px;
}

.password-box input {
  border: none;
  outline: none;
  background: transparent;
  height: 100%;
  flex: 1;
  padding: 0;
  color: var(--color-ink);
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

.form-group input::placeholder {
  color: #777;
}

.success-message {
  font-size: 13px;
  color: #409760;
  margin-top: 10px;
}

.loading-state {
  color: var(--color-ink-soft);
}
</style>