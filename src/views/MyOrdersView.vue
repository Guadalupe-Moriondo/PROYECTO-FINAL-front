<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import ordersService from '../services/orders.service';
import Pagination from '../components/Pagination.vue';


const route = useRoute();
const loading = ref(true);
const showSuccessMessage = ref(false);

const activeTab = ref('pending'); // 'pending' | 'delivered'

const pendingOrders = ref([]);
const pendingPage = ref(1);
const pendingTotalPages = ref(1);
const pendingLoaded = ref(false);
const pendingTotal = ref(0);

const deliveredOrders = ref([]);
const deliveredPage = ref(1);
const deliveredTotalPages = ref(1);
const deliveredLoaded = ref(false);
const deliveredTotal = ref(0);

const hasOrders = computed(() => {
  return pendingOrders.value.length > 0 || deliveredOrders.value.length > 0;
});


const STATUS_LABELS = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  in_preparation: 'En preparación',
  withdraw: 'Retirar',
  delivered: 'Entregado',
};

async function loadPending() {
  loading.value = true;

  const response = await ordersService.myOrders(
    pendingPage.value,
    10,
    'pending'
  );

  pendingOrders.value = response.data.data;
  pendingTotalPages.value = response.data.totalPages;
  pendingTotal.value = response.data.total;
  pendingLoaded.value = true;

  loading.value = false;
}

async function loadDelivered() {
  loading.value = true;

  const response = await ordersService.myOrders(
    deliveredPage.value,
    10,
    'delivered'
  );

  deliveredOrders.value = response.data.data;
  deliveredTotalPages.value = response.data.totalPages;
  deliveredTotal.value = response.data.total;
  deliveredLoaded.value = true;

  loading.value = false;
}

function selectTab(tab) {
  activeTab.value = tab;
  if (tab === 'pending' && !pendingLoaded.value) loadPending();
  if (tab === 'delivered' && !deliveredLoaded.value) loadDelivered();
}

function changePendingPage(newPage) {
  pendingPage.value = newPage;
  loadPending();
}

function changeDeliveredPage(newPage) {
  deliveredPage.value = newPage;
  loadDelivered();
}


function imageUrl(product) {
  if (!product?.imageUrl) return null;
  return `${import.meta.env.VITE_API_URL}${product.imageUrl}`;
}


onMounted(async () => {
  await Promise.all([
    loadPending(),
    loadDelivered(),
  ]);

  if (route.query.created) {
    showSuccessMessage.value = true;

    setTimeout(() => {
      showSuccessMessage.value = false;
    }, 3000);
  }
});
</script>

