<script setup>
import { ref, onMounted } from 'vue';
import categoriesService from '../../services/categories.service';

const categories = ref([]);
const loading = ref(true);

const newName = ref('');
const newDescription = ref('');
const newMachineType = ref('sembradoras');

const editingId = ref(null);

const editForm = ref({
  name: '',
  description: '',
  machineType: 'sembradoras',
});

const error = ref('');

async function load() {
  loading.value = true;

  try {
    const response = await categoriesService.list();
    categories.value = response.data;
  } catch (e) {
    error.value = 'No se pudieron cargar las categorías';
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
      machineType: newMachineType.value,
    });

    newName.value = '';
    newDescription.value = '';
    newMachineType.value = 'sembradoras';

    await load();
  } catch (e) {
    error.value =
      e.response?.data?.message ||
      'No se pudo crear la categoría';
  }
}

function startEditing(category) {
  editingId.value = category.id;

  editForm.value = {
    name: category.name,
    description: category.description || '',
    machineType: category.machineType || 'otros',
  };
}

async function saveEdit(id) {
  error.value = '';

  try {
    await categoriesService.update(id, editForm.value);

    editingId.value = null;

    await load();
  } catch (e) {
    error.value =
      e.response?.data?.message ||
      'No se pudo actualizar la categoría';
  }
}

async function remove(category) {
  if (!confirm(`¿Dar de baja la categoría "${category.name}"?`)) {
    return;
  }

  try {
    await categoriesService.remove(category.id);
    await load();
  } catch (e) {
    error.value =
      e.response?.data?.message ||
      'No se pudo dar de baja la categoría';
  }
}

function machineTypeLabel(type) {
  const labels = {
    sembradoras: 'Sembradoras',
    cosechadoras: 'Cosechadoras',
    otros: 'Otros',
  };

  return labels[type] || 'Otros';
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

    <!-- ================= NUEVA CATEGORÍA ================= -->

    <section class="category-card">

      <h2 class="section-title">
        Nueva categoría
      </h2>

      <form
        class="category-form"
        @submit.prevent="create"
      >

        <div class="field">

          <label for="name">
            Nombre
          </label>

          <input
            id="name"
            v-model="newName"
            type="text"
            placeholder="Ej. Rodamientos"
            required
          />

        </div>

        <div class="field">

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

        <div class="field">

          <label for="machine">
            Tipo de maquinaria
          </label>

          <select
            id="machine"
            v-model="newMachineType"
          >
            <option value="sembradoras">
              Sembradoras
            </option>

            <option value="cosechadoras">
              Cosechadoras
            </option>

            <option value="otros">
              Otros
            </option>

          </select>

        </div>

        <button
          type="submit"
          class="button button-primary"
        >

          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6z"/>
          </svg>

          <span>
            Agregar categoría
          </span>

        </button>

      </form>

    </section>

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

        <span>
          {{ categories.length }}
          categorías
        </span>

      </div>

      <div class="table-scroll">

        <table class="admin-table">

          <thead>

            <tr>

              <th>Nombre</th>

              <th>Tipo</th>

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
                  />

                </td>

                <td>

                  <select v-model="editForm.machineType">

                    <option value="sembradoras">
                      Sembradoras
                    </option>

                    <option value="cosechadoras">
                      Cosechadoras
                    </option>

                    <option value="otros">
                      Otros
                    </option>

                  </select>

                </td>

                <td>

                  <input
                    v-model="editForm.description"
                    type="text"
                  />

                </td>

                <td>

                  {{ cat.productCount ?? "—" }}

                </td>

                <td class="table-actions">

                  <button
                    class="save-button"
                    @click="saveEdit(cat.id)"
                  >
                    Guardar
                  </button>

                  <button
                    class="cancel-button"
                    @click="editingId = null"
                  >
                    Cancelar
                  </button>

                </td>

              </template>

              <!-- ================= NORMAL ================= -->

              <template v-else>

                <td class="table-name">
                  {{ cat.name }}
                </td>

                <td>

                  <span class="machine-tag">
                    {{ machineTypeLabel(cat.machineType) }}
                  </span>

                </td>

                <td class="table-description">
                  {{ cat.description || "—" }}
                </td>

                <td>

                  {{ cat.productCount ?? "—" }}

                </td>

                <td class="table-actions">

                  <button
                    class="edit-button"
                    @click="startEditing(cat)"
                  >
                    Editar
                  </button>

                  <button
                    class="delete-button"
                    @click="remove(cat)"
                  >
                    Dar de baja
                  </button>

                </td>

              </template>

            </tr>

          </tbody>

        </table>

      </div>

    </section>

  </div>
</template>

<style scoped>

.admin-categories-view {
  padding: 2.5rem 0 4rem;
}

/* ================= HEADER ================= */

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
  color: var(--color-ink-soft);
  line-height: 1.7;
}

