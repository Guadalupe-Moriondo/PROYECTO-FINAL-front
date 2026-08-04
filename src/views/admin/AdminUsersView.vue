<script setup>
import { ref, computed, onMounted } from 'vue';
import usersService from '../../services/users.service';


// ==============================
// ESTADO
// ==============================

const users = ref([]);

const loading = ref(true);
const saving = ref(false);

const message = ref('');
const error = ref('');


// ==============================
// BUSQUEDA Y PAGINACION
// ==============================

const search = ref('');

const page = ref(1);
const limit = 10;

const total = ref(0);


// ==============================
// ESTADISTICAS
// ==============================

const statistics = ref({
  totalUsers: 0,
  totalAdmins: 0,
  totalCustomers: 0,
});


// ==============================
// CARGAR USUARIOS
// ==============================

async function loadUsers() {

  loading.value = true;

  try {

    const response = await usersService.list(
      page.value,
      search.value
    );


    users.value = response.data.items;

    total.value = response.data.total;


    statistics.value = {
    totalUsers:
        response.data.statistics?.totalUsers ?? 0,

    totalAdmins:
        response.data.statistics?.totalAdmins ?? 0,

    totalCustomers:
        response.data.statistics?.totalCustomers ?? 0,
    };


  } catch (err) {

    console.error(
      'Error cargando usuarios:',
      err
    );

    error.value =
      'No se pudieron cargar los usuarios.';


  } finally {

    loading.value = false;

  }

}



// ==============================
// BUSCADOR
// ==============================

function searchUsers() {

  page.value = 1;

  loadUsers();

}



// ==============================
// CAMBIO DE PAGINA
// ==============================

function changePage(newPage) {

  if (
    newPage < 1 ||
    newPage > totalPages.value
  ) {
    return;
  }


  page.value = newPage;

  loadUsers();

}



// ==============================
// PAGINAS TOTALES
// ==============================

const totalPages = computed(() => {

  return Math.ceil(
    total.value / limit
  );

});



// ==============================
// CAMBIAR ROL
// ==============================

async function changeRole(user) {

  saving.value = true;

  message.value = '';
  error.value = '';


  try {

    await usersService.updateRole(
      user.id,
      user.role
    );


    message.value =
      'Rol actualizado correctamente.';


    setTimeout(() => {

      message.value = '';

    }, 3000);



  } catch (err) {

    console.error(
      'Error cambiando rol:',
      err
    );


    error.value =
      err.response?.data?.message ||
      'No se pudo actualizar el rol.';


    // si falla volvemos a cargar
    loadUsers();


  } finally {

    saving.value = false;

  }

}



// ==============================
// FORMATEAR FECHA
// ==============================

function formatDate(date) {

  if (!date) return '-';


  return new Date(date)
    .toLocaleDateString(
      'es-AR'
    );

}



// ==============================
// LABEL DEL ROL
// ==============================

function roleLabel(role) {

  return role === 'admin'
    ? 'Administrador'
    : 'Cliente';

}



// ==============================
// INICIO
// ==============================

onMounted(() => {

  loadUsers();

});

</script>

