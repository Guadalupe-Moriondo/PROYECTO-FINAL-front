<script setup>
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const route = useRoute();
const router = useRouter();

const query = ref(route.name === 'catalog' ? route.query.search || '' : '');

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
    <div class="search-input-wrapper">
      <svg
        class="search-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" stroke-linecap="round" />
      </svg>

      <input
        v-model="query"
        type="text"
        class="search-input"
        placeholder="Buscar repuestos..."
        aria-label="Buscar productos"
      />

      <button
        v-if="query"
        type="button"
        class="search-clear"
        title="Limpiar búsqueda"
        aria-label="Limpiar búsqueda"
        @click="query = ''"
      >
        ✕
      </button>
    </div>
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

.search-input-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.search-icon {
  width: 16px;
  height: 16px;
  color: #cfd3d1;
  flex-shrink: 0;
  margin-left: 2px;
}

.search-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  color: #fff;
  padding: 9px 38px 9px 8px;
  font-size: 0.9rem;
}

.search-input::placeholder {
  color: #9aa19d;
}

.search-input:focus {
  outline: none;
}

.search-clear {
  position: absolute;
  right: 4px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  outline: none;
  background: transparent !important;
  color: #9aa19d;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0;
  box-shadow: none;
  appearance: none;
}

.search-clear:hover,
.search-clear:focus,
.search-clear:active {
  background: transparent !important;
  color: #fff;
  box-shadow: none;
}

@media (max-width: 900px) {
  .search-bar {
    max-width: none;
    width: 100%;
  }
}
</style>
