<template>
  <div class="reference-center__detail-mode">
    <div class="reference-center__detail-mode-head">
      <button class="reference-center__ghost-button" type="button" @click="$emit('back')">
        <ArrowLeft :size="16" />
        Retour aux referentiels
      </button>

      <div class="reference-center__detail-mode-title">
        <small>Lignes du programme</small>
        <strong>{{ classLabel }}</strong>
        <p>
          Version {{ selectedVersion.codeVersion }} | {{ structureLabel }} |
          {{ selectedVersion.lignes.length }} ligne(s)
        </p>
      </div>

      <div class="reference-center__stack-actions">
        <button
          v-if="canCreateWorkVersion"
          class="reference-center__ghost-button"
          type="button"
          @click="$emit('createWorkVersion')"
        >
          <CopyPlus :size="16" />
          Nouvelle version de travail
        </button>
        <button
          v-if="canEditVersion"
          class="reference-center__primary-button"
          type="button"
          @click="$emit('addLine')"
        >
          <Plus :size="16" />
          Ajouter une ligne
        </button>
        <button
          v-if="canEditVersion"
          class="reference-center__panel-action"
          type="button"
          @click="$emit('reorderLines')"
        >
          <ArrowUpDown :size="16" />
          Reordonner
        </button>
        <button
          v-if="canEditVersion"
          class="reference-center__panel-action"
          type="button"
          @click="$emit('checkCoherence')"
        >
          <ShieldCheck :size="16" />
          Verifier la coherence
        </button>
      </div>
    </div>

    <div class="reference-center__detail-grid reference-center__detail-grid--hero">
      <div class="reference-center__detail-item">
        <small>Classe academique</small>
        <strong>{{ classLabel }}</strong>
      </div>
      <div class="reference-center__detail-item">
        <small>Structure</small>
        <strong>{{ structureLabel }}</strong>
      </div>
      <div class="reference-center__detail-item">
        <small>Version affichee</small>
        <strong>{{ selectedVersion.codeVersion }}</strong>
      </div>
      <div class="reference-center__detail-item">
        <small>Statut</small>
        <strong>{{ selectedVersionStatusLabel }}</strong>
      </div>
      <div class="reference-center__detail-item">
        <small>Selection de version</small>
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
    </div>

    <div
      v-if="coherenceReport && coherenceReport.versionReferentielProgramme.id === selectedVersion.id"
      class="reference-center__result-shell"
    >
      <small>Verification de coherence</small>
      <strong>{{ coherenceReport.estCoherente ? 'Version coherente' : 'Points a corriger avant publication' }}</strong>
      <p class="reference-center__result-text">
        {{
          coherenceReport.estCoherente
            ? 'Cette version de travail peut poursuivre son cycle de publication.'
            : 'Cette version comporte encore des points de controle a verifier.'
        }}
      </p>
      <div class="reference-center__detail-grid">
        <div class="reference-center__detail-item">
          <small>Erreurs</small>
          <strong>{{ coherenceReport.erreurs.length }}</strong>
        </div>
        <div class="reference-center__detail-item">
          <small>Avertissements</small>
          <strong>{{ coherenceReport.avertissements.length }}</strong>
        </div>
      </div>
      <div v-if="coherenceIssues.length > 0" class="reference-import__issues">
        <article
          v-for="issue in coherenceIssues"
          :key="`${issue.level}-${issue.message}`"
          class="reference-import__issue"
        >
          <strong>{{ issue.level === 'error' ? 'Erreur bloquante' : 'Avertissement' }}</strong>
          <p>{{ issue.message }}</p>
        </article>
      </div>
    </div>

    <div class="reference-center__panel">
      <div class="reference-center__subsection-head">
        <div>
          <small>Tableau detaille</small>
          <strong>Programme officiel de la classe</strong>
        </div>
        <span class="reference-center__inline-chip">
          {{ selectedVersion.lignes.length }} ligne(s)
        </span>
      </div>

      <div class="reference-center__table-shell reference-center__table-shell--detail">
        <table class="reference-center__table">
          <thead>
            <tr>
              <th>Ordre</th>
              <th>Cours</th>
              <th>Obligatoire</th>
              <th>A l examen</th>
              <th>Calculable</th>
              <th>Domaine</th>
              <th>Ponderation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="line in orderedLines" :key="line.id">
              <td>{{ line.ordreAffichage }}</td>
              <td>{{ readCourseLabel(line.idReferentielCours) }}</td>
              <td>
                <span class="reference-center__badge" :class="badgeClass(line.obligatoire)">
                  {{ line.obligatoire ? 'Oui' : 'Non' }}
                </span>
              </td>
              <td>
                <span class="reference-center__badge" :class="badgeClass(line.aExamen)">
                  {{ line.aExamen ? 'Oui' : 'Non' }}
                </span>
              </td>
              <td>
                <span class="reference-center__badge" :class="badgeClass(line.estCalculable)">
                  {{ line.estCalculable ? 'Oui' : 'Non' }}
                </span>
              </td>
              <td>{{ line.domaine ?? 'Sans domaine' }}</td>
              <td>
                <div class="reference-center__weights">
                  <span
                    v-for="weight in formatPonderation(line.ponderation)"
                    :key="`${line.id}-${weight.label}`"
                    class="reference-center__weight-chip"
                  >
                    {{ weight.label }} {{ weight.value }}
                  </span>
                </div>
              </td>
              <td>
                <div v-if="canEditVersion" class="reference-center__stack-actions">
                  <button class="reference-center__ghost-button" type="button" @click="$emit('editLine', line)">
                    <PencilLine :size="15" />
                    Modifier
                  </button>
                  <button class="reference-center__panel-action" type="button" @click="$emit('editWeights', line)">
                    <Scale :size="15" />
                    Ponderation
                  </button>
                  <button class="reference-center__danger-button" type="button" @click="$emit('removeLine', line.id)">
                    <Trash2 :size="15" />
                    Retirer
                  </button>
                </div>
                <div v-else class="reference-center__locked-state">
                  <span class="reference-center__inline-chip">
                    {{ selectedVersion.publiee || selectedVersion.active ? 'Version verrouillee' : 'Lecture selon droits actifs' }}
                  </span>
                  <small>
                    {{
                      selectedVersion.publiee || selectedVersion.active
                        ? 'Creez une nouvelle version de travail pour corriger ce programme.'
                        : 'Les mutations restent reservees aux droits d edition actifs.'
                    }}
                  </small>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, ArrowUpDown, CopyPlus, PencilLine, Plus, Scale, ShieldCheck, Trash2 } from 'lucide-vue-next';
