import { computed, reactive } from 'vue';
import {
  normalizeAuditEntries,
  normalizeAuditTimeline,
  unwrapAuditData,
  type AuditEntryViewModel,
  type AuditListFilters,
  type AuditTimelineViewModel,
} from '../models/audit.model';
import { auditApi, lireContexteApiAudit } from '../services/audit.api';

interface SchoolFinancialAuditState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  list: AuditEntryViewModel[];
  history: AuditEntryViewModel[];
  timeline: AuditTimelineViewModel | null;
}

const state = reactive<SchoolFinancialAuditState>({
  status: 'idle',
  errorMessage: null,
  list: [],
  history: [],
  timeline: null,
});

async function charger(filtres: AuditListFilters): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiAudit();
    const [listeResponse, historiqueResponse, timelineResponse] = await Promise.all([
      auditApi.consulterAuditFinancierListe(filtres, contexte),
      auditApi.consulterAuditFinancierHistorique(filtres, contexte),
      auditApi.consulterAuditFinancierTimeline(filtres, contexte),
    ]);

    const liste = unwrapAuditData<Record<string, unknown>>(listeResponse).data;
    const historique = unwrapAuditData<Record<string, unknown>>(historiqueResponse).data;
    const timeline = unwrapAuditData<Record<string, unknown>>(timelineResponse).data;

    state.list = normalizeAuditEntries(liste.items);
    state.history = normalizeAuditEntries(historique.items);
    state.timeline = normalizeAuditTimeline(timeline);
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.errorMessage = error instanceof Error
      ? error.message
      : 'La lecture de l audit financier a echoue.';
    state.list = [];
    state.history = [];
    state.timeline = null;
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.list = [];
  state.history = [];
  state.timeline = null;
}

export function useSchoolFinancialAuditStore() {
  return {
    state,
    hasData: computed(() =>
      state.list.length > 0 || state.history.length > 0 || state.timeline !== null,
    ),
    charger,
    reinitialiser,
  };
}
