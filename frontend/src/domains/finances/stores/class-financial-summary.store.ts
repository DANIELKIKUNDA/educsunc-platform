import { reactive } from 'vue';
import { mapperClassFinancialSummaryViewModel } from '../mappers/class-financial-summary.mapper';
import type {
  ClassFinancialSummaryFilters,
  ClassFinancialSummaryViewModel,
} from '../models/class-financial-summary.model';
import { financesApi, lireContexteApiFinances } from '../services/finances.api';

interface ClassFinancialSummaryState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  summary: ClassFinancialSummaryViewModel | null;
}

const state = reactive<ClassFinancialSummaryState>({
  status: 'idle',
  errorMessage: null,
  summary: null,
});

async function charger(filtres: ClassFinancialSummaryFilters): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiFinances();
    const reponse = await financesApi.consulterSyntheseFinanciereClasse(filtres, contexte);
    state.summary = mapperClassFinancialSummaryViewModel(reponse.donnee, filtres);
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.summary = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le chargement de la synthese financiere de classe a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.summary = null;
}

export function useClassFinancialSummaryStore() {
  return {
    state,
    charger,
    reinitialiser,
  };
}
