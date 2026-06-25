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
          <ContextBadge label="Periode" :value="analytics.periodeLabel" />
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

      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Analyse non autorisee"
          message="Cette vue analytique est reservee aux lecteurs financiers ou delegues officiellement dans leur perimetre."
        />

        <div class="finance-kpi-grid finance-kpi-grid--detail">
          <div class="finance-kpi-card">
            <small>Total encaisse</small>
            <strong>{{ formatCurrency(analytics.totalEncaisse) }}</strong>
            <span>Sur la periode visible</span>
          </div>
          <div class="finance-kpi-card">
            <small>Operations</small>
            <strong>{{ filteredRows.length }}</strong>
            <span>{{ analytics.totalOperations }} operations au total</span>
          </div>
          <div class="finance-kpi-card">
            <small>Types actifs</small>
            <strong>{{ analytics.typesActifs }}</strong>
            <span>Lecture agrégée par type de frais</span>
          </div>
        </div>

        <SectionBlock
          title="Filtres analytiques"
          description="La lecture peut etre comparee par type, niveau de recouvrement et perimetre visible."
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
                <span>Tranche de taux</span>
                <select v-model="selectedRecoveryBand">
                  <option value="">Toutes les tranches</option>
                  <option value="HIGH">Taux >= 80%</option>
                  <option value="MEDIUM">Taux 60% - 79%</option>
                  <option value="LOW">Taux < 60%</option>
                </select>
              </label>

              <label class="finance-field">
                <span>Perimetre</span>
                <select v-model="selectedScope">
                  <option value="">Tous les perimetres</option>
                  <option v-for="scope in availableScopes" :key="scope" :value="scope">
                    {{ scope }}
                  </option>
                </select>
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
          description="Lecture dense des montants, volumes et taux de recouvrement par type de frais."
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
                  <th>Effectif</th>
                  <th>Operations</th>
                  <th>Montant total</th>
                  <th>Moyenne</th>
                  <th>Taux</th>
                  <th>Perimetre</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in filteredRows" :key="row.id">
                  <td>{{ row.typeFrais }}</td>
                  <td>{{ row.effectif }}</td>
                  <td>{{ row.operations }}</td>
                  <td>{{ formatCurrency(row.montantTotal) }}</td>
                  <td>{{ formatCurrency(row.moyennePaiement) }}</td>
                  <td>
                    <span class="finance-status-badge" :class="recoveryClass(row.tauxRecouvrement)">
                      {{ row.tauxRecouvrement }}%
                    </span>
                  </td>
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
                {{ selectedRow.typeFrais }} · {{ selectedRow.operations }} operations ·
                {{ formatCurrency(selectedRow.montantTotal) }} encaisses · taux
                {{ selectedRow.tauxRecouvrement }}%.
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
  paymentTypeAnalyticsViewModel,
} from '../data/analyse-paiements-type-frais.demo';

const context = activeContextStore.state;
const session = sessionStore.state;
const analytics = ref({ ...paymentTypeAnalyticsViewModel });
const uiState = ref<'loading' | 'idle' | 'technical-error'>('idle');
const selectedType = ref('');
const selectedRecoveryBand = ref('');
const selectedScope = ref('');
const selectedRowId = ref('');

const isAuthorized = computed(() =>
  authorizedPaymentAnalyticsActors.includes(session.actorCode as never),
);

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

const availableTypes = computed(() => [...new Set(analytics.value.rows.map((row) => row.typeFrais))]);
const availableScopes = computed(() => [...new Set(analytics.value.rows.map((row) => row.perimetre))]);

const filteredRows = computed(() =>
  analytics.value.rows.filter((row) => {
    const matchesType = selectedType.value === '' || row.typeFrais === selectedType.value;
    const matchesScope = selectedScope.value === '' || row.perimetre === selectedScope.value;
    const matchesBand =
      selectedRecoveryBand.value === '' ||
      (selectedRecoveryBand.value === 'HIGH' && row.tauxRecouvrement >= 80) ||
      (selectedRecoveryBand.value === 'MEDIUM' && row.tauxRecouvrement >= 60 && row.tauxRecouvrement < 80) ||
      (selectedRecoveryBand.value === 'LOW' && row.tauxRecouvrement < 60);
    return matchesType && matchesScope && matchesBand;
  }),
);

const selectedRow = computed(() => filteredRows.value.find((row) => row.id === selectedRowId.value) ?? null);

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value) + ' FC';
}

function recoveryClass(rate: number): string {
  if (rate >= 80) {
    return 'finance-status-badge--success';
  }

  if (rate >= 60) {
    return 'finance-status-badge--warning';
  }

  return 'finance-status-badge--error';
}

function selectRow(rowId: string): void {
  selectedRowId.value = rowId;
}
</script>
