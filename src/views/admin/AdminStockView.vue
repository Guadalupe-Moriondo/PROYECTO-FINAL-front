<script setup>
import { ref, onMounted, computed} from 'vue';
import productsService from '../../services/products.service';
import stockService from '../../services/stock.service';
import InventoryTag from '../../components/InventoryTag.vue';
import Pagination from '../../components/Pagination.vue';

const alerts = ref([]);
const loadingAlerts = ref(true);
const form = ref({ productId: '', type: 'entry', quantity: 1, reason: '' });
const products = ref([]);
const productSearch = ref('');
const showProductResults = ref(false);
const showTypeResults = ref(false);
const error = ref('');
const message = ref('');
let messageTimeout = null;
let errorTimeout = null;
const page = ref(1);
const totalPages = ref(1);


async function loadAlerts() {
  loadingAlerts.value = true;
  const response = await stockService.alerts(page.value, 10);
  alerts.value = response.data.data;
  totalPages.value = response.data.totalPages;
  loadingAlerts.value = false;
}

function changePage(newPage) {
  page.value = newPage;
  loadAlerts();
}

async function loadProducts() {
  const response = await productsService.list(1, 100);
  products.value = response.data.data;
}

const filteredProducts = computed(() => {
  const search = productSearch.value.toLowerCase().trim();

  if (!search) {
    return products.value;
  }

  return products.value.filter(product =>
    product.name.toLowerCase().includes(search) ||
    product.code.toLowerCase().includes(search)
  );
});

function selectProduct(product) {
  form.value.productId = product.id;
  productSearch.value = `${product.code} — ${product.name}`;
  showProductResults.value = false;
}

function selectType(type) {
  form.value.type = type;
  showTypeResults.value = false;
}

async function registerMovement() {
  error.value = '';

  if (!form.value.productId) {
    showErrorMessage('Debes seleccionar un producto');
    return;
  }

  if (!['in', 'out'].includes(form.value.type)) {
    showErrorMessage('El tipo de movimiento debe ser Entrada o Salida');
    return;
  }

  try {
    await stockService.registerMovement(form.value);

    form.value.quantity = 1;
    form.value.reason = '';

    await loadAlerts();

    showMessage('Movimiento registrado correctamente');

  } catch (e) {
    showError(e);
  }
}

function showMessage(text) {
  message.value = text;

  if (messageTimeout) {
    clearTimeout(messageTimeout);
  }

  messageTimeout = setTimeout(() => {
    message.value = '';
  }, 3000);
}

function showErrorMessage(text) {
  error.value = text;

  if (errorTimeout) {
    clearTimeout(errorTimeout);
  }

  errorTimeout = setTimeout(() => {
    error.value = '';
  }, 3000);
}

function showError(e) {
  const backendMessage =
    e.response?.data?.message ||
    'No se pudo registrar el movimiento';

  error.value = Array.isArray(backendMessage)
    ? backendMessage.join(', ')
    : backendMessage;

  if (errorTimeout) {
    clearTimeout(errorTimeout);
  }

  errorTimeout = setTimeout(() => {
    error.value = '';
  }, 3000);
}

onMounted(() => {
  loadAlerts();
  loadProducts();
});
</script>

