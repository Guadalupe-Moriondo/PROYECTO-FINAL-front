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


// Restore the session (if a token was saved in localStorage from a
// previous visit) BEFORE mounting the app, so the router guard and
// the navbar already know if the user is logged in on the first render.
const authStore = useAuthStore();
authStore.restoreSession();

// If there was already a session, preload the cart so the navbar
// counter is correct from startup (not only after visiting /cart)
if (authStore.isLoggedIn) {
  const cartStore = useCartStore();
  cartStore.loadCart();
}

app.mount('#app');
