<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import productsService from '../services/products.service';
import categoriesService from '../services/categories.service';
import ProductCard from '../components/ProductCard.vue';
import Pagination from '../components/Pagination.vue';

const route = useRoute();
const router = useRouter();

const products = ref([]);
const categories = ref([]);
const loading = ref(true);
const error = ref('');
let errorTimeout = null;

const filters = ref({
  name: route.query.search || '',
  categoryId: route.query.categoryId || '',
  available: route.query.available === 'true',
});

const page = ref(Number(route.query.page) || 1);
const totalPages = ref(1);
const limit = 12;

async function loadProducts() {
  loading.value = true;
  error.value = '';
  try {
    const response = await productsService.search({
      name: filters.value.name || undefined,
      categoryId: filters.value.categoryId || undefined,
      available: filters.value.available || undefined,
      page: page.value,
      limit,
    });
    products.value = response.data.data;
    totalPages.value = response.data.totalPages;
  } catch (e) {
    console.error('Error al cargar el catálogo:', e);
    error.value = 'No se pudo cargar el catálogo. Intentá nuevamente.';

    if (errorTimeout) {
      clearTimeout(errorTimeout);
    }

    errorTimeout = setTimeout(() => {
      error.value = '';
    }, 3000);
  } finally {
    loading.value = false;
  }
}

async function loadCategories() {
  const response = await categoriesService.list();
  categories.value = response.data.data;
}

function applyFilters() {
  page.value = 1;
  router.replace({ query: { ...route.query, page: 1 } });
  loadProducts();
}

function changePage(newPage) {
  page.value = newPage;
  router.replace({ query: { ...route.query, page: newPage } });
  loadProducts();
}

onMounted(() => {
  loadCategories();
  loadProducts();
});

// Si el usuario elige otra categoría desde el menú hamburguesa mientras
// ya está en el catálogo, Vue reutiliza el componente y "onMounted" no
// se vuelve a disparar, así que escuchamos el cambio de query acá.
watch(
  () => route.query.categoryId,
  (newCategoryId) => {
    filters.value.categoryId = newCategoryId || '';
    applyFilters();
  },
);

watch(
  () => route.query.search,
  (newSearch) => {
    filters.value.name = newSearch || '';
    applyFilters();
  },
);

watch(
  () => route.query.available,
  (newAvailable) => {
    filters.value.available = newAvailable === 'true';
    applyFilters();
  },
);
</script>

<template>
  <div class="catalog-view">
    <section class="catalog-header">
      <div class="container catalog-header-inner">

        <p class="section-eyebrow">
          Repuestos y accesorios
        </p>

        <h1 class="catalog-title">
          Catálogo
        </h1>
      </div>
    </section>

    <div class="container catalog-body">
      <div class="catalog-layout">
        <aside class="filters-sidebar">

          <div class="filters-header">
            <h2>
              Buscá tu repuesto
            </h2>

          </div>

          <form
            class="filters"
            @submit.prevent="applyFilters"
          >
            <div class="field field--search">

              <label for="search">
                Buscar
              </label>

              <input
                id="search"
                v-model="filters.name"
                type="text"
                placeholder="Nombre o código..."
              />
            </div>

            <div class="field">

              <label for="category">
                Categoría
              </label>

              <select
                id="category"
                v-model="filters.categoryId"
              >
                <option value="">
                  Todas las categorías
                </option>

                <option
                  v-for="cat in categories"
                  :key="cat.id"
                  :value="cat.id"
                >
                  {{ cat.name }}
                </option>

              </select>
            </div>

            <label class="filter-checkbox">

              <input
                type="checkbox"
                v-model="filters.available"
              />

              <span>
                Solo disponibles
              </span>

            </label>

            <button
              type="submit"
              class="button filter-button"
            >
              Aplicar 
            </button>

          </form>
        </aside>

        <main class="catalog-products">

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

          <p
            v-if="loading"
            class="loading-state"
          >
            Cargando catálogo...
          </p>

          <template v-else>

            <div
              v-if="products.length === 0"
              class="empty-state"
            >
              <h3>
                No encontramos productos
              </h3>

              <p>
                Probá cambiar los filtros de búsqueda.
              </p>
            </div>

            <div
              v-else
              class="product-grid"
            >
              <ProductCard
                v-for="product in products"
                :key="product.id"
                :product="product"
              />

            </div>

            <div class="pagination-wrapper">

              <Pagination
                :page="page"
                :total-pages="totalPages"
                @change-page="changePage"
              />
            </div>

          </template>
        </main>
      </div>
    </div>
  </div>
