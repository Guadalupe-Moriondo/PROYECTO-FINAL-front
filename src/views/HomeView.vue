<script setup>
import { ref, computed, onMounted ,onUnmounted } from 'vue';
import { useBusiness } from '../composables/useBusiness';
import productsService from '../services/products.service';
import ProductCard from '../components/ProductCard.vue';

import Hero1 from '../assets/Hero 1.jpg';
import Hero2 from '../assets/Hero 2.jpg';
import Hero3 from '../assets/Hero 3.jpg';
import ApacheLogo from '../assets/Brands/Apache.png';
import BucoLogo from '../assets/Brands/Buco.png';
import OmbuLogo from '../assets/Brands/Ombu.png';
import OncativoLogo from '../assets/Brands/Oncativo.png';
import RotorLogo from '../assets/Brands/Rotor.png';
import AgrometalLogo from '../assets/Brands/Agrometal.png';
import CaseLogo from '../assets/Brands/Case.png';
import CeleLogo from '../assets/Brands/Cele.png';
import CrucianelliLogo from '../assets/Brands/Crucianelli.png';
import ErcaLogo from '../assets/Brands/Erca.png';
import JohnDeereLogo from '../assets/Brands/John Deere.png';
import NewHollandLogo from '../assets/Brands/New Holland.jpg';
import TanziLogo from '../assets/Brands/Tanzi.jpg';
import TedeschiLogo from '../assets/Brands/Tedeschi.png';
import TossoliniLogo from '../assets/Brands/Tossolini.png';

const { business } = useBusiness();

const brands = [
  { name: 'Apache', image: ApacheLogo },
  { name: 'Buco', image: BucoLogo },
  { name: 'Ombu', image: OmbuLogo },
  { name: 'Oncativo', image: OncativoLogo },
  { name: 'Rotor', image: RotorLogo },
  { name: 'Agrometal', image: AgrometalLogo },
  { name: 'Case', image: CaseLogo },
  { name: 'Cele', image: CeleLogo },
  { name: 'Crucianelli', image: CrucianelliLogo },
  { name: 'Erca', image: ErcaLogo },
  { name: 'John Deere', image: JohnDeereLogo },
  { name: 'New Holland', image: NewHollandLogo },
  { name: 'Tanzi', image: TanziLogo },
  { name: 'Tedeschi', image: TedeschiLogo },
  { name: 'Tossolini', image: TossoliniLogo },
];

const whatsappUrl = computed(() => {
  if (!business.value?.whatsapp) {
    return '#';
  }

  const digits = business.value.whatsapp.replace(/\D/g, '');

  const text = encodeURIComponent(
    'Hola, quisiera consultar por un repuesto agrícola.'
  );

  return `https://wa.me/${digits}?text=${text}`;

  
});

const heroImages = [
 Hero1,
 Hero2,
 Hero3,
 
];

const currentHeroImage = ref(0);
const heroImageFailed = ref(false);
const products = ref([]);
const productsLoading = ref(true);

async function loadProducts() {
  try {
    const response = await productsService.list(1, 10);

    products.value =
      response.data?.items ||
      response.data?.data ||
      response.data ||
      [];
  } catch (e) {
    products.value = [];
  } finally {
    productsLoading.value = false;
  }
}

onMounted(loadProducts);

let heroInterval = null;

onMounted(() => {
  heroInterval = setInterval(() => {
    currentHeroImage.value =
      (currentHeroImage.value + 1) % heroImages.length;
  }, 4000);
});

onUnmounted(() => {
  clearInterval(heroInterval);
});
</script>

