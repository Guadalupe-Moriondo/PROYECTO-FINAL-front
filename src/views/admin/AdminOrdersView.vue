<script setup>
import { ref, onMounted } from 'vue';
import ordersService from '../../services/orders.service';
import { useBusiness } from '../../composables/useBusiness';
import Pagination from '../../components/Pagination.vue';
import { useOrderNotificationsStore } from '../../stores/orderNotifications';

const STATUSES = [
  'pending', 
  'confirmed', 
  'in_preparation', 
  'withdraw', 
  'delivered'
];

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

const orders = ref([]);
const loading = ref(true);
const search = ref('');
let searchTimeout = null;
const orderToCancel = ref(null);
const cancelReasonText = ref('');
const cancelling = ref(false);
const page = ref(1);
const totalPages = ref(1);
const message = ref('');
let messageTimeout = null;
const cancelMessage = ref('');
let cancelTimeout = null;
const error = ref('');
let errorTimeout = null;
const expandedOrderId = ref(null);
const viewMode = ref('active');
const { business, loadBusiness } = useBusiness();
const orderNotificationsStore = useOrderNotificationsStore();


async function load() {

  loading.value = true;

  try {
    let response;

    if (viewMode.value === 'cancelled') {
      response = search.value.trim()
        ? await ordersService.search({
            search: search.value.trim(),
            status: 'cancelled',
            page: page.value,
            limit: 5,
          })
        : await ordersService.listCancelled(page.value, 5);
    } else if (search.value.trim()) {
      response = await ordersService.search({
        search: search.value.trim(),
        page: page.value,
        limit: 5,
      });
    } else {
      response = await ordersService.listAll(page.value, 5);
    }

    orders.value = response.data.data;
    totalPages.value = response.data.totalPages;

  } catch (e) {
    console.error('Error cargando pedidos:', e);

    orders.value = [];
    totalPages.value = 1;

    showError('No se pudieron cargar los pedidos');

  } finally {
    loading.value = false;
  }
}

function changePage(newPage) {
  page.value = newPage;
  load();
}

function handleSearch() {
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    page.value = 1;
    load();
  }, 400);
}

function clearSearch() {
  search.value = '';
  page.value = 1;
  load();
}

async function changeStatus(order, newStatus) {
  try {
    await ordersService.updateStatus(order.id, newStatus);

    order.status = newStatus;

    if (newStatus === 'delivered') {
      showMessage(`Pedido #${order.orderNumber} entregado correctamente`);

      orders.value = orders.value.filter(
        (o) => o.id !== order.id
      );

      if (expandedOrderId.value === order.id) {
        expandedOrderId.value = null;
      }
    }
  } catch (error) {
    console.error('Error al cambiar el estado:', error);

    showError(
      error.response?.data?.message ||
      'No se pudo cambiar el estado del pedido.'
    );

    await load();
  }
}

function askCancel(order) {
  orderToCancel.value = order;
  cancelReasonText.value = '';
}

function closeCancelCard() {
  orderToCancel.value = null;
  cancelReasonText.value = '';
}

function dismissCancel() {
  if (cancelling.value) return;
  closeCancelCard();
}

async function confirmCancel() {

  const order = orderToCancel.value;
  if (!order) return;

  cancelling.value = true;

  try {
    await ordersService.cancel(
      order.id,
      cancelReasonText.value.trim() || undefined
    );

    showCancelMessage(`Pedido #${order.orderNumber} · El stock se reincorporó.`);

    orders.value = orders.value.filter((o) => o.id !== order.id);

    if (expandedOrderId.value === order.id) {
      expandedOrderId.value = null;
    }

    closeCancelCard();
  } catch (e) {
    closeCancelCard();
    showError(e.response?.data?.message || 'No se pudo cancelar el pedido.');
    await load();
  } finally {
    cancelling.value = false;
  }
}

