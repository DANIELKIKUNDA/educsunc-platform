<template>
  <ModalShell :open="open" @close="requestClose">
    <template #header>
      <div class="school-action-modal__heading">
        <small>Administration école</small>
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
      </div>
    </template>

    <form id="school-action-form" class="school-action-modal__form" @submit.prevent="$emit('submit')">
      <slot />
      <div v-if="showDiscardWarning" class="school-action-modal__discard" role="alert">
        <div>
          <strong>Abandonner les modifications ?</strong>
          <p>Les informations saisies dans cette fenêtre ne seront pas enregistrées.</p>
        </div>
        <div class="school-action-modal__discard-actions">
          <button type="button" @click="showDiscardWarning = false">Continuer la saisie</button>
          <button class="school-action-modal__danger" type="button" @click="discard">Abandonner</button>
        </div>
      </div>
    </form>

    <template #footer>
      <div class="school-action-modal__footer">
        <button type="button" class="school-action-modal__secondary" :disabled="pending" @click="requestClose">
          Annuler
        </button>
        <button
          form="school-action-form"
          type="submit"
          class="school-action-modal__primary"
          :disabled="!canSubmit || pending"
        >
          {{ pending ? 'Enregistrement en cours…' : submitLabel }}
        </button>
      </div>
    </template>
  </ModalShell>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import ModalShell from '../../../components/communs/ModalShell.vue';

const props = defineProps<{
  open: boolean;
  title: string;
  description: string;
  submitLabel: string;
  canSubmit: boolean;
  pending: boolean;
  dirty: boolean;
}>();

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'discard'): void;
  (event: 'submit'): void;
}>();

const showDiscardWarning = ref(false);

watch(() => props.open, (open) => {
  if (!open) showDiscardWarning.value = false;
});

function requestClose(): void {
  if (props.pending) return;
  if (props.dirty) {
    showDiscardWarning.value = true;
    return;
  }
  emit('close');
}

function discard(): void {
  showDiscardWarning.value = false;
  emit('discard');
}
</script>

<style scoped>
.school-action-modal__heading small{color:#647d90;font-weight:800;letter-spacing:.09em;text-transform:uppercase}
.school-action-modal__heading h2{margin:.35rem 0;color:#10243b;font-size:clamp(1.35rem,3vw,1.8rem)}
.school-action-modal__heading p{margin:0;color:#587083;line-height:1.55}
.school-action-modal__form{display:grid;gap:1rem}
.school-action-modal__footer,.school-action-modal__discard-actions{display:flex;justify-content:flex-end;gap:.75rem;flex-wrap:wrap}
.school-action-modal__primary,.school-action-modal__secondary,.school-action-modal__discard button{min-height:44px;border-radius:999px;padding:.72rem 1.1rem;font-weight:800;border:1px solid rgba(17,40,63,.14)}
.school-action-modal__primary{border:0;background:linear-gradient(135deg,#0f496f,#157da0);color:#fff;box-shadow:0 12px 26px rgba(15,73,111,.2)}
.school-action-modal__secondary,.school-action-modal__discard button{background:#fff;color:#17324b}
.school-action-modal__primary:disabled,.school-action-modal__secondary:disabled{opacity:.55;cursor:not-allowed}
.school-action-modal__discard{display:grid;gap:.8rem;padding:1rem;border:1px solid rgba(181,92,42,.2);border-radius:18px;background:#fff9f2;color:#60381f}
.school-action-modal__discard p{margin:.25rem 0 0;color:#7b5a44}
.school-action-modal__discard .school-action-modal__danger{background:#a94343;color:#fff;border-color:#a94343}
@media(max-width:640px){.school-action-modal__footer,.school-action-modal__discard-actions{display:grid}.school-action-modal__footer button,.school-action-modal__discard button{width:100%}}
</style>
