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

function imageUrl(product) {
  if (!product?.imageUrl) return null;
  return `${import.meta.env.VITE_API_URL}${product.imageUrl}`;
}

onMounted(load);
</script>

<template>
  <div class="container admin-orders-view">

    <!-- ================= HEADER ================= -->
    <div class="orders-header">

      <div>
        <h1>
          Pedidos
        </h1>
      </div>

    </div>


    <!-- ================= LOADING ================= -->
    <p
      v-if="loading"
      class="loading-state"
    >
      Cargando pedidos...
    </p>


    <!-- ================= TABLA ================= -->
    <div
      v-else
      class="orders-table-wrapper"
    >

      <table class="admin-table">

        <thead>
          <tr>

            <th>
              N° orden
            </th>

            <th>
              Cliente
            </th>

            <th>
              Total
            </th>

            <th>
              Pago
            </th>

            <th>
              Estado
            </th>

            <th class="detail-column">
              Detalle
            </th>

          </tr>
        </thead>


        <tbody>

          <template
            v-for="order in orders"
            :key="order.id"
          >

            <!-- ================= PEDIDO ================= -->
            <tr class="order-row">

              <!-- Orden -->
              <td>

                <span class="order-number">
                  #{{ order.orderNumber }}
                </span>

              </td>


              <!-- Cliente -->
              <td>

                <div class="customer-cell">

                  <div class="customer-avatar">
                    {{ order.user?.name?.charAt(0)?.toUpperCase() || '?' }}
                  </div>

                  <div>

                    <strong class="customer-name">
                      {{ order.user?.name || 'Cliente' }}
                    </strong>

                    <span class="table-subtext">
                      {{ order.user?.email }}
                    </span>

                  </div>

                </div>

              </td>


              <!-- Total -->
              <td>

                <span class="order-total">
                  $ {{ Number(order.total).toLocaleString('es-AR') }}
                </span>

              </td>


              <!-- Pago -->
              <td>

                <span class="payment-badge">
                  {{ PAYMENT_LABELS[order.paymentMethod] || 'No especificado' }}
                </span>

              </td>


              <!-- Estado -->
              <td>

                <div
                  class="status-control"
                  :class="`status-${order.status}`"
                >

                  <select
                    :value="order.status"
                    @change="
                      changeStatus(
                        order,
                        $event.target.value
                      )
                    "
                  >

                    <option
                      v-for="status in STATUSES"
                      :key="status"
                      :value="status"
                    >
                      {{ STATUS_LABELS[status] }}
                    </option>

                  </select>

                </div>

              </td>


              <!-- Detalle -->
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


            <!-- ================= DETALLE ================= -->
            <tr
              v-if="expandedOrderId === order.id"
              class="detail-row"
            >

              <td colspan="6">

                <div class="detail-container">
  
                  <ul
                    v-if="order.details?.length"
                    class="detail-list"
                  >

                    <li
                      v-for="detail in order.details"
                      :key="detail.id"
                      class="detail-item"
                    >

                      <!-- Imagen -->
                      <div class="detail-image-wrapper">

                        <img
                          v-if="imageUrl(detail.product)"
                          :src="imageUrl(detail.product)"
                          :alt="detail.product?.name || 'Producto'"
                          class="detail-image"
                        />

                        <div
                          v-else
                          class="detail-image-placeholder"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path
                              d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Zm2 0v14h12V5H6Zm2 2h8v2H8V7Zm0 4h8v2H8v-2Zm0 4h5v2H8v-2Z"
                            />
                          </svg>
                        </div>

                      </div>


                      <!-- Información -->
                      <div class="detail-product">

                        <span class="detail-qty">
                          {{ detail.quantity }} ×
                        </span>

                        <div>

                          <strong class="detail-name">
                            {{
                              detail.product?.name ||
                              'Producto eliminado'
                            }}
                          </strong>

                          <span
                            v-if="detail.product?.code"
                            class="detail-code"
                          >
                            Código:
                            {{ detail.product.code }}
                          </span>

                        </div>

                      </div>


                      <!-- Subtotal -->
                      <div
                        v-if="lineSubtotal(detail) != null"
                        class="detail-price"
                      >
                        $
                        {{
                          lineSubtotal(detail)
                            .toLocaleString('es-AR')
                        }}
                      </div>

                    </li>

                  </ul>


                  <p
                    v-else
                    class="empty-detail"
                  >
                    Este pedido no tiene productos cargados.
                  </p>

                </div>

              </td>

            </tr>

          </template>

        </tbody>

      </table>

    </div>


    <!-- ================= PAGINACIÓN ================= -->
    <div class="pagination-wrapper">

      <Pagination
        :page="page"
        :total-pages="totalPages"
        @change-page="changePage"
      />

    </div>

  </div>
