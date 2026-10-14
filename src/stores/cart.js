import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import cartService from '../services/cart.service';

export const useCartStore = defineStore('cart', () => {
  const items = ref([]);
  const loading = ref(false);

  const itemCount = computed(() =>
    items.value.reduce((total, item) => total + item.quantity, 0),
  );

  const total = computed(() =>
    items.value.reduce((acc, item) => acc + Number(item.product.price) * item.quantity, 0),
  );

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
