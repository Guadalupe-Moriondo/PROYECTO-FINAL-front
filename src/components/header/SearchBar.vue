<script setup>
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const query = ref(route.name === 'catalog' ? route.query.search || '' : '');

// Si el usuario navega directo a /catalogo?search=... desde otro lado
// (ej. un link compartido), mantenemos el input sincronizado.
watch(
  () => route.query.search,
  (newSearch) => {
    if (route.name === 'catalog') {
      query.value = newSearch || '';
    }
  },
);

function submit() {
  const trimmed = query.value.trim();
  router.push({
    name: 'catalog',
    query: trimmed ? { search: trimmed } : {},
  });
}
</script>

<template>
  <form class="search-bar" role="search" @submit.prevent="submit">
    <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" stroke-linecap="round" />
    </svg>
    <input
      v-model="query"
      type="search"
      class="search-input"
      placeholder="Buscar repuestos..."
      aria-label="Buscar productos"
    />
  </form>
</template>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 480px;
  min-width: 0;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
  padding: 0 var(--space-2);
}
.search-bar:focus-within {
  border-color: var(--color-rust);
  background: rgba(255, 255, 255, 0.12);
}
.search-icon {
  width: 16px;
  height: 16px;
  color: #cfd3d1;
  flex-shrink: 0;
}
.search-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  color: #fff;
  padding: 9px var(--space-2);
  font-size: 0.9rem;
}
.search-input::placeholder {
  color: #9aa19d;
}
.search-input:focus {
  outline: none;
}
@media (max-width: 760px) {
  .search-bar {
    order: 4;
    max-width: none;
    width: 100%;
  }
}
</style>
