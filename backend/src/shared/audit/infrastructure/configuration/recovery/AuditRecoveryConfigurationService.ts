import type { AuditRecoveryConfiguration } from '../ConfigurationTypes';

export class AuditRecoveryConfigurationService {
  public obtenirParDefaut(): AuditRecoveryConfiguration {
    return {
      rollbackActive: true,
      maxSnapshots: 500,
      restoreWindowDays: 90,
      replayConfigurationActive: true,
    };
  }

  public normaliser(partiel?: Partial<AuditRecoveryConfiguration>): AuditRecoveryConfiguration {
    return {
      ...this.obtenirParDefaut(),
      ...partiel,
    };
  }
}
