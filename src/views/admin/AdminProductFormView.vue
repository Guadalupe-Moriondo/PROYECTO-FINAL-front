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

    <!-- HEADER -->
    <header class="page-header">

      <div>
        <h1>
          {{ isEditing ? 'Editar producto' : 'Nuevo producto' }}
        </h1>
      </div>

    </header>

    <p v-if="loading" class="loading-state">
      Cargando...
    </p>

    <form
      v-else
      class="product-form"
      @submit.prevent="save"
    >

      <!-- ================= INFORMACIÓN ================= -->

      <section class="form-section">

        <h2 class="section-title">
          Información general
        </h2>

        <div class="form-grid">

          <div class="field">
            <label for="code">Código</label>
            <input
              id="code"
              v-model="form.code"
              type="text"
              required
            />
          </div>

          <div class="field">
            <label for="name">Nombre</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
            />
          </div>

          <div class="field">
            <label for="brand">Marca</label>
            <input
              id="brand"
              v-model="form.brand"
              type="text"
            />
          </div>

          <div class="field">
            <label for="categoryId">
              Categoría
            </label>

            <select
              id="categoryId"
              v-model="form.categoryId"
              required
            >
              <option value="" disabled>
                Elegir categoría...
              </option>

              <option
                v-for="cat in categories"
                :key="cat.id"
                :value="cat.id"
              >
                {{ categoryLabel(cat) }}
              </option>

            </select>

          </div>

          <div class="field">
            <label for="price">
              Precio
            </label>

            <input
              id="price"
              v-model.number="form.price"
              type="number"
              step="0.01"
              min="0"
              required
            />

          </div>

          <div class="field">

            <label for="stock">
              Stock inicial
            </label>

            <input
              id="stock"
              v-model.number="form.stock"
              type="number"
              min="0"
              :disabled="isEditing"
            />

            <small
              v-if="isEditing"
              class="field-help"
            >
              El stock se administra desde la sección Stock.
            </small>

          </div>

          <div class="field">

            <label for="minStock">
              Stock mínimo
            </label>

            <input
              id="minStock"
              v-model.number="form.minStock"
              type="number"
              min="0"
            />

          </div>

        </div>

      </section>

      <!-- ================= DESCRIPCIÓN ================= -->

      <section class="form-section">

        <h2 class="section-title">
          Descripción
        </h2>

        <div class="field">

          <label for="description">
            Descripción del producto
          </label>

          <textarea
            id="description"
            rows="5"
            v-model="form.description"
          />

        </div>

      </section>

      <!-- ================= COMPATIBILIDAD ================= -->

      <section class="form-section">

        <h2 class="section-title">
          Compatibilidad
        </h2>

        <div class="field">

          <label for="machineryCompatibility">
            Maquinaria compatible
          </label>

          <textarea
            id="machineryCompatibility"
            rows="5"
            v-model="form.machineryCompatibility"
          />

        </div>

      </section>

      <!-- ================= IMAGEN ================= -->

      <section class="form-section">

        <h2 class="section-title">
          Imagen del producto
        </h2>

        <div class="image-upload-card">

          <img
            v-if="imagePreview"
            :src="imagePreview"
            class="preview-image"
          />

          <div
            v-else
            class="image-placeholder"
          >

            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm0 16H5V5h14ZM8.5 11A1.5 1.5 0 1 0 7 9.5 1.5 1.5 0 0 0 8.5 11Zm-3 6 3.5-4.5 2.5 3L15 11l4 6Z"/>
            </svg>

            <span>
              Sin imagen
            </span>

          </div>

          <input
            id="image"
            ref="imageInput"
            type="file"
            class="visually-hidden"
            accept=".jpg,.jpeg,.png,.webp"
            @change="onImageSelected"
          />

          <button
            type="button"
            class="upload-button"
            @click="imageInput.click()"
          >

            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 16a1 1 0 0 1-1-1V8.41L8.7 10.7a1 1 0 0 1-1.4-1.4l4-4a1 1 0 0 1 1.4 0l4 4a1 1 0 1 1-1.4 1.4L13 8.41V15a1 1 0 0 1-1 1Zm7 3a1 1 0 0 0 1-1v-2a1 1 0 1 0-2 0v1H6v-1a1 1 0 1 0-2 0v2a1 1 0 0 0 1 1Z"/>
            </svg>

            <span>
              Seleccionar imagen
            </span>

          </button>

        </div>

      </section>

      <p
        v-if="error"
        class="error-message"
      >
        {{ error }}
      </p>

      <!-- ================= BOTONES ================= -->

      <div class="form-actions">

        <RouterLink
          :to="{ name: 'admin-products' }"
          class="button button-secondary"
        >
          Cancelar
        </RouterLink>

        <button
          type="submit"
          class="button button-primary"
          :disabled="saving"
        >
          {{ saving ? 'Guardando...' : 'Guardar producto' }}
        </button>

      </div>

    </form>

  </div>
</template>

<style scoped>

.admin-form-view{
  padding:4rem 1rem 5rem;
}

/* ================= HEADER ================= */

.page-header{
  margin-bottom:2.5rem;
}

