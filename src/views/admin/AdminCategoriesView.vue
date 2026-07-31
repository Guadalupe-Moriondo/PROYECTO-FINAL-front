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
  <div class="container admin-view admin-categories-view">
    <h1>Categorías</h1>
    <form class="new-category-form" @submit.prevent="create">
      <input
        v-model="newName"
        type="text"
        placeholder="Nombre de la categoría"
        required
      />

      <input
        v-model="newDescription"
        type="text"
        placeholder="Descripción (opcional)"
      />

      <select v-model="newMachineType">
        <option value="sembradoras">Sembradoras</option>
        <option value="cosechadoras">Cosechadoras</option>
        <option value="otros">Otros</option>
      </select>

      <button type="submit" class="button button-primary">
        Agregar
      </button>
    </form>
    <p v-if="error" class="error-message">{{ error }}</p>

    <p v-if="loading" class="loading-state">Cargando...</p>

    <div v-else class="table-scroll">
      <table class="admin-table">
        <thead>
          <tr><th>Nombre</th><th>Tipo</th><th>Descripción</th><th>Productos</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-for="cat in categories" :key="cat.id">
            <template v-if="editingId === cat.id">
              <td><input v-model="editForm.name" type="text" /></td>
              <td>
                <select v-model="editForm.machineType">
                  <option value="sembradoras">Sembradoras</option>
                  <option value="cosechadoras">Cosechadoras</option>
                  <option value="otros">Otros</option>
                </select>
              </td>
              <td><input v-model="editForm.description" type="text" /></td>
              <td>{{ cat.productCount ?? '—' }}</td>
              <td class="table-actions">
                <button class="link-button" @click="saveEdit(cat.id)">Guardar</button>
                <button class="link-button" @click="editingId = null">Cancelar</button>
              </td>
            </template>
            <template v-else>
              <td>{{ cat.name }}</td>
              <td>{{ machineTypeLabel(cat.machineType) }}</td>
              <td>{{ cat.description }}</td>
              <td>{{ cat.productCount ?? '—' }}</td>
              <td class="table-actions">
                <button class="link-button" @click="startEditing(cat)">Editar</button>
                <button class="link-button link-button-danger" @click="remove(cat)">Dar de baja</button>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>

.admin-categories-view {
  padding: var(--space-5) var(--space-4);
}


/* Header */
.admin-categories-view h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: var(--space-5);
}


/* Formulario nueva categoría */
.new-category-form {

  display:flex;
  gap:1rem;

  margin-bottom:var(--space-5);

}


.new-category-form input {

  flex:1;

  padding:.7rem 1rem;

  border:1px solid var(--color-line);

  border-radius:12px;

  background:var(--color-surface);

  font-size:.9rem;

}


.new-category-form input:focus {

  outline:none;

  border-color:var(--color-steel);

}


/* Botón agregar */
.button-primary {

  background:var(--color-steel);

  color:white;

  padding:.7rem 1.3rem;

  border-radius:12px;

  border:none;

  text-decoration:none;

  font-weight:600;

  cursor:pointer;

  transition:.2s;

  box-shadow:0 4px 12px rgba(0,0,0,.12);

}


.button-primary:hover {

  transform:translateY(-2px);

  opacity:.9;

}



/* Mensajes */
.error-message {

  background:#ffe8e8;

  color:#c0392b;

  padding:.8rem 1rem;

  border-radius:10px;

  margin-bottom:1rem;

}



/* Tabla */
.admin-table {

  width:100%;

  border-collapse:separate;

  border-spacing:0;

  overflow:hidden;

  background:var(--color-surface);

  border:1px solid var(--color-line);

  border-radius:16px;

  box-shadow:0 8px 25px rgba(0,0,0,.08);

}



.admin-table th {

  text-align:left;

  padding:1rem 1.2rem;

  background:rgba(0,0,0,.03);

  font-family:var(--font-display);

  text-transform:uppercase;

  font-size:.75rem;

  color:var(--color-ink-soft);

}



.admin-table td {

  padding:1rem 1.2rem;

  border-top:1px solid var(--color-line);

  vertical-align:middle;

}



/* Hover filas */
.admin-table tbody tr {

  transition:.2s;

}


.admin-table tbody tr:hover {

  background:rgba(0,0,0,.025);

}



/* Acciones */
.table-actions {

  display:flex;

  align-items:center;

  gap:.6rem;

  white-space:nowrap;

}



.link-button {

  height:36px;

  display:inline-flex;

  align-items:center;

  justify-content:center;

  padding:0 .9rem;

  border:none;

  border-radius:8px;

  cursor:pointer;

  font-size:.85rem;

  font-weight:600;

  text-decoration:none;

  transition:.2s;

}



/* Editar */
.table-actions .link-button:first-child {

  background:#9fb9f3;

  color: #1b3d86;

}


.table-actions .link-button:first-child:hover {

  background:#5a7bd8;

  transform:translateY(-1px);

}



/* Guardar */
.table-actions .link-button:not(.link-button-danger) {

  color: #1b3d86;

}



/* Dar de baja */
.link-button-danger {

  background:#ffe8e8;

  color:#c0392b;

}


.link-button-danger:hover {

  background:#ffd2d2;

}



/* Inputs edición */
.admin-table input {

  padding:.5rem .7rem;

  border:1px solid var(--color-line);

  border-radius:8px;

  width:100%;

}



/* Loading */
.loading-state {

  text-align:center;

  padding:2rem;

  color:var(--color-ink-soft);

}



/* Scroll */
.table-scroll {

  overflow-x:auto;

  -webkit-overflow-scrolling:touch;

}

.new-category-form select {
  flex: 0.7;
  padding: .7rem 1rem;
  border: 1px solid var(--color-line);
  border-radius: 12px;
  background: var(--color-surface);
  font-size: .9rem;
}

.admin-table select {
  padding: .5rem .7rem;
  border: 1px solid var(--color-line);
  border-radius: 8px;
  width: 100%;
  background: var(--color-surface);
}



/* Responsive */
@media(max-width:900px){

  .new-category-form {

    flex-direction:column;

  }


  .admin-table {

    display:block;

  }


}

</style>