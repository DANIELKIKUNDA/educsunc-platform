<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-PF-011"
      title="Rapport financier journalier"
      description="Lecture synthetique des encaissements journaliers dans le bon perimetre local ou organisationnel."
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
      description="Le rapport journalier reste un ecran de lecture. Aucune mutation de caisse ne doit partir d'ici."
    >
      <div class="finance-hero-strip">
        <div class="finance-hero-strip__lead">
          <div class="finance-hero-strip__icon">
            <CalendarRange />
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
          <ContextBadge label="Date" :value="selectedDate" />
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
          title="Chargement du rapport journalier"
          message="Preparation de la synthese journaliere reelle pour la date choisie."
        />
      </template>

      <template v-else-if="uiState === 'technical-error'">
        <ErrorState
          title="Rapport technique indisponible"
          :message="technicalErrorMessage"
        />
      </template>

      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Rapport non autorise"
          message="Cette vue de rapport est reservee aux lecteurs financiers autorises dans leur perimetre."
        />

        <template v-else-if="report">
          <SectionBlock
            title="Filtres journaliers"
            description="La date pilote le rapport. Les totaux restent purement consultatifs."
          >
            <div class="finance-form-stack">
              <div class="finance-filter-grid finance-filter-grid--wide">
                <label class="finance-field">
                  <span>Date</span>
                  <input v-model="selectedDate" type="date" />
                </label>
              </div>

              <div class="finance-guard-panel">
                <div class="finance-guard-panel__header">
                  <ShieldCheck />
                  <strong>Regles visibles</strong>
                </div>
                <ul>
                  <li>`CAISSIER` et `ADMINISTRATEUR_ECOLE` lisent dans la meme ecole.</li>
                  <li>`GESTIONNAIRE_ORGANISATION` et `PROMOTEUR_ORGANISATION` lisent dans la meme organisation.</li>
                  <li>Aucune mutation de caisse ne part de cet ecran de rapport.</li>
                </ul>
              </div>
            </div>
          </SectionBlock>

          <div class="finance-kpi-grid finance-kpi-grid--detail">
            <div class="finance-kpi-card">
              <small>Total encaisse</small>
              <strong>{{ formatCurrency(report.totalEncaisse) }}</strong>
              <span>Encaissements journaliers reels</span>
            </div>
            <div class="finance-kpi-card">
              <small>Total consomme</small>
              <strong>{{ formatCurrency(report.totalConsomme) }}</strong>
              <span>Encaissement net apres annulations et restitutions</span>
            </div>
            <div class="finance-kpi-card">
              <small>Total restitue</small>
              <strong>{{ formatCurrency(report.totalRestitue) }}</strong>
              <span>Restitutions du jour</span>
            </div>
            <div class="finance-kpi-card">
              <small>Total annule</small>
              <strong>{{ formatCurrency(report.totalAnnule) }}</strong>
              <span>Annulations relues sur la caisse du jour</span>
            </div>
          </div>

          <SectionBlock
            title="Synthese journaliere"
            description="Le backend actuel expose une synthese consolidee de la journee, sans repartitions secondaires par canal ou type."
          >
            <div class="finance-list-card">
              <div class="finance-list-card__row">
                <div>
                  <strong>Periode</strong>
                  <small>Date effectivement lue par le backend</small>
                </div>
                <strong>{{ report.dateLabel }}</strong>
              </div>
              <div class="finance-list-card__row">
                <div>
                  <strong>Total anticipe</strong>
                  <small>Valeur exposee par le backend journalier courant</small>
                </div>
                <strong>{{ formatCurrency(report.totalAnticipe) }}</strong>
              </div>
              <div class="finance-list-card__row">
                <div>
                  <strong>Net journalier</strong>
                  <small>Total consomme utilisable apres corrections du jour</small>
                </div>
                <strong>{{ formatCurrency(report.totalConsomme) }}</strong>
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
import { ArrowLeft, CalendarRange, ShieldCheck } from 'lucide-vue-next';
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
  authorizedDailyFinancialReportActors,
} from '../models/daily-financial-report.model';
import { useDailyFinancialReportStore } from '../stores/daily-financial-report.store';

const context = activeContextStore.state;
const session = sessionStore.state;
const reportStore = useDailyFinancialReportStore();
const selectedDate = ref(new Date().toISOString().slice(0, 10));

const isAuthorized = computed(() =>
  authorizedDailyFinancialReportActors.includes(session.actorCode as never),
);
const report = computed(() => reportStore.state.report);
const technicalErrorMessage = computed(() =>
  reportStore.state.errorMessage
  ?? 'Le backend n a pas pu restituer le rapport financier journalier.',
);
const uiState = computed<'loading' | 'idle' | 'technical-error'>(() => {
  if (reportStore.state.status === 'loading') {
    return 'loading';
  }

  if (reportStore.state.status === 'error') {
    return 'technical-error';
  }

  return 'idle';
});

const perimeterMessage = computed(() => {
  switch (session.actorCode) {
    case 'GESTIONNAIRE_ORGANISATION':
    case 'PROMOTEUR_ORGANISATION':
      return `Rapport borne a l organisation active: ${context.organizationName}.`;
    case 'CAISSIER':
    case 'ADMINISTRATEUR_ECOLE':
      return `Rapport borne a l ecole active: ${context.schoolName}.`;
    default:
      return `Session visible: ${session.actorLabel}. Cette vue rapport n est pas ouverte a cet acteur.`;
  }
});

function formatCurrency(value: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(value)} FC`;
}

watch(
  () => [selectedDate.value, isAuthorized.value],
  async () => {
    if (!isAuthorized.value) {
      reportStore.reinitialiser();
      return;
    }

    await reportStore.charger(selectedDate.value);
  },
  { immediate: true },
);
</script>