<template>
  <div class="home-view">

    <!-- ================= HERO ================= -->
    <section class="hero">

      <div class="hero-image">
        <img
          v-if="!heroImageFailed"
          :src="heroImages[currentHeroImage]"
          alt="Maquinaria agrícola"
          class="hero-image-img"
          @error="heroImageFailed = true"
        />

        <div v-else class="hero-image-fallback">
          <span class="hero-image-icon"></span>

          <p>
            Agregá la foto del local en
            <code>src/assets/local.jpg</code>
          </p>
        </div>
      </div>

      <div class="hero-scrim"></div>

      <div class="hero-content container">

        <h1 class="hero-title">
          Repuestos Agrícolas
        </h1>

        <p class="hero-description">
          Calidad, confianza y el respaldo que tu maquinaria
          necesita para seguir rindiendo al máximo.
        </p>

        <div class="hero-actions">

          <RouterLink
            :to="{ name: 'catalog' }"
            class="button button-hero-primary"
          >
            Ver catálogo
      
          </RouterLink>

        </div>

      </div>

    </section>


    <!-- ================= BENEFICIOS ================= -->
    <section class="benefits-section">

      <div class="container">

        <div class="benefits-card">

          <article class="benefit-item">

            <div class="benefit-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.43 12.98c.04-.32.07-.65.07-.98s-.02-.66-.07-.98l2.03-1.58-1.92-3.32-2.39.96a7.7 7.7 0 0 0-1.69-.98L15.1 3h-3.8l-.36 3.1c-.6.24-1.16.57-1.68.98l-2.4-.96-1.9 3.32 2.03 1.58c-.04.32-.08.65-.08.98s.03.66.08.98l-2.03 1.58 1.9 3.32 2.4-.96c.52.41 1.08.74 1.68.98l.36 3.1h3.8l.36-3.1a7.7 7.7 0 0 0 1.69-.98l2.39.96 1.92-3.32-2.03-1.58ZM13.2 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"/>
              </svg>
            </div>

            <div>
              <h3>
                Repuestos de calidad
              </h3>

              <p>
                Trabajamos con las mejores marcas
                del mercado agrícola.
              </p>
            </div>

          </article>


          <article class="benefit-item">

            <div class="benefit-icon">
               <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="m9.2 16.6-4-4L3.8 14l5.4 5.4L21 7.6 19.6 6.2 9.2 16.6Z"/>
              </svg>
            </div>

            <div>
              <h3>
                Confianza y respaldo
              </h3>

              <p>
                Acompañamos tu trabajo
                en cada temporada.
              </p>
            </div>

          </article>


          <article class="benefit-item">

            <div class="benefit-icon">
               <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h5v5h3.5l1.8 3.5H19a3 3 0 1 1 0 2h-4.2l-1.8-3.5H11v2a3.5 3.5 0 1 1-2-3.12V8H6v3H4V6h2Zm1.5 8.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm11 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM13 4h4l2 4h-2l-1-2h-3V4Z"/>
              </svg>
            </div>

            <div>
              <h3>
                Para todas las máquinas
              </h3>

              <p>
                Soluciones para cada necesidad
                en el campo.
              </p>
            </div>

          </article>


          <article class="benefit-item">

            <div class="benefit-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.6 2.5h2.2c.5 0 .9.3 1 .8l1 3.7c.1.4 0 .8-.3 1.1L9 9.6a15 15 0 0 0 5.4 5.4l1.5-1.5c.3-.3.7-.4 1.1-.3l3.7 1c.5.1.8.5.8 1v2.2c0 .6-.4 1.1-1 1.1C11.9 18.5 5.5 12.1 5.5 4c0-.6.5-1 1.1-1Z"/>
              </svg>
            </div>

            <div>
              <h3>
                Atención personalizada
              </h3>

              <p>
                Estamos para ayudarte
                siempre que lo necesites.
              </p>
            </div>

          </article>

        </div>

      </div>

    </section>


    <!-- ================= PRODUCTOS ================= -->
    <section class="products-scroll-section">

      <div class="products-background"></div>

      <div class="container products-container">

        <div class="products-section-header">

          <p class="section-kicker">
            Conocé nuestros
          </p>

          <h2>
            Productos
          </h2>

          <p class="products-description">
            Repuestos seleccionados para que tu maquinaria
            nunca se detenga.
          </p>

        </div>


        <div
          v-if="productsLoading"
          class="products-scroll"
        >

          <div
            v-for="n in 5"
            :key="n"
            class="product-skeleton"
          ></div>

        </div>


        <div
          v-else-if="products.length"
          class="products-scroll"
        >

          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
          />

        </div>


        <p
          v-else
          class="products-empty"
        >
          No hay productos disponibles.
        </p>


        <div class="products-button-wrapper">

          <RouterLink
            :to="{ name: 'catalog' }"
            class="products-button"
          >
            Ver todos los productos
          </RouterLink>

        </div>

      </div>

    </section>


    <!-- ================= MARCAS ================= -->
    <section class="brands-section">

      <div class="container">

        <div class="brands-header">

          <p class="section-kicker">
            Nuestras marcas
          </p>

          <h2>
            Calidad y confianza en cada marca
          </h2>

        </div>


        <div class="brands-grid">

          <div
            v-for="brand in brands"
            :key="brand.name"
            class="brand-item"
          >

            <img
              :src="brand.image"
              :alt="brand.name"
              class="brand-logo"
            />

          </div>

        </div>

      </div>

    </section>

  </div>
</template>


<style scoped>

/* =========================================================
   GENERAL
========================================================= */

.home-view {
  background: var(--color-bg);
}

.container {
  width: min(1200px, calc(100% - 40px));
  margin: 0 auto;
}


/* =========================================================
   HERO
========================================================= */

