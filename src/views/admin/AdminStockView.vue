<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import productsService from '../../services/products.service';
import stockService from '../../services/stock.service';
import InventoryTag from '../../components/InventoryTag.vue';

const router = useRouter();

const form = ref({
  productId: '',
  type: 'in',
  quantity: 1,
  reason: ''
});

const alerts = ref([]);
const loadingAlerts = ref(true);
const products = ref([]);
const productSearch = ref('');
const showProductResults = ref(false);
const showTypeResults = ref(false);
const message = ref('');
let messageTimeout = null;
const error = ref('');
let errorTimeout = null;

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

const selectedProduct = computed(() => {
  return products.value.find(
    product => product.id === form.value.productId
  );
});


async function loadProducts() {
  try {
    const response = await productsService.list(1, 100);
    products.value = response.data.data;
  } catch (e) {
    console.error('Error cargando productos:', e);
    products.value = [];
    showError('No se pudo cargar los productos');
  }
}

async function loadAlerts() {

  loadingAlerts.value = true;

  try {
    const response = await stockService.alerts(1, 100);

    alerts.value = response.data.data;
  } catch (e) {
    console.error('Error cargando stock:', e);

    alerts.value = [];

    showError('No se pudo cargar el stock');
  } finally {
    loadingAlerts.value = false;
  }
}

async function registerMovement() {

  error.value = '';

  if (!form.value.productId) {
    showError('Debes seleccionar un producto');
    return;
  }

  if (!['in', 'out'].includes(form.value.type)) {
    showError('El tipo de movimiento debe ser Entrada o Salida');
    return;
  }

  if (form.value.quantity < 1) {
    showError('La cantidad debe ser mayor a 0');
    return;
  }

  if (form.value.type === 'out' && selectedProduct.value) {
    if (form.value.quantity > selectedProduct.value.stock) {
      showError(
        `No hay suficiente stock. Disponible: ${selectedProduct.value.stock}`
      );
      return;
    }
  }

  try {
    await stockService.registerMovement(form.value);

    form.value.quantity = 1;
    form.value.reason = '';

    productSearch.value = '';
    form.value.productId = '';

    await loadAlerts();

    showMessage('Movimiento registrado correctamente');
  } catch (e) {
    console.error('Error registrando movimiento:', e);

    showError('No se pudo registrar el movimiento');
  }
}

function handleProductInput() {
  form.value.productId = '';
  showProductResults.value = true;
}

function selectProduct(product) {
  form.value.productId = product.id;
  productSearch.value = `${product.code} — ${product.name}`;
  showProductResults.value = false;
}

function selectType(type) {
  form.value.type = type;
  showTypeResults.value = false;
}

function goToHistory() {
  router.push('/admin-stock-history');
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

function showError(text) {
  
  error.value = text;

  if (errorTimeout) {
    clearTimeout(errorTimeout);
  }

  errorTimeout = setTimeout(() => {
    error.value = '';
  }, 5000);
}

onMounted(() => {
  loadAlerts();
  loadProducts();
});

</script>

<template>

  <div class="container admin-stock-view">

    <header class="page-header">
      <h1>Gestión de Stock</h1>
    </header>

    <div class="stock-layout">

      <!-- REGISTRAR MOVIMIENTO -->

      <section class="stock-card movement-card">

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
                @click="showProductResults = true"
                @input="handleProductInput"
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

                  <strong>
                    {{ product.code }}
                  </strong>

                  <span>
                    {{ product.name }}
                  </span>

                </button>

              </div>

            </div>
            <div
              v-if="selectedProduct"
              class="stock-available"
            >
              Stock disponible:
              <strong>{{ selectedProduct.stock }}</strong>
              unidades
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
                  <span>
                    Entrada
                  </span>
                </button>

                <button
                  type="button"
                  class="product-result"
                  @click="selectType('out')"
                >
                  <span>
                    Salida
                  </span>
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
              :max="form.type === 'out' && selectedProduct
                ? selectedProduct.stock
                : undefined"
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


          <button
            type="submit"
            class="button button-primary"
          >
            Registrar
          </button>

        </form>

      </section>


      <!-- ALERTAS -->

      <div class="stock-content">

        <section class="table-card stock-section">

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
            v-else-if="alerts.length === 0"
            class="empty-state"
          >
            No hay productos con stock bajo.
          </p>


          <div
            v-else
            class="table-scroll alerts-scroll"
          >

            <table class="admin-table admin-table--basic">

              <thead>

                <tr>

                  <th>
                    Producto
                  </th>

                  <th>
                    Estado
                  </th>

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

                    <span class="product-code">
                      Código: {{ product.code }}
                    </span>

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


          <!-- BOTÓN HISTORIAL -->

          <div class="history-button-wrapper">

            <button
              type="button"
              class="history-button"
              @click="goToHistory"
            >
              Historial de movimientos
            </button>

          </div>

        </section>

      </div>

    </div>


    <!-- SUCCESS TOAST -->

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

          <strong>
            {{ message }}
          </strong>

          <span>
            Los cambios se guardaron correctamente.
          </span>

        </div>

      </div>

    </Transition>


    <!-- ERROR TOAST -->

    <Transition name="error-toast">

      <div
        v-if="error"
        class="error-toast"
      >

        <div class="error-toast-icon">
          !
        </div>


        <div class="error-toast-content">

          <strong>
            {{ error }}
          </strong>

          <span>
            Ocurrió un error al cargar la información.
          </span>

        </div>

      </div>

    </Transition>

  </div>

</template>

<style scoped>

.admin-stock-view {
  padding: 2.5rem var(--space-4) 4rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  font-size: 2.5rem;
  color: var(--color-steel);
}


/* =========================
   LAYOUT
========================= */

.stock-layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 30px;
  align-items: stretch;
}

