import { reactive } from 'vue';
import { mapperSchoolFinancialSummaryViewModel } from '../mappers/school-financial-summary.mapper';
import type {
  SchoolFinancialSummaryFilters,
  SchoolFinancialSummaryViewModel,
} from '../models/school-financial-summary.model';
import { financesApi, lireContexteApiFinances } from '../services/finances.api';

interface SchoolFinancialSummaryState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  summary: SchoolFinancialSummaryViewModel | null;
}

const state = reactive<SchoolFinancialSummaryState>({
  status: 'idle',
  errorMessage: null,
  summary: null,
});

async function charger(filtres: SchoolFinancialSummaryFilters): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiFinances();
    const reponse = await financesApi.consulterSyntheseFinanciereEcole(filtres, contexte);
    state.summary = mapperSchoolFinancialSummaryViewModel(reponse.donnee, filtres);
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.summary = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le chargement de la synthese financiere d ecole a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.summary = null;
}

export function useSchoolFinancialSummaryStore() {
  return {
    state,
    charger,
    reinitialiser,
  };
}
