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

function imageUrl(product) {
  if (!product?.imageUrl) return null;
  return `${import.meta.env.VITE_API_URL}${product.imageUrl}`;
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
            <img  v-if="imageUrl(item.product)" :src="imageUrl(item.product)" :alt="item.product?.name || 'Producto'"  class="cart-item-image"/>
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
            <button class="cart-item-remove" @click="cartStore.removeItem(item.id)" title="Eliminar">
              <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"  class="trash-icon">
                <path fill-rule="evenodd"  d="M16.5 4.5V3.75A2.25 2.25 0 0 0 14.25 1.5h-4.5A2.25 2.25 0 0 0 7.5 3.75V4.5H4.875a.75.75 0 0 0 0 1.5h.568l.92 13.2A2.25 2.25 0 0 0 8.607 21h6.786a2.25 2.25 0 0 0 2.244-1.8l.92-13.2h.568a.75.75 0 0 0 0-1.5H16.5Zm-7.5-.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75V4.5H9V3.75Zm1.5 5.25a.75.75 0 0 1 1.5 0v7.5a.75.75 0 0 1-1.5 0V9Zm4.5-.75a.75.75 0 0 0-.75.75v7.5a.75.75 0 0 0 1.5 0V9a.75.75 0 0 0-.75-.75Z" clip-rule="evenodd"/>
              </svg>  
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
  grid-template-columns: 70px 1fr auto auto auto;
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
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-line);
  border-radius: 50%;
  background: var(--color-bg);
  color: grey;
  cursor: pointer;
  transition: all .2s ease;
}

.cart-item-remove:hover {
  background: rgb(236, 236, 236);
  border-color: grey;
  transform: scale(1.05);

}

.cart-item-image {
  grid-column: 1;
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 12%;
  flex-shrink: 0;
}

.cart-item-info {
  grid-column: 2;
}

.cart-item-quantity {
  grid-column: 3;
}

.cart-item-subtotal {
  grid-column: 4;
}

.cart-item-remove {
  grid-column: 5;
}

.trash-icon {
  width: 18px;
  height: 18px;
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
