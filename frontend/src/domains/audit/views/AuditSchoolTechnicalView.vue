<template>
  <PageContainer>
    <PageHeader
      eyebrow="SCR-AUD-004"
      title="Audit technique école"
      description="Lecture locale des traces et métriques techniques de l école active, sans ouvrir le monitoring global."
    >
      <template #actions>
        <div class="audit-actions">
          <RouterLink class="audit-pill" to="/app/audit"><ArrowLeft /><span>Retour audit</span></RouterLink>
          <button class="audit-secondary-action" type="button" :disabled="store.state.traces.length === 0" @click="exporterCsv"><Sheet /><span>CSV</span></button>
          <button class="audit-primary-action" type="button" @click="imprimerPage"><Printer /><span>Imprimer</span></button>
        </div>
      </template>
    </PageHeader>

    <SectionBlock title="Technique locale" description="L écran reste réservé à ADMIN_SYSTEME_ECOLE et ne se substitue jamais au monitoring plateforme.">
      <div class="audit-hero-strip">
        <div class="audit-hero-strip__lead">
          <div class="audit-hero-strip__icon"><Cpu /></div>
          <div><p class="audit-hero-strip__label">Acteur attendu</p><strong>{{ session.actorLabel }}</strong></div>
        </div>
        <div class="audit-context-grid">
          <PermissionTag :label="session.actorLabel" />
          <ContextBadge label="École" :value="context.schoolName" />
          <ContextBadge label="Section" :value="context.sectionName" />
          <ContextBadge label="Traces" :value="String(store.state.traces.length)" />
        </div>
      </div>
      <div class="audit-info-banner">
        <ShieldCheck />
        <p>La lecture est bornée à audit.technical.read sur l école active, sans ouverture implicite vers la gouvernance métier.</p>
      </div>
    </SectionBlock>

    <AccessBoundary page-code="AUD-ECO-002">
      <template v-if="uiState === 'loading'">
        <LoadingState title="Chargement audit technique" message="Lecture des traces locales et des métriques techniques en cours." />
      </template>
      <template v-else-if="uiState === 'error'">
        <ErrorState title="Audit technique indisponible" :message="technicalErrorMessage" />
      </template>
      <template v-else>
        <ErrorState v-if="!isAuthorized" title="Lecture non autorisée" message="Cette vue est réservée à ADMIN_SYSTEME_ECOLE." />
        <template v-else>
          <SectionBlock title="Filtres techniques" description="Les paramètres suivent les endpoints locaux traces et metrics du backend audit.">
            <div class="audit-filter-grid">
              <label class="audit-field"><span>Période</span><input v-model="periodeInput" type="text" placeholder="24h" /></label>
              <label class="audit-field"><span>Métrique</span><input v-model="metriqueInput" type="text" placeholder="db.latency" /></label>
              <label class="audit-field"><span>Correlation Id</span><input v-model="correlationIdInput" type="text" placeholder="corr-..." /></label>
            </div>
            <div class="audit-actions-row">
              <button class="audit-primary-action" type="button" @click="charger">Actualiser</button>
              <button class="audit-secondary-action" type="button" @click="reinitialiserFiltres">Réinitialiser</button>
            </div>
          </SectionBlock>

          <div class="audit-kpi-grid">
            <div v-for="metric in store.state.metrics" :key="`${metric.label}-${metric.value}`" class="audit-kpi-card">
              <small>{{ metric.label }}</small>
              <strong>{{ metric.value }}</strong>
              <span>{{ metric.helper }}</span>
            </div>
          </div>

          <SectionBlock title="Traces techniques locales" description="Lecture tabulaire des traces retournées par le backend audit local.">
            <EmptyState v-if="store.state.traces.length === 0" title="Aucune trace" message="Aucune trace locale n est remontée pour la période courante." />
            <div v-else class="audit-table-shell">
              <table class="audit-table">
                <thead>
                  <tr><th v-for="header in traceHeaders" :key="header">{{ header }}</th></tr>
                </thead>
                <tbody>
                  <tr v-for="row in store.state.traces" :key="row.id">
                    <td v-for="header in traceHeaders" :key="`${row.id}-${header}`">{{ row.columns[header] }}</td>
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
import { ArrowLeft, Cpu, Printer, Sheet, ShieldCheck } from 'lucide-vue-next';
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
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { serializeAuditTableRows } from '../models/audit.model';
import { useSchoolTechnicalAuditStore } from '../stores/school-technical-audit.store';

const session = sessionStore.state;
const context = activeContextStore.state;
const store = useSchoolTechnicalAuditStore();
const doctrineAccess = useDoctrineAccess();
const periodeInput = ref('24h');
const metriqueInput = ref('');
const correlationIdInput = ref('');

const isAuthorized = computed(() => doctrineAccess.canAccessPage('AUD-ECO-002'));
const uiState = computed(() => store.state.status);
const technicalErrorMessage = computed(() => store.state.errorMessage ?? 'La lecture technique locale a échoué.');
const traceHeaders = computed(() => Object.keys(store.state.traces[0]?.columns ?? {}));

async function charger(): Promise<void> {
  if (!isAuthorized.value) {
    store.reinitialiser();
    return;
  }

  await store.charger({
    periode: periodeInput.value.trim() || undefined,
    metrique: metriqueInput.value.trim() || undefined,
    correlationId: correlationIdInput.value.trim() || undefined,
  });
}

function reinitialiserFiltres(): void {
  periodeInput.value = '24h';
  metriqueInput.value = '';
  correlationIdInput.value = '';
}

function exporterCsv(): void {
  const csv = serializeAuditTableRows(store.state.traces);
  if (!csv) {
    return;
  }
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'audit-technique-ecole.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

function imprimerPage(): void {
  window.print();
}

void charger();
</script>

<style scoped src="../../../styles/shell-audit.css"></style>
