<template>
  <PlatformReferenceModal
    id="reference-create-work-version"
    :open="open"
    eyebrow="Version de travail"
    title="Creer une version de travail"
    description="Dupliquez une version existante pour preparer des corrections sans modifier les versions publiees ou actives."
    @close="$emit('close')"
  >
    <div class="reference-import__grid">
      <label class="reference-center__field">
        <span>Version source</span>
        <input :value="sourceVersion?.codeVersion ?? ''" disabled />
      </label>
      <label class="reference-center__field">
        <span>Code version</span>
        <input v-model="form.codeVersion" type="text" placeholder="Ex. V2026.1-TRAVAIL" />
      </label>
      <label class="reference-center__field">
        <span>Annee reference</span>
        <input v-model="form.anneeReference" type="text" placeholder="2026-2027" />
      </label>
      <label class="reference-center__field">
        <span>Date de reference</span>
        <input v-model="form.datePublication" type="date" />
      </label>
      <label class="reference-center__field">
        <span>Source</span>
        <select v-model="form.sourceImport">
          <option value="JSON_OFFICIEL">JSON officiel</option>
          <option value="IMPORT_PLATEFORME">Import plateforme</option>
          <option value="CORRECTION_SYSTEME">Correction systeme</option>
        </select>
      </label>
      <label class="reference-center__field reference-center__field--full">
        <span>Motif</span>
        <textarea v-model="form.motifPublication" rows="3" placeholder="Precisez le motif de cette version de travail." />
      </label>
    </div>

    <template #footer>
      <button class="reference-center__ghost-button" type="button" @click="$emit('close')">
        Annuler
      </button>
      <button class="reference-center__primary-button" type="button" :disabled="!canSubmit" @click="submit">
        Creer la version
      </button>
    </template>
  </PlatformReferenceModal>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import type { VersionReferentielProgrammeItem } from '../../academique/models/academique.model';
import PlatformReferenceModal from './PlatformReferenceModal.vue';

const props = defineProps<{
  open: boolean;
  sourceVersion: VersionReferentielProgrammeItem | null;
}>();

const emit = defineEmits<{
  close: [];
  submit: [payload: {
    idVersionSource: string;
    codeVersion: string;
    anneeReference: string;
    datePublication: string;
    sourceImport?: string;
    motifPublication?: string;
  }];
}>();

const form = reactive({
  codeVersion: '',
  anneeReference: '',
  datePublication: '',
  sourceImport: 'CORRECTION_SYSTEME',
  motifPublication: '',
});

const canSubmit = computed(() => Boolean(
  props.sourceVersion
  && form.codeVersion.trim()
  && form.anneeReference.trim()
  && form.datePublication.trim(),
));

watch(
  () => [props.open, props.sourceVersion] as const,
  ([open, sourceVersion]) => {
    if (!open || !sourceVersion) {
      return;
    }

    form.codeVersion = `${sourceVersion.codeVersion}-WIP`;
    form.anneeReference = sourceVersion.anneeReference;
    form.datePublication = new Date().toISOString().slice(0, 10);
    form.sourceImport = sourceVersion.sourceImport || 'CORRECTION_SYSTEME';
    form.motifPublication = sourceVersion.motifPublication ?? '';
  },
  { immediate: true },
);

function submit(): void {
  if (!props.sourceVersion) {
    return;
  }

  emit('submit', {
    idVersionSource: props.sourceVersion.id,
    codeVersion: form.codeVersion.trim(),
    anneeReference: form.anneeReference.trim(),
    datePublication: form.datePublication,
    sourceImport: form.sourceImport,
    motifPublication: form.motifPublication.trim() || undefined,
  });
}
</script>
