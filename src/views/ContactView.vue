<script setup>
import { computed, onMounted, ref } from 'vue';
import businessService from '../services/business.service';

const business = ref(null);

async function loadBusiness() {
  try {
    const response = await businessService.get();
    business.value = response.data;
  } catch (e) {
    business.value = null;
  }
}

const whatsappLink = computed(() => {
  if (!business.value?.whatsapp) return null;
  const number = business.value.whatsapp.replace(/\D/g, '');

  const message = encodeURIComponent(
    'Hola! Quisiera realizar una consulta sobre un repuesto.'
  );

  return `https://wa.me/${number}?text=${message}`;
});
const mailLink = computed(() => {
  if (!business.value?.email) return null;

  const subject = encodeURIComponent('Consulta desde la web');

  const body = encodeURIComponent(
`Hola,

Quisiera realizar una consulta sobre un producto.

Muchas gracias.`
  );

  return `https://mail.google.com/mail/?view=cm&fs=1&to=${business.value.email}&su=${subject}&body=${body}`;
});
onMounted(loadBusiness);
</script>

<template>
  <div class="contact-view">
    <section class="contact-header">
      <div class="container contact-header-inner">
        <p class="section-eyebrow">Estamos para ayudarte</p>
        <h1 class="contact-title">Contacto</h1>
      </div>
    </section>

    <div class="container contact-body">
      <div class="contact-layout contact-layout-single" v-if="business">
        <aside class="contact-info">
          <h2 class="contact-info-name">{{ business.name }}</h2>
          <ul class="contact-info-facts">
            <li v-if="business.address"><span class="contact-info-label">Dirección</span>{{ business.address }}</li>
            <li v-if="business.phone"><span class="contact-info-label">Teléfono</span>{{ business.phone }}</li>
            <li v-if="business.mondayOpen ||business.afternoonOpen ||business.saturdayOpen">
              <span class="contact-info-label">Horarios</span>
              <div class="business-hours">
                <p v-if="business.mondayOpen || business.mondayClose">
                  Lunes a Viernes:
                  
                  {{ business.mondayOpen }} - {{ business.mondayClose }}
                </p>
                <p v-if="business.afternoonOpen || business.afternoonClose">
                  Tarde:
                  
                  {{ business.afternoonOpen }} - {{ business.afternoonClose }}
                </p>
                <p v-if="business.saturdayOpen || business.saturdayClose">
                  Sábados:
                  
                  {{ business.saturdayOpen }} - {{ business.saturdayClose }}
                </p>

              </div>
            </li>
          </ul>

          <p class="contact-info-cta">Escribinos y te respondemos a la brevedad:</p>

          <div class="contact-info-actions">
            <a v-if="whatsappLink" :href="whatsappLink" target="_blank" rel="noopener" class="button button-primary">
              <svg viewBox="0 0 24 24" class="button-icon" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8 1-.2.2-.3.2-.5.1-1.4-.7-2.3-1.3-3.2-2.9-.2-.4.2-.4.6-1.2.1-.2 0-.4 0-.5-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-1 1-1 2.3 0 1.4 1 2.7 1.1 2.9.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/>
              </svg>
              WhatsApp
            </a>
            <a v-if="mailLink" :href="mailLink"  target="_blank" rel="noopener noreferrer" class="button button-secondary">
              <svg viewBox="0 0 24 24" class="button-icon" fill="currentColor">
                <path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h17A1.5 1.5 0 0 1 22 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 18.5v-13Zm2.2.5 7.4 5.7a.6.6 0 0 0 .8 0L19.8 6H4.2ZM4 7.8V18h16V7.8l-7.4 5.7a2.1 2.1 0 0 1-2.6 0L4 7.8Z"/>
              </svg>
              Mail
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact-header {
  background: var(--color-steel);
  background-image: linear-gradient(135deg, var(--color-steel) 0%, var(--color-steel-light) 100%);
  border-bottom: 3px solid var(--color-rust);
}
.contact-header-inner {
  padding: var(--space-5) var(--space-4);
}
.section-eyebrow {
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.8rem;
  color: var(--color-safety);
  margin: 0 0 var(--space-1);
}
.contact-title {
  color: #fff;
  margin: 0;
  font-size: 2.4rem;
}
.contact-body {
  padding: var(--space-5) var(--space-4);
}
.contact-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--space-5);
}


@media (max-width: 760px) {
  .contact-layout { grid-template-columns: 1fr; }
}
.contact-form {
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}
.contact-info {
  background: var(--color-steel);
  color: #fff;
  border-radius: var(--radius-md);
  border-top: 3px solid var(--color-rust);
  padding: var(--space-4);
}
.contact-info-name {
  color: #fff;
  margin: 0 0 var(--space-3);
  font-size: 1.3rem;
}
.contact-info-facts {
  list-style: none;
  margin: 0 0 var(--space-4);
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  font-size: 0.9rem;
  color: #d8dbd9;
}
.contact-info-label {
  display: block;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: 0.9rem;
  color: var(--color-safety);
  margin-bottom: 2px;
}
.contact-info-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.contact-info-actions .button { width: 100%; }
.contact-info-actions .button-secondary {
  border-color: rgba(255, 255, 255, 0.6);
  color: #fff;
}
.contact-info-actions .button-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #fff;
  color: #fff;
}
.button-icon { width: 18px; height: 18px; }

@media (max-width: 600px) {
  .contact-title { font-size: 1.8rem; }
}
</style>