<template>
  <div class="container orders-view">

    <!-- ================= HEADER ================= -->
    <div class="orders-header">

      <div>
        <h1>
          Mis pedidos
        </h1>
      </div>

    </div>

    <div class="orders-tabs" v-if="hasOrders">
      <button
        type="button"
        class="orders-tab"
        :class="{ 'orders-tab-active': activeTab === 'pending' }"
        @click="selectTab('pending')"
      >
        En proceso
        <span class="orders-tab-count">{{ pendingTotal }}</span>
      </button>

      <button
        type="button"
        class="orders-tab"
        :class="{ 'orders-tab-active': activeTab === 'delivered' }"
        @click="selectTab('delivered')"
      >
        Entregados
        <span class="orders-tab-count">{{ deliveredTotal }}</span>
      </button>
    </div>


    <!-- ================= PEDIDO CONFIRMADO ================= -->
    <Transition name="success-toast">
      <div
        v-if="showSuccessMessage"
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
          <strong>¡Pedido confirmado!</strong>

          <span>
            Tu pedido #{{ route.query.created }} fue realizado correctamente.
          </span>
        </div>
      </div>

    </Transition>
   


    <!-- ================= LOADING ================= -->
    <p
      v-if="loading"
      class="loading-state"
    >
      Cargando pedidos...
    </p>


    <!-- ================= SIN PEDIDOS ================= -->
    <div
      v-else-if="!hasOrders"
      class="empty-state"
    >

      <div class="empty-icon">

        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M4 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3h1a1 1 0 0 1 1 1v2.5a1 1 0 0 1-.6.9l-.4.2V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7.4l-.4-.2a1 1 0 0 1-.6-.9V8a1 1 0 0 1 1-1h1V4Zm2 0v3h12V4H6Zm-1 5v1h14V9H5Zm1 3v7h12v-7H6Z"
          />
        </svg>

      </div>

      <h2>
        Todavía no hiciste ningún pedido
      </h2>

      <p>
        Cuando realices una compra, tus pedidos aparecerán aquí.
      </p>

    </div>


    <!-- ================= PEDIDOS ================= -->
    <div
      v-else
      class="orders-sections"
    >

      <!-- ==================================================
           PEDIDOS EN PROCESO
      =================================================== -->
      <section
        v-if="activeTab === 'pending'"
        class="orders-group"
      >

        <div class="group-header">

          <div>
            <h2>
              Pedidos en proceso
            </h2>
          </div>
        </div>

        <template v-if="pendingOrders.length > 0">
          <div v-if="pendingOrders.length > 0" class="orders-list">

            <article
              v-for="order in pendingOrders"
              :key="order.id"
              class="order-card"
            >

              <!-- HEADER PEDIDO -->
              <header class="order-card-header">

                <div>

                  <span class="order-label">
                    Pedido
                  </span>

                  <span class="order-number">
                    #{{ order.orderNumber }}
                  </span>

                </div>


                <span
                  class="order-status"
                  :class="`order-status-${order.status}`"
                >

                  <span class="status-dot"></span>

                  {{ STATUS_LABELS[order.status] || order.status }}

                </span>

              </header>


              <!-- PRODUCTOS -->
              <div class="order-products">

                <div
                  v-for="detail in order.details"
                  :key="detail.id"
                  class="order-detail"
                >

                  <!-- Imagen -->
                  <div class="detail-image-wrapper">

                    <img
                      v-if="imageUrl(detail.product)"
                      :src="imageUrl(detail.product)"
                      :alt="
                        detail.product?.name ||
                        'Producto'
                      "
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
                          d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm0 2v14h14V5H5Zm2 2h10v2H7V7Zm0 4h10v2H7v-2Zm0 4h6v2H7v-2Z"
                        />
                      </svg>

                    </div>

                  </div>


                  <!-- Información -->
                  <div class="detail-info">

                    <strong class="detail-name">
                      {{
                        detail.product?.name ||
                        'Producto eliminado'
                      }}
                    </strong>

                    <span class="detail-quantity">
                      {{ detail.quantity }} unidad(es)
                    </span>
                  </div>
                  <span class="detail-price">
                      $
                      {{
                        Number(detail.unitPrice)
                          .toLocaleString('es-AR')
                      }}
                      
                    </span>
                </div>

              </div>


              <!-- FOOTER -->
              <footer class="order-card-footer">

                <div class="order-total-block">

                  <span class="footer-label">
                    Total del pedido
                  </span>

                  <strong class="order-total">
                    $
                    {{
                      Number(order.total)
                        .toLocaleString('es-AR')
                    }}
                  </strong>

                </div>

                <div class="order-status-mobile">
                  {{ STATUS_LABELS[order.status] || order.status }}
                </div>

              </footer>

            </article>

          </div>

          <Pagination
            
            :page="pendingPage"
            :total-pages="pendingTotalPages"
            @change-page="changePendingPage"
          />
        </template>
        
        <div v-else class="empty-section">
          <p>No tenés pedidos en proceso.</p>
        </div>

      </section>


      <!-- ==================================================
           PEDIDOS ENTREGADOS
      =================================================== -->
      <section
        v-if="activeTab === 'delivered'"
        class="orders-group delivered-group"
      >

        <div class="group-header">

          <div>
            <h2>
              Pedidos entregados
            </h2>

          </div>

        </div>

        <template v-if="deliveredOrders.length > 0">

          <div v-if="deliveredOrders.length > 0" class="orders-list">

            <article
              v-for="order in deliveredOrders"
              :key="order.id"
              class="order-card delivered-card"
            >

              <!-- HEADER -->
              <header class="order-card-header">

                <div>

                  <span class="order-label">
                    Pedido
                  </span>

                  <span class="order-number">
                    #{{ order.orderNumber }}
                  </span>

                </div>


                <span class="order-status order-status-delivered">

                  <span class="status-dot"></span>

                  Entregado

                </span>

              </header>


              <!-- PRODUCTOS -->
              <div class="order-products">

                <div
                  v-for="detail in order.details"
                  :key="detail.id"
                  class="order-detail"
                >

                  <div class="detail-image-wrapper">

                    <img
                      v-if="imageUrl(detail.product)"
                      :src="imageUrl(detail.product)"
                      :alt="
                        detail.product?.name ||
                        'Producto'
                      "
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
                          d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm0 2v14h14V5H5Zm2 2h10v2H7V7Zm0 4h10v2H7v-2Zm0 4h6v2H7v-2Z"
                        />
                      </svg>

                    </div>

                  </div>


                  <div class="detail-info">

                    <strong class="detail-name">
                      {{
                        detail.product?.name ||
                        'Producto eliminado'
                      }}
                    </strong>

                    <span class="detail-quantity">
                      {{ detail.quantity }} unidad(es)
                    </span>
                  </div>
                  <span class="detail-price">
                     $
                    {{
                      Number(detail.unitPrice)
                        .toLocaleString('es-AR')
                    }}
                    
                  </span>

                </div>

              </div>


              <!-- FOOTER -->
              <footer class="order-card-footer">

                <div class="order-total-block">

                  <span class="footer-label">
                    Total del pedido
                  </span>

                  <strong class="order-total">
                    $
                    {{
                      Number(order.total)
                        .toLocaleString('es-AR')
                    }}
                  </strong>

                </div>

              </footer>

            </article>

          </div>

          <Pagination
            :page="deliveredPage"
            :total-pages="deliveredTotalPages"
            @change-page="changeDeliveredPage"
          />
        </template>

        <div v-else class="empty-section">
            <p>No tenés pedidos entregados.</p>
        </div>

      </section>

    </div>


  </div>
