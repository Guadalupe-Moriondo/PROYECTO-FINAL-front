<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import HamburgerButton from './HamburgerButton.vue';
import Logo from './Logo.vue';
import SearchBar from './SearchBar.vue';
import UserMenu from './UserMenu.vue';
import CartButton from './CartButton.vue';
import SidebarMenu from './SidebarMenu.vue';


const route = useRoute();
const authStore = useAuthStore();
const isAuthPage = computed(() =>
  ['/login', '/register'].includes(route.path)
);

const sidebarOpen = ref(false);

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}
function closeSidebar() {
  sidebarOpen.value = false;
}
</script>

<template>
  <header class="app-header">
    <div class="container app-header-inner">

      <HamburgerButton
        v-if="!isAuthPage"
        :open="sidebarOpen"
        @toggle="toggleSidebar"
      />

      <Logo />

      <SearchBar v-if="!isAuthPage" />

      <div class="app-header-actions">
        <UserMenu />
        <CartButton v-if="!isAuthPage && !authStore.isAdmin"/>
      </div>

    </div>
  </header>

  <SidebarMenu
    v-if="!isAuthPage"
    :open="sidebarOpen"
    @close="closeSidebar"
  />
</template>

<style scoped>
.app-header {
  background: var(--color-steel);
  border-bottom: 3px solid var(--color-rust);
  position: sticky;
  top: 0;
  z-index: 30;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.2);
}
.app-header-inner {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-top: var(--space-3);
  padding-bottom: var(--space-3);
}
.app-header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
  margin-left: auto;
}

@media (max-width: 760px) {
  .app-header-inner {
    flex-wrap: wrap;
  }
  .app-header-actions {
    margin-left: 0;
  }
}
</style>
