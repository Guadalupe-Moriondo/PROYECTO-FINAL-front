<script setup>
import { ref, onMounted } from 'vue';
import businessService from '../../services/business.service';
import { useRouter } from 'vue-router';

const router = useRouter();

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

  morningOpen: '',
  morningClose: '',

  afternoonOpen: '',
  afternoonClose: '',

  saturdayOpen: '',
  saturdayClose: '',
});

const loading = ref(true);
const saving = ref(false);
const message = ref('');
let messageTimeout = null;

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

function showMessage(text) {
  message.value = text;

  if (messageTimeout) {
    clearTimeout(messageTimeout);
  }

  messageTimeout = setTimeout(() => {
    message.value = '';
  }, 3000);
}

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


      morningOpen: response.data.morningOpen || '',
      morningClose: response.data.morningClose || '',

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

      morningOpen: form.value.morningOpen,
      morningClose: form.value.morningClose,

      afternoonOpen: form.value.afternoonOpen,
      afternoonClose: form.value.afternoonClose,

      saturdayOpen: form.value.saturdayOpen,
      saturdayClose: form.value.saturdayClose,
    };

    console.log('Enviando:', dto);

    await businessService.update(dto);

    showMessage('Datos actualizados correctamente');

    setTimeout(() => {
      router.push({ name: 'admin-home' });
    }, 1200);

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

      <div class="field field--business">
        <label>Nombre del negocio</label>
        <input
          v-model="form.name"
          type="text"
        >
      </div>

      <div class="field field--business">
        <label>Dirección</label>
        <input
          v-model="form.address"
          type="text"
        >
      </div>

      <div class="field field--business">
        <label>Ciudad</label>
        <input
          v-model="form.city"
          type="text"
          placeholder="Ej: San Francisco"
        >
      </div>

      <div class="field field--business">
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

      <div class="field field--business">

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

      <div class="field field--business">
        <label>Teléfono</label>
        <input
          v-model="form.phone"
          type="text"
        >
      </div>

      <div class="field field--business">
        <label>WhatsApp</label>
        <input
          v-model="form.whatsapp"
          type="text"
          placeholder="54-93511-234567"
        >
      </div>

      <div class="field field--business">
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
            v-model="form.morningOpen"
          >
          <span>a</span>
          <input
            type="time"
            v-model="form.morningClose"
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

      <div class="field field--business">

        <label>Instagram</label>

        <input
          v-model="form.instagram"
          type="text"
          placeholder="https://www.instagram.com/..."
        >
      </div>

      <div class="field field--business">

        <label>Facebook</label>

        <input
          v-model="form.facebook"
          type="text"
          placeholder="https://www.facebook.com/..."
        >
      </div>
    </div>
  </section>

  <Transition name="success-toast">
    <div
      v-if="message"
      class="success-toast"
    >
      <div class="success-toast-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path
            d="M5 12.5l4 4L19 7"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <div class="success-toast-content">
        <strong>{{ message }}</strong>
        <span>Los cambios se guardaron correctamente.</span>
      </div>
    </div>
  </Transition>

  <div class="form-actions">

    <button
      type="submit"
      class="button button-primary"
      :disabled="saving"
    >
      {{ saving ? 'Guardando cambios...' : 'Guardar' }}
    </button>
  </div>
</form>
</div>
</template>


<style scoped>
.admin-business-view {
  padding: var(--space-5) var(--space-4);
}

.admin-business-view h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: var(--space-5);
}

.business-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-card {
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: 18px;
  padding: 2rem;
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

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.4rem;
}

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

.success-toast {
  position: fixed;
  top: 30px;
  right: 30px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 300px;
  max-width: 380px;
  padding: 14px 18px;
  background: #ffffff;
  border: 1px solid #b8dfc4;
  border-radius: 14px;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.12);
  color: #207a3c;
}

.success-toast-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e8f7ec;
}

.success-toast-icon svg {
  width: 20px;
  height: 20px;
}

.success-toast-content {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.success-toast-content strong {
  font-size: 0.88rem;
  font-weight: 700;
}

.success-toast-content span {
  color: #4d6655;
  font-size: 0.78rem;
}

.success-toast-enter-active,
.success-toast-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.success-toast-enter-from,
.success-toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: .5rem;
}

@media (max-width: 900px) {

  .form-grid {
    grid-template-columns: 1fr;
  }

}

@media (max-width: 900px) {

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