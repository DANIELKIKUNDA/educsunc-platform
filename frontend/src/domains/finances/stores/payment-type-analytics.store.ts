import { reactive } from 'vue';
import { mapperPaymentTypeAnalyticsViewModel } from '../mappers/payment-type-analytics.mapper';
import type {
  PaymentTypeAnalyticsFilters,
  PaymentTypeAnalyticsViewModel,
} from '../models/payment-type-analytics.model';
import { financesApi, lireContexteApiFinances } from '../services/finances.api';

interface PaymentTypeAnalyticsState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  analytics: PaymentTypeAnalyticsViewModel | null;
}

const state = reactive<PaymentTypeAnalyticsState>({
  status: 'idle',
  errorMessage: null,
  analytics: null,
});

async function charger(filtres: PaymentTypeAnalyticsFilters, perimetre: string): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiFinances();
    const reponse = await financesApi.consulterPaiementsParTypeFrais(filtres, contexte);
    state.analytics = mapperPaymentTypeAnalyticsViewModel(reponse.donnee, perimetre);
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.analytics = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le chargement de l analyse par type de frais a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.analytics = null;
}

export function usePaymentTypeAnalyticsStore() {
  return {
    state,
    charger,
    reinitialiser,
  };
}