.page-eyebrow{
  font-size:.78rem;
  text-transform:uppercase;
  letter-spacing:.18em;
  color:var(--color-rust);
  font-weight:700;
  margin-bottom:.4rem;
}

.page-header h1{
  margin:0;
  font-size:2.5rem;
  color:var(--color-steel);
}

.page-description{
  margin-top:.8rem;
  max-width:620px;
  color:var(--color-ink-soft);
  line-height:1.7;
}

/* ================= FORMULARIO ================= */

.product-form{

  max-width:900px;

  margin:auto;

  background:white;

  border:1px solid var(--color-line);

  border-radius:24px;

  overflow:hidden;

  box-shadow:
  0 18px 45px rgba(15,23,42,.08);

}

/* ================= SECCIONES ================= */

.form-section{

  padding:2rem;

}

.form-section + .form-section{

  border-top:1px solid var(--color-line);

}

.section-title{

  margin:0 0 1.5rem;

  font-size:1.25rem;

  color:var(--color-steel);

}

/* ================= GRID ================= */

.form-grid{

  display:grid;

  grid-template-columns:repeat(2,1fr);

  gap:1.4rem;

}

/* ================= CAMPOS ================= */

.field{

  display:flex;

  flex-direction:column;

}

.field label{

  margin-bottom:.6rem;

  font-size:.9rem;

  font-weight:700;

  color:var(--color-steel);

}

.field input,
.field select{

  height:52px;

  padding:0 16px;

  border:1px solid #d8dee8;

  border-radius:12px;

  font-size:.95rem;

  transition:.25s;

  background:white;

}

.field textarea{

  min-height:140px;

  padding:14px 16px;

  border:1px solid #d8dee8;

  border-radius:12px;

  resize:vertical;

  font-size:.95rem;

  transition:.25s;

}

.field input:focus,
.field select:focus,
.field textarea:focus{

  outline:none;

  border-color:#b71c1c;

  box-shadow:0 0 0 4px rgba(183,28,28,.12);

}

/* ================= HELP ================= */

.field-help{

  margin-top:.5rem;

  color:#7a7a7a;

  font-size:.82rem;

}

/* ================= IMAGEN ================= */

.image-upload-card{

  display:flex;

  flex-direction:column;

  align-items:center;

  gap:1.5rem;

  padding:2rem;

  background:#fafafa;

  border:2px dashed #d9dee6;

  border-radius:18px;

}

.preview-image{

  width:220px;

  height:220px;

  object-fit:cover;

  border-radius:18px;

  border:1px solid var(--color-line);

  box-shadow:0 12px 28px rgba(0,0,0,.08);

}

.image-placeholder{

  width:220px;

  height:220px;

  border-radius:18px;

  background:white;

  border:1px solid var(--color-line);

  display:flex;

  flex-direction:column;

  align-items:center;

  justify-content:center;

  gap:1rem;

}

.image-placeholder svg{

  width:60px;

  height:60px;

  color:#c2c8d1;

}

.image-placeholder span{

  color:#7b8794;

}

.upload-button{

  display:flex;

  align-items:center;

  gap:.8rem;

  border:none;

  background:#b71c1c;

  color:white;

  padding:.9rem 1.4rem;

  border-radius:12px;

  cursor:pointer;

  font-weight:600;

  transition:.25s;

}

.upload-button:hover{

  background:#991b1b;

  transform:translateY(-2px);

}

.upload-button svg{

  width:20px;

  height:20px;

}

/* ================= BOTONES ================= */

.form-actions{

  display:flex;

  justify-content:flex-end;

  gap:1rem;

  padding:2rem;

  border-top:1px solid var(--color-line);

  background:#fafafa;

}

.button{

  height:48px;

  display:flex;

  align-items:center;

  justify-content:center;

  padding:0 1.6rem;

  border-radius:12px;

  font-weight:600;

  text-decoration:none;

  transition:.25s;

}

.button-primary{

  border:none;

  background:#b71c1c;

  color:white;

}

.button-primary:hover{

  background:#991b1b;

  transform:translateY(-2px);

}

.button-secondary{

  background:white;

  color:#555;

  border:1px solid var(--color-line);

}

.button-secondary:hover{

  background:#f5f5f5;

}

/* ================= MENSAJES ================= */

.error-message{

  margin:0 2rem 2rem;

  padding:1rem;

  background:#fdecec;

  color:#b42318;

  border-radius:12px;

  border:1px solid #f5c2c7;

}

.loading-state{

  text-align:center;

  padding:4rem;

  color:var(--color-ink-soft);

}

/* ================= HIDDEN ================= */

.visually-hidden{

  display:none;

}

/* ================= RESPONSIVE ================= */

@media(max-width:768px){

  .page-header h1{

    font-size:2rem;

  }

  .form-grid{

    grid-template-columns:1fr;

  }

  .form-section{

    padding:1.5rem;

  }

  .preview-image,
  .image-placeholder{

    width:170px;

    height:170px;

  }

  .form-actions{

    flex-direction:column-reverse;

  }

  .button{

    width:100%;

  }

}

</style>
