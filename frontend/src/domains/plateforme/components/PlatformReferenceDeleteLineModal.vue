<template>
  <PlatformReferenceModal
    id="reference-delete-line-modal"
    :open="open"
    eyebrow="Confirmation"
    title="Retirer cette ligne ?"
    description="Cette action retire la ligne de la version de travail en cours. Les versions publiees ou actives restent intactes."
    @close="$emit('close')"
  >
    <div class="reference-import__confirm-card">
      <strong>{{ lineLabel }}</strong>
      <p>Verifiez bien que cette ligne ne doit plus faire partie de cette version de travail.</p>
    </div>

    <template #footer>
      <button class="reference-center__ghost-button" type="button" @click="$emit('close')">
        Annuler
      </button>
      <button class="reference-center__danger-button" type="button" @click="$emit('confirm')">
        Retirer la ligne
      </button>
    </template>
  </PlatformReferenceModal>
</template>

<script setup lang="ts">
import PlatformReferenceModal from './PlatformReferenceModal.vue';

defineProps<{
  open: boolean;
  lineLabel: string;
}>();

defineEmits<{
  close: [];
  confirm: [];
}>();
</script>
