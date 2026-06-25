<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-PF-013"
      title="Fonds anticipes"
      description="Vue d'analyse et de detail pour lire les fonds anticipes dans le bon perimetre local, organisationnel ou pedagogiquement delegue."
    >
      <template #actions>
        <RouterLink class="module-quick-access__pill module-quick-access__pill--action" to="/app/finances">
          <ArrowLeft />
          <span>Retour finances</span>
        </RouterLink>
      </template>
    </PageHeader>

    <SectionBlock
      title="Cadre analytique visible"
      description="La lecture des fonds anticipes reste strictement bornee au perimetre reel de l'acteur et aux eleves visibles de ce perimetre."
    >
      <div class="finance-hero-strip">
        <div class="finance-hero-strip__lead">
          <div class="finance-hero-strip__icon">
            <PiggyBank />
          </div>
          <div>
            <p class="finance-hero-strip__label">Acteur visible</p>
            <strong>{{ session.actorLabel }}</strong>
          </div>
        </div>
        <div class="module-home-grid">
          <PermissionTag :label="session.actorLabel" />
          <ContextBadge label="Organisation" :value="context.organizationName" />
          <ContextBadge label="Ecole" :value="context.schoolName" />
          <ContextBadge label="Fonds disponibles" :value="formatCurrency(model.totalDisponible)" />
        </div>
      </div>
      <div class="finance-info-banner">
        <ShieldCheck />
        <p class="finance-form-note">
          {{ perimeterMessage }}
        </p>
      </div>
    </SectionBlock>

    <AccessBoundary capability="module.finances.access">
      <template v-if="uiState === 'loading'">
        <LoadingState
          title="Chargement des fonds anticipes"
          message="Preparation de la liste des eleves et des montants disponibles dans le bon perimetre."
        />
      </template>

      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Lecture non autorisee"
          message="Cette vue est reservee aux lecteurs financiers ou delegues officiellement dans leur perimetre."
        />

        <SectionBlock
          title="Filtres pedagogiques et financiers"
          description="Le jeu de donnees peut etre restreint sans sortir du perimetre de l'acteur courant."
        >
          <div class="finance-form-stack">
            <div class="finance-filter-grid finance-filter-grid--wide">
              <label class="finance-field">
                <span>Section</span>
                <select v-model="selectedSection">
                  <option value="">Toutes les sections</option>
                  <option v-for="section in availableSections" :key="section" :value="section">
                    {{ section }}
                  </option>
                </select>
              </label>

              <label class="finance-field">
                <span>Classe</span>
                <input v-model="selectedClasse" type="text" />
              </label>

              <label class="finance-field">
                <span>Source dominante</span>
                <select v-model="selectedSource">
                  <option value="">Toutes les sources</option>
                  <option value="ANTICIPE">ANTICIPE</option>
                  <option value="LISSAGE">LISSAGE</option>
                </select>
              </label>
            </div>

            <div class="finance-guard-panel">
              <div class="finance-guard-panel__header">
                <ShieldCheck />
                <strong>Regles visibles</strong>
              </div>
              <ul>
                <li>Les acteurs pedagogiques delegues ne voient que les eleves de leur perimetre effectif.</li>
                <li>Le total expose est reconstruit depuis `ANTICIPE` et `LISSAGE`.</li>
                <li>Aucune lecture hors classe ou hors section ne doit etre ouverte aux delegues pedagogiques.</li>
              </ul>
            </div>
          </div>
        </SectionBlock>

        <div class="finance-kpi-grid finance-kpi-grid--detail">
          <div class="finance-kpi-card">
            <small>Total disponible</small>
            <strong>{{ formatCurrency(filteredTotal) }}</strong>
            <span>Montants anticipes visibles</span>
          </div>
          <div class="finance-kpi-card">
            <small>Eleves</small>
            <strong>{{ filteredRows.length }}</strong>
            <span>Eleves porteurs de fonds anticipes</span>
          </div>
          <div class="finance-kpi-card">
            <small>Lignes</small>
            <strong>{{ model.totalLignes }}</strong>
            <span>Vue analytique courante</span>
          </div>
        </div>

        <SectionBlock
          title="Tableau des eleves"
          description="Lecture centrale des fonds disponibles par eleve, avec detail rapide."
        >
          <EmptyState
            v-if="filteredRows.length === 0"
            title="Aucun fonds anticipe"
            message="Aucune ligne ne correspond aux filtres courants."
          />

          <div v-else class="finance-table-shell">
            <table class="finance-table">
              <thead>
                <tr>
                  <th>Eleve</th>
                  <th>Code</th>
                  <th>Classe</th>
                  <th>Section</th>
                  <th>Fonds disponibles</th>
                  <th>Source dominante</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in filteredRows" :key="row.id">
                  <td>{{ row.eleve }}</td>
                  <td>{{ row.matricule }}</td>
                  <td>{{ row.classe }}</td>
                  <td>{{ row.section }}</td>
                  <td>{{ formatCurrency(row.fondsDisponible) }}</td>
                  <td>
                    <span class="finance-status-badge" :class="row.sourceDominante === 'ANTICIPE' ? 'finance-status-badge--success' : 'finance-status-badge--warning'">
                      {{ row.sourceDominante }}
                    </span>
                  </td>
                  <td>
                    <button class="finance-link-action" type="button" @click="selectedRowId = row.id">
                      Ouvrir detail
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="selectedRow" class="finance-status-strip finance-status-strip--neutral">
            <PiggyBank />
            <div>
              <strong>Detail eleve</strong>
              <p>
                {{ selectedRow.eleve }} · {{ selectedRow.classe }} ·
                {{ formatCurrency(selectedRow.fondsDisponible) }} disponibles · source
                {{ selectedRow.sourceDominante }}.
              </p>
            </div>
          </div>
        </SectionBlock>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft, PiggyBank, ShieldCheck } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import ContextBadge from '../../../shared/ui/ContextBadge.vue';