<template>

  <div class="container admin-users-view">


    <!-- HEADER -->
    <div class="page-header">

      <h1>
        Usuarios
      </h1>

    </div>



    <!-- ESTADISTICAS -->

    <div class="statistics-grid">


      <div class="stat-card">

        <span class="stat-label">
          Total usuarios
        </span>

        <span class="stat-value">
          {{ statistics.totalUsers }}
        </span>

      </div>



      <div class="stat-card stat-card--accent">


        <span class="stat-label">
          Administradores
        </span>


        <span class="stat-value">
          {{ statistics.totalAdmins }}
        </span>


      </div>




      <div class="stat-card">


        <span class="stat-label">
          Clientes
        </span>


        <span class="stat-value">
          {{ statistics.totalCustomers }}
        </span>


      </div>



    </div>





    <!-- BUSCADOR -->


    <div class="users-toolbar">


      <input
        v-model="search"
        @keyup.enter="searchUsers"
        type="text"
        placeholder="Buscar por nombre o email..."
      />


      <button
        class="button button-primary"
        @click="searchUsers"
      >

        Buscar

      </button>


    </div>






    <!-- MENSAJES -->


    <p
      v-if="message"
      class="success-message"
    >

      {{ message }}

    </p>



    <p
      v-if="error"
      class="error-message"
    >

      {{ error }}

    </p>







    <!-- LOADING -->


    <p
      v-if="loading"
      class="loading-state"
    >

      Cargando usuarios...

    </p>







    <!-- LISTADO -->


    <div
      v-else
      class="users-grid"
    >




      <article
        v-for="user in users"
        :key="user.id"
        class="user-card"
      >



        <div class="user-header">


          <div class="user-avatar">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >

              <path d="M20 21a8 8 0 0 0-16 0"/>

              <circle
                cx="12"
                cy="7"
                r="4"
              />

            </svg>


          </div>




          <div>


            <h2>
              {{ user.name }}
            </h2>


            <span
              class="role-badge"
              :class="{
                'role-admin':
                user.role === 'admin'
              }"
            >

              {{ roleLabel(user.role) }}

            </span>


          </div>


        </div>







        <div class="user-info">


          <p>

            <strong>Email:</strong>

            {{ user.email }}

          </p>




          <p v-if="user.phone">

            <strong>Teléfono:</strong>

            {{ user.phone }}

          </p>




          <p>

            <strong>Registro:</strong>

            {{ formatDate(user.createdAt) }}

          </p>


        </div>








        <div class="role-control">


          <label>
            Cambiar rol
          </label>



          <select
            v-model="user.role"
            @change="changeRole(user)"
            :disabled="saving"
          >

            <option value="customer">
              Cliente
            </option>


            <option value="admin">
              Administrador
            </option>


          </select>


        </div>




      </article>




    </div>








    <!-- SIN RESULTADOS -->


    <div
      v-if="!loading && users.length === 0"
      class="empty-state"
    >

      No se encontraron usuarios.


    </div>








    <!-- PAGINACION -->


    <div
      v-if="totalPages > 1"
      class="pagination"
    >


      <button
        @click="changePage(page - 1)"
        :disabled="page === 1"
      >

        ←

      </button>




      <span>

        Página {{ page }}
        de {{ totalPages }}

      </span>




      <button
        @click="changePage(page + 1)"
        :disabled="page === totalPages"
      >

        →

      </button>



    </div>



  </div>

</template>
<style scoped>

/* ==============================
   CONTENEDOR
============================== */

.admin-users-view {

  padding: var(--space-5) var(--space-4);

}



/* ==============================
   HEADER
============================== */

.page-header {

  margin-bottom: var(--space-5);

}


.page-header h1 {

  margin-bottom: var(--space-1);

}



.page-header p {

  margin: 0;

  color: var(--color-ink-soft);

  font-size: .95rem;

}





/* ==============================
   ESTADISTICAS
============================== */

.statistics-grid {

  display:grid;

  grid-template-columns:
    repeat(auto-fit,minmax(220px,1fr));

  gap:var(--space-3);

  margin-bottom:var(--space-5);

}



.stat-card {

  background:var(--color-surface);

  border:1px solid var(--color-line);

  border-left:4px solid var(--color-steel);

  border-radius:var(--radius-md);

  padding:var(--space-4);

  display:flex;

  flex-direction:column;

  gap:.4rem;

  transition:.2s ease;

}



.stat-card:hover {

  transform:translateY(-2px);

  box-shadow:
    0 8px 18px rgba(0,0,0,.08);

}



.stat-card--accent {

  border-left-color:
    var(--color-rust);

}



.stat-label {

  font-family:var(--font-display);

  text-transform:uppercase;

  letter-spacing:.05em;

  font-size:.75rem;

  color:var(--color-ink-soft);

}



.stat-value {

  font-family:var(--font-mono);

  font-size:1.8rem;

  font-weight:600;

}





/* ==============================
   BUSCADOR
============================== */


.users-toolbar {

  display:flex;

  gap:var(--space-3);

  margin-bottom:var(--space-4);

}



.users-toolbar input {

  flex:1;

  padding:.75rem 1rem;

  border-radius:var(--radius-md);

  border:1px solid var(--color-line);

  background:var(--color-surface);

  font-size:.9rem;

}



.users-toolbar input:focus {

  outline:none;

  border-color:var(--color-steel);

}






/* ==============================
   MENSAJES
============================== */


