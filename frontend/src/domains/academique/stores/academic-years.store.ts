import { reactive } from 'vue';
import type {
  AnneeScolaireItem,
  BasculeAnneeScolaireResponse,
  GarantieAnneeActiveResponse,
  PreparationAnneeScolaireResponse,
} from '../models/academique.model';
import { academiqueApi, lireContexteApiAcademique } from '../services/academique.api';
import { mapperAnneesScolaires } from '../mappers/academique-annees.mapper';

type AcademicYearTransitionSummary =
  | PreparationAnneeScolaireResponse
  | GarantieAnneeActiveResponse
  | BasculeAnneeScolaireResponse
  | { donnee: AnneeScolaireItem };

interface AcademicYearsState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  entries: AnneeScolaireItem[];
  active: AnneeScolaireItem | null;
  transitionSummary: AcademicYearTransitionSummary | null;
}

const state = reactive<AcademicYearsState>({
  status: 'idle',
  errorMessage: null,
  entries: [],
  active: null,
  transitionSummary: null,
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

async function chargerListe(idEcole: string): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.listerAnneesScolaires(idEcole, contexte);
    state.entries = mapperAnneesScolaires(response.donnees);
  }, 'Le chargement des annees scolaires a echoue.');
}

async function chargerActive(idEcole: string): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.consulterAnneeActive(idEcole, contexte);
    state.active = response.donnee;
  }, 'La lecture de l annee active a echoue.');
}

async function creer(payload: {
  idEcole: string;
  code: string;
  libelle: string;
  dateDebut: string;
  dateFin: string;
  creePar: string;
}): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.creerAnneeScolaire(payload, contexte);
    state.entries = mapperAnneesScolaires([
      response.donnee,
      ...state.entries.filter((item) => item.id !== response.donnee.id),
    ]);
    state.transitionSummary = response;
  }, 'La creation de l annee scolaire a echoue.');
}

async function preparer(payload: {
  idEcole: string;
  creePar: string;
  dateDebut?: string;
  dateFin?: string;
}): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.preparerAnneeScolaireSuivante(payload, contexte);
    state.transitionSummary = response;
  }, 'La preparation de l annee suivante a echoue.');
}

async function garantir(payload: {
  idEcole: string;
  modifiePar: string;
  dateReference?: string;
  dateDebut?: string;
  dateFin?: string;
}): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.garantirAnneeActive(payload, contexte);
    state.active = response.donnee;
    state.transitionSummary = response;
  }, 'La garantie de l annee active a echoue.');
}

async function basculer(payload: {
  idEcole: string;
  modifiePar: string;
  creerSuivanteSiAbsente?: boolean;
  dateDebutSuivante?: string;
  dateFinSuivante?: string;
}): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.basculerAnneeScolaire(payload, contexte);
    state.active = response.donnee.anneeActive;
    state.transitionSummary = response;
  }, 'La bascule d annee scolaire a echoue.');
}

async function activer(idAnneeScolaire: string, modifiePar: string): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.activerAnneeScolaire(idAnneeScolaire, modifiePar, contexte);
    state.transitionSummary = response;
  }, 'L activation de l annee scolaire a echoue.');
}

async function cloturer(idAnneeScolaire: string, modifiePar: string): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.cloturerAnneeScolaire(idAnneeScolaire, modifiePar, contexte);
    state.transitionSummary = response;
  }, 'La cloture de l annee scolaire a echoue.');
}

async function archiver(idAnneeScolaire: string, modifiePar: string): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.archiverAnneeScolaire(idAnneeScolaire, modifiePar, contexte);
    state.transitionSummary = response;
  }, 'L archivage de l annee scolaire a echoue.');
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.entries = [];
  state.active = null;
  state.transitionSummary = null;
}

export function useAcademicYearsStore() {
  return {
    state,
    chargerListe,
    chargerActive,
    creer,
    preparer,
    garantir,
    basculer,
    activer,
    cloturer,
    archiver,
    reinitialiser,
  };
}
