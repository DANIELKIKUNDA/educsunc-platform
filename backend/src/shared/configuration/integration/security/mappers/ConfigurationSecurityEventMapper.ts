import type { ConfigurationSecurityDecision, ConfigurationSecurityEvenement, ConfigurationSecurityIncident } from '../ConfigurationSecurityIntegrationTypes';

// Ce fichier declare le mapper Security vers Configuration.

export class ConfigurationSecurityEventMapper {
  public static versIncident(
    evenement: ConfigurationSecurityEvenement,
    decision: ConfigurationSecurityDecision,
  ): ConfigurationSecurityIncident {
    return {
      type: evenement.type,
      configurationId: evenement.contexte.configurationId,
      raison: decision.raison ?? 'Decision de securite appliquee.',
      creeLe: new Date(),
    };
  }
}
