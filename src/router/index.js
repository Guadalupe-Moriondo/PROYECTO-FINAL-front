import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Public views
import HomeView from '../views/HomeView.vue';
import CatalogView from '../views/CatalogView.vue';
import ProductDetailView from '../views/ProductDetailView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import ContactView from '../views/ContactView.vue';
import NotFoundView from '../views/NotFoundView.vue';

// Views that require being logged in (customer)
import CartView from '../views/CartView.vue';
import CheckoutView from '../views/CheckoutView.vue';
import MyOrdersView from '../views/MyOrdersView.vue';

// Admin views (require login + admin role)
import AdminHomeView from '../views/admin/AdminHomeView.vue';
import AdminProductsView from '../views/admin/AdminProductsView.vue';
import AdminProductFormView from '../views/admin/AdminProductFormView.vue';
import AdminCategoriesView from '../views/admin/AdminCategoriesView.vue';
import AdminOrdersView from '../views/admin/AdminOrdersView.vue';
import AdminStockView from '../views/admin/AdminStockView.vue';
import AdminBusinessView from '../views/admin/AdminBusinessView.vue';
import AdminStatisticsView from '../views/admin/AdminStatisticsView.vue';
import AdminOrdersByMonthView from '../views/admin/AdminOrdersByMonthView.vue';
import AdminOrdersByYearView from '../views/admin/AdminOrdersByYearView.vue';

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 };
  },
  routes: [
    { path: '/', name: 'home', component: HomeView,meta: {hideBack:true} },
    { path: '/catalogo', name: 'catalog', component: CatalogView },
    { path: '/product/:id', name: 'product-detail', component: ProductDetailView, props: true },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/contact', name: 'contact', component: ContactView },

    // "meta" is where we mark what restrictions each route has.
    // The global guard (below) reads this object before letting anyone through.
    {
      path: '/cart',
      name: 'cart',
      component: CartView,
      meta: { requiresAuth: true },
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: CheckoutView,
      meta: { requiresAuth: true },
    },
    {
      path: '/my-orders',
      name: 'my-orders',
      component: MyOrdersView,
      meta: { requiresAuth: true },
    },

    {
      path: '/admin',
      name: 'admin-home',
      component: AdminHomeView,
      meta: { requiresAuth: true, requiresAdmin: true,hideBack:true },
    },
    {
      path: '/admin/products',
      name: 'admin-products',
      component: AdminProductsView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/products/new',
      name: 'admin-product-new',
      component: AdminProductFormView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/products/:id/edit',
      name: 'admin-product-edit',
      component: AdminProductFormView,
      props: true,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/categories',
      name: 'admin-categories',
      component: AdminCategoriesView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/orders',
      name: 'admin-orders',
      component: AdminOrdersView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    
    {
      path: '/admin/stock',
      name: 'admin-stock',
      component: AdminStockView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/business',
      name: 'admin-business',
      component: AdminBusinessView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },

    {
      path: '/admin/orders/history',
      name: 'admin-order-history',
      component: AdminStatisticsView,
      meta: { requiresAdmin: true }
    },

    {
      path: '/admin/orders/history/month',
      name: 'admin-order-history-month',
      component: AdminOrdersByMonthView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },

    {
      path: '/admin/orders/history/year',
      name: 'admin-order-history-year',
      component: AdminOrdersByYearView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },

    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
  ],
});

// router.beforeEach runs BEFORE every route change, across the whole app.
// It's the frontend equivalent of the Guards you used in NestJS:
// it intercepts navigation and decides whether to allow it or redirect.
router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    // Save where the user wanted to go, to send them there after login
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    // Logged in, but doesn't have the required role: send to catalog
    return { name: 'catalog' };
  }

  return true;
});

export default router;
