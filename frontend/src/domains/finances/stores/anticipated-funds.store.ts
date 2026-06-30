import { reactive } from 'vue';
import { mapperAnticipatedFundsViewModel } from '../mappers/anticipated-funds.mapper';
import type {
  AnticipatedFundsFilters,
  AnticipatedFundsViewModel,
} from '../models/anticipated-funds.model';
import { financesApi, lireContexteApiFinances } from '../services/finances.api';

interface AnticipatedFundsState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  funds: AnticipatedFundsViewModel | null;
}

const state = reactive<AnticipatedFundsState>({
  status: 'idle',
  errorMessage: null,
  funds: null,
});

async function charger(filtres: AnticipatedFundsFilters): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiFinances();
    const reponse = await financesApi.consulterFondsAnticipes(filtres, contexte);
    state.funds = mapperAnticipatedFundsViewModel(reponse.donnee);
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.funds = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le chargement des fonds anticipes a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.funds = null;
}

export function useAnticipatedFundsStore() {
  return {
    state,
    charger,
    reinitialiser,
  };
}
