<script setup>
import { ref, onMounted } from 'vue';
import categoriesService from '../../services/categories.service';
import Pagination from '@/components/Pagination.vue';

const categories = ref([]);
const loading = ref(true);
const page = ref(1);
const totalPages = ref(1);
const newName = ref('');
const newDescription = ref('');
const editingId = ref(null);

const editForm = ref({
  name: '',
  description: '',
});

const message = ref('');
let messageTimeout = null;
const error = ref('');
let errorTimeout = null;


async function load() {
  loading.value = true;

  try {
    const response = await categoriesService.list(page.value, 10);

    categories.value = response.data.data;
    totalPages.value = response.data.totalPages;
  } catch (e) {
    showError('No se pudieron cargar las categorías');
 
  } finally {
    loading.value = false;
  }
}

async function create() {
  error.value = '';

  if (!newName.value.trim()) return;

  try {
    await categoriesService.create({
      name: newName.value,
      description: newDescription.value || undefined,
    });

    newName.value = '';
    newDescription.value = '';

    await load();
    showMessage('¡Categoría creada correctamente!');
  } catch (e) {
    showError(
      e.response?.data?.message ||
      'No se pudo crear la categoría'
    );
  }
}

function startEditing(category) {
  editingId.value = category.id;

  editForm.value = {
    name: category.name,
    description: category.description || '',
  };
}

async function saveEdit(id) {
  error.value = '';

  try {
    await categoriesService.update(id, editForm.value);

    editingId.value = null;

    await load();
    showMessage('Categoría actualizada correctamente');
  } catch (e) {
    showError(
      e.response?.data?.message ||
      'No se pudo actualizar la categoría'
    );
  }
}

async function remove(category) {
  if (!confirm(`¿Dar de baja la categoría "${category.name}"?`)) {
    return;
  }

  error.value = '';

  try {
    await categoriesService.remove(category.id);
    await load();
    showMessage('Categoría dada de baja correctamente');
  } catch (e) {
    showError(
      e.response?.data?.message ||
      'No se pudo dar de baja la categoría'
    );
  }
}

function changePage(newPage) {
  page.value = newPage;
  load();
}

function showMessage(text) { 
  message.value = text;

  if (messageTimeout) { 
    clearTimeout(messageTimeout);
  }

  messageTimeout = setTimeout(() => { 
    message.value = ''; 
  }, 5000); 
}

function showError(text) {
  error.value = text;

  if (errorTimeout) {
    clearTimeout(errorTimeout);
  }

  errorTimeout = setTimeout(() => {
    error.value = '';
  }, 5000);
}

onMounted(load);
</script>

<template>
  <div class="container admin-categories-view">
    <!-- ================= HEADER ================= -->
    <header class="page-header">

      <div>
        <h1>
          Categorías
        </h1>
      </div>
    </header>
    <!-- ================= MENSAJE ÉXITO ================= -->
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
          <strong> {{ message }} </strong>
          <span> Los cambios se guardaron correctamente. </span>
        </div>
      </div>
    </Transition>

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
    <!-- ================= NUEVA CATEGORÍA ================= -->
    <section class="category-card">

      <h2 class="section-title">
        Nueva categoría
      </h2>

      <form
        class="category-form"
        @submit.prevent="create"
      >
        <div class="field field--categories">

          <label for="name">
            Marca
          </label>

          <input
            id="name"
            v-model="newName"
            type="text"
            placeholder="Ej: Apache"
            required
          />
        </div>

        <div class="field field--categories">

          <label for="description">
            Descripción
          </label>

          <input
            id="description"
            v-model="newDescription"
            type="text"
            placeholder="Descripción opcional"
          />
        </div>

        <button
          type="submit"
          class="button button-primary"
        >
          Agregar 
        </button>
      </form>
    </section>

    <p
      v-if="loading"
      class="loading-state"
    >
      Cargando categorías...
    </p>
    <!-- ================= TABLA ================= -->
    <section
      v-else
      class="table-card"
    >
      <div class="table-header">
        <h2>
          Categorías existentes
        </h2>
      </div>

      <div class="table-scroll">
        <table class="admin-table admin-table--basic">
          <thead>
            <tr>

              <th>Marca</th>

              <th>Descripción</th>

              <th>Productos</th>

              <th></th>

            </tr>
          </thead>

          <tbody>
            <tr
              v-for="cat in categories"
              :key="cat.id"
            >
              <!-- ================= EDICIÓN ================= -->
              <template v-if="editingId === cat.id">
                <td>
                  <input
                    v-model="editForm.name"
                    type="text"
                    class="input-edit-row"
                  />
                </td>

                <td>
                  <input
                    v-model="editForm.description"
                    type="text"
                    class="input-edit-row"
                  />
                </td>

                <td>
                  {{ cat.productCount ?? "—" }}
                </td>

                <td class="table-actions">
                  <button
                    type="button"
                    class="icon-button success"
                    @click="saveEdit(cat.id)"
                    title="Guardar"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="m9.2 16.6-4-4L3.8 14l5.4 5.4L21 7.6 19.6 6.2 9.2 16.6Z"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    class="icon-button danger"
                    @click="editingId = null"
                    title="Cancelar"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path
                         d="m7.4 5.9-1.5 1.5 4.6 4.6-4.6 4.6 1.5 1.5 4.6-4.6 4.6 4.6 1.5-1.5-4.6-4.6 4.6-4.6-1.5-1.5-4.6 4.6-4.6-4.6Z"
                      />
                    </svg>
                  </button>
                </td>
              </template>
              <!-- ================= NORMAL ================= -->
              <template v-else>

                <td class="table-name">
                  {{ cat.name }}
                </td>

                <td class="table-description">
                  {{ cat.description || "—" }}
                </td>

                <td>
                  {{ cat.productCount ?? "—" }}
                </td>

                <td class="table-actions">

                  <button
                    class="icon-button edit-button"
                    @click="startEditing(cat)"
                    title="Editar"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" >
                      <path d="M12 20h9"/>
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                    </svg>
                  </button>

                  <button
                    class="icon-button delete-button"
                    @click="remove(cat)"
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
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <Pagination :page="page" :total-pages="totalPages" @change-page="changePage"/>

  </div>