import type {
  LigneReferentielProgrammeItem,
  VerificationCoherenceVersionReferentielItem,
  VersionReferentielProgrammeItem,
} from '../../academique/models/academique.model';

defineProps<{
  classLabel: string;
  structureLabel: string;
  selectedVersion: VersionReferentielProgrammeItem;
  availableVersions: VersionReferentielProgrammeItem[];
  selectedVersionStatusLabel: string;
  canCreateWorkVersion: boolean;
  canEditVersion: boolean;
  coherenceReport: VerificationCoherenceVersionReferentielItem | null;
  coherenceIssues: Array<{ level: 'error' | 'warning'; message: string }>;
  orderedLines: LigneReferentielProgrammeItem[];
  readCourseLabel: (courseId: string) => string;
  badgeClass: (value: boolean) => string;
  formatPonderation: (ponderation?: Record<string, number>) => Array<{ label: string; value: number }>;
}>();

const emit = defineEmits<{
  back: [];
  createWorkVersion: [];
  addLine: [];
  reorderLines: [];
  checkCoherence: [];
  changeVersion: [versionId: string | null];
  editLine: [line: LigneReferentielProgrammeItem];
  editWeights: [line: LigneReferentielProgrammeItem];
  removeLine: [lineId: string];
}>();

function onVersionChange(event: Event): void {
  const target = event.target as HTMLSelectElement | null;
  emit('changeVersion', target?.value ?? null);
}
</script>
