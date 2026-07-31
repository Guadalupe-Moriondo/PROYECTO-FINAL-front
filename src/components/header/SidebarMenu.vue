<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useCartStore } from '../../stores/cart';
import categoriesService from '../../services/categories.service';

const props = defineProps({
  open: { type: Boolean, default: false },
});
const emit = defineEmits(['close']);

const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();

const categories = ref([]);
const categoryGroups = computed(() => [
  {
    key: 'sembradoras',
    label: 'Sembradoras',
    categories: categories.value.filter(
      (cat) => cat.machineType === 'sembradoras'
    ),
  },
  {
    key: 'cosechadoras',
    label: 'Cosechadoras',
    categories: categories.value.filter(
      (cat) => cat.machineType === 'cosechadoras'
    ),
  },
  {
    key: 'otros',
    label: 'Otros',
    categories: categories.value.filter(
      (cat) => cat.machineType === 'otros'
    ),
  },
]);
const categoriesExpanded = ref(false);
const expandedGroups = ref({
  sembradoras: false,
  cosechadoras: false,
  otros: false,
});

function toggleGroup(group) {
  expandedGroups.value[group] = !expandedGroups.value[group];
}

async function loadCategories() {
  try {
    const response = await categoriesService.list();
    categories.value = response.data;
  } catch (e) {
    categories.value = [];
  }
}

function goToCategory(categoryId) {
  emit('close');
  router.push({ name: 'catalog', query: { categoryId } });
}

function logout() {
  emit('close');
  authStore.logout();
  cartStore.clearLocal();
  router.push({ name: 'home' });
}



onMounted(loadCategories);

// Mientras el panel está abierto, evitamos que el fondo scrollee.
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

              <span class="sidebar-chevron" 
                :class="{ 'sidebar-chevron-open': categoriesExpanded }"
              >
                ›
              </span>
            </button>
            <div v-if="categoriesExpanded" class="sidebar-category-groups">
              <div
                  v-for="group in categoryGroups"
                  :key="group.key"
                  class="sidebar-category-group"
                >
                  <button
                    type="button"
                    class="sidebar-category-toggle"
                    :aria-expanded="expandedGroups[group.key]"
                    @click="toggleGroup(group.key)"
                  >

                    <span>{{ group.label }}</span>
                    <span
                      class="sidebar-chevron"
                      :class="{
                      'sidebar-chevron-open': expandedGroups[group.key]}"

                    >
                      ›
                    </span>
                  </button>
                  <div
                    v-if="expandedGroups[group.key]"
                    class="sidebar-subitems sidebar-group-items"
                  >
                    <button
                      v-for="cat in group.categories"
                      :key="cat.id"
                      type="button"
                      class="sidebar-sublink"
                      @click="goToCategory(cat.id)"
                    >
                      {{ cat.name }}
                    </button>
                    <p
                      v-if="group.categories.length === 0"
                      class="sidebar-subempty"
                    >
                      No hay categorías.
                     </p>
                  
                  </div>
                </div>
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
             <!-- CLIENTE -->
            <template v-if="!authStore.isAdmin">
              <RouterLink
                :to="{ name: 'my-orders' }"
                class="sidebar-link"
                @click="$emit('close')"
              >
                Mis pedidos
              </RouterLink>

            </template>
          <!-- ADMIN -->

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
              Pedidos
            </RouterLink>

          </template>
          <button
            type="button"
            class="sidebar-link sidebar-logout"
            @click="logout"
          >
            Salir
          </button>
        </template>

        </nav>
      </aside>
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
</style>
