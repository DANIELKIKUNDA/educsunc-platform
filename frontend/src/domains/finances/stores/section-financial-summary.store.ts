import { reactive } from 'vue';
import { mapperSectionFinancialSummaryViewModel } from '../mappers/section-financial-summary.mapper';
import type {
  SectionFinancialSummaryFilters,
  SectionFinancialSummaryViewModel,
} from '../models/section-financial-summary.model';
import { financesApi, lireContexteApiFinances } from '../services/finances.api';

interface SectionFinancialSummaryState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  summary: SectionFinancialSummaryViewModel | null;
}

const state = reactive<SectionFinancialSummaryState>({
  status: 'idle',
  errorMessage: null,
  summary: null,
});

async function charger(filtres: SectionFinancialSummaryFilters): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiFinances();
    const reponse = await financesApi.consulterSyntheseFinanciereSection(filtres, contexte);
    state.summary = mapperSectionFinancialSummaryViewModel(reponse.donnee, filtres);
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.summary = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le chargement de la synthese financiere de section a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.summary = null;
}

export function useSectionFinancialSummaryStore() {
  return {
    state,
    charger,
    reinitialiser,
  };
}