async function sendWhatsapp(order) {
  const phone = (order.user?.phone || '').replace(/\D/g, '');
  if (!phone) {
    showError('El cliente no tiene un teléfono válido cargado.');
    return;
  }

  const b = business.value;
  const c = 'Consultar horario';
  const hours = [
    `Lunes a viernes: ${b.morningOpen || c} a ${b.morningClose || c} y ${b.afternoonOpen || c} a ${b.afternoonClose || c}`,
    `Sábados: ${b.saturdayOpen || c} a ${b.saturdayClose || c}`,
  ].join('\n');

  const text = encodeURIComponent(
    [
      `¡Hola ${order.user.name}!`,
      '',
      `Te avisamos que tu pedido #${order.orderNumber} ya está preparado y listo para retirar.`,
      '',
      `Dirección: ${b.address || 'Consultar ubicación.'}`,
      '',
      'Horarios:',
      hours,
      '',
      'Muchas gracias por confiar en DM Repuestos Agrícolas.',
      '¡Te esperamos!',
    ].join('\n'),
  );

  window.open(`https://wa.me/${phone}?text=${text}`, '_blank');

  try {
    await ordersService.notifyCustomer(order.id, 'whatsapp');
    order.customerNotified = true;
    order.notificationMethod = 'whatsapp';
    order.customerNotifiedAt = new Date();
  } catch (e) {
    showError(e.response?.data?.message || 'No se pudo registrar la notificación.');
  }
}

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

function toggleDetail(order) {
  expandedOrderId.value = expandedOrderId.value === order.id ? null : order.id;
}

function imageUrl(product) {
  if (!product?.imageUrl) return null;
  return `${import.meta.env.VITE_API_URL}${product.imageUrl}`;
}

function selectView(mode) {
  if (viewMode.value === mode) return;
  viewMode.value = mode;
  page.value = 1;
  search.value = '';
  expandedOrderId.value = null;
  load();
}

function showMessage(text) {

  message.value = text;

  if (messageTimeout) {
    clearTimeout(messageTimeout);
  }

  messageTimeout = setTimeout(() => {
    message.value = '';
  }, 5000);
}

function showCancelMessage(text) {

  cancelMessage.value = text;

  if (cancelTimeout) {
    clearTimeout(cancelTimeout);
  }

  cancelTimeout = setTimeout(() => {
    cancelMessage.value = '';
  }, 5000);
}

function showError(text) {

  error.value = text;

  if (errorTimeout) {
    clearTimeout(errorTimeout);
  }

  errorTimeout = setTimeout(() => {
    error.value = '';
  }, 5000);
}

onMounted(async () => {
  await load();
  await loadBusiness();
  orderNotificationsStore.markAsSeen();
});
</script>

