<script setup>
import { RouterLink } from 'vue-router';

const sections = [
  { to: 'admin-products', title: 'Productos', description: 'Cargar, editar y dar de baja repuestos del catálogo' },
  { to: 'admin-categories', title: 'Categorías', description: 'Organizar el catálogo por tipo de repuesto' },
  { to: 'admin-orders', title: 'Pedidos', description: 'Ver y actualizar el estado de los pedidos recibidos' },
  { to: 'admin-stock', title: 'Stock', description: 'Registrar movimientos y ver alertas de stock bajo' },
  { to: 'admin-business', title: 'Datos del negocio', description: 'Dirección, teléfono, horarios y redes sociales' },
  { to: 'admin-order-history',title: 'Historial de pedidos',description: 'Estadísticas de ventas.'},
  { to:'admin-users',title:'Usuarios',description:'Administrar clientes y administradores'}
];
</script>

<template>
  <div class="container admin-home-view">
    <h1>Panel de administración</h1>
    <div class="admin-grid">
      <RouterLink v-for="s in sections" :key="s.to" :to="{ name: s.to }" class="admin-card">
        <h2>{{ s.title }}</h2>
        <p>{{ s.description }}</p>
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
</style>
