import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import ordersService from '../services/orders.service';

export const useOrderNotificationsStore = defineStore(
  'orderNotifications',
  () => {
    const newOrders = ref([]);
    const initialized = ref(false);

    let interval = null;

    const hasNewOrders = computed(() => {
      return newOrders.value.length > 0;
    });

    const newOrdersCount = computed(() => {
      return newOrders.value.length;
    });

    async function checkNewOrders() {
      try {
        const response = await ordersService.listAll(1, 100);
        const orders = response.data?.data || [];

        if (orders.length === 0) {
          newOrders.value = [];
          return;
        }

        const latestOrderId = orders[0].id;

        if (!initialized.value) {
          const lastSeenId = localStorage.getItem(
            'admin_last_seen_order_id'
          );

          if (!lastSeenId) {
            localStorage.setItem(
              'admin_last_seen_order_id',
              latestOrderId
            );

            initialized.value = true;
            newOrders.value = [];

            return;
          }
          
          initialized.value = true;
        }

        const lastSeenId = Number(
          localStorage.getItem('admin_last_seen_order_id')
        );

        const newOnes = orders.filter(
          order => order.id > lastSeenId
        );

        newOrders.value = newOnes;

        if (newOnes.length > 0) {
          console.log(
            'NUEVOS PEDIDOS:',
            newOnes.length
          );
        }

      } catch (error) {
        console.error(
          'Error verificando nuevos pedidos:',
          error
        );
      }
    }

    function markAsSeen() {
      if (newOrders.value.length === 0) {
        return;
      }

      const newestOrderId = Math.max(
        ...newOrders.value.map(order => order.id)
      );

      localStorage.setItem(
        'admin_last_seen_order_id',
        newestOrderId
      );

      newOrders.value = [];
    }

    function startPolling() {
      if (interval) {
        return;
      }

      console.log('Polling de pedidos iniciado');

      checkNewOrders();

      interval = setInterval(() => {
        checkNewOrders();
      }, 3000);
    }

    function stopPolling() {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    }

    return {
      newOrders,
      hasNewOrders,
      newOrdersCount,
      checkNewOrders,
      markAsSeen,
      startPolling,
      stopPolling,
    };
  }
);
