<script setup>
defineProps({
  code: { type: String, required: true },
  stock: { type: Number, required: true },
  minStock: { type: Number, default: 5 },
});
</script>

<template>
  <div class="tag" :class="{ 'tag-low-stock': stock <= minStock && stock > 0, 'tag-out-of-stock': stock === 0 }">
    <span class="tag-hole" aria-hidden="true"></span> 
    <span class="tag-stock">
      <template v-if="stock === 0">SIN STOCK</template>
      <template v-else-if="stock <= minStock">STOCK BAJO · {{ stock }}</template>
      <template v-else>STOCK {{ stock }}</template>
    </span>
  </div>
</template>

<style scoped>
/* Simulates a hanging inventory tag: dashed border, and a circular
   "hole" on the top left, as if it were tied with string to the real
   part. This is the visual signature element of the project: repeated
   on the catalog card and on the detail view. */
.tag {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 6px 12px 6px 20px;
  border: 1.5px dashed var(--color-line);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--color-ink-soft);
}
.tag-hole {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: 1.5px solid var(--color-line);
  background: var(--color-bg);
}
.tag-code {
  font-weight: 600;
  color: var(--color-ink);
}
.tag-stock {
  color: var(--color-ink-soft);
  border-left: 1px dashed var(--color-line);
  padding-left: var(--space-2);
}
.tag-low-stock .tag-stock {
  color: rgb(223, 156, 69);
  font-weight: 600;
}
.tag-out-of-stock .tag-stock {
  color: var(--color-danger);
  font-weight: 600;
}
</style>
