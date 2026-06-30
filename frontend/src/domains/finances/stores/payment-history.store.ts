import { computed, reactive } from 'vue';
import { financesApi, lireContexteApiFinances } from '../services/finances.api';
import { mapperPaymentHistoryViewModel } from '../mappers/payment-history.mapper';
import type {
  PaymentHistoryEntry,
  StudentPaymentHistoryProfile,
} from '../models/payment-history.model';

interface LoadPaymentHistoryOptions {
  idEleve: string;
  anneeScolaire?: string;
  classe?: string;
  section?: string;
}

interface PaymentHistoryState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  profile: StudentPaymentHistoryProfile | null;
  entries: PaymentHistoryEntry[];
}

const state = reactive<PaymentHistoryState>({
  status: 'idle',
  errorMessage: null,
  profile: null,
  entries: [],
});

async function charger(options: LoadPaymentHistoryOptions): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiFinances();
    const [eleve, historique] = await Promise.all([
      financesApi.consulterEleve(options.idEleve, contexte),
      financesApi.consulterHistoriquePaiements(options.idEleve, contexte),
    ]);

    const vue = mapperPaymentHistoryViewModel(eleve.donnee, historique.donnee, {
      anneeScolaire: options.anneeScolaire,
      classe: options.classe,
      section: options.section,
    });

    state.profile = vue.profile;
    state.entries = vue.entries;
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.profile = null;
    state.entries = [];
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le chargement de l historique des paiements a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.profile = null;
  state.entries = [];
}

export function usePaymentHistoryStore() {
  return {
    state,
    hasData: computed(() => state.profile !== null),
    charger,
    reinitialiser,
  };
}
