<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useBusiness } from '../composables/useBusiness';

const { business } = useBusiness();
const year = new Date().getFullYear();

const mailLink = computed(() => (business.value?.email ? `mailto:${business.value.email}` : null));

const instagramLink = computed(() => {
  if (!business.value?.instagram) return null;
  const handle = business.value.instagram;
  return handle.startsWith('http') ? handle : `https://instagram.com/${handle.replace('@', '')}`;
});

const facebookLink = computed(() => {
  if (!business.value?.facebook) return null;
  const handle = business.value.facebook;
  return handle.startsWith('http') ? handle : `https://facebook.com/${handle}`;
});
</script>


<template>
  <footer class="site-footer">
    <div class="container footer-grid">

      <!-- Columna izquierda -->
      <div class="footer-col">
        <div class="footer-logo">
          <span class="logo-mark">DM</span>
          <span class="logo-text">
            Repuestos<br>
            Agrícolas
          </span>
        </div>

        <div class="footer-address" v-if="business?.address">
         <p>{{ business.address }}</p>
         <p>{{ business.city }},{{ business.province }},{{ business.country }}</p>         
        </div>
      </div>

      <!-- Columna derecha -->
      <div class="footer-col footer-col-right">

        <p class="footer-col-title">SEGUINOS EN:</p>

        <div v-if="facebookLink || instagramLink" class="footer-social">
          <a
            v-if="facebookLink"
            :href="facebookLink"
            target="_blank"
            rel="noopener"
            class="footer-social-link"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z"/>
            </svg>
            Facebook
          </a>

          <a
            v-if="instagramLink"
            :href="instagramLink"
            target="_blank"
            rel="noopener"
            class="footer-social-link"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2c2.7 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47.66.26 1.22.6 1.77 1.16.56.55.9 1.11 1.16 1.77.25.64.42 1.37.47 2.43.05 1.06.06 1.42.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 0 1-1.16 1.77 4.9 4.9 0 0 1-1.77 1.16c-.64.25-1.37.42-2.43.47-1.06.05-1.42.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.77-1.16 4.9 4.9 0 0 1-1.16-1.77c-.25-.64-.42-1.37-.47-2.43C2.01 15.06 2 14.7 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.47-2.43.26-.66.6-1.22 1.16-1.77A4.9 4.9 0 0 1 5.45.52C6.1.27 6.82.1 7.88.05 8.94.01 9.3 0 12 0Zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4Zm5.2-8.4a1.17 1.17 0 1 1 0-2.34 1.17 1.17 0 0 1 0 2.34Z"/>
            </svg>
            Instagram
          </a>
        </div>

        <p class="footer-col-title">E-MAIL</p>
        <div v-if="mailLink" class="footer-social">
          <a
            :href="mailLink"
            class="footer-social-link"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 2-8 5-8-5h16Zm0 12H4V8l8 5 8-5v10Z"/>
           </svg>
           {{ business.email }}
          </a>
        </div>
        
      </div>

    </div>

    <div class="container footer-bottom">
      <p class="footer-copy">
        © {{ year }} {{ business?.name || 'DM Repuestos Agrícolas' }}.
        Todos los derechos reservados.
      </p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: var(--color-steel);
  color: #a9b0ac;
  margin-top: var(--space-6);
}
.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-5);
  padding: var(--space-5) var(--space-4);
}
.footer-col-title {
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.85rem;
  color: #fff;
  margin: 10% 0 6px;
}

.footer-col-right {
  display: flex;
  flex-direction: column;
  
}

.footer-address {
  margin-top: 12px;
  color: #cfd3d1;
  font-size: .95rem;
  max-width: 320px;
}
.footer-brand {
  font-family: var(--font-display);
  text-transform: uppercase;
  font-size: 1.3rem;
  color: #fff;
  margin: 0 0 4px;
}
.footer-tagline {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  margin: 0 0 var(--space-3);
  color: #9aa19d;
}
.footer-social {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.footer-social-link {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: #cfd3d1;
  font-size: 0.85rem;
}
.footer-social-link svg {
  width: 20px;
  height: 18px;
}
.footer-social-link:hover {
  color: var(--color-rust);
}

.footer-list a {
  text-decoration: none;
  color: #cfd3d1;
}
.footer-list a:hover {
  color: var(--color-rust);
}
.footer-icon {
  display: inline-block;
  width: 1.4em;
}
.footer-nav-list a {
  display: inline-block;
}
.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: var(--space-3) var(--space-4);
}
.footer-copy {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  text-align: center;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 2px;
}

.logo-mark {
  font-family: var(--font-display);
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-rust);
  letter-spacing: 0.02em;
}

.logo-text {
  font-family: var(--font-mono);
  font-size: 1rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #cfd3d1;
  line-height: 1.2;
  white-space: nowrap;
}

@media (max-width: 760px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
    padding: var(--space-4);
  }
}
</style>
