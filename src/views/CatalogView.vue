<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import productsService from '../services/products.service';
import categoriesService from '../services/categories.service';
import ProductCard from '../components/ProductCard.vue';
import Pagination from '../components/Pagination.vue';

const route = useRoute();

const products = ref([]);
const categories = ref([]);
const loading = ref(true);
const error = ref('');

// Filter state. Everything starts empty: the backend ignores
// any filter that arrives as undefined/empty.
const filters = ref({
  name: route.query.search || '',
  categoryId: route.query.categoryId || '',
  available: route.query.available === 'true',
});

const page = ref(1);
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
    error.value = 'No se pudo cargar el catálogo. Intentá nuevamente.';
  } finally {
    loading.value = false;
  }
}

async function loadCategories() {
  const response = await categoriesService.list();
  categories.value = response.data;
}

function applyFilters() {
  page.value = 1;
  loadProducts();
}

function changePage(newPage) {
  page.value = newPage;
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

    <!-- ================= HEADER ================= -->
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


    <!-- ================= CONTENIDO ================= -->
    <div class="container catalog-body">

      <div class="catalog-layout">

        <!-- ================= FILTROS ================= -->
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

            <!-- Buscar -->
            <div class="field">

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


            <!-- Categoría -->
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


            <!-- Disponibilidad -->
            <label class="filter-checkbox">

              <input
                type="checkbox"
                v-model="filters.available"
              />

              <span>
                Solo disponibles
              </span>

            </label>


            <!-- Aplicar -->
            <button
              type="submit"
              class="button filter-button"
            >
              Aplicar 
            </button>

          </form>

        </aside>


        <!-- ================= PRODUCTOS ================= -->
        <main class="catalog-products">

          <p
            v-if="error"
            class="error-message"
          >
            {{ error }}
          </p>


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

/* =========================================================
   GENERAL
========================================================= */

.catalog-view {
  background: var(--color-bg);
  min-height: 100vh;
}

.container {
  width: min(1200px, calc(100% - 40px));
  margin: 0 auto;
}


/* =========================================================
   HEADER
========================================================= */

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


/* =========================================================
   CUERPO
========================================================= */

.catalog-body {
  padding: 55px 0 80px;
}

.catalog-layout {
  display: grid;

  grid-template-columns: 270px minmax(0, 1fr);

  gap: 40px;

  align-items: start;
}


/* =========================================================
   SIDEBAR
========================================================= */

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


/* =========================================================
   FORMULARIO
========================================================= */

.filters {
  display: flex;

  flex-direction: column;

  gap: 20px;
}

.field {
  display: flex;

  flex-direction: column;

  gap: 8px;
}

.field label {
  font-size: 0.84rem;

  font-weight: 700;

  color: var(--color-ink);
}

.field input,
.field select {
  width: 100%;

  box-sizing: border-box;

  padding: 12px 13px;

  border: 1px solid var(--color-line);

  border-radius: 10px;

  background: #fff;

  color: var(--color-ink);

  font: inherit;

  outline: none;

  transition:
    border-color .2s ease,
    box-shadow .2s ease;
}

.field input:focus,
.field select:focus {
  border-color: var(--color-rust);

  box-shadow:
    0 0 0 3px rgba(183, 53, 45, 0.1);
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


/* =========================================================
   PRODUCTOS
========================================================= */

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


/* =========================================================
   GRILLA
========================================================= */

.product-grid {
  display: grid;

  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap: 24px;
}


/* =========================================================
   ESTADOS
========================================================= */

.loading-state,
.empty-state {
  min-height: 300px;

  display: flex;

  flex-direction: column;

  justify-content: center;

  align-items: center;

  text-align: center;

  color: var(--color-ink-soft);
}

.empty-state {
  padding: 50px 20px;
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

.error-message {
  margin-bottom: 20px;

  padding: 14px 16px;

  border-radius: 10px;

  background: rgba(183, 53, 45, 0.08);

  color: var(--color-danger, #b7352d);

  font-size: 0.9rem;
}


/* =========================================================
   PAGINACIÓN
========================================================= */

.pagination-wrapper {
  display: flex;

  justify-content: center;

  margin-top: 45px;
}


/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1050px) {

  .catalog-layout {
    grid-template-columns: 230px minmax(0, 1fr);

    gap: 25px;
  }

  .product-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

}


@media (max-width: 800px) {

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