<script setup>
import { computed,watch,onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';
import AppHeader from './components/header/AppHeader.vue';
import FooterSite from './components/FooterSite.vue';
import FloatingButtons from './components/FloatingButtons.vue';
import { useOrderNotificationsStore } from './stores/orderNotifications';

const route = useRoute();

const authStore = useAuthStore();
const orderNotificationsStore = useOrderNotificationsStore();

const isAuthPage = computed(() => {
  return route.path === '/login' || route.path === '/register';
});

// Iniciar o detener la comprobación de nuevos pedidos
 // dependiendo de si hay un administrador logueado.

 watch(
    () => [authStore.isLoggedIn, authStore.isAdmin],
    ([isLoggedIn, isAdmin]) => {
      if (isLoggedIn && isAdmin) {
        orderNotificationsStore.startPolling();
      } else {
        orderNotificationsStore.stopPolling();
      }
    },
    { immediate: true }
 );
 onUnmounted(() => {
  orderNotificationsStore.stopPolling();
 });

</script>

<template>
  <div class="app-layout">
    <AppHeader v-if="!isAuthPage" />
    <main class="app-main">
      <RouterView />
    </main>
    <FooterSite v-if="!isAuthPage" />
    <FloatingButtons />
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.app-main {
  flex: 1;
}
</style>
