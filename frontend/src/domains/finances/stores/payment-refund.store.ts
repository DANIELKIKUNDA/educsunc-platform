import { reactive } from 'vue';
import { mapperPaymentRefundViewModel } from '../mappers/payment-refund.mapper';
import type {
  PaymentRefundRequest,
  PaymentRefundViewModel,
} from '../models/payment-refund.model';
import { financesApi, lireContexteApiFinances } from '../services/finances.api';

interface PaymentRefundState {
  status: 'idle' | 'submitting' | 'success' | 'error';
  errorMessage: string | null;
  result: PaymentRefundViewModel | null;
}

const state = reactive<PaymentRefundState>({
  status: 'idle',
  errorMessage: null,
  result: null,
});

async function restituer(demande: PaymentRefundRequest): Promise<void> {
  state.status = 'submitting';
  state.errorMessage = null;
  state.result = null;

  try {
    const contexte = lireContexteApiFinances();

    if (contexte.utilisateurId === null) {
      throw new Error('Le contexte utilisateur frontend est incomplet pour lancer une restitution.');
    }

    const reponse = await financesApi.restituerExcedent(
      {
        idPaiement: demande.idPaiement,
        idEleve: demande.idEleve,
        effectuePar: demande.effectuePar,
      },
      contexte,
    );

    state.result = mapperPaymentRefundViewModel(reponse.donnee);
    state.status = 'success';
  } catch (error) {
    state.status = 'error';
    state.result = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'La restitution n a pas pu etre terminee.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.result = null;
}

export function usePaymentRefundStore() {
  return {
    state,
    restituer,
    reinitialiser,
  };
}
