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

  const text = encodeURIComponent(
    'Hola! Quisiera realizar una consulta.'
  );

  return `https://wa.me/${number}?text=${text}`;
});

const mailLink = computed(() => {
  if (!business.value?.email) return null;

  const subject = encodeURIComponent('Consulta desde la web');

  const body = encodeURIComponent(`Hola,

Quisiera realizar una consulta.

Muchas gracias.`);

  return `https://mail.google.com/mail/?view=cm&fs=1&to=${business.value.email}&su=${subject}&body=${body}`;
});

const mapsUrl = computed(() => {
  if (!business.value) return '';

  const address = [
    business.value.address,
    business.value.city,
    business.value.province,
    business.value.country
  ]
    .filter(Boolean)
    .join(', ');

  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
});

onMounted(loadBusiness);
</script>

<template>
  <div class="contact-view">

    <!-- ================= HEADER ================= -->
    <section class="contact-header">

      <div class="container contact-header-inner">

        <p class="section-eyebrow">
          Estamos para ayudarte
        </p>

        <h1 class="contact-title">
          Contacto
        </h1>

      </div>

    </section>


    <!-- ================= CTA ================= -->
    <section
      v-if="business"
      class="contact-cta-section"
    >

      <div class="container">

        <div class="contact-cta-card">

          <div class="contact-cta-content">

            <h2>
              ¿Tenés alguna consulta?
            </h2>

            <p>
              Escribinos por WhatsApp o correo electrónico
              y te ayudamos a encontrar lo que necesitás.
            </p>

          </div>


          <div class="contact-buttons">

            <a
              v-if="whatsappLink"
              :href="whatsappLink"
              target="_blank"
              rel="noopener"
              class="contact-button whatsapp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8 1-.2.2-.3.2-.5.1-1.4-.7-2.3-1.3-3.2-2.9-.2-.4.2-.4.6-1.2.1-.2 0-.4 0-.5-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-1 1-1 2.3 0 1.4 1 2.7 1.1 2.9.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
              </svg>

              WhatsApp
            </a>


            <a
              v-if="mailLink"
              :href="mailLink"
              target="_blank"
              rel="noopener"
              class="contact-button email"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h17A1.5 1.5 0 0 1 22 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 18.5v-13Zm2.2.5 7.4 5.7a.6.6 0 0 0 .8 0L19.8 6H4.2ZM4 7.8V18h16V7.8l-7.4 5.7a2.1 2.1 0 0 1-2.6 0L4 7.8Z" />
              </svg>

              E-Mail
            </a>

          </div>

        </div>

      </div>

    </section>


    <!-- ================= INFORMACIÓN ================= -->
    <section
      v-if="business"
      class="contact-info-section"
    >

      <div class="container">

        <div class="contact-layout">


          <!-- ================= MAPA ================= -->
          <div class="map-card">

            <div class="map-header">

              <div>

                <p class="section-kicker">
                  Encontranos
                </p>

                <h2>
                  Nuestra ubicación
                </h2>

              </div>

            </div>


            <div class="map-container">

              <iframe
                v-if="mapsUrl"
                :src="mapsUrl"
                width="100%"
                height="100%"
                style="border:0"
                allowfullscreen
                loading="lazy"
              />

            </div>

          </div>


          <!-- ================= DATOS ================= -->
          <div class="business-card">

            <p class="section-kicker">
              Información
            </p>

            <h2 class="business-name">
              {{ business.name }}
            </h2>


            <!-- DIRECCIÓN -->
            <div class="info-item">

              <div class="info-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.5a7 7 0 0 0-7 7c0 5.1 7 12 7 12s7-6.9 7-12a7 7 0 0 0-7-7Zm0 9.7a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4Z"/>
                </svg>
              </div>

              <div>

                <span class="info-label">
                  Dirección
                </span>

                <p>
                  {{ business.address }}
                </p>

                <p v-if="business.city">
                  {{ business.city }},
                  {{ business.province }}
                </p>

                <p v-if="business.country">
                  {{ business.country }}
                </p>

              </div>

            </div>


            <!-- TELÉFONO -->
            <div
              v-if="business.phone"
              class="info-item"
            >

              <div class="info-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.6 2.5h2.2c.5 0 .9.3 1 .8l1 3.7c.1.4 0 .8-.3 1.1L9 9.6a15 15 0 0 0 5.4 5.4l1.5-1.5c.3-.3.7-.4 1.1-.3l3.7 1c.5.1.8.5.8 1v2.2c0 .6-.4 1.1-1 1.1C11.9 18.5 5.5 12.1 5.5 4c0-.6.5-1 1.1-1Z"/>
                </svg>
              </div>

              <div>

                <span class="info-label">
                  Teléfono
                </span>

                <p>
                  {{ business.phone }}
                </p>

              </div>

            </div>


            <!-- HORARIOS -->
            <div
              v-if="
                business.mondayOpen ||
                business.afternoonOpen ||
                business.saturdayOpen
              "
              class="business-hours"
            >

              <div class="hours-header">

                <div class="info-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19Zm0 2a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15Zm1 2.5h-2v5.4l4.1 2.4 1-1.7-3.1-1.8V7Z"/>
                  </svg>
                </div>

                <h3>
                  Horarios de atención
                </h3>

              </div>


              <div class="hours-list">

                <div
                  v-if="
                    business.mondayOpen ||
                    business.mondayClose
                  "
                  class="hours-row"
                >

                  <span>
                    Lunes a Viernes
                  </span>

                  <strong>
                    {{ business.mondayOpen }}
                    -
                    {{ business.mondayClose }}
                  </strong>

                </div>


                <div
                  v-if="
                    business.afternoonOpen ||
                    business.afternoonClose
                  "
                  class="hours-row"
                >

                  <span>
                    Tarde
                  </span>

                  <strong>
                    {{ business.afternoonOpen }}
                    -
                    {{ business.afternoonClose }}
                  </strong>

                </div>


                <div
                  v-if="
                    business.saturdayOpen ||
                    business.saturdayClose
                  "
                  class="hours-row"
                >

                  <span>
                    Sábados
                  </span>

                  <strong>
                    {{ business.saturdayOpen }}
                    -
                    {{ business.saturdayClose }}
                  </strong>

                </div>

              </div>

            </div>

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

