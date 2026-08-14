<template>
  <ModalShell :open="open" :busy="busy" :aria-label="title" :close-on-backdrop="false" @close="requestClose">
    <template #header>
      <div class="confirm-modal__header">
        <div class="confirm-modal__icon"><TriangleAlert :size="20" aria-hidden="true" /></div>
        <div><small>Confirmation requise</small><h2>{{ title }}</h2><p>{{ message }}</p></div>
      </div>
    </template>
    <section class="confirm-modal__panel"><strong>{{ detailsTitle }}</strong><p>{{ details }}</p></section>
    <template #footer>
      <div class="confirm-modal__footer">
        <button class="ui-button" type="button" :disabled="busy" @click="requestClose">Annuler</button>
        <button class="ui-button ui-button--danger" type="button" :disabled="busy" @click="emit('confirm')">
          <LoaderCircle v-if="busy" class="confirm-modal__spinner" :size="16" aria-hidden="true" />
          {{ busy ? processingLabel : confirmLabel }}
        </button>
      </div>
    </template>
  </ModalShell>
</template>

<script setup lang="ts">
import { LoaderCircle, TriangleAlert } from 'lucide-vue-next';
import ModalShell from '../../components/communs/ModalShell.vue';

const props = withDefaults(defineProps<{ open: boolean; busy?: boolean; title: string; message: string; detailsTitle?: string; details: string; confirmLabel?: string; processingLabel?: string }>(), {
  busy: false,
  detailsTitle: 'Conséquence',
  confirmLabel: 'Confirmer',
  processingLabel: 'Traitement en cours...',
});
const emit = defineEmits<{ close: []; confirm: [] }>();
function requestClose(): void { if (!props.busy) emit('close'); }
</script>

<style scoped>
.confirm-modal__header{display:flex;gap:1rem;align-items:flex-start}.confirm-modal__icon{display:grid;place-items:center;flex:none;width:3rem;height:3rem;border-radius:var(--ui-radius-lg);background:var(--ui-warning-soft);color:var(--ui-warning)}.confirm-modal__header small{display:block;color:var(--ui-text-muted);font-size:.75rem;font-weight:800;letter-spacing:.07em;text-transform:uppercase}.confirm-modal__header h2{margin:.2rem 0 .35rem;color:var(--ui-text-strong)}.confirm-modal__header p,.confirm-modal__panel p{margin:0;color:var(--ui-text-muted);line-height:1.6}.confirm-modal__panel{padding:1rem;border:1px solid var(--ui-border);border-radius:var(--ui-radius-lg);background:var(--ui-surface-subtle)}.confirm-modal__panel strong{display:block;margin-bottom:.35rem;color:var(--ui-text-strong)}.confirm-modal__footer{display:flex;justify-content:flex-end;gap:.75rem}.confirm-modal__spinner{animation:confirm-spin .9s linear infinite}@keyframes confirm-spin{to{transform:rotate(360deg)}}@media(max-width:720px){.confirm-modal__footer,.confirm-modal__footer .ui-button{width:100%}.confirm-modal__footer{flex-direction:column-reverse}}
</style>
