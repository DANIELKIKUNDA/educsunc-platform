import { computed, reactive } from 'vue';
import {
  normalizeAuditEntries,
  unwrapAuditData,
  type AuditEntryViewModel,
  type AuditPedagogicalFilters,
} from '../models/audit.model';
import { auditApi, lireContexteApiAudit } from '../services/audit.api';

export type PedagogicalAuditKind = 'cotes' | 'conduite' | 'bulletins' | 'classements';

interface PedagogicalAuditState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  cotes: AuditEntryViewModel[];
  conduite: AuditEntryViewModel[];
  bulletins: AuditEntryViewModel[];
  classements: AuditEntryViewModel[];
}

const state = reactive<PedagogicalAuditState>({
  status: 'idle',
  errorMessage: null,
  cotes: [],
  conduite: [],
  bulletins: [],
  classements: [],
});

async function charger(kind: PedagogicalAuditKind, filtres: AuditPedagogicalFilters): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiAudit();

    const response = await (() => {
      switch (kind) {
        case 'cotes':
          return auditApi.consulterAuditPedagogiqueCotes(filtres, contexte);
        case 'conduite':
          return auditApi.consulterAuditPedagogiqueConduite(filtres, contexte);
        case 'bulletins':
          return auditApi.consulterAuditPedagogiqueBulletins(filtres, contexte);
        case 'classements':
          return auditApi.consulterAuditPedagogiqueClassements(filtres, contexte);
      }
    })();

    const donnee = unwrapAuditData<unknown>(response).data;
    state[kind] = normalizeAuditEntries(donnee);
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.errorMessage = error instanceof Error
      ? error.message
      : 'La lecture de l audit pedagogique a echoue.';
    state[kind] = [];
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.cotes = [];
  state.conduite = [];
  state.bulletins = [];
  state.classements = [];
}

export function usePedagogicalAuditStore() {
  return {
    state,
    hasData: computed(() =>
      state.cotes.length > 0
      || state.conduite.length > 0
      || state.bulletins.length > 0
      || state.classements.length > 0,
    ),
    charger,
    reinitialiser,
  };
}
