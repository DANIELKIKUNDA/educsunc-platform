import { reactive } from 'vue';
import { lireContexteApiScolarite, scolariteApi } from '../services/scolarite.api';
import type {
  AffectationCreationRequest,
  AffectationItem,
  ChangementClasseRequest,
  EleveAffecteClasseItem,
} from '../models/scolarite.model';

interface AssignmentsState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  affectationActive: AffectationItem | null;
  affectationDetail: AffectationItem | null;
  classeEleves: EleveAffecteClasseItem[];
  result: AffectationItem | null;
  lastActionMessage: string | null;
}

const state = reactive<AssignmentsState>({
  status: 'idle',
  errorMessage: null,
  affectationActive: null,
  affectationDetail: null,
  classeEleves: [],
  result: null,
  lastActionMessage: null,
});

async function chargerClasse(idClassePedagogique: string): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;
  state.lastActionMessage = null;

  try {
    const contexte = lireContexteApiScolarite();
    const response = await scolariteApi.listerElevesParClasse(idClassePedagogique, contexte);
    state.classeEleves = response.donnees;
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.classeEleves = [];
    state.errorMessage = error instanceof Error
      ? error.message
      : 'La lecture de la classe a echoue.';
  }
}

async function chargerAffectationActive(idInscriptionScolaire: string): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;
  state.lastActionMessage = null;
  try {
    const contexte = lireContexteApiScolarite();
    const response = await scolariteApi.consulterAffectationActive(idInscriptionScolaire, contexte);
    state.affectationActive = response.donnee;
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.affectationActive = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Aucune affectation active lisible.';
  }
}

async function chargerAffectation(idAffectationClasse: string): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;
  state.lastActionMessage = null;

  try {
    const contexte = lireContexteApiScolarite();
    const response = await scolariteApi.consulterAffectation(idAffectationClasse, contexte);
    state.affectationDetail = response.donnee;
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.affectationDetail = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'La lecture de l affectation a echoue.';
  }
}

async function affecter(demande: AffectationCreationRequest): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;
  state.lastActionMessage = null;

  try {
    const contexte = lireContexteApiScolarite();
    const response = await scolariteApi.affecterEleve(demande, contexte);
    state.result = response.donnee;
    state.affectationActive = response.donnee;
    state.affectationDetail = response.donnee;
    state.lastActionMessage = 'Affectation enregistree.';
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.result = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'L affectation a echoue.';
  }
}

async function changerClasse(
  idInscriptionScolaire: string,
  demande: ChangementClasseRequest,
): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;
  state.lastActionMessage = null;

  try {
    const contexte = lireContexteApiScolarite();
    const response = await scolariteApi.changerClasse(idInscriptionScolaire, demande, contexte);
    state.result = response.donnee;
    state.affectationActive = response.donnee;
    state.affectationDetail = response.donnee;
    state.lastActionMessage = 'Changement de classe enregistre.';
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.result = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le changement de classe a echoue.';
  }
}

async function desactiverAffectation(idInscriptionScolaire: string): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;
  state.lastActionMessage = null;

  try {
    const contexte = lireContexteApiScolarite();
    await scolariteApi.desactiverAffectation(idInscriptionScolaire, contexte);
    if (state.affectationActive?.idInscriptionScolaire === idInscriptionScolaire) {
      state.affectationActive = null;
    }
    if (state.affectationDetail?.idInscriptionScolaire === idInscriptionScolaire) {
      state.affectationDetail = {
        ...state.affectationDetail,
        active: false,
      };
    }
    state.classeEleves = state.classeEleves.filter((entry) => entry.idInscriptionScolaire !== idInscriptionScolaire);
    state.lastActionMessage = 'Affectation desactivee.';
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.errorMessage = error instanceof Error
      ? error.message
      : 'La desactivation de l affectation a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.affectationActive = null;
  state.affectationDetail = null;
  state.classeEleves = [];
  state.result = null;
  state.lastActionMessage = null;
}

export function useAssignmentsStore() {
  return {
    state,
    chargerClasse,
    chargerAffectation,
    chargerAffectationActive,
    affecter,
    changerClasse,
    desactiverAffectation,
    reinitialiser,
  };
}
