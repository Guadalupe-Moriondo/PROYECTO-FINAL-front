<script setup>
defineProps({
  open: { type: Boolean, default: false },
});
defineEmits(['toggle']);
</script>

<template>
  <button
    type="button"
    class="hamburger-btn"
    :class="{ 'hamburger-btn-open': open }"
    :aria-expanded="open"
    aria-haspopup="true"
    aria-label="Abrir menú"
    @click="$emit('toggle')"
  >
    <span class="hamburger-icon">
      <span></span><span></span><span></span>
    </span>
  </button>
</template>

<style scoped>
.hamburger-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
  cursor: pointer;
}
.hamburger-btn:hover,
.hamburger-btn-open {
  border-color: var(--color-rust);
}
.hamburger-icon {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 18px;
}
.hamburger-icon span {
  display: block;
  height: 2px;
  background: #fff;
  border-radius: 1px;
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.hamburger-btn-open .hamburger-icon span:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}
.hamburger-btn-open .hamburger-icon span:nth-child(2) {
  opacity: 0;
}
.hamburger-btn-open .hamburger-icon span:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}
</style>
