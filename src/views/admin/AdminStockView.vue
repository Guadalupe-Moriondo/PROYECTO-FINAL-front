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

    <header class="page-header">
      <h1>
        Gestión de Stock
      </h1>
    </header>

    <!-- ================= MOVIMIENTO ================= -->

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

          <select
            id="productId"
            v-model="form.productId"
            required
          >
            <option
              value=""
              disabled
            >
              Elegir producto...
            </option>

            <option
              v-for="p in products"
              :key="p.id"
              :value="p.id"
            >
              {{ p.code }} — {{ p.name }}
            </option>

          </select>

        </div>

        <div class="field">

          <label for="type">
            Tipo
          </label>

          <select
            id="type"
            v-model="form.type"
          >
            <option value="in">
              Entrada
            </option>

            <option value="out">
              Salida
            </option>

          </select>

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

      <p
        v-if="error"
        class="error-message"
      >
        {{ error }}
      </p>

      <p
        v-if="message"
        class="success-message"
      >
        {{ message }}
      </p>

      <button
        class="button-primary"
        @click="registerMovement"
      >

        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M11 5h2v14h-2zm-6 6h14v2H5z"/>
        </svg>

        Registrar 

      </button>

    </section>



    <!-- ================= ALERTAS ================= -->

    <section class="table-card">

      <div class="table-header">

        <h2>
          Alertas de stock bajo
        </h2>

        <span>
          {{ alerts.length }} productos
        </span>

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

        <table class="admin-table">

          <thead>

            <tr>

              <th>Producto</th>

              <th>Código</th>

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

                {{ product.code }}

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

    </section>

  </div>
</template>

<style scoped>

.admin-stock-view{
    padding:2.5rem 0 4rem;
}

/*================ HEADER ================*/

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

/*================ CARDS ================*/

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

/*================ TITULOS ================*/

.section-title{

    margin:0 0 2rem;

    font-size:1.35rem;

    color:var(--color-steel);

}

/*================ FORM ================*/

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

/*================ BOTON ================*/

.button-primary{

    display:inline-flex;

    align-items:center;

    justify-content:center;

    gap:.8rem;

    height:48px;

    padding:0 1.6rem;

    border:none;

    border-radius:14px;

    background:linear-gradient(135deg,#b91c1c,#dc2626);

    color:white;

    font-weight:700;

    cursor:pointer;

    transition:.25s;

}

.button-primary svg{

    width:18px;

    height:18px;

}

.button-primary:hover{

    transform:translateY(-2px);

    box-shadow:0 14px 28px rgba(185,28,28,.28);

}

/*================ MENSAJES ================*/

.success-message{

    margin-bottom:1rem;

    padding:1rem;

    border-radius:14px;

    background:#ecfdf5;

    color:#15803d;

}

.error-message{

    margin-bottom:1rem;

    padding:1rem;

    border-radius:14px;

    background:#fff1f2;

    color:#be123c;

}

/*================ TABLA ================*/

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

    background:#f3f4f6;

    color:var(--color-ink-soft);

    font-size:.85rem;

    font-weight:600;

}

.table-scroll{

    overflow-x:auto;

}

.admin-table{

    width:100%;

    border-collapse:collapse;

}

.admin-table th{

    padding:1rem 1.5rem;

    text-align:left;

    background:#fafafa;

    text-transform:uppercase;

    letter-spacing:.08em;

    font-size:.75rem;

    color:var(--color-ink-soft);

}

.admin-table td{

    padding:1.2rem 1.5rem;

    border-top:1px solid var(--color-line);

}

.admin-table tbody tr{

    transition:.2s;

}

.admin-table tbody tr:hover{

    background:#fafafa;

}

/*================ ESTADOS ================*/

.loading-state,
.empty-state{

    text-align:center;

    padding:3rem;

    color:var(--color-ink-soft);

}

/*================ RESPONSIVE ================*/

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

</style>