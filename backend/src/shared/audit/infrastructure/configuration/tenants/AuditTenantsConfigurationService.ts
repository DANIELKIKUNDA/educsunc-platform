import type { AuditTenantsConfiguration } from '../ConfigurationTypes';

export class AuditTenantsConfigurationService {
  public obtenirParDefaut(): AuditTenantsConfiguration {
    return {
      heritageActif: true,
      overrideControle: true,
      isolationStricte: true,
      niveauxAutorises: ['GLOBAL', 'ENVIRONNEMENT', 'ORGANISATION', 'ECOLE'],
    };
  }

  public normaliser(partiel?: Partial<AuditTenantsConfiguration>): AuditTenantsConfiguration {
    return {
      ...this.obtenirParDefaut(),
      ...partiel,
      niveauxAutorises: [...new Set(partiel?.niveauxAutorises ?? this.obtenirParDefaut().niveauxAutorises)],
    };
  }
}