<template>
  <div class="container admin-orders-view">
    <header class="orders-page-header">

      <div class="orders-title-section">
        <h1>Pedidos</h1>
      </div>

      <div class="orders-tools">
        <div class="orders-search">
          <div class="search-input-wrapper">

            <svg
              class="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
              />

              <path d="m20 20-4-4"></path>
            </svg>

            <input
              v-model="search"
              type="text"
              placeholder="Buscar..."
              @input="handleSearch"
            />

            <button
              v-if="search"
              type="button"
              class="search-clear"
              title="Limpiar búsqueda"
              @click="clearSearch"
            >
              ✕
            </button>

          </div>

        </div>

      </div>

    </header>

    <div class="view-tabs">
      <button
        type="button"
        class="view-tab"
        :class="{ 'view-tab--active': viewMode === 'active' }"
        @click="selectView('active')"
      >
        Activos
      </button>
      <button
        type="button"
        class="view-tab"
        :class="{ 'view-tab--active': viewMode === 'cancelled' }"
        @click="selectView('cancelled')"
      >
        Cancelados
      </button>
    </div>

    <p
      v-if="loading"
      class="loading-state"
    >
      Cargando pedidos...
    </p>

    <div v-else-if="viewMode === 'active'" class="orders-table-wrapper">
      <table class="admin-table admin-table--detailed">

        <thead>
          <tr>
            <th>N° orden</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Pago</th>
            <th>Estado</th>
            <th class="detail-column">Detalle</th>
            <th class="actions-column-header"></th>
          </tr>
        </thead>

        <tbody>
          <template
            v-for="order in orders"
            :key="order.id"
          >
            <tr class="order-row">
              <td>
                <span class="order-number">
                  #{{ order.orderNumber }}
                </span>
              </td>
              
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
              
              <td>
                <span class="order-total">
                  $ {{ Number(order.total).toLocaleString('es-AR') }}
                </span>
              </td>
              
              <td>
                <span class="payment-badge">
                  {{ PAYMENT_LABELS[order.paymentMethod] || 'No especificado' }}
                </span>
              </td>
              
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
              
              <td class="detail-column">
                <button
                  type="button"
                  class="detail-toggle"
                  @click="toggleDetail(order)"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0Zm8-4.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Zm-1 4h2v5h-2v-5Z"
                    />
                  </svg>

                  <span>
                    {{ expandedOrderId === order.id ? 'Ocultar' : 'Ver detalle' }}
                  </span>
                </button>
              </td>

              <td class="actions-column-cell">
                <button
                  type="button"
                  class="btn-cancel-order"
                  @click="askCancel(order)"
                >
                  Cancelar
                </button>
              </td>
            </tr>
            
            <tr
              v-if="expandedOrderId === order.id"
              class="detail-row"
            >
              <td colspan="8">
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
                      
                      <div class="detail-product">

                        <span class="detail-qty detail-qty--admin">
                          {{ detail.quantity }} ×
                        </span>

                        <div class="detail-product-info">
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

    <div v-else class="orders-table-wrapper">
      <table class="admin-table admin-table--detailed cancelled-table">

        <thead>
          <tr>
            <th>N° orden</th>
            <th>Cliente</th>
            <th>Fecha pedido</th>
            <th>Fecha cancelación</th>
            <th>Total</th>
            <th>Cancelado por</th>
            <th>Motivo</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="order in orders"
            :key="order.id"
            class="order-row"
          >
            <td>
              <span class="order-number">
                #{{ order.orderNumber }}
              </span>
            </td>

            <td>
              <div class="customer-cell">
                <div class="customer-avatar">
                  <svg
                    viewBox="0 0 24 24"
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

            <td class="date-cell">
              <div class="date-content">
                <span class="date">{{ formatDate(order.createdAt) }}</span>
                <span class="time">{{ formatTime(order.createdAt) }}</span>
              </div>
            </td>

            <td class="date-cell">
              <div v-if="order.cancelledAt" class="date-content">
                <span class="date">{{ formatDate(order.cancelledAt) }}</span>
                <span class="time">{{ formatTime(order.cancelledAt) }}</span>
              </div>
              <span v-else>—</span>
            </td>

            <td>
              <span class="order-total">
                $ {{ Number(order.total).toLocaleString('es-AR') }}
              </span>
            </td>

            <td>
              <span
                class="cancelled-by"
                :class="`cancelled-by--${order.cancelledBy}`"
              >
                {{
                  order.cancelledBy === 'admin'
                    ? 'Administrador'
                    : order.cancelledBy === 'customer'
                      ? 'Cliente'
                      : '—'
                }}
              </span>

              <span
                v-if="order.cancelledBy === 'admin' && order.cancelledByUser?.name"
                class="table-subtext"
              >
                {{ order.cancelledByUser.name }}
              </span>
            </td>

            <td class="reason-cell">
              {{ order.cancelReason || '—' }}
            </td>
          </tr>

          <tr v-if="!orders.length">
            <td colspan="7" class="empty-detail">
              No hay pedidos cancelados.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Transition name="modal">
      <div
        v-if="orderToCancel"
        class="confirm-overlay"
        @click.self="dismissCancel"
      >
        <div
          class="confirm-card"
          role="dialog"
          aria-modal="true"
        >
          <h3>¿Cancelar el pedido?</h3>

          <p>
            Vas a cancelar el pedido
            <strong>#{{ orderToCancel.orderNumber }}</strong>
            de
            <strong>{{ orderToCancel.user?.name || 'el cliente' }}</strong>.
            El stock se va a reincorporar automáticamente.
          </p>

          <div class="confirm-field">
            <label for="cancel-reason">Motivo (opcional)</label>

            <textarea
              id="cancel-reason"
              v-model="cancelReasonText"
              rows="3"
              maxlength="255"
            ></textarea>
          </div>

          <div class="confirm-actions">
            <button
              type="button"
              class="confirm-btn confirm-btn--cancel"
              :disabled="cancelling"
              @click="dismissCancel"
            >
              Volver
            </button>

            <button
              type="button"
              class="confirm-btn confirm-btn--danger"
              :disabled="cancelling"
              @click="confirmCancel"
            >
              {{ cancelling ? 'Cancelando...' : 'Cancelar' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="success-toast">
      <div
        v-if="message"
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
          <span>{{ message }}</span>
        </div>
      </div>
    </Transition>

    <Transition name="error-toast">
      <div
        v-if="cancelMessage"
        class="error-toast"
      >
        <div class="error-toast-icon">
          ✕
        </div>

        <div class="error-toast-content">
          <strong>Pedido cancelado correctamente</strong>

          <span>{{ cancelMessage }}</span>
        </div>
      </div>
    </Transition>

    <Transition name="error-toast">
      <div
        v-if="error"
        class="error-toast"
      >
        <div class="error-toast-icon">
          !
        </div>

        <div class="error-toast-content">
          <strong>{{ error }}</strong>

          <span>
            Ocurrió un error al cargar la información.
          </span>
        </div>
      </div>
    </Transition>

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
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
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
  display: inline-block;
  padding: 6px 4px;
  border-radius: 8px;
  color: black;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  overflow-wrap: anywhere;
}

.customer-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
}

