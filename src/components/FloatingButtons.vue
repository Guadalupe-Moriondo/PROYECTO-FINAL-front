<script setup>
import { computed } from 'vue';
import { useBusiness } from '../composables/useBusiness';
import { useRoute } from 'vue-router';

const { business } = useBusiness();
const route = useRoute();

const showFloatingButtons = computed(() => route.name === 'home');

const whatsappLink = computed(() => {
  if (!business.value?.whatsapp) return null;
  const digits = business.value.whatsapp.replace(/\D/g, '');
  const text = encodeURIComponent(`Hola! Quería hacer una consulta sobre sus productos.`);
  
  return `https://wa.me/${digits}?text=${text}`;
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


</script>

<template>
  <div  v-if="showFloatingButtons && (whatsappLink || mailLink)"
    class="floating-actions">
    <a
      v-if="whatsappLink"
      :href="whatsappLink"
      target="_blank"
      rel="noopener noreferrer"
      class="floating-btn floating-btn-whatsapp"
      aria-label="Escribinos por WhatsApp"
    >
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8 1-.2.2-.3.2-.5.1-1.4-.7-2.3-1.3-3.2-2.9-.2-.4.2-.4.6-1.2.1-.2 0-.4 0-.5-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-1 1-1 2.3 0 1.4 1 2.7 1.1 2.9.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
      </svg>
    </a>
    <a
      v-if="mailLink"
      :href="mailLink"
      target="_blank"
      rel="noopener noreferrer"
      class="floating-btn floating-btn-mail"
    >
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h17A1.5 1.5 0 0 1 22 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 18.5v-13Zm2.2.5 7.4 5.7a.6.6 0 0 0 .8 0L19.8 6H4.2ZM4 7.8V18h16V7.8l-7.4 5.7a2.1 2.1 0 0 1-2.6 0L4 7.8Z" />
      </svg>
    </a>
  </div>
</template>

<style scoped>
.floating-actions {
  position: fixed;
  right: var(--space-4);
  bottom: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  z-index: 45;
}
.floating-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  transition: transform 0.15s ease;
}
.floating-btn:hover {
  transform: scale(1.08);
}
.floating-btn svg {
  width: 26px;
  height: 26px;
}
.floating-btn-whatsapp {
  background: #25d366;
}
.floating-btn-mail {
  background: var(--color-rust);
}

@media (max-width: 480px) {
  .floating-btn {
    width: 46px;
    height: 46px;
  }
  .floating-btn svg {
    width: 22px;
    height: 22px;
  }
}
</style>