</template>

<style scoped>

/* =========================================================
   GENERAL
========================================================= */

.admin-orders-view {
  padding: 55px 0 80px;
}


/* =========================================================
   HEADER
========================================================= */

.orders-header {
  margin-bottom: 32px;
}

.orders-eyebrow {
  margin: 0 0 7px;

  color: var(--color-rust);

  font-family: var(--font-mono);

  font-size: 0.72rem;
  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: 0.14em;
}

.orders-header h1 {
  margin: 0;

  color: var(--color-ink);

  font-size: clamp(2.1rem, 4vw, 2.8rem);

  line-height: 1.05;
}

.orders-description {
  margin: 10px 0 0;

  color: var(--color-ink-soft);

  font-size: 0.95rem;

  line-height: 1.6;
}


/* =========================================================
   TABLA
========================================================= */

.orders-table-wrapper {
  width: 100%;

  overflow-x: auto;

  background: var(--color-surface);

  border: 1px solid var(--color-line);

  border-radius: 20px;

  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.06);
}

.admin-table {
  width: 100%;

  min-width: 950px;

  border-collapse: separate;

  border-spacing: 0;
}


/* =========================================================
   HEADER TABLA
========================================================= */

.admin-table th {
  padding: 16px 20px;

  text-align: left;

  background:
    rgba(0, 0, 0, 0.025);

  border-bottom: 1px solid var(--color-line);

  color: var(--color-ink-soft);

  font-family: var(--font-display);

  font-size: 0.72rem;
  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: 0.06em;

  white-space: nowrap;
}


/* =========================================================
   FILAS
========================================================= */

.admin-table td {
  padding: 17px 20px;

  border-bottom: 1px solid var(--color-line);

  vertical-align: middle;
}

.order-row {
  background: var(--color-surface);

  transition:
    background .2s ease;
}

.order-row:hover {
  background:
    rgba(48, 47, 47, 0.025);
}

.admin-table tbody tr:last-child td {
  border-bottom: none;
}


/* =========================================================
   ORDEN
========================================================= */

.order-number {
  display: inline-flex;

  padding: 6px 9px;

  border-radius: 8px;

 
  color: black;

  font-family: var(--font-mono);

  font-size: 0.82rem;

}


/* =========================================================
   CLIENTE
========================================================= */

.customer-cell {
  display: flex;

  align-items: center;

  gap: 12px;
}

.customer-avatar {
  width: 38px;
  height: 38px;

  flex: 0 0 38px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background:
    rgba(183, 53, 45, 0.10);

  color: var(--color-rust);

  font-size: 0.85rem;
  font-weight: 800;
}

.customer-name {
  display: block;

  color: var(--color-ink);

  font-size: 0.9rem;
}

.table-subtext {
  display: block;

  margin-top: 3px;

  color: var(--color-ink-soft);

  font-size: 0.78rem;
}


/* =========================================================
   TOTAL
========================================================= */

.order-total {
  color: var(--color-ink);

  font-family: var(--font-mono);

  font-size: 0.9rem;

  font-weight: 700;

  white-space: nowrap;
}


/* =========================================================
   PAGO
========================================================= */

.payment-badge {
  display: inline-flex;

  align-items: center;

  padding: 6px 10px;

  border-radius: 999px;

  background:
    rgba(0, 0, 0, 0.04);

  color: var(--color-ink-soft);

  font-size: 0.75rem;

  font-weight: 600;

  white-space: nowrap;
}


/* =========================================================
   ESTADO
========================================================= */

.status-control {
  position: relative;

  display: inline-flex;

  border-radius: 999px;

  padding: 2px;

  background: rgba(0, 0, 0, 0.05);
}

.status-control select {
  appearance: none;

  border: none;

  outline: none;

  padding: 7px 30px 7px 11px;

  border-radius: 999px;

  background: transparent;

  color: var(--color-ink);

  font-size: 0.78rem;

  cursor: pointer;
}

.status-control::after {
  content: "⌄";

  position: absolute;

  right: 10px;

  top: 50%;

  transform: translateY(-55%);

  pointer-events: none;

  color: currentColor;

  font-size: 0.8rem;
}


