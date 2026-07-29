<script setup>
import { ref, onMounted } from 'vue';
import ordersService from '../../services/orders.service';
import Pagination from '../../components/Pagination.vue';

const orders = ref([]);
const loading = ref(true);
const page = ref(1);
const totalPages = ref(1);

const STATUSES = ['pending', 'confirmed', 'in_preparation', 'shipped', 'delivered'];
const STATUS_LABELS = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  in_preparation: 'En preparación',
  shipped: 'Enviado',
  delivered: 'Entregado',
};

const PAYMENT_LABELS = {
  cash: 'Efectivo',
  transfer: 'Transferencia ',
  card: 'Tarjeta',
};

async function load() {
  loading.value = true;
  const response = await ordersService.listAll(page.value, 10);
  orders.value = response.data.data;
  totalPages.value = response.data.totalPages;
  loading.value = false;
}

function changePage(newPage) {
  page.value = newPage;
  load();
}

async function changeStatus(order, newStatus) {
  await ordersService.updateStatus(order.id, newStatus);
  order.status = newStatus;

  // Un pedido "Entregado" pasa a vivir en el Historial (ver Estadísticas):
  // lo sacamos de esta lista al instante, sin esperar a recargar la página.
  if (newStatus === 'delivered') {
    orders.value = orders.value.filter((o) => o.id !== order.id);
    if (expandedOrderId.value === order.id) {
      expandedOrderId.value = null;
    }
  }
}

// Fila expandida: guarda el id del pedido abierto (uno solo a la vez)
const expandedOrderId = ref(null);

function toggleDetail(order) {
  expandedOrderId.value = expandedOrderId.value === order.id ? null : order.id;
}

function lineSubtotal(detail) {
  const unitPrice = detail.unitPrice ?? detail.product?.price;
  if (unitPrice == null) return null;
  return Number(unitPrice) * Number(detail.quantity);
}

onMounted(load);
</script>

<template>
  <div class="container admin-orders-view">
    <h1>Pedidos</h1>

    <p v-if="loading" class="loading-state">Cargando...</p>
    
    <table v-else class="admin-table">
      <thead>
        <tr><th>N° orden</th><th>Cliente</th><th>Total</th><th>Pago</th><th>Estado</th><th>Detalle</th></tr>
      </thead>
      <tbody>
        <template v-for="order in orders" :key="order.id">
          <tr>
            <td class="table-mono">{{ order.orderNumber }}</td>
            <td>{{ order.user?.name }} <span class="table-subtext">{{ order.user?.email }}</span></td>
            <td class="table-mono">$ {{ Number(order.total).toLocaleString('es-AR') }}</td>
            <td>{{ PAYMENT_LABELS[order.paymentMethod] || 'No especificado' }}</td>
            <td>
              <select :value="order.status" @change="changeStatus(order, $event.target.value)">
                <option v-for="status in STATUSES" :key="status" :value="status">
                  {{ STATUS_LABELS[status] }}
                </option>
              </select>
            </td>
            <td>
              <button type="button" class="detail-toggle" @click="toggleDetail(order)">
                {{ expandedOrderId === order.id ? 'Ocultar' : 'Ver detalle' }}
              </button>
            </td>
          </tr>
          <tr v-if="expandedOrderId === order.id" class="detail-row">
            <td colspan="6">
              <ul v-if="order.details?.length" class="detail-list">
                <li v-for="detail in order.details" :key="detail.id">
                  <span class="detail-qty">{{ detail.quantity }} ×</span>
                  <span class="detail-name">{{ detail.product?.name || 'Producto eliminado' }}</span>
                  <span v-if="detail.product?.code" class="table-subtext">({{ detail.product.code }})</span>
                  <span v-if="lineSubtotal(detail) != null" class="detail-subtotal">
                    $ {{ lineSubtotal(detail).toLocaleString('es-AR') }}
                  </span>
                </li>
              </ul>
              <p v-else class="table-subtext">Este pedido no tiene productos cargados.</p>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <Pagination :page="page" :total-pages="totalPages" @change-page="changePage" />
  </div>
</template>

<style scoped>

.admin-orders-view {
  padding: var(--space-5) var(--space-4);
}


/* Header */
.admin-orders-view h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: var(--space-5);
}



/* Tabla */
.admin-table {

  width:100%;

  border-collapse:separate;

  border-spacing:0;

  overflow:hidden;

  background:var(--color-surface);

  border:1px solid var(--color-line);

  border-radius:16px;

  box-shadow:0 8px 25px rgba(0,0,0,.08);

}



.admin-table th {

  text-align:left;

  padding:1rem 1.2rem;

  background:rgba(0,0,0,.03);

  font-family:var(--font-display);

  text-transform:uppercase;

  font-size:.75rem;

  color:var(--color-ink-soft);

}



.admin-table td {

  padding:1rem 1.2rem;

  border-top:1px solid var(--color-line);

  vertical-align:middle;

}



/* Hover */
.admin-table tbody tr {

  transition:.2s ease;

}


.admin-table tbody tr:hover {

  background:rgba(0,0,0,.025);

}



/* Texto */
.table-mono {

  font-family:var(--font-mono);

  font-weight:600;

}


.table-subtext {

  display:block;

  margin-top:.25rem;

  font-size:.85rem;

  color:var(--color-ink-soft);

}



/* Botón ver detalle */
.detail-toggle {

  height:36px;

  display:inline-flex;

  align-items:center;

  justify-content:center;

  padding:0 .9rem;


  border:none;

  border-radius:8px;


  background:#2563eb;

  color:white;


  font-size:.85rem;

 


  cursor:pointer;

  transition:.2s;

}



.detail-toggle:hover {

  background:#1d4ed8;

  transform:translateY(-1px);

}



/* Fila detalle */
.detail-row td {

  background:rgba(0,0,0,.025);

  padding:1.2rem;

}



/* Lista productos */
.detail-list {

  list-style:none;

  margin:0;

  padding:0;


  display:flex;

  flex-direction:column;

  gap:.8rem;

}



.detail-list li {

  display:flex;

  align-items:center;

  gap:1rem;

  font-size:.9rem;

}



/* Cantidad */
.detail-qty {

  font-family:var(--font-mono);

  color:var(--color-steel);

  font-weight:700;

}



/* Nombre */
.detail-name {

  color:var(--color-ink);

  font-weight:500;

}



/* Subtotal */
.detail-subtotal {

  margin-left:auto;

  font-family:var(--font-mono);

  font-weight:600;

  color:var(--color-ink-soft);

}



/* Imagen producto */
.detail-item {

  display:flex;

  align-items:center;

  gap:12px;

}



.detail-image {

  width:60px;

  height:60px;

  object-fit:cover;

  border-radius:12px;

  border:1px solid var(--color-line);

}



/* Loading */
.loading-state {

  text-align:center;

  padding:2rem;

  color:var(--color-ink-soft);

}



/* Responsive */
@media(max-width:900px){

  .admin-table {

    display:block;

    overflow-x:auto;

  }

}

</style>