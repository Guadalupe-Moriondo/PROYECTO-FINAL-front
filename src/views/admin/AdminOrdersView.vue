<script setup>
import { ref, onMounted } from 'vue';
import ordersService from '../../services/orders.service';
import { useBusiness } from '../../composables/useBusiness';
import Pagination from '../../components/Pagination.vue';
import { useOrderNotificationsStore } from '../../stores/orderNotifications';

const orders = ref([]);
const loading = ref(true);
const page = ref(1);
const totalPages = ref(1);
const successMessage = ref('');
let successTimeout = null;

const { business, loadBusiness } = useBusiness();

const STATUSES = ['pending', 'confirmed', 'in_preparation', 'withdraw', 'delivered'];
const STATUS_LABELS = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  in_preparation: 'En preparación',
  withdraw: 'Retirar',
  delivered: 'Entregado',
};

const PAYMENT_LABELS = {
  cash: 'Efectivo',
  transfer: 'Transferencia ',
  card: 'Tarjeta',
};

const orderNotificationsStore = useOrderNotificationsStore();

function canNotify(order) {
  return order.status === 'withdraw';
}

function canChangeTo(order, status) {
  const nextStatus = {
    pending: 'confirmed',
    confirmed: 'in_preparation',
    in_preparation: 'withdraw',
    withdraw: 'delivered',
  };

  if (status === order.status) {
    return true;
  }

  if (status === 'delivered' && !order.customerNotified) {
    return false;
  }

  return nextStatus[order.status] === status;
}

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
  try {
    await ordersService.updateStatus(order.id, newStatus);

    order.status = newStatus;

    // Mostrar mensaje cuando el pedido fue entregado
    if (newStatus === 'delivered') {
      successMessage.value = `Pedido #${order.orderNumber} entregado correctamente`;

      if (successTimeout) {
        clearTimeout(successTimeout);
      }

      successTimeout = setTimeout(() => {
        successMessage.value = '';
      }, 3000);

      orders.value = orders.value.filter(
        (o) => o.id !== order.id
      );

      if (expandedOrderId.value === order.id) {
        expandedOrderId.value = null;
      }
    }

  } catch (error) {
    console.error('Error al cambiar el estado:', error);

    alert(
      error.response?.data?.message ||
      'No se pudo cambiar el estado del pedido.'
    );

    // Volvemos a dejar el select en el estado real
    await load();
  }
}

// Fila expandida: guarda el id del pedido abierto (uno solo a la vez)
const expandedOrderId = ref(null);

