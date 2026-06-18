import type { ConfigurationBulletinsEvenement, ConfigurationBulletinsProjection } from '../ConfigurationBulletinsIntegrationTypes';

export class ConfigurationBulletinsMapper {
  public static versProjection(evenement: ConfigurationBulletinsEvenement): ConfigurationBulletinsProjection {
    return {
      bulletinId: evenement.bulletinId,
      ecoleId: evenement.contexte.ecoleId,
      organisationId: evenement.contexte.organisationId,
    };
  }
}
