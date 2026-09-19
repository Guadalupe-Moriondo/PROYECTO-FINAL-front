<script setup>
import { ref, computed, onMounted } from 'vue';
import usersService from '../../services/users.service';
import Pagination from '../../components/Pagination.vue';
import { useAuthStore } from '../../stores/auth.js';

const users = ref([]);
const loading = ref(true);
const saving = ref(false);
const message = ref('');
const error = ref('');
const authStore = useAuthStore();
const search = ref('');
const roleFilter = ref('all');
const page = ref(1);
const limit = 10;
const total = ref(0);

const totalPages = computed(() => {

  return Math.ceil(
    total.value / limit
  );
});

const statistics = ref({
  totalUsers: 0,
  totalAdmins: 0,
  totalCustomers: 0,
});

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

function searchUsers() {
  page.value = 1;
  loadUsers();
}

function filterByRole(role) {
  roleFilter.value = role;
  page.value = 1;
  loadUsers();
}

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

async function changeRole(user, newRole) {

  const newRoleLabel =
    newRole === 'admin'
      ? 'Administrador'
      : 'Cliente';

  const confirmed = window.confirm(
    `¿Querés cambiar el rol de ${user.name} a ${newRoleLabel}?`
  );

  if (!confirmed) {
    return;
  }

  const previousRole = user.role;
    
  saving.value = true;
  message.value = '';
  error.value = '';

  try {

    await usersService.updateRole(
      user.id,
      newRole
    );

    user.role = newRole;

    message.value =
      'Se ha actualizado el rol correctamente.';

    setTimeout(() => {

      message.value = '';

    }, 3000);

  } catch (err) {

    console.error(
      'Error cambiando rol:',
      err
    );

    user.role = previousRole;

    error.value =
      err.response?.data?.message ||
      'No se pudo actualizar el rol.';

    loadUsers();

  } finally {

    saving.value = false;

  }
}

function formatDate(date) {

  if (!date) return '-';

  return new Date(date)
    .toLocaleDateString(
      'es-AR'
    );
}

function roleLabel(role) {
  return role === 'admin'
    ? 'Administrador'
    : 'Cliente';
}

onMounted(() => {
  loadUsers();
});
</script>

<template>

  <div class="container admin-users-view">

    <div class="page-header page-header--compact">
      <h1>Usuarios</h1>
    </div>

    <div class="statistics-grid statistics-grid--summary">

      <div class="stat-card stat-card--summary clickable" @click="filterByRole('all')">
        <span class="stat-label stat-label--summary">Total usuarios</span>
        <span class="stat-value stat-value--summary">{{ statistics.totalUsers }}</span>
      </div>

      <div
        class="stat-card stat-card--summary stat-card--accent clickable"
        @click="filterByRole('admin')"
      >
        <span class="stat-label stat-label--summary">Administradores</span>
        <span class="stat-value stat-value--summary">{{ statistics.totalAdmins }}</span>
      </div>

      <div
         class="stat-card stat-card--summary clickable"
        @click="filterByRole('customer')"
      >
        <span class="stat-label stat-label--summary">Clientes</span>
        <span class="stat-value stat-value--summary">{{ statistics.totalCustomers }}</span>
      </div>

    </div>

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
          <strong>¡Rol actualizado correctamente!</strong>
          <span>{{ message }}</span>
        </div>
      </div>
    </Transition>

    <Transition name="error-toast">
      <div
        v-if="error"
        class="error-toast"
      >
        <div class="error-toast-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke-linecap="round"
            />
          </svg>
        </div>

        <div class="error-toast-content">
          <strong>Error</strong>
          <span>{{ error }}</span>
        </div>
      </div>
    </Transition>

    <p
      v-if="loading"
      class="loading-state"
    >
      Cargando usuarios...
    </p>

    <div
      v-else
      class="users-list"
    >
      <article
        v-for="user in users"
        :key="user.id"
        class="user-card"
      >
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

              </div>
            </div>
          </div>

          <div class="user-data">
            <div class="user-info-item">

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

        <div class="user-actions">

          <template v-if="authStore.isOwner">

            <span
              v-if="user.owner"
              class="owner-text"
            >
              Este usuario es el propietario principal.
              No se puede cambiar su rol.
            </span>

            <select v-else
              :value="user.role"
              @change="changeRole(user,$event.target.value)"
              :disable="saving"
            >
              <option value="customer">Cliente</option>
              <option value="admin">Administrador</option>
            </select>

          </template>

          <span
            v-else-if="user.owner"
            class="owner-text"
          >
            Este usuario es el propietario principal. No se puede cambiar su rol.
          </span>

        </div>
      </article>
    </div>

    <div
      v-if="!loading && users.length===0"
      class="empty-state"
    >
      No se encontraron usuarios.
    </div>

    <Pagination :page="page" :total-pages="totalPages" @change-page="changePage"/>

  </div>
</template>


<style scoped>
.admin-users-view{
  padding:var(--space-5) var(--space-4);
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

.users-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.user-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: 18px;
  padding: 1.5rem;
  transition: .25s;
  min-height: 300px;
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

.user-content {
  width: 100%;
}

.user-top {
  display: flex;
  justify-content: center;
  margin-bottom: .8rem;
}

.user-top > div {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .6rem;
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

.user-data {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: .6rem;
  width: 100%;
}

.user-actions {
  width: 100%;
  display: flex;
  align-items: center;
}

.user-actions select {
  display: block;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: .6rem .8rem;
  border-radius: 10px;
  border: 1px solid var(--color-line);
  background: white;
}

.owner-text {
  font-size: .8rem;
  color: #535353;
  text-align: center;
  font-style: italic;
  line-height: 1.5;
  width: 100%;
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
  box-shadow:
    0 12px 35px rgba(0, 0, 0, 0.12);

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
  border: 1px solid #f3bcbc;
  border-radius: 14px;
  box-shadow:
    0 12px 35px rgba(0, 0, 0, 0.12);

  color: #c0392b;
}

.error-toast-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #ffe8e8;
}

.error-toast-icon svg {
  width: 20px;
  height: 20px;
}

.error-toast-content {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.error-toast-content strong {
  font-size: 0.88rem;
  font-weight: 700;
}

.error-toast-content span {
  color: #7a4d4d;
  font-size: 0.78rem;
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
  .users-list {
    grid-template-columns: repeat(2, 1fr);
  }

  .user-actions{
    width:100%;
    justify-content:center;
  }

  .statistics-grid{
    grid-template-columns:1fr;
  }

  .users-toolbar{
    flex-direction:column;
  }
}

@media (max-width: 600px) {
  .users-list {
    grid-template-columns: 1fr;
  }

  .success-toast,
  .error-toast {
    top: 20px;
    right: 15px;
    left: 15px;
    min-width: auto;
    max-width: none;
  }

}
</style>