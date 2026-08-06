import { reactive } from 'vue';
import { registerScopedLifecycleStore } from '../../../shared/lifecycle/frontend-lifecycle.runtime';
import type {
  ConfigurationModuleCatalogItem,
  ConfigurationModulesResolution,
  ConfigurationModuleCode,
} from '../models/configuration.model';
import { configurationApi, lireContexteApiConfiguration } from '../services/configuration.api';

interface ConfigurationModulesState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  catalog: readonly ConfigurationModuleCatalogItem[];
  organizationConfiguration: {
    organisationId: string;
    configurationId: string;
    modules: readonly string[];
  } | null;
  schoolConfiguration: {
    organisationId: string;
    ecoleId: string;
    configurationId: string;
    modules: readonly string[];
  } | null;
  effective: ConfigurationModulesResolution | null;
}

export function useConfigurationModulesStore() {
  const state = reactive<ConfigurationModulesState>({
    status: 'idle',
    errorMessage: null,
    catalog: [],
    organizationConfiguration: null,
    schoolConfiguration: null,
    effective: null,
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
      throw error;
    }
  }

  async function configurerOrganisation(
    organisationId: string,
    modules: readonly ConfigurationModuleCode[],
    actorId?: string,
  ): Promise<void> {
    await executer(async () => {
      const contexte = lireContexteApiConfiguration();
      const response = await configurationApi.configurerModulesOrganisation(
        organisationId,
        { modules, actorId },
        contexte,
      );
      state.organizationConfiguration = response.donnees;
    }, 'La configuration des modules organisation a echoue.');
  }

  async function configurerEcole(
    organisationId: string,
    ecoleId: string,
    modules: readonly ConfigurationModuleCode[],
    actorId?: string,
  ): Promise<void> {
    await executer(async () => {
      const contexte = lireContexteApiConfiguration();
      const response = await configurationApi.configurerModulesEcole(
        ecoleId,
        { organisationId, modules, actorId },
        contexte,
      );
      state.schoolConfiguration = response.donnees;
    }, 'La configuration des modules ecole a echoue.');
  }

  async function resoudre(organisationId: string, ecoleId: string): Promise<void> {
    await executer(async () => {
      const contexte = lireContexteApiConfiguration();
      const [resolution, catalogue] = await Promise.all([
        configurationApi.resoudreModulesEffectifs({ organisationId, ecoleId }, contexte),
        configurationApi.consulterCatalogueModules(contexte),
      ]);
      state.effective = resolution.donnees;
      state.catalog = catalogue.donnees.modules;
    }, 'La resolution des modules effectifs a echoue.');
  }

  async function chargerCatalogue(): Promise<void> {
    await executer(async () => {
      const contexte = lireContexteApiConfiguration();
      const response = await configurationApi.consulterCatalogueModules(contexte);
      state.catalog = response.donnees.modules;
    }, 'Le catalogue des modules ne peut pas etre charge pour le moment.');
  }

  function reinitialiser(): void {
    state.status = 'idle';
    state.errorMessage = null;
    state.catalog = [];
    state.organizationConfiguration = null;
    state.schoolConfiguration = null;
    state.effective = null;
  }

  registerScopedLifecycleStore('configuration-modules', 'context', reinitialiser);

  return {
    state,
    configurerOrganisation,
    configurerEcole,
    resoudre,
    chargerCatalogue,
    reinitialiser,
  };
}