/* ================= CARDS ================= */

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

/* ================= TITLES ================= */

.section-title {
  margin: 0 0 1.8rem;
  color: var(--color-steel);
  font-size: 1.35rem;
}

/* ================= FORM ================= */

.category-form {
  display: grid;
  grid-template-columns: repeat(3,1fr) auto;
  gap: 1.2rem;
  align-items: end;
}

.field {
  display: flex;
  flex-direction: column;
}

.field label {
  margin-bottom: .55rem;
  font-size: .88rem;
  font-weight: 600;
  color: var(--color-ink-soft);
}

.field input,
.field select,
.admin-table input,
.admin-table select {
  height: 48px;
  border-radius: 14px;
  border: 1px solid var(--color-line);
  padding: 0 1rem;
  background: white;
  font-size: .95rem;
  transition: .2s;
}

.admin-table input {
  width: 100%;
}

.field input:focus,
.field select:focus,
.admin-table input:focus,
.admin-table select:focus {
  outline: none;
  border-color: var(--color-rust);
  box-shadow: 0 0 0 4px rgba(188,34,34,.12);
}

/* ================= BOTÓN AGREGAR ================= */

.button-primary {
  height: 48px;
  display: inline-flex;
  align-items: center;
  gap: .75rem;
  justify-content: center;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg,#b91c1c,#dc2626);
  color: white;
  font-weight: 700;
  padding: 0 1.4rem;
  cursor: pointer;
  transition: .25s;
}

.button-primary svg {
  width: 18px;
  height: 18px;
}

.button-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(185,28,28,.28);
}

/* ================= MENSAJES ================= */

.error-message {
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 14px;
  background: #fff1f2;
  color: #be123c;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-ink-soft);
}

/* ================= TABLA ================= */

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

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th {
  background: #fafafa;
  padding: 1rem 1.5rem;
  text-align: left;
  font-size: .75rem;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--color-ink-soft);
}

.admin-table td {
  padding: 1.2rem 1.5rem;
  border-top: 1px solid var(--color-line);
}

.admin-table tbody tr {
  transition: .2s;
}

.admin-table tbody tr:hover {
  background: #fafafa;
}

/* ================= CELDAS ================= */

.table-name {
  font-weight: 700;
  color: var(--color-steel);
}

.table-description {
  color: var(--color-ink-soft);
}

/* ================= TAG ================= */

.machine-tag {
  display: inline-flex;
  align-items: center;
  padding: .45rem .9rem;
  border-radius: 999px;
  background: rgb(230, 229, 229);
  color: rgb(56, 56, 56);
  font-size: .82rem;
  
}

/* ================= BOTONES ================= */

.table-actions {
  display: flex;
  gap: .6rem;
}

.edit-button,
.save-button,
.cancel-button,
.delete-button {
  height: 38px;
  border: none;
  border-radius: 10px;
  padding: 0 1rem;
  cursor: pointer;
  transition: .2s;
}

.edit-button {
  background: #dbeafe;
  color: #4c6ba8;
}

.edit-button:hover {
  background: #bfdbfe;
}

.save-button {
  background: #56a572;
  color: #ffffff;
}

.save-button:hover {
  background: #488a5f;
}

.cancel-button {
  background: #7ea1e7;
  color: #ffffff;
}

.cancel-button:hover {
  background: #4c6ba8;
}

.delete-button {
  background: #ecb5b5;
  color: #992525;
}

.delete-button:hover {
  background: #f3a9a9;
}

/* ================= RESPONSIVE ================= */

@media (max-width:1100px){

  .category-form{
    grid-template-columns:1fr 1fr;
  }

}

@media (max-width:700px){

  .category-form{
    grid-template-columns:1fr;
  }

  .table-header{
    flex-direction:column;
    align-items:flex-start;
    gap:1rem;
  }

  .table-actions{
    flex-direction:column;
  }

  .edit-button,
  .save-button,
  .cancel-button,
  .delete-button{
    width:100%;
  }

}

</style>