<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="container not-found-view">
    <p class="not-found-tag">404</p>
    <h1>Repuesto no encontrado</h1>
    <p>La página que buscás no existe o fue movida.</p>
    <RouterLink to="/" class="button button-primary">Volver al catálogo</RouterLink>
  </div>
</template>

<style scoped>
.not-found-view {
  padding: var(--space-6) var(--space-4);
  text-align: center;
}
.not-found-tag {
  font-family: var(--font-mono);
  font-size: 3rem;
  color: var(--color-line);
  margin: 0;
}
</style>
