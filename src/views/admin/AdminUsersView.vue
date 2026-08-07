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
const roleFilter = ref('all');

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
      search.value,
      roleFilter.value
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

function filterByRole(role) {

  roleFilter.value = role;

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

    <div class="page-header">
      <h1>Usuarios</h1>
    </div>

    <!-- Estadísticas -->

    <div class="statistics-grid">

      <div class="stat-card clickable" @click="filterByRole('all')">
        <span class="stat-label">Total usuarios</span>
        <span class="stat-value">{{ statistics.totalUsers }}</span>
      </div>

      <div
        class="stat-card stat-card--accent clickable"
        @click="filterByRole('admin')"
      >
        <span class="stat-label">Administradores</span>
        <span class="stat-value">{{ statistics.totalAdmins }}</span>
      </div>

      <div
        class="stat-card clickable"
        @click="filterByRole('customer')"
      >
        <span class="stat-label">Clientes</span>
        <span class="stat-value">{{ statistics.totalCustomers }}</span>
      </div>

    </div>

    <!-- Buscador -->

    <div class="users-toolbar">

      <input
        v-model="search"
        @keyup.enter="searchUsers"
        type="text"
        placeholder="Buscar usuario..."
      >

      <button
        class="button button-primary"
        @click="searchUsers"
      >
        Buscar
      </button>

    </div>

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

    <p
      v-if="loading"
      class="loading-state"
    >
      Cargando usuarios...
    </p>

    <!-- Tarjetas -->

    <div
      v-else
      class="users-list"
    >

      <article
        v-for="user in users"
        :key="user.id"
        class="user-card"
      >

        <!-- Avatar -->

        <div class="user-avatar">

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            
          >
            <path d="M20 21a8 8 0 0 0-16 0"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>

        </div>

        <!-- Información -->

        <div class="user-content">

          <div class="user-top">

            <div>

              <h2>{{ user.name }}</h2>

              <div class="badges">

                <span
                  class="role-badge"
                  :class="{ 'role-admin': user.role === 'admin' }"
                >
                  {{ roleLabel(user.role) }}
                </span>

                <span
                  v-if="user.owner"
                  class="owner-badge"
                >
                  Principal
                </span>

              </div>

            </div>

          </div>

          <div class="user-data">

            <div class="user-info-item">

              <!-- Email -->

              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M2 5.5A1.5 1.5 0 0 1 3.5 4h17A1.5 1.5 0 0 1 22 5.5v13A1.5 1.5 0 0 1 20.5 20h-17A1.5 1.5 0 0 1 2 18.5v-13ZM4.2 6l7.4 5.7a.6.6 0 0 0 .8 0L19.8 6H4.2ZM4 7.8V18h16V7.8l-7.4 5.7a2.1 2.1 0 0 1-2.6 0L4 7.8Z"
                />
              </svg>

              <span>{{ user.email }}</span>

            </div>



            <div class="user-info-item">

              <!-- Teléfono -->

              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M6.62 10.79a15.054 15.054 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.72 11.72 0 003.68.59 1 1 0 011 1V20a1 1 0 01-1 1C10.3 21 3 13.7 3 4a1 1 0 011-1h3.47a1 1 0 011 1 11.72 11.72 0 00.59 3.68 1 1 0 01-.24 1.01l-2.2 2.1z"
                />
              </svg>

              <span>{{ user.phone || '-' }}</span>

            </div>



            <div class="user-info-item">

              <!-- Fecha -->

              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M7 2v2H5a2 2 0 00-2 2v13a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2V2h-2v2H9V2H7zm12 8H5v9h14v-9z"
                />
              </svg>

              <span>{{ formatDate(user.createdAt) }}</span>

            </div>

          </div>
        </div>
        <!-- Acciones -->

        <div class="user-actions">

          <template v-if="!user.owner">

            <select
              v-model="user.role"
              @change="changeRole(user)"
            >
              <option value="customer">Cliente</option>
              <option value="admin">Administrador</option>
            </select>

          </template>

          <span
            v-else
            class="owner-text"
          >
            Este usuario es el propietario principal. No se puede cambiar su rol.
          </span>

        </div>

      </article>

    </div>

    <!-- Sin resultados -->

    <div
      v-if="!loading && users.length===0"
      class="empty-state"
    >
      No se encontraron usuarios.
    </div>

    <!-- Paginación -->

    <div
      v-if="totalPages>1"
      class="pagination"
    >

      <button
        @click="changePage(page-1)"
        :disabled="page===1"
      >
        ←
      </button>

      <span>
        Página {{ page }} de {{ totalPages }}
      </span>

      <button
        @click="changePage(page+1)"
        :disabled="page===totalPages"
      >
        →
      </button>

    </div>

  </div>

</template>

<style scoped>

.admin-users-view{
    padding:var(--space-5) var(--space-4);
}

.page-header{
    margin-bottom:2rem;
}

.statistics-grid{
    display:grid;
    grid-template-columns:repeat(3,1fr);
    gap:1rem;
    margin-bottom:2rem;
}

.stat-card{
    background:var(--color-surface);
    border:1px solid var(--color-line);
    border-left:4px solid var(--color-rust);
    border-radius:16px;
    padding:1.3rem;
    cursor:pointer;
    transition:.25s;
}

.stat-card:hover{
    transform:translateY(-3px);
    box-shadow:0 10px 25px rgba(0,0,0,.08);
}

.stat-label{
    display:block;
    color:var(--color-ink-soft);
    font-size:.8rem;
    margin-bottom:.4rem;
}

.stat-value{
    font-size:2rem;
    font-weight:700;
}

.users-toolbar {

  display:flex;

    gap:1rem;

    margin-bottom:2rem;

  }



.users-toolbar input {

  flex:1;

    padding:.8rem 1rem;

    border-radius:50px;

    border:1px solid var(--color-line);

}


.users-toolbar input {

  outline:none;

  transition:.25s;

}

.users-list{
    display:flex;
    flex-direction:column;
    gap:1rem;
}

.user-card{

    display:flex;
    align-items:center;
    gap:2rem;

    background:var(--color-surface);

    border:1px solid var(--color-line);

    border-radius:18px;

    padding:1.4rem 1.8rem;

    transition:.25s;

}

.user-card:hover{

    transform:translateY(-2px);

    box-shadow:0 12px 24px rgba(0,0,0,.08);

}

.user-card:hover .user-info-item svg{
    transform:scale(1.15);
    transition:.2s;
}

.user-avatar{

    width:72px;

    height:72px;

    border-radius:50%;

    display:flex;

    align-items:center;

    justify-content:center;

    background:var(--color-bg);

    border:1px solid var(--color-line);

    flex-shrink:0;

}

.user-avatar svg{

    width:34px;

    height:34px;

}

.user-content{

    flex:1;

}

.user-top{

    display:flex;

    align-items:center;

    margin-bottom:.8rem;

}

.user-top > div {
  display: flex;
  align-items: center;
  gap: .8rem;
}

.user-top h2{

    margin:0;

    font-size:1.2rem;

}

.badges{

    display:flex;

    gap:.5rem;

    align-items:center;

    margin-top:0;

}

.role-badge{

    padding:5px 12px;

    border-radius:999px;

    background: rgba(14, 116, 144, 0.12);

    border:1px solid #acd1f5;

    color: #3f7bb8;

    font-size:.75rem;

    font-weight:700;
    
}

.role-admin{

    background:rgba(183, 53, 45, 0.08);

    color: var(--color-rust);

    border:1px solid #d4a0a0;

    

}

.owner-badge{

    background:#fff6d8;

    color:rgb(180, 148, 59);

    border:1px solid #edd07f;

    padding:5px 12px;

    border-radius:999px;

    font-size:.75rem;

    font-weight:700;

}

.user-data{

    display:flex;

    gap:2rem;

    flex-wrap:wrap;

    color:var(--color-ink-soft);

    font-size:.9rem;

}

.user-actions{

    width:20px;

    display:flex;

    justify-content:flex-end;

    align-items:center;

}

.user-actions select{

    width:200px;

    padding:.5rem;

    border-radius:50px;

    border:1px solid var(--color-line);

    background:white;

}

.owner-text{

    font-size:.8rem;

    color:#535353;

    text-align:right;

    font-style: italic;


}

.success-message{

    padding:1rem;

    border-radius:12px;

    background:#e8f7ec;

    color:#24773c;

    margin-bottom:1rem;

}

.error-message{

    padding:1rem;

    border-radius:12px;

    background:#ffeaea;

    color:#b42318;

    margin-bottom:1rem;

}

.loading-state,

.empty-state{

    padding:3rem;

    text-align:center;

    color:var(--color-ink-soft);

}

.pagination{

    display:flex;

    justify-content:center;

    align-items:center;

    gap:1rem;

    margin-top:2rem;

}

.pagination button{

    width:40px;

    height:40px;

    border-radius:50%;

    border:1px solid var(--color-line);

    cursor:pointer;

}


.user-info-item{

    display:flex;

    align-items:center;

    gap:.5rem;

    color: rgb(59, 59, 59);

    font-size:.9rem;

}

.user-info-item svg{

    width:18px;
    height:18px;

    color: rgb(59, 59, 59);

}

@media(max-width:900px){

.user-card{

    flex-direction:column;

    align-items:flex-start;

}

.user-actions{

    width:100%;

    justify-content:flex-start;

}

.user-actions select{

    width:100%;

}

.user-data{

    flex-direction:column;

    gap:.4rem;

}

.statistics-grid{

    grid-template-columns:1fr;

}

.users-toolbar{

    flex-direction:column;

}

}
</style>