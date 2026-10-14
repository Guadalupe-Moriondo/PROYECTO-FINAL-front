<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="container not-found-view">
    <p class="not-found-tag">404</p>
    <h1>Página no encontrada</h1>
    <p>La página que buscás no existe.</p>
    <RouterLink to="/" class="button button-primary">Volver al inicio</RouterLink>
  </div>
</template>

<style scoped>
.not-found-view {
  min-height: calc(100vh - 160px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.not-found-tag {
  font-family: var(--font-mono);
  font-size: 3rem;
  color: var(--color-line);
  margin: 0;
}
</style>
