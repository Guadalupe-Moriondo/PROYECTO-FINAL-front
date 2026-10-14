import { ref } from 'vue';
import businessService from '../services/business.service';

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
  return { business, loading, loadBusiness: ensureLoaded };
}

