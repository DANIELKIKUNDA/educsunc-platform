import type { AuditCachingConfiguration } from '../ConfigurationTypes';

export class AuditCachingConfigurationService {
  public obtenirParDefaut(): AuditCachingConfiguration {
    return {
      ttlSeconds: 300,
      maxEntries: 10_000,
      invalidationSurEcriture: true,
    };
  }

  public normaliser(partiel?: Partial<AuditCachingConfiguration>): AuditCachingConfiguration {
    return {
      ...this.obtenirParDefaut(),
      ...partiel,
    };
  }
}
