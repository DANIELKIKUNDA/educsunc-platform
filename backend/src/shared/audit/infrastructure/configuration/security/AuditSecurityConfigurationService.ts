import type { AuditSecurityConfiguration } from '../ConfigurationTypes';

export class AuditSecurityConfigurationService {
  public obtenirParDefaut(): AuditSecurityConfiguration {
    return {
      permissionsRenforcees: true,
      isolationTenantMode: 'STRICTE',
      accesForensic: 'RESTREINT',
      accesExports: 'RESTREINT',
      accesArchives: 'RESTREINT',
      protectionReplayActivee: true,
    };
  }

  public normaliser(partiel?: Partial<AuditSecurityConfiguration>): AuditSecurityConfiguration {
    return {
      ...this.obtenirParDefaut(),
      ...partiel,
    };
  }
}
