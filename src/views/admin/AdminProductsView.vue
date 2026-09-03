<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import productsService from '../../services/products.service';
import Pagination from '../../components/Pagination.vue';
import InventoryTag from '../../components/InventoryTag.vue';

const route = useRoute();
const router = useRouter();

const products = ref([]);
const loading = ref(true);
const page = ref(1);
const totalPages = ref(1);
const message = ref('');
const search = ref('');
let searchTimeout = null;

async function load() {
  loading.value = true;

  try {
    let response;

    if (search.value.trim()) {
      response = await productsService.search({
        name: search.value.trim(),
        page: page.value,
        limit: 10,
      });
    } else {
      response = await productsService.list(page.value, 10);
    }

    products.value = response.data.data;
    totalPages.value = response.data.totalPages;
  } catch (error) {
    console.error('Error cargando productos:', error);
    products.value = [];
    totalPages.value = 1;
  } finally {
    loading.value = false;
  }
}

function changePage(newPage) {
  page.value = newPage;
  router.replace({ query: { ...route.query, page: newPage } });
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

async function remove(product) {
  if (!confirm(`¿Dar de baja "${product.name}"?`)) return;

  await productsService.remove(product.id);
  load();
}

function imageUrl(product) {
  if (!product.imageUrl) return null;

  return `${import.meta.env.VITE_API_URL}${product.imageUrl}`;
}

onMounted(async () => {
  const queryPage = Number(route.query.page);

  if (queryPage > 0) {
    page.value = queryPage;
  }

  await load();

  if (route.query.success === 'created') {
    message.value = '¡Producto creado correctamente!';

    setTimeout(() => {
      message.value = '';
    }, 3000);
  }

  if (route.query.success === 'updated') {
    message.value = '¡Producto actualizado correctamente!';

    setTimeout(() => {
      message.value = '';
    }, 3000);
  }
});
</script>

<template>
  <div class="container admin-products-view">
    <!-- ================= HEADER ================= -->
    <header class="products-page-header">
      <div class="products-title-section">
        <h1>Productos</h1>
      </div>
      <!-- BUSCADOR + BOTÓN -->
      <div class="products-tools">
        <div class="products-search">
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
              ></circle>

              <path d="m20 20-4-4"></path>
            </svg>

            <input
              v-model="search"
              type="text"
              placeholder="Buscar por nombre, código, descripción o marca..."
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
      </div>
    </header>
    <!-- ================= MENSAJE ================= -->
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

          <span>
            Los cambios se guardaron correctamente.
          </span>
        </div>
      </div>
    </Transition>
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
      <table class="admin-table admin-table--detailed">
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

            <th class="actions-column"></th>

          </tr>
        </thead>

        <tbody>
          <tr
            v-for="product in products"
            :key="product.id"
            class="product-row"
          >
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

                  <span
                    v-if="product.category"
                    class="product-brand"
                  >
                    {{ product.category.name }}
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
                    params: {id: product.id},
                    query: { page }
                  }"
                  class="icon-button edit-button"
                  title="Editar producto"
                  
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" >
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                  </svg>
                </RouterLink>

                <button
                  type="button"
                  class="icon-button delete-button"
                  @click="remove(product)"
                  title="Dar de baja"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" >
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6"/>
                    <path d="M14 11v6"/>
                    <path d="M9 6V4h6v2"/>
                  </svg>

                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <Pagination :page="page" :total-pages="totalPages" @change-page="changePage"/>

  </div>
</template>


<style scoped>
.admin-products-view {
  padding: 2.5rem var(--space-4) 4rem;
}

.products-page-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 30px;
}

.products-title-section {
  width: 100%;
}

.products-page-header h1 {
  margin: 0;
  color: var(--color-ink);
  font-size: clamp(2.1rem, 4vw, 2.8rem);
  line-height: 1.05;
}

.products-tools {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
}

.products-search {
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
  height: 50px;
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

.search-clear:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--color-rust);
}

.new-product-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  padding: 0 18px;
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

.products-table-wrapper {
  width: 100%;
  overflow-x: auto;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: 20px;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.06);
}

.admin-table--detailed {
  min-width: 1050px;
}

.product-row {
  transition:
    background .2s ease;
}

.product-row:hover {
  background:
    rgba(48, 47, 47, 0.025);
}

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
  font-size: 0.78rem;
  font-weight: 700;
}

.product-code {
  margin-top: 3px;
  color: var(--color-ink-soft);
  font-family: var(--font-mono);
  font-size: 0.8rem;
}

.table-price {
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: 1rem;
}

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

@media (max-width: 900px) {

  .products-page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .products-tools {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
  }

  .products-search {
    width: 100%;
    transform: none;
  }


  .new-product-button {
    width: 100%;
    
  }

}

@media (max-width: 600px) {
  .admin-products-view {
    padding: 40px 14px 60px;
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