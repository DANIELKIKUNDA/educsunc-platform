import type { ConfigurationContext } from '../../../context';
import type { ConfigurationMonitoringSnapshot } from '../ConfigurationMonitoringIntegrationTypes';
import { ConfigurationMonitoringMapper } from '../mappers/ConfigurationMonitoringMapper';
import { ConfigurationMonitoringPublisher } from '../publishers/ConfigurationMonitoringPublisher';

// Ce fichier orchestre le pont Monitoring.

export class ConfigurationMonitoringIntegrationOrchestrator {
  public readonly publisher = new ConfigurationMonitoringPublisher();

  public async enregistrer(
    source: 'GENERAL' | 'CACHE' | 'RELOAD' | 'PROPAGATION' | 'AUDIT',
    niveau: 'INFO' | 'WARN' | 'ERROR',
    message: string,
    contexte: ConfigurationContext,
  ): Promise<void> {
    await this.publisher.publier(
      ConfigurationMonitoringMapper.creerObservation(source, niveau, message, contexte),
    );
  }

  public snapshot(): ConfigurationMonitoringSnapshot {
    const observations = this.publisher.journal();
    return {
      observations,
      totalObservations: observations.length,
    };
  }
}
