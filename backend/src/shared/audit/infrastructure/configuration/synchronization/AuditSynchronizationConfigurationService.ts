import type { AuditSynchronizationConfiguration } from '../ConfigurationTypes';

export class AuditSynchronizationConfigurationService {
  public obtenirParDefaut(): AuditSynchronizationConfiguration {
    return {
      batchSize: 200,
      retryLimit: 5,
      replayLimit: 3,
      conflictPolicy: 'MANUAL',
      syncIntervalSeconds: 60,
      queueStrategy: 'ADAPTIVE',
    };
  }

  public normaliser(partiel?: Partial<AuditSynchronizationConfiguration>): AuditSynchronizationConfiguration {
    return {
      ...this.obtenirParDefaut(),
      ...partiel,
    };
  }
}
