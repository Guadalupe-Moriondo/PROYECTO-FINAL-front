<script setup>
import { ref, onMounted } from 'vue';
import stockService from '../../services/stock.service';
import Pagination from '@/components/Pagination.vue';

const movements = ref([]);
const loadingMovements = ref(true);
const movementPage = ref(1);
const movementTotalPages = ref(1);
const errorMessage = ref('');
let errorTimeout = null;

async function loadMovements() {

  loadingMovements.value = true;
  errorMessage.value = '';

  try {
    const res = await stockService.history(
        movementPage.value,
        10
    );

    movements.value =
        res.data?.data ||
        res.data?.items ||
        [];

    movementTotalPages.value =
        res.data?.totalPages ||
        res.data?.meta?.totalPages ||
        1;
  } catch (error) {
    console.error(error);
    errorMessage.value = 'No se pudo cargar el historial';

    clearTimeout(errorTimeout);

    errorTimeout = setTimeout(() => {
      errorMessage.value = '';
    }, 5000);
  } finally {
    loadingMovements.value = false;
  }
}

function changeMovementPage(newPage) {
  movementPage.value = newPage;
  loadMovements();
}

function getMovementType(type) {
  return type === 'in' ? 'Entrada' : 'Salida';
}

function formatDate(date) {
  if (!date) return '-';

  const value = new Date(date);

  return value.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTime(date) {
  if (!date) return '-';

  const value = new Date(date);

  return value.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

onMounted(() => {
  loadMovements();
});
</script>

<template>
  <section class="stock-history-view">
    <div class="stock-history-header">
      <div>
        <h1>Historial de movimientos</h1>
      </div>
    </div>

    <div class="stock-history-card">
      <div class="card-header">
        <div>
          <h2>Historial de stock</h2>
        </div>
      </div>

      <div
        v-if="errorMessage"
        class="error-toast"
      >
        <span class="toast-icon">!</span>

        <div>
          <strong>No se pudo cargar el historial</strong>
          <p>Intentá nuevamente en unos instantes.</p>
        </div>
      </div>

      <div
        v-if="loadingMovements"
        class="table-loading"
      >
        Cargando historial...
      </div>

      <div
        v-else-if="!movements.length"
        class="empty-state"
      >
        No hay movimientos de stock registrados.
      </div>

      <div
        v-else
        class="table-scroll"
      >
        <table class="admin-table admin-table--basic">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Motivo</th>
              <th>Fecha</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="movement in movements"
              :key="movement.id"
            >
              <td>
                <div class="product-cell">
                  <strong>
                    {{ movement.product?.name || '-' }}
                  </strong>

                  <span
                    v-if="movement.product?.code"
                    class="product-code"
                  >
                    Código: {{ movement.product.code }}
                  </span>
                </div>
              </td>

              <td>
                <span
                  class="movement-type"
                  :class="{
                    'movement-in': movement.type === 'in',
                    'movement-out': movement.type === 'out'
                  }"
                >
                  {{ getMovementType(movement.type) }}
                </span>
              </td>

              <td>
                {{ movement.quantity }}
              </td>

              <td>
                {{ movement.reason || '-' }}
              </td>

              <td>
                <div class="date-cell">
                  <span class="date">
                    {{ formatDate(movement.createdAt) }}
                  </span>

                  <span class="time">
                    {{ formatTime(movement.createdAt) }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="!loadingMovements && movements.length"
        class="pagination-wrapper"
      >
        <Pagination :page="movementPage" :total-pages="movementTotalPages" @change-page="changeMovementPage"/>
      </div>
    </div>
  </section>
</template>

<style scoped>

.stock-history-view {
  padding: 45px 30px 70px;
  max-width: 1400px;
  margin: 0 auto;
}

.stock-history-header {
  margin-bottom: 30px;
}

.stock-history-header h1 {
  margin: 0;
  color: var(--color-ink);
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 700;
}

.stock-history-header p {
  margin: 8px 0 0;
  color: var(--color-ink-soft);
  font-size: 0.95rem;
}

/* CARD */

.stock-history-card {
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* HEADER DE LA TABLA */

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 28px;
  border-bottom: 1px solid var(--color-line);
}

.card-header h2 {
  margin: 0;
  color: var(--color-ink);
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 700;
}

.card-header p {
  margin: 6px 0 0;
  color: var(--color-ink-soft);
  font-size: 0.9rem;
}

/* BOTÓN VOLVER */

.back-button {
  flex-shrink: 0;
  padding: 10px 16px;
  border: 1px solid var(--color-line);
  border-radius: 10px;
  background: #fff;
  color: var(--color-steel);
  font-family: var(--font-body);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    border-color 0.25s ease,
    color 0.25s ease,
    background 0.25s ease,
    transform 0.25s ease;
}

.back-button:hover {
  border-color: var(--color-rust);
  color: var(--color-rust);
  background: #fffaf9;
  transform: translateY(-1px);
}

/* TABLA */

.table-scroll {
  width: 100%;
  overflow-x: auto;
}



/* PRODUCTO ALINEADO A LA IZQUIERDA */

.admin-table--basic th:first-child,
.admin-table--basic td:first-child {
  text-align: left;
}

.admin-table--basic .product-cell {
  align-items: flex-start;
}

/* TODAS LAS DEMÁS COLUMNAS CENTRADAS */

.admin-table--basic th:not(:first-child),
.admin-table--basic td:not(:first-child) {
  text-align: center;
}


/* PRODUCTO */

.product-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.product-cell strong {
  color: var(--color-ink);
  font-weight: 600;
}

.product-code {
  display: block;
  color: var(--color-ink-soft);
  font-family: var(--font-mono);
  font-size: .8rem;
}

/* TIPO DE MOVIMIENTO */

.movement-type {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 75px;
  padding: 6px 11px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}

.movement-in {
  background: #eaf7ee;
  color: #277a43;
}

.movement-out {
  background: #fff0ed;
  color: var(--color-rust-dark);
}

/* FECHA */

.date-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.date-cell .date {
  color: var(--color-ink);
}

.date-cell .time {
  color: #9ca3af;
  font-size: 0.78rem;
}

/* PAGINACIÓN */

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 22px 20px 25px;
  border-top: 1px solid var(--color-line);
}

/* LOADING / VACÍO */

.table-loading,
.empty-state {
  padding: 55px 20px;
  color: var(--color-ink-soft);
  text-align: center;
  font-size: 0.9rem;
}

/* ERROR */

.error-toast {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 28px 0;
  padding: 14px 16px;
  border: 1px solid #f0c8c3;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #c94b3f;
  color: white;
  font-size: 0.82rem;
  font-weight: 700;
}

.error-toast strong {
  display: block;
  color: #a9362d;
  font-size: 0.88rem;
}

.error-toast p {
  margin: 3px 0 0;
  color: var(--color-ink-soft);
  font-size: 0.8rem;
}

/* RESPONSIVE */

@media (max-width: 900px) {
  .stock-history-view {
    padding: 40px 20px 60px;
  }

  .card-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .back-button {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .stock-history-view {
    padding: 30px 14px 50px;
  }

  .stock-history-header h1 {
    font-size: 1.65rem;
  }

  .stock-history-card {
    border-radius: 14px;
  }

  .card-header {
    padding: 20px;
  }

  .admin-table {
    min-width: 700px;
  }

  .table-scroll {
    overflow-x: auto;
  }

  .error-toast {
    margin: 16px 20px 0;
  }
}

</style>
