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
const uploadingImageId = ref(null);
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

// Triggers the hidden file input for the matching product
function selectImage(productId) {
  uploadingImageId.value = productId;
  document.getElementById(`image-input-${productId}`).click();
}

async function onFileSelected(event, product) {
  const file = event.target.files[0];
  if (!file) return;
  message.value = '';
  try {
    await productsService.uploadImage(product.id, file);
    message.value = `Imagen actualizada para "${product.name}".`;
    load();
  } catch (e) {
    message.value = 'No se pudo subir la imagen (revisá el formato y el tamaño).';
  } finally {
    uploadingImageId.value = null;
    event.target.value = ''; // allow picking the same file again if needed
  }
}

function imageUrl(product) {
  if (!product.imageUrl) return null;
  return `${import.meta.env.VITE_API_URL}${product.imageUrl}`;
}

onMounted(load);
</script>

<template>
  <div class="container admin-products-view">
    <header class="admin-header">
      <h1>Productos</h1>
      <RouterLink :to="{ name: 'admin-product-new' }" class="button button-primary">
        + Nuevo producto
      </RouterLink>
    </header>

    <p v-if="message" class="success-message">{{ message }}</p>
    <p v-if="loading" class="loading-state">Cargando...</p>

    <table v-else class="admin-table">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Stock</th>
          <th>Precio</th>
          <th>Imagen</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td>
            <p class="table-name">{{ product.name }}</p>
            <p class="table-subtext">{{ product.brand }}</p>
          </td>
          <td>
            <InventoryTag :code="product.code" :stock="product.stock" :min-stock="product.minStock" />
          </td>
          <td class="table-price">$ {{ Number(product.price).toLocaleString('es-AR') }}</td>
          <td class="product-image-cell">
            <input
              :id="`image-input-${product.id}`"
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              class="visually-hidden"
              @change="onFileSelected($event, product)"
            />
            <button 
              class="image-button"
              @click="selectImage(product.id)"
              :title="'Cambiar imagen'"
            >
              <img
                v-if="imageUrl(product)"
                :src="imageUrl(product)"
                :alt="product.name"
                class="product-image"
              />
              <span v-else class="no-image">
                Sin foto
              </span>
              <div class="image-overlay">
                 Cambiar foto
              </div>
            </button>
          </td>
          <td class="table-actions">
            <RouterLink :to="{ name: 'admin-product-edit', params: { id: product.id } }">
              Editar
            </RouterLink>
            <button class="link-button link-button-danger" @click="remove(product)">Dar de baja</button>
          </td>
        </tr>
      </tbody>
    </table>

    <Pagination :page="page" :total-pages="totalPages" @change-page="changePage" />
  </div>
</template>

<style scoped>
.admin-products-view {
  padding: var(--space-5) var(--space-4);
}

/* Header */
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-5);
}

.admin-header h1 {
  font-size: 2rem;
  font-weight: 700;
}


/* Botón nuevo producto */
.button-primary {
  background: var(--color-steel);
  color: white;
  padding: 0.7rem 1.3rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: all .2s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,.12);
}

.button-primary:hover {
  transform: translateY(-2px);
  opacity: .9;
}


/* Mensajes */
.success-message {
  background: #e8f7ec;
  color: #207a3c;
  padding: .8rem 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
}


/* Tabla */
.admin-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  overflow: hidden;

  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: 16px;

  box-shadow: 0 8px 25px rgba(0,0,0,.08);
}


.admin-table th {
  text-align: left;
  padding: 1rem 1.2rem;

  background: rgba(0,0,0,.03);

  font-family: var(--font-display);
  text-transform: uppercase;
  font-size: .75rem;

  color: var(--color-ink-soft);
}


.admin-table td {
  padding: 1rem 1.2rem;
  border-top: 1px solid var(--color-line);

  vertical-align: middle;
}


/* Hover fila */
.admin-table tbody tr {
  transition: background .2s ease;
}

.admin-table tbody tr:hover {
  background: rgba(0,0,0,.025);
}


/* Texto producto */
.table-name {
  margin: 0;
  font-weight: 700;
  font-size: 1rem;
}

.table-subtext {
  margin-top: .25rem;
  font-size: .85rem;
  color: var(--color-ink-soft);
}


/* Precio */
.table-price {
  font-family: var(--font-mono);
  font-weight: 600;
}


/* Acciones */
.table-actions {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: .6rem;
  white-space: nowrap;
}

.table-actions a,
.link-button {
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 .9rem;
  box-sizing: border-box;
}


/* Botones generales */
.link-button {
  border: none;
  cursor: pointer;

  padding: .45rem .85rem;

  border-radius: 8px;

  font-size: .85rem;


  text-decoration: none;

  transition: all .2s ease;
}


.product-image-cell {
  text-align:center;
}


.image-button {
  position:relative;

  width:70px;
  height:70px;

  border:none;
  padding:0;

  cursor:pointer;

  border-radius:12px;

  overflow:hidden;

  background:#f1f5f9;
}


.product-image {
  width:100%;
  height:100%;
  object-fit:cover;
}


.no-image {
  font-size:.75rem;
  color:var(--color-ink-soft);
}


/* capa que aparece al pasar el mouse */
.image-overlay {

  position:absolute;

  inset:0;

  display:flex;
  align-items:center;
  justify-content:center;

  background:rgba(0,0,0,.55);

  color:white;

  font-size:.75rem;
  font-weight:600;

  opacity:0;

  transition:.2s;
}


.image-button:hover .image-overlay {
  opacity:1;
}


/* Editar */
.table-actions a {
  background: #9fb9f3;
  color: #1b3d86;

  height: 36px;
  padding: 0 .9rem;

  border-radius: 8px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  font-size: .85rem;


  text-decoration: none;

  transition: .2s;
}

.table-actions a:hover {
  background: #89a4f0;
  transform: translateY(-1px);
}


/* Dar de baja */
.link-button-danger {
  background:#ffe8e8;
  color:#c0392b;
}


.link-button-danger:hover {
  background:#ffd2d2;
}


/* Loading */
.loading-state {
  text-align:center;
  padding:2rem;
  color:var(--color-ink-soft);
}


/* Responsive */
@media(max-width:900px){

  .admin-table {
    display:block;
    overflow-x:auto;
  }

  .admin-header {
    flex-direction:column;
    align-items:flex-start;
    gap:1rem;
  }

}
</style>