.movement-card {
  position: sticky;
  top: 25px;
  align-self: start;
}

.stock-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.stock-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.stock-section:last-child {
  margin-bottom: 0;
}


/* =========================
   CARDS
========================= */

.stock-card,
.table-card {
  background: #fff;
  border: 1px solid var(--color-line);
  border-radius: 24px;
  box-shadow:
    0 15px 40px rgba(15, 23, 42, .08);
}

.stock-card {
  padding: 2rem;
}

.table-card {
  overflow: hidden;
}

.movement-card {
  position: sticky;
  top: 25px;
}


/* =========================
   FORMULARIO
========================= */

.section-title {
  margin: 0 0 2rem;
  font-size: 1.35rem;
  color: var(--color-steel);
}

.movement-form {
  display: flex;
  flex-direction: column;
}

.field {
  display: flex;
  flex-direction: column;
}

.field label {
  margin-bottom: .55rem;
  font-size: .88rem;
  font-weight: 600;
  color: var(--color-ink-soft);
}

.field input,
.field select {
  width: 100%;
  height: 48px;
  box-sizing: border-box;
  border-radius: 14px;
  border: 1px solid var(--color-line);
  background: white;
  padding: 0 1rem;
  color: var(--color-ink);
  font-family: var(--font-body);
  font-size: .95rem;
  outline: none;
  transition:
    border-color .25s ease,
    box-shadow .25s ease;
}

.field input::placeholder {
  color: var(--color-ink-soft);
}

.field input:focus,
.field select:focus {
  outline: none;
  border-color: var(--color-rust);
  box-shadow:
    0 0 0 4px rgba(185, 28, 28, .12);
}


/* =========================
   BUSCADOR DE PRODUCTOS
========================= */

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
  box-shadow:
    0 12px 30px rgba(15, 23, 42, .12);
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
  font-size: .75rem;
  color: var(--color-steel);
}

.product-result span {
  font-size: .85rem;
  color: var(--color-ink-soft);
}

.stock-available {
  margin-top: 8px;
  color: var(--color-ink-soft);
  font-size: 0.82rem;
}

.stock-available strong {
  color: var(--color-ink);
  font-weight: 700;
}

/* =========================
   BOTÓN REGISTRAR
========================= */

.button.button-primary {
  width: 100%;
  margin: .3rem 0 0;
  padding: .9rem 2rem;
  border: none;
  border-radius: 14px;
  background: var(--color-rust);
  color: white;
  font-family: var(--font-body);
  font-size: .95rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .04em;
  cursor: pointer;
  transition:
    background .25s ease,
    transform .25s ease,
    box-shadow .25s ease;
}

.button.button-primary:hover {
  background: var(--color-rust-dark);
  transform: translateY(-1px);
  box-shadow:
    0 8px 20px rgba(183, 53, 45, .20);
}


/* =========================
   TABLA DE ALERTAS
========================= */

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--color-line);
}

.table-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--color-ink);
}

