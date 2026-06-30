import { computed, reactive } from 'vue';
import {
  normalizeMetricRows,
  normalizeTableRows,
  unwrapAuditData,
  type AuditMetricViewModel,
  type AuditMonitoringFilters,
  type AuditRecordTableRow,
} from '../models/audit.model';
import { auditApi, lireContexteApiAudit } from '../services/audit.api';

interface SchoolTechnicalAuditState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  traces: AuditRecordTableRow[];
  metrics: AuditMetricViewModel[];
}

const state = reactive<SchoolTechnicalAuditState>({
  status: 'idle',
  errorMessage: null,
  traces: [],
  metrics: [],
});

async function charger(filtres: AuditMonitoringFilters): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiAudit();
    const [tracesResponse, metricsResponse] = await Promise.all([
      auditApi.consulterAuditTechniqueTraces(filtres, contexte),
      auditApi.consulterAuditTechniqueMetrics(filtres, contexte),
    ]);

    const traces = unwrapAuditData<Record<string, unknown>>(tracesResponse).data;
    const metrics = unwrapAuditData<Record<string, unknown>>(metricsResponse).data;

    state.traces = normalizeTableRows(traces.data ?? traces.traces ?? traces);
    state.metrics = normalizeMetricRows(metrics.data ?? metrics.metrics ?? metrics);
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.errorMessage = error instanceof Error
      ? error.message
      : 'La lecture de l audit technique local a echoue.';
    state.traces = [];
    state.metrics = [];
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.traces = [];
  state.metrics = [];
}

export function useSchoolTechnicalAuditStore() {
  return {
    state,
    hasData: computed(() => state.traces.length > 0 || state.metrics.length > 0),
    charger,
    reinitialiser,
  };
}
