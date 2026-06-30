import { reactive } from 'vue';
import { lireContexteApiScolarite, scolariteApi } from '../services/scolarite.api';
import type { ChangementStatutRequest, CycleVieActionCode, EleveDetail, EvenementParcoursItem, ParcoursEleveItem } from '../models/scolarite.model';

interface LifecycleState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  eleve: EleveDetail | null;
  parcours: ParcoursEleveItem | null;
  evenements: EvenementParcoursItem[];
  lastMutation: string | null;
  successMessage: string | null;
}

const state = reactive<LifecycleState>({
  status: 'idle',
  errorMessage: null,
  eleve: null,
  parcours: null,
  evenements: [],
  lastMutation: null,
  successMessage: null,
});

async function charger(idEleve: string): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;
  state.successMessage = null;

  try {
    const contexte = lireContexteApiScolarite();
    const [eleve, parcours, evenements] = await Promise.all([
      scolariteApi.consulterEleve(idEleve, contexte),
      scolariteApi.consulterParcours(idEleve, contexte),
      scolariteApi.consulterEvenements(idEleve, contexte),
    ]);

    state.eleve = eleve.donnee;
    state.parcours = parcours.donnee;
    state.evenements = evenements.donnees;
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.eleve = null;
    state.parcours = null;
    state.evenements = [];
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le cycle de vie eleve est indisponible.';
  }
}

async function executerAction(
  action: CycleVieActionCode,
  idEleve: string,
  demande: ChangementStatutRequest,
): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;
  state.successMessage = null;

  try {
    const contexte = lireContexteApiScolarite();
    const operation = {
      abandon: scolariteApi.declarerAbandon,
      transfert: scolariteApi.transfererEleve,
      reintegration: scolariteApi.reintegrerEleve,
      reactivation: scolariteApi.reactiverEleve,
      deces: scolariteApi.declarerDeces,
      suspension: scolariteApi.suspendreEleve,
    }[action];

    const response = await operation(idEleve, demande, contexte);
    state.eleve = response.donnee;
    state.lastMutation = action;
    state.successMessage = `Action ${action} enregistree.`;
    state.status = 'ready';
    await charger(idEleve);
  } catch (error) {
    state.status = 'error';
    state.errorMessage = error instanceof Error
      ? error.message
      : 'La mutation de cycle de vie a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.eleve = null;
  state.parcours = null;
  state.evenements = [];
  state.lastMutation = null;
  state.successMessage = null;
}

export function useStudentLifecycleStore() {
  return {
    state,
    charger,
    executerAction,
    reinitialiser,
  };
}
