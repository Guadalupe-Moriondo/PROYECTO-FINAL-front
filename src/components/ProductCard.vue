<script setup>
import { RouterLink } from 'vue-router';
import AvailabilityTag from './AvailabilityTag.vue';


const props = defineProps({
  product: { type: Object, required: true },
});

// If the product doesn't have an uploaded image yet, we show a
// placeholder instead of a broken <img>
function imageUrl(product) {
  if (!product.imageUrl) return null;
  // imageUrl comes as "/uploads/products/xxx.jpg" (relative backend path)
  return `${import.meta.env.VITE_API_URL}${product.imageUrl}`;
}
</script>

<template>
  <RouterLink :to="{ name: 'product-detail', params: { id: product.id } }" class="card">
    <div class="card-image">
      <img v-if="imageUrl(product)" :src="imageUrl(product)" :alt="product.name" />
      <span v-else class="card-image-placeholder">Sin foto</span>
    </div>
    <div class="card-body">
      <p class="card-brand" v-if="product.brand">{{ product.brand }}</p>
      <h3 class="card-name">{{ product.name }}</h3>
      <p class="card-price">$ {{ Number(product.price).toLocaleString('es-AR') }}</p>
      <AvailabilityTag
        :code="product.code"
        :stock="product.stock"
      />
    </div>
  </RouterLink>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  overflow: hidden;
  
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(30, 27, 22, 0.1);
  border-color: var(--color-rust);
}
.card-image {
  aspect-ratio: 4 / 3;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  
}
.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.card-image-placeholder {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-ink-soft);
  text-transform: uppercase;
}
.card-body {
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-top: auto;
}
.card-brand {
  margin: 0;
  font-family: var(--font-display);
  font-size: 0.72rem;
  text-transform: uppercase;
  color: var(--color-ink-soft);
}
.card-name {
  margin: 0;
  font-size: 1.05rem;
  text-transform: none;
  letter-spacing: 0;
}
.card-price {
  margin: 0 0 var(--space-2);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.5rem;
  color: var(--color-rust);
}
</style>
