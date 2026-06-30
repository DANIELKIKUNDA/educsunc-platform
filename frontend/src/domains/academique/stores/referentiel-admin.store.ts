import { reactive } from 'vue';
import type {
  ComparaisonReferentielRequest,
  PublicationReferentielRequest,
  RapportComparaisonReferentielItem,
  VersionReferentielProgrammeItem,
} from '../models/academique.model';
import { academiqueApi, lireContexteApiAcademique } from '../services/academique.api';

interface ReferentielAdminState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  publishedVersion: VersionReferentielProgrammeItem | null;
  activatedVersion: VersionReferentielProgrammeItem | null;
  importResult: Record<string, unknown> | null;
  comparisonReport: RapportComparaisonReferentielItem | null;
}

const state = reactive<ReferentielAdminState>({
  status: 'idle',
  errorMessage: null,
  publishedVersion: null,
  activatedVersion: null,
  importResult: null,
  comparisonReport: null,
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

async function publierVersion(demande: PublicationReferentielRequest): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.publierVersionReferentiel(demande, contexte);
    state.publishedVersion = response.donnee;
  }, 'La publication a echoue.');
}

async function activerVersion(idVersionReferentielProgramme: string): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.activerVersionReferentiel(idVersionReferentielProgramme, contexte);
    state.activatedVersion = response.donnee;
  }, 'L activation a echoue.');
}

async function importerReferentiel(chemin: string, corps: Record<string, unknown>): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.importerReferentiel(chemin, corps, contexte);
    state.importResult = response.donnee;
  }, 'L import a echoue.');
}

async function comparerVersions(demande: ComparaisonReferentielRequest): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.comparerVersionsReferentiel(demande, contexte);
    state.comparisonReport = response.donnee;
  }, 'La comparaison a echoue.');
}

function reinitialiser(): void {
  state.status = 'idle';
  state.errorMessage = null;
  state.publishedVersion = null;
  state.activatedVersion = null;
  state.importResult = null;
  state.comparisonReport = null;
}

export function useReferentielAdminStore() {
  return {
    state,
    publierVersion,
    activerVersion,
    importerReferentiel,
    comparerVersions,
    reinitialiser,
  };
}
