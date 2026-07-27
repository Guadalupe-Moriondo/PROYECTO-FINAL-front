<script setup>
import { RouterLink } from 'vue-router';
import { useCartStore } from '../../stores/cart';

const cartStore = useCartStore();
</script>

<template>
  <RouterLink :to="{ name: 'cart' }" class="cart-btn" aria-label="Carrito de compras">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 8H6" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="10" cy="21" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="18" cy="21" r="1.4" fill="currentColor" stroke="none" />
    </svg>
    <span v-if="cartStore.itemCount > 0" class="cart-badge">{{ cartStore.itemCount }}</span>
  </RouterLink>
</template>

<style scoped>
.cart-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
  color: #fff;
  text-decoration: none;
}
.cart-btn svg {
  width: 20px;
  height: 20px;
}
.cart-btn:hover {
  border-color: var(--color-rust);
  color: var(--color-rust);
}
.cart-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: var(--color-rust);
  color: #fff;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  min-width: 18px;
  height: 18px;
  padding: 0 3px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
