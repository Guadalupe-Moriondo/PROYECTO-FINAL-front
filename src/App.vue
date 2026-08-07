<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import AppHeader from './components/header/AppHeader.vue';
import FooterSite from './components/FooterSite.vue';
import FloatingButtons from './components/FloatingButtons.vue';

const route = useRoute();

const isAuthPage = computed(() => {
  return route.path === '/login' || route.path === '/register';
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
