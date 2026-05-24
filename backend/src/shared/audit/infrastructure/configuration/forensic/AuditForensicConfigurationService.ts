import type { AuditForensicConfiguration } from '../ConfigurationTypes';

export class AuditForensicConfigurationService {
  public obtenirParDefaut(): AuditForensicConfiguration {
    return {
      profondeurHistoriqueJours: 1095,
      niveauCorrelation: 'MAXIMAL',
      conservationReplayJours: 365,
      reconstructionTimelineActivee: true,
      retentionForensicJours: 1095,
    };
  }

  public normaliser(partiel?: Partial<AuditForensicConfiguration>): AuditForensicConfiguration {
    return {
      ...this.obtenirParDefaut(),
      ...partiel,
    };
  }
}
