<script setup>
import { ref, onMounted } from 'vue';
import ordersService from '../../services/orders.service';
import Pagination from '../../components/Pagination.vue';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const selectedMonth = ref(currentMonthKey());

const loading = ref(true);
const orders = ref([]);
const page = ref(1);
const totalPages = ref(1);
const monthStats = ref({ orders: 0, total: 0 });
const expandedOrderId = ref(null);

async function load() {
  loading.value = true;
  try {
    const [statsResponse, historyResponse] = await Promise.all([
      ordersService.statistics(),
      ordersService.getHistory(page.value, 10, selectedMonth.value),
    ]);

    const empty = { orders: 0, total: 0 };
    // El total/cantidad del mes sale del agregado del backend (statsResponse),
    // no de la pagina actual de "orders" — asi es correcto aunque haya
    // mas de una pagina de resultados para ese mes.
    monthStats.value = statsResponse.data.monthly?.[selectedMonth.value] ?? empty;

    orders.value = historyResponse.data.data;
    totalPages.value = historyResponse.data.totalPages;
  } finally {
    loading.value = false;
  }
}

function search() {
  page.value = 1;
  expandedOrderId.value = null;
  load();
}

function changePage(newPage) {
  page.value = newPage;
  load();
}

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key) {
  if (!key) return '';
  const [year, month] = key.split('-');
  return `${MONTH_NAMES[Number(month) - 1]} ${year}`;
}

function lineSubtotal(detail) {
  const unitPrice = detail.unitPrice ?? detail.product?.price;
  if (unitPrice == null) return null;
  return Number(unitPrice) * Number(detail.quantity);
}

function toggleDetail(order) {
  expandedOrderId.value = expandedOrderId.value === order.id ? null : order.id;
}

function imageUrl(product) {
  if (!product?.imageUrl) return null;
  return `${import.meta.env.VITE_API_URL}${product.imageUrl}`;
}

onMounted(load);
</script>

<template>
  <div class="container admin-month-view">
    <div class="page-header">
      <h1>Pedidos por mes</h1>
    </div>

    <div class="month-search">
      <label for="month-input">Mes</label>
      <input id="month-input" type="month" v-model="selectedMonth" @change="search" />
      <button type="button" class="button button-primary" @click="search">Buscar</button>
    </div>

    <p v-if="loading" class="loading-state">Cargando...</p>

    <template v-else>
      <div class="statistics-grid statistics-grid--period">
        <div class="stat-card--period">
          <span class="stat-label stat-label--period">Pedidos de {{ monthLabel(selectedMonth) }}</span>
          <span class="stat-value stat-value--period">{{ monthStats.orders }}</span>
        </div>
        <div class="stat-card--period stat-card--accent">
          <span class="stat-label stat-label--period">Facturación de {{ monthLabel(selectedMonth) }}</span>
          <span class="stat-value stat-value--period">$ {{ Number(monthStats.total).toLocaleString('es-AR') }}</span>
        </div>
      </div>

      <div v-if="orders.length" class="table-wrapper table-wrapper--period">
        <table class="history-table">
          <thead>
            <tr>
              <th>N° orden</th>
              <th>Cliente</th>
              <th>Fecha pedido</th>
              <th>Fecha entrega</th>
              <th>Total</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="order in orders" :key="order.id">
              <tr>
                <td class="table-mono-ord table-mono-ord--period">{{ order.orderNumber }}</td>
                <td>
                  {{ order.user?.name }}
                  <span class="table-subtext table-subtext--period">{{ order.user?.email }}</span>
                </td>
                <td>{{ new Date(order.createdAt).toLocaleDateString('es-AR') }}</td>
                <td>{{ order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString('es-AR') : '—'}}</td>
                <td class="table-mono table-mono--period">$ {{ Number(order.total).toLocaleString('es-AR') }}</td>
                <td class="detail-column">
                  <button
                  type="button"
                  class="detail-toggle"
                  @click="toggleDetail(order)"
                >

                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0Zm8-4.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Zm-1 4h2v5h-2v-5Z"
                    />
                  </svg>

                  <span>
                    {{ expandedOrderId === order.id
                      ? 'Ocultar'
                      : 'Ver detalle'
                    }}
                  </span>

                </button>
                </td>
              </tr>
              <tr v-if="expandedOrderId === order.id" class="detail-row">
                <td colspan="6">
                  <ul v-if="order.details?.length" class="detail-list detail-list--period">
                    <li v-for="detail in order.details" :key="detail.id">
                      <div class="detail-image-wrapper detail-image-wrapper--admin">
                        <img 
                          v-if="imageUrl(detail.product)"
                          :src="imageUrl(detail.product)"
                          :alt="detail.product?.name || 'Producto'"
                          class="detail-image detail-image--admin"
                        />
                      </div>
                      <span class="detail-qty detail-qty--period">{{ detail.quantity }} ×</span>
                      <div>
                        <span class="detail-name detail-name--period">{{ detail.product?.name || 'Producto eliminado' }}</span>
                        <span v-if="detail.product?.code" class="detail-code"> Código: {{ detail.product.code }}</span>
                      </div>
                      <span v-if="lineSubtotal(detail) != null" class="detail-subtotal">
                        $ {{ lineSubtotal(detail).toLocaleString('es-AR') }}
                      </span>
                    </li>
                  </ul>
                  <p v-else class="table-subtext table-subtext--period">Este pedido no tiene productos cargados.</p>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <p v-else class="empty-state">No hay pedidos entregados en {{ monthLabel(selectedMonth) }}.</p>

      <Pagination :page="page" :total-pages="totalPages" @change-page="changePage" />

    </template>
  </div>
