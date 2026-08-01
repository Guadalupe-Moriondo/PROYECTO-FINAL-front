<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import productsService from '../../services/products.service';
import Pagination from '../../components/Pagination.vue';
import InventoryTag from '../../components/InventoryTag.vue';

const products = ref([]);
const loading = ref(true);
const page = ref(1);
const totalPages = ref(1);
const message = ref('');

async function load() {
  loading.value = true;
  const response = await productsService.list(page.value, 10);
  products.value = response.data.data;
  totalPages.value = response.data.totalPages;
  loading.value = false;
}

function changePage(newPage) {
  page.value = newPage;
  load();
}

async function remove(product) {
  if (!confirm(`¿Dar de baja "${product.name}"?`)) return;
  await productsService.remove(product.id);
  load();
}


function imageUrl(product) {
  if (!product.imageUrl) return null;
  return `${import.meta.env.VITE_API_URL}${product.imageUrl}`;
}

onMounted(load);
</script>

<template>
  <div class="container admin-products-view">

    <!-- ================= HEADER ================= -->
    <header class="products-page-header">

      <div>
        <h1>
          Productos
        </h1>
      </div>


      <RouterLink
        :to="{ name: 'admin-product-new' }"
        class="new-product-button"
      >

        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z"
          />
        </svg>

        Nuevo producto

      </RouterLink>

    </header>


    <!-- ================= MENSAJE ================= -->
    <p
      v-if="message"
      class="success-message"
    >

      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path
          d="M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19Zm4.2 7.2-5.1 5.1-3-3 1.4-1.4 1.6 1.6 3.7-3.7 1.4 1.4Z"
        />
      </svg>

      {{ message }}

    </p>


    <!-- ================= LOADING ================= -->
    <p
      v-if="loading"
      class="loading-state"
    >
      Cargando productos...
    </p>


    <!-- ================= TABLA ================= -->
    <div
      v-else
      class="products-table-wrapper"
    >

      <table class="admin-table">

        <thead>

          <tr>

            <th>
              Producto
            </th>

            <th>
              Stock
            </th>

            <th>
              Precio
            </th>

            <th class="actions-column">
              Acciones
            </th>

          </tr>

        </thead>


        <tbody>

          <tr
            v-for="product in products"
            :key="product.id"
            class="product-row"
          >

            <!-- ================= PRODUCTO ================= -->
            <td>

              <div class="product-info">

                <div class="product-thumbnail">

                  <img
                    v-if="imageUrl(product)"
                    :src="imageUrl(product)"
                    :alt="product.name"
                  />

                  <div
                    v-else
                    class="product-thumbnail-empty"
                  >

                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v12h14V6H5Zm2 2h4v4H7V8Zm6 0h4v2h-4V8Zm0 4h4v2h-4v-2ZM7 14h4v2H7v-2Z"
                      />
                    </svg>

                  </div>

                </div>


                <div class="product-text">

                  <strong class="product-name">
                    {{ product.name }}
                  </strong>

                  <span class="product-brand">
                    {{ product.brand }}
                  </span>

                  <span class="product-code">
                    Código: {{ product.code }}
                  </span>

                </div>

              </div>

            </td>


            <!-- ================= STOCK ================= -->
            <td>

              <InventoryTag
                :code="product.code"
                :stock="product.stock"
                :min-stock="product.minStock"
              />

            </td>


            <!-- ================= PRECIO ================= -->
            <td>

              <span class="table-price">
                $
                {{
                  Number(product.price)
                    .toLocaleString('es-AR')
                }}
              </span>

            </td>


            


            <!-- ================= ACCIONES ================= -->
            <td>

              <div class="table-actions">

                <RouterLink
                  :to="{
                    name: 'admin-product-edit',
                    params: {
                      id: product.id
                    }
                  }"
                  class="action-button edit-button"
                  title="Editar producto"
                >

                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M4 17.3V20h2.7L17.8 8.9l-2.7-2.7L4 17.3Zm15.7-9.6a1 1 0 0 0 0-1.4l-1.9-1.9a1 1 0 0 0-1.4 0l-1.3 1.3 2.7 2.7 1.9-1.9Z"
                    />
                  </svg>
                </RouterLink>


                <button
                  type="button"
                  class="action-button delete-button"
                  @click="remove(product)"
                  title="Dar de baja"
                >

                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M6 7h12v13H6V7Zm2 2v9h2V9H8Zm4 0v9h2V9h-2Zm5-5V2h-2v2H9V2H7v2H4v2h16V4h-3Z"
                    />
                  </svg>

                </button>

              </div>

            </td>

          </tr>

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

.admin-products-view {
  padding: 55px 0 80px;
}


/* =========================================================
   HEADER
========================================================= */

.products-page-header {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 25px;

  margin-bottom: 30px;
}

.products-eyebrow {
  margin: 0 0 7px;

  color: var(--color-rust);

  font-family: var(--font-mono);

  font-size: 0.72rem;
  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: 0.14em;
}

.products-page-header h1 {
  margin: 0;

  color: var(--color-ink);

  font-size: clamp(2.1rem, 4vw, 2.8rem);

  line-height: 1.05;
}

.products-description {
  margin: 10px 0 0;

  color: var(--color-ink-soft);

  font-size: 0.95rem;

  line-height: 1.6;
}


/* =========================================================
   NUEVO PRODUCTO
========================================================= */

.new-product-button {
  display: inline-flex;

  align-items: center;
  justify-content: center;

  gap: 8px;

  padding: 13px 18px;

  border-radius: 10px;

  background: var(--color-rust);

  color: #fff;

  text-decoration: none;

  font-size: 0.85rem;

  font-weight: 700;

  white-space: nowrap;

  transition:
    background .2s ease,
    transform .2s ease,
    box-shadow .2s ease;
}

