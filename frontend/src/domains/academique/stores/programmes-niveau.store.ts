import { reactive } from 'vue';
import type { EtatLocalProgrammeNiveauItem, ProgrammeNiveauItem } from '../models/academique.model';
import { academiqueApi, lireContexteApiAcademique } from '../services/academique.api';

interface ProgrammesNiveauState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  entries: ProgrammeNiveauItem[];
  programme: ProgrammeNiveauItem | null;
  etatProgramme: EtatLocalProgrammeNiveauItem | null;
}

const state = reactive<ProgrammesNiveauState>({
  status: 'idle',
  errorMessage: null,
  entries: [],
  programme: null,
  etatProgramme: null,
});

async function executer(action: () => Promise<void>, fallbackMessage: string): Promise<void> {
  state.status = 'loading';
  state.errorMessage = null;

  try {
    await action();
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    state.errorMessage = error instanceof Error ? error.message : fallbackMessage;
  }
}

async function initialiser(payload: {
  idEcole: string;
  idAnneeScolaire: string;
  idClasseAcademique: string;
  idReferentielProgramme: string;
  idVersionReferentielProgramme: string;
  creePar: string;
}): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.initialiserProgrammeNiveau(payload, contexte);
    state.programme = response.donnee;
  }, 'L initialisation du programme niveau a echoue.');
}

async function lister(idEcole: string, idAnneeScolaire: string): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.listerProgrammesNiveau(idEcole, idAnneeScolaire, contexte);
    state.entries = response.donnees;
  }, 'La lecture des programmes niveau a echoue.');
}

async function consulter(idProgrammeNiveau: string): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.consulterProgrammeNiveau(idProgrammeNiveau, contexte);
    state.programme = response.donnee;
  }, 'La consultation du programme niveau a echoue.');
}

async function etatLocal(idProgrammeNiveau: string): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.produireEtatLocalProgramme(idProgrammeNiveau, contexte);
    state.etatProgramme = response.donnee;
  }, 'La lecture de l etat local du programme a echoue.');
}

async function valider(idProgrammeNiveau: string, validePar: string): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.validerProgrammeNiveau(idProgrammeNiveau, validePar, contexte);
    state.programme = response.donnee;
  }, 'La validation du programme niveau a echoue.');
}

async function archiver(idProgrammeNiveau: string, archivePar: string): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.archiverProgrammeNiveau(idProgrammeNiveau, archivePar, contexte);
    state.programme = response.donnee;
  }, 'L archivage du programme niveau a echoue.');
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.entries = [];
  state.programme = null;
  state.etatProgramme = null;
}

export function useProgrammesNiveauStore() {
  return {
    state,
    initialiser,
    lister,
    consulter,
    etatLocal,
    valider,
    archiver,
    reinitialiser,
  };
}
