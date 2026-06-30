import { computed, reactive } from 'vue';
import {
  normalizeMetricRows,
  normalizeSummaryCards,
  normalizeTableRows,
  unwrapAuditData,
  type AuditAnalyticsFilters,
  type AuditMetricViewModel,
  type AuditMonitoringFilters,
  type AuditRecordTableRow,
  type AuditSummaryCard,
} from '../models/audit.model';
import { auditApi, lireContexteApiAudit } from '../services/audit.api';

interface OrganizationAuditState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  analyticsCards: AuditSummaryCard[];
  analyticsRows: AuditRecordTableRow[];
  tenantsRows: AuditRecordTableRow[];
  anomalies: AuditRecordTableRow[];
  access: AuditRecordTableRow[];
  monitoring: AuditMetricViewModel[];
}

const state = reactive<OrganizationAuditState>({
  status: 'idle',
  errorMessage: null,
  analyticsCards: [],
  analyticsRows: [],
  tenantsRows: [],
  anomalies: [],
  access: [],
  monitoring: [],
});

async function charger(
  analyticsFilters: AuditAnalyticsFilters,
  monitoringFilters: AuditMonitoringFilters,
): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiAudit();
    const [analyticsResponse, tenantsResponse, anomaliesResponse, accessResponse] = await Promise.all([
      auditApi.consulterAuditOrganisationAnalytics(analyticsFilters, contexte),
      auditApi.consulterAuditOrganisationTenants(analyticsFilters, contexte),
      auditApi.consulterAuditOrganisationAnomalies(monitoringFilters, contexte),
      auditApi.consulterAuditOrganisationAccess(monitoringFilters, contexte),
    ]);

    const analytics = unwrapAuditData<Record<string, unknown>>(analyticsResponse).data;
    const tenants = unwrapAuditData<Record<string, unknown>>(tenantsResponse).data;
    const anomalies = unwrapAuditData<Record<string, unknown>>(anomaliesResponse).data;
    const access = unwrapAuditData<Record<string, unknown>>(accessResponse).data;

    state.analyticsCards = normalizeSummaryCards(analytics.compteurs as Record<string, unknown> | undefined);
    state.analyticsRows = normalizeTableRows(analytics.valeurs);
    state.tenantsRows = normalizeTableRows(tenants.valeurs);
    state.anomalies = normalizeTableRows(anomalies.data ?? anomalies.anomalies ?? anomalies);
    state.access = normalizeTableRows(access.data ?? access.acces ?? access.access ?? access);
    state.monitoring = [
      ...normalizeMetricRows(anomalies.data ?? anomalies.anomalies ?? anomalies),
      ...normalizeMetricRows(access.data ?? access.acces ?? access.access ?? access),
    ].slice(0, 6);
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.errorMessage = error instanceof Error
      ? error.message
      : 'La supervision audit organisationnelle a echoue.';
    state.analyticsCards = [];
    state.analyticsRows = [];
    state.tenantsRows = [];
    state.anomalies = [];
    state.access = [];
    state.monitoring = [];
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.analyticsCards = [];
  state.analyticsRows = [];
  state.tenantsRows = [];
  state.anomalies = [];
  state.access = [];
  state.monitoring = [];
}

export function useOrganizationAuditStore() {
  return {
    state,
    hasData: computed(() =>
      state.analyticsCards.length > 0
      || state.analyticsRows.length > 0
      || state.anomalies.length > 0
      || state.access.length > 0,
    ),
    charger,
    reinitialiser,
  };
}
