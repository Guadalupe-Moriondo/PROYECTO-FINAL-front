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

    <header class="page-header">
      <div>
        <h1>Tu carrito</h1>
      </div>
    </header>

    <p
      v-if="!authStore.isLoggedIn"
      class="empty-card"
    >
      Necesitás
      <RouterLink to="/login">iniciar sesión</RouterLink>
      para ver tu carrito.
    </p>

    <template v-else>

      <p
        v-if="cartStore.loading"
        class="loading-state"
      >
        Cargando carrito...
      </p>

      <div
        v-else-if="cartStore.items.length === 0"
        class="empty-cart"
      >
        <h2>Tu carrito está vacío</h2>

        <p>
          Todavía no agregaste productos.
        </p>

        <RouterLink
          :to="{ name: 'catalog' }"
          class="button button-primary"
        >
          Ir al catálogo
        </RouterLink>
      </div>

      <div
        v-else
        class="cart-layout"
      >

        <!-- Productos -->

        <section class="cart-products">

          <article
            v-for="item in cartStore.items"
            :key="item.id"
            class="cart-card"
          >

            <div class="cart-image">

              <img
                v-if="imageUrl(item.product)"
                :src="imageUrl(item.product)"
                :alt="item.product.name"
              >

            </div>

            <div class="cart-content">

              <div class="cart-top">

                <div>

                  <p class="product-brand">
                    {{ item.product.brand }}
                  </p>

                  <h2 class="product-name">
                    {{ item.product.name }}
                  </h2>

                  <p class="product-code">
                    Código {{ item.product.code }}
                  </p>

                </div>

                <button
                  class="delete-button"
                  @click="cartStore.removeItem(item.id)"
                  title="Eliminar"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6"/>
                    <path d="M14 11v6"/>
                    <path d="M9 6V4h6v2"/>
                  </svg>
                </button>

              </div>

              <div class="cart-bottom">

                <div class="quantity-selector">

                  <button
                    @click="changeQuantity(item,item.quantity-1)"
                  >
                    −
                  </button>

                  <span>
                    {{ item.quantity }}
                  </span>

                  <button
                    @click="changeQuantity(item,item.quantity+1)"
                  >
                    +
                  </button>

                </div>

                <div class="product-price">

                  $ {{ (Number(item.product.price) * item.quantity).toLocaleString('es-AR') }}

                </div>

              </div>

            </div>

          </article>

        </section>

        <!-- Resumen -->

        <aside class="cart-summary">

          <h2>Resumen</h2>

          <div class="summary-row">
            <span>Productos</span>
            <strong>{{ cartStore.items.length }}</strong>
          </div>

          <div class="summary-row total">
            <span>Total</span>

            <strong>
              $ {{ cartStore.total.toLocaleString('es-AR') }}
            </strong>
          </div>

          <button
            class="button button-primary button-full"
            @click="goToCheckout"
          >
            Continuar compra
          </button>

        </aside>

      </div>

    </template>

  </div>
</template>

<style scoped>

.cart-view {
  padding: var(--space-6) var(--space-4);
}

/* =========================
   Header
========================= */

.page-header {
  margin-bottom: 2.5rem;
}

.page-kicker {
  font-size: .78rem;
  text-transform: uppercase;
  letter-spacing: .18em;
  color: var(--color-rust);
  font-weight: 700;
  margin-bottom: .4rem;
}

.page-header h1 {
  margin: 0;
  font-size: 2.4rem;
  font-family: var(--font-display);
}

.page-description {
  margin-top: .8rem;
  color: var(--color-ink-soft);
  max-width: 650px;
  line-height: 1.7;
}

/* =========================
   Layout
========================= */

.cart-layout {
  display: grid;
  grid-template-columns: minmax(0,1fr) 340px;
  gap: 2rem;
  align-items: start;
}

.cart-products {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
}

/* =========================
   Producto
========================= */

.cart-card {

  display: flex;
  gap: 1.5rem;

  padding: 1.5rem;

  background: var(--color-surface);

  border: 1px solid var(--color-line);

  border-radius: 24px;

  box-shadow: 0 10px 30px rgba(0,0,0,.05);

  transition: .25s;
}

.cart-card:hover {
  transform: translateY(-3px);
}