.contact-view {
  min-height: 100vh;
  background: var(--color-bg);
}

.container {
  width: min(1200px, calc(100% - 40px));
  margin: 0 auto;
}


/* =========================================================
   HEADER
========================================================= */

.contact-header {
  position: relative;

  overflow: hidden;

  background:
    linear-gradient(
      135deg,
      var(--color-steel),
      var(--color-steel-light)
    );

  border-bottom: 3px solid var(--color-rust);
}

.contact-header-inner {
  padding: 70px 0 75px;
}

.section-eyebrow {
  margin: 0 0 8px;

  color: var(--color-rust);

  font-family: var(--font-mono);

  font-size: 0.75rem;
  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: 0.16em;
}

.contact-title {
  margin: 0;

  color: #fff;

  font-size: clamp(2.8rem, 5vw, 4.2rem);

  line-height: 1;
}

.contact-description {
  max-width: 620px;

  margin: 18px 0 0;

  color: rgba(255, 255, 255, 0.82);

  font-size: 1rem;

  line-height: 1.65;
}


/* =========================================================
   CTA
========================================================= */

.contact-cta-section {
  position: relative;

  z-index: 2;

  margin-top: -35px;

  padding-bottom: 45px;
}

.contact-cta-card {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 35px;

  padding: 32px 38px;

  background: #fff;

  border: 1px solid rgba(0, 0, 0, 0.06);

  border-radius: 20px;

  box-shadow:
    0 18px 45px rgba(0, 0, 0, 0.10);
}

.contact-cta-content {
  max-width: 700px;
}

.section-kicker {
  margin: 0 0 7px;

  color: var(--color-rust);

  font-family: var(--font-mono);

  font-size: 0.72rem;
  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: 0.14em;
}

.contact-cta-content h2 {
  margin: 0 0 8px;

  color: var(--color-ink);

  font-size: 1.65rem;

  line-height: 1.2;
}

.contact-cta-content p:last-child {
  margin: 0;

  color: var(--color-ink-soft);

  font-size: 0.95rem;

  line-height: 1.6;
}


/* =========================================================
   BOTONES
========================================================= */

.contact-buttons {
  display: flex;

  gap: 12px;

  flex-shrink: 0;
}

.contact-button {
  display: inline-flex;

  align-items: center;
  justify-content: center;

  gap: 10px;

  min-width: 145px;

  padding: 13px 20px;

  border-radius: 10px;

  text-decoration: none;

  font-size: 0.9rem;


  transition:
    transform .2s ease,
    box-shadow .2s ease,
    background .2s ease;
}

