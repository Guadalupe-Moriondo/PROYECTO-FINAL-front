<script setup>
import { ref, onMounted } from 'vue';
import businessService from '../../services/business.service';

const form = ref({
  name: '',
  address: '',
  city: '',
  province: '',
  country: '',

  phone: '',
  whatsapp: '',
  email: '',

  instagram: '',
  facebook: '',

  mondayOpen: '',
  mondayClose: '',

  afternoonOpen: '',
  afternoonClose: '',

  saturdayOpen: '',
  saturdayClose: '',
});

const loading = ref(true);
const saving = ref(false);
const message = ref('');

const provinces = [
  'Buenos Aires',
  'CABA',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
];

const countries = [
  'Argentina',
  'Brasil',
  'Chile',
  'Paraguay',
  'Uruguay',
];


async function load() {
  try {
    const response = await businessService.get();

    console.log('Datos negocio:', response.data);

    form.value = {
      name: response.data.name || '',
      address: response.data.address || '',

      city: response.data.city || '',
      province: response.data.province || '',
      country: response.data.country || '',

      phone: response.data.phone || '',
      whatsapp: response.data.whatsapp || '',

      email: response.data.email || '',

      instagram: response.data.instagram || '',
      facebook: response.data.facebook || '',


      mondayOpen: response.data.mondayOpen || '',
      mondayClose: response.data.mondayClose || '',

      afternoonOpen: response.data.afternoonOpen || '',
      afternoonClose: response.data.afternoonClose || '',

      saturdayOpen: response.data.saturdayOpen || '',
      saturdayClose: response.data.saturdayClose || '',
    };

  } catch (error) {
    console.error('Error cargando datos del negocio:', error);
  } finally {
    loading.value = false;
  }
}


async function save() {

  saving.value = true;
  message.value = '';

  try {

    const dto = {

      name: form.value.name,

      address: form.value.address,

      city: form.value.city,
      province: form.value.province,
      country: form.value.country,


      phone: form.value.phone,
      whatsapp: form.value.whatsapp,

      email: form.value.email,


      instagram: form.value.instagram,
      facebook: form.value.facebook,


      mondayOpen: form.value.mondayOpen,
      mondayClose: form.value.mondayClose,


      afternoonOpen: form.value.afternoonOpen,
      afternoonClose: form.value.afternoonClose,


      saturdayOpen: form.value.saturdayOpen,
      saturdayClose: form.value.saturdayClose,
    };


    console.log('Enviando:', dto);


    await businessService.update(dto);


    message.value = 'Datos actualizados correctamente.';


  } catch (error) {

    console.error('Error guardando datos:', error);

  } finally {

    saving.value = false;

  }
}


onMounted(load);
</script>


<template>

<div class="container admin-business-view">

  <header class="page-header">
    <h1>
      Datos del negocio
    </h1>
  </header>

  <p
    v-if="loading"
    class="loading-state"
  >
    Cargando...
  </p>

  <form
  v-else
  class="business-form"
  @submit.prevent="save"
>

  <!-- ================= INFORMACIÓN GENERAL ================= -->

  <section class="form-card">

    <div class="card-header">
      <h2>Información general</h2>
    </div>

    <div class="form-grid">

      <div class="field">
        <label>Nombre del negocio</label>
        <input
          v-model="form.name"
          type="text"
        >
      </div>

      <div class="field">
        <label>Dirección</label>
        <input
          v-model="form.address"
          type="text"
        >
      </div>

      <div class="field">
        <label>Ciudad</label>
        <input
          v-model="form.city"
          type="text"
          placeholder="Ej: San Francisco"
        >
      </div>

      <div class="field">
        <label>Provincia</label>

        <select v-model="form.province">

          <option value="">
            Seleccionar provincia
          </option>

          <option
            v-for="province in provinces"
            :key="province"
            :value="province"
          >
            {{ province }}
          </option>

        </select>

      </div>

      <div class="field">

        <label>País</label>

        <select v-model="form.country">

          <option value="">
            Seleccionar país
          </option>

          <option
            v-for="country in countries"
            :key="country"
            :value="country"
          >
            {{ country }}
          </option>

        </select>

      </div>

    </div>

  </section>

  <!-- ================= CONTACTO ================= -->

  <section class="form-card">

    <div class="card-header">
      <h2>Información de contacto</h2>
    </div>

    <div class="form-grid">

      <div class="field">
        <label>Teléfono</label>
        <input
          v-model="form.phone"
          type="text"
        >
      </div>

      <div class="field">
        <label>WhatsApp</label>
        <input
          v-model="form.whatsapp"
          type="text"
          placeholder="5493511234567"
        >
      </div>

      <div class="field">
        <label>Email</label>
        <input
          v-model="form.email"
          type="email"
        >
      </div>

    </div>

  </section>



      <!-- ================= HORARIOS ================= -->

  <section class="form-card">

    <div class="card-header">
      <h2>Horarios de atención</h2>
    </div>

    <div class="hours-grid">

      <div class="hours-box">

        <h3>Lunes a Viernes (Mañana)</h3>

        <div class="hours-row">

          <input
            type="time"
            v-model="form.mondayOpen"
          >

          <span>a</span>

          <input
            type="time"
            v-model="form.mondayClose"
          >

        </div>

      </div>

      <div class="hours-box">

        <h3>Lunes a Viernes (Tarde)</h3>

        <div class="hours-row">

          <input
            type="time"
            v-model="form.afternoonOpen"
          >

          <span>a</span>

          <input
            type="time"
            v-model="form.afternoonClose"
          >

        </div>

      </div>

      <div class="hours-box">

        <h3>Sábados</h3>

        <div class="hours-row">

          <input
            type="time"
            v-model="form.saturdayOpen"
          >

          <span>a</span>

          <input
            type="time"
            v-model="form.saturdayClose"
          >

        </div>

      </div>

    </div>

  </section>

  <!-- ================= REDES SOCIALES ================= -->

  <section class="form-card">

    <div class="card-header">
      <h2>Redes sociales</h2>
    </div>

    <div class="form-grid">

      <div class="field">

        <label>Instagram</label>

        <input
          v-model="form.instagram"
          type="text"
          placeholder="@tuempresa"
        >

      </div>

      <div class="field">

        <label>Facebook</label>

        <input
          v-model="form.facebook"
          type="text"
          placeholder="facebook.com/tuempresa"
        >

      </div>

    </div>

  </section>

  <p
    v-if="message"
    class="success-message"
  >
    {{ message }}
  </p>

  <div class="form-actions">

    <button
      type="submit"
      class="button button-primary"
      :disabled="saving"
    >
      {{ saving ? 'Guardando cambios...' : 'Guardar cambios' }}
    </button>

  </div>

