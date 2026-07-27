<script setup>
const props = defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
});
const emit = defineEmits(['change-page']);

function goTo(page) {
  if (page < 1 || page > props.totalPages || page === props.page) return;
  emit('change-page', page);
}
</script>

<template>
  <nav v-if="totalPages > 1" class="pagination" aria-label="Paginación de resultados">
    <button class="pagination-button" :disabled="page === 1" @click="goTo(page - 1)">
      ← Anterior
    </button>
    <span class="pagination-info">Página {{ page }} de {{ totalPages }}</span>
    <button class="pagination-button" :disabled="page === totalPages" @click="goTo(page + 1)">
      Siguiente →
    </button>
  </nav>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  margin: var(--space-5) 0;
}
.pagination-button {
  background: transparent;
  border: 1px solid var(--color-steel);
  color: var(--color-steel);
  font-family: var(--font-display);
  text-transform: uppercase;
  font-size: 0.85rem;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  cursor: pointer;
}
.pagination-button:hover:not(:disabled) {
  background: var(--color-steel);
  color: #fff;
}
.pagination-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.pagination-info {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--color-ink-soft);
}
</style>
