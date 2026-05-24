import { ConfigurationAuditIntegrationOrchestrator } from 'shared/configuration';
import type { AuditConfigurationIntegrationSnapshot } from '../AuditConfigurationIntegrationTypes';

export class AuditConfigurationIntegrationOrchestrator {
  public constructor(
    private readonly configuration = new ConfigurationAuditIntegrationOrchestrator(),
  ) {}

  public capturerSnapshot(): AuditConfigurationIntegrationSnapshot {
    return this.configuration.obtenirSnapshot();
  }
}