</form>

</div>

</template>


<style scoped>

.admin-business-view {
  padding: var(--space-5) var(--space-4);
}

/*==============================
  TÍTULO
==============================*/

.admin-business-view h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: var(--space-5);
}

/*==============================
  FORMULARIO
==============================*/

.business-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/*==============================
  TARJETAS
==============================*/

.form-card {
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: 18px;
  padding: 1.6rem;
  box-shadow: 0 8px 25px rgba(0,0,0,.08);
}

.card-header {
  margin-bottom: 1.5rem;
}

.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-ink);
}

.card-header p {
  margin-top: .35rem;
  color: var(--color-ink-soft);
  font-size: .9rem;
  line-height: 1.5;
}

/*==============================
  GRID
==============================*/

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

/*==============================
  CAMPOS
==============================*/

.field {
  display: flex;
  flex-direction: column;
}

.field label {
  margin-bottom: .45rem;
  font-size: .85rem;
  font-weight: 600;
  color: var(--color-ink-soft);
}

.field input,
.field select,
.field textarea {

  width: 100%;

  padding: .85rem 1rem;

  background: var(--color-surface);

  border: 1px solid var(--color-line);

  border-radius: 12px;

  font-size: .95rem;

  transition:
    border-color .2s,
    box-shadow .2s,
    transform .15s;

}

.field textarea {

  resize: vertical;

  min-height: 120px;

}

.field input:hover,
.field select:hover,
.field textarea:hover {

  border-color: #bfc8d6;

}

.field input:focus,
.field select:focus,
.field textarea:focus {

  outline: none;

  border-color: var(--color-steel);

  box-shadow: 0 0 0 4px rgba(37,99,235,.08);

}

.field input[type="time"] {

  font-family: var(--font-mono);

}

/*==============================
  HORARIOS
==============================*/

.hours-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hours-box {
  background: rgba(0,0,0,.02);
  border: 1px solid var(--color-line);
  border-radius: 14px;
  padding: 1rem 1.2rem;
  transition: .2s;
}

.hours-box:hover {
  border-color: #cfd8e3;
  transform: translateY(-1px);
}

.hours-box h3 {
  margin: 0 0 1rem;
  font-size: .95rem;
  font-weight: 700;
  color: var(--color-ink);
}

.hours-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.hours-row input {
  flex: 1;
}

.hours-row span {
  font-size: .9rem;
  font-weight: 600;
  color: var(--color-ink-soft);
}

/*==============================
  MENSAJES
==============================*/

.success-message {
  background: #e8f7ec;
  color: #207a3c;
  border: 1px solid #b7e2c4;
  padding: .9rem 1rem;
  border-radius: 12px;
}

.error-message {
  background: #ffe8e8;
  color: #c0392b;
  border: 1px solid #f3bcbc;
  padding: .9rem 1rem;
  border-radius: 12px;
}

/*==============================
  BOTÓN
==============================*/

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: .5rem;
}

.button-primary {
  background: var(--color-steel);
  color: white;

  border: none;
  border-radius: 12px;

  padding: .85rem 1.6rem;

  font-size: .95rem;
  font-weight: 600;

  cursor: pointer;

  transition: all .2s ease;

  box-shadow: 0 6px 16px rgba(0,0,0,.12);
}

.button-primary:hover {
  transform: translateY(-2px);
  opacity: .95;
}

.button-primary:disabled {
  opacity: .6;
  cursor: not-allowed;
  transform: none;
}

/*==============================
  LOADING
==============================*/

.loading-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-ink-soft);
}

/*==============================
  RESPONSIVE
==============================*/

@media (max-width: 900px) {

  .form-grid {
    grid-template-columns: 1fr;
  }

}

@media (max-width: 700px) {

  .form-card {
    padding: 1.2rem;
  }

  .hours-row {
    flex-direction: column;
    align-items: stretch;
  }

  .hours-row span {
    display: none;
  }

  .form-actions {
    justify-content: stretch;
  }

  .button-primary {
    width: 100%;
  }

}
</style>