.table-header span {
  padding: .45rem .9rem;
  border-radius: 999px;
  background: #f6f6f3;
  color: var(--color-ink-soft);
  font-size: .85rem;
  font-weight: 600;
}


/* =========================
   SCROLL ALERTAS
========================= */

.alerts-scroll {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  overflow-x: auto;
}

.alerts-scroll::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}

.alerts-scroll::-webkit-scrollbar-track {
  background: #f5f5f2;
  border-radius: 10px;
}

.alerts-scroll::-webkit-scrollbar-thumb {
  background: #c9c9c3;
  border-radius: 10px;
}

.alerts-scroll::-webkit-scrollbar-thumb:hover {
  background: #aaa9a3;
}


/* =========================
   TABLA
========================= */

.table-scroll {
  overflow-x: auto;
}

.admin-table--basic th:nth-child(2),
.admin-table--basic td:nth-child(2) {
  text-align: center;
}

.product-code {
  display: block;
  margin-top: 3px;
  color: var(--color-ink-soft);
  font-family: var(--font-mono);
  font-size: .8rem;
}


/* =========================
   BOTÓN HISTORIAL
========================= */

.history-button-wrapper {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding: 1.25rem 2rem 1.5rem;
  border-top: 1px solid var(--color-line);
}

.history-button {
  padding: .85rem 1.5rem;
  border: 1px solid var(--color-line);
  border-radius: 12px;
  background: white;
  color: var(--color-steel);
  font-family: var(--font-body);
  font-size: .88rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    border-color .25s ease,
    color .25s ease,
    background .25s ease,
    transform .25s ease;
}

.history-button:hover {
  border-color: var(--color-rust);
  color: var(--color-rust);
  background: #fffaf9;
  transform: translateY(-1px);
}


/* =========================
   ESTADOS
========================= */

.loading-state,
.empty-state {
  padding: 30px 20px;
  margin: 0;
  color: var(--color-ink-soft);
  text-align: center;
}


/* =========================
   SUCCESS TOAST
========================= */

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
    0 12px 35px rgba(0, 0, 0, .12);
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
  font-size: .88rem;
  font-weight: 700;
}

.success-toast-content span {
  color: #4d6655;
  font-size: .78rem;
}

.success-toast-enter-active,
.success-toast-leave-active {
  transition:
    opacity .25s ease,
    transform .25s ease;
}

.success-toast-enter-from,
.success-toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}


/* =========================
   ERROR TOAST
========================= */

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
    0 12px 35px rgba(0, 0, 0, .12);
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
  font-size: .88rem;
  font-weight: 700;
}

.error-toast-content span {
  color: #7a4d4d;
  font-size: .78rem;
}

.error-toast-enter-active,
.error-toast-leave-active {
  transition:
    opacity .25s ease,
    transform .25s ease;
}

.error-toast-enter-from,
.error-toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}


/* =========================
   TABLET
========================= */

@media (max-width: 1000px) {

  .stock-layout {
    grid-template-columns: 280px minmax(0, 1fr);
    gap: 22px;
  }

}


/* =========================
   MOBILE / TABLET
========================= */

@media (max-width: 900px) {

  .stock-layout {
    grid-template-columns: 1fr;
  }

  .movement-card {
    position: static;
  }

  .movement-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.4rem;
  }

  .movement-form .button {
    grid-column: 1 / -1;
  }

  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .stock-section {
    height: auto;
    min-height: auto;
  }

  .alerts-scroll {
    flex: none;
    min-height: 0;
    max-height: 320px;
    overflow-y: auto;
    overflow-x: auto;
  }

}


/* =========================
   MOBILE
========================= */

@media (max-width: 600px) {

  .admin-stock-view {
    padding: 40px 14px 60px;
  }

  .page-header {
    margin-bottom: 1.5rem;
  }

  .page-header h1 {
    font-size: 2.1rem;
  }

  .stock-card {
    padding: 1.5rem;
  }

  .movement-form {
    grid-template-columns: 1fr;
  }

  .movement-form .button {
    grid-column: auto;
  }

  .table-header {
    padding: 1.25rem 1.5rem;
  }

  .admin-table {
    min-width: 500px;
  }

  .alerts-scroll {
    max-height: 320px;
    overflow-y: auto;
    overflow-x: auto;
  }

  .history-button-wrapper {
    padding: 1.1rem 1.25rem 1.35rem;
  }

  .history-button {
    width: 100%;
  }

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