import PermissionTag from '../../../shared/ui/PermissionTag.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { sessionStore } from '../../../shared/auth/session.store';
import {
  anticipatedFundsViewModel,
  authorizedAnticipatedFundsActors,
} from '../data/fonds-anticipes.demo';

const context = activeContextStore.state;
const session = sessionStore.state;
const model = ref({ ...anticipatedFundsViewModel });
const uiState = ref<'loading' | 'idle' | 'technical-error'>('idle');
const selectedSection = ref('');
const selectedClasse = ref('');
const selectedSource = ref('');
const selectedRowId = ref('');

const isAuthorized = computed(() =>
  authorizedAnticipatedFundsActors.includes(session.actorCode as never),
);

const perimeterMessage = computed(() => {
  switch (session.actorCode) {
    case 'GESTIONNAIRE_ORGANISATION':
    case 'PROMOTEUR_ORGANISATION':
      return `Lecture bornee a l organisation active: ${context.organizationName}.`;
    case 'TITULAIRE':
      return 'Lecture bornee a la classe titulaire effective si la delegation ecole est active.';
    case 'PREFET_ETUDES':
    case 'DIRECTEUR_ETUDES':
    case 'DIRECTEUR_PRIMAIRE':
    case 'DIRECTEUR_MATERNELLE':
      return 'Lecture bornee a la section de delegation et aux eleves visibles de ce perimetre.';
    case 'CAISSIER':
    case 'ADMINISTRATEUR_ECOLE':
      return `Lecture bornee a l ecole active: ${context.schoolName}.`;
    default:
      return `Session visible: ${session.actorLabel}. Cette vue n est pas ouverte a cet acteur.`;
  }
});

const availableSections = computed(() => [...new Set(model.value.rows.map((row) => row.section))]);

const filteredRows = computed(() =>
  model.value.rows.filter((row) => {
    const matchesSection = selectedSection.value === '' || row.section === selectedSection.value;
    const matchesClasse =
      selectedClasse.value.trim() === '' ||
      row.classe.toLowerCase().includes(selectedClasse.value.trim().toLowerCase());
    const matchesSource = selectedSource.value === '' || row.sourceDominante === selectedSource.value;
    return matchesSection && matchesClasse && matchesSource;
  }),
);

const filteredTotal = computed(() =>
  filteredRows.value.reduce((sum, row) => sum + row.fondsDisponible, 0),
);

const selectedRow = computed(() => filteredRows.value.find((row) => row.id === selectedRowId.value) ?? null);

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value) + ' FC';
}
</script>
