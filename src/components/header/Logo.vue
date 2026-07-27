<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <RouterLink :to="{ name: 'home' }" class="logo" aria-label="Ir al inicio">
    <span class="logo-mark">DM</span>
    <span class="logo-text">Repuestos<br />Agrícolas</span>
  </RouterLink>
</template>

<style scoped>
.logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  text-decoration: none;
  color: #fff;
  line-height: 1;
  flex-shrink: 0;
}
.logo-mark {
  font-family: var(--font-display);
  font-size: 1.7rem;
  font-weight: 700;
  color: var(--color-rust);
  letter-spacing: 0.02em;
}
.logo-text {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #cfd3d1;
  line-height: 1.2;
}

@media (max-width: 640px) {
  .logo-text {
    display: none;
  }
}
</style>
