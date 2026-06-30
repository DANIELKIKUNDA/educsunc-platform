import { reactive } from 'vue';
import { mapperCashDayViewModel } from '../mappers/cash-opening.mapper';
import type { CashDayViewModel } from '../models/cash-opening.model';
import { financesApi, lireContexteApiFinances } from '../services/finances.api';

interface CashOpeningState {
  status: 'idle' | 'loading' | 'ready' | 'opening' | 'opened' | 'error';
  errorMessage: string | null;
  cashDay: CashDayViewModel | null;
}

const state = reactive<CashOpeningState>({
  status: 'idle',
  errorMessage: null,
  cashDay: null,
});

async function charger(date: string): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiFinances();
    const reponse = await financesApi.consulterCaisseJour(date, contexte);
    state.cashDay = mapperCashDayViewModel(reponse.donnee);
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.cashDay = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le chargement de la caisse du jour a echoue.';
  }
}

async function ouvrir(date: string): Promise<void> {
  state.status = 'opening';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiFinances();
    const reponse = await financesApi.ouvrirCaisseJour({ date }, contexte);
    state.cashDay = mapperCashDayViewModel(reponse.donnee);
    state.status = 'opened';
  } catch (error) {
    state.status = 'error';
    state.errorMessage = error instanceof Error
      ? error.message
      : 'L ouverture de la caisse a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.cashDay = null;
}

export function useCashOpeningStore() {
  return {
    state,
    charger,
    ouvrir,
    reinitialiser,
  };
}
