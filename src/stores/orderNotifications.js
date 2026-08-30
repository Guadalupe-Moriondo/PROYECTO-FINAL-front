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

        /*
         * Como el backend devuelve los pedidos ordenados
         * por createdAt DESC, el primero es el más reciente.
         */

        if (orders.length === 0) {
          newOrders.value = [];
          return;
        }

        const latestOrderId = orders[0].id;

        /*
         * Primera consulta:
         *
         * Guardamos cuál era el último pedido existente.
         * No mostramos ninguna notificación porque esos pedidos
         * ya existían antes de que el admin empezara a controlar.
         */
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

        /*
         * Buscar solamente los pedidos posteriores
         * al último pedido que el admin había visto.
         */
        const newOnes = orders.filter(
          order => order.id > lastSeenId
        );

        newOrders.value = newOnes;

        if (newOnes.length > 0) {
          console.log(
            '🔔 NUEVOS PEDIDOS:',
            newOnes.length
          );
        }

      } catch (error) {
        console.error(
          '❌ Error verificando nuevos pedidos:',
          error
        );
      }
    }

    function markAsSeen() {
      if (newOrders.value.length === 0) {
        return;
      }

      /*
       * Buscamos el pedido más reciente entre los nuevos.
       */
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

      console.log('⏱️ Polling de pedidos iniciado');

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