</template>

<style scoped>

/* =========================================================
   GENERAL
========================================================= */

.orders-view {
  padding: 55px 0 80px;

  min-height: 100vh;
}

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
  max-width: 650px;

  margin: 10px 0 0;

  color: var(--color-ink-soft);

  font-size: 0.95rem;

  line-height: 1.6;
}







/* =========================================================
   SECCIONES
========================================================= */

.orders-sections {
  display: flex;

  flex-direction: column;

  gap: 38px;
}

.orders-tabs {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-line);
}

.orders-tab {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  padding: var(--space-2) var(--space-1) var(--space-3);
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-ink-soft);
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.orders-tab:hover {
  color: var(--color-ink);
}

.orders-tab-active {
  color: var(--color-rust);
  border-bottom-color: var(--color-rust);
}

.orders-tab-count {
  background: var(--color-line);
  color: var(--color-ink-soft);
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 0.75rem;
  
}

.orders-tab-active .orders-tab-count {
  background: var(--color-rust);
  color: #fff;
}

.orders-tab-empty {
  color: var(--color-ink-soft);
  padding: var(--space-4) 0;
  text-align: center;
}

.orders-group {
  background: var(--color-surface);

  border: 1px solid var(--color-line);

  border-radius: 20px;

  padding: 28px;

  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.04);
}

.delivered-group {
  background:
    rgba(0, 0, 0, 0.012);
}


/* =========================================================
   HEADER SECCIÓN
========================================================= */

.group-header {
  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 15px;

  margin-bottom: 25px;

  padding-bottom: 18px;

  border-bottom: 1px solid var(--color-line);
}

