<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-AUD-002"
      title="Audit organisationnel"
      description="Supervision consolidée des signaux d audit sur les écoles de l organisation active."
    >
      <template #actions>
        <div class="audit-actions">
          <RouterLink class="audit-pill" to="/app/audit">
            <ArrowLeft />
            <span>Retour audit</span>
          </RouterLink>
          <button class="audit-secondary-action" type="button" :disabled="allRows.length === 0" @click="exporterCsv">
            <Sheet />
            <span>CSV</span>
          </button>
          <button class="audit-primary-action" type="button" @click="imprimerPage">
            <Printer />
            <span>Imprimer</span>
          </button>
        </div>
      </template>
    </PageHeader>

    <SectionBlock title="Périmètre organisationnel" description="Aucune bascule vers l audit plateforme n est accordée depuis cet écran.">
      <div class="audit-hero-strip">
        <div class="audit-hero-strip__lead">
          <div class="audit-hero-strip__icon"><ShieldCheck /></div>
          <div>
            <p class="audit-hero-strip__label">Acteur attendu</p>
            <strong>{{ session.actorLabel }}</strong>
          </div>
        </div>
        <div class="audit-context-grid">
          <PermissionTag :label="session.actorLabel" />
          <ContextBadge label="Organisation" :value="context.organizationName" />
          <ContextBadge label="École active" :value="context.schoolName" />
          <ContextBadge label="Anomalies" :value="String(store.state.anomalies.length)" />
        </div>
      </div>
      <div class="audit-info-banner">
        <ShieldCheck />
        <p>La lecture est réservée à PROMOTEUR_ORGANISATION et GESTIONNAIRE_ORGANISATION dans l organisation courante, via audit.analytics.read ou audit.security.read selon le flux lu.</p>
      </div>
    </SectionBlock>

    <AccessBoundary capability="module.audit.access">
      <template v-if="uiState === 'loading'">
        <LoadingState title="Chargement audit organisationnel" message="Lecture des analytics, anomalies, accès et volumétrie en cours." />
      </template>
      <template v-else-if="uiState === 'error'">
        <ErrorState title="Supervision indisponible" :message="technicalErrorMessage" />
      </template>
      <template v-else>
        <ErrorState
          v-if="!isAuthorized"
          title="Lecture non autorisée"
          message="Cette vue est réservée au promoteur et au gestionnaire organisation."
        />
        <template v-else>
          <SectionBlock title="Filtres organisation" description="Filtres réellement supportés par les endpoints analytics et security d audit.">
            <div class="audit-filter-grid">
              <label class="audit-field">
                <span>Période</span>
                <input v-model="periodeInput" type="text" placeholder="30j" />
              </label>
              <label class="audit-field">
                <span>École cible</span>
                <input v-model="ecoleIdInput" type="text" placeholder="uuid-ecole" />
              </label>
              <label class="audit-field">
                <span>Type audit principal</span>
                <input v-model="typeAuditInput" type="text" placeholder="FINANCIER" />
              </label>
              <label class="audit-field">
                <span>Métrique</span>
                <input v-model="metriqueInput" type="text" placeholder="access.refus" />
              </label>
              <label class="audit-field">
                <span>Correlation Id</span>
                <input v-model="correlationIdInput" type="text" placeholder="corr-..." />
              </label>
            </div>
            <div class="audit-actions-row">
              <button class="audit-primary-action" type="button" @click="charger">Actualiser</button>
              <button class="audit-secondary-action" type="button" @click="reinitialiserFiltres">Réinitialiser</button>
            </div>
          </SectionBlock>

          <div class="audit-kpi-grid">
            <div v-for="card in store.state.analyticsCards" :key="card.label" class="audit-kpi-card">
              <small>{{ card.label }}</small>
              <strong>{{ card.value }}</strong>
              <span>{{ card.helper }}</span>
            </div>
            <div v-if="store.state.analyticsCards.length === 0" class="audit-kpi-card">
              <small>Analytics</small>
              <strong>0</strong>
              <span>Aucun compteur backend remonté</span>
            </div>
          </div>

          <SectionBlock title="Synthèse multi-vues" description="Les onglets suivent les familles réellement exposées par le backend audit organisationnel.">
            <div class="audit-tabs">
              <button class="audit-tab" :class="{ 'audit-tab--active': activeTab === 'analytics' }" type="button" @click="activeTab = 'analytics'">Analytics</button>
              <button class="audit-tab" :class="{ 'audit-tab--active': activeTab === 'tenants' }" type="button" @click="activeTab = 'tenants'">Écoles</button>
              <button class="audit-tab" :class="{ 'audit-tab--active': activeTab === 'anomalies' }" type="button" @click="activeTab = 'anomalies'">Anomalies</button>
              <button class="audit-tab" :class="{ 'audit-tab--active': activeTab === 'access' }" type="button" @click="activeTab = 'access'">Accès</button>
            </div>
          </SectionBlock>

          <SectionBlock :title="activeTitle" :description="activeDescription">
            <div class="audit-kpi-grid" v-if="activeTab === 'analytics' && store.state.monitoring.length > 0">
              <div v-for="metric in store.state.monitoring" :key="`${metric.label}-${metric.value}`" class="audit-kpi-card">
                <small>{{ metric.label }}</small>
                <strong>{{ metric.value }}</strong>
                <span>{{ metric.helper }}</span>
              </div>
            </div>
            <EmptyState v-if="activeRows.length === 0" title="Aucune donnée" message="Le backend n a remonté aucune ligne pour la vue organisationnelle courante." />
            <div v-else class="audit-table-shell">
              <table class="audit-table">
                <thead>
                  <tr>
                    <th v-for="header in activeHeaders" :key="header">{{ header }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in activeRows" :key="row.id">
                    <td v-for="header in activeHeaders" :key="`${row.id}-${header}`">{{ row.columns[header] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionBlock>
        </template>
      </template>
    </AccessBoundary>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft, Printer, Sheet, ShieldCheck } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import AccessBoundary from '../../../shared/permissions/AccessBoundary.vue';
import ContextBadge from '../../../shared/ui/ContextBadge.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import PermissionTag from '../../../shared/ui/PermissionTag.vue';
import { sessionStore } from '../../../shared/auth/session.store';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { authorizedOrganizationAuditActors, serializeAuditTableRows } from '../models/audit.model';
import { useOrganizationAuditStore } from '../stores/organization-audit.store';

const session = sessionStore.state;
const context = activeContextStore.state;
const store = useOrganizationAuditStore();
const activeTab = ref<'analytics' | 'tenants' | 'anomalies' | 'access'>('analytics');
const periodeInput = ref('30j');
const ecoleIdInput = ref('');
const typeAuditInput = ref('');
const metriqueInput = ref('');
const correlationIdInput = ref('');

const isAuthorized = computed(() =>
  authorizedOrganizationAuditActors.includes(session.actorCode as never),
);
const uiState = computed(() => store.state.status);
const technicalErrorMessage = computed(() =>
  store.state.errorMessage ?? 'La supervision organisationnelle d audit a échoué.',
);
const activeRows = computed(() => {
  switch (activeTab.value) {
    case 'tenants':
      return store.state.tenantsRows;
    case 'anomalies':
      return store.state.anomalies;
    case 'access':
      return store.state.access;
    default:
      return store.state.analyticsRows;
  }
});
const activeHeaders = computed(() => Object.keys(activeRows.value[0]?.columns ?? {}));
const activeTitle = computed(() => {
  switch (activeTab.value) {
    case 'tenants':
      return 'Synthèse par école';
    case 'anomalies':
      return 'Anomalies organisationnelles';
    case 'access':
      return 'Événements de sécurité et accès';
    default:
      return 'Analytics audit';
  }
});
const activeDescription = computed(() => {
  switch (activeTab.value) {
    case 'tenants':
      return 'Comparaison consolidée des écoles de l organisation active.';
    case 'anomalies':
      return 'Anomalies et signaux organisationnels remontés par les endpoints security.';
    case 'access':
      return 'Lecture organisationnelle des accès et refus observés.';
    default:
      return 'Agrégats d audit organisationnel et compteurs backend.';
  }
});
const allRows = computed(() => [
  ...store.state.analyticsRows,
  ...store.state.tenantsRows,
  ...store.state.anomalies,
  ...store.state.access,
]);

async function charger(): Promise<void> {
  if (!isAuthorized.value) {
    store.reinitialiser();
    return;
  }

  await store.charger(
    {
      periode: periodeInput.value.trim() || undefined,
      ecoleId: ecoleIdInput.value.trim() || undefined,
      typeAuditPrincipal: typeAuditInput.value.trim() || undefined,
    },
    {
      periode: periodeInput.value.trim() || undefined,
      metrique: metriqueInput.value.trim() || undefined,
      correlationId: correlationIdInput.value.trim() || undefined,
    },
  );
}

function reinitialiserFiltres(): void {
  periodeInput.value = '30j';
  ecoleIdInput.value = '';
  typeAuditInput.value = '';
  metriqueInput.value = '';
  correlationIdInput.value = '';
}

function exporterCsv(): void {
  const csv = serializeAuditTableRows(allRows.value);
  if (!csv) {
    return;
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'audit-organisation.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

function imprimerPage(): void {
  window.print();
}

void charger();
</script>

<style scoped src="../../../styles/shell-audit.css"></style>