</template>


<style scoped>
.catalog-view {
  background: var(--color-bg);
  min-height: 100vh;
}

.container {
  width: min(1200px, calc(100% - 40px));
  margin: 0 auto;
}

.catalog-header {
  background:
    linear-gradient(
      135deg,
      var(--color-steel),
      var(--color-steel-light)
    );

  border-bottom: 3px solid var(--color-rust);
}

.catalog-header-inner {
  padding: 65px 0 55px;
}

.section-eyebrow {
  margin: 0 0 8px;
  color: var(--color-rust);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
}

.catalog-title {
  margin: 0;
  color: #fff;
  font-size: clamp(2.5rem, 5vw, 4rem);
  line-height: 1;
}

.catalog-description {
  max-width: 620px;
  margin: 16px 0 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  line-height: 1.6;
}

.catalog-body {
  padding: 55px 0 80px;
}

.catalog-layout {
  display: grid;
  grid-template-columns: 270px minmax(0, 1fr);
  gap: 40px;
  align-items: start;
}

.filters-sidebar {
  position: sticky;
  top: 25px;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: 20px;
  padding: 25px;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.05);
}

.filters-header {
  margin-bottom: 24px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--color-line);
}

.filters-eyebrow {
  margin: 0 0 6px;
  color: var(--color-rust);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.filters-header h2 {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.25;
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: var(--color-ink-soft);
  font-size: 0.9rem;
}

.filter-checkbox input {
  width: 17px;
  height: 17px;
  accent-color: var(--color-rust);
  cursor: pointer;
}

.filter-button {
  width: 100%;
  padding: 13px 18px;
  border: none;
  border-radius: 10px;
  background: var(--color-rust);
  color: #fff;
  font-family: var(--font-display);
  font-weight: 700;
  cursor: pointer;
  transition:
    background .2s ease,
    transform .2s ease;
}

.filter-button:hover {
  background: var(--color-rust-dark);
  transform: translateY(-1px);
}

.catalog-products {
  min-width: 0;
}

.products-topbar {
  display: flex;
  justify-content: space-between;
  align-items: end;
  margin-bottom: 25px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--color-line);
}

.products-eyebrow {
  margin: 0 0 5px;
  color: var(--color-rust);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.products-topbar h2 {
  margin: 0;
  font-size: 1.8rem;
  line-height: 1.1;
}

.product-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap: 24px;
}

.empty-state h3 {
  margin: 0 0 8px;
  color: var(--color-ink);
  font-size: 1.3rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.95rem;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 45px;
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
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.error-toast-enter-from,
.error-toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 1200px) {
  
  .catalog-layout {
    grid-template-columns: 230px minmax(0, 1fr);
    gap: 25px;
  }

  .product-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {

  .catalog-layout {
    grid-template-columns: 1fr;
  }

  .filters-sidebar {
    position: static;
  }

  .filters {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .filter-checkbox {
    grid-column: 1 / -1;
  }

  .filter-button {
    grid-column: 1 / -1;
  }
}


@media (max-width: 600px) {
  
  .container {
    width: min(100% - 28px, 1200px);
  }

  .catalog-header-inner {
    padding: 45px 0;
  }

  .catalog-title {
    font-size: 2.5rem;
  }

  .catalog-body {
    padding: 35px 0 60px;
  }

  .filters {
    grid-template-columns: 1fr;
  }

  .filter-checkbox,
  .filter-button {
    grid-column: auto;
  }

  .product-grid {
    grid-template-columns: 1fr;
  }

  .products-topbar h2 {
    font-size: 1.5rem;
  }
}
</style>