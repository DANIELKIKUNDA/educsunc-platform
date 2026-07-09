<template>
  <PlatformReferenceModal
    id="reference-reorder-modal"
    :open="open"
    eyebrow="Reordonnancement"
    title="Reordonner les lignes"
    description="Ajustez l ordre de passage des cours pour cette version de travail."
    @close="$emit('close')"
  >
    <div class="reference-import__issues">
      <article
        v-for="entry in localEntries"
        :key="entry.idLigneReferentielProgramme"
        class="reference-import__issue"
      >
        <strong>{{ readCourseLabel(entry.idReferentielCours) }}</strong>
        <div class="reference-import__actions">
          <label class="reference-center__field">
            <span>Ordre</span>
            <input v-model.number="entry.ordreAffichage" type="number" min="1" />
          </label>
        </div>
      </article>
    </div>

    <template #footer>
      <button class="reference-center__ghost-button" type="button" @click="$emit('close')">
        Annuler
      </button>
      <button class="reference-center__primary-button" type="button" @click="submit">
        Enregistrer le nouvel ordre
      </button>
    </template>
  </PlatformReferenceModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import PlatformReferenceModal from './PlatformReferenceModal.vue';

type ReorderEntry = {
  idLigneReferentielProgramme: string;
  idReferentielCours: string;
  ordreAffichage: number;
};

const props = defineProps<{
  open: boolean;
  entries: ReorderEntry[];
  readCourseLabel: (courseId: string) => string;
}>();

const emit = defineEmits<{
  close: [];
  submit: [payload: ReorderEntry[]];
}>();

const localEntries = ref<ReorderEntry[]>([]);

watch(
  () => [props.open, props.entries] as const,
  ([open, entries]) => {
    if (!open) {
      return;
    }

    localEntries.value = entries.map((entry) => ({ ...entry }));
  },
  { immediate: true },
);

function submit(): void {
  emit('submit', localEntries.value.map((entry) => ({ ...entry })));
}
</script>