.customer-cell > div:last-child {
  min-width: 0;
}

.customer-name,
.table-subtext {
  overflow-wrap: anywhere;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 75px;
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 0.90rem;
  font-weight: 700;
  background: #e8f7ec;
  color: #207a3c;
  white-space: nowrap;
}

.payment-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.04);
  color: var(--color-ink-soft);
  font-size: 0.75rem;
  text-align: center;
}

.status-control {
  position: relative;
  display: flex;
  width: 100%;
  max-width: 130px;
  margin: 0 auto;
  border-radius: 999px;
  padding: 2px;
  background: rgba(0, 0, 0, 0.05);
  transform: none !important;
}

.status-control select {
  width: 100%;
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
  font-weight: 600;
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

.detail-product-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  min-width: 0;
}

.detail-code {
  display: block;
  margin-top: 3px;
  color: var(--color-ink-soft);
  font-size: 0.75rem;
  font-family: var(--font-mono);
  text-align: left;
}

.detail-price,
.detail-price--admin {
  white-space: nowrap;
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

.btn-cancel-order {
  padding: 8px 14px;
  border: 1px solid #c8102e;
  border-radius: 6px;
  background: transparent;
  color: #c8102e;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-cancel-order:hover {
  background: #c8102e;
  color: #fff;
}

/* Tabla de activos: 8 columnas */
.admin-table--detailed th:nth-child(1) { width: 11%; }
.admin-table--detailed th:nth-child(2) { width: 21%; }
.admin-table--detailed th:nth-child(3) { width: 10%; }
.admin-table--detailed th:nth-child(4) { width: 12%; }
.admin-table--detailed th:nth-child(5) { width: 10%; }
.admin-table--detailed th:nth-child(6) { width: 13%; }
.admin-table--detailed th:nth-child(7) { width: 12%; }
.admin-table--detailed th:nth-child(8) { width: 11%; }

/* Tabla de cancelados: 7 columnas */
/* Tabla de cancelados: 7 columnas (pisa los anchos de la de activos) */
.admin-table--detailed.cancelled-table th:nth-child(1) { width: 12%; }
.admin-table--detailed.cancelled-table th:nth-child(2) { width: 24%; }
.admin-table--detailed.cancelled-table th:nth-child(3) { width: 11%; }
.admin-table--detailed.cancelled-table th:nth-child(4) { width: 12%; }
.admin-table--detailed.cancelled-table th:nth-child(5) { width: 12%; }
.admin-table--detailed.cancelled-table th:nth-child(6) { width: 13%; }
.admin-table--detailed.cancelled-table th:nth-child(7) { width: 16%; }

/* Reglas comunes a las dos tablas */
.admin-table--detailed,
.cancelled-table {
  width: 100%;
  table-layout: fixed;
}

.admin-table--detailed th,
.admin-table--detailed td,
.cancelled-table th,
.cancelled-table td {
  padding: 14px 10px;
}

.admin-table--detailed th,
.cancelled-table th {
  text-align: center;
}

.admin-table--detailed td:not(:nth-child(2)),
.cancelled-table td:not(:nth-child(2)) {
  text-align: center;
}

.admin-table--detailed td:nth-child(2),
.cancelled-table td:nth-child(2) {
  text-align: left;
}

.reason-cell {
  font-size: 0.85rem;
  color: var(--color-ink-soft);
  overflow-wrap: anywhere;
}

.actions-column-cell {
  vertical-align: middle;
  white-space: nowrap;
}

.detail-column,
.actions-column-cell {
  text-align: center;
}

.notification-cell {
  vertical-align: middle;
  white-space: nowrap;
}

.notification-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 8px;
  width: 100%;
}

