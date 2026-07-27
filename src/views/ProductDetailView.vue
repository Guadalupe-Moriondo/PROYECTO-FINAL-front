<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import productsService from '../services/products.service';
import businessService from '../services/business.service';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';
import AvailabilityTag from '@/components/AvailabilityTag.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();

const product = ref(null);
const loading = ref(true);
const error = ref('');
const quantity = ref(1);
const cartMessage = ref('');
const business = ref(null);

const imageUrl = computed(() => {
  if (!product.value?.imageUrl) return null;
  return `${import.meta.env.VITE_API_URL}${product.value.imageUrl}`;
});

const whatsappUrl = computed(() => {
  if (!business.value?.whatsapp || !product.value) return null;
  const number = business.value.whatsapp.replace(/\D/g, '');
  const text = encodeURIComponent(
    `Hola! Quería consultar por el repuesto "${product.value.name}" (código ${product.value.code}).`,
  );
  return `https://wa.me/${number}?text=${text}`;
});

async function loadProduct() {
  loading.value = true;
  try {
    const response = await productsService.getById(route.params.id);
    product.value = response.data;
  } catch (e) {
    error.value = 'No encontramos ese producto.';
  } finally {
    loading.value = false;
  }
}

async function loadBusiness() {
  // If it fails (e.g. business data hasn't been set up yet), we just
  // don't show the WhatsApp button
  try {
    const response = await businessService.get();
    business.value = response.data;
  } catch (e) {
    business.value = null;
  }
}

async function addToCart() {
  cartMessage.value = '';
  if (!authStore.isLoggedIn) {
    router.push({ name: 'login', query: { redirect: route.fullPath } });
    return;
  }
  await cartStore.addProduct(product.value.id, quantity.value);
  cartMessage.value = 'Se agregó al carrito.';
  setTimeout(() => {
  cartMessage.value = '';
  }, 3000);
}

onMounted(() => {
  loadProduct();
  loadBusiness();
});
</script>

<template>
  <div class="container detail-view">
    <p v-if="loading" class="loading-state">Cargando producto...</p>
    <p v-else-if="error" class="error-message">{{ error }}</p>

    <template v-else>

      <div class="detail-back-row">
        <BackButton />
      </div>
      <div class="detail-grid">
        <div class="detail-image">
          <img v-if="imageUrl" :src="imageUrl" :alt="product.name" />
          <span v-else class="detail-image-placeholder">Sin foto disponible</span>
        </div>

        <div class="detail-info">
          <p class="detail-brand" v-if="product.brand">{{ product.brand }}</p>
          <h1 class="detail-name">{{ product.name }}</h1>
          <AvailabilityTag
            :code="product.code"
            :stock="product.stock"
          />
          <p class="detail-price">$ {{ Number(product.price).toLocaleString('es-AR') }}</p>

          <p v-if="product.description" class="detail-text">{{ product.description }}</p>

          <div v-if="product.machineryCompatibility" class="detail-compatibility">
            <h3>Compatibilidad de maquinaria</h3>
            <p>{{ product.machineryCompatibility }}</p>
          </div>

          <div class="detail-actions">
            <div class="field field-quantity">
              <label for="quantity">Cantidad</label>
              <input
                id="quantity"
                type="number"
                min="1"
                :max="product.stock"
                v-model.number="quantity"
                :disabled="product.stock === 0"
              />
            </div>
            <button
              class="button button-primary"
              :disabled="product.stock === 0"
              @click="addToCart"
            >
              {{ product.stock === 0 ? 'Sin stock' : 'Agregar al carrito' }}
            </button>
          </div>
          <p v-if="cartMessage" class="success-message">
            {{ cartMessage }}
          </p>
          
          <div v-if="whatsappUrl" class="whatsapp-help">
            <p>¿Necesitás más información sobre este repuesto?</p>

            <a
              :href="whatsappUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="button-whatsapp"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
              >
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8 1-.2.2-.3.2-.5.1-1.4-.7-2.3-1.3-3.2-2.9-.2-.4.2-.4.6-1.2.1-.2 0-.4 0-.5-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-1 1-1 2.3 0 1.4 1 2.7 1.1 2.9.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/>
              </svg>

              <span>Consultar</span>
            </a>
          </div>
        </div>  
      </div>      
    </template>
  </div>
</template>

<style scoped>
.detail-view {
  padding: var(--space-5) var(--space-4);
}
.detail-back {
  display: inline-block;
  text-decoration: none;
  color: var(--color-ink-soft);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: var(--space-4);
}
.detail-back:hover { color: var(--color-rust); }
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
}
@media (max-width: 760px) {
  .detail-grid { grid-template-columns: 1fr; }
}
.detail-image {
  position: relative;
  aspect-ratio: 4 / 3;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-top: 3px solid var(--color-rust);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.detail-image-placeholder {
  font-family: var(--font-mono);
  color: var(--color-ink-soft);
  text-transform: uppercase;
  font-size: 0.85rem;
}
.detail-brand {
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-ink-soft);
  margin: 0 0 var(--space-1);
}
.detail-name {
  margin-bottom: var(--space-2);
}
.detail-price {
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 1.8rem;
  color: var(--color-rust);
  margin: var(--space-3) 0;
}
.detail-text {
  color: var(--color-ink-soft);
  line-height: 1.6;
}
.detail-compatibility {
  margin-top: var(--space-4);
  padding: var(--space-3);
  background: var(--color-surface);
  border-left: 3px solid var(--color-safety);
  border-radius: var(--radius-sm);
}
.detail-compatibility h3 { margin-bottom: var(--space-1); }
.detail-actions {
  display: flex;
  align-items: end;
  gap: var(--space-3);
  flex-wrap: wrap;
  margin-top: var(--space-4);
}
.field-quantity {
  width: 100px;
  margin-bottom: 0;
}

.whatsapp-help {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-line);
  
  justify-content: center;
}

.whatsapp-help p {
  margin-bottom: 0.8rem;
  color: var(--color-ink-soft);
  font-size: 0.95rem;
}

.button-whatsapp {
  display: inline-flex;
  align-items: center;
  gap: 10px;

  background: #33ad60;
  color: white;
  text-decoration: none;

  padding: 0.85rem 1.4rem;
  border-radius: 999px;
  font-weight: 600;

  transition: 0.2s ease;
}

.button-whatsapp:hover {
  background: #2d9754;
  transform: translateY(-2px);
}

.button-whatsapp svg {
  flex-shrink: 0;
}
</style>
