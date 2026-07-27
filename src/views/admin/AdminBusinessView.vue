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

<div class="container admin-view admin-business-view">

<h1>Datos del negocio</h1>


<p v-if="loading" class="loading-state">
  Cargando...
</p>


<form
  v-else
  class="business-form"
  @submit.prevent="save"
>


<div class="field">
<label>Nombre del negocio</label>
<input v-model="form.name" type="text">
</div>


<div class="field">
<label>Dirección</label>
<input v-model="form.address" type="text">
</div>


<div class="field">
<label>Ciudad</label>
<input
  v-model="form.city"
  type="text"
  placeholder="Ej: San Francisco"
/>
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



<div class="field">

<label>Teléfono</label>

<input
v-model="form.phone"
type="text"
/>

</div>



<div class="field">

<label>WhatsApp</label>

<input
v-model="form.whatsapp"
type="text"
placeholder="5493511234567"
/>

</div>



<div class="field">

<label>Email</label>

<input
v-model="form.email"
type="email"
/>

</div>




<div class="field">

<label>
Horario Lunes a Viernes - Mañana
</label>


<div class="hours-row">

<input
type="time"
v-model="form.mondayOpen"
/>

<input
type="time"
v-model="form.mondayClose"
/>


</div>

</div>





<div class="field">

<label>
Horario Lunes a Viernes - Tarde
</label>


<div class="hours-row">

<input
type="time"
v-model="form.afternoonOpen"
/>





<input
type="time"
v-model="form.afternoonClose"
/>


</div>

</div>




<div class="field">

<label>
Horario Sábados
</label>


<div class="hours-row">

<input
type="time"
v-model="form.saturdayOpen"
/>





<input
type="time"
v-model="form.saturdayClose"
/>


</div>

</div>




<div class="field">

<label>Instagram</label>

<input
v-model="form.instagram"
type="text"
/>

</div>




<div class="field">

<label>Facebook</label>

<input
v-model="form.facebook"
type="text"
/>

</div>




<p
v-if="message"
class="success-message"
>
{{ message }}
</p>




<button
type="submit"
class="button button-primary"
:disabled="saving"
>

{{ saving ? 'Guardando...' : 'Guardar cambios' }}

</button>



</form>


</div>

</template>


<style scoped>

.admin-business-view {
  padding: var(--space-5) var(--space-4);
}


/* Título */
.admin-business-view h1 {

  font-size:2rem;

  font-weight:700;

  margin-bottom:var(--space-5);

}



/* Formulario */
.business-form {

  background:var(--color-surface);

  border:1px solid var(--color-line);

  border-radius:16px;

  padding:1.5rem;

  max-width:700px;

  box-shadow:0 8px 25px rgba(0,0,0,.08);

}



/* Campos */
.field {

  margin-bottom:1.2rem;

}



.field label {

  display:block;

  margin-bottom:.4rem;

  font-size:.85rem;

  font-weight:600;

  color:var(--color-ink-soft);

}



.field input,
.field textarea,
.field select {

  width:100%;

  padding:.7rem 1rem;

  border-radius:12px;

  border:1px solid var(--color-line);

  background:var(--color-surface);

  font-size:.9rem;

}



.field textarea {

  resize:vertical;

  min-height:90px;

}



.field input:focus,
.field textarea:focus,
.field select:focus {

  outline:none;

  border-color:var(--color-steel);

}



/* Horarios */
.hours-section {

  margin-top:1.5rem;

  padding-top:1.5rem;

  border-top:1px solid var(--color-line);

}



.hours-section h2 {

  font-size:1.2rem;

  font-weight:700;

  margin-bottom:1rem;

}



.hours-row {

  display:flex;

  align-items:center;

  gap:12px;

  margin-bottom:12px;

}



.hours-row span {

  width:90px;

  font-weight:600;

  font-size:.9rem;

}



.hours-row input {

  flex:1;

}



/* Botón guardar */
.button-primary {

  background:var(--color-steel);

  color:white;

  padding:.7rem 1.3rem;

  border-radius:12px;

  border:none;

  font-weight:600;

  cursor:pointer;

  transition:.2s;

  box-shadow:0 4px 12px rgba(0,0,0,.12);

}



.button-primary:hover {

  transform:translateY(-2px);

  opacity:.9;

}



/* Mensajes */
.success-message {

  background:#e8f7ec;

  color:#207a3c;

  padding:.8rem 1rem;

  border-radius:10px;

  margin-bottom:1rem;

}



.error-message {

  background:#ffe8e8;

  color:#c0392b;

  padding:.8rem 1rem;

  border-radius:10px;

  margin-bottom:1rem;

}



/* Loading */
.loading-state {

  text-align:center;

  padding:2rem;

  color:var(--color-ink-soft);

}



/* Responsive */
@media(max-width:700px){

  .business-form {

    padding:1rem;

  }


  .hours-row {

    flex-direction:column;

    align-items:stretch;

  }


  .hours-row span {

    width:auto;

  }

}

</style>