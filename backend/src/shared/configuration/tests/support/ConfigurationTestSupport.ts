import {
  CreateConfigurationUseCase,
  type PortAuditConfiguration,
  type PortMonitoringConfiguration,
  PropagateConfigurationUseCase,
  ReloadRuntimeConfigurationUseCase,
  RepositoryConfigurationMemoire,
  RepositoryConfigurationSnapshotMemoire,
  RepositoryConfigurationVersionMemoire,
  ServiceApplicationPropagationConfiguration,
  UpdateConfigurationUseCase,
  type PortPropagationConfiguration,
  type PortReloadRuntimeConfiguration,
} from 'shared/configuration';
import { ConfigurationCommandFactory } from '../factories/ConfigurationCommandFactory';

// Ce fichier centralise le support de tests Configuration.

export class AuditConfigurationTestDouble implements PortAuditConfiguration {
  public readonly appels: { configurationId: string; evenements: readonly object[] }[] = [];

  public async enregistrerEvenementsConfiguration(
    configurationId: string,
    evenements: readonly object[],
  ): Promise<void> {
    this.appels.push({ configurationId, evenements });
  }
}

export class MonitoringConfigurationTestDouble implements PortMonitoringConfiguration {
  public readonly appels: { signal: string; configurationId: string }[] = [];

  public async publierSignalConfiguration(signal: 'CREATED' | 'UPDATED' | 'LOCKED' | 'UNLOCKED' | 'OVERRIDDEN' | 'SNAPSHOT' | 'DELETED', configurationId: string): Promise<void> {
    this.appels.push({ signal, configurationId });
  }
}

export class PropagationConfigurationTestDouble implements PortPropagationConfiguration {
  public readonly propagations: { configurationId: string; canauxCibles?: readonly string[] }[] = [];
  public readonly suppressions: string[] = [];

  public async propagerConfiguration(configurationId: string, canauxCibles?: readonly string[]): Promise<void> {
    this.propagations.push({ configurationId, canauxCibles });
  }

  public async propagerSuppressionConfiguration(configurationId: string): Promise<void> {
    this.suppressions.push(configurationId);
  }
}

export class ReloadRuntimeConfigurationTestDouble implements PortReloadRuntimeConfiguration {
  public readonly appels: { configurationId: string; forcer: boolean }[] = [];

  public async rechargerConfigurationRuntime(configurationId: string, forcer: boolean): Promise<void> {
    this.appels.push({ configurationId, forcer });
  }
}

export class ConfigurationReadModelTestDouble {
  constructor(private readonly projection: { readonly identifiant: string } | null = { identifiant: 'config-command-1' }) {}

  public async trouverParId(): Promise<any> {
    return this.projection
      ? {
          identifiant: this.projection.identifiant,
          key: 'runtime.retry.max',
          statut: 'ACTIVE',
          scope: { niveau: 'SYSTEM' },
          valeur: 3,
          overrides: [],
          lock: null,
          totalVersions: 1,
          creeLe: new Date(),
          gouvernance: {
            proprietaireNiveau: 'SYSTEM',
            heritable: true,
            overridable: true,
            visiblePour: ['SYSTEM', 'ORGANIZATION', 'SCHOOL', 'USER'],
            auditRequis: true,
            restartRequis: false,
          },
        }
      : null;
  }
}

export class ConfigurationTestSupport {
  public static creerUseCases() {
    const repository = new RepositoryConfigurationMemoire();
    const versionRepository = new RepositoryConfigurationVersionMemoire();
    const snapshotRepository = new RepositoryConfigurationSnapshotMemoire();
    const audit = new AuditConfigurationTestDouble();
    const monitoring = new MonitoringConfigurationTestDouble();
    const propagation = new PropagationConfigurationTestDouble();
    const reload = new ReloadRuntimeConfigurationTestDouble();
    const readModel = new ConfigurationReadModelTestDouble();

    return {
      repository,
      versionRepository,
      snapshotRepository,
      audit,
      monitoring,
      propagation,
      reload,
      readModel,
      createUseCase: new CreateConfigurationUseCase(repository, audit, monitoring),
      updateUseCase: new UpdateConfigurationUseCase(repository, versionRepository, audit, monitoring),
      propagateUseCase: new PropagateConfigurationUseCase(
        readModel as any,
        new ServiceApplicationPropagationConfiguration(propagation),
      ),
      reloadUseCase: new ReloadRuntimeConfigurationUseCase(readModel as any, reload),
      commandeCreate: ConfigurationCommandFactory.creerCreateCommand(),
      commandeUpdate: ConfigurationCommandFactory.creerUpdateCommand(),
    };
  }
}
