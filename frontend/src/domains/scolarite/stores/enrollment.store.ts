import { reactive } from 'vue';
import { lireContexteApiScolarite, scolariteApi } from '../services/scolarite.api';
import type { InscriptionCompleteRequest } from '../models/scolarite.model';

interface EnrollmentState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  result: {
    idEleve: string;
    idInscriptionScolaire: string;
    idAffectationClasse?: string;
    statutInscription: string;
    classe?: string;
  } | null;
}

const state = reactive<EnrollmentState>({
  status: 'idle',
  errorMessage: null,
  result: null,
});

async function soumettre(demande: InscriptionCompleteRequest): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiScolarite();
    const response = await scolariteApi.creerInscriptionComplete(demande, contexte);
    state.result = {
      idEleve: response.donnee.eleve.idEleve,
      idInscriptionScolaire: response.donnee.inscription.idInscriptionScolaire,
      idAffectationClasse: response.donnee.affectation?.idAffectationClasse,
      statutInscription: response.donnee.inscription.statutInscription,
      classe: response.donnee.affectation?.idClassePedagogique,
    };
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.result = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'L inscription complete a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.result = null;
}

export function useEnrollmentStore() {
  return {
    state,
    soumettre,
    reinitialiser,
  };
}
