<script setup>
import { onMounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';


const cartStore = useCartStore();
const authStore = useAuthStore();
const router = useRouter();

onMounted(() => {
  if (authStore.isLoggedIn) {
    cartStore.loadCart();
  }
});

function changeQuantity(item, newQuantity) {
  if (newQuantity < 1) {
    cartStore.removeItem(item.id);
    return;
  }
  cartStore.updateQuantity(item.id, newQuantity);
}

function goToCheckout() {
  router.push({ name: 'checkout' });
}
</script>

<template>
  <div class="container cart-view">
    <h1>Tu carrito</h1>

    <p v-if="!authStore.isLoggedIn" class="empty-state">
      Necesitás <RouterLink to="/login">iniciar sesión</RouterLink> para ver tu carrito.
    </p>

    <template v-else>
      <p v-if="cartStore.loading" class="loading-state">Cargando carrito...</p>

      <p v-else-if="cartStore.items.length === 0" class="empty-state">
        Tu carrito está vacío. <RouterLink :to="{name: 'catalog'}">Ir al catálogo</RouterLink>
      </p>

      <div v-else class="cart-layout">
        <ul class="cart-list">
          <li v-for="item in cartStore.items" :key="item.id" class="cart-item">
            <div class="cart-item-info">
              <p class="cart-item-name">{{ item.product.name }}</p>
              <p class="cart-item-code">Código {{ item.product.code }}</p>
            </div>
            <div class="cart-item-quantity">
              <button @click="changeQuantity(item, item.quantity - 1)">−</button>
              <span>{{ item.quantity }}</span>
              <button @click="changeQuantity(item, item.quantity + 1)">+</button>
            </div>
            <p class="cart-item-subtotal">
              $ {{ (Number(item.product.price) * item.quantity).toLocaleString('es-AR') }}
            </p>
            <button class="cart-item-remove" @click="cartStore.removeItem(item.id)">
              Quitar
            </button>
          </li>
        </ul>

        <aside class="cart-summary">
          <h2>Resumen</h2>
          <p class="cart-summary-total">
            Total <span>$ {{ cartStore.total.toLocaleString('es-AR') }}</span>
          </p>
          <button class="button button-primary button-full" @click="goToCheckout">
            Continuar compra
          </button>
        </aside>
      </div>
    </template>
  </div>
</template>

<style scoped>
.cart-view {
  padding: var(--space-5) var(--space-4);
}
.cart-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: var(--space-5);
  align-items: start;
}
@media (max-width: 760px) {
  .cart-layout { grid-template-columns: 1fr; }
}
.cart-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.cart-item {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  align-items: center;
  gap: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-sm);
  padding: var(--space-3);
}
.cart-item-name { margin: 0; font-weight: 600; }
.cart-item-code {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--color-ink-soft);
}
.cart-item-quantity {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.cart-item-quantity button {
  width: 26px; height: 26px;
  border: 1px solid var(--color-line);
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  cursor: pointer;
}
.cart-item-subtotal {
  font-family: var(--font-mono);
  font-weight: 600;
  margin: 0;
  color: var(--color-rust);
}
.cart-item-remove {
  background: none;
  border: none;
  color: var(--color-danger);
  font-size: 0.8rem;
  cursor: pointer;
  text-decoration: underline;
}
.cart-summary {
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  position: sticky;
  top: var(--space-4);
}
.cart-summary-total {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: var(--space-3);
}
.button-full { width: 100%; }
</style>
