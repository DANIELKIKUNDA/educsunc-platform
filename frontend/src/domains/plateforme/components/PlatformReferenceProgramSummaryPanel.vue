<template>
  <div class="reference-center__detail-panel">
    <div class="reference-center__detail-head">
      <small>Referentiel selectionne</small>
      <strong>{{ selectedReferentiel ? classLabel : 'Aucun referentiel' }}</strong>
    </div>

    <EmptyState
      v-if="!selectedReferentiel"
      title="Aucun referentiel selectionne"
      message="Ouvrez un referentiel pour afficher son resume, ses versions et ses informations officielles."
    />

    <template v-else>
      <div class="reference-center__detail-grid">
        <div class="reference-center__detail-item">
          <small>Classe academique</small>
          <strong>{{ classLabel }}</strong>
        </div>
        <div class="reference-center__detail-item">
          <small>Structure</small>
          <strong>{{ selectedReferentiel.typeStructureEvaluation }}</strong>
        </div>
        <div class="reference-center__detail-item">
          <small>Version projetee</small>
          <strong>{{ selectedReferentiel.versionProjectionnee?.codeVersion ?? 'Aucune' }}</strong>
        </div>
        <div class="reference-center__detail-item">
          <small>Versions disponibles</small>
          <strong>{{ availableVersions.length }}</strong>
        </div>
      </div>

      <div v-if="selectedVersion" class="reference-center__version-shell">
        <header class="reference-center__subsection-head">
          <div>
            <small>Version selectionnee</small>
            <strong>{{ selectedVersion.codeVersion }}</strong>
          </div>
          <span class="reference-center__badge" :class="badgeClass(selectedVersion.active || selectedVersion.publiee)">
            {{ selectedVersionStatusLabel }}
          </span>
        </header>

        <div class="reference-center__detail-grid">
          <div class="reference-center__detail-item">
            <small>Choisir une version</small>
            <select :value="selectedVersion.id" @change="onVersionChange">
              <option
                v-for="version in availableVersions"
                :key="version.id"
                :value="version.id"
              >
                {{ version.codeVersion }} | {{ version.active ? 'active' : version.publiee ? 'publiee' : 'travail' }}
              </option>
            </select>
          </div>
          <div class="reference-center__detail-item">
            <small>Date publication</small>
            <strong>{{ formatDate(selectedVersion.datePublication) }}</strong>
          </div>
          <div class="reference-center__detail-item">
            <small>Source</small>
            <strong>{{ selectedVersion.sourceImport }}</strong>
          </div>
          <div class="reference-center__detail-item">
            <small>Annee reference</small>
            <strong>{{ selectedVersion.anneeReference }}</strong>
          </div>
          <div class="reference-center__detail-item">
            <small>Motif</small>
            <strong>{{ selectedVersion.motifPublication ?? 'Sans motif' }}</strong>
          </div>
          <div class="reference-center__detail-item">
            <small>Lignes</small>
            <strong>{{ selectedVersion.lignes.length }}</strong>
          </div>
        </div>

        <div class="reference-center__detail-actions">
          <button class="reference-center__primary-button" type="button" @click="$emit('openDetail')">
            <BookOpenText :size="16" />
            Ouvrir les lignes du programme
          </button>

          <div class="reference-center__stack-actions">
            <button
              v-if="canCreateWorkVersion"
              class="reference-center__ghost-button"
              type="button"
              @click="$emit('createWorkVersion')"
            >
              <CopyPlus :size="16" />
              Creer une version de travail
            </button>
            <button
              v-if="canEditVersion"
              class="reference-center__panel-action"
              type="button"
              @click="$emit('checkCoherence')"
            >
              <ShieldCheck :size="16" />
              Verifier
            </button>
            <button
              v-if="canCompare"
              class="reference-center__panel-action"
              type="button"
              @click="$emit('compare')"
            >
              <GitCompareArrows :size="16" />
              Comparer
            </button>
            <button
              v-if="canMigrate"
              class="reference-center__panel-action"
              type="button"
              @click="$emit('migrate')"
            >
              <Workflow :size="16" />
              Migrer
            </button>
          </div>
        </div>
      </div>

      <EmptyState
        v-else
        title="Aucune version disponible"
        message="Ce referentiel ne dispose pas encore de version exploitable."
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { BookOpenText, CopyPlus, GitCompareArrows, ShieldCheck, Workflow } from 'lucide-vue-next';
import type { ReferentielProgrammeItem, VersionReferentielProgrammeItem } from '../../academique/models/academique.model';
import EmptyState from '../../../shared/ui/EmptyState.vue';

const props = defineProps<{
  selectedReferentiel: ReferentielProgrammeItem | null;
  classLabel: string;
  availableVersions: VersionReferentielProgrammeItem[];
  selectedVersion: VersionReferentielProgrammeItem | null;
  selectedVersionStatusLabel: string;
  canCreateWorkVersion: boolean;
  canEditVersion: boolean;
  canCompare: boolean;
  canMigrate: boolean;
  badgeClass: (value: boolean) => string;
  formatDate: (value?: string) => string;
}>();

const emit = defineEmits<{
  openDetail: [];
  createWorkVersion: [];
  checkCoherence: [];
  compare: [];
  migrate: [];
  changeVersion: [versionId: string | null];
}>();

function onVersionChange(event: Event): void {
  const target = event.target as HTMLSelectElement | null;
  emit('changeVersion', target?.value ?? null);
}
</script>
