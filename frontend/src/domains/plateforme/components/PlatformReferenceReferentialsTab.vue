<template>
  <SectionBlock
    title="Referentiels programmes"
    description="Consultez les referentiels par classe, selectionnez une version de travail et administrez les lignes officielles autorisees."
  >
    <PlatformReferenceProgramDetailMode
      v-if="detailMode && selectedVersion && vm.selectedReferentiel"
      :class-label="vm.readClasseLabel(vm.selectedReferentiel.idClasseAcademique)"
      :structure-label="vm.selectedReferentiel.typeStructureEvaluation"
      :selected-version="selectedVersion"
      :available-versions="availableVersions"
      :selected-version-status-label="selectedVersionStatusLabel"
      :can-create-work-version="canCreateWorkVersion"
      :can-edit-version="canEditVersion"
      :coherence-report="coherenceReport"
      :coherence-issues="coherenceIssues"
      :ordered-lines="orderedLines"
      :read-course-label="vm.readCourseLabel"
      :badge-class="vm.badgeClass"
      :format-ponderation="formatPonderation"
      @back="detailMode = false"
      @create-work-version="openCreateVersionModal"
      @add-line="openAddLineModal"
      @reorder-lines="openReorderModal"
      @check-coherence="checkCoherence"
      @change-version="changeVersion"
      @edit-line="openEditLineModal"
      @edit-weights="openWeightsModal"
      @remove-line="removeLine"
    />

    <div v-else class="reference-center__tab-grid">
      <div class="reference-center__panel">
        <div class="reference-center__panel-head">
          <div>
            <small>{{ vm.referentielsMeta.totalLabel }}</small>
            <strong>{{ vm.referentielsMeta.totalValue }}</strong>
            <p class="reference-center__panel-meta">
              {{ vm.referentielsMeta.totalValue }} sur {{ vm.referentielsMeta.totalAvailable }} disponible(s)
            </p>
          </div>
          <div class="reference-center__stack-actions">
            <button
              v-if="canCreateWorkVersion"
              class="reference-center__ghost-button"
              type="button"
              @click="openCreateVersionModal"
            >
              <CopyPlus :size="16" />
              Nouvelle version
            </button>
            <button class="reference-center__panel-action" type="button" :disabled="!vm.canPublish" @click="vm.ouvrirActionRoute('platform-reference-publish')">
              <Send :size="16" />
              Publier
            </button>
            <button class="reference-center__panel-action" type="button" :disabled="!vm.canActivate" @click="vm.ouvrirActionRoute('platform-reference-activate')">
              <CircleCheckBig :size="16" />
              Activer
            </button>
          </div>
        </div>

        <EmptyState
          v-if="vm.filteredReferentiels.length === 0"
          title="Aucun referentiel programme"
          message="Aucun referentiel ne correspond aux filtres actuels."
        />

        <div v-else class="reference-center__table-shell">
          <table class="reference-center__table">
            <thead>
              <tr>
                <th>Classe academique</th>
                <th>Structure</th>
                <th>Actif</th>
                <th>Version projetee</th>
                <th>Versions</th>
                <th>Lignes</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="referentiel in vm.paginatedReferentiels"
                :key="referentiel.id"
                :class="{ 'reference-center__table-row--selected': vm.selectedReferentiel?.id === referentiel.id }"
                @click="selectReferentiel(referentiel.id)"
              >
                <td>{{ vm.readClasseLabel(referentiel.idClasseAcademique) }}</td>
                <td>{{ referentiel.typeStructureEvaluation }}</td>
                <td><span class="reference-center__badge" :class="vm.badgeClass(referentiel.actif)">{{ referentiel.actif ? 'Actif' : 'Inactif' }}</span></td>
                <td>{{ referentiel.versionProjectionnee?.codeVersion ?? 'Aucune' }}</td>
                <td>{{ referentiel.versions.length }}</td>
                <td>{{ referentiel.versionProjectionnee?.lignes.length ?? referentiel.versions[0]?.lignes.length ?? 0 }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <DataPagination
          v-if="vm.filteredReferentiels.length > 0"
          :visible-items="vm.referentielsPaginationEnd"
          :total-items="vm.filteredReferentiels.length"
          :rows-per-page="vm.referentielsPagination.rowsPerPage"
          :can-load-more="vm.referentielsPagination.currentPage < vm.referentielsTotalPages"
          :can-reset="vm.referentielsPagination.currentPage > 1"
          @update:rows-per-page="vm.referentielsPagination.rowsPerPage = $event; vm.referentielsPagination.currentPage = 1"
          @load-more="vm.referentielsPagination.currentPage += 1"
          @show-all="vm.referentielsPagination.currentPage = vm.referentielsTotalPages"
          @reset="vm.referentielsPagination.currentPage = 1"
        />
      </div>

      <PlatformReferenceProgramSummaryPanel
        :selected-referentiel="vm.selectedReferentiel"
        :class-label="vm.selectedReferentiel ? vm.readClasseLabel(vm.selectedReferentiel.idClasseAcademique) : 'Aucun referentiel'"
        :available-versions="availableVersions"
        :selected-version="selectedVersion"
        :selected-version-status-label="selectedVersionStatusLabel"
        :can-create-work-version="canCreateWorkVersion"
        :can-edit-version="canEditVersion"
        :can-compare="vm.canCompare"
        :can-migrate="vm.canMigrate"
        :badge-class="vm.badgeClass"
        :format-date="vm.formatDate"
        @open-detail="detailMode = true"
        @create-work-version="openCreateVersionModal"
        @check-coherence="checkCoherence"
        @compare="vm.ouvrirActionRoute('platform-reference-compare')"
        @migrate="vm.ouvrirActionRoute('platform-reference-migrations', true)"
        @change-version="changeVersion"
      />
    </div>

    <PlatformReferenceWorkVersionModal
      :open="modalState === 'create-version'"
      :source-version="selectedVersion"
      @close="closeModal"
      @submit="submitCreateVersion"
    />

    <PlatformReferenceLineModal
      :open="modalState === 'create-line' || modalState === 'edit-line'"
      :mode="modalState === 'edit-line' ? 'edit' : 'create'"
      :courses="availableCourses"
      :line="activeLine"
      :next-order="nextLineOrder"
      @close="closeModal"
      @submit="submitLine"
    />

    <PlatformReferenceWeightsModal
      :open="modalState === 'weights'"
      :line="activeLine"
      @close="closeModal"
      @submit="submitWeights"
    />

    <PlatformReferenceReorderModal
      :open="modalState === 'reorder'"
      :entries="reorderEntries"
      :read-course-label="vm.readCourseLabel"
      @close="closeModal"
      @submit="submitReorder"
    />

    <PlatformReferenceDeleteLineModal
      :open="modalState === 'delete-line'"
      :line-label="pendingDeleteLineLabel"
      @close="closeModal"
      @confirm="confirmRemoveLine"
    />
  </SectionBlock>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  CircleCheckBig,
  CopyPlus,
  Send,
} from 'lucide-vue-next';
import type { LigneReferentielProgrammeItem } from '../../academique/models/academique.model';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import DataPagination from '../../../shared/ui/DataPagination.vue';
import PlatformReferenceDeleteLineModal from './PlatformReferenceDeleteLineModal.vue';
import PlatformReferenceLineModal from './PlatformReferenceLineModal.vue';
import PlatformReferenceProgramDetailMode from './PlatformReferenceProgramDetailMode.vue';
import PlatformReferenceProgramSummaryPanel from './PlatformReferenceProgramSummaryPanel.vue';
import PlatformReferenceReorderModal from './PlatformReferenceReorderModal.vue';
import PlatformReferenceWeightsModal from './PlatformReferenceWeightsModal.vue';
import PlatformReferenceWorkVersionModal from './PlatformReferenceWorkVersionModal.vue';
import { usePlatformOfficialReferenceCenterViewModelContext } from '../viewmodels/usePlatformOfficialReferenceCenterViewModel';

