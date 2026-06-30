import { reactive } from 'vue';
import { mapperPaymentReceiptViewModel } from '../mappers/payment-receipt.mapper';
import type { PaymentReceiptViewModel } from '../models/payment-receipt.model';
import { financesApi, lireContexteApiFinances } from '../services/finances.api';

interface PaymentReceiptState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  receipt: PaymentReceiptViewModel | null;
}

const state = reactive<PaymentReceiptState>({
  status: 'idle',
  errorMessage: null,
  receipt: null,
});

async function charger(idRecu: string): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiFinances();
    const reponse = await financesApi.consulterRecuPaiement(idRecu, contexte);
    state.receipt = mapperPaymentReceiptViewModel(reponse.donnee);
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.receipt = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le chargement du recu a echoue.';
  }
}

async function telechargerPdf(idRecu: string): Promise<void> {
  const contexte = lireContexteApiFinances();
  const resultat = await financesApi.telechargerRecuPdf(idRecu, contexte);
  const url = URL.createObjectURL(resultat.blob);

  window.open(url, '_blank', 'noopener,noreferrer');
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.receipt = null;
}

export function usePaymentReceiptStore() {
  return {
    state,
    charger,
    telechargerPdf,
    reinitialiser,
  };
}
