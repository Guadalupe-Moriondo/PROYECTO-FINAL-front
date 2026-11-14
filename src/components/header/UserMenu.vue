<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useCartStore } from '../../stores/cart';

const router = useRouter();

const authStore = useAuthStore();
const cartStore = useCartStore();
const open = ref(false);
const root = ref(null);
const confirmingLogout = ref(false);

function toggle() {
  open.value = !open.value;
}

function close() {
  open.value = false;
}

function handleClickOutside(event) {
  if (root.value && !root.value.contains(event.target)) {
    close();
  }
}

function askLogout() {
  close();
  confirmingLogout.value = true;
}

function logout() {
  confirmingLogout.value = false;
  authStore.logout();
  cartStore.clearLocal();
  router.push({ name: 'home' });
}

onMounted(() => document.addEventListener('click', handleClickOutside));
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside));
</script>

<template>
  <div class="user-menu" ref="root">
    <button
      type="button"
      class="user-menu-btn"
      :class="{ 'user-menu-btn-open': open }"
      :aria-expanded="open"
      aria-haspopup="true"
      aria-label="Cuenta"
      @click="toggle"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M4.5 20c1.6-3.6 4.6-5.5 7.5-5.5s5.9 1.9 7.5 5.5" stroke-linecap="round" />
      </svg>
    </button>

    <div v-if="open" class="user-menu-dropdown">
      <template v-if="authStore.isLoggedIn">

        <RouterLink
          v-if="!authStore.isAdmin"
          :to="{ name: 'profile' }"
          class="user-menu-item"
          @click="close"
        >
          Mi perfil
        </RouterLink>

        <template v-else>
          <RouterLink
             :to="{ name: 'admin-home' }"
             class="user-menu-item user-menu-item-admin"
             @click="close"
          >
          Panel admin

        </RouterLink>

        <RouterLink to="/perfil" class="user-menu-item">
          Mi perfil
        </RouterLink>
       
      </template>
      
        <button type="button" class="user-menu-item user-menu-logout" @click="askLogout">
          Salir
        </button>
    
      </template>
      <template v-else>
        <RouterLink :to="{ name: 'login' }" class="user-menu-item" @click="close">
          Ingresar
        </RouterLink>
        <RouterLink :to="{ name: 'register' }" class="user-menu-item" @click="close">
          Crear cuenta
        </RouterLink>
      </template>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="confirmingLogout"
          class="confirm-overlay"
          @click.self="confirmingLogout = false"
        >
          <div
            class="confirm-card"
            role="dialog"
            aria-modal="true"
          >
            <h3>¿Cerrar sesión?</h3>

            <p>Vas a salir de tu cuenta.</p>

            <div class="confirm-actions">

              <button
                type="button"
                class="confirm-btn confirm-btn--primary"
                @click="logout"
              >
                Aceptar
              </button>
              
              <button
                type="button"
                class="confirm-btn confirm-btn--cancel"
                @click="confirmingLogout = false"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.user-menu {
  position: relative;
}

.user-menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
  color: #fff;
  cursor: pointer;
}

.user-menu-btn svg {
  width: 20px;
  height: 20px;
}

.user-menu-btn:hover,
.user-menu-btn-open {
  border-color: var(--color-rust);
  color: var(--color-rust);
}

.user-menu-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 200px;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  padding: var(--space-2);
  z-index: 40;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-menu-greeting {
  margin: 4px 10px 6px;
  font-size: 0.8rem;
  color: var(--color-ink-soft);
  font-family: var(--font-mono);
}

.user-menu-item {
  text-align: left;
  text-decoration: none;
  background: transparent;
  border: none;
  color: var(--color-ink);
  font-family: var(--font-body);
  font-size: 0.9rem;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.user-menu-item:hover {
  background: var(--color-bg);
  color: var(--color-rust);
}

.user-menu-item-admin {
  color: var(--color-safety);
  font-weight: 600;
}

.user-menu-logout {
  color: var(--color-danger);
}

.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, .45);
}

.confirm-card {
  width: 100%;
  max-width: 440px;
  padding: 30px 28px 24px;
  text-align: center;
  background: #fff;
  border: 1px solid var(--color-line);
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, .2);
}

.confirm-card h3 {
  margin: 0 0 10px;
  color: var(--color-ink);
  font-size: 1.2rem;
}

.confirm-card p {
  margin: 0 0 8px;
  color: var(--color-ink-soft);
  font-size: .9rem;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 10px;
  margin-top: 22px;
}

.confirm-btn {
  flex: 1;
  min-height: 44px;
  border-radius: 12px;
  font-family: var(--font-body);
  font-size: .88rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background .2s ease,
    color .2s ease;
}

.confirm-btn--cancel {
  border: 1px solid var(--color-line);
  background: #fff;
  color: var(--color-ink);
}

.confirm-btn--cancel:hover {
  background: #f6f6f3;
}

.confirm-btn--primary {
  border: 1px solid var(--color-rust);
  background: var(--color-rust);
  color: #fff;
}

.confirm-btn--primary:hover {
  background: var(--color-rust-dark);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity .2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .confirm-card,
.modal-leave-active .confirm-card {
  transition: transform .2s ease;
}

.modal-enter-from .confirm-card,
.modal-leave-to .confirm-card {
  transform: translateY(10px) scale(.97);
}
</style>