.hero {
  position: relative;
  min-height: 78vh;

  display: flex;
  align-items: center;

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

  background:
    linear-gradient(
      135deg,
      var(--color-steel),
      var(--color-steel-light)
    );

  color: #cfcfcf;

  text-align: center;

  padding: var(--space-4);
}

.hero-image-icon {
  font-size: 2.5rem;
  opacity: 0.6;
}

.hero-image-fallback code {
  color: var(--color-rust);

  font-family: var(--font-mono);
  font-size: 0.8rem;
}

.hero-scrim {
  position: absolute;
  inset: 0;

  background:
    linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.68) 0%,
      rgba(0, 0, 0, 0.42) 45%,
      rgba(0, 0, 0, 0.22) 100%
    );
}

.hero-content {
  position: relative;
  z-index: 2;

  padding-top: 70px;
  padding-bottom: 70px;
}

.hero-kicker {
  margin: 0 0 12px;

  color: #fff;

  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 700;

  text-transform: uppercase;
  letter-spacing: 0.12em;

  opacity: 0.9;
}

.hero-title {
  max-width: 700px;

  margin: 0 0 18px;

  color: #fff;

  font-size: clamp(3rem, 6vw, 5rem);

  line-height: 1;

  letter-spacing: -0.02em;
}

.hero-description {
  max-width: 560px;

  margin: 0 0 32px;

  color: rgba(255, 255, 255, 0.92);

  font-size: 1.1rem;
  line-height: 1.65;
}

.hero-actions {
  display: flex;
  align-items: center;

  gap: var(--space-3);
}

.button-hero-primary {
  display: inline-flex;

  align-items: center;
  justify-content: center;

  gap: 18px;

  padding: 15px 24px;

  border-radius: 8px;

  background: var(--color-rust);

  color: #fff;

  font-family: var(--font-display);

  font-size: 0.95rem;
  font-weight: 700;

  text-decoration: none;

  transition:
    transform .2s ease,
    background .2s ease;
}

.button-hero-primary:hover {
  background: var(--color-rust-dark);

  transform: translateY(-2px);
}

.button-arrow {
  font-size: 1.25rem;
  line-height: 1;
}


/* =========================================================
   BENEFICIOS
========================================================= */

.benefits-section {
  position: relative;
  z-index: 5;

  margin-top: -55px;

  padding: 0 0 45px;
}

.benefits-card {
  display: grid;

  grid-template-columns: repeat(4, 1fr);

  background: rgba(255, 255, 255, 0.97);

  border: 1px solid rgba(0, 0, 0, 0.06);

  border-radius: 22px;

  box-shadow:
    0 18px 45px rgba(0, 0, 0, 0.11);

  overflow: hidden;
}

.benefit-item {
  display: flex;

  align-items: center;

  gap: 18px;

  padding: 28px 25px;

  min-height: 125px;
}

.benefit-item + .benefit-item {
  border-left: 1px solid var(--color-line);
}

.benefit-icon {
  width: 52px;
  height: 52px;

  flex: 0 0 52px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 15px;

  background: rgba(183, 53, 45, 0.08);

  color: var(--color-rust);

  font-size: 1.5rem;
}

.benefit-icon svg {
  display: block;
  width: 30px;
  height: 30px;
}

.benefit-item h3 {
  margin: 0 0 6px;

  font-size: 0.95rem;
}

.benefit-item p {
  margin: 0;

  color: var(--color-ink-soft);

  font-size: 0.84rem;
  line-height: 1.5;
}


/* =========================================================
   PRODUCTOS
========================================================= */

.products-scroll-section {
  position: relative;

  margin: 10px 0 70px;

  overflow: hidden;

  background: var(--color-rust);

  border-radius: 28px;
}

.products-background {
  position: absolute;
  inset: 0;

  background:
    linear-gradient(
      135deg,
      rgba(151, 34, 28, 0.82),
      rgba(199, 67, 58, 0.72)
    ),
    url("../assets/Hero 2.jpg") center / cover no-repeat;

  filter: saturate(0.9);

  transform: scale(1.08);
}

.products-container {
  position: relative;
  z-index: 2;

  padding-top: 55px;
  padding-bottom: 48px;
}

.products-section-header {
  max-width: 720px;

  margin: 0 auto 30px;

  text-align: center;
}

.products-section-header .section-kicker {
  margin: 0 0 8px;

  color: #fff;

  font-family: var(--font-mono);

  font-size: 0.72rem;
  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: 0.18em;
}

.products-section-header h2 {
  margin: 0;

  color: #fff;

  font-size: clamp(2rem, 4vw, 3rem);

  line-height: 1.05;
}

.products-description {
  margin: 12px 0 0;

  color: rgba(255, 255, 255, 0.88);

  font-size: 0.95rem;
}


