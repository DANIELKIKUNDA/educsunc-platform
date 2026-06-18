import type { ConfigurationScolariteEvenement, ConfigurationScolariteProjection } from '../ConfigurationScolariteIntegrationTypes';

export class ConfigurationScolariteMapper {
  public static versProjection(evenement: ConfigurationScolariteEvenement): ConfigurationScolariteProjection {
    return {
      eleveId: evenement.eleveId,
      ecoleId: evenement.contexte.ecoleId,
      scopeLevel: evenement.contexte.scopeLevel,
    };
  }
}