.notify-buttons {
  display: flex;
  width: 100%;
  max-width: 130px;
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
  width: 100%;
  height: 30px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: .6s;
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

.notification-success {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 130px;
  margin: 0;
  padding: 6px;
  border-radius: 8px;
  background: #e8f7ec;
  border: 1px solid #b8dfc4;
  color: #207a3c;
}

.notification-success strong {
  font-size: .7rem;
}

.notification-success small {
  color: #4d6655;
}

.orders-page-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 30px;
}

.orders-title-section {
  width: 100%;
}

.orders-page-header h1 {
  margin: 0;
  color: var(--color-ink);
  font-size: clamp(2.1rem, 4vw, 2.8rem);
  line-height: 1.05;
}

.orders-tools {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
}

.orders-search {
  width: 100%;
  max-width: 700px;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.search-input-wrapper input {
  width: 100%;
  height: 40px;
  padding: 0 45px;
  border: 1px solid var(--color-line);
  border-radius: 50px;
  background: var(--color-surface);
  color: var(--color-ink);
  font-family: var(--font-body);
  font-size: 0.9rem;
  outline: none;
  transition:
    border-color .2s ease,
    box-shadow .2s ease;
}

.search-input-wrapper input::placeholder {
  color: var(--color-ink-soft);
}

.search-input-wrapper input:focus {
  border-color: var(--color-rust);
  box-shadow:
    0 0 0 3px rgba(183, 53, 45, 0.08);
}

.search-icon {
  position: absolute;
  left: 16px;
  width: 19px;
  height: 19px;
  color: var(--color-ink-soft);
  pointer-events: none;
}

.search-clear {
  position: absolute;
  right: 12px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--color-ink-soft);
  cursor: pointer;
  font-size: 0.8rem;
}

/* ===== TARJETA DE CONFIRMACIÓN ===== */

.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, .45);
}

.confirm-card {
  width: 100%;
  max-width: 440px;
  padding: 30px 28px 24px;
  text-align: center;
  background: #fff;
  border: 1px solid var(--color-line);
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, .2);
}

