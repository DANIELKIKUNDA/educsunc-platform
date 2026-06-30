import { reactive } from 'vue';
import type {
  AnalyseMigrationRequest,
  ApplicationMigrationResultItem,
  MigrationReferentielItem,
  RapportMigrationItem,
} from '../models/academique.model';
import { academiqueApi, lireContexteApiAcademique } from '../services/academique.api';

interface MigrationReferentielState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  migrations: MigrationReferentielItem[];
  report: RapportMigrationItem | null;
  applicationResult: ApplicationMigrationResultItem | null;
}

const state = reactive<MigrationReferentielState>({
  status: 'idle',
  errorMessage: null,
  migrations: [],
  report: null,
  applicationResult: null,
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

async function analyser(demande: AnalyseMigrationRequest): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.analyserMigrationReferentiel(demande, contexte);
    state.report = response.donnee;
  }, 'La migration a echoue.');
}

async function lister(idProgrammeNiveau: string): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.listerMigrationsReferentiel(idProgrammeNiveau, contexte);
    state.migrations = response.donnees;
  }, 'La lecture des migrations a echoue.');
}

async function consulter(idMigrationReferentielProgramme: string): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.consulterMigrationReferentiel(idMigrationReferentielProgramme, contexte);
    state.report = response.donnee;
  }, 'La consultation de migration a echoue.');
}

async function appliquer(idMigrationReferentielProgramme: string): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.appliquerMigrationReferentiel({ idMigrationReferentielProgramme }, contexte);
    state.applicationResult = response.donnee;
  }, 'L application de migration a echoue.');
}

async function annuler(idMigrationReferentielProgramme: string): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.annulerMigrationReferentiel(idMigrationReferentielProgramme, contexte);
    state.migrations = state.migrations.map((migration) => (
      migration.id === response.donnee.id ? response.donnee : migration
    ));
  }, 'L annulation de migration a echoue.');
}

async function relancer(idMigrationReferentielProgramme: string): Promise<void> {
  await executer(async () => {
    const contexte = lireContexteApiAcademique();
    const response = await academiqueApi.relancerRecalculMigration(idMigrationReferentielProgramme, contexte);
    state.migrations = state.migrations.map((migration) => (
      migration.id === response.donnee.id ? response.donnee : migration
    ));
  }, 'La relance de migration a echoue.');
}

export function useMigrationReferentielStore() {
  return {
    state,
    analyser,
    lister,
    consulter,
    appliquer,
    annuler,
    relancer,
  };
}
