import type { AuditExportsConfiguration } from '../ConfigurationTypes';

export class AuditExportsConfigurationService {
  public obtenirParDefaut(): AuditExportsConfiguration {
    return {
      expirationHours: 72,
      tailleMaxMb: 512,
      formatsAutorises: ['PDF', 'CSV', 'JSON'],
      compressionActivee: true,
      streamingActive: true,
      telechargementSecurise: true,
    };
  }

  public normaliser(partiel?: Partial<AuditExportsConfiguration>): AuditExportsConfiguration {
    return {
      ...this.obtenirParDefaut(),
      ...partiel,
      formatsAutorises: [...new Set(partiel?.formatsAutorises ?? this.obtenirParDefaut().formatsAutorises)],
    };
  }
}