</template>


<style scoped>
.admin-month-view {
  padding: var(--space-5) var(--space-4);
}

.page-header h1 {
  font-size:2rem;
  font-weight:700;
  margin:0 0 .5rem;
}

.month-search {
  display:flex;
  align-items:center;
  gap:1rem;
  margin-bottom:var(--space-5);
  background:var(--color-surface);
  border:1px solid var(--color-line);
  border-radius:16px;
  padding:1rem 1.2rem;
  box-shadow:0 8px 25px rgba(0,0,0,.08);
}

.month-search label {
  font-family:var(--font-display);
  text-transform:uppercase;
  font-size:.75rem;
  font-weight:600;
  color:var(--color-ink-soft);
}

.month-search input[type="month"] {
  padding:.6rem 1rem;
  border-radius:10px;
  border:1px solid var(--color-line);
  font-family:var(--font-display);
}

.history-table {
  width:100%;
  border-collapse:separate;
  border-spacing:0;
}

.history-table th {
  text-align: left;
  padding: 1rem 1.2rem;
  background: rgba(0,0,0,.03);
  font-family: var(--font-display);
  text-transform: uppercase;
  font-size: .75rem;
  color: var(--color-ink-soft);
}

.history-table th:nth-child(3),
.history-table td:nth-child(3),
.history-table th:nth-child(4),
.history-table td:nth-child(4),
.history-table th:nth-child(5),
.history-table td:nth-child(5),
.history-table th:nth-child(6),
.history-table td:nth-child(6){
  text-align: center;
}

.detail-toggle {
  margin: 0 auto;
}

.history-table td {
  padding:1rem 1.2rem;
  border-top:1px solid var(--color-line);
}

.history-table tbody tr {
  transition:.2s;
}

.history-table tbody tr:hover {
  background:rgba(0,0,0,.025);
}

.button-primary {
  background: rgb(172, 37, 37);
  color: white;
  border: none;
  border-radius: 12px;
  padding: .70rem 1.0rem;
  font-size: .85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all .2s ease;
  box-shadow: 0 6px 16px rgba(0,0,0,.12);
}

.detail-code {
  display: block;
  margin-top: 3px;
  color: var(--color-ink-soft);
  font-size: 0.75rem;
  font-family: var(--font-mono);
}

@media(max-width:900px){

  .table-wrapper {

    overflow-x:auto;

  }

}
</style>