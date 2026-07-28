import { reactive } from 'vue';
import type { ClassePedagogiqueItem, ReglesFraisClasseItem } from '../models/academique.model';
import { academiqueApi, lireContexteApiAcademique } from '../services/academique.api';

interface ClassesPedagogiquesState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  entries: ClassePedagogiqueItem[];
  reglesFrais: ReglesFraisClasseItem | null;
}

const state = reactive<ClassesPedagogiquesState>({
  status: 'idle',
  errorMessage: null,
  entries: [],
  reglesFrais: null,
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

async function chargerListe(idEcole: string, idAnneeScolaire: string): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.listerClassesPedagogiques(idEcole, idAnneeScolaire, contexte);
    state.entries = response.donnees;
  }, 'La lecture des classes pedagogiques a echoue.');
}

async function creer(payload: {
  idEcole: string;
  idAnneeScolaire: string;
  idClasseAcademique: string;
  code: string;
  libelle: string;
  suffixeParallele?: string;
  capaciteAccueil?: number;
  creePar: string;
}): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    await academiqueApi.creerClassePedagogique(payload, contexte);
  }, 'La creation de classe pedagogique a echoue.');
}

async function chargerRegles(idClassePedagogique: string): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.consulterReglesFraisClasse(idClassePedagogique, contexte);
    state.reglesFrais = response.donnee;
  }, 'La lecture des regles de frais a echoue.');
}

async function renommer(idClassePedagogique: string, nouveauLibelle: string, modifiePar: string): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    await academiqueApi.renommerClassePedagogique(idClassePedagogique, nouveauLibelle, modifiePar, contexte);
  }, 'Le renommage de la classe pedagogique a echoue.');
}

async function desactiver(idClassePedagogique: string, modifiePar: string): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    await academiqueApi.desactiverClassePedagogique(idClassePedagogique, modifiePar, contexte);
  }, 'La desactivation de la classe pedagogique a echoue.');
}

async function archiver(idClassePedagogique: string, modifiePar: string): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    await academiqueApi.archiverClassePedagogique(idClassePedagogique, modifiePar, contexte);
  }, 'L archivage de la classe pedagogique a echoue.');
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.entries = [];
  state.reglesFrais = null;
}

export function useClassesPedagogiquesStore() {
  return {
    state,
    chargerListe,
    creer,
    chargerRegles,
    renommer,
    desactiver,
    archiver,
    reinitialiser,
  };
}