.group-eyebrow {
  margin: 0 0 5px;

  color: var(--color-rust);

  font-family: var(--font-mono);

  font-size: 0.68rem;
  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: 0.12em;
}

.group-header h2 {
  margin: 0;

  color: var(--color-ink);

  font-size: 1.45rem;

  line-height: 1.1;
}

.group-count {
  min-width: 32px;
  height: 32px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0 9px;

  border-radius: 999px;

  background:
    rgba(183, 53, 45, 0.09);

  color: var(--color-rust);

  font-family: var(--font-mono);

  font-size: 0.78rem;

  font-weight: 700;
}

.delivered-count {
  background:
    rgba(45, 151, 84, 0.10);

  color: #258148;
}


/* =========================================================
   LISTA
========================================================= */

.orders-list {
  display: flex;

  flex-direction: column;

  gap: 14px;
}


/* =========================================================
   PEDIDO
========================================================= */

.order-card {
  overflow: hidden;

  background: #fff;

  border: 1px solid var(--color-line);

  border-radius: 16px;

  transition:
    transform .2s ease,
    box-shadow .2s ease,
    border-color .2s ease;
}

.order-card:hover {
  transform: translateY(-2px);

  border-color:
    rgba(183, 53, 45, 0.18);

  box-shadow:
    0 12px 28px rgba(0, 0, 0, 0.07);
}

.delivered-card:hover {
  border-color:
    rgba(45, 151, 84, 0.18);
}


/* =========================================================
   HEADER PEDIDO
========================================================= */

.order-card-header {
  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 15px;

  padding: 18px 20px;

  border-bottom: 1px solid var(--color-line);
}

.order-label {
  display: block;

  margin-bottom: 3px;

  color: var(--color-ink-soft);

  font-size: 0.68rem;

  text-transform: uppercase;

  letter-spacing: 0.08em;
}

.order-number {
  color: var(--color-ink);

  font-family: var(--font-mono);

  font-size: 0.88rem;

  font-weight: 700;
}


/* =========================================================
   ESTADOS
========================================================= */

.order-status {
  display: inline-flex;

  align-items: center;

  gap: 7px;

  padding: 7px 11px;

  border-radius: 999px;

  font-size: 0.72rem;

  font-weight: 700;

  white-space: nowrap;
}

.status-dot {
  width: 7px;
  height: 7px;

  border-radius: 50%;

  background: currentColor;
}


/* Pendiente */

.order-status-pending {
  background: rgba(245, 158, 11, 0.12);

  color: #a16207;
}


/* Confirmado */

.order-status-confirmed {
  background: rgba(37, 99, 235, 0.10);

  color: #1d4ed8;
}


/* Preparación */

.order-status-in_preparation {
  background: rgba(124, 58, 237, 0.10);

  color: #6d28d9;
}


/* Enviado */

.order-status-withdraw {
  background: rgba(14, 116, 144, 0.10);

  color: #0e7490;
}


/* Entregado */

.order-status-delivered {
  background: rgba(45, 151, 84, 0.11);

  color: #258148;
}


/* =========================================================
   PRODUCTOS
========================================================= */

.order-products {
  display: flex;

  flex-direction: column;

  padding: 6px 20px;
}

.order-detail {
  display: flex;

  align-items: center;

  gap: 15px;

  padding: 13px 0;

  border-bottom: 1px solid #eeeeee;
}

.order-detail:last-child {
  border-bottom: none;
}


/* Imagen */

.detail-image-wrapper {
  width: 58px;
  height: 58px;

  flex: 0 0 58px;
}

.detail-image {
  width: 100%;
  height: 100%;

  object-fit: cover;

  border-radius: 11px;

  border: 1px solid var(--color-line);
}

.detail-image-placeholder {
  width: 100%;
  height: 100%;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 11px;

  background:
    rgba(0, 0, 0, 0.035);

  color: var(--color-ink-soft);
}

