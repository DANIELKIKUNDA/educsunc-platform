<template>
  <Teleport to="body">
    <div v-if="open" class="configuration-modal">
      <button class="configuration-modal__backdrop" type="button" aria-label="Fermer la fenetre" @click="$emit('close', 'backdrop')" />
      <section
        ref="dialogRef"
        class="configuration-modal__dialog"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        :aria-labelledby="`${id}-title`"
      >
        <header class="configuration-modal__header">
          <div>
            <small>{{ eyebrow }}</small>
            <h2 :id="`${id}-title`">{{ title }}</h2>
            <p v-if="description">{{ description }}</p>
          </div>
          <button class="configuration-modal__close" type="button" aria-label="Fermer" @click="$emit('close', 'button')">
            x
          </button>
        </header>

        <div class="configuration-modal__body">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="configuration-modal__footer">
          <slot name="footer" />
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps<{
  open: boolean;
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
}>();

const emit = defineEmits<{
  close: [reason: 'cancel' | 'escape' | 'backdrop' | 'button'];
}>();

const dialogRef = ref<HTMLElement | null>(null);

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && props.open) {
    event.preventDefault();
    emit('close', 'escape');
  }
}

watch(() => props.open, async (open) => {
  if (open) {
    await nextTick();
    dialogRef.value?.focus();
    window.addEventListener('keydown', handleKeydown);
    return;
  }

  window.removeEventListener('keydown', handleKeydown);
}, { immediate: true });

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.configuration-modal{
  position:fixed;
  inset:0;
  z-index:2200;
  display:grid;
  place-items:center;
  padding:1.5rem;
}

.configuration-modal__backdrop{
  position:absolute;
  inset:0;
  border:0;
  background:rgba(7,19,31,.54);
  backdrop-filter:blur(10px);
}

.configuration-modal__dialog{
  position:relative;
  z-index:1;
  width:min(760px,100%);
  max-height:min(88vh,920px);
  overflow:auto;
  border-radius:30px;
  border:1px solid rgba(17,40,63,.08);
  background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,251,255,.98));
  box-shadow:0 36px 80px rgba(15,23,42,.22);
}

.configuration-modal__header{
  display:flex;
  align-items:start;
  justify-content:space-between;
  gap:1rem;
  padding:1.35rem 1.45rem 0;
}

.configuration-modal__header small{
  display:inline-flex;
  color:#688094;
  text-transform:uppercase;
  letter-spacing:.08em;
  font-weight:700;
}

.configuration-modal__header h2{
  margin:.35rem 0 0;
  color:#10243b;
  font-size:1.45rem;
}

.configuration-modal__header p{
  margin:.45rem 0 0;
  color:#5b7386;
  line-height:1.55;
}

.configuration-modal__close{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:2.25rem;
  height:2.25rem;
  border:0;
  border-radius:14px;
  background:rgba(17,40,63,.06);
  color:#385064;
  font-size:1rem;
  font-weight:700;
}

.configuration-modal__body{
  padding:1.25rem 1.45rem;
}

.configuration-modal__footer{
  display:flex;
  justify-content:flex-end;
  gap:.85rem;
  padding:0 1.45rem 1.35rem;
}
</style>
