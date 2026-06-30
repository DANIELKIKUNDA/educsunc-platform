import { reactive } from 'vue';
import {
  mapperTarificationFormState,
  mapperTarificationRequest,
  mapperTarificationRow,
} from '../mappers/tarification.mapper';
import type {
  TarificationFormState,
  TarificationGridApiData,
  TarificationGridRow,
  TarificationListFilters,
} from '../models/tarification.model';
import { financesApi, lireContexteApiFinances } from '../services/finances.api';

interface TarificationState {
  status: 'idle' | 'loading' | 'ready' | 'empty' | 'saving' | 'saved' | 'error';
  errorMessage: string | null;
  rows: TarificationGridRow[];
  sourceRows: TarificationGridApiData[];
  form: TarificationFormState | null;
  selectedGridId: string;
}

const state = reactive<TarificationState>({
  status: 'idle',
  errorMessage: null,
  rows: [],
  sourceRows: [],
  form: null,
  selectedGridId: '',
});

async function charger(filtres: TarificationListFilters): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiFinances();
    const reponse = await financesApi.consulterGrillesTarification(filtres, contexte);
    state.sourceRows = reponse.donnee;
    state.rows = reponse.donnee.map(mapperTarificationRow);

    if (reponse.donnee.length === 0) {
      state.form = mapperTarificationFormState(filtres.idAnneeScolaire);
      state.selectedGridId = '';
      state.status = 'empty';
      return;
    }

    const selection = state.selectedGridId.length > 0
      ? reponse.donnee.find((grille) => grille.idGrilleTarification === state.selectedGridId)
      : reponse.donnee[0];

    state.selectedGridId = selection?.idGrilleTarification ?? '';
    state.form = mapperTarificationFormState(filtres.idAnneeScolaire, selection);
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.rows = [];
    state.sourceRows = [];
    state.form = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le chargement des grilles de tarification a echoue.';
  }
}

function selectionner(idGrille: string, idAnneeScolaire: string): void {
  state.selectedGridId = idGrille;
  const grille = state.sourceRows.find((ligne) => ligne.idGrilleTarification === idGrille);
  state.form = mapperTarificationFormState(idAnneeScolaire, grille);
}

function preparerCreation(idAnneeScolaire: string): void {
  state.selectedGridId = '';
  state.form = mapperTarificationFormState(idAnneeScolaire);
}

async function enregistrer(): Promise<void> {
  if (state.form === null) {
    return;
  }

  state.status = 'saving';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiFinances();
    const requete = mapperTarificationRequest(state.form);
    let grille: TarificationGridApiData;

    if (state.form.id === null) {
      const reponse = await financesApi.creerGrilleTarification(requete, contexte);
      grille = reponse.donnee;
    } else {
      const reponse = await financesApi.modifierGrilleTarification(state.form.id, requete, contexte);
      grille = reponse.donnee;
    }

    await charger({
      idAnneeScolaire: state.form.idAnneeScolaire,
    });
    state.selectedGridId = grille.idGrilleTarification;
    state.form = mapperTarificationFormState(state.form.idAnneeScolaire, grille);
    state.status = 'saved';
  } catch (error) {
    state.status = 'error';
    state.errorMessage = error instanceof Error
      ? error.message
      : 'La mutation de la grille de tarification a echoue.';
  }
}

async function desactiver(): Promise<void> {
  if (state.form === null || state.form.id === null) {
    return;
  }

  state.status = 'saving';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiFinances();
    await financesApi.desactiverGrilleTarification(
      state.form.id,
      { idAnneeScolaire: state.form.idAnneeScolaire },
      contexte,
    );

    await charger({
      idAnneeScolaire: state.form.idAnneeScolaire,
    });
    state.status = 'saved';
  } catch (error) {
    state.status = 'error';
    state.errorMessage = error instanceof Error
      ? error.message
      : 'La desactivation de la grille de tarification a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.rows = [];
  state.sourceRows = [];
  state.form = null;
  state.selectedGridId = '';
}

export function useTarificationStore() {
  return {
    state,
    charger,
    selectionner,
    preparerCreation,
    enregistrer,
    desactiver,
    reinitialiser,
  };
}
