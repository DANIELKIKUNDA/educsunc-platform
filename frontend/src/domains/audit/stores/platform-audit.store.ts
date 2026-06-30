import { computed, reactive } from 'vue';
import {
  normalizeAuditEntries,
  normalizeAuditTimeline,
  unwrapAuditData,
  type AuditEntryViewModel,
  type AuditListFilters,
  type AuditMetaEnvelope,
  type AuditTimelineViewModel,
} from '../models/audit.model';
import { auditApi, lireContexteApiAudit } from '../services/audit.api';

interface PlatformAuditState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  list: AuditEntryViewModel[];
  history: AuditEntryViewModel[];
  timeline: AuditTimelineViewModel | null;
  meta?: AuditMetaEnvelope;
}

const state = reactive<PlatformAuditState>({
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
      auditApi.consulterAuditPlateformeListe(filtres, contexte),
      auditApi.consulterAuditPlateformeHistorique(filtres, contexte),
      auditApi.consulterAuditPlateformeTimeline(filtres, contexte),
    ]);

    const liste = unwrapAuditData<Record<string, unknown>>(listeResponse);
    const historique = unwrapAuditData<Record<string, unknown>>(historiqueResponse);
    const timeline = unwrapAuditData<Record<string, unknown>>(timelineResponse);

    state.list = normalizeAuditEntries(liste.data.items);
    state.history = normalizeAuditEntries(historique.data.items);
    state.timeline = normalizeAuditTimeline(timeline.data);
    state.meta = liste.meta;
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.errorMessage = error instanceof Error
      ? error.message
      : 'La lecture de l audit plateforme a echoue.';
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
  state.meta = undefined;
}

export function usePlatformAuditStore() {
  return {
    state,
    hasData: computed(() =>
      state.list.length > 0 || state.history.length > 0 || state.timeline !== null,
    ),
    charger,
    reinitialiser,
  };
}
