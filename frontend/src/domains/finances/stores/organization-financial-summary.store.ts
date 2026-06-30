import { reactive } from 'vue';
import { mapperOrganizationFinancialSummaryViewModel } from '../mappers/organization-financial-summary.mapper';
import type {
  OrganizationFinancialSummaryFilters,
  OrganizationFinancialSummaryViewModel,
} from '../models/organization-financial-summary.model';
import { financesApi, lireContexteApiFinances } from '../services/finances.api';

interface OrganizationFinancialSummaryState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  summary: OrganizationFinancialSummaryViewModel | null;
}

const state = reactive<OrganizationFinancialSummaryState>({
  status: 'idle',
  errorMessage: null,
  summary: null,
});

async function charger(filtres: OrganizationFinancialSummaryFilters): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiFinances();
    const reponse = await financesApi.consulterSyntheseFinanciereOrganisation(filtres, contexte);
    state.summary = mapperOrganizationFinancialSummaryViewModel(reponse.donnee, filtres);
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.summary = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le chargement de la synthese financiere d organisation a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.summary = null;
}

export function useOrganizationFinancialSummaryStore() {
  return {
    state,
    charger,
    reinitialiser,
  };
}
