import { reactive } from 'vue';
import { mapperCashDayViewModel } from '../mappers/cash-opening.mapper';
import type { CashDayViewModel } from '../models/cash-opening.model';
import { financesApi, lireContexteApiFinances } from '../services/finances.api';

interface CashDayState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  cashDay: CashDayViewModel | null;
}

const state = reactive<CashDayState>({
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

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.cashDay = null;
}

export function useCashDayStore() {
  return {
    state,
    charger,
    reinitialiser,
  };
}
