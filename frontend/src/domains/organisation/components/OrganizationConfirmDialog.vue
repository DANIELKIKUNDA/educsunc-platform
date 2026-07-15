<template>
  <ModalShell :open="open" @close="requestClose">
    <template #header>
      <div class="org-confirm__header">
        <div class="org-confirm__icon">
          <TriangleAlert :size="20" />
        </div>
        <div>
          <small>Confirmation requise</small>
          <h2>{{ title }}</h2>
          <p>{{ message }}</p>
        </div>
      </div>
    </template>

    <section class="org-confirm__body">
      <div class="org-confirm__panel">
        <strong>{{ detailsTitle }}</strong>
        <p>{{ details }}</p>
      </div>
    </section>

    <template #footer>
      <div class="org-confirm__footer">
        <button class="org-button org-button--ghost" type="button" :disabled="busy" @click="requestClose">
          Annuler
        </button>
        <button :class="['org-button', tone === 'danger' ? 'org-button--danger' : 'org-button--primary']" type="button" :disabled="busy" @click="$emit('confirm')">
          <LoaderCircle v-if="busy" class="org-button__spinner" :size="16" />
          <span>{{ busy ? processingLabel : confirmLabel }}</span>
        </button>
      </div>
    </template>
  </ModalShell>
</template>

<script setup lang="ts">
import { LoaderCircle, TriangleAlert } from 'lucide-vue-next';
import ModalShell from '../../../components/communs/ModalShell.vue';

const props = withDefaults(defineProps<{
  open: boolean;
  busy?: boolean;
  title: string;
  message: string;
  detailsTitle?: string;
  details: string;
  confirmLabel?: string;
  processingLabel?: string;
  tone?: 'primary' | 'danger';
}>(), {
  busy: false,
  detailsTitle: 'Impact',
  confirmLabel: 'Confirmer',
  processingLabel: 'Traitement en cours...',
  tone: 'danger',
});

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'confirm'): void;
}>();

function requestClose(): void {
  if (!props.busy) emit('close');
}
</script>

<style scoped>
.org-confirm__header{display:flex;gap:1rem;align-items:flex-start}
.org-confirm__icon{width:3rem;height:3rem;border-radius:18px;display:grid;place-items:center;background:#fff4e8;color:#b45309;flex:none}
.org-confirm__header small{display:block;color:#7c5a14;font-weight:700;text-transform:uppercase;letter-spacing:.05em}
.org-confirm__header h2{margin:.2rem 0 .35rem;font-size:1.45rem;color:#11283f}
.org-confirm__header p{margin:0;color:#587083;line-height:1.6}
.org-confirm__body{display:grid}
.org-confirm__panel{padding:1rem 1.05rem;border-radius:22px;background:linear-gradient(180deg,#fffaf5,#ffffff);border:1px solid rgba(180,83,9,.12)}
.org-confirm__panel strong{display:block;margin-bottom:.35rem;color:#8a4b08}
.org-confirm__panel p{margin:0;color:#5f6470;line-height:1.6}
.org-confirm__footer{display:flex;justify-content:flex-end;gap:.8rem}
.org-button{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;border-radius:999px;padding:.82rem 1.15rem;font-weight:700;border:1px solid rgba(17,40,63,.12);background:#fff;color:#11283f}
.org-button--ghost{background:#f8fbff}
.org-button--primary{background:linear-gradient(135deg,#0b5d7a,#1180a3);border-color:transparent;color:#fff;box-shadow:0 18px 36px rgba(17,128,163,.22)}
.org-button--danger{background:linear-gradient(135deg,#d63a2f,#ef4444);border-color:transparent;color:#fff;box-shadow:0 18px 36px rgba(239,68,68,.24)}
.org-button:disabled{opacity:.65;cursor:not-allowed;box-shadow:none}
.org-button__spinner{animation:org-spin .9s linear infinite}
@keyframes org-spin{to{transform:rotate(360deg)}}
@media (max-width: 720px){
  .org-confirm__footer{flex-direction:column}
}
</style>
