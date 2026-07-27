<script setup>
import AppHeader from './components/header/AppHeader.vue';
import FooterSite from './components/FooterSite.vue';
import FloatingButtons from './components/FloatingButtons.vue';

</script>

<template>
  <div class="app-layout">
    <AppHeader />
    <main class="app-main">
      <RouterView />
    </main>
    <FooterSite />
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
