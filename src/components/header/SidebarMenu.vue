<script setup>
import { ref, onMounted, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useCartStore } from '../../stores/cart';
import categoriesService from '../../services/categories.service';
import { useOrderNotificationsStore } from '../../stores/orderNotifications';

const router = useRouter();

const props = defineProps({
  open: { type: Boolean, default: false },
});

const emit = defineEmits(['close']);

const authStore = useAuthStore();
const cartStore = useCartStore();
const categories = ref([]);
const categoriesExpanded = ref(false);
const confirmingLogout = ref(false);
const orderNotificationsStore = useOrderNotificationsStore();


async function loadCategories() {
  try {
    const response = await categoriesService.list();
    categories.value = response.data.data;
  } catch (e) {
    console.error('Error al cargar categorías:', e);
    categories.value = [];
  }
}

function goToCategory(categoryId) {
  emit('close');
  router.push({ name: 'catalog', query: { categoryId } });
}

function askLogout() {
  emit('close');
  confirmingLogout.value = true;
}

function logout() {
  confirmingLogout.value = false;
  authStore.logout();
  cartStore.clearLocal();
  router.push({ name: 'home' });
}

onMounted(loadCategories);

watch(
  () => props.open,
  (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
  },
);
</script>

<template>
  <Teleport to="body">
    <Transition name="sidebar-overlay-fade">
      <div v-if="open" class="sidebar-overlay" @click="$emit('close')"></div>
    </Transition>

    <Transition name="sidebar-slide">
      <aside v-if="open" class="sidebar-panel" role="dialog" aria-label="Menú de navegación">
        <div class="sidebar-head">
          <span class="sidebar-head-title">Menú</span>
          <button type="button" class="sidebar-close" aria-label="Cerrar menú" @click="$emit('close')">
            ✕
          </button>
        </div>

        <nav class="sidebar-nav">
          <RouterLink :to="{ name: 'home' }" class="sidebar-link" @click="$emit('close')">
            Inicio
          </RouterLink>
          <RouterLink :to="{ name: 'catalog' }" class="sidebar-link" @click="$emit('close')">
            Catálogo
          </RouterLink>

          <div class="sidebar-group">
            <button
              type="button"
              class="sidebar-link sidebar-group-toggle"
              :aria-expanded="categoriesExpanded"
              @click="categoriesExpanded = !categoriesExpanded"
            >
              Categorías
              <span
                class="sidebar-chevron"
                :class="{ 'sidebar-chevron-open': categoriesExpanded }"
              >
                ›
              </span>
            </button>

            <div
              v-if="categoriesExpanded"
              class="sidebar-subitems"
            >
              <button
                v-for="cat in categories"
                :key="cat.id"
                type="button"
                class="sidebar-sublink"
                @click="goToCategory(cat.id)"
              >
                {{ cat.name }}
              </button>

              <p
                v-if="categories.length === 0"
                class="sidebar-subempty"
              >
                No hay categorías.
              </p>
            </div>
          </div>

          <RouterLink
            :to="{ name: 'catalog', query: { available: 'true' } }"
            class="sidebar-link"
            @click="$emit('close')"
          >
            Stock disponible
          </RouterLink>
          <RouterLink :to="{ name: 'contact' }" class="sidebar-link" @click="$emit('close')">
            Contacto
          </RouterLink>
        </nav>

        <div class="sidebar-divider"></div>

        <nav class="sidebar-nav">
        <template v-if="authStore.isLoggedIn">
          
            <template v-if="!authStore.isAdmin">
              <RouterLink
                :to="{ name: 'my-orders' }"
                class="sidebar-link"
                @click="$emit('close')"
              >
                Mis pedidos
              </RouterLink>

            </template>

          <template v-else>
            <RouterLink
              :to="{ name: 'admin-home' }"
              class="sidebar-link sidebar-link-admin"
              @click="$emit('close')"
            >
              Panel admin
            </RouterLink>

            <RouterLink
              :to="{ name: 'admin-orders' }"
              class="sidebar-link"
              @click="$emit('close')"
            >
              <span>Pedidos</span>

              <span
                v-if="orderNotificationsStore.hasNewOrders" 
                class="notification-dot" 
                :title="`${orderNotificationsStore.newOrdersCount} nuevo(s) pedido(s)`" 
              >
                {{ orderNotificationsStore.newOrdersCount }}
              </span>
            </RouterLink>

          </template>
          <button type="button" class="sidebar-link sidebar-logout" @click="askLogout"
            > Salir
          </button>
        </template>
        </nav>
      </aside>
    </Transition>

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
</template>

