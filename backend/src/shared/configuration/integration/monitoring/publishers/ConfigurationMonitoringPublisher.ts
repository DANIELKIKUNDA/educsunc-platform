import type { ConfigurationMonitoringObservation } from '../ConfigurationMonitoringIntegrationTypes';

// Ce fichier declare le publisher Monitoring.

export class ConfigurationMonitoringPublisher {
  private readonly observations: ConfigurationMonitoringObservation[] = [];

  public async publier(observation: ConfigurationMonitoringObservation): Promise<void> {
    this.observations.push(observation);
  }

  public journal(): readonly ConfigurationMonitoringObservation[] {
    return [...this.observations];
  }
}
