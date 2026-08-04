<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import ordersService from '../services/orders.service';

const router = useRouter();
const cartStore = useCartStore();

const paymentMethod = ref('cash');
const submitting = ref(false);
const error = ref('');

onMounted(() => {
  cartStore.loadCart();
});

async function confirmOrder() {
  error.value = '';
  submitting.value = true;
  try {
    const response = await ordersService.createFromCart(paymentMethod.value);
    cartStore.clearLocal();
    router.push({ name: 'my-orders', query: { created: response.data.orderNumber } });
  } catch (e) {
    error.value = e.response?.data?.message || 'No se pudo confirmar el pedido';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="container checkout-view">

    <header class="page-header">
      <div>
        <h1>Confirmar pedido</h1>
      </div>
    </header>

    <div
      v-if="cartStore.items.length === 0"
      class="empty-card"
    >
      <div class="empty-icon">
        🛒
      </div>

      <h2>Tu carrito está vacío</h2>

      <p>
        Agregá productos antes de continuar.
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
      class="checkout-layout"
    >

      <!-- =======================
           Resumen
      ======================== -->

      <section class="summary-card">

        <div class="card-header">

          <h2>Resumen del pedido</h2>

        </div>

        <div class="summary-list">

          <article
            v-for="item in cartStore.items"
            :key="item.id"
            class="summary-item"
          >

            <div class="summary-info">

              <h3>
                {{ item.product.name }}
              </h3>

              <p>
                Código {{ item.product.code }}
              </p>

            </div>

            <div class="summary-values">

              <span class="summary-qty">
                x{{ item.quantity }}
              </span>

              <strong>
                $ {{ (Number(item.product.price) * item.quantity).toLocaleString('es-AR') }}
              </strong>

            </div>

          </article>

        </div>

        <div class="summary-total">

          <span>Total</span>

          <strong>

            $ {{ cartStore.total.toLocaleString('es-AR') }}

          </strong>

        </div>

      </section>

      <!-- =======================
            Pago
      ======================== -->

      <form
        class="payment-card"
        @submit.prevent="confirmOrder"
      >

        <h2>Método de pago</h2>

        <label
          class="payment-option"
          :class="{ active: paymentMethod === 'cash' }"
        >

          <input
            type="radio"
            value="cash"
            v-model="paymentMethod"
          >

          <div>

            <strong>Efectivo</strong>

            <small>
              Pago al retirar el pedido.
            </small>

          </div>

        </label>

        <label
          class="payment-option"
          :class="{ active: paymentMethod === 'transfer' }"
        >

          <input
            type="radio"
            value="transfer"
            v-model="paymentMethod"
          >

          <div>

            <strong>Transferencia</strong>

            <small>
              Recibirás los datos luego de confirmar.
            </small>

          </div>

        </label>

        <label
          class="payment-option"
          :class="{ active: paymentMethod === 'card' }"
        >

          <input
            type="radio"
            value="card"
            v-model="paymentMethod"
          >

          <div>

            <strong>Tarjeta</strong>

            <small>
              Pago presencial con tarjeta.
            </small>

          </div>

        </label>

        <p
          v-if="error"
          class="error-message"
        >
          {{ error }}
        </p>

        <button
          class="button button-primary button-full"
          type="submit"
          :disabled="submitting"
        >

          {{ submitting ? 'Confirmando...' : 'Confirmar pedido' }}

        </button>

      </form>

    </div>

  </div>
</template>

<style scoped>

.checkout-view {
  padding: var(--space-6) var(--space-4);
}

/* ==========================
   HEADER
========================== */

.page-header {
  margin-bottom: 2.5rem;
}


.page-header h1 {
  margin: 0;
  font-size: 2.4rem;
}



/* ==========================
   LAYOUT
========================== */

.checkout-layout {

  display: grid;

  grid-template-columns: minmax(0,1fr) 380px;

  gap: 2rem;

  align-items: start;

}

/* ==========================
   CARDS
========================== */

.summary-card,
.payment-card {

  background: var(--color-surface);

  border: 1px solid var(--color-line);

  border-radius: 24px;

  padding: 2rem;

  box-shadow: 0 12px 35px rgba(0,0,0,.05);

}

/* ==========================
   RESUMEN
========================== */

.card-header {

  display: flex;

  justify-content: space-between;

  align-items: center;

  margin-bottom: 1.8rem;

}

.card-header h2 {

  margin: 0;

  font-size: 1.45rem;

}

.card-header span {

  color: var(--color-ink-soft);

  font-size: .9rem;

}

.summary-list {

  display: flex;

  flex-direction: column;

  gap: 1rem;

}

.summary-item {

  display: flex;

  justify-content: space-between;

  align-items: center;

  padding-bottom: 1rem;

  border-bottom: 1px solid var(--color-line);

}

.summary-item:last-child {

  border-bottom: none;

}

.summary-info h3 {

  margin: 0;

  font-size: 1rem;

}

.summary-info p {

  margin-top: .35rem;

  color: var(--color-ink-soft);

  font-size: .88rem;

}

.summary-values {

  text-align: right;

}

.summary-qty {

  display: block;

  color: var(--color-ink-soft);

  margin-bottom: .4rem;

}

.summary-values strong {

  color: var(--color-rust);

  font-size: 1.05rem;

}

.summary-total {

  display: flex;

  justify-content: space-between;

  align-items: center;

  margin-top: 2rem;

  padding-top: 1.5rem;

  border-top: 2px solid var(--color-line);

  font-size: 1.3rem;

}

.summary-total strong {

  color: var(--color-rust);

  font-size: 1.9rem;

}

/* ==========================
   PAGO
========================== */

.payment-card h2 {

  margin-top: 0;

  margin-bottom: 1.5rem;

}

.payment-option {

  display: flex;

  gap: 1rem;

  align-items: center;

  padding: 1rem 1.2rem;

  margin-bottom: 1rem;

  border: 1px solid var(--color-line);

  border-radius: 18px;

  cursor: pointer;

  transition: .25s;

  background: white;

}

.payment-option:hover {

  border-color: var(--color-rust);

  transform: translateY(-2px);

}

.payment-option.active {

  border-color: var(--color-rust);

  background: rgba(180, 77, 53, .05);

}

.payment-option input {

  accent-color: var(--color-rust);

  transform: scale(1.15);

}

.payment-option strong {

  display: block;

  margin-bottom: .25rem;

}

.payment-option small {

  color: var(--color-ink-soft);

  line-height: 1.4;

}

/* ==========================
   BOTÓN
========================== */

.button-full {

  width: 100%;

  margin-top: 2rem;

  padding: 1rem;

  font-size: 1rem;

}

/* ==========================
   MENSAJES
========================== */

.error-message {

  margin-top: 1rem;

  padding: .9rem 1rem;

  background: #fdecec;

  color: #b42318;

  border-radius: 12px;

  border: 1px solid #f5c2c7;

}

/* ==========================
   CARRITO VACÍO
========================== */

.empty-card {

  background: white;

  border: 1px solid var(--color-line);

  border-radius: 24px;

  padding: 4rem 2rem;

  text-align: center;

  box-shadow: 0 10px 30px rgba(0,0,0,.05);

}

.empty-icon {

  font-size: 4rem;

  margin-bottom: 1rem;

}

.empty-card h2 {

  margin-bottom: .8rem;

}

.empty-card p {

  color: var(--color-ink-soft);

  margin-bottom: 2rem;

}

/* ==========================
   RESPONSIVE
========================== */

@media (max-width:900px){

  .checkout-layout{

    grid-template-columns:1fr;

  }

  .summary-card,
  .payment-card{

    padding:1.5rem;

  }

}

@media (max-width:600px){

  .card-header{

    flex-direction:column;

    align-items:flex-start;

    gap:.5rem;

  }

  .summary-item{

    flex-direction:column;

    align-items:flex-start;

    gap:.8rem;

  }

  .summary-values{

    width:100%;

    text-align:left;

  }

  .summary-total{

    font-size:1.1rem;

  }

  .summary-total strong{

    font-size:1.5rem;

  }

}

</style>