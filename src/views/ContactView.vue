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

    <div class="container contact-body" v-if="business">

      <div class="contact-card">

        <!-- MAPA -->
        <div class="map-container">
          <iframe
            v-if="mapsUrl"
            :src="mapsUrl"
            width="100%"
            height="320"
            style="border:0"
            allowfullscreen
            loading="lazy">
          </iframe>
        </div>

        <!-- CONTENIDO -->
        <div class="contact-content">

          <!-- DATOS -->
          <div class="contact-info">

            <h2 class="business-name">
              {{ business.name }}
            </h2>

            <p class="business-address">
              {{ business.address }}
            </p>

            <p v-if="business.city">
              {{ business.city }},
              {{ business.province }}
            </p>

            <p v-if="business.country">
              {{ business.country }}
            </p>

            <p v-if="business.phone">
              <strong>Teléfono:</strong>
              {{ business.phone }}
            </p>

            <div
              class="business-hours"
              v-if="
                business.mondayOpen ||
                business.afternoonOpen ||
                business.saturdayOpen
              "
            >

              <h3>Horarios</h3>

              <p
                v-if="
                  business.mondayOpen ||
                  business.mondayClose
                "
              >
                <strong>Lunes a Viernes</strong><br>

                {{ business.mondayOpen }}
                -
                {{ business.mondayClose }}
              </p>

              <p
                v-if="
                  business.afternoonOpen ||
                  business.afternoonClose
                "
              >
                <strong>Tarde</strong><br>

                {{ business.afternoonOpen }}
                -
                {{ business.afternoonClose }}
              </p>

              <p
                v-if="
                  business.saturdayOpen ||
                  business.saturdayClose
                "
              >
                <strong>Sábados</strong><br>

                {{ business.saturdayOpen }}
                -
                {{ business.saturdayClose }}
              </p>

            </div>

          </div>

          <div class="contact-cta">
            <h3>¿Tenés alguna consulta?</h3>
             <p> Escribinos por WhatsApp o por correo electrónico.Te responderemos lo antes posible.</p>
          </div>

          <!-- BOTONES -->
          <div class="contact-buttons">

            <a
              v-if="whatsappLink"
              :href="whatsappLink"
              target="_blank"
              rel="noopener"
              class="button button-primary"
            >
              WhatsApp
            </a>

            <a
              v-if="mailLink"
              :href="mailLink"
              target="_blank"
              rel="noopener"
              class="button button-secondary"
            >
              E-Mail
            </a>

          </div>

        </div>

      </div>

    </div>

  </div>
</template>

<style scoped>

.contact-header {
  background: var(--color-steel);
  background-image: linear-gradient(
    135deg,
    var(--color-steel),
    var(--color-steel-light)
  );
  border-bottom: 4px solid var(--color-rust);
}

.contact-header-inner {
  padding: 3rem 1rem;
}

.section-eyebrow {
  color: var(--color-safety);
  text-transform: uppercase;
  letter-spacing: .18em;
  font-size: .8rem;
  margin-bottom: .4rem;
}

.contact-title {
  color: white;
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.contact-body {
  padding: 3rem 1rem;
}

.contact-card {

  max-width: 900px;

  margin: auto;

  background: white;

  border-radius: 18px;

  overflow: hidden;

  box-shadow: 0 10px 35px rgba(0,0,0,.12);

  border:1px solid var(--color-line);

}

.map-container {

  width:100%;

  height:320px;

}

.map-container iframe{

  width:100%;

  height:100%;

  display:block;

}

.contact-content{

  padding:2rem;

}

.business-name{

  font-size:2rem;

  margin-bottom:.4rem;

  color:var(--color-steel);

}

.business-address{

  color:#555;

  margin-bottom:1.2rem;

}

.contact-info p{

  margin:.45rem 0;

  color:#555;

  line-height:1.6;

}

.business-hours{

  margin-top:2rem;

  padding-top:1.5rem;

  border-top:1px solid #e5e7eb;

}

.business-hours h3{

  margin-bottom:1rem;

  color:var(--color-steel);

}

.business-hours p{

  margin-bottom:1rem;

}

.contact-buttons{

  display:flex;

  gap:1rem;

  margin-top:2rem;

}

.contact-buttons .button{

  flex:1;

  justify-content:center;

}

.button{

  display:flex;

  align-items:center;

  justify-content:center;

  text-decoration:none;

  padding:.9rem 1.3rem;

  border-radius:10px;

  font-weight:600;

  transition:.2s;

}

.button-primary{
  background:#2d9754;
  color:white;
  border:2px solid #2d9754;
}

.button-primary:hover{
  background:#33ad60;
  border-color:#33ad60;
  transform:translateY(-2px);
}

.button-secondary{
  background:#c93d30;
  color:white;
  border:2px solid #c93d30;
}

.button-secondary:hover{
  background:#d93025;
  border-color:#d93025;
  transform:translateY(-2px);
}

.contact-cta{
  margin-top:2rem;
  padding-top:1.8rem;
  border-top:1px solid #e5e7eb;
  text-align:center;
}

.contact-cta h3{
  margin:0 0 .5rem;
  color:var(--color-steel);
  font-size:1.2rem;
}

.contact-cta p{
  margin:0;
  color:#6b7280;
  line-height:1.6;
  font-size:.95rem;
}

.contact-buttons{
  display:flex;
  gap:1rem;
  margin-top:1.8rem;
}

@media(max-width:768px){

.contact-card{

border-radius:14px;

}

.contact-content{

padding:1.5rem;

}

.business-name{

font-size:1.6rem;

}

.contact-buttons{

flex-direction:column;

}

.map-container{

height:250px;

}

}

</style>