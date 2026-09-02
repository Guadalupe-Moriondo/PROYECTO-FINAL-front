<script setup>
import { RouterLink } from 'vue-router';
import { useOrderNotificationsStore } from '../../stores/orderNotifications';

const sections = [
  { to: 'admin-categories', title: 'Categorías', description: 'Organizar el catálogo por marca.' },
  { to: 'admin-products', title: 'Productos', description: 'Cargar, editar y dar de baja repuestos del catálogo.' },
  { to: 'admin-orders', title: 'Pedidos', description: 'Ver y actualizar el estado de los pedidos recibidos.' },
  { to: 'admin-stock', title: 'Stock', description: 'Registrar movimientos y ver alertas de stock bajo.' },
  { to: 'admin-business', title: 'Datos del negocio', description: 'Dirección, teléfono, horarios y redes sociales.' },
  { to: 'admin-order-history',title: 'Historial de pedidos',description: 'Estadísticas de ventas.'},
  { to:'admin-users',title:'Usuarios',description:'Administrar clientes y administradores.'}
];

const orderNotificationsStore = useOrderNotificationsStore();

</script>

<template>
  <div class="container admin-home-view">
    <h1>Panel de administración</h1>
    <div class="admin-grid">
      <RouterLink v-for="s in sections" :key="s.to" :to="{ name: s.to }" class="admin-card">
        <div class="admin-card-header">
          <h2>{{ s.title }}</h2>
          <span 
            v-if="s.to === 'admin-orders' && orderNotificationsStore.hasNewOrders" 
            class="admin-notification"
          >
            {{ orderNotificationsStore.newOrdersCount }}
          </span>
        </div>
        <p>{{ s.description }}</p>
        <span
          v-if="s.to === 'admin-orders' && orderNotificationsStore.hasNewOrders" 
          class="new-order-message"
        >
          Nuevos pedidos 
        </span>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.admin-home-view {
  padding: var(--space-5) var(--space-4);
}

.admin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-3);
}

.admin-card {
  text-decoration: none;
  color: inherit;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-left: 4px solid var(--color-rust);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}

.admin-card:hover { border-color: var(--color-rust); }
.admin-card h2 { margin-bottom: var(--space-1); font-size: 1.15rem; }
.admin-card p { margin: 0; color: var(--color-ink-soft); font-size: 0.9rem; }
.admin-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.admin-notification {
  min-width: 28px;
  height: 28px;
  padding: 0 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--color-rust);
  color: white;
  font-size: 0.8rem;
  font-weight: 700;
  animation: notification-pulse 1.5s infinite;
}

.new-order-message {
  display: block;
  margin-top: 12px;
  color: var(--color-rust);
  font-size: 0.85rem;
  font-weight: 700;
}

@keyframes notification-pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.08);
  }

  100% {
    transform: scale(1);
  }
}
</style>
