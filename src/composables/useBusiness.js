import { ref } from 'vue';
import businessService from '../services/business.service';

// Estado a nivel de módulo: así, si el Footer y los botones flotantes
// se montan al mismo tiempo, no disparamos dos pedidos GET /business.
const business = ref(null);
const loading = ref(true);
let fetchPromise = null;

function ensureLoaded() {
  if (!fetchPromise) {
    fetchPromise = businessService
      .get()
      .then((response) => {
        business.value = response.data;
      })
      .catch(() => {
        business.value = null;
      })
      .finally(() => {
        loading.value = false;
      });
  }
  return fetchPromise;
}

export function useBusiness() {
  ensureLoaded();
  return { business, loading };
}

