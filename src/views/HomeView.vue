<script setup>
import { ref, onMounted } from 'vue';
import { useBusiness } from '../composables/useBusiness';
import productsService from '../services/products.service';
import ProductCard from '../components/ProductCard.vue';
import ApacheLogo from '../assets/Brands/Apache.png';
import BucoLogo from '../assets/Brands/Buco.png';
import OmbuLogo from '../assets/Brands/Ombu.png';
import OncativoLogo from '../assets/Brands/Oncativo.png';
import RotorLogo from '../assets/Brands/Rotor.png';


const brands = [
  { name: 'Apache', image: ApacheLogo },
  { name: 'Buco', image: BucoLogo },
  { name: 'Ombu', image: OmbuLogo },
  { name: 'Oncativo', image: OncativoLogo },
  { name: 'Rotor', image: RotorLogo }
  
]

const { business, loading } = useBusiness();
const heroImageFailed = ref(false);

// Productos destacados: por ahora, los primeros del catálogo
const featuredProducts = ref([]);
const featuredLoading = ref(true);

async function loadFeatured() {
  try {
    const response = await productsService.list(1, 4);
    featuredProducts.value = response.data?.items || response.data?.data || response.data || [];
  } catch (e) {
    featuredProducts.value = [];
  } finally {
    featuredLoading.value = false;
  }
}

onMounted(loadFeatured);
</script>

<template>
  <div class="home-view">
    <!-- HERO -->
    <section class="hero">
      <div class="hero-image">
        <img
          v-if="!heroImageFailed"
          src="../assets/local.jpg"
          alt="Foto del local"
          class="hero-image-img"
          @error="heroImageFailed = true"
        />
        <div v-else class="hero-image-fallback">
          <span class="hero-image-icon">📷</span>
          <p>Agregá la foto del local en <code>src/assets/local.jpg</code></p>
        </div>
      </div>
      <div class="hero-scrim"></div>
      <div class="hero-content">
        <h1 class="hero-title">Repuestos Agrícolas</h1>
        <div class="hero-actions">
          <RouterLink :to="{ name: 'catalog' }" class="button button-hero-primary">Ver catálogo</RouterLink>
        </div>
      </div>
    </section>

    <!-- MARCAS CON LAS QUE TRABAJAMOS -->
    <section class="brands-strip">
      <div class="container">
        <p class="section-eyebrow brands-eyebrow">Marcas con las que trabajamos</p>

        <div class="brands-grid">
          
          <div v-for="brand in brands" :key="brand.name" class="brand-item">
            <img
              :src="brand.image"
              :alt="brand.name"
              class="brand-logo"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- PRODUCTOS DESTACADOS -->
    <section class="featured-section">
      <div class="container">
        <h2 class="featured-heading">Productos destacados</h2>

        <div v-if="featuredLoading" class="featured-grid">
          <div v-for="n in 4" :key="n" class="featured-skeleton"></div>
        </div>

        <div v-else-if="featuredProducts.length" class="featured-grid">
          <ProductCard
            v-for="product in featuredProducts"
            :key="product.id"
            :product="product"
          />
        </div>

        <p v-else class="featured-empty">Todavía no hay productos cargados.</p>
   
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ============ HERO ============ */
.hero {
  position: relative;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--color-steel);
}
.hero-image {
  position: absolute;
  inset: 0;
}
.hero-image-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-image-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  background: linear-gradient(135deg, var(--color-steel), var(--color-steel-light));
  color: #cfcfcf;
  text-align: center;
  padding: var(--space-4);
}
.hero-image-icon { font-size: 2.5rem; opacity: 0.6; }
.hero-image-fallback code {
  color: var(--color-rust);
  font-family: var(--font-mono);
  font-size: 0.8rem;
}
.hero-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.35) 45%, rgba(0, 0, 0, 0.85) 100%);
}
.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 0 var(--space-4);
  max-width: 760px;
}
.hero-title {
  color: #fff;
  margin: 0 0 var(--space-3);
  font-size: clamp(2.6rem, 6vw, 4.5rem);
  line-height: 1.02;
  letter-spacing: 0.01em;
}
.hero-address {
  color: #e5e5e5;
  font-family: var(--font-mono);
  font-size: 0.95rem;
  margin: 0 0 var(--space-4);
}
.hero-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  flex-wrap: wrap;
}
.button-hero-primary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 14px 34px;
  border-radius: var(--radius-sm);
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.95rem;
  text-decoration: none;
  border: 2px solid transparent;
  cursor: pointer;
  background: var(--color-rust);
  color: #fff;
}
.button-hero-primary:hover { background: var(--color-rust-dark); }

/* ============ MARCAS ============ */
.brands-strip {
  background: #fff;
  padding: var(--space-5) 0;
  border-bottom: 1px solid var(--color-line);
}
.brands-eyebrow {
  text-align: center;
  margin-bottom: var(--space-4);
}
.section-eyebrow {
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 2rem;
  color: var(--color-rust);
  margin: 0 0 var(--space-2);
}

.brands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 5rem;
  align-items: center;
  justify-items: center;
  
}

.brand-item {
  display: flex;
  justify-content: center;
  align-items: center;
}

.brand-logo {
  width: 200px;
  height: 130px;
  object-fit: contain;
  transition: .3s;
}

.brand-logo:hover {
  transform: scale(1.08);
}

/* ============ PRODUCTOS DESTACADOS ============ */
.featured-section {
  background: var(--color-bg);
  padding: var(--space-6) 0;
}
.featured-heading {
  text-align: center;
  margin-bottom: var(--space-5);
}
.featured-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}
.featured-skeleton {
  aspect-ratio: 3 / 4;
  border-radius: var(--radius-md);
  background: linear-gradient(90deg, var(--color-line) 25%, #f2f2f2 37%, var(--color-line) 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}
@keyframes shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}
.featured-empty {
  text-align: center;
  color: var(--color-ink-soft);
}
.featured-cta {
  display: flex;
  justify-content: center;
  margin-top: var(--space-5);
}

@media (max-width: 960px) {
  .featured-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 560px) {
  .featured-grid { grid-template-columns: 1fr; }
  .brands-list { gap: var(--space-3) var(--space-4); }
  .brand-item { font-size: 0.95rem; }
}
</style>
