import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import cartService from '../services/cart.service';

export const useCartStore = defineStore('cart', () => {
  // ---- STATE ----
  const items = ref([]);
  const loading = ref(false);

  // ---- GETTERS ----
  // Total UNITS in the cart (for the little badge on the navbar icon),
  // not the number of distinct rows.
  const itemCount = computed(() =>
    items.value.reduce((total, item) => total + item.quantity, 0),
  );

  const total = computed(() =>
    items.value.reduce((acc, item) => acc + Number(item.product.price) * item.quantity, 0),
  );

  // ---- ACTIONS ----

  // Called when the user logs in, and on any view that needs to show
  // the current cart (e.g. entering /cart)
  async function loadCart() {
    loading.value = true;
    try {
      const response = await cartService.view();
      items.value = response.data.items;
    } finally {
      loading.value = false;
    }
  }

  async function addProduct(productId, quantity = 1) {
    const response = await cartService.addItem(productId, quantity);
    items.value = response.data.items;
  }

  async function updateQuantity(itemId, quantity) {
    const response = await cartService.updateQuantity(itemId, quantity);
    items.value = response.data.items;
  }

  async function removeItem(itemId) {
    const response = await cartService.removeItem(itemId);
    items.value = response.data.items;
  }

  // Called after confirming an order, or on logout
  function clearLocal() {
    items.value = [];
  }

  return {
    items,
    loading,
    itemCount,
    total,
    loadCart,
    addProduct,
    updateQuantity,
    removeItem,
    clearLocal,
  };
});