<style scoped>
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 17, 16, 0.55);
  z-index: 50;
}

.sidebar-panel {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: min(320px, 85vw);
  background: var(--color-steel);
  color: #e3e6e4;
  z-index: 51;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.35);
  overflow-y: auto;
}

.sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-head-title {
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #fff;
}

.sidebar-close {
  background: transparent;
  border: none;
  color: #e3e6e4;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 4px 8px;
}

.sidebar-close:hover {
  color: var(--color-rust);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: var(--space-3);
  gap: 2px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  text-decoration: none;
  background: transparent;
  border: none;
  color: #e3e6e4;
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  font-size: 0.9rem;
  padding: 12px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.sidebar-link:hover,
.sidebar-link.router-link-active {
  background: rgba(255, 255, 255, 0.06);
  color: var(--color-rust);
}

.sidebar-link-admin {
  color: var(--color-safety);
}

.sidebar-logout {
  color: #e39898;
}

.sidebar-group-toggle {
  width: 100%;
}

.sidebar-chevron {
  transition: transform 0.15s ease;
  display: inline-block;
}

.sidebar-chevron-open {
  transform: rotate(90deg);
}

.sidebar-subitems {
  display: flex;
  flex-direction: column;
  padding: 4px 0 8px 14px;
  gap: 2px;
}

.sidebar-sublink {
  text-align: left;
  background: transparent;
  border: none;
  color: #cfd3d1;
  font-family: var(--font-body);
  font-size: 0.85rem;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.sidebar-sublink:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--color-rust);
}

.sidebar-subempty {
  color: #9aa19d;
  font-size: 0.8rem;
  padding: 8px 10px;
  margin: 0;
}

.sidebar-divider {
  margin: var(--space-2) var(--space-3);
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

/* Transiciones */
.sidebar-overlay-fade-enter-active,
.sidebar-overlay-fade-leave-active {
  transition: opacity 0.2s ease;
}

.sidebar-overlay-fade-enter-from,
.sidebar-overlay-fade-leave-to {
  opacity: 0;
}

.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: transform 0.25s ease;
}

.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  transform: translateX(-100%);
}

.sidebar-category-groups {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 6px 0 10px 8px;
}

.sidebar-category-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-category-title {
  padding: 6px 10px 4px;
  color: #fff;
  font-family: var(--font-display);
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.sidebar-category-group .sidebar-subempty {
  padding-left: 10px;
}

.sidebar-category-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  background: transparent;
  border: none;
  color: #e3e6e4;

  font-family: var(--font-display);
 
  letter-spacing: 0.03em;
  font-size: 0.85rem;

  padding: 10px;
  border-radius: var(--radius-sm);

  cursor: pointer;
  text-align: left;
}

.sidebar-category-toggle:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--color-rust);
}

.sidebar-category-toggle .sidebar-chevron {
  transition: transform 0.15s ease;
}

.sidebar-category-toggle .sidebar-chevron-open {
  transform: rotate(90deg);
}

.sidebar-group-items {
  padding-left: 14px;
  padding-bottom: 6px;
}

.notification-dot {
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  display: flex;
  align-items: center;
  justify-content: center;

  background: var(--color-rust);
  color: white;

  border-radius: 50%;
  font-family: var(--font-body);
  font-size: 0.7rem;
  font-weight: 700;

  animation: notification-pulse 1.5s infinite;
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

@keyframes notification-pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}
</style>