function toggleDetail(order) {
  expandedOrderId.value = expandedOrderId.value === order.id ? null : order.id;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('es-AR');
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function lineSubtotal(detail) {
  const unitPrice = detail.unitPrice ?? detail.product?.price;
  if (unitPrice == null) return null;
  return Number(unitPrice) * Number(detail.quantity);
}

async function sendWhatsapp(order) {
  if (!order.user?.phone) {
    alert('Este cliente no tiene un teléfono cargado.');
    return;
  }

  const phone = order.user.phone.replace(/\D/g, '');

  const text = encodeURIComponent(
    `¡Hola ${order.user.name}!

    Te avisamos que tu pedido 
    #${order.orderNumber} 
    ya está preparado y listo para retirar.

    📍 Dirección: ${business.value.address || 'Consultar ubicación.'}

    🕒 Horarios: ${business.value.hours || 'Consultar horarios.'}

    Muchas gracias por confiar en 
    DM Repuestos Agrícolas.

    ¡Te esperamos!`
  );

  window.open(
    `https://wa.me/${phone}?text=${text}`,
    '_blank'
  );

  await ordersService.notifyCustomer(
    order.id,
    'whatsapp'
  );

  order.customerNotified = true;
  order.notificationMethod = 'whatsapp';
  order.customerNotifiedAt = new Date();
}

function imageUrl(product) {
  if (!product?.imageUrl) return null;
  return `${import.meta.env.VITE_API_URL}${product.imageUrl}`;
}

onMounted(async () => {
  await load();
  await loadBusiness();
  orderNotificationsStore.markAsSeen();
});
</script>

<template>
  <div class="container admin-orders-view">
    <Transition name="success-toast">
      <div
        v-if="successMessage"
        class="success-toast"
      >
        <div class="success-toast-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path
              d="M5 12.5l4 4L19 7"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <div class="success-toast-content">
          <strong>¡Entregado correctamente!</strong>
          <span>{{ successMessage }}</span>
        </div>
      </div>
    </Transition>
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
      <table class="admin-table admin-table--detailed">

        <thead>
          <tr>

            <th>
              N° orden
            </th>

            <th>
              Cliente
            </th>

            <th>
              Fecha
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
                    <svg
                      viewBox="0 0 24 24 "
                      fill="none"
                      stroke="currentColor"
                      
                    >
                      <path d="M20 21a8 8 0 0 0-16 0"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>

                  <div>

                    <strong class="customer-name">
                      {{ order.user?.name || 'Cliente' }}
                    </strong>

                    <span class="table-subtext">
                      {{ order.user?.email }}
                    </span>

                    <span class="table-subtext">
                      {{ order.user?.phone }}
                    </span>

                  </div>
                </div>
              </td>
              <!-- Fecha -->
              <td class="date-cell">
                <div class="date-content">

                  <span class="date">
                  {{ formatDate(order.createdAt) }}
                  </span>

                  <span class="time">
                    {{ formatTime(order.createdAt) }}
                  </span>

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
              <td class="notification-cell">
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
                      :disabled="!canChangeTo(order, status)"
                    >
                      {{ STATUS_LABELS[status] }}
                    </option>

                  </select>
                </div>

                <div v-if="canNotify(order)" class="notification-actions">
                  <div v-if="!order.customerNotified" class="notify-buttons">

                    <button
                      class="notify-icon whatsapp"
                      @click="sendWhatsapp(order)"
                      title="Avisar por Whatsapp"
                    >
                      <svg
                         viewBox="0 0 24 24"
                        fill="currentColor"
                       >
                         <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8 1-.2.2-.3.2-.5.1-1.4-.7-2.3-1.3-3.2-2.9-.2-.4.2-.4.6-1.2.1-.2 0-.4 0-.5-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-1 1-1 2.3 0 1.4 1 2.7 1.1 2.9.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/>
                      </svg>
                      <span>Notificar</span>
                    </button>

                  </div>
                  <div v-else class="notification-success">
                    <strong>
                      ✔ Cliente notificado
                    </strong>
                  </div>                   
                </div>
              </td>
              <!-- Detalle -->
              <td class="detail-column">
                <div class="actions-column">
                  <!-- Ver detalle -->
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
                </div>
              </td>
            </tr>
            <!-- ================= DETALLE ================= -->
            <tr
              v-if="expandedOrderId === order.id"
              class="detail-row"
            >
              <td colspan="7">
                <div class="detail-container">
  
                  <ul
                    v-if="order.details?.length"
                    class="detail-list detail-list--admin"
                  >
                    <li
                      v-for="detail in order.details"
                      :key="detail.id"
                      class="detail-item"
                    >
                      <div class="detail-image-wrapper detail-image-wrapper--admin">

                        <img
                          v-if="imageUrl(detail.product)"
                          :src="imageUrl(detail.product)"
                          :alt="detail.product?.name || 'Producto'"
                          class="detail-image detail-image--admin"
                        />

                        <div
                          v-else
                          class="detail-image-placeholder detail-image-placeholder--admin"
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

                        <span class="detail-qty detail-qty--admin">
                          {{ detail.quantity }} ×
                        </span>

                        <div>
                          <strong class="detail-name detail-name--admin">
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
                        class="detail-price detail-price--admin"
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

    <Pagination :page="page" :total-pages="totalPages" @change-page="changePage"/>
      
  </div>
</template>


<style scoped>
.admin-orders-view {
  padding: 55px 0 80px;
}

.orders-table-wrapper {
  width: 100%;
  overflow-x: auto;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: 20px;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.06);
}