.products-scroll {
  display: flex;

  gap: 18px;

  overflow-x: auto;
  overflow-y: hidden;

  scroll-behavior: smooth;

  padding: 8px 8px 18px;

  scrollbar-width: thin;

  scrollbar-color:
    rgba(255, 255, 255, 0.7)
    transparent;
}


/* TARJETAS MÁS CHICAS */
.products-scroll > * {
  flex: 0 0 220px;
}


/* scrollbar */
.products-scroll::-webkit-scrollbar {
  height: 7px;
}

.products-scroll::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.16);

  border-radius: 999px;
}

.products-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.7);

  border-radius: 999px;
}

.products-scroll::-webkit-scrollbar-thumb:hover {
  background: #fff;
}


.products-empty {
  margin: 30px 0;

  text-align: center;

  color: #fff;
}


.product-skeleton {
  flex: 0 0 220px;

  height: 300px;

  border-radius: 18px;

  background:
    linear-gradient(
      90deg,
      rgba(255,255,255,.12) 25%,
      rgba(255,255,255,.22) 37%,
      rgba(255,255,255,.12) 63%
    );

  background-size: 400% 100%;
}


/* BOTÓN */
.products-button-wrapper {
  display: flex;

  justify-content: center;

  margin-top: 28px;
}

.products-button {
  display: inline-flex;

  align-items: center;
  justify-content: center;

  gap: 16px;

  padding: 13px 24px;

  border: 1px solid rgba(255, 255, 255, 0.85);

  border-radius: 8px;

  background: rgba(255, 255, 255, 0.04);

  color: #fff;

  font-size: 0.9rem;
  font-weight: 700;

  text-decoration: none;

  transition:
    background .2s ease,
    transform .2s ease;
}

.products-button span {
  font-size: 1.2rem;
}

.products-button:hover {
  background: rgba(255, 255, 255, 0.12);

  transform: translateY(-2px);
}


/* =========================================================
   MARCAS
========================================================= */

.brands-section {
  padding: 30px 0 75px;

  background: #fff;
}

.brands-header {
  max-width: 750px;

  margin: 0 auto 35px;

  text-align: center;
}

.brands-header .section-kicker {
  margin: 0 0 8px;

  color: var(--color-rust);

  font-family: var(--font-mono);

  font-size: 0.75rem;
  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: 0.15em;
}

.brands-header h2 {
  margin: 0;

  font-size: clamp(2rem, 4vw, 2.8rem);

  line-height: 1.1;
}

.brands-grid {
  display: grid;

  grid-template-columns: repeat(5, 1fr);

  gap: 22px 30px;

  align-items: center;
}

.brand-item {
  min-height: 75px;

  display: flex;

  justify-content: center;
  align-items: center;

  padding: 10px;
}

.brand-logo {
  width: 100%;
  height: 62px;

  object-fit: contain;

  opacity: 0.82;

  filter: grayscale(20%);

  transition:
    transform .2s ease,
    opacity .2s ease,
    filter .2s ease;
}

.brand-item:hover .brand-logo {
  transform: scale(1.06);

  opacity: 1;

  filter: grayscale(0);
}


/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1050px) {

  .benefits-card {
    grid-template-columns: repeat(2, 1fr);
  }

  .benefit-item:nth-child(3) {
    border-left: none;

    border-top: 1px solid var(--color-line);
  }

  .benefit-item:nth-child(4) {
    border-top: 1px solid var(--color-line);
  }

  .brands-grid {
    grid-template-columns: repeat(4, 1fr);
  }

}


@media (max-width: 760px) {

  .hero {
    min-height: 70vh;
  }

  .hero-content {
    padding-top: 110px;
  }

  .hero-title {
    font-size: 3rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .benefits-section {
    margin-top: -30px;
  }

  .benefits-card {
    grid-template-columns: 1fr;
  }

  .benefit-item + .benefit-item {
    border-left: none;

    border-top: 1px solid var(--color-line);
  }

  .products-scroll-section {
    border-radius: 20px;

    margin-left: 12px;
    margin-right: 12px;
  }

  .products-container {
    padding-top: 42px;
    padding-bottom: 40px;
  }

  .products-scroll > * {
    flex-basis: 205px;
  }

  .brands-grid {
    grid-template-columns: repeat(2, 1fr);

    gap: 15px;
  }

}


@media (max-width: 500px) {

  .container {
    width: min(100% - 28px, 1200px);
  }

  .hero-title {
    font-size: 2.6rem;
  }

  .hero-description {
    max-width: 100%;
  }

  .button-hero-primary {
    width: 100%;
  }

  .products-scroll > * {
    flex-basis: 190px;
  }

  .brand-logo {
    height: 55px;
  }

}
</style>