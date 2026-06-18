import {
  ConfigurationAuthIntegrationOrchestrator,
  ConfigurationMonitoringIntegrationOrchestrator,
  ConfigurationNotificationsIntegrationOrchestrator,
  ConfigurationRuntimeIntegrationOrchestrator,
  ConfigurationSecurityIntegrationOrchestrator,
  FacadeInfrastructureConfiguration,
  RepositoryConfigurationMemoire,
  RepositoryConfigurationSnapshotMemoire,
  RepositoryConfigurationVersionMemoire,
} from 'shared/configuration';

// Ce fichier declare les fabriques runtime des tests Configuration.

export class ConfigurationRuntimeFactory {
  public static creerInfrastructure() {
    return {
      repository: new RepositoryConfigurationMemoire(),
      versionRepository: new RepositoryConfigurationVersionMemoire(),
      snapshotRepository: new RepositoryConfigurationSnapshotMemoire(),
      facadeInfrastructure: new FacadeInfrastructureConfiguration(),
    };
  }

  public static creerIntegrations() {
    return {
      auth: new ConfigurationAuthIntegrationOrchestrator(),
      security: new ConfigurationSecurityIntegrationOrchestrator(),
      notifications: new ConfigurationNotificationsIntegrationOrchestrator(),
      monitoring: new ConfigurationMonitoringIntegrationOrchestrator(),
      runtime: new ConfigurationRuntimeIntegrationOrchestrator(),
    };
  }
}