.confirm-icon {
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: #fdecec;
  color: #b42318;
}

.confirm-icon svg {
  width: 26px;
  height: 26px;
}

.confirm-card h3 {
  margin: 0 0 10px;
  color: var(--color-ink);
  font-size: 1.2rem;
}

.confirm-card p {
  margin: 0 0 8px;
  color: var(--color-ink-soft);
  font-size: .9rem;
  line-height: 1.5;
}

.confirm-card p strong {
  color: var(--color-ink);
}

.confirm-field {
  margin-top: 16px;
  text-align: left;
}

.confirm-field label {
  display: block;
  margin-bottom: 7px;
  color: var(--color-ink);
  font-size: .82rem;
  font-weight: 700;
}

.confirm-field textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 11px 13px;
  border: 1px solid var(--color-line);
  border-radius: 12px;
  background: #fff;
  color: var(--color-ink);
  font-family: var(--font-body);
  font-size: .88rem;
  line-height: 1.4;
  resize: none;
  outline: none;
  transition:
    border-color .2s ease,
    box-shadow .2s ease;
}

.confirm-field textarea::placeholder {
  color: var(--color-ink-soft);
}

.confirm-field textarea:focus {
  border-color: var(--color-rust);
  box-shadow: 0 0 0 3px rgba(183, 53, 45, 0.08);
}

.confirm-actions {
  display: flex;
  gap: 10px;
  margin-top: 22px;
}

.confirm-btn {
  flex: 1;
  min-height: 44px;
  border-radius: 12px;
  font-family: var(--font-body);
  font-size: .88rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background .2s ease,
    color .2s ease;
}

.confirm-btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.confirm-btn--cancel {
  border: 1px solid var(--color-line);
  background: #fff;
  color: var(--color-ink);
}

.confirm-btn--cancel:hover:not(:disabled) {
  background: #f6f6f3;
}

.confirm-btn--danger {
  border: 1px solid #c8102e;
  background: #c8102e;
  color: #fff;
}

.confirm-btn--danger:hover:not(:disabled) {
  background: #a50d26;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity .2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .confirm-card,
.modal-leave-active .confirm-card {
  transition: transform .2s ease;
}

.modal-enter-from .confirm-card,
.modal-leave-to .confirm-card {
  transform: translateY(10px) scale(.97);
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

.error-toast {
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
  border: 1px solid #f0c2c2;
  border-radius: 14px;

  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.12);

  color: #b42318;
}

.error-toast-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;
  background: #fdecec;

  color: #b42318;

  font-size: 1.1rem;
  font-weight: 700;
}

.error-toast-content {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.error-toast-content strong {
  font-size: 0.88rem;
  font-weight: 700;
}

.error-toast-content span {
  color: #765050;
  font-size: 0.78rem;
}

.error-toast-enter-active,
.error-toast-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.error-toast-enter-from,
.error-toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.view-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.view-tab {
  padding: 9px 20px;
  border: 1px solid var(--color-line);
  border-radius: 999px;
  background: var(--color-surface);
  color: var(--color-ink-soft);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.view-tab--active {
  background: var(--color-ink);
  border-color: var(--color-ink);
  color: #fff;
}

.cancelled-by {
  display: inline-flex;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
}

.cancelled-by--admin {
  background:rgba(183, 53, 45, 0.08);
  color: var(--color-rust);
}

.cancelled-by--customer {
  background: rgba(14, 116, 144, 0.12);
  color: #0e7490;
}

@media (max-width: 1100px) {
  .admin-table--detailed,
  .cancelled-table {
    min-width: 1000px;
  }
}

@media (max-width:900px){

  .orders-page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .orders-tools {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
  }

  .orders-search {
    width: 100%;
    transform: none;
  }

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

  .success-toast,
  .error-toast{
    top: 20px;
    right: 15px;
    left: 15px;
    min-width: auto;
    max-width: none;
  }

}
</style>