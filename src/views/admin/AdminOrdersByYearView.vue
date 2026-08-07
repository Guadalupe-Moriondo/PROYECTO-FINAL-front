<script setup>
import { ref, onMounted } from 'vue';
import ordersService from '../../services/orders.service';
import Pagination from '../../components/Pagination.vue';

function currentYear() {
  return String(new Date().getFullYear());
}

const selectedYear = ref(currentYear());

const loading = ref(true);
const orders = ref([]);
const page = ref(1);
const totalPages = ref(1);
const yearStats = ref({ orders: 0, total: 0 });

const expandedOrderId = ref(null);

function toggleDetail(order) {
  expandedOrderId.value = expandedOrderId.value === order.id ? null : order.id;
}

function lineSubtotal(detail) {
  const unitPrice = detail.unitPrice ?? detail.product?.price;
  if (unitPrice == null) return null;
  return Number(unitPrice) * Number(detail.quantity);
}

async function load() {
  loading.value = true;
  try {
    const [statsResponse, historyResponse] = await Promise.all([
      ordersService.statistics(),
      ordersService.getHistory(page.value, 10, '', selectedYear.value),
    ]);

    const empty = { orders: 0, total: 0 };
    // Igual que en el mes: el total/cantidad sale del agregado del backend,
    // no de la pagina actual de "orders" (que puede ser solo una parte).
    yearStats.value = statsResponse.data.yearly?.[selectedYear.value] ?? empty;

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

onMounted(load);
</script>

<template>
  <div class="container admin-year-view">
    <div class="page-header">
      <h1>Pedidos por año</h1>
    </div>

    <div class="year-search">
      <label for="year-input">Año</label>
      <input
        id="year-input"
        type="number"
        v-model="selectedYear"
        min="2000"
        :max="new Date().getFullYear() + 1"
        step="1"
        @keyup.enter="search"
      />
      <button type="button" class="button" @click="search">Buscar</button>
    </div>

    <p v-if="loading" class="loading-state">Cargando...</p>

    <template v-else>
      <div class="statistics-grid">
        <div class="stat-card">
          <span class="stat-label">Pedidos de {{ selectedYear }}</span>
          <span class="stat-value">{{ yearStats.orders }}</span>
        </div>
        <div class="stat-card stat-card--accent">
          <span class="stat-label">Facturación de {{ selectedYear }}</span>
          <span class="stat-value">$ {{ Number(yearStats.total).toLocaleString('es-AR') }}</span>
        </div>
      </div>

      <div v-if="orders.length" class="table-wrapper">
        <table class="history-table">
          <thead>
            <tr>
              <th>N° orden</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="order in orders" :key="order.id">
              <tr>
                <td class="table-mono-ord">{{ order.orderNumber }}</td>
                <td>
                  {{ order.user?.name }}
                  <span class="table-subtext">{{ order.user?.email }}</span>
                </td>
                <td>{{ new Date(order.createdAt).toLocaleDateString('es-AR') }}</td>
                <td class="table-mono">$ {{ Number(order.total).toLocaleString('es-AR') }}</td>
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
                <td colspan="5">
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
      </div>

      <p v-else class="empty-state">No hay pedidos entregados en {{ selectedYear }}.</p>

      <Pagination :page="page" :total-pages="totalPages" @change-page="changePage" />
    </template>
  </div>
</template>

<style scoped>

.admin-year-view {
  padding: var(--space-5) var(--space-4);
}


/* Header */
.page-header {

  margin-bottom:var(--space-5);

}


.page-header h1 {

  font-size:2rem;

  font-weight:700;

  margin:0 0 .5rem;

}



.page-subtitle {

  margin:0;

  color:var(--color-ink-soft);

  font-size:.95rem;

}



/* Loading */
.loading-state {

  text-align:center;

  padding:2rem;

  color:var(--color-ink-soft);

}



/* Buscador año */
.year-search {

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



.year-search label {

  font-family:var(--font-display);

  text-transform:uppercase;

  font-size:.75rem;

  font-weight:600;

  color:var(--color-ink-soft);

}



.year-search input[type="number"] {

  width:120px;

  padding:.6rem 1rem;

  border-radius:10px;

  border:1px solid var(--color-line);

  font-family:var(--font-display);

}



/* Estadísticas */
.statistics-grid {

  display:grid;

  grid-template-columns:repeat(auto-fit,minmax(220px,1fr));

  gap:1rem;

  margin-bottom:var(--space-5);

}



.stat-card {

  background:var(--color-surface);

  border:1px solid var(--color-line);

  border-radius:16px;

  padding:1.5rem;


  display:flex;

  flex-direction:column;

  gap:.4rem;


  box-shadow:0 8px 25px rgba(0,0,0,.08);


  border-left:5px solid var(--color-steel);

}



.stat-card--accent {

  border-left-color:var(--color-rust);

}



.stat-label {

  font-family:var(--font-display);

  text-transform:uppercase;

  font-size:.75rem;

  letter-spacing:.05em;

  color:var(--color-ink-soft);

}



.stat-value {

  font-family:var(--font-display);

  font-size:1.8rem;

  font-weight:700;

  color:var(--color-ink);

}



.stat-card--accent .stat-value {

  color:var(--color-rust);

}



/* Tabla */
.table-wrapper {

  background:var(--color-surface);

  border:1px solid var(--color-line);

  border-radius:16px;

  overflow:hidden;

  box-shadow:0 8px 25px rgba(0,0,0,.08);

}



.history-table {

  width:100%;

  border-collapse:separate;

  border-spacing:0;

}



.history-table th {

  text-align:left;

  padding:1rem 1.2rem;


  background:rgba(0,0,0,.03);


  font-family:var(--font-display);

  text-transform:uppercase;

  font-size:.75rem;

  color:var(--color-ink-soft);


  white-space:nowrap;

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



/* Textos */
.table-mono {

  font-family:var(--font-display);

  font-weight: 600;

  

}

.table-mono-ord {

  font-family:var(--font-mono);

  font-weight: 600;
}




.table-subtext {

  display:block;

  margin-top:.25rem;

  font-size:.85rem;

  color:var(--color-ink-soft);

}



/* Botón detalle */
.detail-column {
  text-align: right;
}

.detail-toggle {
  display: inline-flex;

  align-items: center;
  justify-content: center;

  gap: 7px;

  padding: 8px 12px;

  border: 1px solid var(--color-line);

  border-radius: 9px;

  background: var(--color-surface);

  color: var(--color-ink);

  font-size: 0.78rem;
 

  cursor: pointer;

  transition:
    background .2s ease,
    border-color .2s ease,
    color .2s ease,
    transform .2s ease;
}

.detail-toggle svg {
  width: 16px;
  height: 16px;
}

.detail-toggle:hover {
  background:
    rgba(107, 107, 107, 0.07);

  border-color:
    rgba(95, 95, 95, 0.2);

  color: rgb(63, 63, 63);

  transform: translateY(-1px);
}



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



.detail-qty {

  font-family:var(--font-mono);

  color:var(--color-steel);

  font-weight:700;

}



.detail-name {

  color:var(--color-ink);

}



.detail-subtotal {

  margin-left:auto;

  font-family:var(--font-display);

  color:var(--color-ink-soft);

  font-weight:600;

}



/* Sin resultados */
.empty-state {

  text-align:center;

  padding:3rem;

  color:var(--color-ink-soft);

  font-style:italic;

}



/* Responsive */
@media(max-width:900px){

  .year-search {

    flex-direction:column;

    align-items:flex-start;

  }


  .table-wrapper {

    overflow-x:auto;

  }

}

</style>