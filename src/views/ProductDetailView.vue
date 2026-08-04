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
  <div class="container product-page">

    <!-- Estados -->
    <p v-if="loading" class="page-state">
      Cargando producto...
    </p>

    <p v-else-if="error" class="page-state page-state-error">
      {{ error }}
    </p>


    <div v-else>

      <div class="product-back">
        <BackButton />
      </div>


      <main class="product-layout">


        <!-- Imagen principal -->
        <section class="product-media">

          <div class="image-frame">

            <img
              v-if="imageUrl"
              :src="imageUrl"
              :alt="product.name"
            />

            <span v-else>
              Sin imagen disponible
            </span>

          </div>

        </section>





        <!-- Información -->
        <section class="product-panel">


          <div class="product-heading">

            <p
              v-if="product.brand"
              class="product-brand"
            >
              {{ product.brand }}
            </p>


            <h1>
              {{ product.name }}
            </h1>


            <AvailabilityTag
              :code="product.code"
              :stock="product.stock"
            />

          </div>





          <div class="product-price">

            $ {{ Number(product.price).toLocaleString('es-AR') }}

          </div>





          <div
            v-if="product.description"
            class="product-description"
          >

            <h3>
              Descripción
            </h3>

            <p>
              {{ product.description }}
            </p>

          </div>





          <!-- Compra -->

          <div class="purchase-box">


            <div class="quantity-control">

              <label for="quantity">
                Cantidad
              </label>


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
              class="button button-primary purchase-button"
              :disabled="product.stock === 0"
              @click="addToCart"
            >

              {{
                product.stock === 0
                ? 'Sin stock'
                : 'Agregar al carrito'
              }}

            </button>


          </div>




          <p
            v-if="cartMessage"
            class="cart-message"
          >
            {{ cartMessage }}
          </p>






          <!-- WhatsApp -->

          <div
            v-if="whatsappUrl"
            class="contact-box"
          >

            <div>

              <strong>
                ¿Necesitás ayuda?
              </strong>

              <p>
                Consultanos por compatibilidad o disponibilidad.
              </p>

            </div>


            <a
              :href="whatsappUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="whatsapp-button"
            >

              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="currentColor"
              >
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8 1-.2.2-.3.2-.5.1-1.4-.7-2.3-1.3-3.2-2.9-.2-.4.2-.4.6-1.2.1-.2 0-.4 0-.5-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-1 1-1 2.3 0 1.4 1 2.7 1.1 2.9.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/>
              </svg>

              WhatsApp

            </a>


          </div>



        </section>

      </main>





      <!-- Compatibilidad abajo -->

      <section
        v-if="product.machineryCompatibility"
        class="compatibility-section"
      >

        <h2>
          Compatibilidad de maquinaria
        </h2>


        <p>
          {{ product.machineryCompatibility }}
        </p>


      </section>


    </div>


  </div>
</template>

<style scoped>


.product-page {

  padding:
    var(--space-5)
    var(--space-4);

}



.page-state {

  text-align:center;

  padding:3rem;

  font-family:
    var(--font-mono);

  color:
    var(--color-ink-soft);

}


.page-state-error {

  color:
    var(--color-rust);

}



/* BACK */

.product-back {

  margin-bottom:
    var(--space-4);

}




/* LAYOUT PRINCIPAL */

.product-layout {

  display:grid;

  grid-template-columns:
    1.25fr
    .85fr;

  gap:
    var(--space-5);

  align-items:start;

}



@media(max-width:900px){

  .product-layout{

    grid-template-columns:1fr;

  }

}





/* IMAGEN */

.product-media {

  position:sticky;

  top:20px;

}



.image-frame {

  aspect-ratio:
    1 / 1;

  background:
    var(--color-surface);

  border:
    1px solid var(--color-line);

  border-top:
    4px solid var(--color-rust);

  border-radius:
    var(--radius-md);

  display:flex;

  justify-content:center;

  align-items:center;

  overflow:hidden;

}



.image-frame img {

  width:100%;

  height:100%;

  object-fit:contain;

  padding:2rem;

}



.image-frame span {

  font-family:
    var(--font-mono);

  color:
    var(--color-ink-soft);

}





/* PANEL DERECHO */


.product-panel {

  display:flex;

  flex-direction:column;

  gap:var(--space-3);

}




.product-brand {

  font-family:
    var(--font-mono);

  text-transform:
    uppercase;

  letter-spacing:.1em;

  color:
    var(--color-ink-soft);

  margin:0;

}



.product-heading h1 {

  margin:
    .5rem 0;

  line-height:1.15;

}



.product-code {

  margin-top:.8rem;

  font-family:
    var(--font-mono);

  font-size:.85rem;

  color:
    var(--color-ink-soft);

}



.product-price {

  font-family: var(--font-display);

  font-weight:700;

  font-size:2.2rem;

  color:
    var(--color-rust);

}





/* DESCRIPCION */

.product-description {

  border-top:
    1px solid var(--color-line);

  padding-top:
    var(--space-3);

}



.product-description h3 {

  margin-bottom:.5rem;

}





/* COMPRA */

.purchase-box {

  background:
    var(--color-surface);

  border:
    1px solid var(--color-line);

  padding:
    var(--space-3);

  border-radius:
    var(--radius-md);

}



.quantity-control {

  display:flex;
  gap:1rem;

}



.quantity-control input {

  max-width:100px;

}



.purchase-button {

  margin-top:
    var(--space-3);

  width:100%;

}





.cart-message {

  background: #e8f7ec;
  color: #207a3c;
  border: 1px solid #b7e2c4;
  padding: .9rem 1rem;
  border-radius: 12px;

}





/* WHATSAPP */

.contact-box {

  margin-top:
    var(--space-3);

  padding:
    var(--space-3);

  border:
    1px solid var(--color-line);

  border-radius:
    var(--radius-md);

  display:flex;

  justify-content:space-between;

  align-items:center;

  gap:1rem;

}



.contact-box p {

  margin:.3rem 0 0;

  color:
    var(--color-ink-soft);

  font-size:.9rem;

}



.whatsapp-button {


  display:flex;

  align-items:center;

  gap:.5rem;


  background:#33ad60;

  color:white;


  padding:
    .8rem 1.2rem;


  border-radius:
    999px;


  text-decoration:none;


  white-space:nowrap;


  transition:.2s ease;


}



.whatsapp-button:hover {

  background:#2d9754;

  transform:
    translateY(-2px);

}





/* COMPATIBILIDAD */

.compatibility-section {

  margin-top:
    var(--space-5);

  padding:
    var(--space-4);


  background:
    var(--color-surface);


  border-left:
    4px solid var(--color-safety);


  border-radius:
    var(--radius-md);

}



.compatibility-section h2 {

  margin-bottom:
    var(--space-2);

}





@media(max-width:600px){


  .contact-box{

    flex-direction:column;

    align-items:stretch;

  }


  .whatsapp-button{

    justify-content:center;

  }


  .product-media{

    position:static;

  }


}


</style>