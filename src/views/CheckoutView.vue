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
    <h1>Confirmar pedido</h1>

    <p v-if="cartStore.items.length === 0" class="empty-state">
      Tu carrito está vacío.
    </p>

    <div v-else class="checkout-layout">
      <div class="checkout-summary">
        <h2>Resumen del pedido</h2>
        <ul>
          <li v-for="item in cartStore.items" :key="item.id">
            {{ item.quantity }} × {{ item.product.name }}
            <span>$ {{ (Number(item.product.price) * item.quantity).toLocaleString('es-AR') }}</span>
          </li>
        </ul>
        <p class="checkout-total">Total <span>$ {{ cartStore.total.toLocaleString('es-AR') }}</span></p>
      </div>

      <form class="checkout-form" @submit.prevent="confirmOrder">
        <h2>Método de pago</h2>
        <label class="checkout-option">
          <input type="radio" value="cash" v-model="paymentMethod" />
          Efectivo
        </label>
        <label class="checkout-option">
          <input type="radio" value="transfer" v-model="paymentMethod" />
          Transferencia
        </label>
        <label class="checkout-option">
          <input type="radio" value="card" v-model="paymentMethod" />
          Tarjeta
        </label>

        <p v-if="error" class="error-message">{{ error }}</p>

        <button type="submit" class="button button-primary button-full" :disabled="submitting">
          {{ submitting ? 'Confirmando...' : 'Confirmar pedido' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.checkout-view {
  padding: var(--space-5) var(--space-4);
}
.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
}
@media (max-width: 760px) {
  .checkout-layout { grid-template-columns: 1fr; }
}
.checkout-summary, .checkout-form {
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}
.checkout-summary ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-size: 0.95rem;
}
.checkout-summary li {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px dashed var(--color-line);
  padding-bottom: var(--space-2);
}
.checkout-total {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 1.15rem;
  margin-top: var(--space-3);
  color: var(--color-rust);
}
.checkout-option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) 0;
  cursor: pointer;
}
.button-full { width: 100%; margin-top: var(--space-3); }
</style>
