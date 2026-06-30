import { reactive } from 'vue';
import type { CalendrierAcademiqueItem } from '../models/academique.model';
import { academiqueApi, lireContexteApiAcademique } from '../services/academique.api';

interface CalendrierAcademiqueState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  calendrier: CalendrierAcademiqueItem | null;
}

const state = reactive<CalendrierAcademiqueState>({
  status: 'idle',
  errorMessage: null,
  calendrier: null,
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

async function creer(payload: {
  idEcole: string;
  idAnneeScolaire: string;
  typeStructureEvaluation: string;
  dateDebutAnnee: string;
  dateFinAnnee: string;
  periodes: Array<{
    code: string;
    libelle: string;
    ordre: number;
    typePeriode: string;
    dateDebut: string;
    dateFin: string;
  }>;
  creePar: string;
}): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.creerCalendrierAcademique(payload, contexte);
    state.calendrier = response.donnee;
  }, 'La creation du calendrier academique a echoue.');
}

async function consulterParEcoleEtAnnee(idEcole: string, idAnneeScolaire: string): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.consulterCalendrierParEcoleEtAnnee(idEcole, idAnneeScolaire, contexte);
    state.calendrier = response.donnee;
  }, 'La consultation du calendrier academique a echoue.');
}

async function modifierPeriode(
  idCalendrierAcademique: string,
  codePeriode: string,
  demande: {
    code?: string;
    libelle: string;
    ordre: number;
    typePeriode: string;
    dateDebut: string;
    dateFin: string;
    modifiePar: string;
  },
): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.modifierPeriodeCalendrier(idCalendrierAcademique, codePeriode, demande, contexte);
    state.calendrier = response.donnee;
  }, 'La modification de periode a echoue.');
}

async function valider(idCalendrierAcademique: string, validePar: string): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.validerCalendrierAcademique(idCalendrierAcademique, validePar, contexte);
    state.calendrier = response.donnee;
  }, 'La validation du calendrier a echoue.');
}

async function verrouiller(idCalendrierAcademique: string, verrouillePar: string): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.verrouillerCalendrierAcademique(idCalendrierAcademique, verrouillePar, contexte);
    state.calendrier = response.donnee;
  }, 'Le verrouillage du calendrier a echoue.');
}

export function useCalendrierAcademiqueStore() {
  return {
    state,
    creer,
    consulterParEcoleEtAnnee,
    modifierPeriode,
    valider,
    verrouiller,
  };
}
