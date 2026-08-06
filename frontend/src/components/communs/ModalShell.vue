<template>
  <Teleport to="body">
    <div v-if="open" class="modal-shell-backdrop" @click.self="requestClose('backdrop')">
      <div
        ref="dialogElement"
        class="modal-shell"
        role="dialog"
        aria-modal="true"
        :aria-label="ariaLabel"
        :aria-busy="busy"
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
import { acquireBodyScrollLock } from '../../shared/ui/modal-stack';

const props = withDefaults(defineProps<{
  open: boolean;
  ariaLabel?: string;
  busy?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}>(), {
  ariaLabel: 'Fenetre de dialogue',
  busy: false,
  closeOnBackdrop: true,
  closeOnEscape: true,
});

const emit = defineEmits<{
  (event: 'close'): void;
}>();

const dialogElement = ref<HTMLElement | null>(null);
let previousActiveElement: HTMLElement | null = null;
let releaseScrollLock: (() => void) | null = null;

watch(() => props.open, async (open) => {
  if (open) {
    previousActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    releaseScrollLock = acquireBodyScrollLock();
    document.addEventListener('keydown', handleKeydown);
    await nextTick();
    findFocusableElements()[0]?.focus() ?? dialogElement.value?.focus();
    return;
  }

  releaseDialog();
  previousActiveElement?.focus();
  previousActiveElement = null;
}, { immediate: true });

onBeforeUnmount(releaseDialog);

function releaseDialog(): void {
  document.removeEventListener('keydown', handleKeydown);
  releaseScrollLock?.();
  releaseScrollLock = null;
}

function requestClose(reason: 'backdrop' | 'escape'): void {
  if (props.busy) return;
  if (reason === 'backdrop' && !props.closeOnBackdrop) return;
  if (reason === 'escape' && !props.closeOnEscape) return;
  emit('close');
}

function findFocusableElements(): HTMLElement[] {
  if (!dialogElement.value) return [];
  return Array.from(dialogElement.value.querySelectorAll<HTMLElement>(
    'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )).filter((element) => !element.hasAttribute('hidden'));
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault();
    requestClose('escape');
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
.modal-shell-backdrop{position:fixed;inset:0;background:var(--ui-overlay);backdrop-filter:blur(10px);display:grid;place-items:center;padding:1.5rem;z-index:var(--ui-z-modal)}
.modal-shell{width:min(980px,100%);max-height:calc(100vh - 3rem);display:grid;grid-template-rows:auto minmax(0,1fr) auto;overflow:hidden;background:var(--ui-surface);color:var(--ui-text);border:1px solid var(--ui-border);box-shadow:var(--ui-shadow-lg);border-radius:var(--ui-radius-xl)}
.modal-shell__header,.modal-shell__footer{padding:1.2rem 1.3rem}
.modal-shell__body{padding:1.3rem;overflow:auto;overscroll-behavior:contain;display:grid;gap:1.1rem;background:var(--ui-surface-subtle)}
.modal-shell__footer{border-top:1px solid var(--ui-border);background:var(--ui-surface)}
.modal-shell:focus-visible{outline:3px solid color-mix(in srgb,var(--ui-focus) 30%,transparent);outline-offset:4px}

@media (max-width: 720px){
  .modal-shell-backdrop{padding:.75rem}
  .modal-shell{max-height:calc(100dvh - 1.5rem);border-radius:var(--ui-radius-lg)}
}
</style>
