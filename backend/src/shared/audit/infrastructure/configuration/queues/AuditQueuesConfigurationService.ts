import type { AuditQueuesConfiguration } from '../ConfigurationTypes';

export class AuditQueuesConfigurationService {
  public obtenirParDefaut(): AuditQueuesConfiguration {
    return {
      limiteGlobale: 50_000,
      limiteParQueue: 10_000,
      strategiePriorite: 'WEIGHTED',
    };
  }

  public normaliser(partiel?: Partial<AuditQueuesConfiguration>): AuditQueuesConfiguration {
    return {
      ...this.obtenirParDefaut(),
      ...partiel,
    };
  }
}
