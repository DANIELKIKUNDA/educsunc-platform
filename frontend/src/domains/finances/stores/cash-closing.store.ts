import { reactive } from 'vue';
import { mapperCashDayViewModel } from '../mappers/cash-opening.mapper';
import type { CashDayViewModel } from '../models/cash-opening.model';
import { financesApi, lireContexteApiFinances } from '../services/finances.api';

interface CashClosingState {
  status: 'idle' | 'loading' | 'ready' | 'closing' | 'closed' | 'error';
  errorMessage: string | null;
  cashDay: CashDayViewModel | null;
}

const state = reactive<CashClosingState>({
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

async function cloturer(options: {
  idCaisseJour: string;
  montantPhysiqueDeclare?: string;
  observation?: string;
}): Promise<void> {
  state.status = 'closing';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiFinances();
    const reponse = await financesApi.cloturerCaisseJour({
      idCaisseJour: options.idCaisseJour,
      montantPhysiqueDeclare:
        options.montantPhysiqueDeclare !== undefined && options.montantPhysiqueDeclare.trim().length > 0
          ? {
            montant: Number.parseInt(options.montantPhysiqueDeclare, 10),
            devise: 'CDF',
          }
          : undefined,
      observation: options.observation?.trim().length ? options.observation.trim() : undefined,
    }, contexte);
    state.cashDay = mapperCashDayViewModel(reponse.donnee);
    state.status = 'closed';
  } catch (error) {
    state.status = 'error';
    state.errorMessage = error instanceof Error
      ? error.message
      : 'La cloture de la caisse a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.cashDay = null;
}

export function useCashClosingStore() {
  return {
    state,
    charger,
    cloturer,
    reinitialiser,
  };
}
