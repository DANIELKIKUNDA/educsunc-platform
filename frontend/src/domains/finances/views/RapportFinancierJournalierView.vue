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
          message="Preparation de la synthese journaliere et des regroupements utiles."
        />
      </template>

      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Rapport non autorise"
          message="Cette vue de rapport est reservee aux lecteurs financiers autorises dans leur perimetre."
        />

        <SectionBlock
          title="Filtres journaliers"
          description="La date pilote le rapport. Les regroupements restent purement consultatifs."
        >
          <div class="finance-form-stack">
            <div class="finance-filter-grid finance-filter-grid--wide">
              <label class="finance-field">
                <span>Date</span>
                <input v-model="selectedDate" type="date" />
              </label>

              <label class="finance-field">
                <span>Regroupement visible</span>
                <select v-model="selectedGrouping">
                  <option value="TYPE">Par type de frais</option>
                  <option value="CANAL">Par canal</option>
                </select>
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
            <small>Total du jour</small>
            <strong>{{ formatCurrency(report.totalJour) }}</strong>
            <span>Encaissements visibles sur la date</span>
          </div>
          <div class="finance-kpi-card">
            <small>Operations</small>
            <strong>{{ report.nombreOperations }}</strong>
            <span>Volume journalier</span>
          </div>
          <div class="finance-kpi-card">
            <small>Panier moyen</small>
            <strong>{{ formatCurrency(report.panierMoyen) }}</strong>
            <span>Moyenne par operation</span>
          </div>
        </div>

        <div class="finance-form-grid">
          <SectionBlock
            title="Repartitions"
            description="Lecture rapide des regroupements journaliers utiles."
          >
            <div class="finance-list-card">
              <div
                v-for="row in currentRows"
                :key="row.id"
                class="finance-list-card__row"
              >
                <div>
                  <strong>{{ row.regroupement }}</strong>
                  <small>{{ row.operations }} operations · {{ row.part }}%</small>
                </div>
                <strong>{{ formatCurrency(row.montant) }}</strong>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock
            title="Tableau resume"
            description="Le tableau garde la vue comparative principale sur la date choisie."
          >
            <div class="finance-table-shell">
              <table class="finance-table">
                <thead>
                  <tr>
                    <th>Regroupement</th>
                    <th>Operations</th>
                    <th>Montant</th>
                    <th>Part</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in currentRows" :key="row.id">
                    <td>{{ row.regroupement }}</td>
                    <td>{{ row.operations }}</td>
                    <td>{{ formatCurrency(row.montant) }}</td>
                    <td>
                      <span class="finance-status-badge" :class="repartitionClass(row.part)">
                        {{ row.part }}%
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
              <CalendarRange />
              <div>
                <strong>Detail regroupement</strong>
                <p>
                  {{ selectedRow.regroupement }} · {{ selectedRow.operations }} operations ·
                  {{ formatCurrency(selectedRow.montant) }} · part {{ selectedRow.part }}%.
                </p>
              </div>
            </div>
          </SectionBlock>
        </div>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
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
  dailyFinancialReportViewModel,
} from '../data/rapport-financier-journalier.demo';

const context = activeContextStore.state;
const session = sessionStore.state;
const report = ref({ ...dailyFinancialReportViewModel });
const uiState = ref<'loading' | 'idle' | 'technical-error'>('idle');
const selectedDate = ref(report.value.dateLabel);
const selectedGrouping = ref<'TYPE' | 'CANAL'>('TYPE');
const selectedRowId = ref('');

const isAuthorized = computed(() =>
  authorizedDailyFinancialReportActors.includes(session.actorCode as never),
);

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

const currentRows = computed(() =>
  selectedGrouping.value === 'TYPE' ? report.value.rowsByType : report.value.rowsByChannel,
);

const selectedRow = computed(() => currentRows.value.find((row) => row.id === selectedRowId.value) ?? null);

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value) + ' FC';
}

function repartitionClass(part: number): string {
  if (part >= 35) {
    return 'finance-status-badge--success';
  }

  if (part >= 15) {
    return 'finance-status-badge--warning';
  }

  return 'finance-status-badge--error';
}
</script>
