import { reactive } from 'vue';
import { sessionStore } from '../../../shared/auth/session.store';
import { mapGradeSheetViewModel } from '../mappers/grade-sheet.mapper';
import type { GradeSheetFilters, GradeSheetViewModel } from '../models/grade-sheet.model';
import { lireContexteApiPedagogique, pedagogiqueApi } from '../services/pedagogique.api';

interface GradeSheetState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  savingStatus: 'idle' | 'saving' | 'saved' | 'error';
  errorMessage: string | null;
  saveMessage: string | null;
  sheet: GradeSheetViewModel | null;
}

const state = reactive<GradeSheetState>({
  status: 'idle',
  savingStatus: 'idle',
  errorMessage: null,
  saveMessage: null,
  sheet: null,
});

async function charger(filters: GradeSheetFilters): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    const contexte = lireContexteApiPedagogique();
    const response = await pedagogiqueApi.consulterFichesCotationClasseCours({
      idClassePedagogique: filters.idClassePedagogique,
      idAnneeScolaire: filters.idAnneeScolaire,
      idReferentielCours: filters.idReferentielCours,
    }, contexte);
    state.sheet = mapGradeSheetViewModel(response.donnee, filters, sessionStore.state.actorCode);
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.sheet = null;
    state.errorMessage = error instanceof Error
      ? error.message
      : 'Le chargement de la fiche de cotation a echoue.';
  }
}

async function enregistrerCellule(demande: {
  idFicheCotationEleveCours: string;
  codeColonne: string;
  value: number;
  version: number;
  hadExistingValue: boolean;
}, filters: GradeSheetFilters): Promise<void> {
  state.savingStatus = 'saving';
  state.saveMessage = null;

  try {
    const contexte = lireContexteApiPedagogique();

    if (demande.hadExistingValue) {
      await pedagogiqueApi.modifierCote({
        idFicheCotationEleveCours: demande.idFicheCotationEleveCours,
        codeColonne: demande.codeColonne,
        nouvelleCote: demande.value,
        versionAttendue: demande.version,
      }, contexte);
    } else {
      await pedagogiqueApi.encoderCote({
        idFicheCotationEleveCours: demande.idFicheCotationEleveCours,
        codeColonne: demande.codeColonne,
        cote: demande.value,
        versionAttendue: demande.version,
      }, contexte);
    }

    await charger(filters);
    state.savingStatus = 'saved';
    state.saveMessage = 'Cote enregistree avec succes.';
  } catch (error) {
    state.savingStatus = 'error';
    state.saveMessage = error instanceof Error
      ? error.message
      : 'L enregistrement de la cote a echoue.';
  }
}

async function viderCellule(demande: {
  idFicheCotationEleveCours: string;
  codeColonne: string;
  version: number;
}, filters: GradeSheetFilters): Promise<void> {
  state.savingStatus = 'saving';
  state.saveMessage = null;

  try {
    const contexte = lireContexteApiPedagogique();
    await pedagogiqueApi.viderCote({
      idFicheCotationEleveCours: demande.idFicheCotationEleveCours,
      codeColonne: demande.codeColonne,
      versionAttendue: demande.version,
    }, contexte);
    await charger(filters);
    state.savingStatus = 'saved';
    state.saveMessage = 'Cote videe avec succes.';
  } catch (error) {
    state.savingStatus = 'error';
    state.saveMessage = error instanceof Error
      ? error.message
      : 'Le vidage de la cote a echoue.';
  }
}

function reinitialiser(): void {
  state.status = 'idle';
  state.savingStatus = 'idle';
  state.errorMessage = null;
  state.saveMessage = null;
  state.sheet = null;
}

export function useGradeSheetStore() {
  return {
    state,
    charger,
    enregistrerCellule,
    viderCellule,
    reinitialiser,
  };
}