<template>
  <div class="container admin-stock-view">

    <header class="page-header">
      <h1>
        Gestión de Stock
      </h1>
    </header>

    <section class="stock-card">

      <h2 class="section-title">
        Registrar movimiento
      </h2>

      <form
        class="movement-form"
        @submit.prevent="registerMovement"
      >
        <div class="field">

          <label for="productId">
            Producto
          </label>

          <div class="product-search">
            <input
              id="productId"
              v-model="productSearch"
              type="text"
              placeholder="Buscar producto..."
              autocomplete="off"
              @click="showProductResults = !showProductResults"
            />

            <div
              v-if="showProductResults && filteredProducts.length"
              class="product-results"
            >
              <button
                v-for="product in filteredProducts"
                :key="product.id"
                type="button"
                class="product-result"
                @click="selectProduct(product)"
              >
                <strong>{{ product.code }}</strong>
                <span>{{ product.name }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="field">

          <label for="type">
            Tipo
          </label>

          <div class="product-search">
            <input
              id="type"
              :value="form.type === 'in' ? 'Entrada' : 'Salida'"
              type="text"
              readonly
              @click="showTypeResults = !showTypeResults"
            />

            <div
              v-if="showTypeResults"
              class="product-results"
            >
              <button
                type="button"
                class="product-result"
                @click="selectType('in')"
              >
                <span>Entrada</span>
              </button>

              <button
                type="button"
                class="product-result"
                @click="selectType('out')"
              >
                <span>Salida</span>
              </button>
            </div>
          </div>
        </div>

        <div class="field">

          <label for="quantity">
            Cantidad
          </label>

          <input
            id="quantity"
            v-model.number="form.quantity"
            type="number"
            min="1"
            required
          />

        </div>

        <div class="field">

          <label for="reason">
            Motivo
          </label>

          <input
            id="reason"
            v-model="form.reason"
            type="text"
            placeholder="Ej: Compra a proveedor"
          />

        </div>
      </form>

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
            <strong>{{ message }}</strong>
            <span>Los cambios se guardaron correctamente.</span>
          </div>
        </div>
      </Transition>

      <Transition name="error-toast">
        <div
          v-if="error"
          class="error-toast"
        >
          <div class="error-toast-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke-linecap="round"
              />
            </svg>
          </div>

          <div class="error-toast-content">
            <strong>{{ error }}</strong>
            <span>No se pudieron guardar los cambios.</span>
          </div>
        </div>
      </Transition>

      <button
        class="button button-primary"
        @click="registerMovement"
      >
        Registrar
      </button>
    </section>

    <section class="table-card">

      <div class="table-header">

        <h2>
          Alertas de stock bajo
        </h2>

      </div>

      <p
        v-if="loadingAlerts"
        class="loading-state"
      >
        Cargando...
      </p>

      <p
        v-else-if="alerts.length===0"
        class="empty-state"
      >
        No hay productos con stock bajo.
      </p>

      <div
        v-else
        class="table-scroll"
      >
        <table class="admin-table admin-table--basic">
          <thead>

            <tr>

              <th>Producto</th>

              <th>Estado</th>

            </tr>

          </thead>

          <tbody>

            <tr
              v-for="product in alerts"
              :key="product.id"
            >
              <td>

                <strong>
                  {{ product.name }}
                </strong>

              </td>

              <td>

                <InventoryTag
                  :code="product.code"
                  :stock="product.stock"
                  :min-stock="product.minStock"
                />

              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <Pagination :page="page" :total-pages="totalPages" @change-page="changePage"/>

    </section>
  </div>
</template>


<style scoped>
.admin-stock-view{
  padding: 2.5rem var(--space-4) 4rem;
}

.page-header{
  margin-bottom:2rem;
}

.page-eyebrow{
  color:var(--color-rust);
  text-transform:uppercase;
  letter-spacing:.18em;
  font-size:.8rem;
  font-weight:700;
  margin-bottom:.45rem;
}

.page-header h1{
  margin:0;
  font-size:2.5rem;
  color:var(--color-steel);
}

.page-description{
  margin-top:.7rem;
  max-width:650px;
  color:var(--color-ink-soft);
  line-height:1.7;
}

.stock-card,
.table-card{
  background:#fff;
  border:1px solid var(--color-line);
  border-radius:24px;
  box-shadow:0 15px 40px rgba(15,23,42,.08);
}

.stock-card{
  padding:2rem;
  margin-bottom:2rem;
}

.table-card{
  overflow:hidden;
}

.section-title{
  margin:0 0 2rem;
  font-size:1.35rem;
  color:var(--color-steel);
}

.movement-form{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:1.5rem;
  margin-bottom:1.5rem;
}

.field{
  display:flex;
  flex-direction:column;
}

.field label{
  margin-bottom:.55rem;
  font-size:.88rem;
  font-weight:600;
  color:var(--color-ink-soft);
}

.field input,
.field select{
  height:48px;
  border-radius:14px;
  border:1px solid var(--color-line);
  background:white;
  padding:0 1rem;
  font-size:.95rem;
  transition:.25s;
}

.field input:focus,
.field select:focus{
  outline:none;
  border-color:var(--color-rust);
  box-shadow:0 0 0 4px rgba(185,28,28,.12);
}

.product-search {
  position: relative;
  width: 100%;
}

.product-search input {
  width: 100%;
  box-sizing: border-box;
}

.product-results {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 100;
  max-height: 240px;
  overflow-y: auto;
  background: white;
  border: 1px solid var(--color-line);
  border-radius: 14px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
}

.product-result {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  padding: 12px 16px;
  border: 0;
  background: white;
  text-align: left;
  cursor: pointer;
}

.product-result:hover {
  background: #f7f7f4;
}

.product-result strong {
  font-size: 0.75rem;
  color: var(--color-steel);
  
}

.product-result span {
  font-size: 0.85rem;
  color: var(--color-ink-soft);
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
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.12);
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
  border: 1px solid #efb8b8;
  border-radius: 14px;

  box-shadow:
    0 12px 35px rgba(0, 0, 0, 0.12);

  color: #b42323;
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
}

.error-toast-icon svg {
  width: 20px;
  height: 20px;
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
  color: #7a4d4d;
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

.table-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:1.5rem 2rem;
  border-bottom:1px solid var(--color-line);
}

.table-header h2{
  margin:0;
  font-size:1.2rem;
}

.table-header span{
  padding:.45rem .9rem;
  border-radius:999px;
  background:#f6f6f3;
  color:var(--color-ink-soft);
  font-size:.85rem;
  font-weight:600;
}

.table-scroll{
  overflow-x:auto;
}

.button.button-primary{
  display:block;
  margin:0 0 0 auto;
  padding:.9rem 2.5rem;
  border-radius:14px;
  background:var(--color-rust);
  color:white;
  font-size:.95rem;
  font-weight:600;
  text-transform:uppercase;
  letter-spacing:.04em;
  transition:.25s;
}

@media(max-width:900px){

  .movement-form{
    grid-template-columns:1fr;
  }

  .table-header{

    flex-direction:column;
    align-items:flex-start;
    gap:1rem;
  }
}

@media(max-width:600px) {
  .success-toast,
  .error-toast {
    top: 20px;
    right: 15px;
    left: 15px;

    min-width: auto;
    max-width: none;
  }
}
</style>