.detail-image-placeholder svg {
  width: 22px;
  height: 22px;
}


/* Información */

.detail-info {
  display: flex;

  flex-direction: column;

  gap: 4px;

  min-width: 0;
}

.detail-name {
  color: var(--color-ink);

  font-size: 0.88rem;

  line-height: 1.3;
}

.detail-quantity {
  color: var(--color-ink-soft);

  font-size: 0.77rem;
}

.detail-price {
  color: black;
  font-size: 0.80rem;
  flex-shrink: 0;
  margin-left: auto;   /* empuja el precio al extremo derecho de la fila */
  padding-left: 12px;
}


/* =========================================================
   FOOTER DEL PEDIDO
========================================================= */

.order-card-footer {
  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 15px;

  padding: 17px 20px;

  background:
    rgba(0, 0, 0, 0.018);

  border-top: 1px solid var(--color-line);
}

.footer-label {
  display: block;

  margin-bottom: 4px;

  color: var(--color-ink-soft);

  font-size: 0.68rem;

  text-transform: uppercase;

  letter-spacing: 0.06em;
}

.order-total {
  color: var(--color-rust);

  font-family: var(--font-display);

  font-size: 1rem;

  font-weight: 600;
}

.order-total-block {
  margin-left: auto;   /* empuja el bloque completo (etiqueta + total) a la derecha */
  text-align: right;   /* alinea el texto adentro también a la derecha */
}

.order-status-mobile {
  display: none;
}

.delivered-label {
  color: #258148;

  font-size: 0.78rem;

  font-weight: 700;
}


/* =========================================================
   ESTADOS VACÍOS
========================================================= */

.loading-state {
  padding: 65px 0;

  text-align: center;

  color: var(--color-ink-soft);

  font-family: var(--font-mono);

  font-size: 0.85rem;
}

.empty-state {
  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  min-height: 420px;

  padding: 45px 20px;

  text-align: center;

  background: var(--color-surface);

  border: 1px solid var(--color-line);

  border-radius: 20px;
}

.empty-icon {
  width: 70px;
  height: 70px;

  display: flex;

  align-items: center;
  justify-content: center;

  margin-bottom: 20px;

  border-radius: 20px;

  background:
    rgba(183, 53, 45, 0.08);

  color: var(--color-rust);
}

.empty-icon svg {
  width: 31px;
  height: 31px;
}

.empty-state h2 {
  margin: 0 0 8px;

  color: var(--color-ink);

  font-size: 1.35rem;
}

.empty-state p {
  max-width: 420px;

  margin: 0;

  color: var(--color-ink-soft);

  font-size: 0.9rem;

  line-height: 1.6;
}



/* ==============================
   MENSAJE DE ÉXITO
============================== */

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


/* ==============================
   ANIMACIÓN
============================== */

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





/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 900px) {

  .orders-view {
    padding: 40px 14px 60px;
  }

  .orders-header {
    margin-bottom: 25px;
  }

  .orders-group {
    padding: 20px;
  }

  .order-card-header {
    align-items: flex-start;

    flex-direction: column;
  }

  .order-card-footer {
    align-items: flex-start;

    flex-direction: column;
  }

  .delivered-label {
    display: none;
  }

  .order-status-mobile {
    display: block;

    color: var(--color-ink-soft);

    font-size: 0.75rem;

    font-weight: 600;
  }

}


@media (max-width: 600px) {

  .orders-group {
    padding: 15px;
  }

  .group-header h2 {
    font-size: 1.2rem;
  }

  .order-detail {
    gap: 11px;
  }

  .detail-image-wrapper {
    width: 50px;
    height: 50px;

    flex-basis: 50px;
  }

  .detail-name {
    font-size: 0.82rem;
  }

}

/* ==============================
   RESPONSIVE mensaje exito
============================== */

@media (max-width: 600px) {
  .success-toast {
    top: 20px;
    right: 15px;
    left: 15px;

    min-width: auto;
    max-width: none;
  }
}
</style>