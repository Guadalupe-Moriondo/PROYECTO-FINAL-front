<script setup>
import { ref, onMounted } from 'vue';
import ordersService from '../services/orders.service';

const props = defineProps({
  orderId: { type: Number, required: true },
  orderNumber: { type: String, default: '' },
  showUser: { type: Boolean, default: false },
});
const emit = defineEmits(['close']);

const STATUS_LABELS = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  in_preparation: 'En preparación',
  withdraw: 'Retirar',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const loading = ref(true);
const error = ref('');
const entries = ref([]);

function formatDate(value) {
  return new Date(value).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function whoLabel(entry) {
  const user = entry.changedBy;
  if (!user) return 'Sistema';
  if (props.showUser) return user.name || 'Administrador';
  return user.role === 'admin' ? 'El negocio' : 'Vos';
}

onMounted(async () => {
  try {
    const response = await ordersService.getStatusHistory(props.orderId);
    entries.value = response.data;
  } catch (e) {
    error.value = 'No se pudo cargar el historial del pedido.';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="history-overlay" @click.self="emit('close')">
    <div class="history-modal" role="dialog" aria-modal="true">
      <header class="history-header">
        <h3>Historial del pedido <span v-if="orderNumber">#{{ orderNumber }}</span></h3>
        <button type="button" class="history-close" @click="emit('close')">✕</button>
      </header>

      <p v-if="loading" class="history-info">Cargando…</p>
      <p v-else-if="error" class="history-info history-info--error">{{ error }}</p>
      <p v-else-if="entries.length === 0" class="history-info">
        Este pedido no tiene movimientos registrados.
      </p>

      <ol v-else class="history-list">
        <li v-for="entry in entries" :key="entry.id" class="history-item">
          <span class="history-dot" :class="`history-dot--${entry.status}`"></span>
          <div>
            <strong>{{ STATUS_LABELS[entry.status] || entry.status }}</strong>
            <span class="history-meta">
              {{ formatDate(entry.createdAt) }} · {{ whoLabel(entry) }}
            </span>
          </div>
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.history-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}
.history-modal {
  background: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 420px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 20px 24px;
}
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.history-header h3 { margin: 0; font-size: 1.05rem; }
.history-close {
  border: none;
  background: transparent;
  font-size: 1.1rem;
  cursor: pointer;
}
.history-info { color: #555; margin: 8px 0; }
.history-info--error { color: #c8102e; }
.history-list { list-style: none; margin: 0; padding: 0; }
.history-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 10px 0;
  border-left: 2px solid #ddd;
  margin-left: 6px;
  padding-left: 14px;
  position: relative;
}
.history-dot {
  position: absolute;
  left: -7px;
  top: 14px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #999;
}
.history-dot--delivered { background: #2e7d32; }
.history-dot--cancelled { background: #c8102e; }
.history-meta { display: block; font-size: 0.8rem; color: #666; }
</style>