</template>


<style scoped>

.admin-categories-view {
  padding: 2.5rem var(--space-4) 4rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-eyebrow {
  color: var(--color-rust);
  font-size: .8rem;
  font-weight: 700;
  letter-spacing: .18em;
  text-transform: uppercase;
  margin-bottom: .5rem;
}

.page-header h1 {
  margin: 0;
  font-size: 2.4rem;
  color: var(--color-steel);
}

.page-description {
  margin-top: .7rem;
  max-width: 620px;
}

.category-card,
.table-card {
  background: #fff;
  border: 1px solid var(--color-line);
  border-radius: 24px;
  box-shadow: 0 15px 40px rgba(15,23,42,.08);
}

.category-card {
  padding: 2rem;
  margin-bottom: 2rem;
}

.table-card {
  overflow: hidden;
}

.section-title {
  margin: 0 0 1.8rem;
  color: var(--color-steel);
  font-size: 1.35rem;
}

.category-form {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.2rem;
  align-items: end;
  
}

.category-form button[type="submit"] {
  grid-column: 1 / -1;   
  justify-self: center;   
}

.admin-table input {
  width: 100%;
}

.admin-table select {
  height: 48px;
  border-radius: 14px;
  border: 1px solid var(--color-line);
  padding: 0 1rem;
  background: white;
  font-size: .95rem;
  transition: .2s;
}

.admin-table input:focus,
.admin-table select:focus {
  outline: none;
  border-color: var(--color-rust);
  box-shadow: 0 0 0 4px rgba(188,34,34,.12);
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
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.12); 
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
  font-size: .88rem;
  font-weight: 700;
}

.error-toast-content span {
  color: #765050;
  font-size: .78rem;
}

.error-toast-enter-active,
.error-toast-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.error-toast-enter-from,
.error-toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.6rem 2rem;
  border-bottom: 1px solid var(--color-line);
}

.table-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.table-header span {
  padding: .45rem .9rem;
  border-radius: 999px;
  background: #f3f4f6;
  color: var(--color-ink-soft);
  font-size: .85rem;
  font-weight: 600;
}

.table-scroll {
  overflow-x: auto;
}

.table-name {
  font-weight: 700;
  color: var(--color-steel);
}

.table-description {
  color: var(--color-ink-soft);
}

.machine-tag {
  display: inline-flex;
  align-items: center;
  padding: .45rem .9rem;
  border-radius: 999px;
  color: rgb(49, 49, 49);
  font-size: .82rem;
  
}

.input-edit-row {
  width: 100%;
  height: 34px;
  padding: 0 0.7rem;
  border: 1px solid var(--color-line);
  border-radius: 10px;
  background: #fff;
  font-size: .88rem;
  color: var(--color-ink);
  transition: .2s;
  box-sizing: border-box;
}

.input-edit-row:focus {
  outline: none;
  border-color: var(--color-rust);
  box-shadow: 0 0 0 3px rgba(188, 34, 34, .12);
}

/* ================= TABLA ================= */

.admin-table--basic th:first-child,
.admin-table--basic td:first-child,
.admin-table--basic th:nth-child(2),
.admin-table--basic td:nth-child(2) {
  text-align: left;
}

.admin-table--basic th:nth-child(3),
.admin-table--basic td:nth-child(3),
.admin-table--basic th:nth-child(4),
.admin-table--basic td:nth-child(4) {
  text-align: center;
}

.admin-table--basic td {
  vertical-align: middle;
}

.table-actions {
  display: flex;
  justify-content: center;
  align-items: center;
}

.admin-table--basic tr {
  height: 76px;
}

.admin-table--basic td {
  height: 76px;
  vertical-align: middle;
  box-sizing: border-box;
}

@media (max-width: 1200px) {

  .category-form {
    grid-template-columns: 1fr 1fr;
  }

}

@media (max-width: 900px) {

  .category-card,
  .table-card {
    padding: 1.2rem;
  }

  .table-card {
    padding: 0;
  }

  .category-form {
    grid-template-columns: 1fr;
  }

  .category-form button[type="submit"] {
    width: 100%;
  }

  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>