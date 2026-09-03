import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router/index.js';
import './assets/base.css';
import { useAuthStore } from './stores/auth.js';
import { useCartStore } from './stores/cart.js';

const app = createApp(App);

app.use(createPinia());
app.use(router);

const authStore = useAuthStore();
authStore.restoreSession();

if (authStore.isLoggedIn) {
  const cartStore = useCartStore();
  cartStore.loadCart();
}

app.mount('#app');
