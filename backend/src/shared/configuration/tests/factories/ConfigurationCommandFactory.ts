import type {
  CreateConfigurationCommand,
  OverrideConfigurationCommand,
  ReloadRuntimeConfigurationCommand,
  UpdateConfigurationCommand,
} from 'shared/configuration';
import { FIXTURE_SCOPE_ECOLE, FIXTURE_SCOPE_SYSTEME } from '../fixtures/ConfigurationFixtures';

// Ce fichier declare les fabriques de commandes Configuration.

export class ConfigurationCommandFactory {
  public static creerCreateCommand(): CreateConfigurationCommand {
    return {
      configurationId: 'config-command-1',
      key: 'runtime.retry.max',
      value: 3,
      scope: FIXTURE_SCOPE_SYSTEME,
      actorId: 'actor-1',
    };
  }

  public static creerUpdateCommand(): UpdateConfigurationCommand {
    return {
      configurationId: 'config-command-1',
      value: 5,
      actorId: 'actor-1',
    };
  }

  public static creerOverrideCommand(): OverrideConfigurationCommand {
    return {
      configurationId: 'config-command-1',
      scope: FIXTURE_SCOPE_ECOLE,
      value: 10,
      actorId: 'actor-2',
      raison: 'Policy locale',
    };
  }

  public static creerReloadCommand(): ReloadRuntimeConfigurationCommand {
    return {
      configurationId: 'config-command-1',
      actorId: 'actor-1',
      forcer: true,
    };
  }
}