type ModalState =
  | null
  | 'create-version'
  | 'create-line'
  | 'edit-line'
  | 'weights'
  | 'reorder'
  | 'delete-line';

const vm = usePlatformOfficialReferenceCenterViewModelContext();
const detailMode = ref(false);
const modalState = ref<ModalState>(null);
const editingLineId = ref<string | null>(null);
const pendingDeleteLineId = ref<string | null>(null);
const reorderEntries = ref<Array<{
  idLigneReferentielProgramme: string;
  idReferentielCours: string;
  ordreAffichage: number;
}>>([]);

const availableVersions = computed(() => vm.selectedReferentielVersions ?? []);
const selectedVersion = computed(() => vm.selectedReferentielVersion ?? null);
const selectedVersionStatusLabel = computed(() => {
  if (!selectedVersion.value) {
    return 'Sans version';
  }
  if (selectedVersion.value.active) {
    return 'Version active';
  }
  if (selectedVersion.value.publiee) {
    return 'Version publiee';
  }
  return 'Version de travail';
});
const canEditVersion = computed(() => Boolean(vm.canEditSelectedVersion && selectedVersion.value));
const canCreateWorkVersion = computed(() => Boolean(vm.canPublish && selectedVersion.value && vm.selectedReferentiel));
const availableCourses = computed(() => vm.store.state.cours ?? []);
const coherenceReport = computed(() => vm.store.state.coherenceReport);
const coherenceIssues = computed(() => {
  const report = coherenceReport.value;
  if (!report) {
    return [];
  }

  return [
    ...report.erreurs.map((message) => ({ level: 'error' as const, message })),
    ...report.avertissements.map((message) => ({ level: 'warning' as const, message })),
  ];
});
const pendingDeleteLineLabel = computed(() => {
  const line = orderedLines.value.find((entry) => entry.id === pendingDeleteLineId.value);
  return line ? vm.readCourseLabel(line.idReferentielCours) : 'Ligne selectionnee';
});
const activeLine = computed(() =>
  orderedLines.value.find((entry) => entry.id === editingLineId.value) ?? null,
);
const nextLineOrder = computed(() => (selectedVersion.value?.lignes.length ?? 0) + 1);
const orderedLines = computed(() =>
  (selectedVersion.value?.lignes ?? [])
    .slice()
    .sort((left, right) => left.ordreAffichage - right.ordreAffichage),
);

