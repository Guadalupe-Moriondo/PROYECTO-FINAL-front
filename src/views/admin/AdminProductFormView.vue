<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import productsService from '../../services/products.service';
import categoriesService from '../../services/categories.service';


const route = useRoute();
const router = useRouter();

// If the route has an :id, we're editing; otherwise we're creating.
// It's the same component for both cases, to avoid duplicating the form.
const isEditing = computed(() => !!route.params.id);

const categories = ref([]);
const form = ref({
  code: '',
  name: '',
  description: '',
  machineryCompatibility: '',
  brand: '',
  price: '',
  stock: 0,
  minStock: 5,
  categoryId: '',
});
const loading = ref(isEditing.value);
const saving = ref(false);
const error = ref('');
const selectedImage = ref(null);
const imagePreview = ref(null);
const imageInput = ref(null);

async function loadCategories() {
  const response = await categoriesService.list();
  categories.value = response.data;
}

function categoryLabel(category) {
  const labels = {
    sembradoras: 'Sembradoras',
    cosechadoras: 'Cosechadoras',
    otros: 'Otros',
  };

  return `${category.name} — ${labels[category.machineType] || 'Otros'}`;
}

async function loadProduct() {
  const response = await productsService.getById(route.params.id);
  const p = response.data;
  form.value = {
    code: p.code,
    name: p.name,
    description: p.description || '',
    machineryCompatibility: p.machineryCompatibility || '',
    brand: p.brand || '',
    price: Number (p.price),
    stock: p.stock,
    minStock: p.minStock,
    categoryId: p.category?.id || '',
    imageUrl: p.imageUrl || '',
  };

   if (p.imageUrl) {
    imagePreview.value = `${import.meta.env.VITE_API_URL}${p.imageUrl}`;
  }

  loading.value = false;
}

async function save() {
  error.value = '';
  saving.value = true;
  try {
    if (isEditing.value) {
      await productsService.update(route.params.id, form.value);
    } else {
      const response = await productsService.create(form.value);
      const productId = response.data.id;
      if (selectedImage.value) {
        await productsService.uploadImage(
          productId,
          selectedImage.value
        );
      }
    }
    router.push({ name: 'admin-products' });
  } catch (e) {
    error.value = e.response?.data?.message || 'No se pudo guardar el producto';
  } finally {
    saving.value = false;
  }
}

function onImageSelected(event) {
  const file = event.target.files[0];

  if (!file) return;

  selectedImage.value = file;

  imagePreview.value = URL.createObjectURL(file);
}


onMounted(() => {
  loadCategories();
  if (isEditing.value) loadProduct();
});
</script>

<template>
  <div class="container admin-form-view">
    <h1>{{ isEditing ? 'Editar producto' : 'Nuevo producto' }}</h1>

    <p v-if="loading" class="loading-state">Cargando...</p>

    <form v-else class="product-form" @submit.prevent="save">
      <div class="form-grid">
        <div class="field">
          <label for="code">Código</label>
          <input id="code" v-model="form.code" type="text" required />
        </div>
        <div class="field">
          <label for="name">Nombre</label>
          <input id="name" v-model="form.name" type="text" required />
        </div>
        <div class="field">
          <label for="brand">Marca</label>
          <input id="brand" v-model="form.brand" type="text" />
        </div>
        <div class="field">
          <label for="categoryId">Categoría</label>
          <select id="categoryId" v-model="form.categoryId" required>
            <option value="" disabled>Elegir categoría...</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id"> {{ categoryLabel(cat) }}</option>
          </select>
        </div>
        <div class="field">
          <label for="price">Precio</label>
          <input id="price" v-model.number="form.price" type="number" step="0.01" min="0" required />
        </div>
        <div class="field">
          <label for="stock">Stock inicial</label>
          <input id="stock" v-model.number="form.stock" type="number" min="0" :disabled="isEditing" />
          <small v-if="isEditing" class="field-help">
            El stock se modifica desde la sección "Stock", no editando el producto.
          </small>
        </div>
        <div class="field">
          <label for="minStock">Stock mínimo (alerta)</label>
          <input id="minStock" v-model.number="form.minStock" type="number" min="0" />
        </div>
      </div>

      <div class="field">
        <label for="description">Descripción</label>
        <textarea id="description" v-model="form.description" rows="3"></textarea>
      </div>
      <div class="field">
        <label for="machineryCompatibility">Compatibilidad de maquinaria</label>
        <textarea id="machineryCompatibility" v-model="form.machineryCompatibility" rows="3"></textarea>
      </div>

      <div class="field">
        <label for="image">Imagen del producto</label>
        <input id="image" ref="imageInput" type="file" accept=".jpg,.jpeg,.png,.webp" class="visually-hidden" @change="onImageSelected"/>
        <button  type="button" class="select-image-button"  @click="imageInput.click()">Seleccionar archivo</button>
        <img v-if="imagePreview" :src="imagePreview" class="preview-image"/>
      </div>

      <p v-if="error" class="error-message">{{ error }}</p>

      <div class="form-actions">
        <button type="submit" class="button button-primary" :disabled="saving">
          {{ saving ? 'Guardando...' : 'Guardar producto' }}
        </button>
        <RouterLink :to="{ name: 'admin-products' }" class="button button-secondary">Cancelar</RouterLink>
      </div>
    </form>
  </div>
</template>

<style scoped>
.admin-form-view { padding: var(--space-5) var(--space-4); }
.product-form {
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  max-width: 720px;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 var(--space-3);
}
@media (max-width: 600px) {
  .form-grid { grid-template-columns: 1fr; }
}
.field-help {
  color: var(--color-ink-soft);
  font-size: 0.78rem;
}
.form-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-3);
}

.preview-image {
  margin-top: 10px;
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid var(--color-line);
} 

.visually-hidden {
  display: none;
}


.select-image-button {
  background: #2563eb;
  color: white;

  border: none;
  border-radius: 10px;

  padding: .7rem 1.2rem;

  font-weight: 600;
  cursor: pointer;

  transition: .2s;
}


.select-image-button:hover {
  background: #1d4ed8;
}
</style>
