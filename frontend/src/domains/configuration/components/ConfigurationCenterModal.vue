<template>
  <Teleport to="body">
    <div v-if="open" class="configuration-modal" :aria-hidden="active === false ? 'true' : undefined">
      <button class="configuration-modal__backdrop" type="button" tabindex="-1" aria-label="Fermer la fenêtre" @click="emitClose('backdrop')" />
      <section
        ref="dialogRef"
        class="configuration-modal__dialog"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        :aria-labelledby="`${id}-title`"
        :aria-describedby="description ? `${id}-description` : undefined"
        :aria-busy="busy"
      >
        <header class="configuration-modal__header">
          <div>
            <small>{{ eyebrow }}</small>
            <h2 :id="`${id}-title`">{{ title }}</h2>
            <p v-if="description" :id="`${id}-description`">{{ description }}</p>
          </div>
          <button class="configuration-modal__close" type="button" aria-label="Fermer" :disabled="busy" @click="emitClose('button')">
            <X :size="18" aria-hidden="true" />
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
import { X } from 'lucide-vue-next';

const props = defineProps<{
  open: boolean;
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  active?: boolean;
  busy?: boolean;
}>();

const emit = defineEmits<{
  close: [reason: 'cancel' | 'escape' | 'backdrop' | 'button'];
}>();

const dialogRef = ref<HTMLElement | null>(null);
let previouslyFocused: HTMLElement | null = null;
let ownsScrollLock = false;

function updateBodyScrollLock(lock: boolean): void {
  if (lock && !ownsScrollLock) {
    const count = Number(document.body.dataset.configurationModalLocks ?? '0') + 1;
    document.body.dataset.configurationModalLocks = String(count);
    document.body.style.overflow = 'hidden';
    ownsScrollLock = true;
    return;
  }
  if (!lock && ownsScrollLock) {
    const count = Math.max(Number(document.body.dataset.configurationModalLocks ?? '1') - 1, 0);
    document.body.dataset.configurationModalLocks = String(count);
    if (count === 0) document.body.style.removeProperty('overflow');
    ownsScrollLock = false;
  }
}

function getFocusableElements(): HTMLElement[] {
  if (!dialogRef.value) return [];
  return Array.from(dialogRef.value.querySelectorAll<HTMLElement>(
    'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
  )).filter((element) => !element.hasAttribute('hidden'));
}

function emitClose(reason: 'cancel' | 'escape' | 'backdrop' | 'button'): void {
  if (!props.busy && props.active !== false) emit('close', reason);
}

function handleKeydown(event: KeyboardEvent): void {
  if (!props.open || props.active === false) return;

  if (event.key === 'Escape') {
    event.preventDefault();
    emitClose('escape');
    return;
  }

  if (event.key === 'Tab') {
    const focusable = getFocusableElements();
    if (focusable.length === 0) {
      event.preventDefault();
      dialogRef.value?.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
}

watch(() => props.open, async (open) => {
  if (open) {
    previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    updateBodyScrollLock(true);
    await nextTick();
    dialogRef.value?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    if (!dialogRef.value?.contains(document.activeElement)) dialogRef.value?.focus();
    window.addEventListener('keydown', handleKeydown);
    return;
  }

  window.removeEventListener('keydown', handleKeydown);
  updateBodyScrollLock(false);
  previouslyFocused?.focus();
  previouslyFocused = null;
}, { immediate: true });

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
  updateBodyScrollLock(false);
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
  overflow:hidden;
  display:grid;
  grid-template-rows:auto minmax(0,1fr) auto;
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
  overflow:auto;
  overscroll-behavior:contain;
}

.configuration-modal__footer{
  display:flex;
  justify-content:flex-end;
  gap:.85rem;
  padding:1rem 1.45rem 1.35rem;
  border-top:1px solid rgba(17,40,63,.08);
  background:rgba(255,255,255,.94);
}

@media (max-width: 640px){
  .configuration-modal{padding:.65rem;align-items:end}
  .configuration-modal__dialog{max-height:94vh;border-radius:24px 24px 18px 18px}
  .configuration-modal__header,.configuration-modal__body{padding-left:1rem;padding-right:1rem}
  .configuration-modal__footer{padding:1rem;display:grid;grid-template-columns:1fr}
}
</style>
