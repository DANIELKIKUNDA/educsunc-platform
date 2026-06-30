import { reactive } from 'vue';
import { mapperPaymentReceiptListViewModel } from '../mappers/payment-receipt-list.mapper';
import type {
  PaymentReceiptListFilters,
  PaymentReceiptListViewModel,
  StudentDetailsIndex,
} from '../models/payment-receipt-list.model';
import { financesApi, lireContexteApiFinances } from '../services/finances.api';

interface PaymentReceiptListState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  receipts: PaymentReceiptListViewModel | null;
}

const state = reactive<PaymentReceiptListState>({
  status: 'idle',
  errorMessage: null,
  receipts: null,
});

async function charger(filtres: PaymentReceiptListFilters = {}): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiFinances();
    const reponse = await financesApi.consulterRecusPaiement(filtres, contexte);
    const idsEleves = [...new Set(reponse.donnee.recus.map((recu) => recu.idEleve))];
    const detailsEleves = await Promise.all(
      idsEleves.map(async (idEleve) => {
        const eleve = await financesApi.consulterEleve(idEleve, contexte);
        return [idEleve, eleve.donnee] as const;
      }),
    );

    const indexEleves = detailsEleves.reduce<StudentDetailsIndex>((index, [idEleve, eleve]) => {
      index[idEleve] = eleve;
      return index;
    }, {});

    state.receipts = mapperPaymentReceiptListViewModel(reponse.donnee, indexEleves);
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.receipts = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le chargement des recus a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.receipts = null;
}

export function usePaymentReceiptListStore() {
  return {
    state,
    charger,
    reinitialiser,
  };
}
