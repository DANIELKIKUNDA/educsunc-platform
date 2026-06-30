import { reactive } from 'vue';
import { mapperPaymentsByCashierViewModel } from '../mappers/payments-by-cashier.mapper';
import type {
  PaymentsByCashierFilters,
  PaymentsByCashierViewModel,
} from '../models/payments-by-cashier.model';
import { financesApi, lireContexteApiFinances } from '../services/finances.api';

interface PaymentsByCashierState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  analytics: PaymentsByCashierViewModel | null;
}

const state = reactive<PaymentsByCashierState>({
  status: 'idle',
  errorMessage: null,
  analytics: null,
});

async function charger(filtres: PaymentsByCashierFilters): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiFinances();
    const reponse = await financesApi.consulterPaiementsParCaissier(filtres, contexte);
    state.analytics = mapperPaymentsByCashierViewModel(reponse.donnee);
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.analytics = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le chargement des paiements par caissier a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.analytics = null;
}

export function usePaymentsByCashierStore() {
  return {
    state,
    charger,
    reinitialiser,
  };
}
