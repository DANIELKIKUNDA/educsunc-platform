import { reactive } from 'vue';
import {
  construirePaymentRegistrationRequest,
  mapperPaymentRegistrationResult,
  mapperStudentPaymentObligations,
  mapperStudentPaymentProfile,
} from '../mappers/payment-registration.mapper';
import type {
  PaymentRegistrationModeCode,
  PaymentRegistrationResultViewModel,
  StudentPaymentObligationViewModel,
  StudentPaymentProfileViewModel,
} from '../models/payment-registration.model';
import { financesApi, lireContexteApiFinances } from '../services/finances.api';

interface LoadStudentPaymentOptions {
  idEleve: string;
  classe?: string;
  section?: string;
  anneeScolaire?: string;
}

interface SubmitPaymentOptions {
  idEleve: string;
  typeFraisDeclare: string;
  montant: string;
  modePaiement: PaymentRegistrationModeCode;
}

interface PaymentRegistrationState {
  status: 'idle' | 'loading-student' | 'submitting' | 'ready' | 'submitted' | 'error';
  errorMessage: string | null;
  profile: StudentPaymentProfileViewModel | null;
  obligations: StudentPaymentObligationViewModel[];
  result: PaymentRegistrationResultViewModel | null;
}

const state = reactive<PaymentRegistrationState>({
  status: 'idle',
  errorMessage: null,
  profile: null,
  obligations: [],
  result: null,
});

async function chargerEleve(options: LoadStudentPaymentOptions): Promise<void> {
  state.status = 'loading-student';
  state.errorMessage = null;
  state.result = null;

  try {
    const contexte = lireContexteApiFinances();
    const [eleve, fraisExigibles] = await Promise.all([
      financesApi.consulterEleve(options.idEleve, contexte),
      financesApi.consulterFraisExigibles(options.idEleve, contexte),
    ]);

    state.profile = mapperStudentPaymentProfile(eleve.donnee, {
      classe: options.classe,
      section: options.section,
      anneeScolaire: options.anneeScolaire,
    });
    state.obligations = mapperStudentPaymentObligations(fraisExigibles.donnee);
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.profile = null;
    state.obligations = [];
    state.result = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le chargement de l eleve ou de ses frais exigibles a echoue.';
  }
}

async function soumettrePaiement(options: SubmitPaymentOptions): Promise<void> {
  state.status = 'submitting';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiFinances();
    const reponse = await financesApi.enregistrerPaiement(
      construirePaymentRegistrationRequest(options),
      contexte,
    );

    state.result = mapperPaymentRegistrationResult(reponse.donnee);
    state.status = 'submitted';
  } catch (error) {
    state.status = 'error';
    state.errorMessage = error instanceof Error
      ? error.message
      : 'L enregistrement du paiement a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.profile = null;
  state.obligations = [];
  state.result = null;
}

export function usePaymentRegistrationStore() {
  return {
    state,
    chargerEleve,
    soumettrePaiement,
    reinitialiser,
  };
}
