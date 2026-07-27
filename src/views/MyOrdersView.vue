<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import ordersService from '../services/orders.service';
import Pagination from '../components/Pagination.vue';

const route = useRoute();
const orders = ref([]);
const loading = ref(true);
const page = ref(1);
const totalPages = ref(1);

const STATUS_LABELS = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  in_preparation: 'En preparación',
  shipped: 'Enviado',
  delivered: 'Entregado',
};

async function load() {
  loading.value = true;
  const response = await ordersService.myOrders(page.value, 10);
  orders.value = response.data.data;
  totalPages.value = response.data.totalPages;
  loading.value = false;
}

function changePage(newPage) {
  page.value = newPage;
  load();
}

onMounted(load);
</script>

<template>
  <div class="container orders-view">
    <h1>Mis pedidos</h1>

    <p v-if="route.query.created" class="success-message">
      ¡Pedido {{ route.query.created }} confirmado con éxito!
    </p>

    <p v-if="loading" class="loading-state">Cargando pedidos...</p>

    <p v-else-if="orders.length === 0" class="empty-state">Todavía no hiciste ningún pedido.</p>

    <div v-else class="orders-list">
      <article v-for="order in orders" :key="order.id" class="order-card">
        <header class="order-card-header">
          <span class="order-number">{{ order.orderNumber }}</span>
          <span class="order-status" :class="`order-status-${order.status}`">
            {{ STATUS_LABELS[order.status] || order.status }}
          </span>
        </header>
        <ul>
          <li v-for="detail in order.details" :key="detail.id">
            {{ detail.quantity }} × {{ detail.product.name }}
          </li>
        </ul>
        <p class="order-total">Total $ {{ Number(order.total).toLocaleString('es-AR') }}</p>
      </article>
    </div>

    <Pagination :page="page" :total-pages="totalPages" @change-page="changePage" />
  </div>
</template>

<style scoped>
.orders-view {
  padding: var(--space-5) var(--space-4);
}
.orders-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.order-card {
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}
.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}
.order-number {
  font-family: var(--font-mono);
  font-weight: 600;
}
.order-status {
  font-family: var(--font-display);
  text-transform: uppercase;
  font-size: 0.75rem;
  padding: 3px 10px;
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  color: var(--color-ink-soft);
}
.order-status-delivered { background: #e2ede2; color: var(--color-success); }
.order-status-pending { background: #f5e6c3; color: #8a6a13; }
.order-card ul {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-2);
  font-size: 0.9rem;
  color: var(--color-ink-soft);
}
.order-total {
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--color-rust);
  margin: 0;
}


</style>
