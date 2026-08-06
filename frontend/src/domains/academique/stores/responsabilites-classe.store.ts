import { reactive } from 'vue';
import type { ResponsabiliteClassePedagogiqueItem } from '../models/academique.model';
import { academiqueApi, lireContexteApiAcademique } from '../services/academique.api';

interface ResponsabilitesClasseState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  responsabilite: ResponsabiliteClassePedagogiqueItem | null;
}

const state = reactive<ResponsabilitesClasseState>({
  status: 'idle',
  errorMessage: null,
  responsabilite: null,
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

async function attribuer(idClassePedagogique: string, demande: {
  idUtilisateurEnseignant: string;
  creePar: string;
}): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.attribuerResponsableClassePedagogique(idClassePedagogique, demande, contexte);
    state.responsabilite = response.donnee;
  }, 'L attribution de responsabilite a echoue.');
}

async function consulter(idClassePedagogique: string, idAnneeScolaire: string): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.consulterResponsableClassePedagogique(idClassePedagogique, idAnneeScolaire, contexte);
    state.responsabilite = response.donnee;
  }, 'La consultation de responsabilite a echoue.');
}

async function retirer(idClassePedagogique: string, idAnneeScolaire: string): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.retirerResponsableClassePedagogique(idClassePedagogique, idAnneeScolaire, contexte);
    state.responsabilite = response.donnee;
  }, 'Le retrait de responsabilite a echoue.');
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.responsabilite = null;
}

export function useResponsabilitesClasseStore() {
  return {
    state,
    attribuer,
    consulter,
    retirer,
    reinitialiser,
  };
}
