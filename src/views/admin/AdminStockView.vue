<script setup>
import { ref, onMounted } from 'vue';
import productsService from '../../services/products.service';
import stockService from '../../services/stock.service';
import InventoryTag from '../../components/InventoryTag.vue';

const alerts = ref([]);
const loadingAlerts = ref(true);

const form = ref({ productId: '', type: 'entry', quantity: 1, reason: '' });
const products = ref([]);
const message = ref('');
const error = ref('');

async function loadAlerts() {
  loadingAlerts.value = true;
  const response = await stockService.alerts();
  alerts.value = response.data;
  loadingAlerts.value = false;
}

async function loadProducts() {
  // Fetch a wide list for the form's product selector
  const response = await productsService.list(1, 100);
  products.value = response.data.data;
}

async function registerMovement() {
  error.value = '';
  message.value = '';
  try {
    await stockService.registerMovement(form.value);
    message.value = 'Movimiento registrado correctamente.';
    form.value.quantity = 1;
    form.value.reason = '';
    loadAlerts();
  } catch (e) {
    error.value = e.response?.data?.message || 'No se pudo registrar el movimiento';
  }
}

onMounted(() => {
  loadAlerts();
  loadProducts();
});
</script>

<template>
  <div class="container admin-stock-view">
    <h1>Stock</h1>

    <section class="stock-section">
      <h2>Registrar movimiento</h2>
      <form class="movement-form" @submit.prevent="registerMovement">
        <div class="field">
          <label for="productId">Producto</label>
          <select id="productId" v-model="form.productId" required>
            <option value="" disabled>Elegir producto...</option>
            <option v-for="p in products" :key="p.id" :value="p.id">{{ p.code }} — {{ p.name }}</option>
          </select>
        </div>
        <div class="field">
          <label for="type">Tipo</label>
          <select id="type" v-model="form.type">
            <option value="in">Entrada</option>
            <option value="out">Salida</option>
          </select>
        </div>
        <div class="field">
          <label for="quantity">Cantidad</label>
          <input id="quantity" v-model.number="form.quantity" type="number" min="1" required />
        </div>
        <div class="field">
          <label for="reason">Motivo (opcional)</label>
          <input id="reason" v-model="form.reason" type="text" placeholder="Ej: compra a proveedor" />
        </div>
        <p v-if="error" class="error-message">{{ error }}</p>
        <p v-if="message" class="success-message">{{ message }}</p>
        <button type="submit" class="button button-primary stock-button">Registrar</button>
      </form>
    </section>

    <section class="stock-section">
      <h2>Alertas de stock bajo</h2>
      <p v-if="loadingAlerts" class="loading-state">Cargando...</p>
      <p v-else-if="alerts.length === 0" class="empty-state">No hay productos con stock bajo. </p>
      <div v-else class="alerts-list">
        <div v-for="p in alerts" :key="p.id" class="alert-item">
          <span>{{ p.name }}</span>
          <InventoryTag :code="p.code" :stock="p.stock" :min-stock="p.minStock" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>

.admin-stock-view {
  padding: var(--space-5) var(--space-4);
}


/* Título */
.admin-stock-view h1 {

  font-size:2rem;

  font-weight:700;

  margin-bottom:var(--space-5);

}



/* Secciones */
.stock-section {

  background:var(--color-surface);

  border:1px solid var(--color-line);

  border-radius:16px;

  padding:1.5rem;

  margin-bottom:1.5rem;

  box-shadow:0 8px 25px rgba(0,0,0,.08);

}



/* Títulos dentro de tarjetas */
.stock-section h2 {

  font-size:1.2rem;

  font-weight:700;

  margin-bottom:1rem;

}

.stock-button {
  width: auto;
  align-self: flex-start;
  padding: .7rem 1.3rem;
}

/* Formularios */
.movement-form {

  display:flex;

  flex-direction:column;

  gap:1rem;

}



.movement-form .field {

  max-width:360px;

}



.field label {

  display:block;

  margin-bottom:.4rem;

  font-size:.85rem;

  font-weight:600;

  color:var(--color-ink-soft);

}



.field input,
.field select {

  width:100%;

  padding:.7rem 1rem;

  border-radius:12px;

  border:1px solid var(--color-line);

  background:var(--color-surface);

}



.field input:focus,
.field select:focus {

  outline:none;

  border-color:var(--color-steel);

}



/* Botones */
.button-primary {

  background:var(--color-steel);

  color:white;

  padding:.7rem 1.3rem;

  border-radius:12px;

  border:none;

  font-weight:600;

  cursor:pointer;

  transition:.2s;

  box-shadow:0 4px 12px rgba(0,0,0,.12);

}



.button-primary:hover {

  transform:translateY(-2px);

  opacity:.9;

}



/* Alertas de stock */
.alerts-list {

  display:flex;

  flex-direction:column;

  gap:.8rem;

}



.alert-item {

  display:flex;

  justify-content:space-between;

  align-items:center;

  padding:1rem;

  border-radius:12px;

  background:#fff7ed;

  border:1px solid #fed7aa;

}



.alert-item:hover {

  transform:translateY(-1px);

}



/* Producto en alerta */
.alert-item strong {

  font-weight:700;

}



.alert-item span {

  font-family:var(--font-mono);

  font-weight:600;

}



/* Tabla si existe */
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

}



.admin-table tbody tr:hover {

  background:rgba(0,0,0,.025);

}



/* Loading */
.loading-state {

  text-align:center;

  padding:2rem;

  color:var(--color-ink-soft);

}



/* Responsive */
@media(max-width:900px){

  .stock-section {

    padding:1rem;

  }

}

</style>