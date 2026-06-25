<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-PF-012"
      title="Paiements par caissier"
      description="Vue analytique pour comparer les paiements regroupes par percepteur reel dans le bon perimetre."
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
      description="L'analyse par caissier doit rester fidele aux percepteurs reels et ne jamais exposer de faux signataires documentaires."
    >
      <div class="finance-hero-strip">
        <div class="finance-hero-strip__lead">
          <div class="finance-hero-strip__icon">
            <UsersRound />
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
          title="Chargement des paiements par caissier"
          message="Preparation des regroupements analytiques par percepteur reel."
        />
      </template>

      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Analyse non autorisee"
          message="Cette vue est reservee aux lecteurs financiers autorises dans leur perimetre."
        />

        <SectionBlock
          title="Filtres de periode"
          description="La lecture peut etre recadree par periode sans quitter le perimetre d'autorisation courant."
        >
          <div class="finance-form-stack">
            <div class="finance-filter-grid finance-filter-grid--wide">
              <label class="finance-field">
                <span>Date debut</span>
                <input v-model="dateDebut" type="date" />
              </label>

              <label class="finance-field">
                <span>Date fin</span>
                <input v-model="dateFin" type="date" />
              </label>
            </div>

            <div class="finance-guard-panel">
              <div class="finance-guard-panel__header">
                <ShieldCheck />
                <strong>Regles visibles</strong>
              </div>
              <ul>
                <li>Les lecteurs locaux restent limites a leur ecole.</li>
                <li>Les lecteurs organisationnels restent limites a leur organisation.</li>
                <li>Seuls les percepteurs reels apparaissent dans cette vue comparative.</li>
              </ul>
            </div>
          </div>
        </SectionBlock>

        <div class="finance-kpi-grid finance-kpi-grid--detail">
          <div class="finance-kpi-card">
            <small>Total encaisse</small>
            <strong>{{ formatCurrency(analytics.totalEncaisse) }}</strong>
            <span>Sur la periode visible</span>
          </div>
          <div class="finance-kpi-card">
            <small>Operations</small>
            <strong>{{ analytics.totalOperations }}</strong>
            <span>Volume total</span>
          </div>
          <div class="finance-kpi-card">
            <small>Percepteurs reels</small>
            <strong>{{ analytics.totalCaissiers }}</strong>
            <span>Acteurs compares</span>
          </div>
        </div>

        <SectionBlock
          title="Tableau comparatif"
          description="Comparaison directe des percepteurs reels sur les montants, volumes et moyennes."
        >
          <div class="finance-table-shell">
            <table class="finance-table">
              <thead>
                <tr>
                  <th>Caissier</th>
                  <th>Operations</th>
                  <th>Montant total</th>
                  <th>Moyenne</th>
                  <th>Mode dominant</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in analytics.rows" :key="row.id">
                  <td>{{ row.caissier }}</td>
                  <td>{{ row.operations }}</td>
                  <td>{{ formatCurrency(row.montantTotal) }}</td>
                  <td>{{ formatCurrency(row.moyenne) }}</td>
                  <td>{{ row.modeDominant }}</td>
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
            <UsersRound />
            <div>
              <strong>Detail percepteur</strong>
              <p>
                {{ selectedRow.caissier }} · {{ selectedRow.operations }} operations ·
                {{ formatCurrency(selectedRow.montantTotal) }} · mode dominant {{ selectedRow.modeDominant }}.
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
import { ArrowLeft, ShieldCheck, UsersRound } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import ContextBadge from '../../../shared/ui/ContextBadge.vue';
import PermissionTag from '../../../shared/ui/PermissionTag.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { sessionStore } from '../../../shared/auth/session.store';
import {
  authorizedCashierAnalyticsActors,
  cashierAnalyticsViewModel,
} from '../data/paiements-par-caissier.demo';

const context = activeContextStore.state;
const session = sessionStore.state;
const analytics = ref({ ...cashierAnalyticsViewModel });
const uiState = ref<'loading' | 'idle' | 'technical-error'>('idle');
const dateDebut = ref('2026-06-01');
const dateFin = ref('2026-06-30');
const selectedRowId = ref('');

const isAuthorized = computed(() =>
  authorizedCashierAnalyticsActors.includes(session.actorCode as never),
);

const perimeterMessage = computed(() => {
  switch (session.actorCode) {
    case 'GESTIONNAIRE_ORGANISATION':
    case 'PROMOTEUR_ORGANISATION':
      return `Analyse bornee a l organisation active: ${context.organizationName}.`;
    case 'CAISSIER':
    case 'ADMINISTRATEUR_ECOLE':
      return `Analyse bornee a l ecole active: ${context.schoolName}.`;
    default:
      return `Session visible: ${session.actorLabel}. Cette vue analytique n est pas ouverte a cet acteur.`;
  }
});

const selectedRow = computed(() => analytics.value.rows.find((row) => row.id === selectedRowId.value) ?? null);

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value) + ' FC';
}
</script>