.contact-button:hover {
  transform: translateY(-2px);

  box-shadow:
    0 10px 22px rgba(0, 0, 0, 0.10);
}

.contact-button.whatsapp {
  background: #2d9754;

  color: #fff;
}

.contact-button.whatsapp:hover {
  background: #258148;
}

.contact-button.email {
  background: var(--color-rust);

  color: #fff;
}

.contact-button.email:hover {
  background: var(--color-rust-dark);
}

.button-icon {
  font-size: 1rem;
}


/* =========================================================
   INFORMACIÓN
========================================================= */

.contact-info-section {
  padding: 10px 0 85px;
}

.contact-layout {
  display: grid;

  grid-template-columns:
    minmax(0, 1.35fr)
    minmax(340px, 0.65fr);

  gap: 28px;

  align-items: stretch;
}


/* =========================================================
   MAPA
========================================================= */

.map-card {
  overflow: hidden;

  background: #fff;

  border: 1px solid var(--color-line);

  border-radius: 20px;

  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.05);
}

.map-header {
  padding: 24px 28px 20px;

  border-bottom: 1px solid var(--color-line);
}

.map-header h2 {
  margin: 0;

  font-size: 1.45rem;
}

.map-container {
  width: 100%;
  height: 430px;
}

.map-container iframe {
  display: block;

  width: 100%;
  height: 100%;

  border: 0;
}


/* =========================================================
   NEGOCIO
========================================================= */

.business-card {
  padding: 30px;

  background: #fff;

  border: 1px solid var(--color-line);

  border-radius: 20px;

  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.05);
}

.business-name {
  margin: 0 0 28px;

  color: var(--color-ink);

  font-size: 1.75rem;

  line-height: 1.15;
}


/* =========================================================
   INFO ITEMS
========================================================= */

.info-item {
  display: flex;

  align-items: flex-start;

  gap: 15px;

  padding: 18px 0;

  border-bottom: 1px solid var(--color-line);
}

.info-icon {
  width: 42px;
  height: 42px;

  flex: 0 0 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 12px;

  background: rgba(183, 53, 45, 0.08);

  color: var(--color-rust);

  font-size: 1rem;
}

.info-icon svg {
  width: 25px;
  height: 25px;
}

.contact-button svg {
  width: 25px;
  height: 25px;
}

.info-label {
  display: block;

  margin-bottom: 4px;

  color: var(--color-ink);

  font-size: 0.82rem;

  font-weight: 700;
}

.info-item p {
  margin: 2px 0;

  color: var(--color-ink-soft);

  font-size: 0.9rem;

  line-height: 1.5;
}


/* =========================================================
   HORARIOS
========================================================= */

.business-hours {
  padding-top: 24px;
}

.hours-header {
  display: flex;

  align-items: center;

  gap: 12px;

  margin-bottom: 18px;
}

.hours-header .info-icon {
  flex-shrink: 0;
}

.hours-header h3 {
  margin: 0;

  color: var(--color-ink);

  font-size: 1rem;
}

.hours-list {
  display: flex;

  flex-direction: column;

  gap: 11px;
}

.hours-row {
  display: flex;

  justify-content: space-between;

  align-items: center;

  gap: 15px;

  padding-bottom: 11px;

  border-bottom: 1px solid #eeeeee;
}

.hours-row:last-child {
  padding-bottom: 0;

  border-bottom: none;
}

.hours-row span {
  color: var(--color-ink-soft);

  font-size: 0.86rem;
}

.hours-row strong {
  color: var(--color-ink);

  font-size: 0.86rem;

  white-space: nowrap;
}


/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 950px) {

  .contact-cta-card {
    flex-direction: column;

    align-items: flex-start;
  }

  .contact-buttons {
    width: 100%;
  }

  .contact-button {
    flex: 1;
  }

  .contact-layout {
    grid-template-columns: 1fr;
  }

}


@media (max-width: 600px) {

  .container {
    width: min(100% - 28px, 1200px);
  }

  .contact-header-inner {
    padding: 50px 0 60px;
  }

  .contact-title {
    font-size: 2.7rem;
  }

  .contact-cta-section {
    margin-top: -25px;
  }

  .contact-cta-card {
    padding: 25px;
  }

  .contact-buttons {
    flex-direction: column;
  }

  .contact-button {
    width: 100%;
  }

  .map-container {
    height: 300px;
  }

  .business-card {
    padding: 24px;
  }

  .hours-row {
    flex-direction: column;

    align-items: flex-start;

    gap: 4px;
  }

}
</style>