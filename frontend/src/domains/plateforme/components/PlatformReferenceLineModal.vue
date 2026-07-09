<template>
  <PlatformReferenceModal
    id="reference-line-modal"
    :open="open"
    eyebrow="Ligne de programme"
    :title="mode === 'create' ? 'Ajouter une ligne' : 'Modifier une ligne'"
    description="Renseignez les attributs pedagogiques et les ponderations de cette ligne officielle."
    @close="$emit('close')"
  >
    <div class="reference-import__grid">
      <label class="reference-center__field">
        <span>Cours</span>
        <select v-model="form.idReferentielCours" :disabled="mode === 'edit'">
          <option value="">Selectionnez un cours</option>
          <option v-for="course in courses" :key="course.id" :value="course.id">
            {{ course.libelle }}
          </option>
        </select>
      </label>
      <label class="reference-center__field">
        <span>Ordre</span>
        <input v-model.number="form.ordreAffichage" type="number" min="1" />
      </label>
      <label class="reference-center__field">
        <span>Source de ligne</span>
        <select v-model="form.sourceLigne" :disabled="mode === 'edit'">
          <option value="OFFICIEL">Officiel</option>
          <option value="AJOUT_ETAT">Ajout Etat</option>
          <option value="HERITE_ANCIENNE_VERSION">Heritee d une ancienne version</option>
          <option value="OBSOLETE">Obsolete</option>
        </select>
      </label>
      <label class="reference-center__field">
        <span>Domaine</span>
        <input v-model="form.domaine" type="text" placeholder="Domaine" />
      </label>
      <label class="reference-center__field">
        <span>Sous-domaine</span>
        <input v-model="form.sousDomaine" type="text" placeholder="Sous-domaine" />
      </label>
      <label class="reference-center__field reference-center__field--check">
        <input v-model="form.obligatoire" type="checkbox" />
        <span>Obligatoire</span>
      </label>
      <label class="reference-center__field reference-center__field--check">
        <input v-model="form.aExamen" type="checkbox" />
        <span>A l examen</span>
      </label>
      <label class="reference-center__field reference-center__field--check">
        <input v-model="form.estCalculable" type="checkbox" />
        <span>Calculable</span>
      </label>
    </div>

    <div class="reference-import__grid">
      <label
        v-for="field in ponderationFields"
        :key="field.key"
        class="reference-center__field"
      >
        <span>{{ field.label }}</span>
        <input v-model.number="form.ponderation[field.key]" type="number" min="0" />
      </label>
    </div>

    <template #footer>
      <button class="reference-center__ghost-button" type="button" @click="$emit('close')">
        Annuler
      </button>
      <button class="reference-center__primary-button" type="button" :disabled="!canSubmit" @click="submit">
        {{ mode === 'create' ? 'Ajouter la ligne' : 'Enregistrer' }}
      </button>
    </template>
  </PlatformReferenceModal>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import type { LigneReferentielProgrammeItem, ReferentielCoursItem } from '../../academique/models/academique.model';
import PlatformReferenceModal from './PlatformReferenceModal.vue';

type PonderationKey =
  | 'maxP1'
  | 'maxP2'
  | 'maxEX1'
  | 'maxP3'
  | 'maxP4'
  | 'maxEX2'
  | 'maxP5'
  | 'maxP6'
  | 'maxEX3';

const props = defineProps<{
  open: boolean;
  mode: 'create' | 'edit';
  courses: ReferentielCoursItem[];
  line: LigneReferentielProgrammeItem | null;
  nextOrder: number;
}>();

const emit = defineEmits<{
  close: [];
  submit: [payload: {
    idReferentielCours: string;
    ordreAffichage: number;
    obligatoire: boolean;
    aExamen: boolean;
    estCalculable: boolean;
    sourceLigne?: string;
    ponderation: Record<string, number>;
    domaine?: string;
    sousDomaine?: string;
  }];
}>();

const ponderationFields: Array<{ key: PonderationKey; label: string }> = [
  { key: 'maxP1', label: 'P1' },
  { key: 'maxP2', label: 'P2' },
  { key: 'maxEX1', label: 'EX1' },
  { key: 'maxP3', label: 'P3' },
  { key: 'maxP4', label: 'P4' },
  { key: 'maxEX2', label: 'EX2' },
  { key: 'maxP5', label: 'P5' },
  { key: 'maxP6', label: 'P6' },
  { key: 'maxEX3', label: 'EX3' },
];

const form = reactive({
  idReferentielCours: '',
  ordreAffichage: 1,
  obligatoire: true,
  aExamen: false,
  estCalculable: true,
  sourceLigne: 'OFFICIEL',
  domaine: '',
  sousDomaine: '',
  ponderation: createBlankPonderation(),
});

const canSubmit = computed(() => Boolean(form.idReferentielCours.trim() && form.ordreAffichage > 0));

watch(
  () => [props.open, props.mode, props.line, props.nextOrder] as const,
  ([open, mode, line, nextOrder]) => {
    if (!open) {
      return;
    }

    if (mode === 'edit' && line) {
      form.idReferentielCours = line.idReferentielCours;
      form.ordreAffichage = line.ordreAffichage;
      form.obligatoire = line.obligatoire;
      form.aExamen = line.aExamen;
      form.estCalculable = line.estCalculable;
      form.sourceLigne = line.sourceLigne;
      form.domaine = line.domaine ?? '';
      form.sousDomaine = line.sousDomaine ?? '';
      Object.assign(form.ponderation, createBlankPonderation(), line.ponderation ?? {});
      return;
    }

    form.idReferentielCours = '';
    form.ordreAffichage = nextOrder;
    form.obligatoire = true;
    form.aExamen = false;
    form.estCalculable = true;
    form.sourceLigne = 'OFFICIEL';
    form.domaine = '';
    form.sousDomaine = '';
    Object.assign(form.ponderation, createBlankPonderation());
  },
  { immediate: true },
);

function createBlankPonderation(): Record<PonderationKey, number> {
  return {
    maxP1: 0,
    maxP2: 0,
    maxEX1: 0,
    maxP3: 0,
    maxP4: 0,
    maxEX2: 0,
    maxP5: 0,
    maxP6: 0,
    maxEX3: 0,
  };
}

function submit(): void {
  emit('submit', {
    idReferentielCours: form.idReferentielCours,
    ordreAffichage: form.ordreAffichage,
    obligatoire: form.obligatoire,
    aExamen: form.aExamen,
    estCalculable: form.estCalculable,
    sourceLigne: props.mode === 'create' ? form.sourceLigne : undefined,
    ponderation: { ...form.ponderation },
    domaine: form.domaine.trim() || undefined,
    sousDomaine: form.sousDomaine.trim() || undefined,
  });
}
</script>
