import type { ConfigurationReferentielEvenement, ConfigurationReferentielProjection } from '../ConfigurationReferentielIntegrationTypes';

export class ConfigurationReferentielMapper {
  public static versProjection(evenement: ConfigurationReferentielEvenement): ConfigurationReferentielProjection {
    return {
      referentielId: evenement.referentielId,
      scopeLevel: evenement.contexte.scopeLevel,
      organisationId: evenement.contexte.organisationId,
      ecoleId: evenement.contexte.ecoleId,
    };
  }
}
