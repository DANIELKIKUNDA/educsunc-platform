import type { AuditRetentionConfiguration } from '../ConfigurationTypes';

export class AuditRetentionConfigurationService {
  public obtenirParDefaut(): AuditRetentionConfiguration {
    return {
      dureeLogsJours: 365,
      dureeForensicJours: 1095,
      expirationExportsJours: 30,
      archivageApresJours: 365,
      coldStorageApresJours: 730,
      purgeDiffereeJours: 1095,
    };
  }

  public normaliser(partiel?: Partial<AuditRetentionConfiguration>): AuditRetentionConfiguration {
    return {
      ...this.obtenirParDefaut(),
      ...partiel,
    };
  }
}