/* Colores por estado */

.status-pending {
  background: rgba(245, 158, 11, 0.14);
  color: #a16207;
}

.status-confirmed {
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
}

.status-in_preparation {
  background: rgba(124, 58, 237, 0.12);
  color: #6d28d9;
}

.status-shipped {
  background: rgba(14, 116, 144, 0.12);
  color: #0e7490;
}

.status-delivered {
  background: rgba(45, 151, 84, 0.13);
  color: #258148;
}


/* =========================================================
   DETALLE
========================================================= */

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
  font-weight: 700;

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
    rgba(183, 53, 45, 0.07);

  border-color:
    rgba(183, 53, 45, 0.20);

  color: var(--color-rust);

  transform: translateY(-1px);
}


/* =========================================================
   FILA DETALLE
========================================================= */

.detail-row td {
  padding: 0;

  background:
    rgba(0, 0, 0, 0.018);

  border-bottom: 1px solid var(--color-line);
}

.detail-container {
  padding: 25px 30px;
}

.detail-header {
  margin-bottom: 18px;
}

.detail-eyebrow {
  margin: 0 0 5px;

  color: var(--color-rust);

  font-family: var(--font-mono);

  font-size: 0.68rem;
  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: 0.12em;
}

.detail-header h3 {
  margin: 0;

  color: var(--color-ink);

  font-size: 1.1rem;
}


/* =========================================================
   LISTA PRODUCTOS
========================================================= */

.detail-list {
  display: flex;

  flex-direction: column;

  gap: 10px;

  margin: 0;
  padding: 0;

  list-style: none;
}

.detail-item {
  display: grid;

  grid-template-columns: 58px minmax(0, 1fr) auto;

  align-items: center;

  gap: 15px;

  padding: 12px;

  background: #fff;

  border: 1px solid var(--color-line);

  border-radius: 13px;
}

.detail-image-wrapper {
  width: 58px;
  height: 58px;
}

.detail-image,
.detail-image-placeholder {
  width: 100%;
  height: 100%;

  border-radius: 10px;
}

.detail-image {
  object-fit: cover;

  border: 1px solid var(--color-line);
}

.detail-image-placeholder {
  display: flex;

  align-items: center;
  justify-content: center;

  background:
    rgba(0, 0, 0, 0.04);

  color: var(--color-ink-soft);
}

.detail-image-placeholder svg {
  width: 22px;
  height: 22px;
}

.detail-product {
  display: flex;

  align-items: center;

  gap: 12px;

  min-width: 0;
}

.detail-qty {
  flex-shrink: 0;

  color: var(--color-rust);

  font-family: var(--font-mono);

  font-size: 0.78rem;

  font-weight: 700;
}

.detail-name {
  display: block;

  color: var(--color-ink);

  font-size: 0.87rem;
}

.detail-code {
  display: block;

  margin-top: 3px;

  color: var(--color-ink-soft);

  font-size: 0.75rem;
}

.detail-price {
  color: var(--color-ink);

  font-family: var(--font-mono);

  font-size: 0.85rem;

  font-weight: 700;

  white-space: nowrap;
}

.empty-detail {
  margin: 0;

  color: var(--color-ink-soft);

  font-size: 0.9rem;
}


/* =========================================================
   PAGINACIÓN
========================================================= */

.pagination-wrapper {
  display: flex;

  justify-content: center;

  margin-top: 35px;
}


/* =========================================================
   LOADING
========================================================= */

.loading-state {
  padding: 60px 0;

  text-align: center;

  color: var(--color-ink-soft);

  font-family: var(--font-mono);

  font-size: 0.85rem;
}


/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 900px) {

  .admin-orders-view {
    padding: 40px 20px 60px;
  }

  .orders-table-wrapper {
    border-radius: 16px;
  }

}

@media (max-width: 600px) {

  .admin-orders-view {
    padding: 30px 14px 50px;
  }

  .orders-header {
    margin-bottom: 25px;
  }

  .orders-header h1 {
    font-size: 2rem;
  }

  .orders-description {
    font-size: 0.88rem;
  }

  .detail-container {
    padding: 20px;
  }

  .detail-item {
    grid-template-columns: 50px minmax(0, 1fr);
  }

  .detail-image-wrapper {
    width: 50px;
    height: 50px;
  }

  .detail-price {
    grid-column: 2;
  }

}
</style>