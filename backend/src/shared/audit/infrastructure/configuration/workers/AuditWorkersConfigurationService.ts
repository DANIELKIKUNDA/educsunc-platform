import type { AuditWorkersConfiguration } from '../ConfigurationTypes';

export class AuditWorkersConfigurationService {
  public obtenirParDefaut(): AuditWorkersConfiguration {
    return {
      concurrency: 8,
      retryLimit: 5,
      deadLetterLimit: 1000,
      throughputParMinute: 10_000,
      schedulingActif: true,
    };
  }

  public normaliser(partiel?: Partial<AuditWorkersConfiguration>): AuditWorkersConfiguration {
    return {
      ...this.obtenirParDefaut(),
      ...partiel,
    };
  }
}
