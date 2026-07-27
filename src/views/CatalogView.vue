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
    <!-- ENCABEZADO OSCURO, MISMO LENGUAJE QUE EL HERO DEL HOME -->
    <section class="catalog-header">
      <div class="container catalog-header-inner">
        <p class="section-eyebrow">Repuestos y accesorios</p>
        <h1 class="catalog-title">Catálogo</h1>
      </div>
    </section>

    <div class="container catalog-body">
      <form class="filters" @submit.prevent="applyFilters">
        <div class="field field-inline">
          <label for="search">Buscar</label>
          <input id="search" v-model="filters.name" type="text" placeholder="Nombre o código..." />
        </div>
        <div class="field field-inline">
          <label for="category">Categoría</label>
          <select id="category" v-model="filters.categoryId">
            <option value="">Todas</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
        <label class="filter-checkbox">
          <input type="checkbox" v-model="filters.available" />
          Solo disponibles
        </label>
        <button type="submit" class="button button-primary">Buscar</button>
      </form>

      <p v-if="error" class="error-message">{{ error }}</p>

      <p v-if="loading" class="loading-state">Cargando catálogo...</p>

      <template v-else>
        <p v-if="products.length === 0" class="empty-state">
          No encontramos repuestos con ese nombre/código.
        </p>

        <div v-else class="product-grid">
          <ProductCard v-for="product in products" :key="product.id" :product="product" />
        </div>

        <Pagination :page="page" :total-pages="totalPages" @change-page="changePage" />
      </template>
    </div>
  </div>
</template>

<style scoped>
.catalog-header {
  background: var(--color-steel);
  background-image: linear-gradient(135deg, var(--color-steel) 0%, var(--color-steel-light) 100%);
  border-bottom: 3px solid var(--color-rust);
}
.catalog-header-inner {
  padding: var(--space-5) var(--space-4);
}
.section-eyebrow {
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.8rem;
  color: var(--color-safety);
  margin: 0 0 var(--space-1);
}
.catalog-title {
  color: #fff;
  margin: 0;
  font-size: 2.4rem;
}
.catalog-body {
  padding: var(--space-5) var(--space-4);
}
.filters {
  display: flex;
  align-items: end;
  gap: var(--space-3);
  flex-wrap: wrap;
  margin-bottom: var(--space-5);
  padding: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-left: 3px solid var(--color-rust);
  border-radius: var(--radius-md);
}
.field-inline {
  margin-bottom: 0;
  min-width: 200px;
}
.filter-checkbox {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.9rem;
  color: var(--color-ink-soft);
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: var(--space-4);
}
.loading-state,
.empty-state {
  font-family: var(--font-mono);
  color: var(--color-ink-soft);
  padding: var(--space-5) 0;
  text-align: center;
}

@media (max-width: 600px) {
  .catalog-title { font-size: 1.8rem; }
}
</style>