.cart-image {

  width: 120px;
  height: 120px;

  border-radius: 18px;

  overflow: hidden;

  flex-shrink: 0;

  background: #f7f7f7;
}

.cart-image img {

  width: 100%;
  height: 100%;

  object-fit: cover;
}

.cart-content {

  flex: 1;

  display: flex;

  flex-direction: column;

  justify-content: space-between;
}

.cart-top {

  display: flex;

  justify-content: space-between;

  gap: 1rem;
}

.product-brand {

  margin: 0;

  color: var(--color-rust);

  font-size: .75rem;

  font-weight: 700;

  letter-spacing: .15em;

  text-transform: uppercase;
}

.product-name {

  margin: .4rem 0;

  font-size: 1.45rem;

  font-weight: 700;
}

.product-code {

  margin: 0;

  color: var(--color-ink-soft);

  font-family: var(--font-mono);
}

/* =========================
   Cantidad
========================= */

.cart-bottom {

  display: flex;

  justify-content: space-between;

  align-items: center;

  margin-top: 1.4rem;
}

.quantity-selector {

  display: flex;

  align-items: center;

  gap: .8rem;
}

.quantity-selector button {

  width: 42px;
  height: 42px;

  border: none;

  border-radius: 50%;

  background: var(--color-bg);

  cursor: pointer;

  font-size: 1.2rem;

  transition: .2s;
}

.quantity-selector button:hover {

  background: var(--color-rust);

  color: white;
}

.quantity-selector span {

  min-width: 36px;

  text-align: center;

  font-weight: 700;

  font-size: 1.1rem;
}

/* =========================
   Precio
========================= */

.product-price {

  font-size: 1.7rem;

  font-weight: 700;

  color: var(--color-rust);
}

/* =========================
   Eliminar
========================= */

.delete-button {

  width: 42px;
  height: 42px;

  border-radius: 50%;

  border: none;

  background: #f5f5f5;

  color: #666;

  cursor: pointer;

  display: flex;

  justify-content: center;

  align-items: center;

  transition: .2s;
}

.delete-button svg {

  width: 18px;
  height: 18px;
}

.delete-button:hover {

  background: #ffe8e8;

  color: #c0392b;
}

/* =========================
   Resumen
========================= */

.cart-summary {

  position: sticky;

  top: 2rem;

  padding: 2rem;

  border-radius: 24px;

  background: white;

  border: 1px solid var(--color-line);

  box-shadow: 0 10px 30px rgba(0,0,0,.05);
}

.cart-summary h2 {

  margin-top: 0;

  margin-bottom: 1.6rem;

  font-size: 1.4rem;
}

.summary-row {

  display: flex;

  justify-content: space-between;

  margin-bottom: 1rem;

  color: var(--color-ink-soft);
}

.summary-row.total {

  margin-top: 1.5rem;

  padding-top: 1.5rem;

  border-top: 1px solid var(--color-line);

  color: var(--color-ink);

  font-size: 1.25rem;

  font-weight: 700;
}

.button-full {

  width: 100%;

  margin-top: 2rem;
}

/* =========================
   Carrito vacío
========================= */

.empty-cart {

  text-align: center;

  background: white;

  border: 1px solid var(--color-line);

  border-radius: 24px;

  padding: 4rem 2rem;

  box-shadow: 0 10px 30px rgba(0,0,0,.05);
}

.empty-icon {

  font-size: 4rem;

  margin-bottom: 1rem;
}

.empty-cart h2 {

  margin-bottom: .8rem;
}

.empty-cart p {

  color: var(--color-ink-soft);

  margin-bottom: 2rem;
}

.empty-card,
.loading-state {

  text-align: center;

  padding: 3rem;

  color: var(--color-ink-soft);
}

/* =========================
   Responsive
========================= */

@media (max-width: 900px) {

  .cart-layout {
    grid-template-columns: 1fr;
  }

  .cart-summary {
    position: static;
  }

  .cart-card {

    flex-direction: column;
  }

  .cart-image {

    width: 100%;
    height: 240px;
  }

  .cart-bottom {

    flex-direction: column;

    align-items: flex-start;

    gap: 1rem;
  }

  .product-price {

    font-size: 1.5rem;
  }

}

</style>