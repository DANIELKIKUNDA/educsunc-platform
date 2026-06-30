<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-PF-008"
      title="Analyse paiements par type de frais"
      description="Vue d'analyse pour lire les paiements agreges par type de frais dans le bon perimetre, sans diluer la logique metier."
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
      description="L'analyse reste bornee au bon perimetre et ne devient jamais une lecture globale hors doctrine de delegation."
    >
      <div class="finance-hero-strip">
        <div class="finance-hero-strip__lead">
          <div class="finance-hero-strip__icon">
            <ChartNoAxesCombined />
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
          <ContextBadge label="Periode" :value="analytics?.periodeLabel ?? 'A connecter'" />
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
          title="Chargement de l'analyse"
          message="Preparation des aggregations par type de frais et des filtres analytiques."
        />
      </template>

      <template v-else-if="uiState === 'technical-error'">
        <ErrorState
          title="Analyse technique indisponible"
          :message="technicalErrorMessage"
        />
      </template>

      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Analyse non autorisee"
          message="Cette vue analytique est reservee aux lecteurs financiers ou delegues officiellement dans leur perimetre."
        />

        <template v-else-if="analytics">
          <div class="finance-kpi-grid finance-kpi-grid--detail">
            <div class="finance-kpi-card">
              <small>Total encaisse</small>
              <strong>{{ formatCurrency(analytics.totalEncaisse) }}</strong>
              <span>Somme reelle des types exposes</span>
            </div>
            <div class="finance-kpi-card">
              <small>Types actifs</small>
              <strong>{{ analytics.typesActifs }}</strong>
              <span>Types de frais remontes par le backend</span>
            </div>
            <div class="finance-kpi-card">
              <small>Lignes visibles</small>
              <strong>{{ filteredRows.length }}</strong>
              <span>Jeu de donnees reel apres filtre</span>
            </div>
          </div>

          <SectionBlock
            title="Filtres analytiques"
            description="La lecture peut etre restreinte par type de frais et par fenetre de dates reelle."
          >
            <div class="finance-form-stack">
              <div class="finance-filter-grid">
                <label class="finance-field">
                  <span>Type de frais</span>
                  <select v-model="selectedType">
                    <option value="">Tous les types</option>
                    <option v-for="type in availableTypes" :key="type" :value="type">
                      {{ type }}
                    </option>
                  </select>
                </label>

                <label class="finance-field">
                  <span>Date debut</span>
                  <input v-model="dateDebutInput" type="date" />
                </label>

                <label class="finance-field">
                  <span>Date fin</span>
                  <input v-model="dateFinInput" type="date" />
                </label>
              </div>

              <div class="finance-guard-panel">
                <div class="finance-guard-panel__header">
                  <ShieldCheck />
                  <strong>Regles visibles</strong>
                </div>
                <ul>
                  <li>Les acteurs locaux restent limites a leur ecole.</li>
                  <li>Les acteurs organisationnels restent limites a leur organisation.</li>
                  <li>Les delegues pedagogiques restent bornes par classe titulaire ou section selon leur role.</li>
                </ul>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock
            title="Tableau comparatif"
            description="Lecture dense des montants reels agreges par type de frais."
          >
            <EmptyState
              v-if="filteredRows.length === 0"
              title="Aucun resultat"
              message="Aucune ligne ne correspond aux filtres analytiques courants."
            />

            <div v-else class="finance-table-shell">
              <table class="finance-table">
                <thead>
                  <tr>
                    <th>Type de frais</th>
                    <th>Montant total</th>
                    <th>Perimetre</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in filteredRows" :key="row.id">
                    <td>{{ row.typeFrais }}</td>
                    <td>{{ formatCurrency(row.montantTotal) }}</td>
                    <td>{{ row.perimetre }}</td>
                    <td>
                      <button class="finance-link-action" type="button" @click="selectRow(row.id)">
                        Ouvrir detail
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="selectedRow" class="finance-status-strip finance-status-strip--neutral">
              <ChartNoAxesCombined />
              <div>
                <strong>Detail analytique</strong>
                <p>
                  {{ selectedRow.typeFrais }} | {{ formatCurrency(selectedRow.montantTotal) }}
                  encaisses | perimetre {{ selectedRow.perimetre }}.
                </p>
              </div>
            </div>
          </SectionBlock>
        </template>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft, ChartNoAxesCombined, ShieldCheck } from 'lucide-vue-next';
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
  authorizedPaymentAnalyticsActors,
} from '../models/payment-type-analytics.model';
import { usePaymentTypeAnalyticsStore } from '../stores/payment-type-analytics.store';

