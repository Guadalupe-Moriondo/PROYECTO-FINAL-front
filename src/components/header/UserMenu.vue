<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useCartStore } from '../../stores/cart';

const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();

const open = ref(false);
const root = ref(null);

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

onMounted(() => document.addEventListener('click', handleClickOutside));
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside));

function logout() {
  close();
  authStore.logout();
  cartStore.clearLocal();
  router.push({ name: 'home' });
}
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
         <!-- Usuario -->
        <RouterLink
          v-if="!authStore.isAdmin"
          :to="{ name: 'my-orders' }"
          class="user-menu-item"
          @click="close"
        >
          Mis pedidos
        </RouterLink>

        <!-- Administrador -->

        <template v-else>
          <RouterLink
             :to="{ name: 'admin-home' }"
             class="user-menu-item user-menu-item-admin"
             @click="close"
          >
          Panel admin

        </RouterLink>
       
      </template>
      
        <button type="button" class="user-menu-item user-menu-logout" @click="logout">
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
</style>
