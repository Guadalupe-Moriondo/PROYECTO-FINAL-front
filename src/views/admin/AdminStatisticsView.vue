<script setup>
import { ref, onMounted } from 'vue';
import ordersService from '../../services/orders.service';

const loading = ref(true);

const statistics = ref({
  month: { orders: 0, total: 0 },
  year: { orders: 0, total: 0 },
});

async function load() {
  loading.value = true;

  try {
    const statsResponse = await ordersService.statistics();

    const now = new Date();

    const monthKey = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, '0')}`;

    const yearKey = `${now.getFullYear()}`;

    const empty = { orders: 0, total: 0 };

    statistics.value = {
      month: statsResponse.data.monthly?.[monthKey] ?? empty,
      year: statsResponse.data.yearly?.[yearKey] ?? empty,
    };

  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>


<template>
  <div class="container admin-history-view">

    <div class="page-header">
      <h1>Historial de pedidos</h1>
    </div>


    <p v-if="loading" class="loading-state">
      Cargando...
    </p>


    <template v-else>

      <div class="statistics-grid">

        <router-link 
          :to="{ name: 'admin-order-history-month' }" 
          class="stat-card stat-card--clickable"
        >
          <span class="stat-label">
            Pedidos del mes

            <span class="stat-toggle-hint">
              detalle ▼
            </span>
          </span>

          <span class="stat-value">
            {{ statistics.month.orders }}
          </span>
        </router-link>


        <div class="stat-card stat-card--accent">

          <span class="stat-label">
            Facturación mensual
          </span>

          <span class="stat-value">
            $ {{ Number(statistics.month.total).toLocaleString('es-AR') }}
          </span>

        </div>



        <router-link 
          :to="{ name: 'admin-order-history-year' }" 
          class="stat-card stat-card--clickable"
        >

          <span class="stat-label">
            Pedidos del año

            <span class="stat-toggle-hint">
              detalle ▼
            </span>
          </span>

          <span class="stat-value">
            {{ statistics.year.orders }}
          </span>

        </router-link>



        <div class="stat-card stat-card--accent">

          <span class="stat-label">
            Facturación anual
          </span>

          <span class="stat-value">
            $ {{ Number(statistics.year.total).toLocaleString('es-AR') }}
          </span>

        </div>

      </div>

    </template>

  </div>
</template>

<style scoped>
.admin-history-view {
  padding: var(--space-5) var(--space-4);
}

.page-header {
  margin-bottom: var(--space-5);
}
.page-subtitle {
  margin: 0;
  color: var(--color-ink-soft);
  font-size: 0.95rem;
}

.loading-state {
  color: var(--color-ink-soft);
  padding: var(--space-4) 0;
}

/* Tarjetas de estadisticas */
.statistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}

.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-left: 4px solid var(--color-steel);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}
.stat-card--accent {
  border-left-color: var(--color-rust);
}

.stat-label {
  font-family: var(--font-display);
  text-transform: uppercase;
  font-size: 0.78rem;
  letter-spacing: 0.05em;
  color: var(--color-ink-soft);
}
.stat-value {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--color-ink);
}
.stat-card--accent .stat-value {
  color: var(--color-rust);
}

.section-title {
  margin-top: var(--space-2);
}

/* Tabla de historial */
.table-wrapper {
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  overflow-x: auto;
}
.history-table {
  width: 100%;
  border-collapse: collapse;
}
.history-table th {
  text-align: left;
  font-family: var(--font-display);
  text-transform: uppercase;
  font-size: 0.78rem;
  color: var(--color-ink-soft);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg);
  border-bottom: 2px solid var(--color-line);
  white-space: nowrap;
}
.history-table td {
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--color-line);
}
.history-table tbody tr:hover {
  background: var(--color-bg);
}
.history-table tbody tr:last-child td {
  border-bottom: none;
}
.table-mono {
  font-family: var(--font-mono);
}
.table-subtext {
  display: block;
  font-size: 0.78rem;
  color: var(--color-ink-soft);
}

.status-badge {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(200, 16, 46, 0.08);
  color: var(--color-rust-dark);
  border: 1px solid rgba(200, 16, 46, 0.25);
}

.empty-state {
  text-align: center;
  padding: var(--space-5) 0;
  color: var(--color-ink-soft);
  font-style: italic;
}

.detail-toggle {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-rust);
  background: none;
  border: 1px solid var(--color-rust);
  border-radius: var(--radius-sm);
  padding: 4px 10px;
  cursor: pointer;
}
.detail-toggle:hover {
  background: var(--color-rust);
  color: #fff;
}
.detail-row td {
  background: var(--color-bg);
  padding: var(--space-3);
}
.detail-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.detail-list li {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  font-size: 0.9rem;
}
.detail-qty {
  font-family: var(--font-mono);
  color: var(--color-rust-dark);
  font-weight: 600;
}
.detail-name {
  color: var(--color-ink);
}
.detail-subtotal {
  margin-left: auto;
  font-family: var(--font-mono);
  color: var(--color-ink-soft);
}

.stat-card--clickable {
  cursor: pointer;
}
.stat-card--clickable:hover {
  border-left-color: var(--color-rust);
}
.stat-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-2);
}
.stat-toggle-hint {
  font-size: 0.68rem;
  color: var(--color-rust);
  text-transform: none;
  letter-spacing: normal;
}
.breakdown-panel {
  margin-bottom: var(--space-5);
}

.breakdown-panel .history-table {
  display: block;
  max-height: 320px;
  overflow-y: auto;
}
.breakdown-panel .history-table thead,
.breakdown-panel .history-table tbody tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}

a.stat-card {
  text-decoration: none;
  color: inherit;
}
</style>