.admin-table--detailed {
  min-width: 950px;
}
.admin-table--detailed th {
  white-space: nowrap;
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

.order-number {
  display: inline-flex;
  padding: 6px 9px;
  border-radius: 8px;
  color: black;
  font-family: var(--font-mono);
  font-size: 0.82rem;
}

.customer-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.customer-avatar {
  width:38px;
  height:38px;
  border-radius:50%;
  display:flex;
  align-items:center;
  justify-content:center;
  background:var(--color-bg);
  border:1px solid var(--color-line);
  flex-shrink:0;
}

.customer-avatar svg{
  width:30px;
  height:30px;
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

.date-cell {
  vertical-align: middle;
  text-align: center;
  white-space: nowrap;
}

.date-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.date {
  font-size: 0.9rem;
  color: #374151;
}

.time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.order-total {
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: 0.9rem;
  font-weight: 600;
  background-color: #c6e6d0;
  border:6px solid #c6e6d0;
  border-radius: 50px;
  white-space: nowrap;
}

.payment-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background:
    rgba(0, 0, 0, 0.04);

  color: var(--color-ink-soft);
  font-size: 0.75rem;
  white-space: nowrap;
}

.status-control {
  position: relative;
  display: flex;
  width: 130px;
  border-radius: 999px;
  padding: 2px;
  background: rgba(0, 0, 0, 0.05);
  transform: none !important;
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

.status-withdraw {
  background: rgba(14, 116, 144, 0.12);
  color: #0e7490;
  transform: none !important;
}

.status-delivered {
  background: rgba(45, 151, 84, 0.13);
  color: #258148;
}

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

.detail-product {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.detail-code {
  display: block;
  margin-top: 3px;
  color: var(--color-ink-soft);
  font-size: 0.75rem;
  font-family: var(--font-mono);
}

.empty-detail {
  margin: 0;
  color: var(--color-ink-soft);
  font-size: 0.9rem;
}

.actions-column{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:10px;
}
.notification-cell {
  vertical-align: middle;
  white-space: nowrap;
}

.notification-actions {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.notify-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0;
}

.notify-icons {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 14px;
  justify-content: center;
  align-items: center;
  
}
.notify-icon {
  width: 100px;
  height: 34px;
  border: none;
  border-radius: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: .5s;
  color: white;
  box-sizing: border-box;
}

.notify-icon span {
  font-size: 0.78rem;
  font-weight: 500;
}

.notify-icon svg{
  width:17px;
  height:17px;
    
}

.notify-icon.whatsapp{
  background:#33ad60;
    
}

.notify-icon:hover{
  transform:translateY(-2px) scale(1.08);
}

.notification-success{
  margin-top:10px;
  padding:8px;
  border-radius:8px;
  background:#e8f7ec;
  border:1px solid #b8dfc4;
  color:#207a3c;
  display:flex;
  flex-direction:column;
  gap:4px;
}

.notification-success strong{
  font-size:.8rem;
}

.notification-success small{
  color:#4d6655;
  font-size:.8rem;
}

.success-toast {
  position: fixed;
  top: 30px;
  right: 30px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 300px;
  max-width: 380px;
  padding: 14px 18px;
  background: #ffffff;
  border: 1px solid #b8dfc4;
  border-radius: 14px;
  box-shadow:
    0 12px 35px rgba(0, 0, 0, 0.12);

  color: #207a3c;
}

.success-toast-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e8f7ec;
}

.success-toast-icon svg {
  width: 20px;
  height: 20px;
}

.success-toast-content {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.success-toast-content strong {
  font-size: 0.88rem;
  font-weight: 700;
}

.success-toast-content span {
  color: #4d6655;
  font-size: 0.78rem;
}

.success-toast-enter-active,
.success-toast-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.success-toast-enter-from,
.success-toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width:900px){

  .order-actions{
    flex-direction:column;
  }

  .action-btn{
    width:100%;
    justify-content:center;
  }

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

  .success-toast {
    top: 20px;
    right: 15px;
    left: 15px;

    min-width: auto;
    max-width: none;
  }

}
</style>