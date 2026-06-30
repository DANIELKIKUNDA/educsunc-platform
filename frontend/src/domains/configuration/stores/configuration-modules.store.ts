import { reactive } from 'vue';
import type { ConfigurationModulesResolution, ConfigurationModuleCode } from '../models/configuration.model';
import { configurationApi, lireContexteApiConfiguration } from '../services/configuration.api';

interface ConfigurationModulesState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
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
      const response = await configurationApi.resoudreModulesEffectifs({ organisationId, ecoleId }, contexte);
      state.effective = response.donnees;
    }, 'La resolution des modules effectifs a echoue.');
  }

  return {
    state,
    configurerOrganisation,
    configurerEcole,
    resoudre,
  };
}