const context = activeContextStore.state;
const session = sessionStore.state;
const analyticsStore = usePaymentTypeAnalyticsStore();
const selectedType = ref('');
const selectedRowId = ref('');
const dateDebutInput = ref('');
const dateFinInput = ref('');

const isAuthorized = computed(() =>
  authorizedPaymentAnalyticsActors.includes(session.actorCode as never),
);
const analytics = computed(() => analyticsStore.state.analytics);
const technicalErrorMessage = computed(() =>
  analyticsStore.state.errorMessage
  ?? 'Le backend n a pas pu restituer les paiements par type de frais.',
);
const uiState = computed<'loading' | 'idle' | 'technical-error'>(() => {
  if (analyticsStore.state.status === 'loading') {
    return 'loading';
  }

  if (analyticsStore.state.status === 'error') {
    return 'technical-error';
  }

  return 'idle';
});

const perimeterMessage = computed(() => {
  switch (session.actorCode) {
    case 'GESTIONNAIRE_ORGANISATION':
    case 'PROMOTEUR_ORGANISATION':
      return `Analyse bornee a l organisation active: ${context.organizationName}.`;
    case 'TITULAIRE':
      return 'Analyse bornee a la classe titulaire effective si la delegation ecole est active.';
    case 'PREFET_ETUDES':
    case 'DIRECTEUR_ETUDES':
    case 'DIRECTEUR_PRIMAIRE':
    case 'DIRECTEUR_MATERNELLE':
      return 'Analyse bornee a la section de delegation et au parametrage local de l ecole.';
    case 'CAISSIER':
    case 'ADMINISTRATEUR_ECOLE':
      return `Analyse bornee a l ecole active: ${context.schoolName}.`;
    default:
      return `Session visible: ${session.actorLabel}. Cette vue analytique n est pas ouverte a cet acteur.`;
  }
});

const perimetreLabel = computed(() => {
  switch (session.actorCode) {
    case 'GESTIONNAIRE_ORGANISATION':
    case 'PROMOTEUR_ORGANISATION':
      return 'Organisation active';
    case 'TITULAIRE':
      return 'Classe titulaire';
    case 'PREFET_ETUDES':
    case 'DIRECTEUR_ETUDES':
    case 'DIRECTEUR_PRIMAIRE':
    case 'DIRECTEUR_MATERNELLE':
      return 'Section deleguee';
    default:
      return 'Ecole active';
  }
});

const availableTypes = computed(() => [...new Set((analytics.value?.rows ?? []).map((row) => row.typeFrais))]);

const filteredRows = computed(() =>
  (analytics.value?.rows ?? []).filter((row) =>
    selectedType.value === '' || row.typeFrais === selectedType.value),
);

const selectedRow = computed(() => filteredRows.value.find((row) => row.id === selectedRowId.value) ?? null);

function formatCurrency(value: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(value)} FC`;
}

function selectRow(rowId: string): void {
  selectedRowId.value = rowId;
}

watch(
  () => [dateDebutInput.value, dateFinInput.value, isAuthorized.value],
  async () => {
    selectedRowId.value = '';

    if (!isAuthorized.value) {
      analyticsStore.reinitialiser();
      return;
    }

    await analyticsStore.charger(
      {
        dateDebut: dateDebutInput.value.trim() || undefined,
        dateFin: dateFinInput.value.trim() || undefined,
      },
      perimetreLabel.value,
    );
  },
  { immediate: true },
);
</script>
