import type { ConfigurationPaiementsEvenement, ConfigurationPaiementsProjection } from '../ConfigurationPaiementsIntegrationTypes';

export class ConfigurationPaiementsMapper {
  public static versProjection(evenement: ConfigurationPaiementsEvenement): ConfigurationPaiementsProjection {
    return {
      compteFacturationId: evenement.compteFacturationId,
      organisationId: evenement.contexte.organisationId,
      ecoleId: evenement.contexte.ecoleId,
    };
  }
}