.new-product-button svg {
  width: 17px;
  height: 17px;
}

.new-product-button:hover {
  background: var(--color-rust-dark);

  transform: translateY(-1px);

  box-shadow:
    0 8px 20px rgba(183, 53, 45, 0.20);
}


/* =========================================================
   MENSAJE
========================================================= */

.success-message {
  display: flex;

  align-items: center;

  gap: 9px;

  margin-bottom: 20px;

  padding: 13px 16px;

  border: 1px solid rgba(45, 151, 84, .16);

  border-radius: 12px;

  background: rgba(45, 151, 84, .07);

  color: #258148;

  font-size: 0.82rem;

  font-weight: 600;
}

.success-message svg {
  width: 17px;
  height: 17px;
}


/* =========================================================
   TABLA
========================================================= */

.products-table-wrapper {
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

  min-width: 1050px;

  border-collapse: separate;

  border-spacing: 0;
}


/* =========================================================
   HEADER
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

  letter-spacing: .06em;
}


/* =========================================================
   FILAS
========================================================= */

.admin-table td {
  padding: 17px 20px;

  border-bottom: 1px solid var(--color-line);

  vertical-align: middle;
}

.product-row {
  transition:
    background .2s ease;
}

.product-row:hover {
  background:
    rgba(48, 47, 47, 0.025);
}

.admin-table tbody tr:last-child td {
  border-bottom: none;
}


/* =========================================================
   PRODUCTO
========================================================= */

.product-info {
  display: flex;

  align-items: center;

  gap: 14px;

  min-width: 260px;
}

.product-thumbnail {
  width: 58px;
  height: 58px;

  flex: 0 0 58px;

  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 12px;

  background:
    rgba(0, 0, 0, .035);

  border: 1px solid var(--color-line);
}

.product-thumbnail img {
  width: 100%;
  height: 100%;

  object-fit: cover;
}

.product-thumbnail-empty {
  display: flex;

  align-items: center;
  justify-content: center;

  color: var(--color-ink-soft);
}

.product-thumbnail-empty svg {
  width: 21px;
  height: 21px;
}

.product-text {
  display: flex;

  flex-direction: column;

  min-width: 0;
}

.product-name {
  color: var(--color-ink);

  font-size: 0.9rem;

  line-height: 1.3;
}

.product-brand {
  margin-top: 3px;

  color: var(--color-rust);

  font-size: 0.77rem;

  font-weight: 700;
}

.product-code {
  margin-top: 3px;

  color: var(--color-ink-soft);

  font-family: var(--font-mono);

  font-size: 0.7rem;
}


/* =========================================================
   PRECIO
========================================================= */

.table-price {
  color: var(--color-ink);

  font-family: var(--font-mono);

  font-size: 0.87rem;

  font-weight: 700;

  white-space: nowrap;
}


/* =========================================================
   IMAGEN
========================================================= */

.image-upload {
  display: flex;

  justify-content: center;
}

.image-button {
  position: relative;

  width: 72px;
  height: 72px;

  padding: 0;

  overflow: hidden;

  border: 1px solid var(--color-line);

  border-radius: 13px;

  background:
    rgba(0, 0, 0, 0.025);

  cursor: pointer;
}

.product-image {
  display: block;

  width: 100%;
  height: 100%;

  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;

  display: flex;

  align-items: center;
  justify-content: center;

  color: var(--color-ink-soft);
}

.no-image svg {
  width: 22px;
  height: 22px;
}

.image-overlay {
  position: absolute;

  inset: 0;

  display: flex;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 5px;

  background:
    rgba(0, 0, 0, .62);

  color: #fff;

  font-size: .7rem;

  font-weight: 700;

  opacity: 0;

  transition:
    opacity .2s ease;
}

.image-overlay svg {
  width: 18px;
  height: 18px;
}

.image-button:hover .image-overlay {
  opacity: 1;
}


/* =========================================================
   ACCIONES
========================================================= */

.actions-column {
  text-align: right;
}

.table-actions {
  display: flex;

  align-items: center;
  justify-content: flex-end;

  gap: 8px;

  white-space: nowrap;
}

.action-button {
  display: inline-flex;

  align-items: center;
  justify-content: center;

  gap: 7px;

  min-height: 36px;

  padding: 0 11px;

  border-radius: 9px;

  font-size: .77rem;

  font-weight: 700;

  text-decoration: none;

  cursor: pointer;

  transition:
    transform .2s ease,
    background .2s ease;
}

.action-button svg {
  width: 16px;
  height: 16px;
}

.action-button:hover {
  transform: translateY(-1px);
}


/* Editar */

.edit-button {
  border: 1px solid rgba(37, 99, 235, .16);

  background:
    rgba(37, 99, 235, .09);

  color: #2563eb;
}

.edit-button:hover {
  background:
    rgba(37, 99, 235, .15);
}


/* Eliminar */

.delete-button {
  border: 1px solid rgba(183, 53, 45, .14);

  background:
    rgba(183, 53, 45, .07);

  color: var(--color-rust);
}

.delete-button:hover {
  background:
    rgba(183, 53, 45, .13);
}


/* =========================================================
   LOADING
========================================================= */

.loading-state {
  padding: 60px 0;

  text-align: center;

  color: var(--color-ink-soft);

  font-family: var(--font-mono);

  font-size: .85rem;
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
   RESPONSIVE
========================================================= */

@media (max-width: 900px) {

  .products-page-header {
    align-items: flex-start;

    flex-direction: column;
  }

  .new-product-button {
    width: 100%;
  }

}

@media (max-width: 600px) {

  .admin-products-view {
    padding: 40px 14px 60px;
  }

}
</style>