.success-message {

  background:#e8f7ec;

  color:#207a3c;

  padding:.8rem 1rem;

  border-radius:10px;

  margin-bottom:var(--space-3);

}



.error-message {

  background:#ffe8e8;

  color:#c0392b;

  padding:.8rem 1rem;

  border-radius:10px;

  margin-bottom:var(--space-3);

}






/* ==============================
   GRID USUARIOS
============================== */


.users-grid {

  display:grid;

  grid-template-columns:
    repeat(auto-fill,minmax(300px,1fr));

  gap:var(--space-3);

}





/* ==============================
   TARJETA USUARIO
============================== */


.user-card {

  background:var(--color-surface);

  border:1px solid var(--color-line);

  border-radius:var(--radius-md);

  padding:var(--space-4);

  display:flex;

  flex-direction:column;

  gap:var(--space-3);

  transition:.2s ease;

}



.user-card:hover {

  transform:translateY(-2px);

  box-shadow:
    0 8px 20px rgba(0,0,0,.08);

}





/* ==============================
   HEADER TARJETA
============================== */


.user-header {

  display:flex;

  align-items:center;

  gap:var(--space-3);

}



.user-header h2 {

  margin:0 0 .4rem;

  font-size:1.1rem;

}




.user-avatar {

  width:48px;

  height:48px;

  border-radius:50%;

  background:var(--color-bg);

  border:1px solid var(--color-line);

  display:flex;

  align-items:center;

  justify-content:center;

}



.user-avatar svg {

  width:24px;

  height:24px;

  color:var(--color-ink-soft);

}






/* ==============================
   ROLES
============================== */


.role-badge {

  display:inline-flex;

  padding:3px 10px;

  border-radius:999px;

  font-size:.72rem;

  font-family:var(--font-mono);

  text-transform:uppercase;

  letter-spacing:.04em;

  background:var(--color-bg);

  color:var(--color-ink-soft);

  border:1px solid var(--color-line);

}



.role-admin {

  background:
    rgba(200,16,46,.08);

  color:
    var(--color-rust-dark);

  border-color:
    rgba(200,16,46,.25);

}





/* ==============================
   INFORMACION
============================== */


.user-info {

  display:flex;

  flex-direction:column;

  gap:.45rem;

}



.user-info p {

  margin:0;

  font-size:.9rem;

  color:var(--color-ink-soft);

}



.user-info strong {

  color:var(--color-ink);

}





/* ==============================
   CAMBIO DE ROL
============================== */


.role-control {

  border-top:1px solid var(--color-line);

  padding-top:var(--space-3);

}



.role-control label {

  display:block;

  margin-bottom:.5rem;

  font-size:.8rem;

  font-weight:600;

  color:var(--color-ink-soft);

}



.role-control select {

  width:100%;

  padding:.65rem 1rem;

  border-radius:12px;

  border:1px solid var(--color-line);

  background:var(--color-surface);

  cursor:pointer;

}



.role-control select:focus {

  outline:none;

  border-color:var(--color-steel);

}






/* ==============================
   LOADING / EMPTY
============================== */


.loading-state {

  color:var(--color-ink-soft);

  padding:var(--space-4) 0;

}



.empty-state {

  text-align:center;

  padding:var(--space-5);

  color:var(--color-ink-soft);

  font-style:italic;

}







/* ==============================
   PAGINACION
============================== */


.pagination {

  margin-top:var(--space-5);

  display:flex;

  justify-content:center;

  align-items:center;

  gap:var(--space-3);

}



.pagination button {

  width:38px;

  height:38px;

  border-radius:50%;

  border:1px solid var(--color-line);

  background:var(--color-surface);

  cursor:pointer;

  transition:.2s ease;

}



.pagination button:hover:not(:disabled) {

  border-color:var(--color-rust);

  color:var(--color-rust);

}



.pagination button:disabled {

  opacity:.4;

  cursor:not-allowed;

}



.pagination span {

  font-family:var(--font-mono);

  font-size:.85rem;

  color:var(--color-ink-soft);

}







/* ==============================
   RESPONSIVE
============================== */


@media(max-width:700px){


  .users-toolbar {

    flex-direction:column;

  }


  .users-toolbar button {

    width:100%;

  }


  .users-grid {

    grid-template-columns:1fr;

  }


}

</style>