function openCreateVersionModal(): void {
  modalState.value = 'create-version';
}

function openAddLineModal(): void {
  editingLineId.value = null;
  modalState.value = 'create-line';
}

function openEditLineModal(line: LigneReferentielProgrammeItem): void {
  editingLineId.value = line.id;
  modalState.value = 'edit-line';
}

function openWeightsModal(line: LigneReferentielProgrammeItem): void {
  editingLineId.value = line.id;
  modalState.value = 'weights';
}

function openReorderModal(): void {
  reorderEntries.value = orderedLines.value.map((line) => ({
    idLigneReferentielProgramme: line.id,
    idReferentielCours: line.idReferentielCours,
    ordreAffichage: line.ordreAffichage,
  }));
  modalState.value = 'reorder';
}

function closeModal(): void {
  modalState.value = null;
  editingLineId.value = null;
  pendingDeleteLineId.value = null;
}

function selectReferentiel(idReferentiel: string): void {
  detailMode.value = false;
  void vm.chargerReferentiel(idReferentiel);
}

function changeVersion(versionId: string | null): void {
  vm.selectionnerVersion(versionId);
}

async function submitCreateVersion(payload: {
  idVersionSource: string;
  codeVersion: string;
  anneeReference: string;
  datePublication: string;
  sourceImport?: string;
  motifPublication?: string;
}): Promise<void> {
  if (!vm.selectedReferentiel) {
    return;
  }

  await vm.creerVersionTravailReferentiel(vm.selectedReferentiel.id, payload);
  closeModal();
}

async function submitLine(payload: {
  idReferentielCours: string;
  ordreAffichage: number;
  obligatoire: boolean;
  aExamen: boolean;
  estCalculable: boolean;
  sourceLigne?: string;
  ponderation: Record<string, number>;
  domaine?: string;
  sousDomaine?: string;
}): Promise<void> {
  if (!selectedVersion.value) {
    return;
  }

  if (modalState.value === 'create-line') {
    await vm.ajouterLigneVersionReferentiel(selectedVersion.value.id, payload);
  } else if (modalState.value === 'edit-line' && editingLineId.value) {
    await vm.modifierLigneVersionReferentiel(selectedVersion.value.id, editingLineId.value, payload);
  }

  closeModal();
}

async function submitWeights(payload: { ponderation: Record<string, number> }): Promise<void> {
  if (!selectedVersion.value || !editingLineId.value) {
    return;
  }

  await vm.modifierPonderationLigneVersionReferentiel(
    selectedVersion.value.id,
    editingLineId.value,
    payload,
  );
  closeModal();
}

async function submitReorder(entries: Array<{
  idLigneReferentielProgramme: string;
  idReferentielCours: string;
  ordreAffichage: number;
}>): Promise<void> {
  if (!selectedVersion.value) {
    return;
  }

  await vm.reordonnerLignesVersionReferentiel(
    selectedVersion.value.id,
    entries.map((entry) => ({
      idLigneReferentielProgramme: entry.idLigneReferentielProgramme,
      ordreAffichage: entry.ordreAffichage,
    })),
  );
  closeModal();
}

function removeLine(idLigneReferentielProgramme: string): void {
  pendingDeleteLineId.value = idLigneReferentielProgramme;
  modalState.value = 'delete-line';
}

async function confirmRemoveLine(): Promise<void> {
  if (!selectedVersion.value || !pendingDeleteLineId.value) {
    return;
  }

  await vm.retirerLigneVersionReferentiel(selectedVersion.value.id, pendingDeleteLineId.value);
  closeModal();
}

async function checkCoherence(): Promise<void> {
  if (!selectedVersion.value) {
    return;
  }

  await vm.verifierCoherenceVersionReferentiel(selectedVersion.value.id);
}

function formatPonderation(ponderation?: Record<string, number>): Array<{ label: string; value: number }> {
  if (!ponderation) {
    return [];
  }

  return ([
    { key: 'maxP1', label: 'P1' },
    { key: 'maxP2', label: 'P2' },
    { key: 'maxEX1', label: 'EX1' },
    { key: 'maxP3', label: 'P3' },
    { key: 'maxP4', label: 'P4' },
    { key: 'maxEX2', label: 'EX2' },
    { key: 'maxP5', label: 'P5' },
    { key: 'maxP6', label: 'P6' },
    { key: 'maxEX3', label: 'EX3' },
  ] as Array<{ key: string; label: string }>)
    .map((field) => ({ label: field.label, value: ponderation[field.key] ?? 0 }))
    .filter((entry) => entry.value > 0);
}
</script>
