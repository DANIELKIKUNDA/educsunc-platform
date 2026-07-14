<template>
  <Teleport to="body">
    <div v-if="open" class="modal-shell-backdrop" @click.self="$emit('close')">
      <div
        ref="dialogElement"
        class="modal-shell"
        role="dialog"
        aria-modal="true"
        :aria-label="ariaLabel"
        tabindex="-1"
      >
        <div class="modal-shell__header">
          <slot name="header" />
        </div>
        <div class="modal-shell__body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="modal-shell__footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';

const props = withDefaults(defineProps<{
  open: boolean;
  ariaLabel?: string;
}>(), {
  ariaLabel: 'Fenêtre de dialogue',
});

const emit = defineEmits<{
  (event: 'close'): void;
}>();

const dialogElement = ref<HTMLElement | null>(null);
let previousActiveElement: HTMLElement | null = null;

watch(() => props.open, async (open) => {
  if (open) {
    previousActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.addEventListener('keydown', handleKeydown);
    await nextTick();
    findFocusableElements()[0]?.focus() ?? dialogElement.value?.focus();
    return;
  }

  document.removeEventListener('keydown', handleKeydown);
  previousActiveElement?.focus();
  previousActiveElement = null;
});

onBeforeUnmount(() => document.removeEventListener('keydown', handleKeydown));

function findFocusableElements(): HTMLElement[] {
  if (!dialogElement.value) return [];
  return Array.from(dialogElement.value.querySelectorAll<HTMLElement>(
    'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )).filter((element) => !element.hasAttribute('hidden'));
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault();
    emit('close');
    return;
  }
  if (event.key !== 'Tab') return;

  const focusable = findFocusableElements();
  if (focusable.length === 0) {
    event.preventDefault();
    dialogElement.value?.focus();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
</script>

<style scoped>
.modal-shell-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.46);display:grid;place-items:center;padding:1.5rem;z-index:2300}
.modal-shell{width:min(980px,100%);max-height:calc(100vh - 3rem);display:grid;grid-template-rows:auto 1fr auto;overflow:hidden;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 24px 60px rgba(15,23,42,.08);border-radius:28px}
.modal-shell__header,.modal-shell__footer{padding:1.2rem 1.3rem}
.modal-shell__body{padding:1.3rem;overflow:auto;display:grid;gap:1.1rem;background:#fbfdff}
.modal-shell__footer{border-top:1px solid rgba(17,40,63,.08);background:#fff}

@media (max-width: 720px){
  .modal-shell-backdrop{padding:.75rem}
  .modal-shell{border-radius:22px}
}
</style>
